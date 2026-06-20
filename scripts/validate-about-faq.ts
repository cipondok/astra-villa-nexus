#!/usr/bin/env bun
/**
 * Validate About-page FAQ rich results for EN/ID.
 *
 * - Fetches the published About URLs for each language.
 * - Extracts inline <script type="application/ld+json"> blocks.
 * - Because JSON-LD is injected client-side by SEOHead (SPA), fetched HTML
 *   typically won't contain it. As a fallback, the script reconstructs the
 *   FAQPage schema from src/i18n/locales/{en,id}.ts the same way About.tsx does.
 * - Validates against Google's required FAQPage fields and writes a Markdown
 *   report to /mnt/documents/about-faq-validation-report.md.
 *
 * Usage:
 *   bun scripts/validate-about-faq.ts
 *   bun scripts/validate-about-faq.ts --base https://astravilla.com
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import en from '../src/i18n/locales/en';
import id from '../src/i18n/locales/id';

type Lang = 'en' | 'id';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 ? args[baseIdx + 1] : 'https://astravilla.com';
const OUT = '/mnt/documents/about-faq-validation-report.md';

const dict = { en, id } as const;

function buildFaqSchema(lang: Lang) {
  const d = dict[lang].about as Record<string, string>;
  const items = [1, 2, 3, 4, 5, 6].map((i) => ({
    q: d[`faq${i}Q`],
    a: d[`faq${i}A`],
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

type Issue = { level: 'error' | 'warning'; msg: string };

function validateFaq(schema: any): Issue[] {
  const issues: Issue[] = [];
  if (schema?.['@type'] !== 'FAQPage') {
    issues.push({ level: 'error', msg: '@type must be "FAQPage"' });
  }
  const main = schema?.mainEntity;
  if (!Array.isArray(main) || main.length < 2) {
    issues.push({ level: 'error', msg: 'mainEntity must have ≥2 Question entries' });
    return issues;
  }
  main.forEach((q: any, i: number) => {
    const pos = `Q${i + 1}`;
    if (q?.['@type'] !== 'Question') issues.push({ level: 'error', msg: `${pos}: @type must be "Question"` });
    if (!q?.name || typeof q.name !== 'string' || !q.name.trim()) {
      issues.push({ level: 'error', msg: `${pos}: missing/empty name` });
    }
    const text: string | undefined = q?.acceptedAnswer?.text;
    if (!text || typeof text !== 'string') {
      issues.push({ level: 'error', msg: `${pos}: missing acceptedAnswer.text` });
    } else {
      if (text.trim().length < 10) issues.push({ level: 'error', msg: `${pos}: acceptedAnswer.text <10 chars` });
      if (text.length > 1000) issues.push({ level: 'warning', msg: `${pos}: acceptedAnswer.text >1000 chars (${text.length})` });
    }
    if (q?.acceptedAnswer?.['@type'] !== 'Answer') {
      issues.push({ level: 'error', msg: `${pos}: acceptedAnswer.@type must be "Answer"` });
    }
  });
  return issues;
}

async function fetchHtml(url: string): Promise<{ status: number; html: string; error?: string }> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'AstraVilla-FAQ-Validator/1.0' } });
    const html = await res.text();
    return { status: res.status, html };
  } catch (e: any) {
    return { status: 0, html: '', error: e?.message ?? String(e) };
  }
}

function extractJsonLdBlocks(html: string): any[] {
  const blocks: any[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try { blocks.push(JSON.parse(m[1].trim())); } catch { /* ignore */ }
  }
  return blocks;
}

function findFaqPage(blocks: any[]): any | null {
  for (const b of blocks) {
    if (b?.['@type'] === 'FAQPage') return b;
    if (Array.isArray(b)) {
      const hit = b.find((x) => x?.['@type'] === 'FAQPage');
      if (hit) return hit;
    }
  }
  return null;
}

function renderIssues(issues: Issue[]): string {
  if (!issues.length) return '_No issues._';
  return issues.map((i) => `- **${i.level.toUpperCase()}**: ${i.msg}`).join('\n');
}

async function run() {
  const langs: Lang[] = ['en', 'id'];
  const sections: string[] = [];
  let totalErrors = 0;

  for (const lang of langs) {
    const url = `${BASE}/about?lang=${lang}`;
    const { status, html, error } = await fetchHtml(url);
    const blocks = html ? extractJsonLdBlocks(html) : [];
    const liveFaq = findFaqPage(blocks);
    const builtFaq = buildFaqSchema(lang);
    const schemaUsed = liveFaq ?? builtFaq;
    const source = liveFaq ? 'live (fetched HTML)' : 'reconstructed from i18n source (SPA — JSON-LD injected at runtime)';
    const issues = validateFaq(schemaUsed);
    totalErrors += issues.filter((i) => i.level === 'error').length;
    const qCount = Array.isArray(schemaUsed?.mainEntity) ? schemaUsed.mainEntity.length : 0;

    sections.push(`## ${lang.toUpperCase()} — ${url}

- HTTP status: \`${status}\`${error ? ` (fetch error: ${error})` : ''}
- JSON-LD blocks in HTML: \`${blocks.length}\`
- Source validated: ${source}
- FAQPage questions: \`${qCount}\`

### Issues
${renderIssues(issues)}

<details><summary>FAQPage JSON-LD</summary>

\`\`\`json
${JSON.stringify(schemaUsed, null, 2)}
\`\`\`

</details>
`);
  }

  const report = `# About FAQ Validation Report

- Generated: ${new Date().toISOString()}
- Base URL: \`${BASE}\`
- Total errors: **${totalErrors}**

${sections.join('\n')}
`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, report);
  console.log(`Wrote ${OUT}`);
  console.log(`Total errors: ${totalErrors}`);
  if (totalErrors > 0) process.exit(1);
}

run().catch((e) => { console.error(e); process.exit(2); });

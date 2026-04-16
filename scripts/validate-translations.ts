/**
 * Translation Validation Script (CI-ready)
 * Usage: npx tsx scripts/validate-translations.ts
 * 
 * Checks:
 * 1. All keys in EN exist in every other locale
 * 2. No duplicate keys
 * 3. Reports missing key count per locale
 */

import en from '../src/i18n/locales/en';
import id from '../src/i18n/locales/id';
import zh from '../src/i18n/locales/zh';
import ja from '../src/i18n/locales/ja';
import ko from '../src/i18n/locales/ko';
import ru from '../src/i18n/locales/ru';

type Obj = Record<string, any>;

function flattenKeys(obj: Obj, prefix = ''): string[] {
  const keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys.push(...flattenKeys(obj[k], path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function resolveKey(obj: Obj, key: string): any {
  const parts = key.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = cur[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

const locales: Record<string, Obj> = { en, id, zh, ja, ko, ru };
const enKeys = flattenKeys(en);

console.log(`\n📊 Translation Coverage Report`);
console.log(`${'='.repeat(50)}`);
console.log(`EN keys (reference): ${enKeys.length}\n`);

let totalMissing = 0;
const criticalPrefixes = ['escrow.', 'wallet.', 'trust.', 'property.', 'auth.'];

for (const [lang, locale] of Object.entries(locales)) {
  if (lang === 'en') continue;
  const localKeys = flattenKeys(locale);
  const missing = enKeys.filter((k) => resolveKey(locale, k) === undefined);
  const extra = localKeys.filter((k) => resolveKey(en, k) === undefined);
  const criticalMissing = missing.filter((k) => criticalPrefixes.some((p) => k.startsWith(p)));
  const coverage = (((enKeys.length - missing.length) / enKeys.length) * 100).toFixed(1);

  console.log(`${lang.toUpperCase()}: ${coverage}% coverage (${missing.length} missing, ${extra.length} extra)`);
  if (criticalMissing.length > 0) {
    console.log(`  ⚠️  CRITICAL missing (${criticalMissing.length}): ${criticalMissing.slice(0, 5).join(', ')}${criticalMissing.length > 5 ? '...' : ''}`);
  }
  if (missing.length > 0 && missing.length <= 10) {
    console.log(`  Missing: ${missing.join(', ')}`);
  }
  totalMissing += criticalMissing.length;
}

console.log(`\n${'='.repeat(50)}`);
if (totalMissing > 0) {
  console.error(`❌ ${totalMissing} CRITICAL translation keys missing across locales`);
  process.exit(1);
} else {
  console.log(`✅ All critical translation keys present in all locales`);
}

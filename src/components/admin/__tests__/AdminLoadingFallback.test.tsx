import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { AdminLoadingFallback } from "@/components/admin/AdminStates";

/**
 * Unified admin loading fallback contract.
 *
 * Every card/table/page-shaped admin view must pick its loading skeleton
 * through `<AdminLoadingFallback layout="…" />` so behavior stays consistent
 * across the dashboard and every subpage. These tests verify:
 *
 *   1. The dispatcher renders the correct underlying skeleton per layout.
 *   2. Roots remain gutter-safe (no px/mx/max-w — enforced by AdminStates).
 *   3. Snapshots lock the dispatcher output shape.
 */

function isGutterSafe(root: HTMLElement) {
  const cls = root.className;
  expect(cls).toMatch(/(^|\s)w-full(\s|$)/);
  expect(cls).not.toMatch(/(^|\s)(p|px|pl|pr|m|mx|ml|mr)-\d/);
  expect(cls).not.toMatch(/max-w-/);
}

describe("AdminLoadingFallback — layout dispatch", () => {
  it('layout="page" renders a KPI strip + row list', () => {
    const { container } = render(<AdminLoadingFallback layout="page" kpis={3} rows={2} />);
    const root = container.firstElementChild as HTMLElement;
    isGutterSafe(root);
    // KPI strip present
    expect(root.querySelector(".admin-kpi-strip")).not.toBeNull();
  });

  it('layout="cards" renders a responsive card grid', () => {
    const { container } = render(<AdminLoadingFallback layout="cards" count={4} columns={4} />);
    const root = container.firstElementChild as HTMLElement;
    isGutterSafe(root);
    const grid = root.querySelector(".grid");
    expect(grid).not.toBeNull();
    expect(grid!.className).toMatch(/lg:grid-cols-4/);
    expect(grid!.children.length).toBe(4);
  });

  it('layout="table" renders a header + N rows', () => {
    const { container } = render(<AdminLoadingFallback layout="table" rows={3} />);
    const root = container.firstElementChild as HTMLElement;
    isGutterSafe(root);
    // 1 header shimmer + 3 row shimmers = 4 children
    expect(root.children.length).toBe(4);
  });

  it("defaults to page layout when omitted", () => {
    const { container } = render(<AdminLoadingFallback />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.querySelector(".admin-kpi-strip")).not.toBeNull();
  });

  it("dispatcher output matches snapshot per layout", () => {
    expect(render(<AdminLoadingFallback layout="page" kpis={2} rows={2} />).container.firstChild).toMatchSnapshot("page");
    expect(render(<AdminLoadingFallback layout="cards" count={2} columns={2} />).container.firstChild).toMatchSnapshot("cards");
    expect(render(<AdminLoadingFallback layout="table" rows={2} />).container.firstChild).toMatchSnapshot("table");
  });
});

/**
 * Convention guard: new admin views should render `AdminLoadingFallback`,
 * not hand-picked skeleton primitives. We allow a small allowlist for the
 * dispatcher/tests themselves and files migrated during the initial pass.
 * Adding a new direct import triggers this test — either add the file to
 * the allowlist deliberately or (preferred) route it through the dispatcher.
 */
describe("AdminStates — direct-skeleton import convention", () => {
  const ROOT = join(process.cwd(), "src");
  const ALLOWED = new Set(
    [
      "src/components/admin/AdminStates.tsx",
      "src/components/admin/AdminDashboardContent.tsx",
      "src/components/admin/__tests__/AdminStates.test.tsx",
      "src/components/admin/__tests__/AdminLoadingFallback.test.tsx",
      "src/pages/admin/SystemHealthDashboard.tsx",
      "src/pages/admin/StrategicIntelligenceDashboard.tsx",
      "src/pages/admin/PlatformIntelligenceDashboard.tsx",
      "src/pages/admin/GlobalGrowthEngineDashboard.tsx",
      "src/pages/admin/FounderExecutionDashboard.tsx",
      "src/pages/admin/FounderCommandCenter.tsx",
      "src/pages/admin/FeatureControlPanel.tsx",
      "src/pages/admin/ExecutionCommandCenter.tsx",
      "src/pages/admin/CapitalIntelligenceDashboard.tsx",
      "src/pages/admin/AstraSupportAnalytics.tsx",
    ].map((p) => p.replace(/\//g, require("node:path").sep)),
  );

  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const s = statSync(full);
      if (s.isDirectory()) {
        if (entry === "node_modules" || entry === "_archived" || entry.startsWith(".")) continue;
        out.push(...walk(full));
      } else if (/\.(ts|tsx)$/.test(entry)) {
        out.push(full);
      }
    }
    return out;
  }

  it("no NEW files import AdminCardsSkeleton/AdminTableSkeleton/AdminPageSkeleton directly", () => {
    const offenders: string[] = [];
    const pattern = /import\s+\{[^}]*\b(AdminCardsSkeleton|AdminTableSkeleton|AdminPageSkeleton)\b[^}]*\}\s+from\s+["'][^"']*AdminStates["']/;
    for (const file of walk(ROOT)) {
      const rel = file.slice(process.cwd().length + 1);
      if (ALLOWED.has(rel)) continue;
      const content = readFileSync(file, "utf8");
      if (pattern.test(content)) offenders.push(rel);
    }
    expect(
      offenders,
      `Use <AdminLoadingFallback layout="…" /> instead of importing skeleton primitives directly. Offenders:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});

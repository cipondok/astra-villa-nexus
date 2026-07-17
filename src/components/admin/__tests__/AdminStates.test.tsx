import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  AdminPageSkeleton,
  AdminCardsSkeleton,
  AdminTableSkeleton,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from "@/components/admin/AdminStates";

/**
 * Gutter-alignment contract for admin skeletons and state views.
 *
 * These components render INSIDE the admin `<main>` column, which already
 * applies horizontal gutters (`px-4 sm:px-6 lg:px-8`). To keep alignment
 * pixel-perfect across breakpoints, the state components themselves must:
 *
 *   1. Render as a single full-width root (`w-full`)
 *   2. Never introduce their own horizontal padding on the root (px-*, pl-*, pr-*)
 *   3. Never introduce their own horizontal margin on the root (mx-*, ml-*, mr-*)
 *   4. Never constrain their max-width (max-w-*) — parent owns column width
 *
 * If a future edit reintroduces any of those classes on the root, these tests
 * fail, preventing misaligned gutters from shipping.
 */

const FORBIDDEN_ROOT_PATTERNS = [
  /(^|\s)p-\d/,
  /(^|\s)px-\d/,
  /(^|\s)pl-\d/,
  /(^|\s)pr-\d/,
  /(^|\s)m-\d/,
  /(^|\s)mx-\d/,
  /(^|\s)ml-\d/,
  /(^|\s)mr-\d/,
  /(^|\s)max-w-/,
  /(^|\s)container(\s|$)/,
];

function expectGutterSafeRoot(root: HTMLElement) {
  expect(root).toBeTruthy();
  const cls = root.className;
  expect(cls).toMatch(/(^|\s)w-full(\s|$)/);
  for (const pattern of FORBIDDEN_ROOT_PATTERNS) {
    expect(cls, `root has forbidden class matching ${pattern}: "${cls}"`).not.toMatch(pattern);
  }
}

describe("AdminStates — gutter alignment contract", () => {
  it("AdminPageSkeleton root is full-width and gutter-safe", () => {
    const { container } = render(<AdminPageSkeleton />);
    expectGutterSafeRoot(container.firstElementChild as HTMLElement);
  });

  it("AdminCardsSkeleton root is full-width and gutter-safe", () => {
    const { container } = render(<AdminCardsSkeleton />);
    expectGutterSafeRoot(container.firstElementChild as HTMLElement);
  });

  it("AdminTableSkeleton root is full-width and gutter-safe", () => {
    const { container } = render(<AdminTableSkeleton />);
    expectGutterSafeRoot(container.firstElementChild as HTMLElement);
  });

  it("AdminEmptyState root is full-width and gutter-safe", () => {
    const { container } = render(
      <AdminEmptyState title="Nothing here" description="Try adjusting filters" />,
    );
    expectGutterSafeRoot(container.firstElementChild as HTMLElement);
  });

  it("AdminErrorState root is full-width and gutter-safe", () => {
    const { container } = render(<AdminErrorState title="Boom" description="Try again" />);
    expectGutterSafeRoot(container.firstElementChild as HTMLElement);
  });

  it("AdminLoadingState root is full-width and gutter-safe", () => {
    const { container } = render(<AdminLoadingState label="Loading…" />);
    expectGutterSafeRoot(container.firstElementChild as HTMLElement);
  });
});

describe("AdminStates — structural snapshots", () => {
  // Snapshots lock the DOM shape so accidental refactors that change
  // the outer wrapper or reintroduce padding surface immediately in review.
  it("AdminPageSkeleton renders expected structure", () => {
    const { container } = render(<AdminPageSkeleton kpis={4} rows={3} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("AdminCardsSkeleton renders expected structure", () => {
    const { container } = render(<AdminCardsSkeleton count={2} columns={3} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("AdminTableSkeleton renders expected structure", () => {
    const { container } = render(<AdminTableSkeleton rows={2} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

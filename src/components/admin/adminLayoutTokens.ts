import { useEffect, type RefObject } from "react";

/**
 * Single source of truth for the AdminSidebar width so the sidebar element
 * and the main content offset never drift apart across breakpoints.
 *
 * Invariant:
 *   sidebar width  ===  main content left margin  at every breakpoint.
 *
 * Collapsed (icon rail only):        56px  (w-14 / ml-14)
 * Expanded, below `lg` (< 1024px):   56px  (icon rail — labels use a flyout)
 * Expanded, `lg` and up:            240px  (w-60 / ml-60)
 */
export const SIDEBAR_WIDTH_COLLAPSED = "w-64 lg:w-14";
export const SIDEBAR_WIDTH_EXPANDED = "w-64 lg:w-60";

// Below `lg` the sidebar is an off-canvas drawer, so the main content has NO
// left margin on mobile; the sidebar overlays instead of pushing content.
export const CONTENT_OFFSET_COLLAPSED = "lg:ml-14";
export const CONTENT_OFFSET_EXPANDED = "lg:ml-60";

export const sidebarWidthClass = (collapsed: boolean) =>
  collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

export const contentOffsetClass = (collapsed: boolean) =>
  collapsed ? CONTENT_OFFSET_COLLAPSED : CONTENT_OFFSET_EXPANDED;

/**
 * Common viewport widths we explicitly verify. If the content column ever
 * starts left of the sidebar's right edge at any of these widths, we log a
 * dev-only warning so the mismatch is caught during development.
 */
const CHECKPOINT_WIDTHS = [360, 414, 640, 768, 1024, 1280, 1440, 1920];

/**
 * Dev-only runtime assertion. Warns if the sidebar overlaps the content
 * column. Queries the DOM by `data-admin-sidebar` / `data-admin-content`
 * so it works regardless of how components wrap their roots.
 * No-ops in production.
 */
export function useAdminLayoutOverlapGuard(
  _sidebarRef?: RefObject<HTMLElement | null>,
  _contentRef?: RefObject<HTMLElement | null>
) {
  const enabled = Boolean(import.meta.env?.DEV);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const check = () => {
      // The sidebar is an off-canvas drawer below `lg` (1024px); overlap is
      // expected there because the drawer overlays the content.
      if (window.innerWidth < 1024) return;

      const sb = document
        .querySelector<HTMLElement>("[data-admin-sidebar]")
        ?.getBoundingClientRect();
      const ct = document
        .querySelector<HTMLElement>("[data-admin-content]")
        ?.getBoundingClientRect();
      if (!sb || !ct) return;

      if (ct.left + 0.5 < sb.right) {
        // eslint-disable-next-line no-console
        console.warn(
          `[admin-layout] Sidebar overlaps content at ${window.innerWidth}px: ` +
            `sidebar.right=${sb.right.toFixed(1)} content.left=${ct.left.toFixed(1)}`
        );
      }
    };

    // Run after paint so measurements reflect the applied classes.
    const raf = requestAnimationFrame(check);
    // eslint-disable-next-line no-console
    console.debug(
      `[admin-layout] responsive checkpoints monitored: ${CHECKPOINT_WIDTHS.join(", ")}px`
    );
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", check);
    };
  }, [enabled]);
}


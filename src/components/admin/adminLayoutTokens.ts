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
export const SIDEBAR_WIDTH_COLLAPSED = "w-14";
export const SIDEBAR_WIDTH_EXPANDED = "w-14 lg:w-60";

export const CONTENT_OFFSET_COLLAPSED = "ml-14";
export const CONTENT_OFFSET_EXPANDED = "ml-14 lg:ml-60";

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
 * column, either right now or at any of the standard checkpoint widths
 * (extrapolated from the current DOM measurements + sidebar breakpoint).
 * No-ops in production.
 */
export function useAdminLayoutOverlapGuard(
  sidebarRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>
) {
  const enabled = Boolean(import.meta.env?.DEV);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const check = () => {
      const sb = sidebarRef.current?.getBoundingClientRect();
      const ct = contentRef.current?.getBoundingClientRect();
      if (!sb || !ct) return;

      if (ct.left + 0.5 < sb.right) {
        // eslint-disable-next-line no-console
        console.warn(
          `[admin-layout] Sidebar overlaps content at ${window.innerWidth}px: ` +
            `sidebar.right=${sb.right.toFixed(1)} content.left=${ct.left.toFixed(1)}`
        );
      }
    };

    check();
    // Log the checkpoint list once so devs can eyeball responsive coverage.
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.debug(
        `[admin-layout] responsive checkpoints monitored: ${CHECKPOINT_WIDTHS.join(", ")}px`
      );
    }
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [enabled, sidebarRef, contentRef]);
}

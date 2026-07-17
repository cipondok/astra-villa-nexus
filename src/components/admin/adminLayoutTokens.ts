/**
 * Single source of truth for the AdminSidebar width so the sidebar element
 * and the main content offset never drift apart across breakpoints.
 *
 * Invariant:
 *   sidebar width  === main content left margin at every breakpoint.
 *
 * Collapsed (icon rail only):        56px  (w-14 / ml-14)
 * Expanded, below `lg` (< 1024px):   56px  (still the icon rail — labels use a flyout)
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
 * Dev-only runtime assertion: measures the sidebar and the content column
 * and warns if they overlap. Runs on mount and on window resize.
 * No-ops in production.
 */
export function useAdminLayoutOverlapGuard(
  sidebarRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLElement>
) {
  const enabled = import.meta.env?.DEV;
  // Lazy import to keep this file framework-free at the top.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useEffect } = require("react") as typeof import("react");

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const check = () => {
      const sb = sidebarRef.current?.getBoundingClientRect();
      const ct = contentRef.current?.getBoundingClientRect();
      if (!sb || !ct) return;
      // The content column must start at or after the sidebar's right edge.
      if (ct.left + 0.5 < sb.right) {
        // eslint-disable-next-line no-console
        console.warn(
          `[admin-layout] Sidebar overlaps content at ${window.innerWidth}px: ` +
            `sidebar.right=${sb.right.toFixed(1)} content.left=${ct.left.toFixed(1)}`
        );
      }
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

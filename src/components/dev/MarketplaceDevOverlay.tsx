import { useEffect, useState, type MutableRefObject } from "react";

/**
 * Hidden developer overlay for the /properties marketplace.
 *
 * Visibility:
 *  - Add `?debug=1` (or `?debug=marketplace`) to the URL, OR
 *  - Press Ctrl/Cmd + Shift + D to toggle at runtime.
 *
 * Displays live values sourced from refs + react-query state so it can watch
 * pagination without interfering with rendering.
 */
export function MarketplaceDevOverlay({
  pagesLoaded,
  rowsLoaded,
  pageSize,
  hasNextPage,
  isLoading,
  isFetchingNextPage,
  filtersKey,
  fetchCountRef,
  inFlightPagesRef,
  sentinelTriggerCountRef,
  duplicatesDetectedRef,
  duplicateRowsRef,
  seenIdsRef,
}: {
  pagesLoaded: number;
  rowsLoaded: number;
  pageSize: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  filtersKey: string;
  fetchCountRef: MutableRefObject<number>;
  inFlightPagesRef: MutableRefObject<Set<number>>;
  sentinelTriggerCountRef: MutableRefObject<number>;
  duplicatesDetectedRef: MutableRefObject<number>;
  duplicateRowsRef: MutableRefObject<number>;
  seenIdsRef: MutableRefObject<Set<string>>;
}) {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const debug = params.get("debug");
    return debug === "1" || debug === "marketplace" || debug === "true";
  });
  const [collapsed, setCollapsed] = useState(false);
  const [, force] = useState(0);

  // Keyboard toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Poll refs while visible so ref mutations reflect in the UI.
  useEffect(() => {
    if (!visible || collapsed) return;
    const id = window.setInterval(() => force((n) => n + 1), 250);
    return () => window.clearInterval(id);
  }, [visible, collapsed]);

  if (!visible) return null;

  const inFlight = Array.from(inFlightPagesRef.current);
  const inFlightAny = inFlight.length > 0 || isFetchingNextPage || isLoading;
  const dupRequests = duplicatesDetectedRef.current;
  const dupRows = duplicateRowsRef.current;
  const hasDuplicates = dupRequests > 0 || dupRows > 0;

  return (
    <div
      role="complementary"
      aria-label="Marketplace developer overlay"
      className="fixed bottom-4 right-4 z-[9999] w-[280px] rounded-lg border border-white/10 bg-black/85 text-white shadow-2xl backdrop-blur-md font-mono text-[11px] leading-[1.35]"
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="uppercase tracking-[0.18em] text-[10px] text-[#D4AF37]">
          Marketplace · Dev
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="px-1.5 py-0.5 text-[10px] rounded hover:bg-white/10"
            aria-label={collapsed ? "Expand overlay" : "Collapse overlay"}
          >
            {collapsed ? "▢" : "—"}
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="px-1.5 py-0.5 text-[10px] rounded hover:bg-white/10"
            aria-label="Close overlay"
          >
            ×
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-1.5">
          <Row label="pages_loaded" value={String(pagesLoaded)} />
          <Row label="rows_loaded" value={`${rowsLoaded} (unique ${seenIdsRef.current.size})`} />
          <Row label="page_size" value={String(pageSize)} />
          <Row
            label="in_flight"
            value={inFlightAny ? "YES" : "idle"}
            tone={inFlightAny ? "active" : "muted"}
          />
          <Row
            label="in_flight_pages"
            value={inFlight.length ? `[${inFlight.join(", ")}]` : "—"}
          />
          <Row
            label="fetching_next"
            value={isFetchingNextPage ? "true" : "false"}
            tone={isFetchingNextPage ? "active" : "muted"}
          />
          <Row label="has_next_page" value={hasNextPage ? "true" : "false"} />
          <Row label="fetch_count" value={String(fetchCountRef.current)} />
          <Row label="sentinel_triggers" value={String(sentinelTriggerCountRef.current)} />
          <Row
            label="duplicate_requests"
            value={String(dupRequests)}
            tone={dupRequests > 0 ? "warn" : "muted"}
          />
          <Row
            label="duplicate_rows"
            value={String(dupRows)}
            tone={dupRows > 0 ? "warn" : "muted"}
          />
          <div
            className={`mt-2 rounded px-2 py-1.5 text-center text-[10px] uppercase tracking-[0.16em] ${
              hasDuplicates
                ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                : "bg-emerald-500/15 text-emerald-300"
            }`}
          >
            {hasDuplicates ? "Duplicates detected" : "No duplicates"}
          </div>
          <div
            className="mt-2 text-[9px] text-white/40 truncate"
            title={filtersKey}
          >
            key: {filtersKey || "—"}
          </div>
          <div className="text-[9px] text-white/30 pt-1">
            toggle: Ctrl/Cmd + Shift + D
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "muted" | "active" | "warn";
}) {
  const toneCls =
    tone === "warn"
      ? "text-[#D4AF37]"
      : tone === "active"
      ? "text-emerald-300"
      : tone === "muted"
      ? "text-white/50"
      : "text-white";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/55">{label}</span>
      <span className={`tabular-nums ${toneCls}`}>{value}</span>
    </div>
  );
}

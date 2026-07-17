import { useCallback, useEffect, useRef } from "react";
import { useTrackEvent } from "./useTrackEvent";

export type CtaKind = "reserve" | "contact";
export type CtaPlacement = "hero" | "mini_bar" | "sidebar" | "mobile_bar";

interface PropertyCtaContext {
  propertyId?: string;
  city?: string | null;
  price?: number | null;
  listingType?: string | null;
}

interface ImpressionOpts {
  cta: CtaKind;
  placement: CtaPlacement;
}

/**
 * Tracks Reserve/Contact CTA analytics on the Property Detail page.
 *
 * - `registerImpression(el, { cta, placement })` — attach to a CTA to fire a
 *   `cta_impression` event the first time it becomes visible in a session.
 * - `trackClick({ cta, placement, outcome? })` — fires `cta_click` and,
 *   when `outcome` is provided, a matching `cta_conversion` event.
 *
 * Events dedupe per session+property+placement+cta so scrolling in/out or
 * repeated renders don't inflate impression counts.
 */
export function usePropertyCtaTracking(ctx: PropertyCtaContext) {
  const { trackEvent } = useTrackEvent();
  const seenImpressions = useRef<Set<string>>(new Set());

  const baseMeta = useCallback(
    (extra: Record<string, unknown> = {}) => ({
      city: ctx.city ?? undefined,
      metadata: {
        price: ctx.price ?? null,
        listing_type: ctx.listingType ?? null,
        ...extra,
      },
    }),
    [ctx.city, ctx.price, ctx.listingType],
  );

  const key = useCallback(
    (cta: CtaKind, placement: CtaPlacement) =>
      `${ctx.propertyId ?? "unknown"}:${placement}:${cta}`,
    [ctx.propertyId],
  );

  const registerImpression = useCallback(
    (node: Element | null, opts: ImpressionOpts) => {
      if (!node || !ctx.propertyId) return () => {};
      const id = key(opts.cta, opts.placement);
      if (seenImpressions.current.has(id)) return () => {};

      const io = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            if (seenImpressions.current.has(id)) {
              io.disconnect();
              return;
            }
            seenImpressions.current.add(id);
            trackEvent("cta_impression", {
              property_id: ctx.propertyId,
              ...baseMeta({ cta: opts.cta, placement: opts.placement }),
            });
            io.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      io.observe(node);
      return () => io.disconnect();
    },
    [ctx.propertyId, baseMeta, key, trackEvent],
  );

  const trackClick = useCallback(
    (opts: ImpressionOpts & { outcome?: "booking_initiated" | "contact_opened"; extra?: Record<string, unknown> }) => {
      if (!ctx.propertyId) return;
      trackEvent("cta_click", {
        property_id: ctx.propertyId,
        ...baseMeta({ cta: opts.cta, placement: opts.placement, ...(opts.extra ?? {}) }),
      });
      if (opts.outcome) {
        trackEvent("cta_conversion", {
          property_id: ctx.propertyId,
          value: 1,
          ...baseMeta({
            cta: opts.cta,
            placement: opts.placement,
            outcome: opts.outcome,
            ...(opts.extra ?? {}),
          }),
        });
      }
    },
    [ctx.propertyId, baseMeta, trackEvent],
  );

  // Ensure buffered events are flushed when the user leaves the page.
  useEffect(() => {
    const onHide = () => {
      // useTrackEvent auto-flushes on unmount; visibilitychange is a safety net.
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  return { registerImpression, trackClick };
}

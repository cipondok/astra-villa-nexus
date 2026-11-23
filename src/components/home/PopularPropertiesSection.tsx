import { useState } from "react";
import { Link } from "react-router-dom";
import { Bath, BedDouble, Info, MapPin } from "lucide-react";
import { usePropertyRankings, type RankingKind } from "@/hooks/usePropertyRankings";
import { cleanPlace, formatIdrShort, propertyPath, typeLabel } from "@/lib/propertySeo";
import { cn } from "@/lib/utils";

const TABS: { kind: RankingKind; label: string; explain: string }[] = [
  { kind: "popular", label: "Popular", explain: "Unique views, saves, shares and inquiries in the last 30 days, with a small boost for fresh and verified listings." },
  { kind: "trending", label: "Trending", explain: "The same signals, counted over the last 7 days only." },
  { kind: "newest", label: "Newly listed", explain: "The most recently published listings." },
  { kind: "most_viewed", label: "Most viewed", explain: "Unique visitors in the last 30 days. Bots and repeat visits are not counted." },
  { kind: "most_saved", label: "Most saved", explain: "Different people who saved the listing in the last 30 days." },
  { kind: "most_shared", label: "Most shared", explain: "Share actions in the last 30 days, one per person per day." },
];

export function PopularPropertiesSection() {
  const [kind, setKind] = useState<RankingKind>("popular");
  const tab = TABS.find((t) => t.kind === kind)!;
  const { data = [], isLoading } = usePropertyRankings(kind, 8, true);

  return (
    <section aria-labelledby="popular-properties-heading" className="reos-card p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="popular-properties-heading" className="text-[17px] sm:text-[18px] font-semibold">Popular Properties</h2>
          <p className="mt-0.5 flex items-start gap-1.5 text-[11px] text-[var(--text-2)] max-w-xl">
            <Info className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" /> {tab.explain}
          </p>
        </div>
        <Link to="/properties" className="text-[12px] reos-gold hover:underline min-h-[44px] inline-flex items-center">View all</Link>
      </div>

      <div role="tablist" aria-label="Ranking" className="mt-3 flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.kind}
            role="tab"
            type="button"
            aria-selected={t.kind === kind}
            onClick={() => setKind(t.kind)}
            className={cn(
              "shrink-0 min-h-[36px] rounded-full border px-3.5 text-[12px] font-medium transition-colors",
              t.kind === kind
                ? "border-[var(--line-strong)] bg-[var(--gold-soft)] reos-gold"
                : "border-[var(--line)] text-[var(--text-2)] hover:border-[var(--line-gold)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-3">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-xl bg-[var(--inset)] animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] p-5 text-center">
            <p className="text-[13px]">Not enough real activity yet for this ranking.</p>
            <p className="mt-1 text-[11px] text-[var(--text-2)]">It fills in as visitors view, save and share listings. We never show made-up numbers.</p>
            <button type="button" onClick={() => setKind("newest")} className="mt-3 min-h-[44px] rounded-full px-4 text-[12px] reos-cta">
              See newly listed
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {data.map((p, i) => (
              <li key={p.id} className="min-w-0">
                <Link to={propertyPath(p)} className="group block overflow-hidden rounded-xl border border-[var(--line)] hover:border-[var(--line-strong)] transition-colors">
                  <div className="relative aspect-[4/3] bg-[var(--inset)]">
                    {p.image && (
                      <img src={p.image} alt={`${p.title} — main photo`} loading="lazy" decoding="async" width={400} height={300} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-semibold reos-gold">#{i + 1}</span>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[13px] font-semibold reos-gold">{formatIdrShort(p.price) || "Price on request"}</div>
                    <div className="mt-0.5 text-[12px] font-medium leading-snug line-clamp-2 min-h-[2.5em]">{p.title.replace(/\b(KABUPATEN|KOTA)\s+/g, "")}</div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--text-2)] truncate">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{[cleanPlace(p.district), cleanPlace(p.city)].filter(Boolean).join(", ") || typeLabel(p.property_type)}</span>
                    </div>
                    {(p.bedrooms || p.bathrooms) ? (
                      <div className="mt-1 flex gap-2.5 text-[10px] text-[var(--text-2)]">
                        {p.bedrooms ? <span className="inline-flex items-center gap-1"><BedDouble className="h-3 w-3" aria-hidden="true" />{p.bedrooms}</span> : null}
                        {p.bathrooms ? <span className="inline-flex items-center gap-1"><Bath className="h-3 w-3" aria-hidden="true" />{p.bathrooms}</span> : null}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default PopularPropertiesSection;

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, Compass, Globe2, Mountain, Waves } from "lucide-react";
import { LuxeLayout, LuxeSection, LuxeSectionHead, LuxeCard, LuxeButton } from "@/components/luxe";
import { SEOHead } from "@/components/SEOHead";
import { cn } from "@/lib/utils";

import baliImg from "@/assets/luxe-loc-bali.jpg";
import jakartaImg from "@/assets/luxe-loc-jakarta.jpg";
import lombokImg from "@/assets/luxe-loc-lombok.jpg";
import internationalImg from "@/assets/luxe-loc-international.jpg";

type Region = {
  key: string;
  name: string;
  tagline: string;
  blurb: string;
  image: string;
  stats: { label: string; value: string }[];
  hotspots: string[];
  to: string;
  accent: "ocean" | "city" | "island" | "global";
};

const REGIONS: Region[] = [
  {
    key: "bali",
    name: "Bali",
    tagline: "Island of the Gods",
    blurb: "Cliffside villas, jungle sanctuaries and beachfront estates — the heart of ASTRA Villa.",
    image: baliImg,
    stats: [
      { label: "Active Villas", value: "240+" },
      { label: "Avg. ROI",      value: "11.4%" },
      { label: "Occupancy",     value: "78%" },
    ],
    hotspots: ["Uluwatu", "Canggu", "Ubud", "Seminyak", "Sanur", "Tabanan"],
    to: "/properties?location=Bali",
    accent: "ocean",
  },
  {
    key: "jakarta",
    name: "Jakarta",
    tagline: "The Capital Skyline",
    blurb: "Penthouses, executive residences and prime CBD properties in Indonesia's financial heart.",
    image: jakartaImg,
    stats: [
      { label: "Active Listings", value: "180+" },
      { label: "Avg. Yield",      value: "8.2%" },
      { label: "Districts",       value: "12" },
    ],
    hotspots: ["SCBD", "Menteng", "Kemang", "Pondok Indah", "PIK", "Kuningan"],
    to: "/properties?location=Jakarta",
    accent: "city",
  },
  {
    key: "lombok",
    name: "Lombok",
    tagline: "Untouched Paradise",
    blurb: "Pristine beaches, surf coves and emerging luxury — the next investment frontier.",
    image: lombokImg,
    stats: [
      { label: "Active Villas", value: "60+" },
      { label: "Growth (YoY)",  value: "+34%" },
      { label: "Coastline",     value: "Endless" },
    ],
    hotspots: ["Kuta Mandalika", "Selong Belanak", "Gili Trawangan", "Senggigi"],
    to: "/properties?location=Lombok",
    accent: "island",
  },
  {
    key: "international",
    name: "International",
    tagline: "Borderless Portfolio",
    blurb: "Curated luxury properties across Southeast Asia, Europe and beyond — by invitation.",
    image: internationalImg,
    stats: [
      { label: "Countries",   value: "14" },
      { label: "Partners",    value: "26" },
      { label: "Currencies",  value: "Multi" },
    ],
    hotspots: ["Singapore", "Phuket", "Dubai", "Lisbon", "Tokyo", "London"],
    to: "/properties?intent=international",
    accent: "global",
  },
];

const ACCENT_ICON = {
  ocean: Waves,
  city: Compass,
  island: Mountain,
  global: Globe2,
} as const;

export default function Locations() {
  return (
    <LuxeLayout>
      <SEOHead
        title="Destinations — ASTRA Villa Property OS"
        description="Explore luxury villas and properties across Bali, Jakarta, Lombok and curated international destinations."
      />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 0%, rgba(200,169,107,0.15) 0%, transparent 60%), radial-gradient(40% 50% at 80% 100%, rgba(200,169,107,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="luxe-eyebrow">— Destinations</span>
            <h1 className="font-serif-l text-[44px] md:text-[68px] leading-[1.02] mt-4">
              Where the world's most <span className="text-luxe-gold italic">extraordinary</span> villas live.
            </h1>
            <p className="mt-6 text-[15px] md:text-[16px] text-luxe-mut max-w-xl leading-relaxed">
              From Bali's jungle cliffs to Jakarta's skyline penthouses, every ASTRA Villa
              destination is curated, scored and orchestrated by our AI Property OS.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <LuxeButton to="/properties" variant="gold">
                Explore all properties
              </LuxeButton>
              <LuxeButton to="/location-map" variant="outline">
                Open interactive map
              </LuxeButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ REGION CARDS ============ */}
      <LuxeSection id="regions">
        <LuxeSectionHead
          eyebrow="— Curated regions"
          title="Choose your horizon"
          description="Four worlds, one operating system. Each destination is tracked live for inventory, ROI and momentum."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {REGIONS.map((r, i) => {
            const Icon = ACCENT_ICON[r.accent];
            return (
              <motion.div
                key={r.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              >
                <RegionCard region={r} Icon={Icon} />
              </motion.div>
            );
          })}
        </div>
      </LuxeSection>

      {/* ============ CINEMATIC MAP PANEL ============ */}
      <LuxeSection id="map" className="pb-24">
        <LuxeSectionHead
          eyebrow="— Cinematic map"
          title="The Bali map, reimagined"
          description="A live constellation of villas, scored and ranked by the ASTRA AI engine."
        />

        <CinematicMap />

        <div className="mt-8 text-center">
          <LuxeButton to="/location-map" variant="gold">
            Launch full interactive map
          </LuxeButton>
        </div>
      </LuxeSection>
    </LuxeLayout>
  );
}

/* ============================================================
   Region Card
   ============================================================ */
function RegionCard({
  region,
  Icon,
}: {
  region: Region;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <LuxeCard className="group relative overflow-hidden rounded-3xl p-0">
      <Link to={region.to} className="block">
        {/* Image layer */}
        <div className="relative h-[360px] md:h-[420px] overflow-hidden">
          <img
            src={region.image}
            alt={`${region.name} — ${region.tagline}`}
            loading="lazy"
            width={1280}
            height={896}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
          {/* Gradient + grain */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.92) 100%)",
            }}
          />
          {/* Top label */}
          <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full luxe-glass-card text-[11px] tracking-[0.18em] uppercase text-luxe-fg/90">
            <Icon className="w-3.5 h-3.5 text-luxe-gold" />
            {region.tagline}
          </div>
          {/* Arrow */}
          <div className="absolute top-5 right-5 w-10 h-10 rounded-full luxe-glass-card grid place-items-center transition-transform duration-500 group-hover:rotate-45 group-hover:bg-[color:var(--luxe-gold)]/20">
            <ArrowUpRight className="w-4 h-4 text-luxe-gold" />
          </div>

          {/* Bottom title */}
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
            <h3 className="font-serif-l text-[36px] md:text-[44px] leading-none text-white">
              {region.name}
            </h3>
            <p className="mt-2 text-[13px] text-white/70 max-w-md">{region.blurb}</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 border-t border-luxe">
          {region.stats.map((s) => (
            <div
              key={s.label}
              className="px-4 py-4 text-center border-r border-luxe last:border-r-0"
            >
              <div className="font-serif-l text-[22px] text-luxe-gold leading-none">
                {s.value}
              </div>
              <div className="mt-1.5 text-[9px] uppercase tracking-[0.24em] text-luxe-mut">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Hotspots */}
        <div className="px-6 py-5 flex flex-wrap items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-luxe-gold shrink-0" />
          {region.hotspots.map((h) => (
            <span
              key={h}
              className="text-[11px] px-2.5 py-1 rounded-full border border-luxe text-luxe-fg/75 hover:border-[color:var(--luxe-gold)]/60 hover:text-luxe-gold transition-colors"
            >
              {h}
            </span>
          ))}
        </div>
      </Link>
    </LuxeCard>
  );
}

/* ============================================================
   Cinematic Map — stylized SVG constellation of Bali villas.
   Lightweight + GPU-friendly; no external map deps here.
   For the full interactive map use /location-map.
   ============================================================ */
const MAP_POINTS = [
  { x: 18, y: 62, name: "Tabanan",  count: 14 },
  { x: 28, y: 48, name: "Canggu",   count: 38 },
  { x: 32, y: 70, name: "Uluwatu",  count: 47 },
  { x: 44, y: 52, name: "Seminyak", count: 31 },
  { x: 50, y: 38, name: "Ubud",     count: 52 },
  { x: 62, y: 60, name: "Sanur",    count: 22 },
  { x: 76, y: 46, name: "Karangasem", count: 9 },
  { x: 86, y: 32, name: "Lovina",   count: 6 },
];

function CinematicMap() {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-luxe luxe-glass-card">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 50%, rgba(200,169,107,0.10) 0%, transparent 60%), linear-gradient(180deg, #0a0a0c, #050505)",
        }}
      />
      {/* Lat/lon grid */}
      <svg
        viewBox="0 0 100 70"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-30"
        aria-hidden
      >
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1={0} x2={i * 10} y2={70} stroke="rgba(200,169,107,0.18)" strokeWidth="0.1" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="rgba(200,169,107,0.18)" strokeWidth="0.1" />
        ))}
      </svg>

      {/* Connecting lines */}
      <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
        {MAP_POINTS.slice(0, -1).map((p, i) => {
          const next = MAP_POINTS[i + 1];
          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(200,169,107,0.35)"
              strokeWidth="0.15"
              strokeDasharray="0.6 0.6"
            />
          );
        })}
      </svg>

      {/* Hotspots */}
      <div className="relative aspect-[2/1] md:aspect-[16/7]">
        {MAP_POINTS.map((p) => (
          <Link
            key={p.name}
            to={`/properties?location=${encodeURIComponent(p.name)}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/hot"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <span
              className={cn(
                "block w-2.5 h-2.5 rounded-full bg-[color:var(--luxe-gold)]",
                "shadow-[0_0_0_4px_rgba(200,169,107,0.18),0_0_18px_rgba(200,169,107,0.55)]",
                "transition-transform duration-500 group-hover/hot:scale-150"
              )}
            />
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap opacity-0 group-hover/hot:opacity-100 transition-opacity duration-300 px-2 py-1 rounded-md luxe-glass-card text-[10px] tracking-wide">
              {p.name} · {p.count}
            </span>
            {/* Pulse ring */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: "radial-gradient(circle, rgba(200,169,107,0.5) 0%, transparent 70%)",
                animationDuration: "3s",
              }}
            />
          </Link>
        ))}

        {/* Compass */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-[color:var(--luxe-gold)]/40 grid place-items-center">
          <Compass className="w-4 h-4 text-luxe-gold" />
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-2 rounded-full luxe-glass-card text-[10px] tracking-[0.2em] uppercase text-luxe-fg/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--luxe-gold)]" />
          Active villa cluster
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, type Variants } from "framer-motion";
import {
  Search, Calendar, Users, Sparkles, ArrowUpRight, MapPin, Star,
  Bot, TrendingUp, LineChart, Compass, Wand2, ShieldCheck, Globe2,
  PlayCircle, ChevronRight, Heart, Languages, Moon, User2, Box, Home,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import heroImg from "@/assets/luxe-hero-bali.jpg";
import villa1 from "@/assets/luxe-villa-1.jpg";
import villa2 from "@/assets/luxe-villa-2.jpg";
import villa3 from "@/assets/luxe-villa-3.jpg";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/* Cinematic easing — Apple-like */
const EASE = [0.22, 1, 0.36, 1] as const;

/* Premium scroll reveal: fade + slight rise + blur lift */
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(14px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 1.1, ease: EASE } },
};

function Reveal({
  children, delay = 0, y = 36, className, as = "div",
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "article" | "section" | "li" | "span" }) {
  const Tag: any = (motion as any)[as];
  return (
    <Tag
      initial={{ opacity: 0, y, filter: "blur(14px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Tag>
  );
}

/* Atmospheric divider — soft gold horizon between sections */
function AtmosDivider({ tone = "gold" }: { tone?: "gold" | "emerald" | "cool" }) {
  const tint =
    tone === "emerald" ? "rgba(79,178,134,0.18)"
    : tone === "cool"  ? "rgba(124,231,255,0.14)"
    : "rgba(200,169,107,0.22)";
  return (
    <div aria-hidden className="relative h-32 md:h-44 -my-16 md:-my-20 pointer-events-none overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1/2"
           style={{ background: `linear-gradient(to bottom, transparent, ${tint} 70%, transparent)` }} />
      <div className="absolute inset-x-0 bottom-0 h-1/2"
           style={{ background: "linear-gradient(to top, #050505, transparent)" }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-px"
           style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,107,0.45), transparent)" }} />
    </div>
  );
}

/* Animated count-up for metric values (handles "%", "$", "+", "/", non-numeric strings) */
function CountUp({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const match = value.match(/-?\d+(\.\d+)?/);
  const [display, setDisplay] = useState(match ? value.replace(match[0], "0") : value);

  useEffect(() => {
    if (!inView || !match) return;
    const target = parseFloat(match[0]);
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = (target * eased);
      const text = match[0].includes(".") ? cur.toFixed(1) : Math.round(cur).toString();
      setDisplay(value.replace(match[0], text));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, match]);

  return <span ref={ref}>{display}</span>;
}

/* Cinematic 3D tilt card */
function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 140, damping: 18 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   ASTRA VILLA — Luxe Experience (Property OS, Bali)
   Cinematic dark luxury landing. Self-contained scoped tokens
   so it doesn't fight the app's global theme.
   ============================================================ */

const CHIPS = ["Beachfront", "Rice Field View", "Jungle Retreat", "Family Friendly", "Newly Added"];
const SUGGESTIONS = [
  "Cliffside villa in Uluwatu with infinity pool…",
  "Jungle sanctuary near Ubud, 4 bedrooms…",
  "Beachfront retreat in Canggu for 6 guests…",
  "Architectural pavilion with private chef…",
];

const FEATURED = [
  { img: villa3, name: "Villa Anantara", area: "Uluwatu · Beachfront", price: "$2,850", rating: 4.98, tag: "Editor's Pick" },
  { img: villa1, name: "Cliff House No. 9", area: "Bingin · Ocean Cliff", price: "$3,420", rating: 4.96, tag: "New" },
  { img: villa2, name: "Pavilion Ubud", area: "Ubud · Jungle Retreat", price: "$1,980", rating: 4.94, tag: "Concierge" },
];

const AI_CARDS = [
  { icon: Wand2, k: "AI Match Accuracy", v: "98.4%", sub: "Personal taste model" },
  { icon: LineChart, k: "Market Pulse", v: "+12.7%", sub: "Bali YoY appreciation" },
  { icon: TrendingUp, k: "ROI Forecast", v: "9.6%", sub: "Avg net yield, 12mo" },
  { icon: Bot, k: "Concierge", v: "24/7", sub: "Multilingual, on-demand" },
];

const OS_FEATURES = [
  { icon: Sparkles, t: "AI Property Intelligence", d: "Live signals from every listing, transaction and inquiry — synthesized into clarity." },
  { icon: Box, t: "3D Digital Twin", d: "Walk every villa before you arrive. Photoreal, frame-perfect, instant." },
  { icon: LineChart, t: "Investment Analytics", d: "Yield, occupancy, micro-market — modeled, ranked, explained." },
  { icon: TrendingUp, t: "Predictive Pricing", d: "Demand and seasonality forecasted nightly, not quarterly." },
  { icon: Compass, t: "Immersive Tours", d: "Cinematic walkthroughs with narrated context and lighting moods." },
  { icon: Globe2, t: "Global Investor Layer", d: "Curated cross-border deals with verified provenance and escrow." },
];

const COLLECTIONS = [
  { img: villa3, t: "The Coastal Series", c: "11 villas" },
  { img: villa2, t: "Jungle Sanctuaries", c: "08 villas" },
  { img: villa1, t: "Cliffside Architecture", c: "06 villas" },
];

export default function LuxeExperience() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 160]);
  const heroScale = useTransform(scrollY, [0, 800], [1.05, 1.18]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.35]);

  const [scrolled, setScrolled] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(0);
  const [spot, setSpot] = useState({ x: 50, y: 40 });

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setSuggestIdx(i => (i + 1) % SUGGESTIONS.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setSpot({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        });
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => { el.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="luxe-root relative min-h-screen text-luxe-fg antialiased">
      <SEOHead
        title="ASTRA Villa · The AI Property OS for Bali"
        description="Discover extraordinary villas in Bali with AI-powered intelligence, immersive 3D tours, and a private concierge built for the new luxury."
      />

      {/* Scoped luxe tokens — won't leak into the rest of the app */}
      <style>{`
        .luxe-root {
          --luxe-bg: #050505;
          --luxe-bg-2: #0B1220;
          --luxe-gold: #C8A96B;
          --luxe-gold-soft: #E7CE96;
          --luxe-emerald: #4FB286;
          --luxe-cyan: #7CE7FF;
          --luxe-fg: #ECE9E0;
          --luxe-mut: #8A8576;
          --luxe-line: rgba(236,233,224,0.08);
          --luxe-glass: rgba(255,255,255,0.04);
          --luxe-serif: 'Cormorant Garamond','Playfair Display',ui-serif,Georgia,serif;
          --luxe-sans: 'Inter','SF Pro Display',ui-sans-serif,system-ui,sans-serif;
          background:
            radial-gradient(1200px 700px at 80% -10%, rgba(200,169,107,0.10), transparent 60%),
            radial-gradient(900px 600px at -10% 30%, rgba(79,178,134,0.08), transparent 60%),
            linear-gradient(180deg, #050505 0%, #07090e 40%, #050709 100%);
          color: var(--luxe-fg);
          font-family: var(--luxe-sans);
        }
        .luxe-root .text-luxe-fg { color: var(--luxe-fg); }
        .luxe-root .text-luxe-mut { color: var(--luxe-mut); }
        .luxe-root .text-luxe-gold { color: var(--luxe-gold); }
        .luxe-root .bg-luxe-glass { background: var(--luxe-glass); }
        .luxe-root .border-luxe { border-color: var(--luxe-line); }
        .luxe-root .font-serif-l { font-family: var(--luxe-serif); font-weight: 400; letter-spacing: -0.01em; }
        .luxe-root .font-mono-l { font-family: ui-monospace,SFMono-Regular,Menlo,monospace; }
        .luxe-glass-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
          border: 1px solid var(--luxe-line);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
        }
        .luxe-gold-btn {
          background: linear-gradient(180deg, #D7B97A 0%, #B6914F 100%);
          color: #0a0a0a;
          box-shadow: 0 10px 30px -10px rgba(200,169,107,0.55), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .luxe-gold-btn:hover { filter: brightness(1.05); }
        .luxe-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,169,107,0.45), transparent);
        }
        .luxe-eyebrow {
          font-family: var(--luxe-sans);
          text-transform: uppercase;
          letter-spacing: 0.32em;
          font-size: 11px;
          color: var(--luxe-gold);
        }
        .luxe-grain::before {
          content:""; position:absolute; inset:0; pointer-events:none; opacity:.06; mix-blend-mode:overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>");
        }
        @keyframes luxeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .luxe-float { animation: luxeFloat 6s ease-in-out infinite; }
        @keyframes luxeBloomA { 0%,100% { transform: translate3d(0,0,0) scale(1); opacity:.55 } 50% { transform: translate3d(3%,-2%,0) scale(1.08); opacity:.8 } }
        @keyframes luxeBloomB { 0%,100% { transform: translate3d(0,0,0) scale(1); opacity:.4 } 50% { transform: translate3d(-2%,3%,0) scale(1.12); opacity:.65 } }
        @keyframes luxeKenBurns { 0% { transform: scale(1.05) translate3d(0,0,0) } 100% { transform: scale(1.14) translate3d(-1.5%,-1%,0) } }
        @keyframes luxeShimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes luxeCue { 0%,100% { transform: translateY(0); opacity:.5 } 50% { transform: translateY(6px); opacity:1 } }
        @keyframes luxeSpark { 0% { opacity:0; transform: translateY(0) } 10% { opacity:.6 } 100% { opacity:0; transform: translateY(-80px) } }
        .luxe-bloom-a { animation: luxeBloomA 14s ease-in-out infinite; }
        .luxe-bloom-b { animation: luxeBloomB 18s ease-in-out infinite; }
        .luxe-kenburns { animation: luxeKenBurns 22s ease-in-out infinite alternate; }
        .luxe-cue { animation: luxeCue 2.4s ease-in-out infinite; }
        .luxe-gold-shimmer {
          background: linear-gradient(90deg, #C8A96B 0%, #F2E0B2 45%, #C8A96B 60%, #B6914F 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: luxeShimmer 7s linear infinite;
        }
        .luxe-particles { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
        .luxe-particles span {
          position:absolute; bottom:-10px; width:2px; height:2px; border-radius:9999px;
          background: rgba(231,206,150,0.55); box-shadow: 0 0 6px rgba(231,206,150,0.6);
          animation: luxeSpark 9s linear infinite;
        }
        @keyframes luxeMesh { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(2%,-1.5%,0) } }
        .luxe-mesh-a { animation: luxeMesh 28s ease-in-out infinite; }
        @keyframes luxePulse { 0%,100% { opacity:.55; transform:scale(1) } 50% { opacity:1; transform:scale(1.25) } }
        .luxe-pulse { animation: luxePulse 2.6s ease-in-out infinite; }
        .luxe-card-glow {
          position:relative;
        }
        .luxe-card-glow::after{
          content:""; position:absolute; inset:-1px; border-radius:inherit; pointer-events:none;
          background: radial-gradient(120% 80% at 50% 0%, rgba(200,169,107,0.18), transparent 60%);
          opacity:0; transition:opacity .6s ease;
        }
        .luxe-card-glow:hover::after{ opacity:1; }
        @media (prefers-reduced-motion: reduce) {
          .luxe-mesh-a,.luxe-pulse { animation: none !important; }
        }
      `}</style>

      {/* ============== AMBIENT BACKGROUND MESH (site-wide) ============== */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/3 -left-1/4 w-[80vw] h-[80vw] rounded-full luxe-mesh-a opacity-70"
             style={{ background: "radial-gradient(closest-side, rgba(200,169,107,0.10), transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full luxe-mesh-a opacity-60"
             style={{ background: "radial-gradient(closest-side, rgba(79,178,134,0.08), transparent 70%)", filter: "blur(80px)", animationDelay: "-9s" }} />
        <div className="absolute inset-0 luxe-grain" />
      </div>

      <div className="relative z-10">


      {/* ============== NAV ============== */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <nav
            className={cn(
              "luxe-glass-card flex items-center justify-between rounded-full px-4 md:px-6 py-2.5 md:py-3 transition-all",
              scrolled && "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
            )}
          >
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full grid place-items-center"
                   style={{ background: "linear-gradient(135deg,#C8A96B,#8C6B2F)" }}>
                <span className="font-serif-l text-[15px] text-black">A</span>
              </div>
              <span className="font-serif-l text-[17px] tracking-wide">Astra<span className="text-luxe-gold"> Villa</span></span>
            </a>

            <div className="hidden lg:flex items-center gap-8 text-[13px] text-luxe-fg/80">
              {["Villas", "Collections", "Investor OS", "Concierge", "Journal"].map(i => (
                <a key={i} className="hover:text-luxe-gold transition-colors" href="#">{i}</a>
              ))}
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <button className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-luxe-glass border border-luxe text-[12px] hover:border-[color:var(--luxe-gold)] transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-luxe-gold" /> AI Concierge
              </button>
              <button className="w-9 h-9 grid place-items-center rounded-full bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-colors" aria-label="Language">
                <Languages className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 grid place-items-center rounded-full bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-colors" aria-label="Theme">
                <Moon className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 grid place-items-center rounded-full bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-colors" aria-label="Wishlist">
                <Heart className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 grid place-items-center rounded-full bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-colors" aria-label="Profile">
                <User2 className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ============== HERO ============== */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden luxe-grain">
        <motion.div
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={heroImg}
            alt="Cinematic Bali luxury villa with infinity pool at golden hour"
            className="w-full h-full object-cover luxe-kenburns"
            width={1920} height={1280}
            loading="eager"
            decoding="async"
          />
        </motion.div>

        {/* Ambient bloom layers */}
        <div className="absolute inset-0 pointer-events-none luxe-bloom-a"
          style={{ background: "radial-gradient(40% 30% at 78% 22%, rgba(231,206,150,0.30), transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none luxe-bloom-b"
          style={{ background: "radial-gradient(34% 28% at 18% 78%, rgba(79,178,134,0.18), transparent 70%)" }} />

        {/* Mouse-tracked cinematic spotlight */}
        <div className="absolute inset-0 pointer-events-none transition-[background] duration-300"
          style={{ background: `radial-gradient(420px 320px at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.06), transparent 70%)` }} />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-[#050505]" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(60% 50% at 50% 90%, rgba(5,5,5,0.85), transparent 70%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(11,18,32,0.35) 0%, transparent 30%, transparent 60%, rgba(5,5,5,0.6) 100%)"
        }} />

        {/* Floating gold particles */}
        <div className="luxe-particles" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={{
              left: `${(i * 7.3) % 100}%`,
              animationDelay: `${(i * 0.7) % 9}s`,
              animationDuration: `${8 + (i % 5)}s`,
              opacity: 0,
            }} />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-5 md:px-10 pt-32 md:pt-44 pb-20">
          <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="luxe-eyebrow">Bali · Est. MMXXVI</span>
              <span className="w-10 h-px bg-[color:var(--luxe-gold)]/60" />
              <span className="text-[11px] text-luxe-mut font-mono-l">AI Property OS · v2.0</span>
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } } }}
              className="font-serif-l text-[44px] sm:text-[64px] md:text-[96px] leading-[0.95] tracking-tight"
              style={{ textShadow: "0 2px 40px rgba(0,0,0,0.55)" }}
            >
              Discover <em className="not-italic luxe-gold-shimmer">Extraordinary</em>
              <br /> Villas in Bali.
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } } }}
              className="mt-7 max-w-xl text-[15px] md:text-[18px] leading-relaxed text-luxe-fg/80"
            >
              AI-powered luxury villa experiences with immersive property intelligence
              and premium concierge services.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <button className="luxe-gold-btn rounded-full px-6 py-3.5 text-[13px] font-medium tracking-wide inline-flex items-center gap-2 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(200,169,107,0.6)]">
                Begin Your Stay <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button className="rounded-full px-5 py-3.5 text-[13px] font-medium tracking-wide bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-luxe-gold" /> Watch the Film
              </button>
            </motion.div>
          </motion.div>

          {/* Floating AI signal panel */}
          <motion.aside
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden md:block absolute right-10 top-44 w-[280px] luxe-glass-card rounded-2xl p-5 luxe-float"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="luxe-eyebrow">Live Signal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--luxe-emerald)] shadow-[0_0_12px_rgba(79,178,134,0.8)]" />
            </div>
            <div className="font-serif-l text-3xl mb-1">+12.7%</div>
            <div className="text-[11px] text-luxe-mut mb-4">Bali villa YoY appreciation</div>
            <div className="h-px bg-luxe-line mb-4" />
            <div className="space-y-2.5 text-[12px]">
              {[
                ["Uluwatu", "98% occupancy"],
                ["Canggu",  "Demand · High"],
                ["Ubud",    "+18% inquiries"],
              ].map(([a, b]) => (
                <div key={a} className="flex justify-between"><span className="text-luxe-fg/80">{a}</span><span className="text-luxe-gold">{b}</span></div>
              ))}
            </div>
          </motion.aside>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 md:mt-24"
          >
            <div className="relative">
              <div className="absolute -inset-px rounded-2xl md:rounded-full bg-gradient-to-r from-[color:var(--luxe-gold)]/25 via-transparent to-[color:var(--luxe-emerald)]/15 blur-md opacity-60 pointer-events-none" />
              <div className="relative luxe-glass-card rounded-2xl md:rounded-full p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
                <SearchField icon={MapPin} label="Where" value="Bali, Indonesia" />
                <div className="hidden md:block h-10 w-px bg-luxe-line" />
                <SearchField icon={Calendar} label="When" value="Add dates" />
                <div className="hidden md:block h-10 w-px bg-luxe-line" />
                <SearchField icon={Users} label="Guests" value="2 adults" />
                <button className="luxe-gold-btn rounded-xl md:rounded-full px-6 py-3.5 text-[13px] font-medium inline-flex items-center justify-center gap-2 md:ml-2 transition-transform duration-300 hover:-translate-y-0.5">
                  <Search className="w-4 h-4" /> Search Villas
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5 text-[12px] text-luxe-fg/65 min-h-[20px]" aria-live="polite">
              <Sparkles className="w-3.5 h-3.5 text-luxe-gold shrink-0" />
              <span className="font-mono-l text-[11px] text-luxe-mut">ASTRA suggests</span>
              <motion.span
                key={suggestIdx}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="truncate"
              >
                {SUGGESTIONS[suggestIdx]}
              </motion.span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {CHIPS.map((c, i) => (
                <motion.button
                  key={c}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[12px] px-3.5 py-1.5 rounded-full bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] hover:text-luxe-gold transition-all duration-300 hover:-translate-y-0.5"
                >
                  {c}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-luxe-mut">
          <span className="luxe-eyebrow text-[10px]">Scroll</span>
          <span className="luxe-cue inline-block w-px h-8 bg-gradient-to-b from-[color:var(--luxe-gold)] to-transparent" />
        </div>
      </section>

      <AtmosDivider tone="gold" />

      {/* ============== AI FEATURES STRIP ============== */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <SectionHead eyebrow="The Intelligence Layer" title={<>A villa platform that <em className="text-luxe-gold not-italic">thinks</em>.</>} />
          </Reveal>

          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 [perspective:1200px]">
            {AI_CARDS.map((c, i) => (
              <Reveal key={c.k} delay={i * 0.08}>
                <TiltCard className="luxe-glass-card luxe-card-glow rounded-2xl p-6 group hover:border-[color:var(--luxe-gold)] transition-all duration-500 will-change-transform">
                  <div className="flex items-center justify-between mb-8">
                    <c.icon className="w-5 h-5 text-luxe-gold transition-transform duration-500 group-hover:-translate-y-0.5" />
                    <span className="relative flex">
                      <span className="absolute inset-0 rounded-full bg-[color:var(--luxe-emerald)] luxe-pulse" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-[color:var(--luxe-emerald)]" />
                    </span>
                  </div>
                  <div className="font-serif-l text-4xl mb-2"><CountUp value={c.v} /></div>
                  <div className="text-[13px] text-luxe-fg/85">{c.k}</div>
                  <div className="text-[11px] text-luxe-mut mt-1">{c.sub}</div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AtmosDivider tone="emerald" />

      {/* ============== FEATURED VILLAS ============== */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="flex items-end justify-between gap-6 mb-14">
            <Reveal>
              <SectionHead eyebrow="The Collection" title={<>Hand-picked villas, <em className="not-italic text-luxe-gold">cinematically</em> rendered.</>} />
            </Reveal>
            <Reveal delay={0.15}>
              <a href="#" className="hidden md:inline-flex items-center gap-1.5 text-[12px] text-luxe-fg/70 hover:text-luxe-gold transition-colors">
                View all 142 villas <ChevronRight className="w-4 h-4" />
              </a>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 [perspective:1400px]">
            {FEATURED.map((v, i) => (
              <Reveal key={v.name} delay={i * 0.12} as="article">
                <TiltCard className="group relative overflow-hidden rounded-3xl border border-luxe bg-[#0a0a0a] luxe-card-glow shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] hover:shadow-[0_40px_80px_-30px_rgba(200,169,107,0.35)] transition-shadow duration-700 will-change-transform">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={v.img} alt={v.name} loading="lazy" width={1280} height={1600}
                         className="w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  {/* glass reflection sweep */}
                  <div aria-hidden className="pointer-events-none absolute -inset-x-1/4 -top-1/2 h-full rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                       style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase luxe-glass-card text-luxe-gold">{v.tag}</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button className="w-9 h-9 grid place-items-center rounded-full luxe-glass-card hover:text-luxe-gold hover:scale-110 transition-all duration-300" aria-label="Save">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute inset-x-4 bottom-4 luxe-glass-card rounded-2xl p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-700">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-serif-l text-xl leading-tight">{v.name}</h3>
                        <div className="text-[11px] text-luxe-mut mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {v.area}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif-l text-lg text-luxe-gold">{v.price}</div>
                        <div className="text-[10px] text-luxe-mut">/ night</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-luxe">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <Star className="w-3.5 h-3.5 fill-[color:var(--luxe-gold)] text-[color:var(--luxe-gold)]" />
                        <span>{v.rating}</span>
                        <span className="text-luxe-mut">· 124 stays</span>
                      </div>
                      <button className="text-[11px] inline-flex items-center gap-1 text-luxe-gold hover:gap-2 transition-all">
                        Explore in 3D <Box className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AtmosDivider tone="gold" />



      {/* ============== PROPERTY OS ============== */}
      <section className="relative py-28 md:py-40">
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(60% 50% at 50% 30%, rgba(200,169,107,0.08), transparent 70%)" }}
        />
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="luxe-eyebrow">The Property Operating System</span>
            <h2 className="font-serif-l text-[40px] md:text-[64px] leading-[1.02] mt-5 tracking-tight">
              One quiet interface for <em className="not-italic text-luxe-gold">every</em> villa decision.
            </h2>
            <div className="luxe-divider mt-10 max-w-xs mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-luxe-line rounded-3xl overflow-hidden border border-luxe">
            {OS_FEATURES.map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.06 }}
                className="bg-[#070808] p-8 md:p-10 group hover:bg-[#0b0e15] transition-colors"
              >
                <f.icon className="w-6 h-6 text-luxe-gold mb-8" />
                <h3 className="font-serif-l text-2xl mb-3 leading-tight">{f.t}</h3>
                <p className="text-[13px] leading-relaxed text-luxe-fg/65">{f.d}</p>
                <div className="mt-8 inline-flex items-center gap-1.5 text-[11px] text-luxe-mut group-hover:text-luxe-gold transition-colors">
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== COLLECTIONS / DESTINATION ============== */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <SectionHead eyebrow="Curated Worlds" title={<>Villa <em className="not-italic text-luxe-gold">collections</em>, shaped by intent.</>} />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLLECTIONS.map((c, i) => (
              <motion.a key={c.t} href="#"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
                className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-luxe block">
                <img src={c.img} alt={c.t} loading="lazy" width={1280} height={1600}
                     className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-6 bottom-6">
                  <div className="luxe-eyebrow mb-2">{c.c}</div>
                  <h3 className="font-serif-l text-3xl">{c.t}</h3>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-luxe-gold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
                    Enter collection <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <AtmosDivider tone="cool" />

      {/* ============== CONCIERGE / INVESTOR DASHBOARD PREVIEW ============== */}
      <section className="relative py-28 md:py-40">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <span className="luxe-eyebrow">Investor Layer</span>
              <h2 className="font-serif-l text-[36px] md:text-[56px] leading-[1.02] mt-5 tracking-tight">
                Your private <em className="not-italic text-luxe-gold">villa portfolio</em>, always lit.
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-luxe-fg/70 max-w-lg">
                Real-time occupancy, yield, and demand. Predictive pricing tuned nightly.
                A concierge that speaks five languages and never sleeps.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
                {[
                  ["98.4%", "AI match accuracy"],
                  ["9.6%", "Avg net yield"],
                  ["24/7", "Concierge desk"],
                  ["142", "Verified villas"],
                ].map(([v, k], i) => (
                  <Reveal key={k} delay={0.1 + i * 0.08}>
                    <div className="luxe-glass-card luxe-card-glow rounded-xl p-4 hover:-translate-y-0.5 transition-transform duration-500">
                      <div className="font-serif-l text-2xl text-luxe-gold"><CountUp value={v} /></div>
                      <div className="text-[11px] text-luxe-mut mt-1">{k}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <button className="luxe-gold-btn mt-10 rounded-full px-6 py-3.5 text-[13px] font-medium inline-flex items-center gap-2 transition-transform duration-300 hover:-translate-y-0.5">
                Open the Investor OS <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>

          {/* Mock dashboard panel */}
          <Reveal delay={0.15}>
            <div className="relative [perspective:1400px]">
              <TiltCard className="luxe-glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_50px_120px_-40px_rgba(0,0,0,0.8)] will-change-transform">
                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full luxe-bloom-a"
                     style={{ background: "radial-gradient(circle, rgba(200,169,107,0.28), transparent 70%)" }} />
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="relative flex">
                      <span className="absolute inset-0 rounded-full bg-[color:var(--luxe-emerald)] luxe-pulse" />
                      <span className="relative w-2 h-2 rounded-full bg-[color:var(--luxe-emerald)] shadow-[0_0_10px_rgba(79,178,134,0.8)]" />
                    </span>
                    <span className="text-[11px] font-mono-l text-luxe-mut">PORTFOLIO · LIVE</span>
                  </div>
                  <span className="text-[11px] text-luxe-mut">Bali · IDR</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    ["Net Yield", "9.6%", "var(--luxe-emerald)"],
                    ["Occupancy", "92%", "var(--luxe-gold)"],
                    ["ADR", "$2,310", "var(--luxe-cyan)"],
                  ].map(([k, v, color]) => (
                    <div key={k} className="rounded-xl bg-[#0a0d14] border border-luxe p-4 hover:border-[color:var(--luxe-gold)] transition-colors duration-500">
                      <div className="text-[10px] text-luxe-mut uppercase tracking-wider">{k}</div>
                      <div className="font-serif-l text-2xl mt-2" style={{ color: color as string }}><CountUp value={v} /></div>
                    </div>
                  ))}
                </div>

                {/* Animated chart */}
                <div className="rounded-xl bg-[#0a0d14] border border-luxe p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-luxe-mut uppercase tracking-wider">12-mo Forecast</span>
                    <span className="text-[11px] text-luxe-gold"><CountUp value="+12.7%" /></span>
                  </div>
                  <svg viewBox="0 0 320 80" className="w-full h-20">
                    <defs>
                      <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#C8A96B" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#C8A96B" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0 60 L30 50 L60 55 L90 40 L120 45 L150 32 L180 38 L210 24 L240 30 L270 18 L300 22 L320 10 L320 80 L0 80 Z"
                      fill="url(#g)"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                      viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.6 }}
                    />
                    <motion.path
                      d="M0 60 L30 50 L60 55 L90 40 L120 45 L150 32 L180 38 L210 24 L240 30 L270 18 L300 22 L320 10"
                      fill="none" stroke="#C8A96B" strokeWidth="1.5"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }} transition={{ duration: 2, ease: EASE }}
                    />
                  </svg>
                </div>

                <div className="mt-6 flex items-center justify-between text-[11px] text-luxe-mut">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[color:var(--luxe-emerald)] luxe-pulse" />
                    Updated 2s ago
                  </span>
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[color:var(--luxe-emerald)]" /> Encrypted</span>
                </div>
              </TiltCard>
            </div>
          </Reveal>
        </div>
      </section>

      <AtmosDivider tone="gold" />



      {/* ============== TESTIMONIAL ============== */}
      <section className="relative py-28 md:py-40">
        <div className="mx-auto max-w-4xl px-5 md:px-10 text-center">
          <span className="luxe-eyebrow">Whispered Praise</span>
          <blockquote className="font-serif-l text-[28px] md:text-[44px] leading-[1.15] mt-8 tracking-tight">
            “The closest thing to a private architect, a market analyst,
            and a Bali insider — <em className="text-luxe-gold not-italic">in one quiet room.</em>”
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-3 text-[12px] text-luxe-mut">
            <div className="w-8 h-8 rounded-full bg-luxe-glass border border-luxe" />
            <span>Amira Lestari · Family Office, Singapore</span>
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative py-28 md:py-36">
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div className="relative overflow-hidden rounded-[32px] border border-luxe luxe-grain"
               style={{ background: "linear-gradient(135deg, #0B1220 0%, #050505 70%)" }}>
            <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full"
                 style={{ background: "radial-gradient(circle, rgba(200,169,107,0.22), transparent 70%)" }} />
            <div className="relative p-10 md:p-20 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
              <div>
                <span className="luxe-eyebrow">Begin</span>
                <h2 className="font-serif-l text-[36px] md:text-[60px] leading-[1.02] mt-5 tracking-tight">
                  Your villa story <em className="not-italic text-luxe-gold">starts</em> with one search.
                </h2>
                <p className="mt-6 text-[14px] md:text-[16px] text-luxe-fg/70 max-w-xl">
                  Step inside the AI Property OS for Bali — built for those who choose by intuition,
                  guided by intelligence.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button className="luxe-gold-btn rounded-full px-6 py-4 text-[13px] font-medium inline-flex items-center justify-center gap-2">
                  Find My Villa <ArrowUpRight className="w-4 h-4" />
                </button>
                <button className="rounded-full px-6 py-4 text-[13px] font-medium bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-colors inline-flex items-center justify-center gap-2">
                  <Bot className="w-4 h-4 text-luxe-gold" /> Speak to AI Concierge
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="relative pt-20 pb-32 md:pb-16 border-t border-luxe">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full grid place-items-center"
                     style={{ background: "linear-gradient(135deg,#C8A96B,#8C6B2F)" }}>
                  <span className="font-serif-l text-[15px] text-black">A</span>
                </div>
                <span className="font-serif-l text-[18px]">Astra<span className="text-luxe-gold"> Villa</span></span>
              </div>
              <p className="mt-5 text-[12px] text-luxe-mut max-w-xs leading-relaxed">
                The AI Property Operating System for Bali. Quiet luxury, told in code and light.
              </p>
            </div>
            {[
              ["Discover", ["Villas", "Collections", "Destinations", "Editorial"]],
              ["Platform", ["Investor OS", "3D Tours", "Concierge", "Analytics"]],
              ["Astra", ["About", "Press", "Careers", "Contact"]],
            ].map(([h, items]) => (
              <div key={h as string}>
                <div className="luxe-eyebrow mb-5">{h as string}</div>
                <ul className="space-y-3 text-[13px] text-luxe-fg/75">
                  {(items as string[]).map(i => <li key={i}><a href="#" className="hover:text-luxe-gold transition-colors">{i}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-6 border-t border-luxe flex flex-col md:flex-row justify-between gap-3 text-[11px] text-luxe-mut font-mono-l">
            <span>© MMXXVI ASTRA VILLA · Denpasar · Bali</span>
            <span>Crafted with intention. Powered by AI.</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <span className="luxe-eyebrow">{eyebrow}</span>
      <h2 className="font-serif-l text-[36px] md:text-[56px] leading-[1.02] mt-5 tracking-tight">{title}</h2>
    </div>
  );
}

function SearchField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <button className="flex-1 flex items-center gap-3 px-5 py-3 rounded-xl md:rounded-full hover:bg-white/5 transition-colors text-left">
      <Icon className="w-4 h-4 text-luxe-gold shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-luxe-mut">{label}</div>
        <div className="text-[13px] truncate">{value}</div>
      </div>
    </button>
  );
}

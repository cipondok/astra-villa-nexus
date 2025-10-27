import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import slide1 from "@/assets/home/slide-1.webp";
import slide2 from "@/assets/home/slide-2.webp";
import slide3 from "@/assets/home/slide-3.webp";
import jakartaSkyline from "@/assets/jakarta-skyline-real.jpg";

interface HomeIntroSliderProps {
  className?: string;
  language?: "en" | "id";
  children?: React.ReactNode;
}

interface SlideItem {
  title: string;
  subtitle: string;
  cta?: { label: string; href: string }[];
  bg: string;
  alt: string;
}

const slidesId: SlideItem[] = [
  {
    title: "Layanan 3D Virtual Tour Properti Pertama di Indonesia",
    subtitle: "Perkenalkan ASTRA — platform all‑in‑one untuk pemasaran properti modern.",
    cta: [
      { label: "Lihat Demo 3D", href: "/3d-showcase" },
      { label: "Layanan & Harga", href: "/services" },
    ],
    bg: slide1,
    alt: "Hero latar villa modern untuk 3D virtual tour properti Indonesia",
  },
  {
    title: "All‑in‑One: Desain, Render 3D, Virtual Staging, Hosting",
    subtitle: "Tim profesional, proses cepat, hasil berkualitas untuk penjualan dan sewa.",
    cta: [
      { label: "Jelajahi Fitur", href: "/3d-showcase" },
      { label: "Hubungi Tim", href: "/services" },
    ],
    bg: slide2,
    alt: "Interior modern minimalis untuk layanan desain dan virtual staging ASTRA",
  },
  {
    title: "Tingkatkan Konversi Listing dengan 3D Interaktif",
    subtitle: "Tampilkan denah, dimensi, dan tur imersif agar calon pembeli yakin lebih cepat.",
    cta: [
      { label: "Mulai Sekarang", href: "/services" },
    ],
    bg: slide3,
    alt: "Pemandangan balkon apartemen kota, cocok sebagai latar tur 3D",
  },
]; 

const slidesEn: SlideItem[] = [
  {
    title: "Indonesia’s First 3D Virtual Property Tour Service",
    subtitle: "Meet ASTRA — an all-in-one platform for modern property marketing.",
    cta: [
      { label: "View 3D Demo", href: "/3d-showcase" },
      { label: "Services & Pricing", href: "/services" },
    ],
    bg: slide1,
    alt: "Modern villa hero background for Indonesia 3D virtual property tours",
  },
  {
    title: "All‑in‑One: Design, 3D Render, Virtual Staging, Hosting",
    subtitle: "Pro team, fast process, premium results for sales and rentals.",
    cta: [
      { label: "Explore Features", href: "/3d-showcase" },
      { label: "Contact Team", href: "/services" },
    ],
    bg: slide2,
    alt: "Modern minimalist interior for ASTRA design and virtual staging services",
  },
  {
    title: "Boost Listing Conversions with Interactive 3D",
    subtitle: "Show floor plans, dimensions, and immersive tours to build buyer confidence faster.",
    cta: [
      { label: "Get Started", href: "/services" },
    ],
    bg: slide3,
    alt: "City apartment balcony view, perfect as a 3D tour backdrop",
  },
];

const HomeIntroSlider: React.FC<HomeIntroSliderProps> = ({ className, language = 'en', children }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const copy = {
    en: { sectionAria: "Intro 3D Virtual Tour", prev: "Prev", next: "Next" },
    id: { sectionAria: "Intro Tur Virtual 3D", prev: "Sebelumnya", next: "Berikutnya" }
  } as const;
  const t = copy[language];
  const slides = language === 'id' ? slidesId : slidesEn;
  const total = slides.length;
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // Track desktop breakpoint for auto-rotate enabling
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    onChange();
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Lock initial height on mobile to prevent URL bar resize jumping
  useEffect(() => {
    const applyHeight = () => {
      if (!isDesktop) {
        setFixedHeight(280); // Fixed 280px height on mobile (smaller)
      } else {
        setFixedHeight(null);
      }
    };
    applyHeight();
    const onOrientation = () => applyHeight();
    const onResize = () => applyHeight();
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('resize', onResize);
    };
  }, [isDesktop]);

  // Auto-rotate only on desktop, when visible, and not scrolling
  useEffect(() => {
    if (paused || !inView || !isDesktop) return;
    const id = window.setInterval(next, 5000);
    return () => window.clearInterval(id);
  }, [paused, inView, isDesktop]);

  // Observe visibility within viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Pause while user scrolls
  useEffect(() => {
    let timeout: number | undefined;
    const onScroll = () => {
      setPaused(true);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setPaused(false), 800);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timeout);
    };
  }, []);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const current = useMemo(() => slides[index], [index]);

  return (
    <section
      ref={sectionRef as any}
      onPointerDown={() => {
        setPaused(true);
        window.setTimeout(() => setPaused(false), 6000);
      }}
      className={cn(
        "relative w-full overflow-hidden bg-background overscroll-none touch-pan-y",
        "min-h-[300px]", // Prevent collapse during load
        className
      )}
      style={{ 
        contain: 'layout',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        height: fixedHeight ? `${fixedHeight}px` : undefined
      }} // Optimize layout and prevent repaints
      aria-label={t.sectionAria}
    >
      {/* 3D Background Animation */}
      <div className="absolute inset-0 z-0">
        <img 
          src={jakartaSkyline} 
          alt="Jakarta City Skyline at Night" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none" />
      </div>

      {/* Content - Hidden temporarily */}
      <div className="relative z-10 h-full flex items-center justify-center px-6 hidden">
        <article key={index} className="max-w-5xl mx-auto text-center animate-fade-in motion-reduce:animate-none">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight animate-fade-in motion-reduce:animate-none"
            style={{ animationDelay: "80ms" }}
          >
            {current.title}
          </h1>
          <p
            className="mt-4 text-base md:text-lg text-muted-foreground animate-fade-in motion-reduce:animate-none"
            style={{ animationDelay: "140ms" }}
          >
            {current.subtitle}
          </p>

          {current.cta && (
            <div
              className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-fade-in motion-reduce:animate-none"
              style={{ animationDelay: "200ms" }}
            >
              {current.cta.map((c, i) => (
                <Button
                  key={i}
                  asChild
                  variant={i === 0 ? "default" : "outline"}
                  className="hover-scale"
                >
                  <a href={c.href}>{c.label}</a>
                </Button>
              ))}
            </div>
          )}
        </article>
      </div>

      {/* Search Panel Overlay - Centered */}
      {children && (
        <div className="absolute top-1/2 left-0 right-0 z-20 px-4 -translate-y-1/2 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="w-full mx-auto">
            {children}
          </div>
        </div>
      )}

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              i === index ? "bg-primary w-6" : "bg-foreground/30 hover:bg-foreground/50"
            )}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
          />
        ))}
      </div>

      {/* Prev/Next */}
      <div className="absolute inset-y-0 left-0 right-0 z-10 hidden md:flex items-center justify-between px-2 md:px-4">
        <button
          onClick={prev}
          className="rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 px-4 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
          aria-label="Prev slide"
        >
          Prev
        </button>
        <button
          onClick={next}
          className="rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 px-4 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
          aria-label="Next slide"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default HomeIntroSlider;

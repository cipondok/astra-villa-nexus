import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import slide1 from "@/assets/home/slide-1.webp";
import slide2 from "@/assets/home/slide-2.webp";
import slide3 from "@/assets/home/slide-3.webp";

interface HomeIntroSliderProps {
  className?: string;
}

interface SlideItem {
  title: string;
  subtitle: string;
  cta?: { label: string; href: string }[];
  bg: string;
  alt: string;
}

const slides: SlideItem[] = [
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

const HomeIntroSlider: React.FC<HomeIntroSliderProps> = ({ className }) => {
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(false);

  const total = slides.length;
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // Auto-rotate
  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, []);

  // Flash effect when slide changes
  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 250);
    return () => clearTimeout(t);
  }, [index]);

  const current = useMemo(() => slides[index], [index]);

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-background",
        className
      )}
      aria-label="Intro 3D Virtual Tour"
    >
      {/* Background image layer with crossfade */}
      <div className="absolute inset-0 z-0">
        {slides.map((s, i) => (
          <img
            key={i}
            src={s.bg}
            alt={s.alt}
            decoding="async"
            loading={i === 0 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/60" />
        {/* Light streak accent */}
        <div className="pointer-events-none absolute -inset-x-1/2 -top-1/2 h-[150%] rotate-12 opacity-30 mix-blend-screen">
          <div className="h-full w-[40%] bg-gradient-to-r from-primary/30 via-white/40 to-transparent blur-2xl pulse" />
        </div>
        {/* Flash overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-white/60 transition-opacity duration-200",
            flash ? "opacity-60" : "opacity-0"
          )}
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
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
          className="rounded-full bg-background/60 backdrop-blur border px-3 py-2 text-sm hover:bg-background"
          aria-label="Prev slide"
        >
          Prev
        </button>
        <button
          onClick={next}
          className="rounded-full bg-background/60 backdrop-blur border px-3 py-2 text-sm hover:bg-background"
          aria-label="Next slide"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default HomeIntroSlider;

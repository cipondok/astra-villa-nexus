import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HomeIntroSliderProps {
  className?: string;
}

interface SlideItem {
  title: string;
  subtitle: string;
  cta?: { label: string; href: string }[];
}

const slides: SlideItem[] = [
  {
    title: "Layanan 3D Virtual Tour Properti Pertama di Indonesia",
    subtitle: "Perkenalkan ASTRA — platform all‑in‑one untuk pemasaran properti modern.",
    cta: [
      { label: "Lihat Demo 3D", href: "/3d-showcase" },
      { label: "Layanan & Harga", href: "/services" },
    ],
  },
  {
    title: "All‑in‑One: Desain, Render 3D, Virtual Staging, Hosting",
    subtitle: "Tim profesional, proses cepat, hasil berkualitas untuk penjualan dan sewa.",
    cta: [
      { label: "Jelajahi Fitur", href: "/3d-showcase" },
      { label: "Hubungi Tim", href: "/services" },
    ],
  },
  {
    title: "Tingkatkan Konversi Listing dengan 3D Interaktif",
    subtitle: "Tampilkan denah, dimensi, dan tur imersif agar calon pembeli yakin lebih cepat.",
    cta: [
      { label: "Mulai Sekarang", href: "/services" },
    ],
  },
];

const HomeIntroSlider: React.FC<HomeIntroSliderProps> = ({ className }) => {
  const [index, setIndex] = useState(0);

  const total = slides.length;
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // Auto-rotate
  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, []);

  const current = useMemo(() => slides[index], [index]);

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-gradient-to-br from-primary/15 via-background to-background",
        className
      )}
      aria-label="Intro 3D Virtual Tour"
    >
      {/* Slides container */}
      <div className="absolute inset-0">
        {/* Simple dot grid backdrop */}
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" className="fill-primary/20" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <article className="max-w-5xl mx-auto text-center animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            {current.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            {current.subtitle}
          </p>

          {current.cta && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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

      {/* Controls */}
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
          />)
        )}
      </div>

      {/* Prev/Next buttons */}
      <div className="absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between px-2 md:px-4">
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

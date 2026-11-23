import { useEffect } from "react";
import heroImg from "@/assets/home/slide-1.webp";
import { reosTokens } from "@/components/reos/ReosShell";
import { useTranslation } from "@/i18n/useTranslation";
import { HomeSearchPanel } from "@/components/home/market/HomeSearchPanel";
import { CategoryShortcuts } from "@/components/home/market/CategoryShortcuts";
import { FeaturedListingsSection } from "@/components/home/market/FeaturedListingsSection";
import { PopularLocations } from "@/components/home/market/PopularLocations";
import { ListingCtaBand } from "@/components/home/market/ListingCtaBand";

/* ============================================================
   ASTRA Villa — Homepage (ASTRA Signature marketplace)
   Photo-led, search-first. Header and footer are the shared
   ReosHeader / ReosFooter rendered in App.tsx; title and meta
   description come from <LocalizedHead /> (seo.home).
   ============================================================ */

export default function AstraReosHome() {
  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute("data-reos-theme", "on");
    return () => document.documentElement.removeAttribute("data-reos-theme");
  }, []);

  return (
    <>
      <style>{reosTokens}</style>
      <div className="reos min-h-screen">
        {/* ===== HERO ===== */}
        <section aria-labelledby="home-hero-heading" className="relative isolate">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img
              src={heroImg}
              alt={t("marketHome.hero.photoAlt", "Rumah modern dengan kolam renang dan taman tropis saat matahari terbenam")}
              width={1536}
              height={864}
              decoding="async"
              {...({ fetchpriority: "high" } as Record<string, string>)}
              className="h-full w-full object-cover object-[60%_center]"
            />
            <div className="absolute inset-0" style={{ background: "var(--photo-scrim)" }} />
            <div className="absolute inset-0 hidden md:block" style={{ background: "var(--photo-scrim-side)" }} />
          </div>

          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-12 pb-8 sm:pt-20 md:pt-24 md:pb-12 lg:pt-28">
            <div className="max-w-2xl" style={{ color: "var(--on-photo)" }}>
              <p className="text-[11px] sm:text-[12px] font-semibold tracking-[0.24em]" style={{ color: "var(--gold)" }}>
                {t("marketHome.hero.eyebrow", "MARKETPLACE PROPERTI INDONESIA")}
              </p>
              <h1 id="home-hero-heading" className="mk-display mt-3 text-[34px] min-[390px]:text-[38px] sm:text-[48px] lg:text-[58px] leading-[1.08]">
                {t("marketHome.hero.title", "Temukan Properti Impian Anda")}
              </h1>
              <p className="mt-3 sm:mt-4 max-w-xl text-[15px] sm:text-[17px] leading-relaxed" style={{ color: "var(--on-photo-2)" }}>
                {t("marketHome.hero.subtitle", "Jelajahi rumah, villa, apartemen, tanah, dan properti komersial di seluruh Indonesia.")}
              </p>
            </div>

            <div className="mt-7 sm:mt-10 max-w-[1100px]">
              <h2 className="sr-only">{t("marketHome.search.label", "Cari properti")}</h2>
              <HomeSearchPanel />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
          <CategoryShortcuts />
          <FeaturedListingsSection />
          <PopularLocations />
          <ListingCtaBand />
        </div>
      </div>
    </>
  );
}

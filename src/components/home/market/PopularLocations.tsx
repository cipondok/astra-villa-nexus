import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import jakarta from "@/assets/locations/jakarta.webp";
import bali from "@/assets/locations/bali.webp";
import bandung from "@/assets/locations/bandung.webp";
import surabaya from "@/assets/locations/surabaya.webp";
import yogyakarta from "@/assets/locations/yogyakarta.webp";
import lombok from "@/assets/locations/lombok.webp";

const LOCATIONS = [
  { name: "Jakarta", image: jakarta, alt: "Gedung pencakar langit Jakarta saat senja" },
  { name: "Bali", image: bali, alt: "Villa di tebing tepi laut Bali saat matahari terbenam" },
  { name: "Bandung", image: bandung, alt: "Perumahan di dataran tinggi Bandung dengan latar pegunungan" },
  { name: "Surabaya", image: surabaya, alt: "Kota Surabaya dan jembatan di atas selat saat senja" },
  { name: "Yogyakarta", image: yogyakarta, alt: "Candi di Yogyakarta saat matahari terbit dengan gunung di kejauhan" },
  { name: "Lombok", image: lombok, alt: "Pantai berpasir putih dan perbukitan hijau di Lombok" },
];

export function PopularLocations() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="home-locations-heading">
      <div className="mb-5 sm:mb-6">
        <h2 id="home-locations-heading" className="mk-display text-[26px] sm:text-[32px] leading-tight text-[var(--text)]">
          {t("marketHome.locations.title", "Jelajahi Lokasi Populer")}
        </h2>
        <p className="mt-1.5 text-[14px] sm:text-[15px] text-[var(--text-2)]">
          {t("marketHome.locations.subtitle", "Mulai pencarian dari kota dan destinasi favorit di Indonesia.")}
        </p>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {LOCATIONS.map((loc, i) => (
          <li key={loc.name} className={i === 0 || i === 5 ? "lg:col-span-2" : ""}>
            <Link
              to={`/properties?location=${encodeURIComponent(loc.name)}`}
              className="mk-focus group relative block h-full aspect-[4/3] lg:aspect-auto lg:h-[230px] overflow-hidden rounded-2xl border border-[var(--line)]"
            >
              <img
                src={loc.image}
                alt={loc.alt}
                width={720}
                height={540}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span aria-hidden="true" className="absolute inset-0" style={{ background: "var(--tile-scrim)" }} />
              <span className="absolute left-4 right-4 bottom-3.5 flex items-end justify-between gap-2" style={{ color: "var(--on-photo)" }}>
                <span>
                  <span className="mk-display block text-[20px] sm:text-[24px] leading-tight">{loc.name}</span>
                  <span className="block text-[12px] sm:text-[13px]" style={{ color: "var(--on-photo-2)" }}>{t("marketHome.locations.explore", "Lihat properti")}</span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

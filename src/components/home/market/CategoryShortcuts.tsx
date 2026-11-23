import { Link } from "react-router-dom";
import { Home, Palmtree, Building2, Trees, Store, Hotel } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

const CATEGORIES = [
  { key: "house", fallback: "Rumah", icon: Home, to: "/properties?type=house" },
  { key: "villa", fallback: "Villa", icon: Palmtree, to: "/properties?type=villa" },
  { key: "apartment", fallback: "Apartemen", icon: Building2, to: "/properties?type=apartment" },
  { key: "land", fallback: "Tanah", icon: Trees, to: "/properties?type=land" },
  { key: "commercial", fallback: "Komersial", icon: Store, to: "/properties?type=commercial" },
  { key: "hotel", fallback: "Hotel & Resort", icon: Hotel, to: "/properties?type=hotel" },
];

export function CategoryShortcuts() {
  const { t } = useTranslation();
  return (
    <nav aria-labelledby="home-categories-heading">
      <h2 id="home-categories-heading" className="sr-only">{t("marketHome.categories.title", "Cari berdasarkan kategori")}</h2>
      <ul className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
        {CATEGORIES.map(({ key, fallback, icon: Icon, to }) => (
          <li key={key}>
            <Link
              to={to}
              className="mk-focus group h-full min-h-[88px] flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-2 py-3 text-center transition-colors hover:border-[var(--line-strong)]"
            >
              <span className="h-10 w-10 rounded-full bg-[var(--gold-soft)] border border-[var(--line-gold)] inline-flex items-center justify-center">
                <Icon className="h-5 w-5 reos-gold" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="text-[13px] sm:text-[14px] font-medium leading-tight text-[var(--text)]">{t(`marketHome.categories.${key}`, fallback)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

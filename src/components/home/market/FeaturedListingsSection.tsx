import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bath, BedDouble, Heart, Info, Loader2, MapPin, Maximize, RefreshCw } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { ReosAuthModal } from "@/components/auth/ReosAuthModal";
import { formatRupiahShort, useFeaturedListings, type FeaturedListing } from "@/hooks/useFeaturedListings";
import { PROPERTY_TYPES } from "@/lib/propertySearch";

const typeName = (id: string | null, t: (key: string, fallback?: string) => string) => {
  const match = PROPERTY_TYPES.find((p) => p.id === (id || "").toLowerCase());
  if (match) return t(`marketHome.types.${match.id}`, match.label);
  return id ? id[0].toUpperCase() + id.slice(1) : "";
};

function ListingCard({
  l, saved, onToggleSave, busy,
}: { l: FeaturedListing; saved: boolean; onToggleSave: () => void; busy: boolean }) {
  const { t } = useTranslation();
  const price = formatRupiahShort(l.price);
  const titleId = `featured-${l.id}`;
  return (
    <article aria-labelledby={titleId} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-colors hover:border-[var(--line-strong)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--inset)]">
        <img
          src={l.image}
          alt={`${typeName(l.propertyType, t)} ${l.title}${l.place ? `, ${l.place}` : ""}`}
          width={480}
          height={360}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {l.isDemo && (
            <span title={t("marketHome.featured.demoTitle", "Contoh listing untuk demonstrasi")} className="rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">
              {t("marketHome.featured.demo", "DEMO")}
            </span>
          )}
          {l.listingType && (
            <span className="rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--gold-fg)]">
              {l.listingType === "rent" ? t("marketHome.featured.forRent", "Disewa") : t("marketHome.featured.forSale", "Dijual")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          disabled={busy}
          aria-pressed={saved}
          aria-label={`${saved ? t("marketHome.featured.unsave", "Hapus dari favorit") : t("marketHome.featured.save", "Simpan ke favorit")}: ${l.title}`}
          className="mk-focus absolute top-2 right-2 h-11 w-11 rounded-full bg-[var(--surface)] border border-[var(--line)] inline-flex items-center justify-center hover:border-[var(--line-strong)] disabled:opacity-60"
        >
          <Heart className={`h-[18px] w-[18px] ${saved ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[var(--text)]"}`} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-[18px] font-semibold text-[var(--text)] reos-gold">
          {price || <span className="text-[14px] font-medium text-[var(--text-2)]">{t("marketHome.featured.priceOnRequest", "Harga atas permintaan")}</span>}
        </div>
        <h3 id={titleId} className="text-[15px] font-semibold leading-snug text-[var(--text)] line-clamp-2">{l.title}</h3>
        {l.place && (
          <p className="flex items-center gap-1.5 text-[13px] text-[var(--text-2)] min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> <span className="truncate">{l.place}</span>
          </p>
        )}
        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-[var(--line)] text-[12.5px] text-[var(--text-2)]">
          {l.bedrooms != null && (
            <li className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" aria-hidden="true" />{l.bedrooms}<span className="sr-only"> {t("marketHome.featured.bedrooms", "kamar tidur")}</span></li>
          )}
          {l.bathrooms != null && (
            <li className="inline-flex items-center gap-1.5"><Bath className="h-3.5 w-3.5" aria-hidden="true" />{l.bathrooms}<span className="sr-only"> {t("marketHome.featured.bathrooms", "kamar mandi")}</span></li>
          )}
          {l.buildingArea != null && (
            <li className="inline-flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5" aria-hidden="true" />{l.buildingArea} m²<span className="sr-only"> {t("marketHome.featured.building", "luas bangunan")}</span></li>
          )}
          {l.landArea != null && (
            <li className="inline-flex items-center gap-1.5">{t("marketHome.featured.landShort", "LT")} {l.landArea} m²<span className="sr-only"> {t("marketHome.featured.land", "luas tanah")}</span></li>
          )}
        </ul>
        <Link
          to={l.href}
          className="mk-focus mt-2 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--line-strong)] px-4 text-[13.5px] font-semibold text-[var(--text)] hover:bg-[var(--gold-soft)]"
        >
          {t("marketHome.featured.details", "Lihat detail")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">: {l.title}</span>
        </Link>
      </div>
    </article>
  );
}

export function FeaturedListingsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data = [], isLoading, isError, refetch, isFetching } = useFeaturedListings();
  const { favorites, toggleFavorite, loading: favBusy } = useFavorites();
  const [showAuth, setShowAuth] = useState(false);
  const anyDemo = data.some((l) => l.isDemo);

  const onSave = (id: string) => {
    if (!user) { setShowAuth(true); return; }
    void toggleFavorite(id);
  };

  return (
    <section aria-labelledby="home-featured-heading" aria-busy={isLoading}>
      <div className="mb-5 sm:mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="home-featured-heading" className="mk-display text-[26px] sm:text-[32px] leading-tight text-[var(--text)]">
            {t("marketHome.featured.title", "Properti Pilihan")}
          </h2>
          <p className="mt-1.5 text-[14px] sm:text-[15px] text-[var(--text-2)]">
            {t("marketHome.featured.subtitle", "Listing aktif dengan foto dari katalog ASTRA Villa.")}
          </p>
        </div>
        <Link to="/properties" className="mk-focus inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-[14px] font-semibold reos-gold hover:underline">
          {t("marketHome.featured.viewAll", "Lihat semua")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {anyDemo && (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--line-gold)] bg-[var(--gold-soft)] px-3.5 py-2.5 text-[13px] text-[var(--text-2)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 reos-gold" aria-hidden="true" />
          {t("marketHome.featured.demoNotice", "Listing yang ditandai DEMO adalah contoh untuk demonstrasi platform, bukan properti yang benar-benar tersedia.")}
        </p>
      )}

      {isLoading ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label={t("marketHome.featured.loading", "Memuat listing…")}>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="aspect-[4/3] bg-[var(--inset)] animate-pulse" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-1/3 rounded bg-[var(--inset)] animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-[var(--inset)] animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-[var(--inset)] animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div role="alert" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
          <p className="text-[14px] text-[var(--text-2)]">{t("marketHome.featured.error", "Listing tidak dapat dimuat.")}</p>
          <button type="button" onClick={() => refetch()} className="mk-focus mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line-strong)] px-4 text-[14px] font-semibold text-[var(--text)]">
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
            {t("marketHome.featured.retry", "Coba lagi")}
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center text-[14px] text-[var(--text-2)]">
          {t("marketHome.featured.empty", "Belum ada listing dengan foto untuk ditampilkan.")}
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.map((l) => (
            <li key={l.id}>
              <ListingCard l={l} saved={!!user && favorites.has(l.id)} onToggleSave={() => onSave(l.id)} busy={favBusy} />
            </li>
          ))}
        </ul>
      )}

      <ReosAuthModal open={showAuth} onOpenChange={setShowAuth} initialMode="login" />
    </section>
  );
}

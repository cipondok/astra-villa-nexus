import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export function ListingCtaBand() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="home-cta-heading" className="rounded-2xl border border-[var(--line-gold)] bg-[var(--bg-2)] px-5 py-6 sm:px-8 sm:py-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="max-w-2xl">
        <h2 id="home-cta-heading" className="mk-display text-[22px] sm:text-[26px] leading-tight text-[var(--text)]">
          {t("marketHome.cta.title", "Punya properti untuk dijual atau disewakan?")}
        </h2>
        <p className="mt-1.5 text-[14px] text-[var(--text-2)]">
          {t("marketHome.cta.text", "Pasang iklan di ASTRA Villa dan tampilkan properti Anda kepada pencari properti.")}
        </p>
      </div>
      <Link to="/add-property" className="mk-focus shrink-0 h-12 px-6 rounded-xl reos-cta text-[15px] inline-flex items-center justify-center gap-2">
        <Plus className="h-4 w-4" aria-hidden="true" /> {t("marketHome.cta.button", "Pasang Iklan")}
      </Link>
    </section>
  );
}

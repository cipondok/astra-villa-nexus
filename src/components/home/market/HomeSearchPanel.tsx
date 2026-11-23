import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { LocationCombobox } from "./LocationCombobox";
import {
  BEDROOM_OPTIONS, PROPERTY_TYPES, buildPropertySearchUrl, priceRangesFor, type SearchTab,
} from "@/lib/propertySearch";

const TABS: { id: SearchTab; key: string; fallback: string }[] = [
  { id: "buy", key: "marketHome.search.tabBuy", fallback: "Beli" },
  { id: "rent", key: "marketHome.search.tabRent", fallback: "Sewa" },
  { id: "new", key: "marketHome.search.tabNew", fallback: "Properti Baru" },
];

/** Homepage search: Beli / Sewa / Properti Baru → the existing listings pages and their URL filters. */
export function HomeSearchPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SearchTab>("buy");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const changeTab = (next: SearchTab) => {
    setTab(next);
    // Sale and rent use different price ranges.
    if ((next === "rent") !== (tab === "rent")) setPrice("");
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const n = e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : (i + dir + TABS.length) % TABS.length;
    changeTab(TABS[n].id);
    tabRefs.current[n]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(buildPropertySearchUrl({ tab, location, type, price, beds }));
  };

  const priceOptions = priceRangesFor(tab === "rent" ? "rent" : "sale");

  return (
    <div className="mk-search rounded-2xl border border-[var(--line-gold)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
      <div role="tablist" aria-label={t("marketHome.search.tabsLabel", "Jenis pencarian")} className="flex gap-1 px-3 sm:px-4 pt-3 border-b border-[var(--line)]">
        {TABS.map((tb, i) => {
          const selected = tab === tb.id;
          return (
            <button
              key={tb.id}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`home-search-tab-${tb.id}`}
              aria-selected={selected}
              aria-controls="home-search-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => changeTab(tb.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`mk-focus relative h-11 px-3 sm:px-4 text-[14px] font-semibold rounded-t-lg transition-colors ${selected ? "text-[var(--text)]" : "text-[var(--text-2)] hover:text-[var(--text)]"}`}
            >
              {t(tb.key, tb.fallback)}
              {selected && <span aria-hidden="true" className="absolute left-3 right-3 -bottom-px h-[2px] rounded-full bg-[var(--gold)]" />}
            </button>
          );
        })}
      </div>

      <form
        id="home-search-panel"
        role="tabpanel"
        aria-labelledby={`home-search-tab-${tab}`}
        onSubmit={submit}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] gap-3 p-3 sm:p-4 lg:items-end"
      >
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <LocationCombobox
            value={location}
            onChange={setLocation}
            label={t("marketHome.search.location", "Lokasi")}
            placeholder={t("marketHome.search.locationPlaceholder", "Kota, provinsi, atau area")}
            suggestionsLabel={t("marketHome.search.suggestions", "Saran lokasi")}
            clearLabel={t("marketHome.search.clearLocation", "Hapus lokasi")}
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="home-search-type" className="mk-label">{t("marketHome.search.type", "Tipe properti")}</label>
          <select id="home-search-type" value={type} onChange={(e) => setType(e.target.value)} className="mk-field mk-select">
            <option value="">{t("marketHome.search.anyType", "Semua tipe")}</option>
            {PROPERTY_TYPES.map((p) => <option key={p.id} value={p.id}>{t(`marketHome.types.${p.id}`, p.label)}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="home-search-price" className="mk-label">{t("marketHome.search.price", "Kisaran harga")}</label>
          <select id="home-search-price" value={price} onChange={(e) => setPrice(e.target.value)} className="mk-field mk-select">
            <option value="">{t("marketHome.search.anyPrice", "Semua harga")}</option>
            {priceOptions.map((r) => <option key={r.id} value={r.id}>{t(`marketHome.prices.${r.id}`, r.label)}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="home-search-beds" className="mk-label">{t("marketHome.search.beds", "Kamar tidur")}</label>
          <select id="home-search-beds" value={beds} onChange={(e) => setBeds(e.target.value)} className="mk-field mk-select">
            <option value="">{t("marketHome.search.anyBeds", "Semua")}</option>
            {BEDROOM_OPTIONS.map((n) => (
              <option key={n} value={n}>{t("marketHome.search.bedsPlus", "{n}+ kamar").replace("{n}", String(n))}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="mk-focus col-span-2 sm:col-span-3 lg:col-span-1 h-12 px-6 rounded-xl reos-cta text-[15px] inline-flex items-center justify-center gap-2 whitespace-nowrap">
          <Search className="h-4 w-4" aria-hidden="true" /> {t("marketHome.search.submit", "Cari Properti")}
        </button>
      </form>
    </div>
  );
}

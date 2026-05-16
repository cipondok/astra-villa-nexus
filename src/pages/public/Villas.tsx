import { useState } from "react";
import SEO from "@/components/SEO";
import { useT } from "@/i18n/LangProvider";
import { useVillas, useCities, type VillaFilters } from "@/features/villas/useVillas";
import VillaCard from "@/features/villas/VillaCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Villas() {
  const { t } = useT();
  const [filters, setFilters] = useState<VillaFilters>({ listing_type: "all", city: "all" });
  const { data: villas = [], isLoading } = useVillas(filters);
  const { data: cities = [] } = useCities();

  return (
    <>
      <SEO title={t("villas.title")} path="/villas" />
      <section className="container-prose py-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold">{t("villas.title")}</h1>

        {/* Filters */}
        <div className="mt-6 grid gap-3 md:grid-cols-5 p-4 border border-border rounded-xl bg-card">
          <Input
            placeholder={t("villas.filters.search")}
            value={filters.search ?? ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="md:col-span-2"
          />
          <Select value={filters.listing_type} onValueChange={(v: any) => setFilters({ ...filters, listing_type: v })}>
            <SelectTrigger><SelectValue placeholder={t("villas.filters.type")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("villas.filters.type")}</SelectItem>
              <SelectItem value="sale">{t("common.forSale")}</SelectItem>
              <SelectItem value="rent">{t("common.forRent")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
            <SelectTrigger><SelectValue placeholder={t("villas.filters.city")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allCities")}</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setFilters({ listing_type: "all", city: "all" })}>
            {t("villas.filters.reset")}
          </Button>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : villas.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">{t("villas.empty")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {villas.map((v) => <VillaCard key={v.id} villa={v} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  MapPin,
  TrendingUp,
  BarChart3,
  Flame,
  Building2,
  Activity,
  School,
  Train,
  UtensilsCrossed,
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import AstraPropertyMap, { MapMarker } from "@/components/maps/AstraPropertyMap";
import { useLocationIntelligence } from "@/hooks/useLocationIntelligence";
import { formatCurrencyIDR, formatCurrencyIDRShort, formatNumberID } from "@/lib/indonesianFormat";
import { cn } from "@/lib/utils";

type Property = {
  id: string;
  title: string;
  price: number | null;
  city: string | null;
  location: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  created_at: string;
};

function slugToLabel(slug: string) {
  return decodeURIComponent(slug)
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function useLocationProperties(label: string) {
  return useQuery({
    queryKey: ["location-properties", label],
    queryFn: async (): Promise<{ recent: Property[]; older: Property[] }> => {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const pattern = `%${label}%`;
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id,title,price,city,location,property_type,bedrooms,bathrooms,area_sqm,latitude,longitude,images,created_at",
        )
        .eq("status", "active")
        .gt("price", 0)
        .or(`city.ilike.${pattern},location.ilike.${pattern},state.ilike.${pattern}`)
        .order("created_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      const all = (data ?? []) as Property[];
      return {
        recent: all.filter((p) => p.created_at >= ninetyDaysAgo),
        older: all.filter((p) => p.created_at < ninetyDaysAgo),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useNearbyAmenities(center: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: ["nearby-amenities", center?.lat, center?.lng],
    enabled: !!center,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const apiKey = import.meta.env.VITE_LOVABLE_API_KEY as string | undefined;
      const connKey = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_API_KEY as
        | string
        | undefined;
      // Browser side cannot call gateway without auth; return null so we skip.
      // Amenity counts are derived from Places API only when an edge function is wired.
      if (!apiKey || !connKey || !center) return null;
      return null;
    },
  });
}

export default function LocationDetailPage() {
  const { slug = "" } = useParams();
  const label = useMemo(() => slugToLabel(slug), [slug]);

  const { data: intelligence } = useLocationIntelligence();
  const { data: props, isLoading } = useLocationProperties(label);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const properties = useMemo(() => {
    if (!props) return [];
    return [...props.recent, ...props.older];
  }, [props]);

  const markers = useMemo<MapMarker[]>(
    () =>
      properties
        .filter(
          (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
        )
        .map((p) => ({
          id: p.id,
          lat: p.latitude as number,
          lng: p.longitude as number,
          title: p.title,
          subtitle: p.price ? formatCurrencyIDRShort(p.price) : undefined,
        })),
    [properties],
  );

  // Match intelligence area by city or area name
  const areaIntel = useMemo(() => {
    if (!intelligence?.areas) return null;
    const lower = label.toLowerCase();
    return (
      intelligence.areas.find(
        (a) =>
          a.area.toLowerCase() === lower ||
          a.city.toLowerCase() === lower ||
          a.area.toLowerCase().includes(lower) ||
          a.city.toLowerCase().includes(lower),
      ) ?? null
    );
  }, [intelligence, label]);

  const summary = useMemo(() => {
    if (!properties.length) return null;
    const prices = properties.map((p) => Number(p.price) || 0).filter((n) => n > 0);
    const avgPrice = prices.reduce((s, n) => s + n, 0) / (prices.length || 1);
    const recent = props?.recent.length ?? 0;
    const older = props?.older.length ?? 0;
    const total = recent + older;
    const trend30 = older === 0 ? 100 : ((recent - older) / older) * 100;
    return {
      avgPrice,
      total,
      recent,
      trend30,
    };
  }, [properties, props]);

  const mapCenter = useMemo(() => {
    if (markers.length === 0) return undefined;
    const sumLat = markers.reduce((s, m) => s + m.lat, 0);
    const sumLng = markers.reduce((s, m) => s + m.lng, 0);
    return { lat: sumLat / markers.length, lng: sumLng / markers.length };
  }, [markers]);

  useNearbyAmenities(mapCenter ?? null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={`${label} — Location Intelligence | ASTRA Villa`}
        description={`Live property intelligence, market trends and listings for ${label}.`}
      />

      {/* Hero */}
      <div className="border-b border-border/50 bg-gradient-to-b from-muted/30 to-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Link
            to="/locations"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All destinations
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-3 flex items-end justify-between gap-4 flex-wrap"
          >
            <div>
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="text-[11px] uppercase tracking-[0.18em] font-medium">
                  Location Intelligence
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mt-2">{label}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live market signal, demand heat and active inventory powered by ASTRA AI.
              </p>
            </div>
            <Button asChild>
              <Link to={`/properties?location=${encodeURIComponent(label)}`}>
                Browse all listings
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Widget
            icon={BarChart3}
            label="Avg Price"
            value={summary ? formatCurrencyIDRShort(summary.avgPrice) : "—"}
            sub={summary ? `${summary.total} active listings` : ""}
          />
          <Widget
            icon={TrendingUp}
            label="Rental Yield"
            value={areaIntel ? `${areaIntel.rental_yield.toFixed(1)}%` : "—"}
            sub="per year"
            accent="primary"
          />
          <Widget
            icon={Activity}
            label="ROI / Growth"
            value={areaIntel ? `${areaIntel.price_growth >= 0 ? "+" : ""}${areaIntel.price_growth.toFixed(1)}%` : "—"}
            sub="12-month price growth"
            accent={areaIntel && areaIntel.price_growth >= 0 ? "success" : "danger"}
          />
          <Widget
            icon={Flame}
            label="Demand & Liquidity"
            value={areaIntel ? `${areaIntel.investment_score}/100` : "—"}
            sub={areaIntel ? heatLabel(areaIntel.demand_heat_level) : "—"}
            accent="primary"
          />
        </div>

        {/* Listings trend strip */}
        {summary && (
          <Card>
            <CardContent className="py-4 px-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Listings activity</p>
                  <p className="text-sm font-semibold">
                    {formatNumberID(summary.recent)} new in last 90 days · {formatNumberID(summary.total)} total
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  summary.trend30 >= 0 ? "text-chart-1 border-chart-1/40" : "text-destructive border-destructive/40",
                )}
              >
                {summary.trend30 >= 0 ? "▲" : "▼"} {Math.abs(summary.trend30).toFixed(0)}% vs prior period
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Map + List */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 lg:sticky lg:top-20 lg:self-start">
            <AstraPropertyMap
              markers={markers}
              highlightedId={highlightedId}
              onMarkerClick={(id) => {
                setHighlightedId(id);
                document
                  .getElementById(`prop-${id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              onMarkerHover={setHighlightedId}
              center={mapCenter}
              className="h-[480px] lg:h-[620px]"
            />
            <p className="text-[11px] text-muted-foreground mt-2 px-1">
              Hover a marker to highlight the listing. {markers.length} of {properties.length} listings
              are geo-tagged.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Active listings</h2>
              <span className="text-xs text-muted-foreground">{properties.length} total</span>
            </div>

            {isLoading ? (
              <div className="h-40 grid place-items-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : properties.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No active listings found for "{label}".
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {properties.map((p) => (
                  <PropertyRow
                    key={p.id}
                    property={p}
                    highlighted={highlightedId === p.id}
                    onHover={() => setHighlightedId(p.id)}
                    onLeave={() => setHighlightedId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nearby amenities */}
        <Card>
          <CardContent className="py-5 px-5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Nearby amenities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <AmenityTile icon={School} label="Schools" hint="Within 3 km" />
              <AmenityTile icon={Train} label="Transit" hint="Stations & stops" />
              <AmenityTile icon={UtensilsCrossed} label="Dining" hint="Cafés & restaurants" />
              <AmenityTile icon={ShoppingBag} label="Retail" hint="Malls & markets" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-4">
              Live Places data activates when the Google Maps Platform connector is linked.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Widget({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent?: "primary" | "success" | "danger";
}) {
  const tone =
    accent === "success"
      ? "text-chart-1"
      : accent === "danger"
        ? "text-destructive"
        : accent === "primary"
          ? "text-primary"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <p className="text-xs">{label}</p>
        </div>
        <p className={cn("text-xl sm:text-2xl font-bold mt-1", tone)}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function AmenityTile({ icon: Icon, label, hint }: { icon: any; label: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm font-medium mt-2">{label}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function PropertyRow({
  property,
  highlighted,
  onHover,
  onLeave,
}: {
  property: Property;
  highlighted: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const img = property.images?.[0];
  return (
    <Link
      to={`/property/${property.id}`}
      id={`prop-${property.id}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "flex gap-3 p-2.5 rounded-xl border transition-all",
        highlighted
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/40",
      )}
    >
      <div className="h-20 w-24 rounded-lg overflow-hidden bg-muted shrink-0">
        {img ? (
          <img src={img} alt={property.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground">
            <Building2 className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{property.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {property.location || property.city}
        </p>
        <p className="text-sm font-bold text-primary mt-1">
          {property.price ? formatCurrencyIDR(property.price) : "—"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {[
            property.bedrooms ? `${property.bedrooms} BR` : null,
            property.bathrooms ? `${property.bathrooms} BA` : null,
            property.area_sqm ? `${property.area_sqm} m²` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}

function heatLabel(level: string) {
  return (
    { very_hot: "Very Hot", hot: "Hot", warm: "Warm", cool: "Stable" } as Record<string, string>
  )[level] || level;
}

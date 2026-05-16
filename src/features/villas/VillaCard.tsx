import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, MapPin, Maximize } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { useT } from "@/i18n/LangProvider";
import type { Villa } from "./useVillas";

export default function VillaCard({ villa }: { villa: Villa }) {
  const { t } = useT();
  const cover = villa.cover_image || villa.images[0] || "/placeholder.svg";

  return (
    <Link to={`/villas/${villa.slug}`} className="group block">
      <Card className="overflow-hidden border-border/60 transition-all hover:shadow-xl hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={cover}
            alt={villa.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {villa.featured && <Badge className="bg-primary text-primary-foreground">{t("common.featured")}</Badge>}
            <Badge variant="secondary" className="backdrop-blur bg-background/80">
              {villa.listing_type === "sale" ? t("common.forSale") : t("common.forRent")}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-serif text-lg font-semibold leading-tight line-clamp-1">{villa.title}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" /> {villa.city}
            </div>
          </div>
          <div className="text-primary font-semibold text-lg">{formatIDR(villa.price_idr)}</div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {villa.bedrooms}</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {villa.bathrooms}</span>
            {villa.building_sqm > 0 && (
              <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {villa.building_sqm}m²</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

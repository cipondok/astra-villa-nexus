import { memo } from "react";
import { ChatProperty } from "./types";
import { MapPin, BedDouble, Maximize2, TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatPropertyCardProps {
  property: ChatProperty;
  index: number;
}

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}M`;
  return `Rp ${price.toLocaleString()}`;
};

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-emerald-400 bg-emerald-500/15";
  if (score >= 70) return "text-amber-400 bg-amber-500/15";
  return "text-muted-foreground bg-muted/40";
};

const ChatPropertyCard = memo<ChatPropertyCardProps>(({ property, index }) => {
  return (
    <motion.a
      href={`/property/${property.id}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn(
        "flex gap-2.5 p-2 rounded-xl border border-border/40 bg-background/80",
        "hover:border-primary/40 hover:bg-primary/5 transition-all duration-200",
        "cursor-pointer group no-underline"
      )}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/40 shrink-0">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-[10px]">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-[11px] font-semibold text-foreground leading-tight truncate">
            {property.title}
          </h4>
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
        </div>

        {(property.city || property.district) && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground truncate">
              {[property.district, property.city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        <p className="text-[11px] font-bold text-primary mt-1">{formatPrice(property.price)}</p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {property.bedrooms != null && (
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <BedDouble className="h-2.5 w-2.5" /> {property.bedrooms}
            </span>
          )}
          {property.area_sqm != null && (
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <Maximize2 className="h-2.5 w-2.5" /> {property.area_sqm}m²
            </span>
          )}
          {property.opportunity_score != null && (
            <span className={cn("flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full", getScoreColor(property.opportunity_score))}>
              <TrendingUp className="h-2.5 w-2.5" /> {property.opportunity_score}
            </span>
          )}
          {property.rental_yield != null && property.rental_yield > 0 && (
            <span className="text-[9px] text-emerald-400 font-medium">
              {property.rental_yield.toFixed(1)}% yield
            </span>
          )}
        </div>
      </div>
    </motion.a>
  );
});

ChatPropertyCard.displayName = "ChatPropertyCard";
export default ChatPropertyCard;

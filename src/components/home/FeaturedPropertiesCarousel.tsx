import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize, Star, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";

interface FeaturedProperty {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_type: string | null;
  city: string | null;
  state: string | null;
  location: string | null;
  images: string[] | null;
  thumbnail_url: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
}

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) {
    return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000_000) {
    return `Rp ${(price / 1_000_000).toFixed(0)}Jt`;
  }
  return `Rp ${price.toLocaleString("id-ID")}`;
};

export default function FeaturedPropertiesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { getPropertyImage } = useDefaultPropertyImage();
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["featured-carousel-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, title, price, property_type, listing_type, city, state, location, images, thumbnail_url, bedrooms, bathrooms, area_sqm"
        )
        .eq("status", "active")
        .eq("approval_status", "approved")
        .not("title", "is", null)
        .gt("price", 0)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return (data ?? []) as FeaturedProperty[];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStart.current = { x: e.pageX, scrollLeft: scrollRef.current.scrollLeft };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const dx = e.pageX - dragStart.current.x;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  };
  const handleMouseUp = () => setIsDragging(false);

  if (isLoading) {
    return (
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          {/* Card skeletons */}
          <div className="flex gap-3 sm:gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[260px] sm:w-[290px] md:w-[310px] lg:w-[330px]">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <div className="p-3 sm:p-3.5 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex items-center gap-3 pt-1 border-t border-border/60">
                      <Skeleton className="h-3.5 w-10" />
                      <Skeleton className="h-3.5 w-10" />
                      <Skeleton className="h-3.5 w-14" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <div className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-primary/40" />
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground tracking-tight">
              {t("indexPage.featuredProperties")}
            </h2>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <div className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="h-8 w-8 rounded-full border-border hover:border-primary/40 hover:bg-primary/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="h-8 w-8 rounded-full border-border hover:border-primary/40 hover:bg-primary/5"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dijual")}
              className="hidden sm:flex items-center gap-1 text-xs text-primary hover:text-primary/80 ml-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory",
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {properties.map((p) => (
            <div
              key={p.id}
              onClick={() => !isDragging && navigate(`/properties/${p.id}`)}
              className="flex-shrink-0 w-[260px] sm:w-[290px] md:w-[310px] lg:w-[330px] snap-start group/card cursor-pointer"
            >
              <div className="relative rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={getPropertyImage(p.images, p.thumbnail_url)}
                    alt={p.title}
                    width={330}
                    height={206}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 260px, (max-width: 1024px) 310px, 330px"
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <Badge
                      className={cn(
                        "text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full text-white border-0 shadow-md",
                        p.listing_type === "rent"
                          ? "bg-sky-500/90"
                          : "bg-emerald-500/90"
                      )}
                    >
                      {p.listing_type === "rent" ? "Sewa" : "Dijual"}
                    </Badge>
                    {p.property_type && (
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs px-2 py-0.5 bg-black/40 backdrop-blur-md text-white border-white/20 capitalize rounded-full"
                      >
                        {p.property_type}
                      </Badge>
                    )}
                  </div>

                  {/* Price on image */}
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-black text-sm sm:text-base shadow-xl border border-white/10">
                      {formatPrice(p.price)}
                      {p.listing_type === "rent" && (
                        <span className="text-white/70 text-[10px] font-medium ml-0.5">
                          /bln
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-3.5 space-y-2">
                  <h3 className="text-sm sm:text-[15px] font-semibold text-foreground line-clamp-1 leading-snug group-hover/card:text-primary transition-colors">
                    {p.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="text-xs truncate">
                      {p.city || p.location || p.state || "Indonesia"}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-3 pt-1 border-t border-border/60">
                    {p.bedrooms != null && p.bedrooms > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Bed className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{p.bedrooms}</span>
                      </div>
                    )}
                    {p.bathrooms != null && p.bathrooms > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Bath className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{p.bathrooms}</span>
                      </div>
                    )}
                    {p.area_sqm != null && p.area_sqm > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Maximize className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{p.area_sqm}m²</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="flex sm:hidden justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dijual")}
            className="text-xs border-primary/30 text-primary hover:bg-primary/5"
          >
            View All Properties <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}

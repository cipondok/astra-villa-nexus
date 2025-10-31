import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAutoHorizontalScroll from "@/hooks/useAutoHorizontalScroll";
import { useNavigate } from "react-router-dom";

interface FeaturedAd {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  property_id: string | null;
  display_order: number;
}

export default function FeaturedAdsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch active featured ads
  const { data: ads, isLoading } = useQuery({
    queryKey: ['featured-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_ads')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FeaturedAd[];
    },
  });

  // Auto-scroll configuration
  useAutoHorizontalScroll(scrollRef, {
    speed: 1,
    intervalMs: 30,
    direction: 'rtl',
    pauseOnHover: true
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAdClick = (ad: FeaturedAd) => {
    if (ad.property_id) {
      navigate(`/property/${ad.property_id}`);
    } else if (ad.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
            Featured Properties
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Exclusive opportunities you don't want to miss
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-border hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-border hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {ads.map((ad) => (
          <div
            key={ad.id}
            onClick={() => handleAdClick(ad)}
            className="flex-shrink-0 w-[85vw] md:w-[600px] lg:w-[700px] cursor-pointer group relative rounded-xl overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                  {ad.title}
                </h3>
                {ad.subtitle && (
                  <p className="text-sm md:text-base text-white/90 drop-shadow-lg">
                    {ad.subtitle}
                  </p>
                )}
                
                <div className="mt-4">
                  <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium border border-white/30 group-hover:bg-white/30 transition-colors">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

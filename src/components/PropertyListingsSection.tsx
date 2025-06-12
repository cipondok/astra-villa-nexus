
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, TrendingUp, Zap, Clock, Eye } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { useEffect, useRef } from "react";

interface PropertyListingsSectionProps {
  language: "en" | "id";
}

const PropertyListingsSection = ({ language }: PropertyListingsSectionProps) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const text = {
    en: {
      featured: "Featured Properties",
      popular: "Popular Searches",
      hotDeals: "Hot Deals",
      newProjects: "New Projects (Pre-launch)",
      viewAll: "View All",
      limitedTime: "Limited Time",
      comingSoon: "Coming Soon",
      trending: "Trending"
    },
    id: {
      featured: "Properti Pilihan",
      popular: "Pencarian Populer",
      hotDeals: "Penawaran Terbaik", 
      newProjects: "Proyek Baru (Pra-peluncuran)",
      viewAll: "Lihat Semua",
      limitedTime: "Waktu Terbatas",
      comingSoon: "Segera Hadir",
      trending: "Trending"
    }
  };

  const currentText = text[language];

  const featuredProperties = [
    {
      id: 1,
      title: "Modern Villa in Bali",
      location: "Seminyak, Bali",
      price: "Rp 15,000,000,000",
      type: "sale",
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
      rating: 4.8,
      featured: true,
      isHotDeal: false
    },
    {
      id: 2,
      title: "Jakarta Premium Apartment",
      location: "Kuningan, Jakarta",
      price: "Rp 150,000,000/month",
      type: "rent",
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      rating: 4.6,
      featured: true,
      isHotDeal: true
    },
    {
      id: 3,
      title: "New Project Surabaya",
      location: "Surabaya, East Java",
      price: "Starting Rp 800,000,000",
      type: "new-project",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop",
      rating: 4.9,
      featured: true,
      isHotDeal: false
    },
    {
      id: 4,
      title: "Luxury Condo Bandung",
      location: "Dago, Bandung",
      price: "Rp 2,500,000,000",
      type: "sale",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
      rating: 4.7,
      featured: true,
      isHotDeal: true
    }
  ];

  const hotDeals = featuredProperties.filter(p => p.isHotDeal);
  const newProjects = featuredProperties.filter(p => p.type === "new-project");

  const popularSearches = language === "en" 
    ? ["Apartment Jakarta", "Villa Bali", "House Surabaya", "Boarding Bandung", "Office Space", "Landed House"]
    : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung", "Ruang Kantor", "Rumah Tapak"];

  // Dynamic card height balancing for desktop
  useEffect(() => {
    const balanceCardHeights = () => {
      if (!gridRef.current || window.innerWidth < 1024) return;

      const cards = gridRef.current.querySelectorAll('.property-card');
      const columns = window.innerWidth >= 1280 ? 4 : 3;
      
      // Reset heights
      cards.forEach(card => {
        (card as HTMLElement).style.height = 'auto';
      });

      // Calculate and apply balanced heights
      for (let i = 0; i < cards.length; i += columns) {
        const rowCards = Array.from(cards).slice(i, i + columns);
        const maxHeight = Math.max(...rowCards.map(card => card.scrollHeight));
        
        rowCards.forEach(card => {
          (card as HTMLElement).style.height = `${maxHeight}px`;
        });
      }
    };

    const debouncedBalance = debounce(balanceCardHeights, 150);
    
    balanceCardHeights();
    window.addEventListener('resize', debouncedBalance);
    
    return () => window.removeEventListener('resize', debouncedBalance);
  }, []);

  // Debounce utility
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  };

  return (
    <div className="space-y-12 lg:space-y-16 xl:space-y-20">
      {/* Featured Properties Carousel */}
      <section className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Star className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 animate-pulse" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              {currentText.featured}
            </h2>
          </div>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-300 hover:scale-105"
          >
            {currentText.viewAll}
          </Button>
        </div>
        
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredProperties.map((property) => (
              <CarouselItem key={property.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="property-card h-full">
                  <PropertyCard property={property} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </section>

      {/* Popular Searches - Adaptive Grid */}
      <section className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
          <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
            {currentText.popular}
          </h2>
        </div>
        
        {/* Adaptive Grid: 1 col mobile, 2 tablet, 3 laptop, 4 desktop */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
        >
          {popularSearches.map((search, index) => (
            <Card 
              key={index} 
              className="property-card group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md hover:shadow-2xl"
            >
              <CardContent className="p-4 md:p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg lg:text-xl font-semibold group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                      {search}
                    </h3>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">
                      Popular choice
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2 shrink-0 hover:scale-110 transition-transform duration-300"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{currentText.trending}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hot Deals - Responsive Grid */}
      <section className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-6 md:mb-8">
          <Zap className="h-6 w-6 md:h-8 md:w-8 text-red-500 animate-bounce" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-red-600">
            {currentText.hotDeals}
          </h2>
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse text-xs md:text-sm">
            {currentText.limitedTime}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {hotDeals.map((property) => (
            <div key={property.id} className="relative group">
              <div className="property-card transform transition-all duration-300 hover:scale-[1.02]">
                <PropertyCard property={property} />
              </div>
              <div className="absolute top-4 right-4 bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold animate-pulse z-10">
                🔥 HOT
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Projects - Enhanced Responsive Layout */}
      <section className="bg-gradient-to-br from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950 p-4 md:p-6 lg:p-8 xl:p-12 rounded-2xl mx-4 md:mx-6 lg:mx-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-6 md:mb-8">
          <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
            {currentText.newProjects}
          </h2>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs md:text-sm">
            {currentText.comingSoon}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {newProjects.map((property) => (
            <div key={property.id} className="relative group">
              <div className="property-card transform transition-all duration-500 hover:scale-[1.02]">
                <PropertyCard property={property} />
              </div>
              <div className="absolute inset-0 bg-blue-600/10 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold z-10">
                Pre-Launch
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PropertyListingsSection;

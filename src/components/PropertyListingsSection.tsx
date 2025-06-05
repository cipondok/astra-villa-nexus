
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, TrendingUp, Zap, Clock, Eye } from "lucide-react";
import PropertyCard from "./PropertyCard";

interface PropertyListingsSectionProps {
  language: "en" | "id";
}

const PropertyListingsSection = ({ language }: PropertyListingsSectionProps) => {
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

  return (
    <div className="space-y-16">
      {/* Featured Properties Carousel */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-500" />
            <h2 className="text-4xl font-bold">{currentText.featured}</h2>
          </div>
          <Button variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900">
            {currentText.viewAll}
          </Button>
        </div>
        
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredProperties.map((property) => (
              <CarouselItem key={property.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <PropertyCard property={property} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Popular Searches */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="h-8 w-8 text-green-500" />
          <h2 className="text-4xl font-bold">{currentText.popular}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularSearches.map((search, index) => (
            <Card key={index} className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{search}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Popular choice</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {currentText.trending}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hot Deals */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <Zap className="h-8 w-8 text-red-500" />
          <h2 className="text-4xl font-bold text-red-600">{currentText.hotDeals}</h2>
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse">
            {currentText.limitedTime}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hotDeals.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔥 HOT
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Projects */}
      <section className="bg-gradient-to-br from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950 p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="h-8 w-8 text-blue-500" />
          <h2 className="text-4xl font-bold">{currentText.newProjects}</h2>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {currentText.comingSoon}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {newProjects.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <div className="absolute inset-0 bg-blue-600/10 rounded-lg pointer-events-none"></div>
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
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

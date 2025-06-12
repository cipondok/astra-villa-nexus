
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Zap, Clock, Users, TrendingUp, Gavel, Filter, SortAsc } from "lucide-react";
import LiveAuctionCard from "./LiveAuctionCard";

interface LiveListingsSectionProps {
  language: "en" | "id";
}

const LiveListingsSection = ({ language }: LiveListingsSectionProps) => {
  const [liveAuctions, setLiveAuctions] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'auction' | 'listing'>('all');

  const text = {
    en: {
      title: "All Live Listings & Auctions",
      subtitle: "Real-time property auctions and live listings",
      liveAuctions: "Live Auctions",
      hotListings: "Hot Listings",
      endingSoon: "Ending Soon",
      newAuctions: "New Auctions",
      filterAll: "All",
      filterAuctions: "Auctions",
      filterListings: "Live Listings",
      sort: "Sort",
      viewAll: "View All Live",
      activeBidders: "Active Bidders",
      liveNow: "Live Now"
    },
    id: {
      title: "Semua Listing & Lelang Langsung",
      subtitle: "Lelang properti real-time dan listing langsung",
      liveAuctions: "Lelang Langsung",
      hotListings: "Listing Populer",
      endingSoon: "Segera Berakhir",
      newAuctions: "Lelang Baru",
      filterAll: "Semua",
      filterAuctions: "Lelang",
      filterListings: "Listing Langsung",
      sort: "Urutkan",
      viewAll: "Lihat Semua Live",
      activeBidders: "Penawar Aktif",
      liveNow: "Live Sekarang"
    }
  };

  const currentText = text[language];

  // Mock live auction data
  useEffect(() => {
    const mockAuctions = [
      {
        id: 1,
        title: "Luxury Villa Seminyak",
        location: "Seminyak, Bali",
        currentBid: "Rp 2,500,000,000",
        nextMinBid: "Rp 2,600,000,000",
        timeLeft: "2h 45m",
        bidders: 12,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
        isLive: true,
        type: 'auction' as const,
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000)
      },
      {
        id: 2,
        title: "Modern Apartment Jakarta",
        location: "SCBD, Jakarta",
        currentBid: "Rp 1,800,000,000",
        nextMinBid: "Rp 1,900,000,000",
        timeLeft: "45m",
        bidders: 8,
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
        isLive: true,
        type: 'auction' as const,
        endTime: new Date(Date.now() + 45 * 60 * 1000)
      },
      {
        id: 3,
        title: "Beachfront House Canggu",
        location: "Canggu, Bali",
        currentBid: "Rp 3,200,000,000",
        nextMinBid: "Rp 3,300,000,000",
        timeLeft: "1h 20m",
        bidders: 15,
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop",
        isLive: true,
        type: 'listing' as const,
        endTime: new Date(Date.now() + 1 * 60 * 60 * 1000 + 20 * 60 * 1000)
      },
      {
        id: 4,
        title: "City Center Office Space",
        location: "Kuningan, Jakarta",
        currentBid: "Rp 4,500,000,000",
        nextMinBid: "Rp 4,600,000,000",
        timeLeft: "3h 15m",
        bidders: 6,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
        isLive: true,
        type: 'auction' as const,
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000 + 15 * 60 * 1000)
      },
      {
        id: 5,
        title: "Mountain View Villa",
        location: "Ubud, Bali",
        currentBid: "Rp 2,800,000,000",
        nextMinBid: "Rp 2,900,000,000",
        timeLeft: "5h 30m",
        bidders: 9,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
        isLive: true,
        type: 'listing' as const,
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000)
      }
    ];
    
    setLiveAuctions(mockAuctions);
  }, []);

  const filteredAuctions = liveAuctions.filter(auction => {
    if (activeFilter === 'all') return true;
    return auction.type === activeFilter;
  });

  const endingSoonAuctions = liveAuctions
    .filter(auction => auction.isLive)
    .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="p-4 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 rounded-2xl mx-3 md:mx-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="relative">
              <Zap className="h-6 w-6 text-red-500 animate-bounce" />
              <div className="absolute inset-0 w-6 h-6 bg-red-500/20 rounded-full animate-ping"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                {currentText.title}
              </h2>
              <p className="text-sm text-muted-foreground">{currentText.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              {currentText.liveNow}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              47 {currentText.activeBidders}
            </Badge>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: currentText.filterAll },
            { key: 'auction', label: currentText.filterAuctions },
            { key: 'listing', label: currentText.filterListings }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.key as any)}
              className={`transition-all duration-300 ${
                activeFilter === filter.key 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                  : 'hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Live Auctions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredAuctions.map((auction) => (
            <LiveAuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>

      {/* Ending Soon Section */}
      {endingSoonAuctions.length > 0 && (
        <section className="p-3 md:p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-orange-500 animate-pulse" />
            <h3 className="text-lg font-bold text-orange-600">
              {currentText.endingSoon}
            </h3>
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 animate-bounce">
              Urgent
            </Badge>
          </div>
          
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {endingSoonAuctions.map((auction) => (
                <CarouselItem key={auction.id} className="pl-2 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <LiveAuctionCard auction={auction} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </section>
      )}

      {/* Stats Section */}
      <section className="p-3 md:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200">
            <CardContent className="p-4 text-center">
              <Gavel className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">24</div>
              <div className="text-xs text-red-500">Live Auctions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">147</div>
              <div className="text-xs text-green-500">Active Bidders</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="text-xs text-blue-500">Success Rate</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">2.5B</div>
              <div className="text-xs text-purple-500">Total Value</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LiveListingsSection;

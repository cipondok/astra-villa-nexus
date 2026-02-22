
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, TrendingUp, Gavel, Eye, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface LiveAuction {
  id: number;
  title: string;
  location: string;
  currentBid: string;
  nextMinBid: string;
  timeLeft: string;
  bidders: number;
  image: string;
  isLive: boolean;
  type: 'auction' | 'listing';
  endTime: Date;
}

interface LiveAuctionCardProps {
  auction: LiveAuction;
}

const LiveAuctionCard = ({ auction }: LiveAuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isActive, setIsActive] = useState(auction.isLive);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = auction.endTime.getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Ended');
        setIsActive(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.endTime]);

  const handleViewAuction = () => {
    navigate(`/property/${auction.id}`);
  };

  return (
    <Card className={`group overflow-hidden transition-all duration-300 transform hover:scale-[1.02] border rounded-2xl ${
      isActive ? 'border-destructive/30 bg-gradient-to-br from-destructive/5 to-chart-3/5' : 'border-border bg-card'
    }`}>
      <div className="relative overflow-hidden">
        <img
          src={auction.image}
          alt={auction.title}
          className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Live Indicator */}
        {isActive && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-destructive text-destructive-foreground animate-pulse text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              LIVE
            </Badge>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
            auction.type === 'auction' ? 'bg-chart-5' : 'bg-chart-4'
          }`}>
            {auction.type === 'auction' ? <Gavel className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {auction.type === 'auction' ? 'Auction' : 'Live'}
          </Badge>
        </div>

        {/* Time Left */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
          <Timer className="h-3 w-3 text-destructive" />
          <span className="text-xs font-medium">{timeLeft}</span>
        </div>

        {/* Bidders Count */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
          <Users className="h-3 w-3 text-chart-1" />
          <span className="text-xs font-medium">{auction.bidders}</span>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-1">
          {auction.title}
        </h3>
        
        <div className="flex items-center text-muted-foreground mb-2">
          <span className="text-xs line-clamp-1">{auction.location}</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Current Bid</span>
            <span className="text-sm font-bold text-chart-1">{auction.currentBid}</span>
          </div>
          
          {auction.type === 'auction' && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Next Min Bid</span>
              <span className="text-sm font-semibold text-chart-4">{auction.nextMinBid}</span>
            </div>
          )}
        </div>

        <Button 
          size="sm"
          className={`w-full h-8 font-medium transition-all duration-300 text-xs rounded-xl ${
            auction.type === 'auction' 
              ? 'bg-gradient-to-r from-chart-5 to-destructive hover:from-chart-5/90 hover:to-destructive/90' 
              : 'bg-gradient-to-r from-primary to-chart-1 hover:from-primary/90 hover:to-chart-1/90'
          } text-white`}
          onClick={handleViewAuction}
        >
          {auction.type === 'auction' ? (
            <>
              <Gavel className="h-3 w-3 mr-1" />
              Place Bid
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              View Live
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LiveAuctionCard;

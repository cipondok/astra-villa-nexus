
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
      isActive ? 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950' : 'border-gray-200 bg-white dark:bg-gray-800'
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
            <Badge className="bg-red-500 text-white animate-pulse text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              LIVE
            </Badge>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
            auction.type === 'auction' ? 'bg-purple-500' : 'bg-blue-500'
          }`}>
            {auction.type === 'auction' ? <Gavel className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {auction.type === 'auction' ? 'Auction' : 'Live'}
          </Badge>
        </div>

        {/* Time Left */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
          <Timer className="h-3 w-3 text-red-400" />
          <span className="text-xs font-medium">{timeLeft}</span>
        </div>

        {/* Bidders Count */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
          <Users className="h-3 w-3 text-green-400" />
          <span className="text-xs font-medium">{auction.bidders}</span>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="text-sm font-semibold mb-1 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
          {auction.title}
        </h3>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
          <span className="text-xs line-clamp-1">{auction.location}</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">Current Bid</span>
            <span className="text-sm font-bold text-green-600">{auction.currentBid}</span>
          </div>
          
          {auction.type === 'auction' && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Next Min Bid</span>
              <span className="text-sm font-semibold text-blue-600">{auction.nextMinBid}</span>
            </div>
          )}
        </div>

        <Button 
          size="sm"
          className={`w-full h-8 font-medium transition-all duration-300 text-xs rounded-xl ${
            auction.type === 'auction' 
              ? 'bg-gradient-to-r from-purple-600 to-red-500 hover:from-purple-700 hover:to-red-600' 
              : 'bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600'
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

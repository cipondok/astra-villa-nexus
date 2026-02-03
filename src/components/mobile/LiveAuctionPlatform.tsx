import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { 
  Gavel, Clock, Users, TrendingUp, Bell, BellOff, 
  ChevronUp, AlertTriangle, Trophy, Eye, Heart
} from "lucide-react";

interface LiveAuctionPlatformProps {
  auctionId?: string;
}

const LiveAuctionPlatform = ({ auctionId }: LiveAuctionPlatformProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const bidInputRef = useRef<HTMLInputElement>(null);

  // Fetch auction details
  const { data: auction } = useQuery({
    queryKey: ["live-auction", auctionId],
    queryFn: async () => {
      if (!auctionId) return null;
      const { data, error } = await supabase
        .from("mobile_live_auctions")
        .select("*, properties(*)")
        .eq("id", auctionId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!auctionId
  });

  // Fetch all active/upcoming auctions
  const { data: auctions = [] } = useQuery({
    queryKey: ["live-auctions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_live_auctions")
        .select("*, properties(title, images, location)")
        .in("status", ["scheduled", "live"])
        .order("start_time", { ascending: true })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  // Fetch recent bids for current auction
  const { data: bids = [] } = useQuery({
    queryKey: ["auction-bids", auctionId],
    queryFn: async () => {
      if (!auctionId) return [];
      const { data, error } = await supabase
        .from("mobile_auction_bids")
        .select("*, profiles(full_name)")
        .eq("auction_id", auctionId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!auctionId,
    refetchInterval: 2000 // Real-time polling
  });

  // Check if user is watching
  const { data: isWatching } = useQuery({
    queryKey: ["auction-watching", auctionId, user?.id],
    queryFn: async () => {
      if (!auctionId || !user) return false;
      const { data } = await supabase
        .from("mobile_auction_watchers")
        .select("id")
        .eq("auction_id", auctionId)
        .eq("user_id", user.id)
        .single();
      return !!data;
    },
    enabled: !!auctionId && !!user
  });

  // Place bid mutation
  const placeBid = useMutation({
    mutationFn: async (amount: number) => {
      if (!user || !auctionId) throw new Error("Not authenticated");
      const { error } = await supabase.from("mobile_auction_bids").insert({
        auction_id: auctionId,
        bidder_id: user.id,
        bid_amount: amount
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auction-bids", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["live-auction", auctionId] });
      setBidAmount("");
      toast({ title: "Bid Placed!", description: "You are now the highest bidder" });
    },
    onError: (error: Error) => {
      toast({ title: "Bid Failed", description: error.message, variant: "destructive" });
    }
  });

  // Toggle watch mutation
  const toggleWatch = useMutation({
    mutationFn: async () => {
      if (!user || !auctionId) throw new Error("Not authenticated");
      if (isWatching) {
        await supabase
          .from("mobile_auction_watchers")
          .delete()
          .eq("auction_id", auctionId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("mobile_auction_watchers").insert({
          auction_id: auctionId,
          user_id: user.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auction-watching", auctionId] });
      toast({ title: isWatching ? "Stopped watching" : "Now watching this auction" });
    }
  });

  // Countdown timer
  useEffect(() => {
    if (!auction?.end_time) return;
    
    const updateTimer = () => {
      const end = new Date(auction.end_time).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction?.end_time]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getMinBid = () => {
    if (!auction) return 0;
    return (auction.current_bid || auction.starting_price) + (auction.minimum_increment || 1000000);
  };

  const handleQuickBid = (increment: number) => {
    const min = getMinBid();
    placeBid.mutate(min + increment);
  };

  if (!auctionId) {
    // Show auction list
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Gavel className="h-5 w-5 text-primary" />
          Live Auctions
        </h2>

        {auctions.map((a) => {
          const isLive = a.status === "live";
          const property = a.properties as any;
          
          return (
            <Card 
              key={a.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${isLive ? "border-green-500/50" : ""}`}
              onClick={() => window.location.href = `/auction/${a.id}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {property?.images?.[0] && (
                    <img 
                      src={property.images[0]} 
                      alt={property.title} 
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={isLive ? "bg-green-500" : "bg-blue-500"}>
                        {isLive ? "LIVE" : "Upcoming"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {a.unique_bidders} bidders
                      </span>
                    </div>
                    <h3 className="font-semibold line-clamp-1">{a.title || property?.title}</h3>
                    <p className="text-sm text-muted-foreground">{property?.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Bid</p>
                        <p className="font-bold text-primary">
                          {formatCurrency(a.current_bid || a.starting_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isLive ? "Ends" : "Starts"}
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(isLive ? a.end_time : a.start_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {auctions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Gavel className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No active auctions at the moment</p>
              <p className="text-sm">Check back soon for upcoming property auctions</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!auction) return null;

  const property = auction.properties as any;
  const isLive = auction.status === "live";
  const userHighestBid = bids.find(b => b.bidder_id === user?.id);
  const isWinning = bids[0]?.bidder_id === user?.id;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with timer */}
      <div className={`sticky top-0 z-10 p-4 ${isLive ? "bg-green-500" : "bg-primary"} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="secondary" className="mb-1">
              {isLive ? "🔴 LIVE AUCTION" : "Upcoming"}
            </Badge>
            <h1 className="font-bold line-clamp-1">{auction.title || property?.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">{isLive ? "Time Left" : "Starts In"}</p>
            <p className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</p>
          </div>
        </div>
        {timeLeft < 300 && isLive && (
          <div className="mt-2 flex items-center gap-2 text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Ending soon! Bids may extend auction.</span>
          </div>
        )}
      </div>

      {/* Property image */}
      {property?.images?.[0] && (
        <div className="relative">
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <Button
            size="sm"
            variant={isWatching ? "default" : "secondary"}
            className="absolute top-4 right-4"
            onClick={() => toggleWatch.mutate()}
          >
            {isWatching ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Current bid info */}
      <Card className="mx-4 -mt-8 relative z-10">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Starting</p>
              <p className="font-medium">{formatCurrency(auction.starting_price)}</p>
            </div>
            <div className="border-x">
              <p className="text-xs text-muted-foreground">Current Bid</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(auction.current_bid || auction.starting_price)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bids</p>
              <p className="font-medium">{auction.total_bids}</p>
            </div>
          </div>

          {isWinning && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                You're the highest bidder!
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bid history */}
      <div className="px-4 mt-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Bid History
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {bids.map((bid, i) => (
            <div 
              key={bid.id} 
              className={`flex items-center justify-between p-2 rounded-lg ${
                i === 0 ? "bg-green-50 dark:bg-green-950" : "bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                {i === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                <span className="text-sm">
                  {bid.bidder_id === user?.id ? "You" : (bid.profiles as any)?.full_name || "Anonymous"}
                </span>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(bid.bid_amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(bid.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bid input - fixed at bottom */}
      {isLive && user && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-3">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickBid(0)}
              disabled={placeBid.isPending}
            >
              Min Bid
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickBid(5000000)}
              disabled={placeBid.isPending}
            >
              +5M
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickBid(10000000)}
              disabled={placeBid.isPending}
            >
              +10M
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                ref={bidInputRef}
                type="number"
                placeholder={`Min bid: ${formatCurrency(getMinBid())}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            <Button 
              size="lg"
              onClick={() => placeBid.mutate(Number(bidAmount))}
              disabled={!bidAmount || Number(bidAmount) < getMinBid() || placeBid.isPending}
              className="px-8"
            >
              <Gavel className="h-5 w-5 mr-2" />
              Bid
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            By placing a bid, you agree to purchase the property if you win
          </p>
        </div>
      )}

      {!user && isLive && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 text-center">
          <Button onClick={() => window.location.href = "/auth"}>
            Sign in to place a bid
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveAuctionPlatform;

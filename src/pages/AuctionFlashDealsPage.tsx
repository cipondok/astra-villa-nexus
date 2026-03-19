import React, { useState, useEffect, useCallback } from 'react';
import { useFlashDeals, useAuctions, usePlaceBid, type FlashDeal, type AuctionListing } from '@/hooks/useAuctionFlashDeals';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import AuctionListingBadge from '@/components/auction/AuctionListingBadge';
import BidCompetitivenessIndicator from '@/components/auction/BidCompetitivenessIndicator';
import {
  Zap, Gavel, Clock, TrendingUp, Flame, Eye, MapPin,
  Home, ArrowUpRight, Loader2, AlertTriangle, Users,
  DollarSign, Timer, Sparkles, ChevronRight, Target,
}from 'lucide-react';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatShort = (v: number) =>
  v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`;

// ── Countdown Timer Hook ──
function useCountdown(endTime: string) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, total: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
      total: diff,
    };
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [calcTimeLeft]);

  return timeLeft;
}

// ── Countdown Display ──
function CountdownTimer({ endTime, compact }: { endTime: string; compact?: boolean }) {
  const t = useCountdown(endTime);
  const isUrgent = t.total < 3600000 && !t.expired; // < 1 hour

  if (t.expired) {
    return <Badge variant="outline" className="text-muted-foreground text-[10px]">Ended</Badge>;
  }

  if (compact) {
    return (
      <span className={`text-xs font-mono font-bold ${isUrgent ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
        {t.days > 0 ? `${t.days}d ` : ''}{String(t.hours).padStart(2, '0')}:{String(t.minutes).padStart(2, '0')}:{String(t.seconds).padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${isUrgent ? 'text-destructive' : 'text-foreground'}`}>
      <Timer className={`h-3.5 w-3.5 ${isUrgent ? 'animate-pulse' : ''}`} />
      {[
        t.days > 0 ? { val: t.days, lbl: 'd' } : null,
        { val: t.hours, lbl: 'h' },
        { val: t.minutes, lbl: 'm' },
        { val: t.seconds, lbl: 's' },
      ].filter(Boolean).map((item, i) => (
        <div key={i} className="flex items-center">
          <span className={`text-sm font-mono font-bold px-1.5 py-0.5 rounded ${isUrgent ? 'bg-destructive/10' : 'bg-accent/50'}`}>
            {String(item!.val).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-muted-foreground ml-0.5">{item!.lbl}</span>
        </div>
      ))}
    </div>
  );
}

// ── Flash Deal Card ──
function FlashDealCard({ deal, index }: { deal: FlashDeal; index: number }) {
  const p = deal.property;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Card className="border-border/50 bg-card/80 overflow-hidden group hover:shadow-lg transition-all relative">
        {/* Discount ribbon */}
        <div className="absolute top-3 left-0 z-10 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold rounded-r-full shadow-md">
          -{deal.discount_pct}% OFF
        </div>

        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="sm:w-40 h-40 sm:h-auto relative flex-shrink-0">
              {p?.thumbnail_url ? (
                <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-destructive/10 to-accent flex items-center justify-center">
                  <Home className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              {/* Limited Time Badge */}
              <div className="absolute bottom-2 left-2 right-2">
                <Badge className="bg-destructive/90 text-destructive-foreground text-[9px] gap-1 w-full justify-center">
                  <Zap className="h-3 w-3" /> LIMITED TIME OPPORTUNITY
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="outline" className="text-[9px] px-1.5">{p?.property_type}</Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {p?.city}</Badge>
                  {p?.investment_score > 70 && (
                    <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/30 text-[9px] gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> Score {p.investment_score}
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{p?.title}</h3>

                {/* Price comparison */}
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-lg font-bold text-destructive">{formatShort(deal.flash_price)}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatShort(deal.original_price)}</span>
                  <Badge className="bg-destructive/10 text-destructive text-[10px] font-bold">
                    Save {formatShort(deal.original_price - deal.flash_price)}
                  </Badge>
                </div>

                {/* Property details */}
                {(p?.bedrooms || p?.bathrooms || p?.area_sqm) && (
                  <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    {p?.bedrooms && <span>{p.bedrooms} Bed</span>}
                    {p?.bathrooms && <span>{p.bathrooms} Bath</span>}
                    {p?.area_sqm && <span>{p.area_sqm} m²</span>}
                  </div>
                )}
              </div>

              {/* Timer & Actions */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                <CountdownTimer endTime={deal.end_time} />
                <Button size="sm" className="text-xs gap-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  <Zap className="h-3 w-3" /> Grab Deal
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Auction Card ──
function AuctionCard({ auction, index }: { auction: AuctionListing; index: number }) {
  const [bidOpen, setBidOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const placeBid = usePlaceBid();
  const p = auction.property;
  const minBid = auction.current_bid + auction.minimum_increment;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Card className="border-border/50 bg-card/80 overflow-hidden group hover:shadow-lg transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="sm:w-40 h-40 sm:h-auto relative flex-shrink-0">
              {p?.thumbnail_url ? (
                <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
                  <Gavel className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <AuctionListingBadge
                  type="auction"
                  endTime={auction.end_time}
                  bidCount={auction.bid_count}
                  compact
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="outline" className="text-[9px] px-1.5">{p?.property_type}</Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {p?.city}</Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 capitalize">{auction.auction_type}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {auction.title || p?.title}
                </h3>

                {/* Bid info */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-accent/30 p-2">
                    <p className="text-[9px] text-muted-foreground">Current Bid</p>
                    <p className="text-base font-bold text-primary">{formatShort(auction.current_bid)}</p>
                  </div>
                  <div className="rounded-lg bg-accent/30 p-2">
                    <p className="text-[9px] text-muted-foreground">Starting Price</p>
                    <p className="text-sm font-semibold text-foreground">{formatShort(auction.starting_price)}</p>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Min. increment: {formatIDR(auction.minimum_increment)} · Next min: {formatShort(minBid)}
                </p>
              </div>

              {/* Timer & Bid Action */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                <CountdownTimer endTime={auction.end_time} />
                <Dialog open={bidOpen} onOpenChange={setBidOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="text-xs gap-1">
                      <Gavel className="h-3 w-3" /> Place Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base">Place Bid — {auction.title || p?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-accent/30 p-3 text-center">
                          <p className="text-[10px] text-muted-foreground">Current Highest</p>
                          <p className="text-lg font-bold text-primary">{formatIDR(auction.current_bid)}</p>
                        </div>
                        <div className="rounded-lg bg-accent/30 p-3 text-center">
                          <p className="text-[10px] text-muted-foreground">Minimum Bid</p>
                          <p className="text-lg font-bold text-foreground">{formatIDR(minBid)}</p>
                        </div>
                      </div>

                      {/* Competitiveness Indicator */}
                      {bidAmount && Number(bidAmount) > 0 && (
                        <BidCompetitivenessIndicator
                          proposedBid={Number(bidAmount)}
                          currentBid={auction.current_bid}
                          startingPrice={auction.starting_price}
                          minimumIncrement={auction.minimum_increment}
                          totalBids={auction.bid_count}
                        />
                      )}

                      <div>
                        <Input
                          type="number"
                          placeholder={String(minBid)}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        {[minBid, minBid + auction.minimum_increment, minBid + auction.minimum_increment * 3].map((preset) => (
                          <Button key={preset} variant="outline" size="sm" className="text-[10px] flex-1" onClick={() => setBidAmount(String(preset))}>
                            {formatShort(preset)}
                          </Button>
                        ))}
                      </div>
                      <Button
                        className="w-full gap-2"
                        disabled={placeBid.isPending || !bidAmount || Number(bidAmount) < minBid}
                        onClick={() => {
                          placeBid.mutate({ auction_id: auction.id, bid_amount: Number(bidAmount) }, {
                            onSuccess: () => { setBidOpen(false); setBidAmount(''); },
                          });
                        }}
                      >
                        {placeBid.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
                        Submit Bid
                      </Button>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Time remaining: <CountdownTimer endTime={auction.end_time} compact /></span>
                      </div>
                      <p className="text-[9px] text-center text-muted-foreground">
                        🔒 Bidder identities are anonymized. Bids within 5 min of closing extend the auction.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ──
export default function AuctionFlashDealsPage() {
  const { data: deals, isLoading: dealsLoading } = useFlashDeals();
  const { data: auctions, isLoading: auctionsLoading } = useAuctions();

  const totalActive = (deals?.length || 0) + (auctions?.length || 0);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-destructive" /> Flash Deals & Auctions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Limited-time opportunities & competitive property auctions
          </p>
        </div>
        {totalActive > 0 && (
          <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-sm font-bold px-3 py-1 animate-pulse">
            {totalActive} LIVE
          </Badge>
        )}
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0 }}>
          <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-card">
            <CardContent className="p-3 text-center">
              <Zap className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{deals?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">Flash Deals</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card">
            <CardContent className="p-3 text-center">
              <Gavel className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{auctions?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">Live Auctions</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-3 text-center">
              <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{auctions?.reduce((s, a) => s + a.bid_count, 0) || 0}</p>
              <p className="text-[10px] text-muted-foreground">Total Bids</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-3 text-center">
              <DollarSign className="h-5 w-5 text-chart-2 mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">
                {formatShort(
                  (deals || []).reduce((s, d) => s + (d.original_price - d.flash_price), 0)
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">Total Savings</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="flash" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="flash" className="text-xs gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Flash Deals
            {(deals?.length || 0) > 0 && <Badge className="bg-destructive text-destructive-foreground text-[9px] px-1.5 ml-1">{deals?.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="auctions" className="text-xs gap-1.5">
            <Gavel className="h-3.5 w-3.5" /> Live Auctions
            {(auctions?.length || 0) > 0 && <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 ml-1">{auctions?.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Flash Deals */}
        <TabsContent value="flash" className="space-y-3 mt-4">
          {dealsLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-44" />)}
          {!dealsLoading && (!deals || deals.length === 0) && (
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-12 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No Flash Deals Right Now</h3>
                <p className="text-sm text-muted-foreground">Check back soon — sellers can activate limited-time deals at any moment.</p>
              </CardContent>
            </Card>
          )}
          {!dealsLoading && deals && deals.map((deal, i) => <FlashDealCard key={deal.id} deal={deal} index={i} />)}
        </TabsContent>

        {/* Live Auctions */}
        <TabsContent value="auctions" className="space-y-3 mt-4">
          {auctionsLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-44" />)}
          {!auctionsLoading && (!auctions || auctions.length === 0) && (
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-12 text-center">
                <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No Active Auctions</h3>
                <p className="text-sm text-muted-foreground">Property auctions will appear here when sellers start competitive bidding campaigns.</p>
              </CardContent>
            </Card>
          )}
          {!auctionsLoading && auctions && auctions.map((auction, i) => <AuctionCard key={auction.id} auction={auction} index={i} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

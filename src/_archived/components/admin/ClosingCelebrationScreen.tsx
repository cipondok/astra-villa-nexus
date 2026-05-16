import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  PartyPopper, Home, Star, Share2, Users, Gift, Heart,
  Award, Trophy, ArrowRight, MessageSquare, DollarSign, TrendingUp
} from "lucide-react";

const dealSummary = {
  property: "Modern 3BR Villa with Pool",
  location: "Seminyak, Bali",
  price: "Rp 4,100,000,000",
  date: "March 22, 2026",
  buyer: "Ahmad Rizal",
  seller: "Ibu Sari Dewi",
  agent: "Agent Lisa Kartika",
  commission: "Rp 102,500,000",
};

const closedDeals = [
  { property: "Villa Seminyak", price: "Rp 4.1B", date: "Mar 22", rating: 5 },
  { property: "Apt Canggu", price: "Rp 1.8B", date: "Mar 15", rating: 4 },
  { property: "Studio Ubud", price: "Rp 1.2B", date: "Mar 8", rating: 5 },
];

const ClosingCelebrationScreen: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [testimonial, setTestimonial] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-primary" />
            Closing Celebration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Deal completion & referral growth</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">
          <Trophy className="h-3 w-3 mr-1" /> 42 Deals Closed
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Total Closed", value: "42" },
          { label: "This Month", value: "7" },
          { label: "Total Volume", value: "Rp 89B" },
          { label: "Avg Rating", value: "4.8★" },
          { label: "Referrals", value: "28" },
          { label: "Repeat Buyers", value: "18%" },
        ].map(m => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-2 text-center">
              <div className="text-sm font-bold text-foreground">{m.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          {/* Celebration Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-chart-1/5 overflow-hidden">
              <CardContent className="p-6 text-center relative">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                  <div className="w-20 h-20 rounded-full bg-chart-1/15 mx-auto flex items-center justify-center mb-3">
                    <Home className="h-10 w-10 text-chart-1" />
                  </div>
                </motion.div>
                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-foreground">🎉 Congratulations!</motion.h3>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground mt-1">Deal successfully closed</motion.p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-2xl font-bold text-primary mt-2">{dealSummary.price}</motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transaction Summary */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Property", value: dealSummary.property },
                  { label: "Location", value: dealSummary.location },
                  { label: "Final Price", value: dealSummary.price },
                  { label: "Closing Date", value: dealSummary.date },
                  { label: "Buyer", value: dealSummary.buyer },
                  { label: "Seller", value: dealSummary.seller },
                  { label: "Agent", value: dealSummary.agent },
                  { label: "Commission", value: dealSummary.commission },
                ].map(r => (
                  <div key={r.label} className="p-2 rounded-lg border border-border/30">
                    <div className="text-[9px] text-muted-foreground uppercase">{r.label}</div>
                    <div className="text-[11px] font-bold text-foreground mt-0.5 truncate">{r.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Rating */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-chart-3" /> Rate Your Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110">
                    <Star className={`h-8 w-8 ${s <= rating ? "text-chart-3 fill-chart-3" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <textarea value={testimonial} onChange={e => setTestimonial(e.target.value)}
                  placeholder="Share your experience working with this agent..."
                  className="w-full h-16 p-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                <Button size="sm" className="w-full text-xs">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" /> Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Growth Triggers */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
              <CardContent className="p-3 text-center">
                <Users className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="text-xs font-bold text-foreground">Invite Friends</div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Earn Rp 500K per referral</p>
                <Button size="sm" className="mt-2 w-full text-[10px] h-7">
                  <Gift className="h-3 w-3 mr-1" /> Share Referral Link
                </Button>
              </CardContent>
            </Card>
            <Card className="border-chart-1/20 bg-chart-1/5 cursor-pointer hover:bg-chart-1/10 transition-colors">
              <CardContent className="p-3 text-center">
                <Share2 className="h-6 w-6 text-chart-1 mx-auto mb-1" />
                <div className="text-xs font-bold text-foreground">Share Story</div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Inspire the community</p>
                <Button size="sm" variant="outline" className="mt-2 w-full text-[10px] h-7">
                  <Heart className="h-3 w-3 mr-1" /> Share Success
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card className="border-chart-1/20 bg-chart-1/5">
            <CardContent className="p-3 text-center">
              <Award className="h-6 w-6 text-chart-1 mx-auto mb-1" />
              <div className="text-xs font-bold text-foreground">Network Contributor</div>
              <p className="text-[9px] text-muted-foreground mt-1">You helped grow the ASTRA network!</p>
              <div className="w-14 h-14 rounded-full border-2 border-chart-1 bg-chart-1/10 mx-auto mt-2 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-chart-1" />
              </div>
              <Badge className="bg-chart-1/15 text-chart-1 text-[9px] mt-2">Loyalty Badge Earned</Badge>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs">Recent Closings</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {closedDeals.map((d, i) => (
                <div key={i} className="p-2 rounded border border-border/20">
                  <div className="text-[10px] font-bold text-foreground">{d.property}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-primary font-bold">{d.price}</span>
                    <span className="text-[9px] text-muted-foreground">{d.date}</span>
                  </div>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-2.5 w-2.5 ${s <= d.rating ? "text-chart-3 fill-chart-3" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <TrendingUp className="h-4 w-4 text-primary mb-1" />
              <div className="text-xs font-bold text-foreground">Next Opportunity</div>
              <p className="text-[9px] text-muted-foreground mt-1">Based on your preferences, 3 new listings match your investment profile.</p>
              <Button size="sm" variant="outline" className="w-full mt-2 text-[10px] h-7">
                <ArrowRight className="h-3 w-3 mr-1" /> Explore Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClosingCelebrationScreen;

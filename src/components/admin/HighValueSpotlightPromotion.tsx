import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Sparkles, Eye, TrendingUp, DollarSign, Star, BarChart3,
  ArrowUpRight, Calendar, Megaphone, CheckCircle, Target
} from "lucide-react";

const spotlightListings = [
  { id: "L-91", title: "Seminyak Luxury Villa 4BR", price: 4.2, views: 1240, inquiries: 38, conversions: 5, promoted: true, uplift: 180, roi: 320, placement: "Homepage Banner" },
  { id: "L-78", title: "Canggu Modern House", price: 2.8, views: 980, inquiries: 28, conversions: 3, promoted: true, uplift: 145, roi: 280, placement: "Search Top" },
  { id: "L-103", title: "Nusa Dua Waterfront", price: 8.5, views: 650, inquiries: 15, conversions: 2, promoted: true, uplift: 120, roi: 450, placement: "Featured Strip" },
  { id: "L-115", title: "Ubud Eco Retreat", price: 3.2, views: 420, inquiries: 12, conversions: 1, promoted: false, uplift: 0, roi: 0, placement: "None" },
  { id: "L-128", title: "BSD Premium Apartment", price: 1.5, views: 380, inquiries: 10, conversions: 1, promoted: false, uplift: 0, roi: 0, placement: "None" },
];

const suggestions = [
  { listing: "L-115", title: "Ubud Eco Retreat", reason: "High demand match with current expat buyer surge — promote to Featured Strip", confidence: 85 },
  { listing: "L-128", title: "BSD Premium Apartment", reason: "Underexposed listing in high-inquiry zone — homepage rotation recommended", confidence: 72 },
];

const campaignMetrics = {
  totalPromoted: 3,
  avgViewUplift: 148,
  avgROI: 350,
  premiumUtilization: 65,
  totalSpotlightViews: 2870,
  totalConversions: 10,
};

const HighValueSpotlightPromotion: React.FC = () => {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          High-Value Property Spotlight Engine
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Maximize visibility of strategic listings</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Promoted Listings", value: campaignMetrics.totalPromoted, icon: Megaphone, color: "text-primary" },
          { label: "Avg View Uplift", value: `+${campaignMetrics.avgViewUplift}%`, icon: Eye, color: "text-chart-1" },
          { label: "Avg ROI", value: `${campaignMetrics.avgROI}%`, icon: TrendingUp, color: "text-chart-2" },
          { label: "Premium Utilization", value: `${campaignMetrics.premiumUtilization}%`, icon: Star, color: "text-chart-3" },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <div className="text-xl font-bold text-foreground">{m.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listing Spotlight Manager */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Spotlight Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {spotlightListings.map((listing, i) => (
            <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`border-border/40 ${listing.promoted ? "bg-primary/5 border-primary/20" : ""}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-foreground">{listing.id}</span>
                        <span className="text-xs text-foreground truncate">{listing.title}</span>
                        {listing.promoted && <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">⭐ Promoted</Badge>}
                      </div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span>Rp {listing.price}B</span>
                        <span>{listing.views} views</span>
                        <span>{listing.inquiries} inquiries</span>
                        <span>{listing.conversions} conversions</span>
                        {listing.promoted && <span className="text-chart-1">+{listing.uplift}% uplift</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {listing.promoted && (
                        <Badge variant="secondary" className="text-[10px]">{listing.placement}</Badge>
                      )}
                      {listing.promoted && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-chart-1 flex items-center gap-0.5">
                            <ArrowUpRight className="h-3 w-3" />{listing.roi}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">ROI</div>
                        </div>
                      )}
                      <Switch checked={toggles[listing.id] ?? listing.promoted}
                        onCheckedChange={(v) => setToggles(p => ({ ...p, [listing.id]: v }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-chart-2" />
            Promotion Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map((s, i) => (
            <motion.div key={s.listing} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-chart-2/20 bg-chart-2/5">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-chart-2" />
                      <span className="text-sm font-bold text-foreground">{s.title}</span>
                      <Badge variant="secondary" className="text-[10px]">{s.confidence}% match</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.reason}</p>
                  </div>
                  <Button size="sm" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />Promote</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default HighValueSpotlightPromotion;

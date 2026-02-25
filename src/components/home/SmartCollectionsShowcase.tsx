import { useState } from "react";
import { useSmartCollections, CollectionType } from "@/hooks/useSmartCollections";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatIDR } from "@/utils/currency";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Home, Crown, Flame, MapPin, BedDouble, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const tabs: { value: CollectionType; label: string; icon: React.ReactNode }[] = [
  { value: "best_investment", label: "Best Investment", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { value: "best_for_living", label: "Best Living", icon: <Home className="h-3.5 w-3.5" /> },
  { value: "luxury_collection", label: "Luxury", icon: <Crown className="h-3.5 w-3.5" /> },
  { value: "trending", label: "Trending", icon: <Flame className="h-3.5 w-3.5" /> },
];

function getScoreBadge(type: CollectionType, scores: any) {
  switch (type) {
    case "best_investment":
      return { label: `ROI ${scores?.investment_score?.toFixed(0) || 0}`, color: "bg-emerald-500/90 text-white" };
    case "best_for_living":
      return { label: `Live ${scores?.livability_score?.toFixed(0) || 0}`, color: "bg-sky-500/90 text-white" };
    case "luxury_collection":
      return { label: `Lux ${scores?.luxury_score?.toFixed(0) || 0}`, color: "bg-amber-500/90 text-white" };
    case "trending":
      return { label: `🔥 ${scores?.engagement_score?.toFixed(0) || 0}`, color: "bg-rose-500/90 text-white" };
  }
}

export default function SmartCollectionsShowcase() {
  const [activeTab, setActiveTab] = useState<CollectionType>("best_investment");
  const { bestInvestment, bestForLiving, luxuryCollection, trending } = useSmartCollections(8);
  const navigate = useNavigate();

  const dataMap: Record<CollectionType, any> = {
    best_investment: bestInvestment,
    best_for_living: bestForLiving,
    luxury_collection: luxuryCollection,
    trending: trending,
  };

  const current = dataMap[activeTab];
  const properties = current?.data || [];
  const isLoading = current?.isLoading;

  return (
    <section className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">
            AI Smart Collections
          </h2>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            AI Powered
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CollectionType)}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs sm:text-sm">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-40 sm:h-48 bg-muted rounded-xl mb-2" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No properties scored yet. Collections update automatically as engagement grows.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {properties.map((p: any, i: number) => {
                    const badge = getScoreBadge(activeTab, p.scores);
                    const img = p.thumbnail_url || p.images?.[0] || "/placeholder.svg";
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                      >
                        <Card
                          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-border/50 group"
                          onClick={() => navigate(`/property/${p.id}`)}
                        >
                          <div className="relative h-40 sm:h-48 overflow-hidden">
                            <img
                              src={img}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            {/* Score badge */}
                            <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${badge.color}`}>
                              {badge.label}
                            </span>
                            {/* Predicted ROI for investment tab */}
                            {activeTab === "best_investment" && p.scores?.predicted_roi > 0 && (
                              <span className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-foreground">
                                AI: {p.scores.predicted_roi.toFixed(1)}% ROI
                              </span>
                            )}
                          </div>
                          <CardContent className="p-2.5 sm:p-3">
                            <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1 mb-1">
                              {p.title}
                            </h3>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1.5">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="text-[10px] sm:text-xs line-clamp-1">{p.city || p.location}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-bold text-primary">
                                {formatIDR(p.price || 0)}
                              </span>
                              {p.bedrooms && (
                                <span className="flex items-center gap-0.5 text-muted-foreground text-[10px]">
                                  <BedDouble className="h-3 w-3" /> {p.bedrooms}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

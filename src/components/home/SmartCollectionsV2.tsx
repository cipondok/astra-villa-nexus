import { useState } from "react";
import { useSmartCollectionsV2, SmartCollectionV2, SmartCollectionProperty } from "@/hooks/useSmartCollectionsV2";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Price from "@/components/ui/Price";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Home, Crown, Flame, Heart, MapPin, BedDouble, Sparkles, PercentCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

const TAB_ICONS = [
  <TrendingUp className="h-3.5 w-3.5" />,
  <Crown className="h-3.5 w-3.5" />,
  <PercentCircle className="h-3.5 w-3.5" />,
  <Flame className="h-3.5 w-3.5" />,
  <Home className="h-3.5 w-3.5" />,
];

function getPropertyBadge(index: number, property: SmartCollectionProperty) {
  switch (index) {
    case 0: return { label: `Score ${property.scores?.investment_score?.toFixed(0) || "–"}`, color: "bg-emerald-500/90 text-white" };
    case 1: return { label: `Luxury`, color: "bg-amber-500/90 text-white" };
    case 2: return { label: `${property.deal_score_percent?.toFixed(0) || 0}% below`, color: "bg-sky-500/90 text-white" };
    case 3: return { label: `🔥 ${property.saves_last_30_days || 0} saves`, color: "bg-rose-500/90 text-white" };
    case 4: return { label: `Family`, color: "bg-violet-500/90 text-white" };
    default: return { label: "", color: "" };
  }
}

export default function SmartCollectionsV2() {
  const [activeTab, setActiveTab] = useState("0");
  const { data: collections, isLoading } = useSmartCollectionsV2(12);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tabIdx = parseInt(activeTab);
  const current = collections?.[tabIdx];
  const properties = current?.properties || [];

  return (
    <section className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="hidden sm:block h-px w-8 bg-gradient-to-r from-transparent to-primary/40" />
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">
            {t('indexPage.aiSmartCollections') || 'AI Smart Collections'}
          </h2>
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase tracking-wider">
            {t('indexPage.aiPowered') || 'AI-Powered'}
          </Badge>
          <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            {(collections || []).map((col, i) => (
              <TabsTrigger key={i} value={String(i)} className="gap-1.5 text-xs sm:text-sm data-[state=active]:text-primary">
                {TAB_ICONS[i]}
                {col.title}
              </TabsTrigger>
            ))}
            {isLoading && !collections && [...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-muted rounded animate-pulse" />
            ))}
          </TabsList>

          {(collections || []).map((col, colIdx) => (
            <TabsContent key={colIdx} value={String(colIdx)}>
              {colIdx === tabIdx && (
                <>
                  <p className="text-xs text-muted-foreground mb-3">{col.description}</p>
                  {properties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary/60" />
                      </div>
                      <p className="text-sm text-muted-foreground text-center max-w-xs">
                        No properties found for this collection yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {properties.map((p, i) => {
                        const badge = getPropertyBadge(colIdx, p);
                        const img = p.thumbnail_url || p.images?.[0] || "/placeholder.svg";
                        return (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.3 }}
                          >
                            <Card
                              className="overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 border-border/50 group"
                              onClick={() => navigate(`/property/${p.id}`)}
                            >
                              <div className="relative h-40 sm:h-48 overflow-hidden">
                                <img
                                  src={img}
                                  alt={p.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${badge.color}`}>
                                  {badge.label}
                                </span>
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
                                    <Price amount={p.price || 0} short />
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
                </>
              )}
            </TabsContent>
          ))}

          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 sm:h-48 bg-muted rounded-xl mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          )}
        </Tabs>
      </div>
    </section>
  );
}

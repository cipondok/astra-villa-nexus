import { motion } from "framer-motion";
import { MapPin, Clock, Settings, Shield, Key, Database, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const adminSetupItems = [
  { label: "Mapbox Access Token", key: "MAPBOX_ACCESS_TOKEN", status: "pending" as const, icon: Key, description: "Required for interactive map rendering and geospatial layers" },
  { label: "Property Geolocation Data", key: "geo_data", status: "pending" as const, icon: Database, description: "Latitude/longitude coordinates for all listed properties" },
  { label: "Zone Boundary Definitions", key: "zone_boundaries", status: "pending" as const, icon: Globe, description: "GeoJSON polygons for investment zone overlays" },
  { label: "Heatmap Data Pipeline", key: "heatmap_pipeline", status: "pending" as const, icon: Settings, description: "Real-time pricing & demand data aggregation for heatmap layers" },
  { label: "RLS Policies for Map Data", key: "rls_policies", status: "ready" as const, icon: Shield, description: "Row-level security for zone stats and property coordinates" },
];

const InvestmentMapExplorerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Investment Map Explorer
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-4">
            Interactive geospatial analytics with heatmaps, zone comparisons, and real-time investment signals.
          </p>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
            <Clock className="w-3.5 h-3.5" />
            Coming Soon
          </Badge>
        </motion.div>

        {/* Preview Features */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
        >
          {["Heatmap Layers", "Zone Compare", "ROI Signals", "Live Filters"].map((f, i) => (
            <div key={f} className="bg-card border border-border/60 rounded-xl p-3 text-center">
              <div className="text-sm font-medium text-foreground">{f}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Planned</div>
            </div>
          ))}
        </motion.div>

        {/* Admin Setup Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/60">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Admin Setup Required</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                The following configurations are needed before this feature can go live.
              </p>

              <div className="space-y-3">
                {adminSetupItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40"
                  >
                    <div className={`mt-0.5 ${item.status === "ready" ? "text-green-500" : "text-amber-500"}`}>
                      {item.status === "ready" ? (
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      ) : (
                        <AlertCircle className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        <Badge
                          variant={item.status === "ready" ? "default" : "secondary"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {item.status === "ready" ? "Ready" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <item.icon className="w-4 h-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border/40 flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Admin Panel
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InvestmentMapExplorerPage;

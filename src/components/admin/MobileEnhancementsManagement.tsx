import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, Camera, Gavel, MessageCircle, MapPin, 
  WifiOff, CreditCard, Users, TrendingUp, Settings,
  Play, Eye, Download, ShoppingCart
} from "lucide-react";

const MobileEnhancementsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch AR sessions
  const { data: arSessions = [] } = useQuery({
    queryKey: ["ar-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_ar_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Fetch live auctions
  const { data: auctions = [] } = useQuery({
    queryKey: ["mobile-auctions-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_live_auctions")
        .select("*, properties(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch neighborhoods
  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["neighborhoods-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_neighborhoods")
        .select("*")
        .order("member_count", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch property journeys
  const { data: journeys = [] } = useQuery({
    queryKey: ["journeys-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_property_journeys")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  // Fetch IAP products
  const { data: iapProducts = [] } = useQuery({
    queryKey: ["iap-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_iap_products")
        .select("*")
        .order("price_idr", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Fetch IAP transactions
  const { data: iapTransactions = [] } = useQuery({
    queryKey: ["iap-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_iap_transactions")
        .select("*, mobile_iap_products(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  // Fetch feature flags for mobile features
  const { data: featureFlags = [] } = useQuery({
    queryKey: ["mobile-feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("innovation_feature_flags")
        .select("*")
        .in("flag_key", ["ar_preview", "live_auctions", "community_chat", "property_journey", "offline_mode"]);
      if (error) throw error;
      return data;
    }
  });

  // Toggle feature flag
  const toggleFeature = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("innovation_feature_flags")
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-feature-flags"] });
      toast({ title: "Feature Updated" });
    }
  });

  // Stats calculations
  const totalARSessions = arSessions.length;
  const avgARDuration = arSessions.length > 0 
    ? Math.round(arSessions.reduce((sum, s) => sum + (s.session_duration || 0), 0) / arSessions.length)
    : 0;
  const totalAuctionBids = auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0);
  const liveAuctions = auctions.filter(a => a.status === "live").length;
  const totalChatMembers = neighborhoods.reduce((sum, n) => sum + (n.member_count || 0), 0);
  const activeJourneys = journeys.filter(j => j.status !== "completed").length;
  const totalIAPRevenue = iapTransactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const featureConfig = [
    { key: "ar_preview", name: "AR Property Preview", icon: Camera, color: "text-chart-4" },
    { key: "live_auctions", name: "Live Auctions", icon: Gavel, color: "text-chart-1" },
    { key: "community_chat", name: "Community Chat", icon: MessageCircle, color: "text-chart-2" },
    { key: "property_journey", name: "Property Journey", icon: MapPin, color: "text-chart-3" },
    { key: "offline_mode", name: "Offline Mode", icon: WifiOff, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            Mobile Enhancements
          </h2>
          <p className="text-muted-foreground">Manage AR, Auctions, Chat, Journey, and In-App Purchases</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-chart-4" />
              <div>
                <p className="text-xs text-muted-foreground">AR Sessions</p>
                <p className="text-xl font-bold">{totalARSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-chart-1" />
              <div>
                <p className="text-xs text-muted-foreground">Live Auctions</p>
                <p className="text-xl font-bold">{liveAuctions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-chart-2" />
              <div>
                <p className="text-xs text-muted-foreground">Chat Members</p>
                <p className="text-xl font-bold">{totalChatMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-chart-3" />
              <div>
                <p className="text-xs text-muted-foreground">Active Journeys</p>
                <p className="text-xl font-bold">{activeJourneys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Bids</p>
                <p className="text-xl font-bold">{totalAuctionBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-chart-3" />
              <div>
                <p className="text-xs text-muted-foreground">IAP Revenue</p>
                <p className="text-xl font-bold">Rp {(totalIAPRevenue / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ar">AR Preview</TabsTrigger>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
          <TabsTrigger value="chat">Community</TabsTrigger>
          <TabsTrigger value="journey">Journeys</TabsTrigger>
          <TabsTrigger value="iap">Purchases</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureConfig.map((feature) => {
                  const flag = featureFlags.find(f => f.flag_key === feature.key);
                  const Icon = feature.icon;
                  
                  return (
                    <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                        <div>
                          <p className="font-medium">{feature.name}</p>
                          {flag?.percentage_rollout !== undefined && flag.percentage_rollout < 100 && (
                            <p className="text-xs text-muted-foreground">
                              {flag.percentage_rollout}% rollout
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {flag?.percentage_rollout !== undefined && (
                          <Progress value={flag.percentage_rollout} className="w-24 h-2" />
                        )}
                        <Switch
                          checked={flag?.is_enabled || false}
                          onCheckedChange={(checked) => flag && toggleFeature.mutate({ id: flag.id, enabled: checked })}
                          disabled={!flag}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AR Preview Tab */}
        <TabsContent value="ar" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-chart-4" />
                <p className="text-2xl font-bold">{totalARSessions}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Play className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                <p className="text-2xl font-bold">{avgARDuration}s</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Download className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                <p className="text-2xl font-bold">
                  {arSessions.reduce((sum, s) => sum + (s.screenshots_taken || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Screenshots</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent AR Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {arSessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-chart-4" />
                      <span className="text-sm">{session.session_duration || 0}s session</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{session.furniture_items_placed || 0} items placed</span>
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {arSessions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No AR sessions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auctions Tab */}
        <TabsContent value="auctions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Auctions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auctions.map((auction) => (
                  <div key={auction.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{auction.title || (auction.properties as any)?.title}</h4>
                        <Badge className={
                          auction.status === "live" ? "bg-chart-1/10 text-chart-1 border-chart-1/30" :
                          auction.status === "scheduled" ? "bg-chart-2/10 text-chart-2 border-chart-2/30" :
                          "bg-muted text-muted-foreground"
                        }>
                          {auction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {auction.total_bids || 0} bids • {auction.unique_bidders || 0} bidders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        Rp {((auction.current_bid || auction.starting_price) / 1000000000).toFixed(2)}B
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {auction.status === "live" ? "Ends" : "Starts"}: {new Date(auction.status === "live" ? auction.end_time : auction.start_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {auctions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No auctions configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Neighborhoods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {neighborhoods.map((neighborhood) => (
                  <div key={neighborhood.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{neighborhood.name}</h4>
                        <p className="text-sm text-muted-foreground">{neighborhood.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{neighborhood.member_count}</p>
                        <p className="text-xs text-muted-foreground">members</p>
                      </div>
                      <Badge variant={neighborhood.is_active ? "default" : "secondary"}>
                        {neighborhood.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journeys Tab */}
        <TabsContent value="journey" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            {["searching", "viewing", "negotiating", "completed"].map((status) => {
              const count = journeys.filter(j => j.status === status).length;
              return (
                <Card key={status}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{status}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Property Journeys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {journeys.slice(0, 10).map((journey) => (
                  <div key={journey.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{journey.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{journey.status}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(journey.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {journeys.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No journeys started</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* In-App Purchases Tab */}
        <TabsContent value="iap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {iapProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{product.name}</h4>
                        <Badge variant="outline">{product.product_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rp {product.price_idr?.toLocaleString()}</p>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {iapTransactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{(transaction.mobile_iap_products as any)?.name}</p>
                      <p className="text-xs text-muted-foreground">{transaction.store}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">Rp {transaction.amount?.toLocaleString()}</p>
                       <Badge className={
                         transaction.status === "completed" ? "bg-chart-1/10 text-chart-1 border-chart-1/30" :
                         transaction.status === "pending" ? "bg-chart-3/10 text-chart-3 border-chart-3/30" :
                         "bg-destructive/10 text-destructive border-destructive/30"
                       }>
                         {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {iapTransactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No transactions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileEnhancementsManagement;

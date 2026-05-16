import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, School, ShoppingCart, Train, TreePine, Shield, Heart } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const neighborhoods = [
  {
    name: "Seminyak, Bali",
    score: 92,
    walkability: 78,
    safety: 88,
    amenities: 95,
    transport: 65,
    education: 72,
    healthcare: 85,
    avgPrice: "Rp 8.2B",
    growth: "+12.4%",
    listings: 234,
  },
  {
    name: "Menteng, Jakarta",
    score: 89,
    walkability: 82,
    safety: 91,
    amenities: 88,
    transport: 90,
    education: 95,
    healthcare: 92,
    avgPrice: "Rp 15.6B",
    growth: "+6.8%",
    listings: 156,
  },
  {
    name: "Ubud, Bali",
    score: 85,
    walkability: 55,
    safety: 92,
    amenities: 70,
    transport: 40,
    education: 60,
    healthcare: 65,
    avgPrice: "Rp 5.4B",
    growth: "+18.2%",
    listings: 189,
  },
  {
    name: "BSD City, Tangerang",
    score: 83,
    walkability: 60,
    safety: 85,
    amenities: 82,
    transport: 75,
    education: 88,
    healthcare: 80,
    avgPrice: "Rp 3.8B",
    growth: "+9.5%",
    listings: 312,
  },
];

const selectedRadar = [
  { metric: "Safety", value: 88 },
  { metric: "Amenities", value: 95 },
  { metric: "Transport", value: 65 },
  { metric: "Education", value: 72 },
  { metric: "Healthcare", value: 85 },
  { metric: "Walkability", value: 78 },
];

const facilityBreakdown = [
  { type: "Restaurants", count: 142 },
  { type: "Schools", count: 28 },
  { type: "Hospitals", count: 8 },
  { type: "Malls", count: 5 },
  { type: "Parks", count: 12 },
  { type: "Banks", count: 34 },
];

const scoreColor = (score: number) => {
  if (score >= 90) return "text-chart-2";
  if (score >= 75) return "text-chart-3";
  return "text-chart-5";
};

const NeighborhoodInsights = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Neighborhood Insights</h2>
        <p className="text-muted-foreground text-sm">Livability scores, nearby facilities, safety ratings, and area analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Areas Analyzed", value: "156", icon: MapPin },
          { label: "Avg Safety Score", value: "84.2", icon: Shield },
          { label: "Schools Mapped", value: "1,240", icon: School },
          { label: "Facilities Indexed", value: "12,847", icon: ShoppingCart },
        ].map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4">
              <s.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Neighborhoods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {neighborhoods.map((n) => (
                <div key={n.name} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm text-foreground">{n.name}</span>
                      <Badge variant="outline" className="text-[10px]">{n.listings} listings</Badge>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${scoreColor(n.score)}`}>{n.score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[10px]">
                    {[
                      { label: "Walk", val: n.walkability },
                      { label: "Safe", val: n.safety },
                      { label: "Amenity", val: n.amenities },
                      { label: "Transit", val: n.transport },
                      { label: "Edu", val: n.education },
                      { label: "Health", val: n.healthcare },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-muted-foreground mb-0.5">
                          <span>{m.label}</span>
                          <span>{m.val}</span>
                        </div>
                        <Progress value={m.val} className="h-1" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Avg: {n.avgPrice}</span>
                    <span className="text-chart-2">{n.growth} YoY</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Seminyak Livability</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={selectedRadar}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Nearby Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={facilityBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis dataKey="type" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={70} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodInsights;

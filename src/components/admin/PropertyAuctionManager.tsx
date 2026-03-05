import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gavel, Timer, TrendingUp, Users, DollarSign, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const auctionStats = [
  { label: "Active Auctions", value: "18", icon: Gavel, color: "text-primary" },
  { label: "Total Bidders", value: "342", icon: Users, color: "text-chart-2" },
  { label: "Avg Bid Premium", value: "+8.4%", icon: TrendingUp, color: "text-chart-3" },
  { label: "Total Volume (MTD)", value: "Rp 127B", icon: DollarSign, color: "text-chart-4" },
];

const activeAuctions = [
  { id: "AUC-089", property: "Villa Seminyak Oceanfront", startPrice: "Rp 12.5B", currentBid: "Rp 14.8B", bidders: 12, timeLeft: "2h 34m", status: "Live" },
  { id: "AUC-088", property: "Penthouse SCBD Tower A", startPrice: "Rp 28B", currentBid: "Rp 31.2B", bidders: 8, timeLeft: "5h 12m", status: "Live" },
  { id: "AUC-087", property: "Land 2000sqm Ubud", startPrice: "Rp 4.2B", currentBid: "Rp 4.9B", bidders: 15, timeLeft: "1d 3h", status: "Live" },
  { id: "AUC-086", property: "Commercial Shophouse PIK", startPrice: "Rp 8.8B", currentBid: "Rp 8.8B", bidders: 3, timeLeft: "2d 8h", status: "Starting" },
  { id: "AUC-085", property: "Townhouse BSD Unit 12", startPrice: "Rp 2.1B", currentBid: "Rp 2.6B", bidders: 22, timeLeft: "Ended", status: "Sold" },
];

const monthlyAuctions = [
  { month: "Jan", listed: 12, sold: 9, withdrawn: 2 },
  { month: "Feb", listed: 15, sold: 11, withdrawn: 3 },
  { month: "Mar", listed: 18, sold: 14, withdrawn: 1 },
  { month: "Apr", listed: 14, sold: 10, withdrawn: 2 },
  { month: "May", listed: 20, sold: 16, withdrawn: 2 },
  { month: "Jun", listed: 22, sold: 18, withdrawn: 1 },
];

const bidActivity = [
  { hour: "9AM", bids: 12 },
  { hour: "10AM", bids: 28 },
  { hour: "11AM", bids: 45 },
  { hour: "12PM", bids: 32 },
  { hour: "1PM", bids: 38 },
  { hour: "2PM", bids: 52 },
  { hour: "3PM", bids: 61 },
  { hour: "4PM", bids: 48 },
  { hour: "5PM", bids: 35 },
];

const statusColor = (s: string) => {
  switch (s) {
    case "Live": return "destructive";
    case "Sold": return "outline";
    default: return "secondary";
  }
};

const PropertyAuctionManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Property Auctions</h2>
        <p className="text-muted-foreground text-sm">Live auction management, bid tracking, and auction analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {auctionStats.map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Active Auctions
            <Badge className="text-[10px] bg-destructive/20 text-destructive border-destructive/30 animate-pulse">● LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAuctions.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <Gavel className="h-4 w-4 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{a.id}</span>
                      <Badge variant={statusColor(a.status) as any} className="text-[10px]">{a.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.property}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <div className="text-right">
                    <p className="text-muted-foreground">Start: {a.startPrice}</p>
                    <p className="font-medium text-foreground">Current: {a.currentBid}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">{a.bidders} bidders</p>
                    <p className={`font-medium ${a.timeLeft === "Ended" ? "text-muted-foreground" : "text-chart-3"}`}>
                      <Timer className="h-3 w-3 inline mr-0.5" />{a.timeLeft}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Auction Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyAuctions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="listed" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sold" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawn" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today's Bid Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={bidActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Line type="monotone" dataKey="bids" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyAuctionManager;

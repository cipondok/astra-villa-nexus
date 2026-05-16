import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Search, MapPin, Filter, Heart, Phone, Eye, Calendar,
  TrendingUp, ArrowUpRight, Clock, Home, Building2, Star, Bookmark
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const searchConversionData = [
  { day: "Mon", searches: 320, inquiries: 48, viewings: 12 },
  { day: "Tue", searches: 380, inquiries: 55, viewings: 18 },
  { day: "Wed", searches: 290, inquiries: 42, viewings: 10 },
  { day: "Thu", searches: 410, inquiries: 62, viewings: 22 },
  { day: "Fri", searches: 350, inquiries: 51, viewings: 15 },
  { day: "Sat", searches: 520, inquiries: 78, viewings: 28 },
  { day: "Sun", searches: 480, inquiries: 72, viewings: 25 },
];

const mockListings = [
  { id: 1, title: "Modern 3BR Villa", location: "Seminyak", price: "Rp 4.2B", type: "Villa", beds: 3, score: 92, saved: true },
  { id: 2, title: "Luxury Penthouse", location: "Canggu", price: "Rp 6.8B", type: "Apartment", beds: 4, score: 88, saved: false },
  { id: 3, title: "Beachfront House", location: "Nusa Dua", price: "Rp 8.5B", type: "House", beds: 5, score: 85, saved: false },
  { id: 4, title: "Cozy Studio", location: "Ubud", price: "Rp 1.2B", type: "Apartment", beds: 1, score: 78, saved: true },
];

const recentViewed = [
  { title: "Ocean View Villa", location: "Jimbaran", price: "Rp 5.1B", time: "2h ago" },
  { title: "Garden Apartment", location: "Sanur", price: "Rp 2.3B", time: "5h ago" },
  { title: "Hillside Retreat", location: "Ubud", price: "Rp 3.7B", time: "1d ago" },
];

const filters = ["All", "Villa", "Apartment", "House", "Land"];
const priceFilters = ["Any", "< 2B", "2–5B", "5–10B", "> 10B"];

const metrics = {
  searchToInquiry: 14.8, inquiryToViewing: 32.5, viewingToOffer: 18.2,
  avgSearchesPerUser: 4.2, saveRate: 28, contactRate: 12,
};

const BuyerSearchConversion: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activePrice, setActivePrice] = useState("Any");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Buyer Search Conversion
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Property discovery & inquiry optimization</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">
          {metrics.searchToInquiry}% Conversion
        </Badge>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Search → Inquiry", value: `${metrics.searchToInquiry}%` },
          { label: "Inquiry → Viewing", value: `${metrics.inquiryToViewing}%` },
          { label: "Viewing → Offer", value: `${metrics.viewingToOffer}%` },
          { label: "Avg Searches", value: metrics.avgSearchesPerUser },
          { label: "Save Rate", value: `${metrics.saveRate}%` },
          { label: "Contact Rate", value: `${metrics.contactRate}%` },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-2 text-center">
              <div className="text-sm font-bold text-foreground">{m.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Search Activity & Conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={searchConversionData}>
              <defs>
                <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 11 }} />
              <Area type="monotone" dataKey="searches" stroke="hsl(var(--primary))" fill="url(#searchGrad)" strokeWidth={2} name="Searches" />
              <Area type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} strokeWidth={2} name="Inquiries" />
              <Area type="monotone" dataKey="viewings" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} name="Viewings" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search + Filters Demo */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by location, property name, or keyword..." className="pl-10" />
            <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-1">
              {filters.map(f => (
                <Badge key={f} variant={activeFilter === f ? "default" : "secondary"}
                  onClick={() => setActiveFilter(f)} className="cursor-pointer text-[10px]">{f}</Badge>
              ))}
            </div>
            <div className="flex gap-1">
              {priceFilters.map(p => (
                <Badge key={p} variant={activePrice === p ? "default" : "secondary"}
                  onClick={() => setActivePrice(p)} className="cursor-pointer text-[10px]">{p}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Results Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          {mockListings.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="border-border/50 hover:shadow-md transition-shadow group cursor-pointer">
                <div className="h-28 bg-muted rounded-t-lg relative flex items-center justify-center">
                  <Home className="h-6 w-6 text-muted-foreground" />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[8px]">{l.type}</Badge>
                  </div>
                  <button className="absolute top-2 right-2">
                    <Heart className={`h-4 w-4 ${l.saved ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="sm" className="h-6 text-[9px] flex-1">
                      <Calendar className="h-3 w-3 mr-0.5" /> Schedule
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-[9px] flex-1">
                      <Phone className="h-3 w-3 mr-0.5" /> Contact
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2.5">
                  <div className="text-xs font-bold text-foreground truncate">{l.title}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{l.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-bold text-primary">{l.price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 text-chart-1" />
                      <span className="text-[9px] text-foreground">{l.score}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Recently Viewed
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {recentViewed.map((r, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded border border-border/20 hover:bg-muted/20 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-foreground truncate">{r.title}</div>
                    <div className="text-[9px] text-muted-foreground">{r.location} • {r.price}</div>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{r.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <Bookmark className="h-4 w-4 text-primary mb-1" />
              <div className="text-xs font-bold text-foreground">Saved Properties</div>
              <p className="text-[10px] text-muted-foreground mt-1">2 saved listings — send inquiry reminders?</p>
              <Button size="sm" className="mt-2 text-xs h-7 w-full">Send Reminders</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuyerSearchConversion;

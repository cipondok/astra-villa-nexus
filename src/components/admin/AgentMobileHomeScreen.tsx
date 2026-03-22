import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Phone, Calendar, Building2, MessageSquare, DollarSign,
  Plus, FileText, Clock, Eye, ArrowUpRight, Bell, User, MapPin, CheckCircle
} from "lucide-react";

const todayViewings = [
  { time: "09:30", buyer: "Ahmad R.", property: "Villa Seminyak", status: "confirmed", address: "Jl. Raya Seminyak No. 12" },
  { time: "11:00", buyer: "Sarah L.", property: "Penthouse Canggu", status: "pending", address: "Jl. Pantai Berawa No. 45" },
  { time: "14:00", buyer: "David K.", property: "Beach House", status: "confirmed", address: "Jl. Nusa Dua Selatan No. 8" },
  { time: "16:30", buyer: "Lisa M.", property: "Studio Ubud", status: "confirmed", address: "Jl. Monkey Forest No. 22" },
];

const newInquiries = [
  { buyer: "Eko P.", property: "3BR Villa Canggu", time: "12 min ago", intent: "high", budget: "Rp 3.5B" },
  { buyer: "Maria S.", property: "Apartment Seminyak", time: "45 min ago", intent: "medium", budget: "Rp 1.8B" },
  { buyer: "John D.", property: "Land Ubud", time: "2h ago", intent: "high", budget: "Rp 2.2B" },
];

const activeListings = [
  { title: "Modern Villa", location: "Seminyak", views: 342, inquiries: 28 },
  { title: "Canggu Penthouse", location: "Canggu", views: 215, inquiries: 15 },
  { title: "Beach House", location: "Nusa Dua", views: 89, inquiries: 4 },
  { title: "Ubud Retreat", location: "Ubud", views: 156, inquiries: 11 },
];

const activeDeals = [
  { property: "Villa Seminyak", stage: "Negotiation", value: "Rp 4.2B", progress: 65 },
  { property: "Apt Canggu", stage: "Offer Submitted", value: "Rp 1.8B", progress: 40 },
];

const commission = { earned: 45000000, target: 100000000, deals: 3 };
const statusColor = (s: string) => s === "confirmed" ? "bg-chart-1/15 text-chart-1" : "bg-chart-3/15 text-chart-3";
const intentColor = (i: string) => i === "high" ? "bg-destructive/15 text-destructive" : "bg-chart-3/15 text-chart-3";

const AgentMobileHomeScreen: React.FC = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            Agent Mobile Home
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Daily operations command — mobile-optimized</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs animate-pulse">
          <Bell className="h-3 w-3 mr-1" /> 3 New
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Call Buyer", icon: Phone, color: "text-chart-1" },
          { label: "Confirm", icon: CheckCircle, color: "text-primary" },
          { label: "New Listing", icon: Plus, color: "text-chart-2" },
          { label: "Deal Notes", icon: FileText, color: "text-chart-3" },
        ].map((a) => (
          <Button key={a.label} variant="outline" className="h-auto flex-col py-3 gap-1.5">
            <a.icon className={`h-5 w-5 ${a.color}`} />
            <span className="text-[9px]">{a.label}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Today's Viewings
              <Badge variant="secondary" className="text-[9px] ml-auto">{todayViewings.length} scheduled</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {todayViewings.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/30">
                  <CardContent className="p-2.5 flex items-center gap-2">
                    <div className="text-center min-w-[40px]">
                      <Clock className="h-3 w-3 mx-auto text-primary mb-0.5" />
                      <div className="text-xs font-bold text-foreground">{v.time}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-foreground">{v.buyer} — {v.property}</div>
                      <div className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />{v.address}
                      </div>
                    </div>
                    <Badge className={`${statusColor(v.status)} text-[8px]`}>{v.status}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* New Inquiries */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-chart-1" /> New Inquiries
              <Badge className="bg-destructive/15 text-destructive text-[9px] ml-auto">{newInquiries.length} new</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {newInquiries.map((inq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/30">
                  <CardContent className="p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-foreground">{inq.buyer}</span>
                        <Badge className={`${intentColor(inq.intent)} text-[7px]`}>{inq.intent}</Badge>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{inq.time}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{inq.property} • Budget: {inq.budget}</div>
                    <div className="flex gap-1 mt-1.5">
                      <Button size="sm" className="h-6 text-[9px] flex-1">
                        <Phone className="h-2.5 w-2.5 mr-0.5" /> Call
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-[9px] flex-1">
                        <MessageSquare className="h-2.5 w-2.5 mr-0.5" /> Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Active Listings */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> My Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5">
              {activeListings.map((l, i) => (
                <Card key={i} className="border-border/30 cursor-pointer hover:bg-muted/10 transition-colors">
                  <CardContent className="p-2 text-center">
                    <div className="w-full h-12 bg-muted rounded mb-1.5 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-[10px] font-bold text-foreground truncate">{l.title}</div>
                    <div className="text-[9px] text-muted-foreground">{l.location}</div>
                    <div className="flex justify-center gap-2 mt-1">
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5" />{l.views}
                      </span>
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                        <MessageSquare className="h-2.5 w-2.5" />{l.inquiries}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deals + Commission */}
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-chart-2" /> Active Deals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {activeDeals.map((d, i) => (
                <div key={i} className="p-2 rounded border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-foreground">{d.property}</span>
                    <Badge variant="secondary" className="text-[8px]">{d.stage}</Badge>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1">{d.value}</div>
                  <Progress value={d.progress} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-chart-1/20 bg-chart-1/5">
            <CardContent className="p-3">
              <DollarSign className="h-4 w-4 text-chart-1 mb-1" />
              <div className="text-xs font-bold text-foreground">Commission Earnings</div>
              <div className="text-lg font-bold text-chart-1 mt-1">
                Rp {(commission.earned / 1000000).toFixed(0)}M
              </div>
              <div className="flex items-center justify-between mt-1.5 mb-1">
                <span className="text-[9px] text-muted-foreground">Target: Rp {(commission.target / 1000000).toFixed(0)}M</span>
                <span className="text-[9px] font-bold text-foreground">{Math.round((commission.earned / commission.target) * 100)}%</span>
              </div>
              <Progress value={(commission.earned / commission.target) * 100} className="h-1.5" />
              <div className="text-[9px] text-muted-foreground mt-1">{commission.deals} deals closed this month</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentMobileHomeScreen;

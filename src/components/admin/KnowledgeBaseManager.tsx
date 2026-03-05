import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Video, HelpCircle, Search, ExternalLink, Clock, Users } from "lucide-react";

const articles = [
  { title: "Getting Started with Property Listings", category: "Properties", views: 2450, updated: "2d ago", type: "guide" },
  { title: "KYC Verification Process Explained", category: "Verification", views: 1820, updated: "5d ago", type: "guide" },
  { title: "How to Use the Mortgage Calculator", category: "Tools", views: 1560, updated: "1w ago", type: "tutorial" },
  { title: "Understanding ASTRA Token Rewards", category: "Tokens", views: 1340, updated: "3d ago", type: "guide" },
  { title: "Property Survey Booking Guide", category: "Bookings", views: 980, updated: "1w ago", type: "tutorial" },
  { title: "Agent Registration & Approval", category: "Agents", views: 870, updated: "4d ago", type: "guide" },
  { title: "Payment Methods & Security", category: "Payments", views: 760, updated: "2w ago", type: "faq" },
  { title: "VR Tour Setup Instructions", category: "Features", views: 650, updated: "1w ago", type: "tutorial" },
];

const faqs = [
  { q: "How do I reset a user's password?", a: "Go to User Management → Find user → Actions → Reset Password. An email will be sent automatically.", views: 420 },
  { q: "How to approve a vendor application?", a: "Navigate to Vendors Hub → Pending Applications → Review documents → Approve/Reject with notes.", views: 385 },
  { q: "What are the KPR eligibility requirements?", a: "Users need: valid KTP, min income Rp 5M/month, employment proof, and credit score check.", views: 340 },
  { q: "How to handle a refund request?", a: "Rental Management → Refund Requests → Review booking details → Process refund via payment gateway.", views: 298 },
  { q: "How do I generate system reports?", a: "Tools Management → Report Export → Select tables/date range → Export as CSV or JSON.", views: 265 },
];

const videoTutorials = [
  { title: "Admin Dashboard Walkthrough", duration: "12:45", views: 890, category: "Overview" },
  { title: "Property Management Deep Dive", duration: "18:20", views: 720, category: "Properties" },
  { title: "User Verification Workflow", duration: "8:15", views: 650, category: "Verification" },
  { title: "Analytics & Reporting Guide", duration: "15:30", views: 580, category: "Analytics" },
  { title: "Setting Up Payment Gateways", duration: "10:00", views: 420, category: "Payments" },
];

const typeIcon: Record<string, React.ReactNode> = {
  guide: <BookOpen className="h-3.5 w-3.5 text-primary" />,
  tutorial: <FileText className="h-3.5 w-3.5 text-chart-2" />,
  faq: <HelpCircle className="h-3.5 w-3.5 text-chart-3" />,
};

const KnowledgeBaseManager = () => {
  const [search, setSearch] = useState("");
  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Knowledge Base</h2>
        <p className="text-sm text-muted-foreground">Help articles, FAQs, and video tutorials for platform users and admins</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <BookOpen className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{articles.length}</p>
          <p className="text-[10px] text-muted-foreground">Articles</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <HelpCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{faqs.length}</p>
          <p className="text-[10px] text-muted-foreground">FAQs</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Video className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-chart-3">{videoTutorials.length}</p>
          <p className="text-[10px] text-muted-foreground">Video Tutorials</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">12.4K</p>
          <p className="text-[10px] text-muted-foreground">Total Views</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-3">
        <TabsList className="inline-flex h-8 gap-0.5 bg-muted/40 p-0.5 rounded-md border border-border/30">
          <TabsTrigger value="articles" className="text-[11px] h-7 px-3">Articles</TabsTrigger>
          <TabsTrigger value="faqs" className="text-[11px] h-7 px-3">FAQs</TabsTrigger>
          <TabsTrigger value="videos" className="text-[11px] h-7 px-3">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
          </div>
          <div className="space-y-2">
            {filtered.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 cursor-pointer transition-colors">
                {typeIcon[a.type]}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{a.title}</p>
                  <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <Badge variant="outline" className="text-[9px]">{a.category}</Badge>
                    <span>{a.views.toLocaleString()} views</span>
                    <span><Clock className="h-2.5 w-2.5 inline" /> {a.updated}</span>
                  </div>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-2">
          {faqs.map((f, i) => (
            <Card key={i} className="border-border/40">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-foreground">{f.q}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{f.a}</p>
                <span className="text-[10px] text-muted-foreground mt-1 inline-block">{f.views} views</span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="videos" className="space-y-2">
          {videoTutorials.map((v, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                <Video className="h-4 w-4 text-chart-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{v.title}</p>
                <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <Badge variant="outline" className="text-[9px]">{v.category}</Badge>
                  <span>{v.duration}</span>
                  <span>{v.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBaseManager;

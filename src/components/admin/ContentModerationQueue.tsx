import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, CheckCircle, XCircle, Eye, Flag, Clock, AlertTriangle, Image, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ModerationItem {
  id: string;
  type: "listing" | "review" | "image" | "message";
  title: string;
  content: string;
  reportedBy: string;
  reportReason: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  severity: "low" | "medium" | "high" | "critical";
  submitterName: string;
}

const initialItems: ModerationItem[] = [
  { id: "1", type: "listing", title: "Luxury Villa in Seminyak", content: "Suspicious pricing: Rp 50,000 for a villa. Possible scam listing with fake images.", reportedBy: "user-42", reportReason: "Suspicious pricing", submittedAt: "2026-03-05 09:30", status: "pending", severity: "high", submitterName: "Ahmad R." },
  { id: "2", type: "review", title: "Review on Agent Budi", content: "Contains profanity and personal attacks against the agent.", reportedBy: "user-18", reportReason: "Inappropriate language", submittedAt: "2026-03-05 08:15", status: "pending", severity: "medium", submitterName: "Siti M." },
  { id: "3", type: "image", title: "Property Photo - Kuta Beach", content: "Image appears to be stock photo from shutterstock with watermark visible.", reportedBy: "auto-detect", reportReason: "Stock photo detected", submittedAt: "2026-03-04 22:45", status: "pending", severity: "low", submitterName: "System AI" },
  { id: "4", type: "message", title: "Chat Message in Inquiry", content: "User sending external links and phone numbers to bypass platform.", reportedBy: "user-67", reportReason: "Platform bypass attempt", submittedAt: "2026-03-04 20:10", status: "escalated", severity: "high", submitterName: "Dewi K." },
  { id: "5", type: "listing", title: "Apartment Sudirman Central", content: "Duplicate listing posted 5 times with slightly different titles to spam search.", reportedBy: "auto-detect", reportReason: "Duplicate/spam listing", submittedAt: "2026-03-04 18:00", status: "pending", severity: "medium", submitterName: "System AI" },
  { id: "6", type: "review", title: "Review on Property #2847", content: "Fake positive review from account created same day as listing.", reportedBy: "auto-detect", reportReason: "Fake review", submittedAt: "2026-03-04 15:30", status: "rejected", severity: "high", submitterName: "System AI" },
];

const typeIcons = { listing: Flag, review: MessageSquare, image: Image, message: MessageSquare };
const severityColors = { low: "secondary", medium: "outline", high: "destructive", critical: "destructive" } as const;

const ContentModerationQueue = () => {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("pending");

  const filtered = items.filter(i => {
    if (tab !== "all" && i.status !== tab) return false;
    if (filter !== "all" && i.type !== filter) return false;
    return true;
  });

  const handleAction = (id: string, action: "approved" | "rejected" | "escalated") => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: action } : i));
    toast.success(`Item ${action}`);
  };

  const pendingCount = items.filter(i => i.status === "pending").length;
  const escalatedCount = items.filter(i => i.status === "escalated").length;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Content Moderation Queue</h2>
          <p className="text-sm text-muted-foreground">Review flagged content across the platform</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="listing">Listings</SelectItem>
            <SelectItem value="review">Reviews</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-2xl font-bold text-chart-3">{pendingCount}</p>
          <p className="text-[10px] text-muted-foreground">Pending Review</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-2xl font-bold text-destructive">{escalatedCount}</p>
          <p className="text-[10px] text-muted-foreground">Escalated</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-2xl font-bold text-chart-2">{items.filter(i => i.status === "approved").length}</p>
          <p className="text-[10px] text-muted-foreground">Approved</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <XCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold text-foreground">{items.filter(i => i.status === "rejected").length}</p>
          <p className="text-[10px] text-muted-foreground">Rejected</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="escalated">Escalated ({escalatedCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-3 mt-3">
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No items in this queue</p>}
          {filtered.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <Card key={item.id} className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                        <Badge variant={severityColors[item.severity]} className="text-[9px]">{item.severity}</Badge>
                        <Badge variant="outline" className="text-[9px]">{item.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.content}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>Reported: {item.reportReason}</span>
                        <span>By: {item.submitterName}</span>
                        <span>{item.submittedAt}</span>
                      </div>
                    </div>
                    {item.status === "pending" || item.status === "escalated" ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="outline" className="h-7 text-xs text-chart-2" onClick={() => handleAction(item.id, "approved")}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => handleAction(item.id, "rejected")}>
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                        {item.status !== "escalated" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleAction(item.id, "escalated")}>
                            <AlertTriangle className="h-3 w-3 mr-1" /> Escalate
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Badge variant={item.status === "approved" ? "default" : "secondary"} className="text-[10px] shrink-0">{item.status}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentModerationQueue;

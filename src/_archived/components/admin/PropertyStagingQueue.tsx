import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Image, CheckCircle, Clock, AlertTriangle, Eye, Camera, Sparkles, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface StagingItem {
  id: string;
  property: string;
  owner: string;
  photosSubmitted: number;
  photosApproved: number;
  status: "pending_review" | "staging_in_progress" | "completed" | "needs_reshoot";
  priority: "normal" | "high" | "urgent";
  submittedAt: string;
  qualityScore: number | null;
}

const initialItems: StagingItem[] = [
  { id: "1", property: "The Grove Suites A-1204", owner: "Ahmad Rizki", photosSubmitted: 12, photosApproved: 0, status: "pending_review", priority: "urgent", submittedAt: "2026-03-05 10:00", qualityScore: null },
  { id: "2", property: "Pacific Place B-805", owner: "Sarah Dewi", photosSubmitted: 18, photosApproved: 15, status: "staging_in_progress", priority: "high", submittedAt: "2026-03-04 14:00", qualityScore: 78 },
  { id: "3", property: "Sudirman Hill C-302", owner: "Michael Tan", photosSubmitted: 8, photosApproved: 8, status: "completed", priority: "normal", submittedAt: "2026-03-03 09:00", qualityScore: 92 },
  { id: "4", property: "Kemang Village D-1501", owner: "Putri Anggraini", photosSubmitted: 15, photosApproved: 10, status: "needs_reshoot", priority: "high", submittedAt: "2026-03-04 11:00", qualityScore: 45 },
  { id: "5", property: "Menteng Park E-607", owner: "David Lim", photosSubmitted: 20, photosApproved: 18, status: "completed", priority: "normal", submittedAt: "2026-03-02 16:00", qualityScore: 88 },
  { id: "6", property: "Ciputra World F-2301", owner: "Rina Sari", photosSubmitted: 10, photosApproved: 0, status: "pending_review", priority: "normal", submittedAt: "2026-03-05 11:30", qualityScore: null },
];

const weeklyStats = [
  { day: "Mon", submitted: 8, approved: 5, rejected: 1 },
  { day: "Tue", submitted: 12, approved: 9, rejected: 2 },
  { day: "Wed", submitted: 10, approved: 8, rejected: 1 },
  { day: "Thu", submitted: 15, approved: 11, rejected: 3 },
  { day: "Fri", submitted: 11, approved: 10, rejected: 1 },
  { day: "Sat", submitted: 5, approved: 4, rejected: 0 },
  { day: "Sun", submitted: 3, approved: 2, rejected: 0 },
];

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_review: "secondary", staging_in_progress: "default", completed: "default", needs_reshoot: "destructive"
};
const statusLabel: Record<string, string> = {
  pending_review: "Pending", staging_in_progress: "In Progress", completed: "Completed", needs_reshoot: "Reshoot"
};

const PropertyStagingQueue = () => {
  const [items, setItems] = useState(initialItems);
  const pending = items.filter(i => i.status === "pending_review").length;
  const completed = items.filter(i => i.status === "completed").length;
  const avgQuality = Math.round(items.filter(i => i.qualityScore !== null).reduce((s, i) => s + (i.qualityScore || 0), 0) / items.filter(i => i.qualityScore !== null).length);

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "staging_in_progress" as const, qualityScore: 75 } : i));
    toast.success("Photos approved, staging started");
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Property Staging Queue</h2>
        <p className="text-sm text-muted-foreground">Photo review, AI staging, and quality assessment</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-chart-3">{pending}</p>
          <p className="text-[10px] text-muted-foreground">Pending Review</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Sparkles className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{items.filter(i => i.status === "staging_in_progress").length}</p>
          <p className="text-[10px] text-muted-foreground">In Progress</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{completed}</p>
          <p className="text-[10px] text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Camera className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{avgQuality}/100</p>
          <p className="text-[10px] text-muted-foreground">Avg Quality</p>
        </CardContent></Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Photo Volume</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="submitted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Submitted" />
              <Bar dataKey="approved" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Approved" />
              <Bar dataKey="rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0"><Image className="h-4 w-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{item.property}</span>
                    <Badge variant={statusBadge[item.status]} className="text-[9px]">{statusLabel[item.status]}</Badge>
                    {item.priority !== "normal" && <Badge variant="destructive" className="text-[8px]">{item.priority}</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Owner: {item.owner} • {item.submittedAt}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span>{item.photosSubmitted} submitted</span>
                    <span className="text-chart-2">{item.photosApproved} approved</span>
                    {item.qualityScore !== null && (
                      <span className={item.qualityScore >= 80 ? "text-chart-2" : item.qualityScore >= 60 ? "text-chart-3" : "text-destructive"}>
                        Quality: {item.qualityScore}/100
                      </span>
                    )}
                  </div>
                  {item.qualityScore !== null && <Progress value={item.qualityScore} className="h-1 mt-1.5" />}
                </div>
                {item.status === "pending_review" && (
                  <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => handleApprove(item.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />Approve
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertyStagingQueue;

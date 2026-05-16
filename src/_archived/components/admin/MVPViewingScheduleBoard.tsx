import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, Clock, RefreshCw, StickyNote, MapPin, User } from "lucide-react";

const MOCK_VIEWINGS = [
  { id: "V-001", buyer: "Ahmad Rizky", property: "Modern Apartment Kemang", agent: "Rina S.", date: "2026-03-22", time: "10:00", status: "scheduled", notes: "" },
  { id: "V-002", buyer: "Sarah Chen", property: "Villa Bali Style Canggu", agent: "Budi W.", date: "2026-03-22", time: "14:00", status: "scheduled", notes: "" },
  { id: "V-003", buyer: "Putri Wulandari", property: "Townhouse BSD City", agent: "Andi P.", date: "2026-03-23", time: "09:00", status: "scheduled", notes: "" },
  { id: "V-004", buyer: "James Wong", property: "Land Plot Serpong", agent: "Budi W.", date: "2026-03-21", time: "11:00", status: "completed", notes: "Buyer interested, wants second visit" },
  { id: "V-005", buyer: "Michael Tan", property: "Office Space Sudirman", agent: "Dewi L.", date: "2026-03-20", time: "15:00", status: "completed", notes: "Buyer concerns about parking" },
];

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const MVPViewingScheduleBoard = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? MOCK_VIEWINGS : MOCK_VIEWINGS.filter(v => v.status === filter);

  const today = MOCK_VIEWINGS.filter(v => v.date === "2026-03-22").length;
  const scheduled = MOCK_VIEWINGS.filter(v => v.status === "scheduled").length;
  const completed = MOCK_VIEWINGS.filter(v => v.status === "completed").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{today}</p>
          <p className="text-xs text-muted-foreground">Today's Viewings</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{scheduled}</p>
          <p className="text-xs text-muted-foreground">Scheduled</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </CardContent></Card>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Viewing Schedule</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Viewing cards */}
      <div className="space-y-3">
        {filtered.map(v => (
          <Card key={v.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{v.property}</h3>
                    <Badge variant="outline" className={statusColors[v.status]}>{v.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{v.buyer}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.agent}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{v.date} at {v.time}</span>
                  </div>
                  {v.notes && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><StickyNote className="h-3 w-3" />{v.notes}</p>}
                </div>
                <div className="flex gap-2">
                  {v.status === "scheduled" && (
                    <>
                      <Button size="sm" variant="outline"><CheckCircle className="h-3.5 w-3.5 mr-1" /> Confirm</Button>
                      <Button size="sm" variant="ghost"><RefreshCw className="h-3.5 w-3.5 mr-1" /> Reschedule</Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost"><StickyNote className="h-3.5 w-3.5 mr-1" /> Notes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MVPViewingScheduleBoard;

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MessageCircle, Star, Users, Clock, CheckCircle } from "lucide-react";

const MOCK_INQUIRIES = [
  { id: "INQ-001", buyer: "Ahmad Rizky", phone: "+62812345678", property: "Modern Apartment Kemang", date: "2026-03-22", status: "new" },
  { id: "INQ-002", buyer: "Sarah Chen", phone: "+62811223344", property: "Villa Bali Style Canggu", date: "2026-03-22", status: "new" },
  { id: "INQ-003", buyer: "Michael Tan", phone: "+62819876543", property: "Office Space Sudirman", date: "2026-03-21", status: "contacted" },
  { id: "INQ-004", buyer: "Putri Wulandari", phone: "+62813456789", property: "Townhouse BSD City", date: "2026-03-21", status: "viewing_set" },
  { id: "INQ-005", buyer: "David Lee", phone: "+62817654321", property: "Studio Menteng Park", date: "2026-03-20", status: "contacted" },
  { id: "INQ-006", buyer: "Anisa Fitri", phone: "+62815432109", property: "Modern Apartment Kemang", date: "2026-03-20", status: "new" },
  { id: "INQ-007", buyer: "James Wong", phone: "+62818765432", property: "Land Plot Serpong", date: "2026-03-19", status: "viewing_set" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  viewing_set: { label: "Viewing Set", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

const MVPBuyerInquiryTracker = () => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? MOCK_INQUIRIES : MOCK_INQUIRIES.filter(i => i.status === filter);
  const newCount = MOCK_INQUIRIES.filter(i => i.status === "new").length;
  const contactedCount = MOCK_INQUIRIES.filter(i => i.status === "contacted").length;
  const viewingCount = MOCK_INQUIRIES.filter(i => i.status === "viewing_set").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{MOCK_INQUIRIES.length}</p>
          <p className="text-xs text-muted-foreground">Total Inquiries</p>
        </CardContent></Card>
        <Card className="border-blue-200 dark:border-blue-800"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{newCount}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Clock className="h-3 w-3" /> New</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{contactedCount}</p>
          <p className="text-xs text-muted-foreground">Contacted</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{viewingCount}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><CheckCircle className="h-3 w-3" /> Viewing Set</p>
        </CardContent></Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Buyer Inquiries</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="viewing_set">Viewing Set</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(inq => (
                <TableRow key={inq.id}>
                  <TableCell className="font-medium">{inq.buyer}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{inq.phone}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{inq.property}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{inq.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[inq.status]?.color}>{statusConfig[inq.status]?.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" title="Call"><Phone className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon-sm" title="WhatsApp" className="text-green-600"><MessageCircle className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon-sm" title="Mark serious"><Star className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MVPBuyerInquiryTracker;

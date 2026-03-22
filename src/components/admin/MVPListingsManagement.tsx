import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Image, Search, Building } from "lucide-react";

const MOCK_LISTINGS = [
  { id: "L-001", title: "Modern Apartment Kemang", price: 2500000000, district: "Kemang", agent: "Rina S.", inquiries: 12, status: "active" },
  { id: "L-002", title: "Villa Bali Style Canggu", price: 8500000000, district: "Canggu", agent: "Budi W.", inquiries: 8, status: "active" },
  { id: "L-003", title: "Office Space Sudirman", price: 15000000000, district: "Sudirman", agent: "Dewi L.", inquiries: 3, status: "active" },
  { id: "L-004", title: "Townhouse BSD City", price: 1800000000, district: "BSD", agent: "Andi P.", inquiries: 19, status: "sold" },
  { id: "L-005", title: "Studio Menteng Park", price: 950000000, district: "Menteng", agent: "Rina S.", inquiries: 6, status: "active" },
  { id: "L-006", title: "Land Plot Serpong", price: 3200000000, district: "Serpong", agent: "Budi W.", inquiries: 2, status: "active" },
];

const formatPrice = (n: number) => `Rp ${(n / 1e9).toFixed(1)}B`;

const MVPListingsManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = MOCK_LISTINGS.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.district.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = MOCK_LISTINGS.filter(l => l.status === "active").length;
  const totalInquiries = MOCK_LISTINGS.reduce((s, l) => s + l.inquiries, 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{MOCK_LISTINGS.length}</p>
          <p className="text-xs text-muted-foreground">Total Listings</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalInquiries}</p>
          <p className="text-xs text-muted-foreground">Total Inquiries</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">4</p>
          <p className="text-xs text-muted-foreground">Districts</p>
        </CardContent></Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-1 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Listing</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Add New Property</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Property title" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Price (Rp)" type="number" />
                    <Input placeholder="District" />
                  </div>
                  <Select><SelectTrigger><SelectValue placeholder="Property type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors">
                    <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Drag & drop photos or click to upload</p>
                  </div>
                  <Input placeholder="Assign agent" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                    <Button onClick={() => setShowAdd(false)}>Save Listing</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Listings table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4" /> Property Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">District</TableHead>
                <TableHead className="hidden md:table-cell">Agent</TableHead>
                <TableHead>Inquiries</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatPrice(l.price)}</TableCell>
                  <TableCell className="hidden md:table-cell">{l.district}</TableCell>
                  <TableCell className="hidden md:table-cell">{l.agent}</TableCell>
                  <TableCell><Badge variant="secondary">{l.inquiries}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={l.status === "active" ? "default" : "outline"} className={l.status === "sold" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}>
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell><Button variant="ghost" size="icon-sm"><Edit2 className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MVPListingsManagement;

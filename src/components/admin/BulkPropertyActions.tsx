import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Building2, Search, Download, RefreshCw, CheckCircle, Trash2, Eye, EyeOff, Layers } from "lucide-react";
import { format } from "date-fns";

const BulkPropertyActions = () => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 30;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["bulk-properties", statusFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select("id, title, status, property_type, city, price, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { properties: data || [], total: count || 0 };
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from("properties")
        .update(updates)
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulk-properties"] });
      setSelectedIds(new Set());
      toast.success("Properties updated successfully");
    },
    onError: (err) => toast.error(`Update failed: ${err.message}`),
  });

  const properties = (data?.properties || []).filter(
    (p) =>
      !searchTerm ||
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map((p) => p.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return toast.warning("Select properties first");

    switch (action) {
      case "activate":
        bulkUpdateMutation.mutate({ ids, updates: { status: "active" } });
        break;
      case "deactivate":
        bulkUpdateMutation.mutate({ ids, updates: { status: "inactive" } });
        break;
      case "mark-sold":
        bulkUpdateMutation.mutate({ ids, updates: { status: "sold" } });
        break;
      case "feature":
        bulkUpdateMutation.mutate({ ids, updates: { is_featured: true } });
        break;
      case "unfeature":
        bulkUpdateMutation.mutate({ ids, updates: { is_featured: false } });
        break;
    }
  };

  const handleExport = () => {
    const rows = properties.filter((p) => selectedIds.size === 0 || selectedIds.has(p.id));
    const csv = [
      "ID,Title,Status,Type,City,Price,Created",
      ...rows.map((p) =>
        [p.id, `"${p.title || ""}"`, p.status, p.property_type, p.city, p.price, p.created_at].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `properties-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);
  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Bulk Property Actions</h2>
          {selectedCount > 0 && (
            <Badge className="text-xs">{selectedCount} selected</Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search title or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleBulkAction("activate")}>
          <Eye className="h-3 w-3 mr-1" /> Activate
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleBulkAction("deactivate")}>
          <EyeOff className="h-3 w-3 mr-1" /> Deactivate
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleBulkAction("mark-sold")}>
          <CheckCircle className="h-3 w-3 mr-1" /> Mark Sold
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleBulkAction("feature")}>
          ⭐ Feature
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleExport}>
          <Download className="h-3 w-3 mr-1" /> Export
        </Button>
      </div>

      {/* Property list */}
      <Card className="border-border/40">
        <CardContent className="p-0">
          <ScrollArea className="h-[480px]">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-muted/30 sticky top-0 z-10">
              <Checkbox checked={selectedIds.size === properties.length && properties.length > 0} onCheckedChange={toggleAll} />
              <span className="text-[10px] font-medium text-muted-foreground flex-1">PROPERTY</span>
              <span className="text-[10px] font-medium text-muted-foreground w-20 text-center">STATUS</span>
              <span className="text-[10px] font-medium text-muted-foreground w-24 text-right">PRICE</span>
              <span className="text-[10px] font-medium text-muted-foreground w-16 text-right">DATE</span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : properties.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No properties found</div>
            ) : (
              properties.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-border/20 hover:bg-muted/20 transition-colors ${selectedIds.has(p.id) ? "bg-primary/5" : ""}`}
                >
                  <Checkbox checked={selectedIds.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.title || "Untitled"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.property_type} · {p.city || "—"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`w-20 justify-center text-[10px] ${
                      p.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                      p.status === "sold" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400" :
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.status}
                  </Badge>
                  <span className="w-24 text-right text-xs text-foreground font-mono">
                    {p.price ? new Intl.NumberFormat("id-ID", { notation: "compact" }).format(Number(p.price)) : "—"}
                  </span>
                  <span className="w-16 text-right text-[10px] text-muted-foreground">{p.created_at ? format(new Date(p.created_at), "MM/dd") : "—"}</span>
                </div>
              ))
            )}
          </ScrollArea>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-border/30">
              <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkPropertyActions;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIDR } from "@/lib/format";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Villa } from "@/features/villas/useVillas";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Villa[];
    },
  });

  const { data: leadCount = 0 } = useQuery({
    queryKey: ["admin-lead-count"],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new");
      return count ?? 0;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast({ title: "Property deleted" });
    },
    onError: (err: any) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {properties.length} total · <Link to="/admin/leads" className="underline">{leadCount} new leads</Link>
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/properties/new"><Plus className="h-4 w-4 mr-2" /> New property</Link>
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
            ) : properties.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No properties yet. Create your first one.</TableCell></TableRow>
            ) : properties.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{p.city}</TableCell>
                <TableCell>{p.listing_type}</TableCell>
                <TableCell>{formatIDR(p.price_idr)}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild size="sm" variant="ghost"><Link to={`/admin/properties/${p.id}`}><Pencil className="h-3.5 w-3.5" /></Link></Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id);
                  }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

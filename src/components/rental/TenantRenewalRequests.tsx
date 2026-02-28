import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Price from "@/components/ui/Price";
import { useState } from "react";

const statusColors: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu Respon", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  accepted: { label: "Diterima", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const TenantRenewalRequests = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [tenantResponse, setTenantResponse] = useState("");

  const { data: renewals = [], isLoading } = useQuery({
    queryKey: ["renewal-requests", "tenant", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("renewal_requests" as any)
        .select("*")
        .eq("tenant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const respond = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("renewal_requests" as any)
        .update({
          status,
          tenant_response: tenantResponse || null,
          responded_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      showSuccess("Berhasil", status === "accepted" ? "Perpanjangan diterima" : "Perpanjangan ditolak");
      queryClient.invalidateQueries({ queryKey: ["renewal-requests"] });
      setRespondingId(null);
      setTenantResponse("");
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  if (renewals.length === 0) {
    return (
      <Card className="p-8 border-border">
        <div className="text-center">
          <RotateCcw className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Tidak Ada Penawaran</h3>
          <p className="text-xs text-muted-foreground">Penawaran perpanjangan sewa dari pemilik akan muncul di sini.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Penawaran Perpanjangan Sewa</h3>
      {renewals.map((r: any) => {
        const st = statusColors[r.status] || statusColors.pending;
        const StIcon = st.icon;
        const isPending = r.status === "pending";

        return (
          <Card key={r.id} className="p-4 border-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-xs font-medium text-foreground">
                  {r.proposed_start_date} → {r.proposed_end_date}
                </p>
                <p className="text-sm font-semibold text-primary mt-0.5"><Price amount={r.proposed_price} /></p>
                {r.original_price && r.proposed_price !== r.original_price && (
                  <p className="text-[10px] text-muted-foreground line-through"><Price amount={r.original_price} /></p>
                )}
              </div>
              <Badge className={`${st.color} text-[9px] border`}>
                <StIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
              </Badge>
            </div>
            {r.owner_notes && (
              <div className="bg-muted/50 rounded-md p-2 text-xs text-foreground mb-3">
                <span className="font-medium">Dari pemilik: </span>{r.owner_notes}
              </div>
            )}
            {isPending && (
              <div className="space-y-2 border-t border-border pt-3">
                <Textarea
                  placeholder="Pesan balasan (opsional)..."
                  value={respondingId === r.id ? tenantResponse : ""}
                  onChange={e => { setRespondingId(r.id); setTenantResponse(e.target.value); }}
                  className="text-xs min-h-[50px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => { setRespondingId(r.id); respond.mutate({ id: r.id, status: "accepted" }); }}
                    disabled={respond.isPending}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Terima
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => { setRespondingId(r.id); respond.mutate({ id: r.id, status: "rejected" }); }}
                    disabled={respond.isPending}>
                    <XCircle className="h-3 w-3 mr-1" /> Tolak
                  </Button>
                </div>
              </div>
            )}
            {r.tenant_response && !isPending && (
              <p className="text-[10px] text-muted-foreground mt-1">Balasan: "{r.tenant_response}"</p>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TenantRenewalRequests;

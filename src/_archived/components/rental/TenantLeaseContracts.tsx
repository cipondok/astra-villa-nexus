import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText, CheckCircle, Clock, XCircle, Loader2, PenTool, Eye, Calendar, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Price from "@/components/ui/Price";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border", icon: FileText },
  sent: { label: "Menunggu Tanda Tangan", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  owner_signed: { label: "Owner Sudah TTD", color: "bg-primary/10 text-primary border-primary/20", icon: PenTool },
  fully_signed: { label: "Aktif", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  expired: { label: "Kadaluarsa", color: "bg-muted text-muted-foreground border-border", icon: Clock },
  cancelled: { label: "Dibatalkan", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

interface LeaseContract {
  id: string;
  booking_id: string;
  property_id: string;
  owner_id: string;
  tenant_id: string;
  contract_number: string;
  contract_title: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  payment_due_day: number;
  late_fee_percentage: number;
  terms_and_conditions: string | null;
  special_clauses: string | null;
  property_condition_notes: string | null;
  status: string;
  owner_signed_at: string | null;
  tenant_signed_at: string | null;
  sent_at: string | null;
  created_at: string;
  properties?: { title: string } | null;
  owner_profile?: { full_name: string | null } | null;
}

const TenantLeaseContracts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewContract, setViewContract] = useState<LeaseContract | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["lease-contracts-tenant", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lease_contracts" as any)
        .select("*")
        .eq("tenant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const enriched = await Promise.all((data || []).map(async (c: any) => {
        const [{ data: prop }, { data: owner }] = await Promise.all([
          supabase.from("properties").select("title").eq("id", c.property_id).single(),
          supabase.from("profiles").select("full_name").eq("id", c.owner_id).single(),
        ]);
        return { ...c, properties: prop, owner_profile: owner };
      }));
      return enriched as LeaseContract[];
    },
    enabled: !!user,
  });

  const signContract = useMutation({
    mutationFn: async (contractId: string) => {
      const contract = contracts.find(c => c.id === contractId);
      const newStatus = contract?.owner_signed_at ? "fully_signed" : "sent";
      
      const { error } = await supabase
        .from("lease_contracts" as any)
        .update({
          tenant_signed_at: new Date().toISOString(),
          status: newStatus === "sent" ? "sent" : "fully_signed",
        })
        .eq("id", contractId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Kontrak berhasil ditandatangani secara elektronik");
      queryClient.invalidateQueries({ queryKey: ["lease-contracts-tenant"] });
      setViewContract(null);
      setAgreedTerms(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const pendingContracts = contracts.filter(c => ["sent", "owner_signed"].includes(c.status) && !c.tenant_signed_at);
  const signedContracts = contracts.filter(c => !!c.tenant_signed_at || c.status === "fully_signed");
  const otherContracts = contracts.filter(c => !pendingContracts.includes(c) && !signedContracts.includes(c));

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Perlu Tanda Tangan</p>
          <p className="text-xl font-bold text-chart-3">{pendingContracts.length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Aktif</p>
          <p className="text-xl font-bold text-chart-1">{contracts.filter(c => c.status === "fully_signed").length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-foreground">{contracts.length}</p>
        </Card>
      </div>

      {/* Pending Signatures Alert */}
      {pendingContracts.length > 0 && (
        <Card className="p-3 border-chart-3/30 bg-chart-3/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-chart-3" />
            <p className="text-xs font-semibold text-chart-3">Kontrak Menunggu Tanda Tangan Anda</p>
          </div>
          <div className="space-y-2">
            {pendingContracts.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-background rounded-lg p-2">
                <div>
                  <p className="text-xs font-medium text-foreground">{c.properties?.title}</p>
                  <p className="text-[10px] text-muted-foreground">{c.contract_number}</p>
                </div>
                <Button size="sm" className="h-7 text-[10px] gap-1" onClick={() => { setViewContract(c); setAgreedTerms(false); }}>
                  <PenTool className="h-3 w-3" /> Tinjau & TTD
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contract List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Semua Kontrak</h3>
        {contracts.length === 0 ? (
          <Card className="p-6 border-border text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Belum ada kontrak sewa</p>
          </Card>
        ) : (
          contracts.map(c => {
            const st = statusMap[c.status] || statusMap.draft;
            const StIcon = st.icon;
            return (
              <Card key={c.id} className="p-3 border-border cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => { setViewContract(c); setAgreedTerms(false); }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1">{c.properties?.title}</h4>
                      <Badge className={`${st.color} text-[9px] border`}>
                        <StIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>{c.contract_number}</span>
                      <span>•</span>
                      <span>Owner: {c.owner_profile?.full_name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span className="text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" /> {c.start_date} → {c.end_date}
                      </span>
                      <span className="text-primary font-medium"><Price amount={c.monthly_rent} />/bln</span>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* View & Sign Dialog */}
      <Dialog open={!!viewContract} onOpenChange={o => { if (!o) { setViewContract(null); setAgreedTerms(false); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {viewContract?.contract_title}
            </DialogTitle>
          </DialogHeader>
          {viewContract && (
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">No. Kontrak</p>
                    <p className="text-xs font-medium text-foreground">{viewContract.contract_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Properti</p>
                    <p className="text-xs font-medium text-foreground">{viewContract.properties?.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Pemilik</p>
                    <p className="text-xs text-foreground">{viewContract.owner_profile?.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Periode</p>
                    <p className="text-xs text-foreground">{viewContract.start_date} → {viewContract.end_date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Sewa Bulanan</p>
                    <p className="text-xs font-medium text-primary"><Price amount={viewContract.monthly_rent} /></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Deposit</p>
                    <p className="text-xs text-foreground"><Price amount={viewContract.deposit_amount} /></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Jatuh Tempo</p>
                    <p className="text-xs text-foreground">Tanggal {viewContract.payment_due_day}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Denda Telat</p>
                    <p className="text-xs text-foreground">{viewContract.late_fee_percentage}%</p>
                  </div>
                </div>

                {/* Terms */}
                {viewContract.terms_and_conditions && (
                  <div>
                    <p className="text-[10px] font-semibold text-foreground mb-1">Syarat & Ketentuan</p>
                    <div className="bg-muted/30 rounded-lg p-3 text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                      {viewContract.terms_and_conditions}
                    </div>
                  </div>
                )}

                {viewContract.special_clauses && (
                  <div>
                    <p className="text-[10px] font-semibold text-foreground mb-1">Klausul Khusus</p>
                    <div className="bg-muted/30 rounded-lg p-3 text-xs text-foreground whitespace-pre-wrap">
                      {viewContract.special_clauses}
                    </div>
                  </div>
                )}

                {viewContract.property_condition_notes && (
                  <div>
                    <p className="text-[10px] font-semibold text-foreground mb-1">Kondisi Properti</p>
                    <div className="bg-muted/30 rounded-lg p-3 text-xs text-foreground whitespace-pre-wrap">
                      {viewContract.property_condition_notes}
                    </div>
                  </div>
                )}

                {/* Signatures */}
                <div className="border border-border rounded-lg p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-foreground">Status Tanda Tangan</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Owner:</span>
                    {viewContract.owner_signed_at ? (
                      <span className="text-xs text-chart-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {format(new Date(viewContract.owner_signed_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Belum</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Penyewa (Anda):</span>
                    {viewContract.tenant_signed_at ? (
                      <span className="text-xs text-chart-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {format(new Date(viewContract.tenant_signed_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                      </span>
                    ) : (
                      <span className="text-xs text-chart-3">Belum ditandatangani</span>
                    )}
                  </div>
                </div>

                {/* Sign Action */}
                {!viewContract.tenant_signed_at && ["sent", "owner_signed"].includes(viewContract.status) && (
                  <div className="border-t border-border pt-3 space-y-3">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="agree-terms"
                        checked={agreedTerms}
                        onCheckedChange={(v) => setAgreedTerms(v === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="agree-terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                        Saya telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan dalam kontrak sewa ini. Tanda tangan elektronik ini memiliki kekuatan hukum yang sama dengan tanda tangan basah.
                      </label>
                    </div>
                    <Button
                      className="w-full gap-1"
                      disabled={!agreedTerms || signContract.isPending}
                      onClick={() => signContract.mutate(viewContract.id)}
                    >
                      {signContract.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
                      Tandatangani Kontrak Secara Elektronik
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantLeaseContracts;

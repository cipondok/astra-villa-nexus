import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Shield, CheckCircle, Clock, XCircle, Loader2, Eye, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  approved: { label: "Terverifikasi", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const OwnerVerificationReview = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ["tenant-verifications-owner", user?.id],
    queryFn: async () => {
      // Get tenants with bookings on owner's properties
      const { data: properties } = await supabase.from("properties").select("id").eq("owner_id", user!.id);
      if (!properties?.length) return [];
      const propIds = properties.map(p => p.id);
      
      const { data: bookings } = await supabase
        .from("rental_bookings")
        .select("customer_id")
        .in("property_id", propIds);
      if (!bookings?.length) return [];
      
      const tenantIds = [...new Set(bookings.map(b => b.customer_id).filter(Boolean))];
      
      const { data, error } = await supabase
        .from("tenant_verifications" as any)
        .select("*")
        .in("user_id", tenantIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const handleAction = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const updateData: any = {
        status,
        verified_at: status === "approved" ? new Date().toISOString() : null,
        verified_by: user?.id,
      };
      if (status === "rejected") updateData.rejection_reason = rejectionReason || "Dokumen tidak valid";

      const { error } = await supabase
        .from("tenant_verifications" as any)
        .update(updateData)
        .eq("id", id);
      if (error) throw error;

      showSuccess("Berhasil", status === "approved" ? "Verifikasi disetujui" : "Verifikasi ditolak");
      queryClient.invalidateQueries({ queryKey: ["tenant-verifications-owner"] });
      setSelectedVerification(null);
      setRejectionReason("");
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const pendingCount = verifications.filter((v: any) => v.status === "pending").length;

  if (verifications.length === 0) {
    return (
      <Card className="p-8 border-border">
        <div className="text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Tidak Ada Verifikasi</h3>
          <p className="text-xs text-muted-foreground">Verifikasi penyewa akan muncul di sini.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Menunggu</p>
          <p className="text-xl font-bold text-chart-3">{pendingCount}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Disetujui</p>
          <p className="text-xl font-bold text-chart-1">{verifications.filter((v: any) => v.status === "approved").length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Ditolak</p>
          <p className="text-xl font-bold text-destructive">{verifications.filter((v: any) => v.status === "rejected").length}</p>
        </Card>
      </div>

      <div className="space-y-2">
        {verifications.map((v: any) => {
          const st = statusConfig[v.status] || statusConfig.pending;
          const StIcon = st.icon;
          return (
            <Card key={v.id} className="p-3 border-border">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{v.full_name}</p>
                    <p className="text-[10px] text-muted-foreground">{v.id_type?.toUpperCase()} • {v.id_number?.slice(0, 6)}***</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge className={`${st.color} text-[9px] border`}>
                    <StIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedVerification(v)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={(o) => !o && setSelectedVerification(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Detail Verifikasi</DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-3">
              <div className="space-y-2">
                {[
                  { label: "Nama", value: selectedVerification.full_name },
                  { label: "Tipe ID", value: selectedVerification.id_type?.toUpperCase() },
                  { label: "Nomor ID", value: selectedVerification.id_number },
                  { label: "Tanggal", value: new Date(selectedVerification.created_at).toLocaleDateString("id-ID") },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between p-2 bg-muted/50 rounded text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

              {selectedVerification.id_document_url && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Foto ID</p>
                  <img src={selectedVerification.id_document_url} alt="ID" className="w-full rounded-lg border border-border" />
                </div>
              )}
              {selectedVerification.selfie_url && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Selfie</p>
                  <img src={selectedVerification.selfie_url} alt="Selfie" className="w-full rounded-lg border border-border" />
                </div>
              )}

              {selectedVerification.status === "pending" && (
                <div className="space-y-2 border-t border-border pt-3">
                  <Textarea
                    placeholder="Alasan penolakan (jika ditolak)..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="text-xs min-h-[50px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleAction(selectedVerification.id, "approved")} disabled={updating}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Setujui
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAction(selectedVerification.id, "rejected")} disabled={updating}>
                      <XCircle className="h-3 w-3 mr-1" /> Tolak
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerVerificationReview;

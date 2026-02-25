import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle, Clock, XCircle, Upload, Loader2, Camera, FileText } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu Review", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  approved: { label: "Terverifikasi", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const idTypes = [
  { value: "ktp", label: "KTP" },
  { value: "sim", label: "SIM" },
  { value: "passport", label: "Paspor" },
];

const TenantVerification = () => {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [idType, setIdType] = useState("ktp");
  const [idNumber, setIdNumber] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const { data: verification, isLoading } = useQuery({
    queryKey: ["tenant-verification", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_verifications" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user,
  });

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from("verification-docs").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("verification-docs").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim() || !idNumber.trim()) return;

    setSubmitting(true);
    try {
      let idDocUrl: string | undefined;
      let selfieUrl: string | undefined;

      if (idFile) {
        const ext = idFile.name.split(".").pop();
        idDocUrl = await uploadFile(idFile, `${user.id}/id-document.${ext}`);
      }
      if (selfieFile) {
        const ext = selfieFile.name.split(".").pop();
        selfieUrl = await uploadFile(selfieFile, `${user.id}/selfie.${ext}`);
      }

      const { error } = await supabase.from("tenant_verifications" as any).insert([{
        user_id: user.id,
        full_name: fullName.trim(),
        id_type: idType,
        id_number: idNumber.trim(),
        id_document_url: idDocUrl || null,
        selfie_url: selfieUrl || null,
      }]);
      if (error) throw error;

      showSuccess("Berhasil", "Verifikasi identitas berhasil dikirim untuk review");
      queryClient.invalidateQueries({ queryKey: ["tenant-verification"] });
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  // Show status if already submitted
  if (verification) {
    const st = statusConfig[verification.status] || statusConfig.pending;
    const StIcon = st.icon;
    return (
      <div className="space-y-4">
        <Card className="p-6 border-border">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Verifikasi Identitas</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={`${st.color} border`}>
                <StIcon className="h-3 w-3 mr-1" /> {st.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Nama</span>
              <span className="text-sm font-medium text-foreground">{verification.full_name}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Tipe ID</span>
              <span className="text-sm font-medium text-foreground uppercase">{verification.id_type}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Nomor ID</span>
              <span className="text-sm font-medium text-foreground">{verification.id_number?.replace(/(.{4})/g, '$1 ').trim()}</span>
            </div>
            {verification.rejection_reason && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="text-xs text-destructive font-medium">Alasan Penolakan:</p>
                <p className="text-sm text-foreground mt-1">{verification.rejection_reason}</p>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground text-center">
              Diajukan: {new Date(verification.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {verification.status === "rejected" && (
            <Button className="w-full mt-4" onClick={() => queryClient.setQueryData(["tenant-verification", user?.id], null)}>
              Ajukan Ulang
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // Show form
  return (
    <div className="space-y-4">
      <Card className="p-5 border-border">
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Verifikasi Identitas</h3>
          <p className="text-xs text-muted-foreground mt-1">Verifikasi diperlukan sebelum booking dikonfirmasi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama Lengkap (sesuai ID)</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nama lengkap" required maxLength={100} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipe ID</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {idTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nomor ID</Label>
              <Input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="Nomor identitas" required maxLength={30} />
            </div>
          </div>
          <div>
            <Label className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Foto Dokumen ID</Label>
            <Input type="file" accept="image/*" onChange={e => setIdFile(e.target.files?.[0] || null)} className="mt-1" />
            <p className="text-[10px] text-muted-foreground mt-1">Upload foto KTP/SIM/Paspor yang jelas</p>
          </div>
          <div>
            <Label className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> Selfie dengan ID</Label>
            <Input type="file" accept="image/*" capture="user" onChange={e => setSelfieFile(e.target.files?.[0] || null)} className="mt-1" />
            <p className="text-[10px] text-muted-foreground mt-1">Foto diri sambil memegang dokumen ID</p>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !fullName.trim() || !idNumber.trim()}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Kirim Verifikasi
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default TenantVerification;

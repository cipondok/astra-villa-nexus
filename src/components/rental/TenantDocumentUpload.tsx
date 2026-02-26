import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Plus,
  Loader2,
  File,
  Image,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { z } from "zod";

type DocumentType = "ktp" | "kontrak" | "bukti_bayar" | "kk" | "npwp" | "other";
type VerificationStatus = "pending" | "verified" | "rejected";

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  ktp: "KTP",
  kontrak: "Kontrak",
  bukti_bayar: "Bukti Bayar",
  kk: "Kartu Keluarga",
  npwp: "NPWP",
  other: "Lainnya",
};

const STATUS_CONFIG: Record<VerificationStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Menunggu Verifikasi", icon: Clock, color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  verified: { label: "Terverifikasi", icon: CheckCircle, color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
  rejected: { label: "Ditolak", icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const uploadSchema = z.object({
  documentType: z.enum(["ktp", "kontrak", "bukti_bayar", "kk", "npwp", "other"]),
  propertyId: z.string().min(1, "Pilih properti"),
  notes: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
});

const TenantDocumentUpload = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("ktp");
  const [propertyId, setPropertyId] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch tenant's documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["tenant-documents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await (supabase as any)
        .from("tenant_documents")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch tenant's booked properties for the dropdown
  const { data: tenantProperties = [] } = useQuery({
    queryKey: ["tenant-booked-properties", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("rental_bookings")
        .select("property_id, properties(id, title)")
        .eq("customer_id", user.id)
        .in("booking_status", ["confirmed", "pending"]);
      if (error) throw error;
      // Deduplicate by property_id
      const seen = new Set<string>();
      return (data || [])
        .filter((b: any) => {
          if (!b.property_id || seen.has(b.property_id)) return false;
          seen.add(b.property_id);
          return true;
        })
        .map((b: any) => ({
          id: b.property_id,
          title: (b.properties as any)?.title || "Properti",
        }));
    },
    enabled: !!user?.id,
  });

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentType("ktp");
    setPropertyId("");
    setNotes("");
    setExpiresAt("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!user?.id || !selectedFile) return;

    const validation = uploadSchema.safeParse({
      documentType,
      propertyId,
      notes,
      expiresAt,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Data tidak valid");
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}_${documentType}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("tenant-documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("tenant-documents")
        .getPublicUrl(filePath);

      // Insert document record
      const { error: insertError } = await (supabase as any)
        .from("tenant_documents")
        .insert({
          tenant_id: user.id,
          property_id: propertyId,
          document_type: documentType,
          file_url: urlData.publicUrl,
          file_name: selectedFile.name,
          expires_at: expiresAt || null,
          notes: notes || null,
        });

      if (insertError) throw insertError;

      toast.success("Dokumen berhasil diupload!");
      queryClient.invalidateQueries({ queryKey: ["tenant-documents"] });
      setUploadOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Gagal mengupload dokumen");
    } finally {
      setUploading(false);
    }
  };

  const getExpiryBadge = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const days = differenceInDays(parseISO(expiresAt), new Date());
    if (days < 0) {
      return (
        <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5 gap-0.5">
          <AlertTriangle className="h-2.5 w-2.5" /> Expired
        </Badge>
      );
    }
    if (days <= 30) {
      return (
        <Badge className="text-[9px] px-1.5 py-0.5 gap-0.5 bg-chart-3/10 text-chart-3 border-chart-3/20">
          <AlertTriangle className="h-2.5 w-2.5" /> {days} hari lagi
        </Badge>
      );
    }
    return null;
  };

  const getFileIcon = (fileName: string | null) => {
    if (!fileName) return <File className="h-5 w-5 text-muted-foreground" />;
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      return <Image className="h-5 w-5 text-chart-5" />;
    }
    return <FileText className="h-5 w-5 text-primary" />;
  };

  // Stats
  const pendingCount = documents.filter((d: any) => d.verification_status === "pending").length;
  const verifiedCount = documents.filter((d: any) => d.verification_status === "verified").length;
  const rejectedCount = documents.filter((d: any) => d.verification_status === "rejected").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Dokumen Saya</h2>
          <p className="text-xs text-muted-foreground">Upload dan kelola dokumen identitas, kontrak, dan bukti bayar</p>
        </div>
        <Button size="sm" onClick={() => setUploadOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Upload
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-chart-3" />
            </div>
            <div>
              <span className="text-base font-bold block leading-none">{pendingCount}</span>
              <span className="text-[10px] text-muted-foreground">Menunggu</span>
            </div>
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <span className="text-base font-bold block leading-none">{verifiedCount}</span>
              <span className="text-[10px] text-muted-foreground">Terverifikasi</span>
            </div>
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <span className="text-base font-bold block leading-none">{rejectedCount}</span>
              <span className="text-[10px] text-muted-foreground">Ditolak</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Dokumen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload dokumen seperti KTP, kontrak, atau bukti pembayaran untuk verifikasi
            </p>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Dokumen
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc: any) => {
            const statusCfg = STATUS_CONFIG[doc.verification_status as VerificationStatus] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={doc.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {getFileIcon(doc.file_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.file_name || "Dokumen"}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                            {DOC_TYPE_LABELS[doc.document_type as DocumentType] || doc.document_type}
                          </Badge>
                          <Badge className={`text-[9px] px-1.5 py-0.5 gap-0.5 border ${statusCfg.color}`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {statusCfg.label}
                          </Badge>
                          {getExpiryBadge(doc.expires_at)}
                        </div>
                      </div>
                      {doc.file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 flex-shrink-0"
                          onClick={() => window.open(doc.file_url, "_blank")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Rejection reason */}
                    {doc.verification_status === "rejected" && doc.rejection_reason && (
                      <div className="mt-2 p-2 rounded-md bg-destructive/5 border border-destructive/10">
                        <p className="text-[10px] font-medium text-destructive mb-0.5">Alasan Penolakan:</p>
                        <p className="text-xs text-muted-foreground">{doc.rejection_reason}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span>
                        {format(new Date(doc.created_at), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                      </span>
                      {doc.expires_at && (
                        <span>Exp: {format(parseISO(doc.expires_at), "dd MMM yyyy")}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent autoClose={false} className="max-w-[380px] md:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Dokumen
            </DialogTitle>
            <DialogDescription>
              Upload dokumen untuk verifikasi oleh pemilik properti
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Property Selection */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Properti *</label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Pilih properti" />
                </SelectTrigger>
                <SelectContent>
                  {tenantProperties.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tenantProperties.length === 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">Anda belum memiliki booking aktif</p>
              )}
            </div>

            {/* Document Type */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Tipe Dokumen *</label>
              <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">File *</label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center gap-2 justify-center">
                    {getFileIcon(selectedFile.name)}
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Klik untuk memilih file
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      JPG, PNG, WebP, PDF • Maks 10MB
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileSelect}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Tanggal Kadaluarsa (opsional)</label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Catatan (opsional)</label>
              <Textarea
                placeholder="Catatan tambahan..."
                className="min-h-[60px] text-sm resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => { setUploadOpen(false); resetForm(); }}>
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!selectedFile || !propertyId || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Mengupload...</>
              ) : (
                <><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantDocumentUpload;

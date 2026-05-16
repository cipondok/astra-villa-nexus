import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, Upload, Loader2, Download, Trash2, CheckCircle,
  Clock, AlertCircle, File, Image, FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";

interface RentalDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  propertyTitle: string;
}

interface RentalDocument {
  id: string;
  booking_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  document_type: string;
  description: string | null;
  requires_signature: boolean;
  signed_by: string | null;
  signed_at: string | null;
  signature_note: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

const DOC_TYPES = [
  { value: "contract", label: "Kontrak Sewa" },
  { value: "id_card", label: "KTP / ID" },
  { value: "payment_proof", label: "Bukti Pembayaran" },
  { value: "inspection", label: "Laporan Inspeksi" },
  { value: "rules", label: "Peraturan Properti" },
  { value: "other", label: "Lainnya" },
];

const getFileIcon = (type: string | null) => {
  if (!type) return File;
  if (type.startsWith("image/")) return Image;
  if (type.includes("spreadsheet") || type.includes("excel")) return FileSpreadsheet;
  return FileText;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const RentalDocumentsDialog = ({ open, onOpenChange, bookingId, propertyTitle }: RentalDocumentsDialogProps) => {
  const [docType, setDocType] = useState("contract");
  const [requiresSig, setRequiresSig] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Get current user
  useState(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["rental-documents", bookingId],
    enabled: open && !!bookingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_documents")
        .select("id, booking_id, uploaded_by, file_name, file_path, file_size, file_type, document_type, description, requires_signature, signed_by, signed_at, signature_note, created_at, profiles:profiles!rental_documents_uploaded_by_fkey(full_name)")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as unknown as RentalDocument[]) || [];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File terlalu besar (maks 20MB)");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${currentUserId}/${bookingId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("rental-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("rental_documents").insert({
        booking_id: bookingId,
        uploaded_by: currentUserId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        document_type: docType,
        requires_signature: requiresSig,
      });

      if (insertError) throw insertError;

      toast.success("Dokumen berhasil diunggah");
      queryClient.invalidateQueries({ queryKey: ["rental-documents", bookingId] });
      setRequiresSig(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah dokumen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (doc: RentalDocument) => {
    const { data, error } = await supabase.storage
      .from("rental-documents")
      .createSignedUrl(doc.file_path, 60);

    if (error || !data?.signedUrl) {
      toast.error("Gagal mengunduh file");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const deleteMutation = useMutation({
    mutationFn: async (doc: RentalDocument) => {
      await supabase.storage.from("rental-documents").remove([doc.file_path]);
      const { error } = await supabase.from("rental_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dokumen dihapus");
      queryClient.invalidateQueries({ queryKey: ["rental-documents", bookingId] });
    },
    onError: () => toast.error("Gagal menghapus dokumen"),
  });

  const signMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from("rental_documents")
        .update({ signed_by: currentUserId, signed_at: new Date().toISOString(), signature_note: "Ditandatangani secara elektronik" })
        .eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dokumen berhasil ditandatangani");
      queryClient.invalidateQueries({ queryKey: ["rental-documents", bookingId] });
    },
    onError: () => toast.error("Gagal menandatangani dokumen"),
  });

  const docTypeLabel = (val: string) => DOC_TYPES.find(d => d.value === val)?.label || val;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[75vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
          <DialogTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Dokumen — {propertyTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Upload section */}
        <div className="px-4 py-3 border-b border-border space-y-2">
          <div className="flex items-center gap-2">
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map(d => (
                  <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-8 text-xs gap-1"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Unggah
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="req-sig"
              checked={requiresSig}
              onCheckedChange={(v) => setRequiresSig(v === true)}
              className="h-3.5 w-3.5"
            />
            <label htmlFor="req-sig" className="text-[10px] text-muted-foreground cursor-pointer">
              Memerlukan tanda tangan dari pihak lain
            </label>
          </div>
        </div>

        {/* Document list */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-3 space-y-2">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && documents.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Belum ada dokumen. Unggah kontrak atau file pendukung.</p>
              </div>
            )}
            {documents.map(doc => {
              const FileIcon = getFileIcon(doc.file_type);
              const isSigned = !!doc.signed_at;
              const needsSign = doc.requires_signature && !isSigned;
              const canSign = needsSign && doc.uploaded_by !== currentUserId;

              return (
                <Card key={doc.id} className="p-2.5">
                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-foreground truncate">{doc.file_name}</p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5">{docTypeLabel(doc.document_type)}</Badge>
                            <span className="text-[7px] text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                            <span className="text-[7px] text-muted-foreground">•</span>
                            <span className="text-[7px] text-muted-foreground">{doc.profiles?.full_name || "User"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDownload(doc)}>
                            <Download className="h-3 w-3 text-muted-foreground" />
                          </Button>
                          {doc.uploaded_by === currentUserId && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteMutation.mutate(doc)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Signature status */}
                      {doc.requires_signature && (
                        <div className="mt-1.5">
                          {isSigned ? (
                            <div className="flex items-center gap-1 text-chart-1">
                              <CheckCircle className="h-3 w-3" />
                              <span className="text-[8px] font-medium">
                                Ditandatangani {new Date(doc.signed_at!).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          ) : canSign ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[9px] gap-1 border-primary/30 text-primary"
                              onClick={() => signMutation.mutate(doc.id)}
                              disabled={signMutation.isPending}
                            >
                              {signMutation.isPending ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <CheckCircle className="h-2.5 w-2.5" />}
                              Tandatangani
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 text-chart-3">
                              <Clock className="h-3 w-3" />
                              <span className="text-[8px]">Menunggu tanda tangan</span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-[7px] text-muted-foreground/60 mt-1">
                        {new Date(doc.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDocumentsDialog;

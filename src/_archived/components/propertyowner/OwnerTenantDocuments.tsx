
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

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
  pending: { label: "Menunggu", icon: Clock, color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  verified: { label: "Terverifikasi", icon: CheckCircle, color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
  rejected: { label: "Ditolak", icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const OwnerTenantDocuments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch tenant documents for owner's properties
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["owner-tenant-documents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get owner's property IDs first
      const { data: properties } = await supabase
        .from("properties")
        .select("id, title")
        .eq("owner_id", user.id);

      if (!properties?.length) return [];

      const propertyIds = properties.map((p: any) => p.id);
      const propertyMap = Object.fromEntries(properties.map((p: any) => [p.id, p.title]));

      const { data, error } = await (supabase as any)
        .from("tenant_documents")
        .select("*")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return ((data as any[]) || []).map((doc: any) => ({
        ...doc,
        property_title: propertyMap[doc.property_id] || "Unknown",
      }));
    },
    enabled: !!user?.id,
  });

  // Verify document
  const verifyMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await (supabase as any)
        .from("tenant_documents")
        .update({
          verification_status: "verified",
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-tenant-documents"] });
      toast.success("Dokumen berhasil diverifikasi");
      setSelectedDoc(null);
    },
    onError: () => toast.error("Gagal memverifikasi dokumen"),
  });

  // Reject document
  const rejectMutation = useMutation({
    mutationFn: async ({ docId, reason }: { docId: string; reason: string }) => {
      const { error } = await (supabase as any)
        .from("tenant_documents")
        .update({
          verification_status: "rejected",
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-tenant-documents"] });
      toast.success("Dokumen ditolak");
      setRejectDialogOpen(false);
      setSelectedDoc(null);
      setRejectionReason("");
    },
    onError: () => toast.error("Gagal menolak dokumen"),
  });

  // Filter documents
  const filtered = documents.filter((doc: any) => {
    if (statusFilter !== "all" && doc.verification_status !== statusFilter) return false;
    if (typeFilter !== "all" && doc.document_type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.file_name?.toLowerCase().includes(q) ||
        doc.property_title?.toLowerCase().includes(q) ||
        doc.tenant_id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stats
  const pendingCount = documents.filter((d: any) => d.verification_status === "pending").length;
  const expiringCount = documents.filter((d: any) => {
    if (!d.expires_at) return false;
    const days = differenceInDays(parseISO(d.expires_at), new Date());
    return days >= 0 && days <= 30;
  }).length;

  const getExpiryBadge = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const days = differenceInDays(parseISO(expiresAt), new Date());
    if (days < 0) {
      return <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5 gap-0.5"><AlertTriangle className="h-2.5 w-2.5" /> Expired</Badge>;
    }
    if (days <= 30) {
      return <Badge className="text-[9px] px-1.5 py-0.5 gap-0.5 bg-chart-3/10 text-chart-3 border-chart-3/20"><AlertTriangle className="h-2.5 w-2.5" /> {days}d left</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-base font-bold block leading-none">{documents.length}</span>
              <span className="text-[10px] text-muted-foreground">Total</span>
            </div>
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-chart-3" />
            </div>
            <div>
              <span className="text-base font-bold block leading-none">{pendingCount}</span>
              <span className="text-[10px] text-muted-foreground">Pending</span>
            </div>
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <span className="text-base font-bold block leading-none">{expiringCount}</span>
              <span className="text-[10px] text-muted-foreground">Expiring</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari dokumen..."
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-full sm:w-[130px]">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="verified">Terverifikasi</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 text-xs w-full sm:w-[130px]">
              <FileText className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Documents Table */}
      {filtered.length === 0 ? (
        <Card className="p-6">
          <div className="text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium">Tidak ada dokumen</p>
            <p className="text-xs text-muted-foreground mt-1">Dokumen tenant akan muncul di sini setelah diupload</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Dokumen</TableHead>
                  <TableHead className="text-xs">Tipe</TableHead>
                  <TableHead className="text-xs">Properti</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Expiry</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc: any) => {
                  const statusCfg = STATUS_CONFIG[doc.verification_status as VerificationStatus] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate max-w-[120px] sm:max-w-[200px]">{doc.file_name || "Untitled"}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(doc.created_at), "dd MMM yyyy", { locale: idLocale })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                          {DOC_TYPE_LABELS[doc.document_type as DocumentType] || doc.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground truncate block max-w-[100px]">{doc.property_title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[9px] px-1.5 py-0.5 gap-0.5 border ${statusCfg.color}`}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.expires_at ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-muted-foreground block">
                              {format(parseISO(doc.expires_at), "dd MMM yyyy")}
                            </span>
                            {getExpiryBadge(doc.expires_at)}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {doc.file_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => window.open(doc.file_url, "_blank")}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {doc.verification_status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-chart-1 hover:text-chart-1"
                                onClick={() => verifyMutation.mutate(doc.id)}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent autoClose={false}>
          <DialogHeader>
            <DialogTitle>Tolak Dokumen</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk dokumen "{selectedDoc?.file_name}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRejectDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (selectedDoc) {
                  rejectMutation.mutate({ docId: selectedDoc.id, reason: rejectionReason });
                }
              }}
            >
              Tolak Dokumen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerTenantDocuments;

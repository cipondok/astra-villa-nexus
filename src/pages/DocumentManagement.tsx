import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Upload, FileText, FileSignature, Eye, Download, Search,
  Clock, CheckCircle2, XCircle, AlertTriangle, Shield,
  Loader2, PenTool, ArrowLeft, Filter, Plus
} from 'lucide-react';
import {
  useMyDocuments,
  useDocumentById,
  useDocumentSignatures,
  useDocumentAuditTrail,
  useUploadTransactionDocument,
  useSignDocument,
  useRejectSignature,
  DOCUMENT_TYPE_LABELS,
  STATUS_LABELS,
  type DocumentType,
  type TransactionDocument,
  type DocumentSignature,
  type AuditEntry,
} from '@/hooks/useTransactionDocuments';

// ── Main Page ──

const DocumentManagement: React.FC = () => {
  const { user, loading } = useAuth();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return null;
  if (!user) return <Navigate to="/?auth=true" replace />;

  if (selectedDocId) {
    return <DocumentDetail docId={selectedDocId} onBack={() => setSelectedDocId(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Document Management
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Upload, track, and sign property transaction documents</p>
          </div>
          <Button className="gap-2" onClick={() => setShowUpload(true)}>
            <Plus className="h-4 w-4" /> Upload Document
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm bg-muted/30" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="awaiting_signatures">Awaiting Signatures</SelectItem>
              <SelectItem value="partially_signed">Partially Signed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document List */}
        <DocumentList
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          searchQuery={searchQuery}
          onSelect={setSelectedDocId}
        />

        {/* Upload Dialog */}
        <UploadDocumentDialog open={showUpload} onOpenChange={setShowUpload} />
      </div>
    </div>
  );
};

// ── Document List ──

function DocumentList({ statusFilter, typeFilter, searchQuery, onSelect }: {
  statusFilter: string; typeFilter: string; searchQuery: string;
  onSelect: (id: string) => void;
}) {
  const { data: docs = [], isLoading } = useMyDocuments();

  const filtered = docs.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (typeFilter !== 'all' && d.document_type !== typeFilter) return false;
    if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase()) && !d.document_number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No documents found</p>
        <p className="text-xs text-muted-foreground mt-1">Upload your first transaction document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map(doc => {
        const typeMeta = DOCUMENT_TYPE_LABELS[doc.document_type] || DOCUMENT_TYPE_LABELS.other;
        const statusMeta = STATUS_LABELS[doc.status] || STATUS_LABELS.draft;
        return (
          <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-all border-border/50" onClick={() => onSelect(doc.id)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">{typeMeta.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.document_number} · {typeMeta.label}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn('text-[10px]', statusMeta.color)}>{statusMeta.label}</Badge>
                      {doc.requires_signature && <FileSignature className="h-3.5 w-3.5 text-chart-3" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>{doc.file_name}</span>
                    <span>·</span>
                    <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                  </div>
                  {doc.requires_signature && (
                    <div className="mt-2">
                      <Progress value={(doc.current_signer_index / Math.max((doc.signature_order as any[])?.length || 1, 1)) * 100} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {doc.current_signer_index}/{(doc.signature_order as any[])?.length || 0} signatures
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Document Detail ──

function DocumentDetail({ docId, onBack }: { docId: string; onBack: () => void }) {
  const { user } = useAuth();
  const { data: doc, isLoading } = useDocumentById(docId);
  const { data: signatures = [] } = useDocumentSignatures(docId);
  const { data: auditTrail = [] } = useDocumentAuditTrail(docId);
  const signMutation = useSignDocument();
  const rejectMutation = useRejectSignature();
  const [showSignDialog, setShowSignDialog] = useState(false);

  if (isLoading || !doc) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const mySignature = signatures.find(s => s.signer_id === user?.id);
  const canSign = mySignature && mySignature.status === 'pending';
  const typeMeta = DOCUMENT_TYPE_LABELS[doc.document_type] || DOCUMENT_TYPE_LABELS.other;
  const statusMeta = STATUS_LABELS[doc.status] || STATUS_LABELS.draft;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back to documents
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{typeMeta.icon}</span>
              <h1 className="text-lg font-bold text-foreground">{doc.title}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{doc.document_number} · {typeMeta.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', statusMeta.color)}>{statusMeta.label}</Badge>
            {doc.file_url && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </a>
              </Button>
            )}
            {canSign && (
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowSignDialog(true)}>
                <PenTool className="h-3.5 w-3.5" /> Sign Document
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="signatures">Signatures ({signatures.length})</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail ({auditTrail.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Document Info</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="File" value={doc.file_name} />
                  <InfoRow label="Size" value={`${(doc.file_size / 1024).toFixed(1)} KB`} />
                  <InfoRow label="Type" value={doc.mime_type} />
                  <InfoRow label="Version" value={`v${doc.version}`} />
                  <InfoRow label="Uploaded" value={format(new Date(doc.created_at), 'dd MMM yyyy HH:mm')} />
                  {doc.description && <InfoRow label="Description" value={doc.description} />}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Signing Progress</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {doc.requires_signature ? (
                    <>
                      <Progress value={(doc.current_signer_index / Math.max((doc.signature_order as any[])?.length || 1, 1)) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">{doc.current_signer_index} of {(doc.signature_order as any[])?.length || 0} signatures collected</p>
                      {doc.completed_at && <p className="text-xs text-chart-2">Completed: {format(new Date(doc.completed_at), 'dd MMM yyyy HH:mm')}</p>}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">This document does not require signatures</p>
                  )}
                </CardContent>
              </Card>

              {/* Preview */}
              {doc.mime_type?.startsWith('image/') && (
                <Card className="md:col-span-2 border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
                  <CardContent>
                    <img src={doc.file_url} alt={doc.title} className="max-h-[400px] mx-auto rounded-lg object-contain" />
                  </CardContent>
                </Card>
              )}
              {doc.mime_type === 'application/pdf' && (
                <Card className="md:col-span-2 border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
                  <CardContent>
                    <iframe src={doc.file_url} className="w-full h-[500px] rounded-lg border border-border/50" title="Document preview" />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="signatures">
            <SignatureList signatures={signatures} currentUserId={user?.id} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrailView entries={auditTrail} />
          </TabsContent>
        </Tabs>

        {/* Sign Dialog */}
        <SignDocumentDialog
          open={showSignDialog}
          onOpenChange={setShowSignDialog}
          documentId={docId}
          documentTitle={doc.title}
          onSign={(sigData, notes) => {
            signMutation.mutate({ documentId: docId, signatureData: sigData, notes });
            setShowSignDialog(false);
          }}
          onReject={(reason) => {
            rejectMutation.mutate({ documentId: docId, reason });
            setShowSignDialog(false);
          }}
          isLoading={signMutation.isPending || rejectMutation.isPending}
        />
      </div>
    </div>
  );
}

// ── Signatures List ──

function SignatureList({ signatures, currentUserId }: { signatures: DocumentSignature[]; currentUserId?: string }) {
  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4 text-chart-3" />,
    viewed: <Eye className="h-4 w-4 text-chart-4" />,
    signed: <CheckCircle2 className="h-4 w-4 text-chart-2" />,
    rejected: <XCircle className="h-4 w-4 text-destructive" />,
    expired: <AlertTriangle className="h-4 w-4 text-chart-5" />,
  };

  if (signatures.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No signatures required for this document</p>;
  }

  return (
    <div className="space-y-2">
      {signatures.map((sig, i) => (
        <Card key={sig.id} className={cn('border-border/50', sig.signer_id === currentUserId && 'ring-1 ring-primary/30')}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-bold text-muted-foreground">{i + 1}</div>
            {statusIcons[sig.status] || statusIcons.pending}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {sig.signer_name || 'Unknown signer'}
                {sig.signer_id === currentUserId && <span className="text-primary text-xs ml-1">(You)</span>}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{sig.signer_role} · {sig.status}</p>
            </div>
            <div className="text-right">
              {sig.signed_at ? (
                <p className="text-[10px] text-muted-foreground">{format(new Date(sig.signed_at), 'dd MMM yyyy HH:mm')}</p>
              ) : (
                <p className="text-[10px] text-muted-foreground">Pending</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Audit Trail ──

function AuditTrailView({ entries }: { entries: AuditEntry[] }) {
  const actionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    document_uploaded: { label: 'Document Uploaded', icon: <Upload className="h-3.5 w-3.5 text-primary" /> },
    document_signed: { label: 'Document Signed', icon: <PenTool className="h-3.5 w-3.5 text-chart-2" /> },
    signature_rejected: { label: 'Signature Rejected', icon: <XCircle className="h-3.5 w-3.5 text-destructive" /> },
    document_viewed: { label: 'Document Viewed', icon: <Eye className="h-3.5 w-3.5 text-chart-4" /> },
    status_changed: { label: 'Status Changed', icon: <Shield className="h-3.5 w-3.5 text-chart-3" /> },
  };

  if (entries.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No audit entries yet</p>;

  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const meta = actionLabels[entry.action] || { label: entry.action, icon: <Shield className="h-3.5 w-3.5 text-muted-foreground" /> };
        return (
          <div key={entry.id} className="flex items-center gap-3 p-2.5 rounded-md bg-muted/20 border border-border/30">
            {meta.icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{meta.label}</p>
              {entry.performer_name && <p className="text-[10px] text-muted-foreground">by {entry.performer_name}</p>}
            </div>
            <p className="text-[10px] text-muted-foreground shrink-0">
              {format(new Date(entry.created_at), 'dd MMM HH:mm')}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Upload Dialog ──

function UploadDocumentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('other');
  const [description, setDescription] = useState('');
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadTransactionDocument();

  const handleSubmit = () => {
    if (!file || !title) return;
    uploadMutation.mutate({
      file,
      title,
      documentType: docType,
      description,
      requiresSignature,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setTitle('');
        setDescription('');
        setFile(null);
        setRequiresSignature(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Document Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. AJB Villa Canggu #18" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Document Type</Label>
            <Select value={docType} onValueChange={v => setDocType(v as DocumentType)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, { label, icon }]) => (
                  <SelectItem key={key} value={key}>{icon} {label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes..." className="mt-1" rows={2} />
          </div>
          <div>
            <Label className="text-xs">File *</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
              {file ? (
                <p className="text-sm text-foreground">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
              ) : (
                <div className="space-y-1">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">PDF, images, or documents (max 50MB)</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="requires-sig" checked={requiresSignature} onChange={e => setRequiresSignature(e.target.checked)} className="rounded border-border" />
            <Label htmlFor="requires-sig" className="text-xs cursor-pointer">Requires digital signatures</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!file || !title || uploadMutation.isPending} className="gap-1.5">
            {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Sign Dialog ──

function SignDocumentDialog({ open, onOpenChange, documentId, documentTitle, onSign, onReject, isLoading }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  documentId: string; documentTitle: string;
  onSign: (sigData: string, notes?: string) => void;
  onReject: (reason: string) => void;
  isLoading: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  }, [isDrawing]);

  const stopDraw = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;
    const sigData = canvas.toDataURL('image/png');
    onSign(sigData, notes || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><PenTool className="h-4 w-4 text-primary" /> Sign Document</DialogTitle>
        </DialogHeader>

        {!showReject ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground">You are signing:</p>
              <p className="text-sm font-medium text-foreground">{documentTitle}</p>
            </div>

            <div>
              <Label className="text-xs">Draw your signature below</Label>
              <div className="mt-1 border rounded-lg overflow-hidden bg-card">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto mt-1" onClick={clearCanvas}>Clear signature</Button>
            </div>

            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any comments..." className="mt-1" />
            </div>

            <div className="p-2 rounded-md bg-chart-3/10 border border-chart-3/20">
              <p className="text-[10px] text-chart-3 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Your signature is timestamped and secured with your account identity.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Reason for rejecting *</Label>
              <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Please explain why..." className="mt-1" rows={3} />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!showReject ? (
            <>
              <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => setShowReject(true)}>
                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
              <Button onClick={handleSign} disabled={!hasSigned || isLoading} className="gap-1.5">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
                Sign & Submit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowReject(false)}>Back</Button>
              <Button variant="destructive" onClick={() => onReject(rejectReason)} disabled={!rejectReason || isLoading} className="gap-1.5">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Confirm Rejection
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ──

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

export default DocumentManagement;

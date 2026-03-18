import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, FileSignature, Eye, Download, Search,
  Clock, CheckCircle2, XCircle, AlertTriangle, Shield,
  Loader2, PenTool, ArrowLeft, Plus, FileCheck, Handshake,
  Scale, FileWarning, BarChart3, TrendingUp, ChevronRight,
  BadgeCheck, CircleDot, Circle, Stamp, ClipboardCheck,
  Send, FolderOpen, Calendar, Building, UserCheck,
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
  type DocumentStatus,
} from '@/hooks/useTransactionDocuments';

// ── Upload Categories ──
const UPLOAD_CATEGORIES = [
  {
    id: 'offer_agreements',
    label: 'Offer & Agreement Drafts',
    description: 'Upload offer letters, purchase agreements, and booking forms',
    icon: Handshake,
    types: ['offer_agreement', 'booking_form', 'reservation_form', 'ppjb'] as DocumentType[],
    color: 'text-primary',
    bg: 'bg-primary/5 border-primary/20',
  },
  {
    id: 'legal_verification',
    label: 'Legal Verification Files',
    description: 'Property certificates, title deeds, and verification documents',
    icon: Scale,
    types: ['shm', 'ajb', 'power_of_attorney'] as DocumentType[],
    color: 'text-chart-3',
    bg: 'bg-chart-3/5 border-chart-3/20',
  },
  {
    id: 'contracts',
    label: 'Contracts & Rental',
    description: 'Finalized rental contracts and lease agreements',
    icon: FileCheck,
    types: ['rental_contract'] as DocumentType[],
    color: 'text-chart-2',
    bg: 'bg-chart-2/5 border-chart-2/20',
  },
  {
    id: 'other',
    label: 'Other Documents',
    description: 'Supporting files, receipts, and miscellaneous',
    icon: FolderOpen,
    types: ['other'] as DocumentType[],
    color: 'text-chart-4',
    bg: 'bg-chart-4/5 border-chart-4/20',
  },
];

// ── Document Lifecycle Steps ──
const DOC_LIFECYCLE = [
  { key: 'uploaded', label: 'Uploaded', icon: Upload, statuses: ['draft', 'pending_review'] },
  { key: 'review', label: 'Under Review', icon: ClipboardCheck, statuses: ['pending_review'] },
  { key: 'signing', label: 'Signing', icon: PenTool, statuses: ['awaiting_signatures', 'partially_signed'] },
  { key: 'completed', label: 'Completed', icon: BadgeCheck, statuses: ['completed'] },
] as const;

function getLifecycleStage(status: DocumentStatus): number {
  if (status === 'cancelled' || status === 'expired') return -1;
  if (status === 'completed') return 3;
  if (status === 'partially_signed' || status === 'awaiting_signatures') return 2;
  if (status === 'pending_review') return 1;
  return 0;
}

// ── Milestone Tracker Component ──
function DocumentMilestoneTracker({ doc }: { doc: TransactionDocument }) {
  const stage = getLifecycleStage(doc.status as DocumentStatus);
  const isTerminal = stage < 0;
  const statusMeta = STATUS_LABELS[doc.status as DocumentStatus] || STATUS_LABELS.draft;

  if (isTerminal) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
        <XCircle className="h-4 w-4 text-destructive shrink-0" />
        <span className="text-sm font-medium text-destructive">{statusMeta.label}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Horizontal stepper */}
      <div className="flex items-start">
        {DOC_LIFECYCLE.map((step, i) => {
          const isCompleted = i < stage;
          const isCurrent = i === stage;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-start flex-1">
              <div className="flex flex-col items-center text-center flex-1">
                <motion.div
                  initial={isCurrent ? { scale: 0.8 } : {}}
                  animate={isCurrent ? { scale: [0.95, 1.05, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shrink-0',
                    isCompleted
                      ? 'bg-chart-2 border-chart-2 text-chart-2-foreground shadow-sm shadow-chart-2/30'
                      : isCurrent
                      ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30 ring-4 ring-primary/10'
                      : 'bg-muted/30 border-border/50 text-muted-foreground'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </motion.div>
                <p className={cn(
                  'text-[10px] font-medium mt-1.5 leading-tight',
                  isCurrent ? 'text-primary font-semibold' :
                  isCompleted ? 'text-chart-2' : 'text-muted-foreground'
                )}>
                  {step.label}
                </p>
              </div>
              {i < DOC_LIFECYCLE.length - 1 && (
                <div className="flex items-center pt-4 px-1 shrink-0">
                  <div className={cn(
                    'h-0.5 w-8 md:w-12 transition-colors',
                    isCompleted ? 'bg-chart-2' :
                    isCurrent ? 'bg-gradient-to-r from-primary to-border/30' : 'bg-border/30'
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Signature progress if applicable */}
      {doc.requires_signature && (
        <div className="flex items-center gap-3">
          <Progress
            value={(doc.current_signer_index / Math.max((doc.signature_order as any[])?.length || 1, 1)) * 100}
            className="h-1.5 flex-1"
          />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {doc.current_signer_index}/{(doc.signature_order as any[])?.length || 0} signed
          </span>
        </div>
      )}
    </div>
  );
}

// ── Stats Dashboard ──
function DocumentStats({ docs }: { docs: TransactionDocument[] }) {
  const stats = useMemo(() => {
    const total = docs.length;
    const drafts = docs.filter(d => d.status === 'draft' || d.status === 'pending_review').length;
    const awaiting = docs.filter(d => d.status === 'awaiting_signatures' || d.status === 'partially_signed').length;
    const completed = docs.filter(d => d.status === 'completed').length;
    const needAction = docs.filter(d =>
      d.status === 'awaiting_signatures' || d.status === 'pending_review'
    ).length;
    return { total, drafts, awaiting, completed, needAction };
  }, [docs]);

  const cards = [
    { label: 'Total Documents', value: stats.total, icon: FileText, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Pending Review', value: stats.drafts, icon: Clock, color: 'text-chart-4', bg: 'bg-chart-4/5' },
    { label: 'Awaiting Signatures', value: stats.awaiting, icon: PenTool, color: 'text-chart-3', bg: 'bg-chart-3/5' },
    { label: 'Completed', value: stats.completed, icon: BadgeCheck, color: 'text-chart-2', bg: 'bg-chart-2/5' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
      {cards.map(c => (
        <Card key={c.label} className="border-border/40 bg-card/80 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('p-1.5 rounded-lg', c.bg)}>
                <c.icon className={cn('h-3.5 w-3.5', c.color)} />
              </div>
              <span className="text-[10px] text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{c.value}</p>
          </CardContent>
        </Card>
      ))}
      {/* Action required strip */}
      {stats.needAction > 0 && (
        <div className="col-span-full">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-chart-3/5 border border-chart-3/20">
            <AlertTriangle className="h-3.5 w-3.5 text-chart-3 shrink-0" />
            <span className="text-xs text-chart-3 font-medium">
              {stats.needAction} document{stats.needAction > 1 ? 's' : ''} require your attention
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Acknowledgment Dialog ──
function AcknowledgmentDialog({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  doc: TransactionDocument;
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const typeMeta = DOCUMENT_TYPE_LABELS[doc.document_type] || DOCUMENT_TYPE_LABELS.other;
  const statusMeta = STATUS_LABELS[doc.status as DocumentStatus] || STATUS_LABELS.draft;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" /> Review & Confirm
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review the document summary before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document summary */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{typeMeta.icon}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                <p className="text-[10px] text-muted-foreground">{doc.document_number}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground text-[10px]">Type</p>
                <p className="font-medium">{typeMeta.label}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Status</p>
                <Badge className={cn('text-[10px]', statusMeta.color)}>{statusMeta.label}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">File</p>
                <p className="font-medium truncate">{doc.file_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Size</p>
                <p className="font-medium">{(doc.file_size / 1024).toFixed(0)} KB</p>
              </div>
              {doc.requires_signature && (
                <div className="col-span-2">
                  <p className="text-muted-foreground text-[10px]">Signatures</p>
                  <p className="font-medium">
                    {doc.current_signer_index}/{(doc.signature_order as any[])?.length || 0} collected
                  </p>
                </div>
              )}
            </div>
            {doc.description && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground">Description</p>
                <p className="text-xs text-foreground">{doc.description}</p>
              </div>
            )}
          </div>

          {/* Milestone tracker */}
          <DocumentMilestoneTracker doc={doc} />

          {/* Acknowledgment checkbox */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-3/5 border border-chart-3/20">
            <input
              type="checkbox"
              id="ack-check"
              checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-chart-3/50"
            />
            <Label htmlFor="ack-check" className="text-xs text-foreground cursor-pointer leading-relaxed">
              I have reviewed this document summary and confirm the information is accurate. I understand this document is part of a legal property transaction.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button
            disabled={!acknowledged}
            onClick={() => { onOpenChange(false); }}
            className="gap-1.5"
          >
            <UserCheck className="h-3.5 w-3.5" /> Acknowledge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──

const DocumentManagement: React.FC = () => {
  const { user, loading } = useAuth();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  if (loading) return null;
  if (!user) return <Navigate to="/?auth=true" replace />;

  if (selectedDocId) {
    return <DocumentDetail docId={selectedDocId} onBack={() => setSelectedDocId(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Document Management
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage property transaction documents — upload, review, sign & track
            </p>
          </div>
          <Button className="gap-2" onClick={() => setUploadCategory(null)}>
            <Plus className="h-4 w-4" /> Upload Document
          </Button>
        </div>

        {/* Stats Dashboard */}
        <DocumentStatsWrapper onFilter={setStatusFilter} />

        {/* Upload Category Cards */}
        <div className="mb-5">
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" /> QUICK UPLOAD
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {UPLOAD_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <Card
                  key={cat.id}
                  className={cn(
                    'cursor-pointer border transition-all hover:shadow-md group',
                    cat.bg
                  )}
                  onClick={() => { setUploadCategory(cat.id); setShowUpload(true); }}
                >
                  <CardContent className="p-3">
                    <Icon className={cn('h-5 w-5 mb-1.5', cat.color)} />
                    <p className="text-xs font-semibold text-foreground leading-tight">{cat.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{cat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tabs + Filters */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
              <TabsTrigger value="action_needed" className="text-xs h-7">Action Needed</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs h-7">Completed</TabsTrigger>
            </TabsList>
            <div className="flex-1" />
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted/30"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="mt-0">
            <DocumentList statusFilter={statusFilter} typeFilter={typeFilter} searchQuery={searchQuery} onSelect={setSelectedDocId} tabFilter="all" />
          </TabsContent>
          <TabsContent value="action_needed" className="mt-0">
            <DocumentList statusFilter={statusFilter} typeFilter={typeFilter} searchQuery={searchQuery} onSelect={setSelectedDocId} tabFilter="action_needed" />
          </TabsContent>
          <TabsContent value="completed" className="mt-0">
            <DocumentList statusFilter={statusFilter} typeFilter={typeFilter} searchQuery={searchQuery} onSelect={setSelectedDocId} tabFilter="completed" />
          </TabsContent>
        </Tabs>

        {/* Upload Dialog */}
        <UploadDocumentDialog
          open={showUpload}
          onOpenChange={setShowUpload}
          preselectedCategory={uploadCategory}
        />
      </div>
    </div>
  );
};

// ── Stats Wrapper (uses hook) ──
function DocumentStatsWrapper({ onFilter }: { onFilter: (s: string) => void }) {
  const { data: docs = [] } = useMyDocuments();
  return <DocumentStats docs={docs} />;
}

// ── Document List ──

function DocumentList({
  statusFilter, typeFilter, searchQuery, onSelect, tabFilter,
}: {
  statusFilter: string; typeFilter: string; searchQuery: string;
  onSelect: (id: string) => void;
  tabFilter: 'all' | 'action_needed' | 'completed';
}) {
  const { data: docs = [], isLoading } = useMyDocuments();
  const [ackDoc, setAckDoc] = useState<TransactionDocument | null>(null);

  const filtered = useMemo(() => {
    return docs.filter(d => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (typeFilter !== 'all' && d.document_type !== typeFilter) return false;
      if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase()) && !d.document_number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (tabFilter === 'action_needed') {
        return ['pending_review', 'awaiting_signatures', 'partially_signed'].includes(d.status);
      }
      if (tabFilter === 'completed') return d.status === 'completed';
      return true;
    });
  }, [docs, statusFilter, typeFilter, searchQuery, tabFilter]);

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
    <>
      <div className="space-y-2">
        {filtered.map(doc => {
          const typeMeta = DOCUMENT_TYPE_LABELS[doc.document_type] || DOCUMENT_TYPE_LABELS.other;
          const statusMeta = STATUS_LABELS[doc.status as DocumentStatus] || STATUS_LABELS.draft;
          const stage = getLifecycleStage(doc.status as DocumentStatus);

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border/40 bg-card/80 backdrop-blur hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">{typeMeta.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="min-w-0 cursor-pointer"
                          onClick={() => onSelect(doc.id)}
                        >
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{doc.document_number} · {typeMeta.label}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={cn('text-[10px]', statusMeta.color)}>{statusMeta.label}</Badge>
                          {doc.requires_signature && <FileSignature className="h-3.5 w-3.5 text-chart-3" />}
                        </div>
                      </div>

                      {/* Mini milestone tracker */}
                      <div className="flex items-center gap-1 mt-2">
                        {DOC_LIFECYCLE.map((step, i) => {
                          const isCompleted = stage >= 0 && i < stage;
                          const isCurrent = stage >= 0 && i === stage;
                          return (
                            <React.Fragment key={step.key}>
                              <div className={cn(
                                'w-2 h-2 rounded-full transition-colors',
                                isCompleted ? 'bg-chart-2' :
                                isCurrent ? 'bg-primary ring-2 ring-primary/20' :
                                stage < 0 ? 'bg-destructive/30' : 'bg-border/50'
                              )} />
                              {i < DOC_LIFECYCLE.length - 1 && (
                                <div className={cn(
                                  'w-4 h-px',
                                  isCompleted ? 'bg-chart-2' : 'bg-border/30'
                                )} />
                              )}
                            </React.Fragment>
                          );
                        })}
                        <span className="text-[9px] text-muted-foreground ml-1.5">
                          {stage >= 0 ? DOC_LIFECYCLE[Math.min(stage, DOC_LIFECYCLE.length - 1)].label : 'Cancelled'}
                        </span>
                      </div>

                      {/* Meta row + Actions */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span>{doc.file_name}</span>
                          <span>·</span>
                          <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                          <span>·</span>
                          <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); setAckDoc(doc); }}
                          >
                            <ClipboardCheck className="h-3 w-3" /> Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-primary"
                            onClick={() => onSelect(doc.id)}
                          >
                            <ChevronRight className="h-3 w-3" /> Details
                          </Button>
                        </div>
                      </div>

                      {/* Signature progress bar */}
                      {doc.requires_signature && (
                        <div className="mt-2">
                          <Progress
                            value={(doc.current_signer_index / Math.max((doc.signature_order as any[])?.length || 1, 1)) * 100}
                            className="h-1"
                          />
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {doc.current_signer_index}/{(doc.signature_order as any[])?.length || 0} signatures
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Acknowledgment dialog */}
      {ackDoc && (
        <AcknowledgmentDialog
          open={!!ackDoc}
          onOpenChange={(o) => { if (!o) setAckDoc(null); }}
          doc={ackDoc}
        />
      )}
    </>
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
  const [showAck, setShowAck] = useState(false);

  if (isLoading || !doc) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const mySignature = signatures.find(s => s.signer_id === user?.id);
  const canSign = mySignature && mySignature.status === 'pending';
  const typeMeta = DOCUMENT_TYPE_LABELS[doc.document_type] || DOCUMENT_TYPE_LABELS.other;
  const statusMeta = STATUS_LABELS[doc.status as DocumentStatus] || STATUS_LABELS.draft;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back to documents
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{typeMeta.icon}</span>
              <h1 className="text-lg font-bold text-foreground">{doc.title}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{doc.document_number} · {typeMeta.label}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn('text-xs', statusMeta.color)}>{statusMeta.label}</Badge>
            <Button
              variant="outline" size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowAck(true)}
            >
              <ClipboardCheck className="h-3.5 w-3.5" /> Review & Confirm
            </Button>
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

        {/* ── Milestone Tracker ── */}
        <Card className="mb-5 border-border/40 bg-card/80 backdrop-blur">
          <CardContent className="p-4 md:p-5">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> COMPLETION TRACKING
            </h3>
            <DocumentMilestoneTracker doc={doc} />
          </CardContent>
        </Card>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="signatures">Signatures ({signatures.length})</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail ({auditTrail.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border/40">
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

              <Card className="border-border/40">
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
                <Card className="md:col-span-2 border-border/40">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
                  <CardContent>
                    <img src={doc.file_url} alt={doc.title} className="max-h-[400px] mx-auto rounded-lg object-contain" />
                  </CardContent>
                </Card>
              )}
              {doc.mime_type === 'application/pdf' && (
                <Card className="md:col-span-2 border-border/40">
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

        {/* Acknowledgment */}
        <AcknowledgmentDialog
          open={showAck}
          onOpenChange={setShowAck}
          doc={doc}
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

  if (signatures.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No signatures required for this document</p>;

  return (
    <div className="space-y-2">
      {signatures.map((sig, i) => (
        <Card key={sig.id} className={cn('border-border/40', sig.signer_id === currentUserId && 'ring-1 ring-primary/30')}>
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
      {entries.map(entry => {
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

// ── Upload Dialog (enhanced with category) ──

function UploadDocumentDialog({
  open,
  onOpenChange,
  preselectedCategory,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  preselectedCategory: string | null;
}) {
  const category = preselectedCategory
    ? UPLOAD_CATEGORIES.find(c => c.id === preselectedCategory)
    : null;

  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>(category?.types[0] || 'other');
  const [description, setDescription] = useState('');
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadTransactionDocument();

  const availableTypes = category
    ? Object.entries(DOCUMENT_TYPE_LABELS).filter(([key]) => category.types.includes(key as DocumentType))
    : Object.entries(DOCUMENT_TYPE_LABELS);

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
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            {category ? category.label : 'Upload Document'}
          </DialogTitle>
          {category && (
            <DialogDescription className="text-xs">{category.description}</DialogDescription>
          )}
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
                {availableTypes.map(([key, { label, icon }]) => (
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
            <Switch id="requires-sig" checked={requiresSignature} onCheckedChange={setRequiresSignature} />
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

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX,
  Search, CheckCircle2, XCircle, AlertTriangle,
  Users, FileCheck, Clock, Ban,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface VerificationRecord {
  id: string;
  user_id: string;
  verification_type: string;
  document_type: string | null;
  status: string;
  rejection_reason: string | null;
  liveness_passed: boolean;
  face_match_passed: boolean;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: 'bg-chart-3/10 text-chart-3', icon: Clock },
  verified: { color: 'bg-chart-2/10 text-chart-2', icon: CheckCircle2 },
  rejected: { color: 'bg-destructive/10 text-destructive', icon: XCircle },
  manual_review: { color: 'bg-chart-1/10 text-chart-1', icon: AlertTriangle },
};

export default function AdminKYCPanel() {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, rejected: 0 });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('kyc_verifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching KYC records:', error);
      toast.error('Failed to load verification records');
    } else {
      setRecords((data || []) as unknown as VerificationRecord[]);
      const all = (data || []) as unknown as VerificationRecord[];
      setStats({
        total: all.length,
        verified: all.filter((r) => r.status === 'verified').length,
        pending: all.filter((r) => r.status === 'pending' || r.status === 'manual_review').length,
        rejected: all.filter((r) => r.status === 'rejected').length,
      });
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDecision = async (decision: 'verified' | 'rejected') => {
    if (!selectedRecord) return;

    const { error } = await supabase.functions.invoke('kyc-engine', {
      body: {
        action: 'admin_review',
        verification_id: selectedRecord.id,
        decision,
        rejection_reason: decision === 'rejected' ? rejectionReason : undefined,
      },
    });

    if (error) {
      toast.error('Failed to update verification');
      return;
    }

    toast.success(`Verification ${decision}`);
    setSelectedRecord(null);
    setRejectionReason('');
    fetchRecords();
  };

  const filtered = records.filter((r) =>
    r.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.verification_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">KYC & Identity Verification</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-foreground' },
          { label: 'Verified', value: stats.verified, icon: ShieldCheck, color: 'text-chart-2' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-chart-3' },
          { label: 'Rejected', value: stats.rejected, icon: ShieldX, color: 'text-destructive' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user ID or type…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'manual_review', 'verified', 'rejected'].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {loading ? (
          <Card className="border-border/50"><CardContent className="p-8 text-center text-muted-foreground">Loading…</CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card className="border-border/50"><CardContent className="p-8 text-center text-muted-foreground">No records found</CardContent></Card>
        ) : (
          filtered.map((record) => {
            const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <Card key={record.id} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedRecord(record)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{record.user_id.slice(0, 8)}…</p>
                      <p className="text-xs text-muted-foreground capitalize">{record.verification_type} · {record.document_type || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden md:flex gap-2">
                      {record.liveness_passed && <Badge variant="outline" className="text-xs bg-chart-2/5 text-chart-2">Liveness ✓</Badge>}
                      {record.face_match_passed && <Badge variant="outline" className="text-xs bg-chart-4/5 text-chart-4">Face ✓</Badge>}
                    </div>
                    <Badge className={`${cfg.color} capitalize`}>{record.status.replace('_', ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => { setSelectedRecord(null); setRejectionReason(''); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Review Verification
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">User ID</p><p className="font-mono text-foreground">{selectedRecord.user_id.slice(0, 16)}…</p></div>
                <div><p className="text-muted-foreground">Type</p><p className="capitalize text-foreground">{selectedRecord.verification_type}</p></div>
                <div><p className="text-muted-foreground">Document</p><p className="capitalize text-foreground">{selectedRecord.document_type || 'N/A'}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge className={STATUS_CONFIG[selectedRecord.status]?.color || ''} >{selectedRecord.status}</Badge></div>
                <div><p className="text-muted-foreground">Liveness</p><p className="text-foreground">{selectedRecord.liveness_passed ? '✅ Passed' : '❌ Failed'}</p></div>
                <div><p className="text-muted-foreground">Face Match</p><p className="text-foreground">{selectedRecord.face_match_passed ? '✅ Passed' : '❌ Failed'}</p></div>
              </div>

              {selectedRecord.rejection_reason && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <strong>Rejection reason:</strong> {selectedRecord.rejection_reason}
                </div>
              )}

              {(selectedRecord.status === 'pending' || selectedRecord.status === 'manual_review') && (
                <>
                  <Textarea
                    placeholder="Rejection reason (required if rejecting)…"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <DialogFooter className="gap-2">
                    <Button variant="destructive" onClick={() => handleDecision('rejected')} disabled={!rejectionReason.trim()}>
                      <Ban className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button onClick={() => handleDecision('verified')}>
                      <ShieldCheck className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

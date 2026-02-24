
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  Building2, ChevronRight, Send, Eye, Loader2, Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useMortgageApplication, usePartnerBanks } from '@/hooks/useMortgageApplication';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

interface MortgageApplication {
  id: string;
  full_name: string;
  bank_id: string | null;
  property_price: number;
  loan_amount: number;
  loan_term_years: number;
  interest_rate: number;
  monthly_payment: number;
  dti_ratio: number | null;
  qualification_status: string;
  status: string;
  status_history: Array<{ status: string; timestamp: string; note?: string }>;
  bank_reference_number: string | null;
  bank_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  submitted: { label: 'Submitted', icon: Send, color: 'text-chart-1', bgColor: 'bg-chart-1/10' },
  under_review: { label: 'Under Review', icon: Eye, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  documents_required: { label: 'Docs Required', icon: AlertCircle, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
  conditionally_approved: { label: 'Conditional', icon: AlertCircle, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  withdrawn: { label: 'Withdrawn', icon: XCircle, color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
};

const MortgageApplicationsTab: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { submitToBank, isSubmittingToBank } = useMortgageApplication();
  const { data: partnerBanks = [] } = usePartnerBanks();
  const [bankDialogAppId, setBankDialogAppId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['mortgage-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('mortgage_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as MortgageApplication[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-card/60 border-border/30">
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No Applications Yet</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Complete the pre-qualification wizard to submit your first mortgage application
          </p>
          <Button size="sm" onClick={() => navigate('/kpr/pre-qualification')}>
            Start Pre-Qualification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-muted-foreground">
          {applications.length} Application{applications.length !== 1 ? 's' : ''}
        </h3>
        <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => navigate('/kpr/pre-qualification')}>
          New Application
        </Button>
      </div>

      {applications.map((app, index) => {
        const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;
        const StatusIcon = statusConfig.icon;
        const history = Array.isArray(app.status_history) ? app.status_history : [];

        return (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="backdrop-blur-xl bg-card/60 border-border/30 hover:border-primary/20 transition-colors">
              <CardContent className="p-3">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg ${statusConfig.bgColor} flex items-center justify-center`}>
                      <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{formatIDR(app.loan_amount)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {app.loan_term_years}yr @ {app.interest_rate}%
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${statusConfig.color}`}>
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center p-1.5 rounded bg-muted/30">
                    <p className="text-[9px] text-muted-foreground">Monthly</p>
                    <p className="text-[11px] font-semibold">{formatIDR(app.monthly_payment)}</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-muted/30">
                    <p className="text-[9px] text-muted-foreground">Property</p>
                    <p className="text-[11px] font-semibold">{formatIDR(app.property_price)}</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-muted/30">
                    <p className="text-[9px] text-muted-foreground">DTI</p>
                    <p className="text-[11px] font-semibold">{app.dti_ratio?.toFixed(1) || '—'}%</p>
                  </div>
                </div>

                {/* Status Timeline */}
                {history.length > 0 && (
                  <div className="border-t border-border/30 pt-2 mt-2">
                    <p className="text-[9px] font-medium text-muted-foreground mb-1.5">Status Timeline</p>
                    <div className="space-y-1">
                      {history.slice(-3).map((entry, i) => {
                        const entryConfig = STATUS_CONFIG[entry.status] || STATUS_CONFIG.submitted;
                        return (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <div className={`h-1.5 w-1.5 rounded-full ${entryConfig.color.replace('text-', 'bg-')}`} />
                            <span className="font-medium">{entryConfig.label}</span>
                            <span className="text-muted-foreground ml-auto">
                              {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bank notes */}
                {app.bank_notes && (
                  <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                    <p className="text-[9px] font-medium text-primary mb-0.5">Bank Notes</p>
                    <p className="text-[10px] text-muted-foreground">{app.bank_notes}</p>
                  </div>
                )}

                {/* Submit to Bank action */}
                {app.status === 'submitted' && !app.bank_id && partnerBanks.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 h-7 text-[10px] border-primary/30"
                    onClick={() => { setBankDialogAppId(app.id); setSelectedBankId(null); }}
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    Submit to Partner Bank
                  </Button>
                )}

                {/* Reference */}
                {app.bank_reference_number && (
                  <p className="text-[9px] text-muted-foreground mt-1.5">
                    Ref: {app.bank_reference_number}
                  </p>
                )}

                <p className="text-[8px] text-muted-foreground mt-1.5">
                  Submitted {formatDistanceToNow(new Date(app.submitted_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Bank Selection Dialog */}
      <Dialog open={!!bankDialogAppId} onOpenChange={(open) => { if (!open) setBankDialogAppId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Select Partner Bank
            </DialogTitle>
          </DialogHeader>
          <RadioGroup
            value={selectedBankId || ''}
            onValueChange={setSelectedBankId}
            className="space-y-2"
          >
            {partnerBanks.map(bank => (
              <label
                key={bank.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedBankId === bank.id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <RadioGroupItem value={bank.id} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{bank.bank_name}</p>
                    {bank.is_featured && <Star className="h-3 w-3 text-gold-primary fill-gold-primary" />}
                  </div>
                  {bank.interest_rate_range && (
                    <p className="text-[11px] text-muted-foreground">Rate: {bank.interest_rate_range}</p>
                  )}
                </div>
                {bank.partnership_tier && (
                  <Badge variant="outline" className="text-[9px]">{bank.partnership_tier}</Badge>
                )}
              </label>
            ))}
          </RadioGroup>
          <Button
            onClick={async () => {
              if (!selectedBankId || !bankDialogAppId) return;
              try {
                await submitToBank({ applicationId: bankDialogAppId, bankId: selectedBankId });
                setBankDialogAppId(null);
              } catch (e) { /* handled */ }
            }}
            disabled={!selectedBankId || isSubmittingToBank}
            className="w-full"
          >
            {isSubmittingToBank ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit to Bank
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MortgageApplicationsTab;

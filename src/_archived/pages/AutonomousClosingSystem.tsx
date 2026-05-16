import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Circle, Clock, FileText, Shield, AlertTriangle,
  Upload, DollarSign, Lightbulb, ArrowRight, Download,
  BadgeCheck, Landmark, Scale, Banknote, CalendarCheck,
  ChevronRight, Wallet, FileCheck, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Step {
  label: string;
  status: 'completed' | 'active' | 'upcoming';
  confidence: number;
  checklist: { item: string; done: boolean }[];
}

const initialSteps: Step[] = [
  { label: 'Offer Submitted', status: 'completed', confidence: 100, checklist: [
    { item: 'Offer letter signed', done: true },
    { item: 'Initial deposit confirmed', done: true },
    { item: 'Agent acknowledgment', done: true },
  ]},
  { label: 'Negotiation Alignment', status: 'completed', confidence: 100, checklist: [
    { item: 'Counter-offer reviewed', done: true },
    { item: 'Price agreement reached', done: true },
    { item: 'Terms mutually accepted', done: true },
  ]},
  { label: 'Document Verification', status: 'active', confidence: 72, checklist: [
    { item: 'Title certificate (SHM) verified', done: true },
    { item: 'Tax clearance obtained', done: true },
    { item: 'Building permit validated', done: false },
    { item: 'Notary engagement confirmed', done: false },
  ]},
  { label: 'Payment Structuring', status: 'upcoming', confidence: 58, checklist: [
    { item: 'Payment schedule agreed', done: false },
    { item: 'Escrow account setup', done: false },
    { item: 'Bank transfer instructions', done: false },
  ]},
  { label: 'Legal Completion', status: 'upcoming', confidence: 45, checklist: [
    { item: 'AJB (deed of sale) drafted', done: false },
    { item: 'Notary signing scheduled', done: false },
    { item: 'Tax payments processed', done: false },
  ]},
  { label: 'Ownership Transfer', status: 'upcoming', confidence: 35, checklist: [
    { item: 'Certificate name change filed', done: false },
    { item: 'BPN registration submitted', done: false },
    { item: 'Keys handover', done: false },
  ]},
];

const documents = [
  { name: 'Purchase Agreement v2.pdf', status: 'verified', risk: 'none', uploaded: '2 days ago' },
  { name: 'SHM Certificate Scan.pdf', status: 'verified', risk: 'none', uploaded: '3 days ago' },
  { name: 'IMB Building Permit.pdf', status: 'pending', risk: 'minor', uploaded: '1 day ago' },
  { name: 'Tax Clearance Letter.pdf', status: 'verified', risk: 'none', uploaded: '2 days ago' },
  { name: 'Notary Engagement Letter.pdf', status: 'missing', risk: 'action', uploaded: '—' },
];

const paymentMilestones = [
  { label: 'Booking Fee', amount: 'Rp 50,000,000', status: 'paid', date: 'Mar 1, 2026' },
  { label: 'Down Payment (30%)', amount: 'Rp 450,000,000', status: 'paid', date: 'Mar 10, 2026' },
  { label: 'Second Installment', amount: 'Rp 375,000,000', status: 'due', date: 'Apr 15, 2026' },
  { label: 'Final Payment', amount: 'Rp 625,000,000', status: 'upcoming', date: 'May 30, 2026' },
];

const riskColor = (r: string) => r === 'none' ? 'text-emerald-600' : r === 'minor' ? 'text-amber-600' : 'text-rose-600';
const statusIcon = (s: string) => s === 'verified' ? <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> : s === 'pending' ? <Clock className="w-3.5 h-3.5 text-amber-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;

const AutonomousClosingSystem = () => {
  const [expandedStep, setExpandedStep] = useState(2);
  const complianceScore = 78;
  const fundingReadiness = 64;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-border bg-background">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <Scale className="w-4 h-4 text-primary" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase tracking-widest font-medium">
                    Closing System
                  </Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                  Smart Transaction Closing
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI-guided workflow to complete property investment deals efficiently
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> DEAL ACTIVE
                </span>
                <Button variant="outline" className="text-[10px] h-7 px-3" onClick={() => toast.success('Closing report exported')}>
                  <Download className="w-3 h-3 mr-1.5" /> EXPORT
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Deal Progress Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-5">Deal Progress Timeline</h3>

            {/* Horizontal step bar */}
            <div className="hidden md:flex items-center justify-between mb-6">
              {initialSteps.map((step, i) => {
                const isCompleted = step.status === 'completed';
                const isActive = step.status === 'active';
                return (
                  <React.Fragment key={i}>
                    <button
                      onClick={() => setExpandedStep(i)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                        isActive ? 'bg-primary/10 border-primary text-primary' :
                        'bg-muted border-border text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> :
                         isActive ? <span className="text-[10px] font-bold">{i + 1}</span> :
                         <Circle className="w-3 h-3" />}
                      </div>
                      <span className={`text-[9px] text-center max-w-[80px] leading-tight ${
                        isActive ? 'text-primary font-semibold' : isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}>{step.label}</span>
                      <span className={`text-[8px] ${isCompleted ? 'text-emerald-600' : 'text-muted-foreground'}`}>{step.confidence}%</span>
                    </button>
                    {i < initialSteps.length - 1 && (
                      <div className="flex-1 mx-2 h-0.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={isCompleted ? 'h-full bg-emerald-500' : isActive ? 'h-full bg-primary/40' : 'h-full'}
                          initial={{ width: 0 }}
                          animate={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                          transition={{ duration: 0.8, delay: i * 0.15 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mobile step list */}
            <div className="md:hidden space-y-2 mb-4">
              {initialSteps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setExpandedStep(i)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                    expandedStep === i ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    step.status === 'completed' ? 'bg-emerald-500 text-white' :
                    step.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium flex-1">{step.label}</span>
                  <span className="text-[9px] text-muted-foreground">{step.confidence}%</span>
                </button>
              ))}
            </div>

            {/* Expanded step checklist */}
            {expandedStep !== null && (
              <motion.div
                key={expandedStep}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border border-border rounded-lg p-4 bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold">{initialSteps[expandedStep].label}</h4>
                  <Badge variant="outline" className="text-[8px]">
                    Confidence: {initialSteps[expandedStep].confidence}%
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {initialSteps[expandedStep].checklist.map((c, ci) => (
                    <div key={ci} className="flex items-center gap-2 text-[11px]">
                      {c.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={c.done ? 'text-foreground' : 'text-muted-foreground'}>{c.item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Documents + Financial */}
            <div className="lg:col-span-2 space-y-5">
              {/* Document Intelligence Panel */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Document Intelligence</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground">Compliance:</span>
                    <span className={`text-xs font-bold ${complianceScore >= 80 ? 'text-emerald-600' : complianceScore >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {complianceScore}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate">{doc.name}</p>
                        <p className="text-[9px] text-muted-foreground">{doc.uploaded}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.risk !== 'none' && (
                          <Badge variant="outline" className={`text-[7px] ${riskColor(doc.risk)} border-current`}>
                            {doc.risk === 'minor' ? 'REVIEW' : 'REQUIRED'}
                          </Badge>
                        )}
                        {statusIcon(doc.status)}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <Progress value={complianceScore} className="h-1.5" />
                  <p className="text-[8px] text-muted-foreground mt-1.5">4 of 5 documents verified · 1 pending action</p>
                </div>
              </motion.div>

              {/* Financial Structure Module */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Payment Structure</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground">Funding Readiness:</span>
                    <span className={`text-xs font-bold ${fundingReadiness >= 80 ? 'text-emerald-600' : fundingReadiness >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {fundingReadiness}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {paymentMilestones.map((pm, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        pm.status === 'due' ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5' : 'border-border'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        pm.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-500/10' :
                        pm.status === 'due' ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-muted'
                      }`}>
                        {pm.status === 'paid' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
                         pm.status === 'due' ? <Clock className="w-3.5 h-3.5 text-amber-600" /> :
                         <Banknote className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium">{pm.label}</p>
                        <p className="text-[9px] text-muted-foreground">{pm.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">{pm.amount}</p>
                        <p className={`text-[8px] font-medium ${
                          pm.status === 'paid' ? 'text-emerald-600' : pm.status === 'due' ? 'text-amber-600' : 'text-muted-foreground'
                        }`}>
                          {pm.status === 'paid' ? 'PAID' : pm.status === 'due' ? 'DUE SOON' : 'SCHEDULED'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <p className="text-[9px] text-muted-foreground">Total: <span className="font-semibold text-foreground">Rp 1,500,000,000</span></p>
                  <p className="text-[9px] text-muted-foreground">Paid: <span className="font-semibold text-emerald-600">Rp 500,000,000</span> (33%)</p>
                </div>
              </motion.div>
            </div>

            {/* Right: AI Advisor + Actions */}
            <div className="space-y-5">
              {/* AI Deal Advisor */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-3.5 h-3.5 text-primary" />
                  <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">AI Deal Advisor</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { text: 'Offer adjustment recommended to accelerate agreement — seller responsive to 2% flexibility.', urgency: 'medium' },
                    { text: 'Liquidity window favorable for faster closing. Current bank processing times averaging 5 business days.', urgency: 'low' },
                    { text: 'Missing notary engagement letter may delay Legal Completion step by 3–5 days.', urgency: 'high' },
                  ].map((advice, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                        advice.urgency === 'high' ? 'border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 text-rose-800 dark:text-rose-300' :
                        advice.urgency === 'medium' ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 text-amber-800 dark:text-amber-300' :
                        'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      {advice.text}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Closing Metrics</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Overall Progress', value: '42%', icon: BarProgress },
                    { label: 'Days in Pipeline', value: '12', icon: CalendarCheck },
                    { label: 'Est. Days to Close', value: '18', icon: Clock },
                    { label: 'Risk Level', value: 'Low-Medium', icon: Shield },
                    { label: 'Agent Response', value: '< 2hrs avg', icon: ArrowRight },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-semibold text-foreground">{m.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Button
                  className="w-full text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success('Document upload dialog opened')}
                >
                  <Upload className="w-3.5 h-3.5 mr-2" /> Upload Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Milestone completion confirmed')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Confirm Milestone
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('AI Closing Assistance activated')}
                >
                  <Lock className="w-3.5 h-3.5 mr-2" /> Activate Closing Assist
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Tiny helper – avoids importing unused icon */
const BarProgress = () => null;

export default AutonomousClosingSystem;

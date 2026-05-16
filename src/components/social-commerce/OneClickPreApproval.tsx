import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, CheckCircle2, ArrowRight, Loader2,
  Building2, Banknote, Calculator, Shield, Zap,
  Clock, BadgeCheck, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface OneClickPreApprovalProps {
  propertyId?: string;
  propertyPrice?: number;
  sourcePlatform?: string;
  onComplete?: (preApprovalId: string) => void;
}

type Step = 'intro' | 'income' | 'details' | 'processing' | 'result';

const OneClickPreApproval: React.FC<OneClickPreApprovalProps> = ({
  propertyId,
  propertyPrice = 0,
  sourcePlatform = 'direct',
  onComplete
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preApprovalResult, setPreApprovalResult] = useState<{
    approved: boolean;
    amount: number;
    rate: number;
    monthlyPayment: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    monthlyIncome: '',
    employmentStatus: 'employed',
    downPayment: propertyPrice ? Math.round(propertyPrice * 0.2).toString() : '',
    loanTerm: '20'
  });

  const progress = {
    intro: 0,
    income: 33,
    details: 66,
    processing: 90,
    result: 100
  };

  const handleSubmit = async () => {
    setStep('processing');
    setIsSubmitting(true);

    try {
      // Simulate pre-approval processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      const monthlyIncome = parseFloat(formData.monthlyIncome) || 0;
      const downPayment = parseFloat(formData.downPayment) || 0;
      const maxLoanAmount = monthlyIncome * 12 * 5; // 5x annual income
      const requestedLoan = propertyPrice - downPayment;
      const approved = requestedLoan <= maxLoanAmount && monthlyIncome >= 10000000;
      const rate = 7.5 + (Math.random() * 2); // 7.5-9.5%
      const monthlyPayment = approved 
        ? (requestedLoan * (rate/100/12) * Math.pow(1 + rate/100/12, parseInt(formData.loanTerm) * 12)) / 
          (Math.pow(1 + rate/100/12, parseInt(formData.loanTerm) * 12) - 1)
        : 0;

      // Save to database
      const { data, error } = await supabase
        .from('mortgage_preapproval_requests')
        .insert({
          user_id: user?.id,
          property_id: propertyId,
          source_platform: sourcePlatform,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          monthly_income: monthlyIncome,
          employment_status: formData.employmentStatus,
          down_payment_amount: downPayment,
          requested_loan_amount: requestedLoan,
          preferred_term_years: parseInt(formData.loanTerm),
          status: approved ? 'approved' : 'pending',
          preapproval_amount: approved ? requestedLoan : null,
          preapproval_rate: approved ? rate : null
        })
        .select()
        .single();

      if (error) throw error;

      setPreApprovalResult({
        approved,
        amount: approved ? requestedLoan : 0,
        rate: approved ? rate : 0,
        monthlyPayment: approved ? monthlyPayment : 0
      });

      setStep('result');
      
      if (approved) {
        onComplete?.(data.id);
        toast({
          title: "Pre-Approval Successful! 🎉",
          description: "You're one step closer to your dream home"
        });
      }
    } catch (error) {
      console.error('Pre-approval error:', error);
      toast({
        title: "Error",
        description: "Failed to process pre-approval. Please try again.",
        variant: "destructive"
      });
      setStep('details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/20 rounded-xl">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>One-Click Pre-Approval</CardTitle>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Get approved in under 3 minutes
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
            <Zap className="h-3 w-3 mr-1" />
            Instant
          </Badge>
        </div>
        <Progress value={progress[step]} className="mt-4 h-1.5 bg-primary-foreground/20" />
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {/* Intro Step */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-muted/50">
                  <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-sm font-medium">3 Minutes</div>
                  <div className="text-xs text-muted-foreground">Quick Process</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <Shield className="h-8 w-8 mx-auto text-chart-1 mb-2" />
                  <div className="text-sm font-medium">Secure</div>
                  <div className="text-xs text-muted-foreground">Bank-Level</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <BadgeCheck className="h-8 w-8 mx-auto text-chart-4 mb-2" />
                  <div className="text-sm font-medium">No Impact</div>
                  <div className="text-xs text-muted-foreground">Soft Check</div>
                </div>
              </div>

              {propertyPrice > 0 && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="text-sm text-muted-foreground">Property Price</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(propertyPrice)}
                  </div>
                </div>
              )}

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => setStep('income')}
              >
                Start Pre-Approval
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Income Step */}
          {step === 'income' && (
            <motion.div
              key="income"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Monthly Income (IDR)</Label>
                <Input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  placeholder="e.g., 25000000"
                />
              </div>

              <div className="space-y-2">
                <Label>Employment Status</Label>
                <Select
                  value={formData.employmentStatus}
                  onValueChange={(v) => setFormData({ ...formData, employmentStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed (Full-time)</SelectItem>
                    <SelectItem value="self_employed">Self-Employed</SelectItem>
                    <SelectItem value="business_owner">Business Owner</SelectItem>
                    <SelectItem value="contract">Contract/Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('intro')}>
                  Back
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => setStep('details')}
                  disabled={!formData.fullName || !formData.email || !formData.monthlyIncome}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Down Payment (IDR)</Label>
                <Input
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                  placeholder="e.g., 200000000"
                />
                {propertyPrice > 0 && formData.downPayment && (
                  <p className="text-xs text-muted-foreground">
                    {((parseFloat(formData.downPayment) / propertyPrice) * 100).toFixed(1)}% of property price
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Loan Term</Label>
                <Select
                  value={formData.loanTerm}
                  onValueChange={(v) => setFormData({ ...formData, loanTerm: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Years</SelectItem>
                    <SelectItem value="15">15 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                    <SelectItem value="25">25 Years</SelectItem>
                    <SelectItem value="30">30 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('income')}>
                  Back
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={handleSubmit}
                  disabled={!formData.downPayment}
                >
                  <Zap className="h-4 w-4" />
                  Get Pre-Approved
                </Button>
              </div>
            </motion.div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Processing Your Application</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Checking with our partner banks...
                </p>
              </div>
            </motion.div>
          )}

          {/* Result Step */}
          {step === 'result' && preApprovalResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {preApprovalResult.approved ? (
                <>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chart-1/10 text-chart-1 mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-chart-1">Pre-Approved!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Congratulations! You qualify for a mortgage
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-chart-1/10 dark:bg-chart-1/20 border border-chart-1/20 dark:border-chart-1/30">
                      <div className="text-sm text-muted-foreground">Approved Amount</div>
                      <div className="text-2xl font-bold text-chart-1">
                        {formatCurrency(preApprovalResult.amount)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-muted/50">
                        <div className="text-xs text-muted-foreground">Interest Rate</div>
                        <div className="text-lg font-semibold">
                          {preApprovalResult.rate.toFixed(2)}%
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50">
                        <div className="text-xs text-muted-foreground">Monthly Payment</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(preApprovalResult.monthlyPayment)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full gap-2" size="lg">
                    <Banknote className="h-4 w-4" />
                    Complete Application
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chart-3/10 text-chart-3 mb-4">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">Under Review</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We need more information to process your application
                    </p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setStep('intro')}
                  >
                    Try Again
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default OneClickPreApproval;

import React, { useState, useMemo, useCallback } from 'react';
import { useMortgageCalculator, calculateMortgage, BankComparison } from '@/hooks/useMortgageCalculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calculator, TrendingUp, Building2, Percent, Calendar,
  DollarSign, PiggyBank, AlertCircle, CheckCircle, Phone,
  ArrowRight, Sparkles, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MortgageCalculatorProps {
  propertyPrice?: number;
  propertyId?: string;
  className?: string;
  compact?: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  propertyPrice: initialPrice = 1000000000,
  propertyId,
  className,
  compact = false
}) => {
  const { banks, rates, isLoading, compareAllBanks, submitInquiry, isSubmitting } = useMortgageCalculator();

  // Calculator state
  const [propertyPrice, setPropertyPrice] = useState(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(15);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);

  // Inquiry dialog
  const [showInquiry, setShowInquiry] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<BankComparison | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    employment_type: ''
  });

  // Derived calculations
  const downPayment = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPayment;

  // Get selected rate
  const selectedRate = useMemo(() => {
    if (!selectedRateId) return null;
    return rates.find(r => r.id === selectedRateId);
  }, [selectedRateId, rates]);

  // Calculate result
  const calculationResult = useMemo(() => {
    const interestRate = selectedRate?.interest_rate_year1 || 7.0;
    return calculateMortgage({
      propertyPrice,
      downPayment,
      loanTermYears,
      interestRate,
      monthlyIncome: monthlyIncome || undefined
    });
  }, [propertyPrice, downPayment, loanTermYears, selectedRate, monthlyIncome]);

  // Bank comparisons
  const comparisons = useMemo(() => {
    return compareAllBanks(propertyPrice, downPayment, loanTermYears);
  }, [propertyPrice, downPayment, loanTermYears, compareAllBanks]);

  const handleBankSelect = useCallback((bankId: string) => {
    setSelectedBankId(bankId);
    const bankRates = rates.filter(r => r.bank_id === bankId);
    if (bankRates.length > 0) {
      setSelectedRateId(bankRates[0].id);
    }
  }, [rates]);

  const handleInquirySubmit = async () => {
    if (!selectedComparison) return;

    await submitInquiry({
      bank_id: selectedComparison.bank_id,
      property_id: propertyId,
      full_name: inquiryForm.full_name,
      email: inquiryForm.email,
      phone: inquiryForm.phone,
      monthly_income: monthlyIncome || undefined,
      employment_type: inquiryForm.employment_type,
      loan_amount_requested: loanAmount,
      loan_term_requested: loanTermYears
    });

    setShowInquiry(false);
    setInquiryForm({ full_name: '', email: '', phone: '', employment_type: '' });
  };

  const getAffordabilityStatus = () => {
    const ratio = calculationResult.affordabilityRatio;
    if (!ratio) return null;
    
    if (ratio <= 30) return { status: 'excellent', label: 'Excellent', color: 'text-chart-1' };
    if (ratio <= 40) return { status: 'good', label: 'Good', color: 'text-chart-4' };
    if (ratio <= 50) return { status: 'moderate', label: 'Moderate', color: 'text-chart-3' };
    return { status: 'high', label: 'High Risk', color: 'text-destructive' };
  };

  const affordabilityStatus = getAffordabilityStatus();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading calculator...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>KPR Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your monthly payments and compare rates from Indonesian banks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Price */}
          <div className="space-y-2">
            <Label>Property Price</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rp</span>
              <Input
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(propertyPrice)}
            </p>
          </div>

          {/* Down Payment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Down Payment (DP)</Label>
              <Badge variant="secondary">{downPaymentPercent}%</Badge>
            </div>
            <Slider
              value={[downPaymentPercent]}
              onValueChange={([value]) => setDownPaymentPercent(value)}
              min={5}
              max={50}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{formatCurrency(downPayment)}</span>
              <span className="font-medium">Loan: {formatCurrency(loanAmount)}</span>
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Loan Term</Label>
              <Badge variant="secondary">{loanTermYears} years</Badge>
            </div>
            <Slider
              value={[loanTermYears]}
              onValueChange={([value]) => setLoanTermYears(value)}
              min={5}
              max={30}
              step={1}
              className="py-2"
            />
          </div>

          {/* Monthly Income (Optional) */}
          <div className="space-y-2">
            <Label>Monthly Income (Optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rp</span>
              <Input
                type="number"
                value={monthlyIncome || ''}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                placeholder="For affordability check"
                className="font-mono"
              />
            </div>
          </div>

          {/* Bank Selection */}
          <div className="space-y-2">
            <Label>Select Bank</Label>
            <Select value={selectedBankId} onValueChange={handleBankSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map(bank => (
                  <SelectItem key={bank.id} value={bank.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {bank.bank_name}
                      {bank.is_featured && (
                        <Badge variant="secondary" className="ml-2 text-xs">Featured</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rate Selection */}
          {selectedBankId && (
            <div className="space-y-2">
              <Label>Select Rate Type</Label>
              <Select value={selectedRateId} onValueChange={setSelectedRateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose rate" />
                </SelectTrigger>
                <SelectContent>
                  {rates.filter(r => r.bank_id === selectedBankId).map(rate => (
                    <SelectItem key={rate.id} value={rate.id}>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        {rate.rate_name} - {rate.interest_rate_year1}%
                        {rate.rate_type === 'promotional' && (
                          <Badge className="ml-2 text-xs bg-chart-1">Promo</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Calculation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(calculationResult.monthlyPayment)}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Payment</p>
            </div>
            
            <div className="text-center p-4 bg-background rounded-lg">
              <PiggyBank className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xl font-semibold">
                {formatCurrency(calculationResult.totalPayment)}
              </p>
              <p className="text-sm text-muted-foreground">Total Payment</p>
            </div>
            
            <div className="text-center p-4 bg-background rounded-lg">
              <Percent className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xl font-semibold">
                {formatCurrency(calculationResult.totalInterest)}
              </p>
              <p className="text-sm text-muted-foreground">Total Interest</p>
            </div>
            
            <div className="text-center p-4 bg-background rounded-lg">
              {affordabilityStatus ? (
                <>
                  {affordabilityStatus.status === 'excellent' || affordabilityStatus.status === 'good' ? (
                    <CheckCircle className={cn("h-8 w-8 mx-auto mb-2", affordabilityStatus.color)} />
                  ) : (
                    <AlertCircle className={cn("h-8 w-8 mx-auto mb-2", affordabilityStatus.color)} />
                  )}
                  <p className={cn("text-xl font-semibold", affordabilityStatus.color)}>
                    {calculationResult.affordabilityRatio?.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    DTI Ratio ({affordabilityStatus.label})
                  </p>
                </>
              ) : (
                <>
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xl font-semibold text-muted-foreground">—</p>
                  <p className="text-sm text-muted-foreground">Add income for DTI</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Comparison */}
      {!compact && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Bank Comparison
                </CardTitle>
                <CardDescription>
                  Compare rates from {banks.length} Indonesian banks
                </CardDescription>
              </div>
              <Badge variant="outline">
                {comparisons.length} options
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank</TableHead>
                    <TableHead>Rate Type</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisons.slice(0, 20).map((comparison, index) => (
                    <TableRow 
                      key={`${comparison.bank_id}-${comparison.rate_id}`}
                      className={index === 0 ? 'bg-chart-1/5' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Badge className="bg-chart-1 text-xs">Best</Badge>
                          )}
                          <span className="font-medium">{comparison.bank_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{comparison.rate_name}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {comparison.interest_rate}%
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(comparison.monthly_payment)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(comparison.total_payment + comparison.total_fees)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedComparison(comparison);
                            setShowInquiry(true);
                          }}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Amortization Schedule (non-compact) */}
      {!compact && selectedRate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Yearly Payment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Annual Payment</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculationResult.yearlyBreakdown.map(year => (
                    <TableRow key={year.year}>
                      <TableCell>Year {year.year}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(year.totalPaid)}
                      </TableCell>
                      <TableCell className="text-right text-chart-1">
                        {formatCurrency(year.principalPaid)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(year.interestPaid)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(year.remainingBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Inquiry Dialog */}
      <Dialog open={showInquiry} onOpenChange={setShowInquiry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for KPR</DialogTitle>
            <DialogDescription>
              Submit your information and {selectedComparison?.bank_name} will contact you
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedComparison && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">{selectedComparison.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span>{selectedComparison.interest_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Payment</span>
                  <span className="font-medium">{formatCurrency(selectedComparison.monthly_payment)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={inquiryForm.full_name}
                onChange={(e) => setInquiryForm({ ...inquiryForm, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={inquiryForm.email}
                onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                value={inquiryForm.phone}
                onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                placeholder="+62 xxx xxx xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={inquiryForm.employment_type}
                onValueChange={(value) => setInquiryForm({ ...inquiryForm, employment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="self_employed">Self Employed</SelectItem>
                  <SelectItem value="business_owner">Business Owner</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInquiry(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInquirySubmit}
              disabled={!inquiryForm.full_name || !inquiryForm.email || !inquiryForm.phone || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MortgageCalculator;

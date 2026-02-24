import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Calculator, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { formatIDR } from '@/utils/currency';
import { useTranslation } from '@/i18n/useTranslation';

const InvestmentROICalculator = () => {
  const { t } = useTranslation();
  const [purchasePrice, setPurchasePrice] = useState(2_000_000_000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8);
  const [rentalYield, setRentalYield] = useState(5);
  const [projectionYears, setProjectionYears] = useState('20');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const { data: cityAverages } = useQuery({
    queryKey: ['roi-city-averages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('price, city')
        .eq('status', 'active')
        .eq('approval_status', 'approved');
      if (error) throw error;

      const cityMap: Record<string, number[]> = {};
      (data || []).forEach((p: any) => {
        if (!p.city) return;
        if (!cityMap[p.city]) cityMap[p.city] = [];
        cityMap[p.city].push(p.price);
      });

      return Object.entries(cityMap).map(([city, prices]) => ({
        city,
        avgPrice: Math.round(prices.reduce((s, v) => s + v, 0) / prices.length),
      })).sort((a, b) => b.avgPrice - a.avgPrice);
    },
  });

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city !== 'all' && cityAverages) {
      const avg = cityAverages.find(c => c.city === city);
      if (avg) setPurchasePrice(avg.avgPrice);
    }
  };

  const calculations = useMemo(() => {
    const downPayment = purchasePrice * (downPaymentPct / 100);
    const principal = purchasePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const years = parseInt(projectionYears);
    const totalMonths = years * 12;

    const monthlyMortgage = monthlyRate > 0
      ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))
      : principal / totalMonths;

    const annualMortgage = monthlyMortgage * 12;
    const annualRental = purchasePrice * (rentalYield / 100);
    const annualCashFlow = annualRental - annualMortgage;
    const cashOnCash = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;

    let cumulative = 0;
    let breakEvenYear = -1;
    const projection = [];

    for (let y = 1; y <= years; y++) {
      cumulative += annualCashFlow;
      const equity = (principal / totalMonths) * 12 * y;
      projection.push({
        year: `Y${y}`,
        cashFlow: Math.round(annualCashFlow),
        cumulativeCashFlow: Math.round(cumulative),
        equity: Math.round(equity),
        totalReturn: Math.round(cumulative + equity),
      });
      if (breakEvenYear === -1 && cumulative >= downPayment) breakEvenYear = y;
    }

    return { monthlyMortgage, annualRental, annualCashFlow, cashOnCash, breakEvenYear, downPayment, projection };
  }, [purchasePrice, downPaymentPct, interestRate, rentalYield, projectionYears]);

  return (
    <div className="space-y-4">
      <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs md:text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            {t('analytics.investmentParams')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">{t('analytics.cityPrefill')}</Label>
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('analytics.manualInput')}</SelectItem>
                  {cityAverages?.map(c => <SelectItem key={c.city} value={c.city}>{c.city} ({formatIDR(c.avgPrice)})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t('analytics.purchasePrice')}</Label>
              <Input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t('analytics.downPayment')}</Label>
              <Input type="number" value={downPaymentPct} onChange={e => setDownPaymentPct(Number(e.target.value))} className="h-8 text-xs" min={0} max={100} />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t('analytics.interestRate')}</Label>
              <Input type="number" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} className="h-8 text-xs" step={0.1} />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t('analytics.rentalYield')}</Label>
              <Input type="number" value={rentalYield} onChange={e => setRentalYield(Number(e.target.value))} className="h-8 text-xs" step={0.1} />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t('analytics.projectionPeriod')}</Label>
              <Select value={projectionYears} onValueChange={setProjectionYears}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 {t('analytics.years')}</SelectItem>
                  <SelectItem value="10">10 {t('analytics.years')}</SelectItem>
                  <SelectItem value="15">15 {t('analytics.years')}</SelectItem>
                  <SelectItem value="20">20 {t('analytics.years')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
          <CardContent className="p-2 md:p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
            <div className="text-[10px] text-muted-foreground">{t('analytics.monthlyMortgage')}</div>
            <div className="text-xs md:text-sm font-bold">{formatIDR(Math.round(calculations.monthlyMortgage))}</div>
          </CardContent>
        </Card>
        <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
          <CardContent className="p-2 md:p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-chart-1 mb-1" />
            <div className="text-[10px] text-muted-foreground">{t('analytics.annualRentalIncome')}</div>
            <div className="text-xs md:text-sm font-bold">{formatIDR(Math.round(calculations.annualRental))}</div>
          </CardContent>
        </Card>
        <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
          <CardContent className="p-2 md:p-3 text-center">
            <Calculator className="h-4 w-4 mx-auto text-chart-3 mb-1" />
            <div className="text-[10px] text-muted-foreground">{t('analytics.cashOnCashReturn')}</div>
            <div className={`text-xs md:text-sm font-bold ${calculations.cashOnCash >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
              {calculations.cashOnCash.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
          <CardContent className="p-2 md:p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-chart-5 mb-1" />
            <div className="text-[10px] text-muted-foreground">{t('analytics.breakEven')}</div>
            <div className="text-xs md:text-sm font-bold">
              {calculations.breakEvenYear > 0 ? `${calculations.breakEvenYear} ${t('analytics.years').toLowerCase()}` : t('analytics.na')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs md:text-sm">{t('analytics.roiProjection')}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-3">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={calculations.projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e9).toFixed(1)}B`} />
              <Tooltip formatter={(value: number) => formatIDR(value)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="equity" name={t('analytics.equityBuilt')} fill="hsl(var(--primary) / 0.3)" />
              <Line type="monotone" dataKey="cumulativeCashFlow" name={t('analytics.cumulativeCashFlow')} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="totalReturn" name={t('analytics.totalReturn')} stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentROICalculator;

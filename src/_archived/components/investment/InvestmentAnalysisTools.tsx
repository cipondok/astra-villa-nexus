import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Calculator, DollarSign, BarChart3, PieChart, 
  Home, Building2, ArrowUpRight, ArrowDownRight, Percent,
  Calendar, MapPin, Sparkles, ChevronRight, Info, Globe, Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';
import { getCurrencyFormatterShort, getCurrencyFormatter } from '@/stores/currencyStore';

const formatIDR = (v: number) => getCurrencyFormatterShort()(v);

const GOLD_COLORS = ['hsl(45, 93%, 47%)', 'hsl(38, 92%, 50%)', 'hsl(43, 96%, 56%)', 'hsl(48, 96%, 53%)', 'hsl(36, 100%, 40%)'];

/* ═══════════════════════════════════════════════════════════════════════════
   ROI CALCULATOR
   ═══════════════════════════════════════════════════════════════════════════ */
const ROICalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(5000000000);
  const [downPayment, setDownPayment] = useState(30);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [monthlyRental, setMonthlyRental] = useState(35000000);
  const [annualAppreciation, setAnnualAppreciation] = useState(7);
  const [annualExpenses, setAnnualExpenses] = useState(5);
  const [holdingPeriod, setHoldingPeriod] = useState(10);

  const results = useMemo(() => {
    const dp = purchasePrice * (downPayment / 100);
    const loan = purchasePrice - dp;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    const monthlyMortgage = loan > 0 ? loan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;
    
    const annualRental = monthlyRental * 12;
    const annualExpenseAmount = purchasePrice * (annualExpenses / 100);
    const netAnnualIncome = annualRental - annualExpenseAmount - (monthlyMortgage * 12);
    
    const grossYield = (annualRental / purchasePrice) * 100;
    const netYield = (netAnnualIncome / dp) * 100;
    const cashOnCash = ((annualRental - annualExpenseAmount - monthlyMortgage * 12) / dp) * 100;
    
    const futureValue = purchasePrice * Math.pow(1 + annualAppreciation / 100, holdingPeriod);
    const totalAppreciation = futureValue - purchasePrice;
    const totalRentalIncome = annualRental * holdingPeriod;
    const totalExpenses = annualExpenseAmount * holdingPeriod;
    const totalMortgage = monthlyMortgage * 12 * Math.min(holdingPeriod, loanTerm);
    const totalProfit = totalAppreciation + totalRentalIncome - totalExpenses - totalMortgage;
    const totalROI = (totalProfit / dp) * 100;

    const projectionData = Array.from({ length: holdingPeriod + 1 }, (_, year) => {
      const propValue = purchasePrice * Math.pow(1 + annualAppreciation / 100, year);
      const cumulativeRental = annualRental * year;
      const cumulativeExpenses = annualExpenseAmount * year;
      const equity = propValue - Math.max(0, loan - (monthlyMortgage * 12 * year * 0.3));
      return {
        year: `Y${year}`,
        propertyValue: Math.round(propValue),
        equity: Math.round(equity),
        cumulativeIncome: Math.round(cumulativeRental - cumulativeExpenses),
      };
    });

    return { dp, loan, monthlyMortgage, grossYield, netYield, cashOnCash, futureValue, totalAppreciation, totalRentalIncome, totalProfit, totalROI, projectionData };
  }, [purchasePrice, downPayment, interestRate, loanTerm, monthlyRental, annualAppreciation, annualExpenses, holdingPeriod]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inputs */}
        <Card className="lg:col-span-1 bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
                <Calculator className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              Investment Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Purchase Price</Label>
              <div className="text-sm font-bold text-foreground">{formatIDR(purchasePrice)}</div>
              <Slider value={[purchasePrice]} min={500000000} max={50000000000} step={500000000} onValueChange={([v]) => setPurchasePrice(v)} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Down Payment</Label>
                <div className="text-sm font-bold">{downPayment}%</div>
                <Slider value={[downPayment]} min={10} max={100} step={5} onValueChange={([v]) => setDownPayment(v)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Interest Rate</Label>
                <div className="text-sm font-bold">{interestRate}%</div>
                <Slider value={[interestRate]} min={4} max={15} step={0.5} onValueChange={([v]) => setInterestRate(v)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Loan Term</Label>
                <div className="text-sm font-bold">{loanTerm} years</div>
                <Slider value={[loanTerm]} min={5} max={30} step={5} onValueChange={([v]) => setLoanTerm(v)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Hold Period</Label>
                <div className="text-sm font-bold">{holdingPeriod} years</div>
                <Slider value={[holdingPeriod]} min={1} max={30} step={1} onValueChange={([v]) => setHoldingPeriod(v)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Monthly Rental Income</Label>
              <div className="text-sm font-bold">{formatIDR(monthlyRental)}</div>
              <Slider value={[monthlyRental]} min={5000000} max={200000000} step={5000000} onValueChange={([v]) => setMonthlyRental(v)} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Appreciation/yr</Label>
                <div className="text-sm font-bold">{annualAppreciation}%</div>
                <Slider value={[annualAppreciation]} min={0} max={20} step={0.5} onValueChange={([v]) => setAnnualAppreciation(v)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Expenses/yr</Label>
                <div className="text-sm font-bold">{annualExpenses}%</div>
                <Slider value={[annualExpenses]} min={1} max={15} step={0.5} onValueChange={([v]) => setAnnualExpenses(v)} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MetricCard label="Total ROI" value={`${results.totalROI.toFixed(1)}%`} icon={TrendingUp} positive={results.totalROI > 0} />
            <MetricCard label="Gross Yield" value={`${results.grossYield.toFixed(1)}%`} icon={Percent} positive />
            <MetricCard label="Cash on Cash" value={`${results.cashOnCash.toFixed(1)}%`} icon={DollarSign} positive={results.cashOnCash > 0} />
            <MetricCard label="Future Value" value={formatIDR(results.futureValue)} icon={Building2} positive />
          </div>

          {/* Chart */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Investment Projection</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickFormatter={(v) => formatIDR(v)} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip formatter={(v: number) => formatIDR(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="propertyValue" name="Property Value" fill="hsl(45, 93%, 47%)" fillOpacity={0.15} stroke="hsl(45, 93%, 47%)" strokeWidth={2} />
                    <Area type="monotone" dataKey="equity" name="Equity" fill="hsl(38, 92%, 50%)" fillOpacity={0.1} stroke="hsl(38, 92%, 50%)" strokeWidth={2} />
                    <Area type="monotone" dataKey="cumulativeIncome" name="Net Income" fill="hsl(142, 76%, 36%)" fillOpacity={0.1} stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryItem label="Down Payment" value={formatIDR(results.dp)} />
            <SummaryItem label="Monthly Mortgage" value={formatIDR(results.monthlyMortgage)} />
            <SummaryItem label="Total Appreciation" value={formatIDR(results.totalAppreciation)} positive />
            <SummaryItem label="Total Profit" value={formatIDR(results.totalProfit)} positive={results.totalProfit > 0} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   RENTAL YIELD ANALYZER
   ═══════════════════════════════════════════════════════════════════════════ */
const RentalYieldAnalyzer = () => {
  const [propertyValue, setPropertyValue] = useState(3000000000);
  const [monthlyRent, setMonthlyRent] = useState(25000000);
  const [occupancyRate, setOccupancyRate] = useState(85);
  const [managementFee, setManagementFee] = useState(10);
  const [maintenanceCost, setMaintenanceCost] = useState(3);
  const [propertyTax, setPropertyTax] = useState(0.5);

  const results = useMemo(() => {
    const annualGrossRent = monthlyRent * 12 * (occupancyRate / 100);
    const mgmtCost = annualGrossRent * (managementFee / 100);
    const maintCost = propertyValue * (maintenanceCost / 100);
    const taxCost = propertyValue * (propertyTax / 100);
    const totalExpenses = mgmtCost + maintCost + taxCost;
    const netRent = annualGrossRent - totalExpenses;
    const grossYield = (monthlyRent * 12 / propertyValue) * 100;
    const netYield = (netRent / propertyValue) * 100;
    const monthlyNet = netRent / 12;
    const breakEvenYears = propertyValue / netRent;

    const expenseBreakdown = [
      { name: 'Net Income', value: Math.max(0, netRent) },
      { name: 'Management', value: mgmtCost },
      { name: 'Maintenance', value: maintCost },
      { name: 'Tax', value: taxCost },
    ];

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
      const occupied = Math.random() * 100 < occupancyRate;
      return {
        month,
        gross: occupied ? monthlyRent : 0,
        net: occupied ? monthlyRent - (totalExpenses / 12) : -(totalExpenses / 12),
      };
    });

    return { annualGrossRent, netRent, grossYield, netYield, monthlyNet, breakEvenYears, totalExpenses, expenseBreakdown, monthlyData };
  }, [propertyValue, monthlyRent, occupancyRate, managementFee, maintenanceCost, propertyTax]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              Rental Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Property Value</Label>
              <div className="text-sm font-bold">{formatIDR(propertyValue)}</div>
              <Slider value={[propertyValue]} min={500000000} max={30000000000} step={500000000} onValueChange={([v]) => setPropertyValue(v)} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Monthly Rent</Label>
              <div className="text-sm font-bold">{formatIDR(monthlyRent)}</div>
              <Slider value={[monthlyRent]} min={2000000} max={150000000} step={1000000} onValueChange={([v]) => setMonthlyRent(v)} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Occupancy Rate: {occupancyRate}%</Label>
              <Slider value={[occupancyRate]} min={50} max={100} step={5} onValueChange={([v]) => setOccupancyRate(v)} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Management Fee: {managementFee}%</Label>
              <Slider value={[managementFee]} min={0} max={25} step={1} onValueChange={([v]) => setManagementFee(v)} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Maintenance: {maintenanceCost}%/yr</Label>
              <Slider value={[maintenanceCost]} min={0} max={10} step={0.5} onValueChange={([v]) => setMaintenanceCost(v)} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Property Tax: {propertyTax}%/yr</Label>
              <Slider value={[propertyTax]} min={0} max={3} step={0.1} onValueChange={([v]) => setPropertyTax(v)} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MetricCard label="Gross Yield" value={`${results.grossYield.toFixed(1)}%`} icon={TrendingUp} positive />
            <MetricCard label="Net Yield" value={`${results.netYield.toFixed(1)}%`} icon={Percent} positive={results.netYield > 0} />
            <MetricCard label="Monthly Net" value={formatIDR(results.monthlyNet)} icon={DollarSign} positive={results.monthlyNet > 0} />
            <MetricCard label="Break Even" value={`${results.breakEvenYears.toFixed(1)} yrs`} icon={Calendar} positive />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Monthly Cash Flow</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tickFormatter={(v) => formatIDR(v)} tick={{ fontSize: 8 }} stroke="hsl(var(--muted-foreground))" width={65} />
                      <Tooltip formatter={(v: number) => formatIDR(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="gross" name="Gross" fill="hsl(45, 93%, 47%)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Expense Breakdown</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={results.expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>
                        {results.expenseBreakdown.map((_, i) => (
                          <Cell key={i} fill={GOLD_COLORS[i % GOLD_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatIDR(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {results.expenseBreakdown.map((item, i) => (
                    <span key={item.name} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ background: GOLD_COLORS[i % GOLD_COLORS.length] }} />
                      {item.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   APPRECIATION FORECAST
   ═══════════════════════════════════════════════════════════════════════════ */
const AppreciationForecast = () => {
  const [currentValue, setCurrentValue] = useState(5000000000);
  const [location, setLocation] = useState('bali');
  const [propertyType, setPropertyType] = useState('villa');

  const locationRates: Record<string, { rate: number; label: string; risk: string }> = {
    bali: { rate: 10, label: 'Bali', risk: 'Medium' },
    jakarta: { rate: 6, label: 'Jakarta', risk: 'Low' },
    bandung: { rate: 8, label: 'Bandung', risk: 'Low-Medium' },
    surabaya: { rate: 7, label: 'Surabaya', risk: 'Low' },
    yogyakarta: { rate: 9, label: 'Yogyakarta', risk: 'Medium' },
    lombok: { rate: 12, label: 'Lombok', risk: 'High' },
  };

  const typeModifiers: Record<string, number> = {
    villa: 1.2,
    apartment: 0.9,
    house: 1.0,
    land: 1.5,
    commercial: 0.8,
  };

  const results = useMemo(() => {
    const baseRate = locationRates[location]?.rate || 7;
    const modifier = typeModifiers[propertyType] || 1;
    const adjustedRate = baseRate * modifier;
    const conservativeRate = adjustedRate * 0.6;
    const optimisticRate = adjustedRate * 1.4;

    const forecastData = Array.from({ length: 11 }, (_, year) => ({
      year: `${new Date().getFullYear() + year}`,
      conservative: Math.round(currentValue * Math.pow(1 + conservativeRate / 100, year)),
      expected: Math.round(currentValue * Math.pow(1 + adjustedRate / 100, year)),
      optimistic: Math.round(currentValue * Math.pow(1 + optimisticRate / 100, year)),
    }));

    const fiveYearValue = currentValue * Math.pow(1 + adjustedRate / 100, 5);
    const tenYearValue = currentValue * Math.pow(1 + adjustedRate / 100, 10);

    return { adjustedRate, conservativeRate, optimisticRate, forecastData, fiveYearValue, tenYearValue };
  }, [currentValue, location, propertyType]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              Forecast Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Current Value</Label>
              <div className="text-sm font-bold">{formatIDR(currentValue)}</div>
              <Slider value={[currentValue]} min={500000000} max={50000000000} step={500000000} onValueChange={([v]) => setCurrentValue(v)} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="mt-1 h-9 text-xs border-amber-500/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(locationRates).map(([key, { label }]) => (
                    <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="mt-1 h-9 text-xs border-amber-500/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa" className="text-xs">Villa</SelectItem>
                  <SelectItem value="apartment" className="text-xs">Apartment</SelectItem>
                  <SelectItem value="house" className="text-xs">House</SelectItem>
                  <SelectItem value="land" className="text-xs">Land</SelectItem>
                  <SelectItem value="commercial" className="text-xs">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <Info className="h-3 w-3" /> Market Insights
              </div>
              <div className="text-[10px] text-muted-foreground space-y-1">
                <p>📈 Expected rate: <span className="font-bold text-foreground">{results.adjustedRate.toFixed(1)}%/yr</span></p>
                <p>📊 Risk level: <span className="font-bold text-foreground">{locationRates[location]?.risk}</span></p>
                <p>🏠 Location base: {locationRates[location]?.rate}% × {typeModifiers[propertyType]}x modifier</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Annual Growth" value={`${results.adjustedRate.toFixed(1)}%`} icon={TrendingUp} positive />
            <MetricCard label="5-Year Value" value={formatIDR(results.fiveYearValue)} icon={Calendar} positive />
            <MetricCard label="10-Year Value" value={formatIDR(results.tenYearValue)} icon={Building2} positive />
          </div>

          <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                10-Year Appreciation Forecast
                <div className="flex gap-3 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400/50" /> Conservative</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: 'hsl(45, 93%, 47%)' }} /> Expected</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: 'hsl(38, 92%, 50%)' }} /> Optimistic</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickFormatter={(v) => formatIDR(v)} tick={{ fontSize: 8 }} stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip formatter={(v: number) => formatIDR(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="optimistic" name="Optimistic" fill="hsl(38, 92%, 50%)" fillOpacity={0.08} stroke="hsl(38, 92%, 50%)" strokeWidth={1.5} strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="expected" name="Expected" fill="hsl(45, 93%, 47%)" fillOpacity={0.15} stroke="hsl(45, 93%, 47%)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="conservative" name="Conservative" fill="hsl(45, 93%, 47%)" fillOpacity={0.05} stroke="hsl(45, 60%, 50%)" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/[0.04] border-amber-500/20 p-3">
            <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
              <Info className="h-3 w-3 flex-shrink-0 mt-0.5 text-amber-500" />
              Forecasts are estimates based on historical trends and market data. Actual results may vary. This is not financial advice — consult a licensed professional before investing.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   AREA GROWTH INDEX
   ═══════════════════════════════════════════════════════════════════════════ */
const AREA_DATA: Record<string, { name: string; growthHistory: number[]; avgPrice: number; rentalYield: number; infrastructure: number; demand: number; supply: number; category: string }> = {
  bali_seminyak: { name: 'Seminyak, Bali', growthHistory: [5.2, 7.1, 8.3, 10.5, 12.1, 9.8, 11.2, 13.4, 10.9, 14.2], avgPrice: 35000000, rentalYield: 8.5, infrastructure: 82, demand: 91, supply: 65, category: 'Premium Tourist' },
  bali_canggu: { name: 'Canggu, Bali', growthHistory: [8.1, 11.2, 14.5, 16.8, 18.2, 15.1, 19.3, 17.5, 20.1, 22.4], avgPrice: 28000000, rentalYield: 9.2, infrastructure: 68, demand: 95, supply: 58, category: 'High Growth' },
  bali_ubud: { name: 'Ubud, Bali', growthHistory: [4.1, 5.5, 6.8, 7.2, 8.9, 7.5, 9.1, 10.2, 8.8, 11.5], avgPrice: 22000000, rentalYield: 7.8, infrastructure: 60, demand: 78, supply: 70, category: 'Cultural Premium' },
  jakarta_south: { name: 'South Jakarta', growthHistory: [3.2, 4.1, 3.8, 5.2, 4.9, 5.5, 6.1, 5.8, 6.5, 7.2], avgPrice: 45000000, rentalYield: 5.2, infrastructure: 92, demand: 85, supply: 78, category: 'Metropolitan' },
  jakarta_cbd: { name: 'Jakarta CBD', growthHistory: [2.5, 3.1, 2.8, 3.5, 4.2, 3.9, 4.5, 5.1, 4.8, 5.5], avgPrice: 65000000, rentalYield: 4.8, infrastructure: 98, demand: 80, supply: 82, category: 'Commercial Hub' },
  bandung: { name: 'Bandung', growthHistory: [5.5, 6.2, 7.1, 8.5, 7.8, 9.2, 8.5, 10.1, 9.8, 11.2], avgPrice: 15000000, rentalYield: 6.5, infrastructure: 72, demand: 82, supply: 68, category: 'Emerging City' },
  lombok: { name: 'Lombok', growthHistory: [10.2, 12.5, 15.1, 13.8, 18.2, 16.5, 20.1, 18.9, 22.5, 25.1], avgPrice: 12000000, rentalYield: 10.5, infrastructure: 45, demand: 88, supply: 35, category: 'Frontier Market' },
  yogyakarta: { name: 'Yogyakarta', growthHistory: [6.1, 7.5, 8.8, 9.2, 10.5, 9.8, 11.5, 12.1, 11.8, 13.2], avgPrice: 12000000, rentalYield: 7.2, infrastructure: 65, demand: 80, supply: 62, category: 'Heritage City' },
  surabaya: { name: 'Surabaya', growthHistory: [4.2, 5.1, 5.8, 6.5, 7.2, 6.8, 7.5, 8.1, 7.8, 8.5], avgPrice: 25000000, rentalYield: 5.8, infrastructure: 85, demand: 78, supply: 75, category: 'Industrial Hub' },
};

const AreaGrowthIndex = () => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['bali_canggu', 'jakarta_south', 'lombok']);

  const toggleArea = (key: string) => {
    setSelectedAreas(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : prev.length < 4 ? [...prev, key] : prev
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);

  const comparisonData = years.map((year, i) => {
    const point: any = { year: year.toString() };
    selectedAreas.forEach(key => {
      point[AREA_DATA[key]?.name || key] = AREA_DATA[key]?.growthHistory[i] || 0;
    });
    return point;
  });

  const rankingData = Object.entries(AREA_DATA)
    .map(([key, data]) => ({
      key,
      ...data,
      latestGrowth: data.growthHistory[data.growthHistory.length - 1],
      avgGrowth: data.growthHistory.reduce((a, b) => a + b, 0) / data.growthHistory.length,
      compositeScore: Math.round(
        (data.growthHistory[data.growthHistory.length - 1] * 0.3 +
        data.rentalYield * 0.25 +
        data.demand * 0.1 +
        (100 - data.supply) * 0.1 +
        data.infrastructure * 0.15 +
        (data.growthHistory.reduce((a, b) => a + b, 0) / data.growthHistory.length) * 0.1)
      ),
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const lineColors = ['hsl(45, 93%, 47%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(262, 83%, 58%)'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Selector */}
        <Card className="lg:col-span-1 bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
                <Globe className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              Area Selection
            </CardTitle>
            <CardDescription className="text-[10px]">Select up to 4 areas to compare</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {Object.entries(AREA_DATA).map(([key, data]) => {
              const isSelected = selectedAreas.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleArea(key)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-border/30 hover:border-amber-500/20 bg-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{data.name}</p>
                      <p className="text-[9px] text-muted-foreground">{data.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600 dark:text-amber-400">
                        {data.growthHistory[data.growthHistory.length - 1]}%
                      </p>
                      <p className="text-[8px] text-muted-foreground">Latest YoY</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Charts & Rankings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top metrics from selected areas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {selectedAreas.slice(0, 4).map((key, i) => {
              const data = AREA_DATA[key];
              if (!data) return null;
              return (
                <MetricCard
                  key={key}
                  label={data.name}
                  value={`${data.growthHistory[data.growthHistory.length - 1]}%`}
                  icon={MapPin}
                  positive
                />
              );
            })}
          </div>

          {/* Growth Comparison Chart */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                10-Year Area Growth Comparison
                <div className="flex gap-3 text-[9px] text-muted-foreground flex-wrap">
                  {selectedAreas.map((key, i) => (
                    <span key={key} className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ background: lineColors[i] }} />
                      {AREA_DATA[key]?.name}
                    </span>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis unit="%" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      formatter={(v: number) => `${v}%`}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                    />
                    {selectedAreas.map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={AREA_DATA[key]?.name}
                        stroke={lineColors[i]}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: lineColors[i] }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Area Ranking Table */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Composite Area Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {rankingData.map((area, i) => (
                  <div
                    key={area.key}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      selectedAreas.includes(area.key)
                        ? 'border-amber-500/30 bg-amber-500/[0.04]'
                        : 'border-border/20 hover:border-amber-500/15'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      i === 0 ? 'bg-gradient-to-br from-amber-500 to-yellow-400 text-background' :
                      i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-background' :
                      i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-background' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground truncate">{area.name}</p>
                        <Badge className="text-[8px] px-1.5 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">{area.category}</Badge>
                      </div>
                      <div className="flex gap-3 mt-1 text-[9px] text-muted-foreground">
                        <span>Growth: <span className="font-bold text-foreground">{area.latestGrowth}%</span></span>
                        <span>Yield: <span className="font-bold text-foreground">{area.rentalYield}%</span></span>
                        <span>Infra: <span className="font-bold text-foreground">{area.infrastructure}</span></span>
                        <span className="hidden sm:inline">Demand: <span className="font-bold text-foreground">{area.demand}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-amber-600 dark:text-amber-400">{area.compositeScore}</p>
                      <p className="text-[8px] text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/[0.04] border-amber-500/20 p-3">
            <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
              <Info className="h-3 w-3 flex-shrink-0 mt-0.5 text-amber-500" />
              Area growth data is based on historical market trends and publicly available indices. Composite scores weight recent growth (30%), rental yield (25%), infrastructure (15%), demand (10%), supply constraints (10%), and historical average (10%). Not financial advice.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, positive }: { label: string; value: string; icon: React.ElementType; positive: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="bg-card/60 backdrop-blur-xl border-border/30 p-3 hover:border-amber-500/20 transition-all">
      <div className="flex items-start justify-between mb-1">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        {positive ? <ArrowUpRight className="h-3.5 w-3.5 text-chart-2" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </Card>
  </motion.div>
);

const SummaryItem = ({ label, value, positive }: { label: string; value: string; positive?: boolean }) => (
  <div className="p-3 rounded-xl border border-border/20 bg-muted/30">
    <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
    <p className={`text-sm font-bold ${positive === true ? 'text-chart-2' : positive === false ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function InvestmentAnalysisTools() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
            <Sparkles className="h-3 w-3 mr-1" /> Professional Analysis
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Investment Analysis Tools</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Calculate ROI, analyze rental yields, and forecast property appreciation</p>
        </div>
      </motion.div>

      <Tabs defaultValue="roi" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-11 bg-muted/50 backdrop-blur-sm border border-border/30">
          <TabsTrigger value="roi" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ROI Calculator</span>
            <span className="sm:hidden">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="rental" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Rental Yield</span>
            <span className="sm:hidden">Yield</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Appreciation</span>
            <span className="sm:hidden">Forecast</span>
          </TabsTrigger>
          <TabsTrigger value="area" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Area Growth</span>
            <span className="sm:hidden">Areas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roi"><ROICalculator /></TabsContent>
        <TabsContent value="rental"><RentalYieldAnalyzer /></TabsContent>
        <TabsContent value="forecast"><AppreciationForecast /></TabsContent>
        <TabsContent value="area"><AreaGrowthIndex /></TabsContent>
      </Tabs>
    </div>
  );
}

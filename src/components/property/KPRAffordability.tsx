import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface KPRAffordabilityProps {
  monthlyPayment: number;
  downPayment: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const getDTIStatus = (dti: number) => {
  if (dti <= 30) return { label: 'Aman', color: 'text-chart-1', bg: 'bg-chart-1/10 border-chart-1/20', icon: CheckCircle2, desc: 'Rasio hutang Anda sehat. Bank kemungkinan besar akan menyetujui KPR.' };
  if (dti <= 40) return { label: 'Hati-hati', color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/20', icon: AlertTriangle, desc: 'Rasio hutang cukup tinggi. Beberapa bank mungkin memerlukan persyaratan tambahan.' };
  return { label: 'Berisiko', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', icon: ShieldAlert, desc: 'Rasio hutang terlalu tinggi. Pertimbangkan untuk menambah DP atau memperpanjang tenor.' };
};

const KPRAffordability: React.FC<KPRAffordabilityProps> = ({
  monthlyPayment,
  downPayment,
}) => {
  const [incomeText, setIncomeText] = useState('');
  const [otherDebtsText, setOtherDebtsText] = useState('');

  const monthlyIncome = useMemo(() => {
    const num = Number(incomeText.replace(/\D/g, ''));
    return isNaN(num) ? 0 : num;
  }, [incomeText]);

  const otherDebts = useMemo(() => {
    const num = Number(otherDebtsText.replace(/\D/g, ''));
    return isNaN(num) ? 0 : num;
  }, [otherDebtsText]);

  const handleIncomeChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits) {
      setIncomeText(new Intl.NumberFormat('id-ID').format(Number(digits)));
    } else {
      setIncomeText('');
    }
  };

  const handleDebtsChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits) {
      setOtherDebtsText(new Intl.NumberFormat('id-ID').format(Number(digits)));
    } else {
      setOtherDebtsText('');
    }
  };

  const dti = monthlyIncome > 0
    ? ((monthlyPayment + otherDebts) / monthlyIncome) * 100
    : 0;

  const status = getDTIStatus(dti);
  const StatusIcon = status.icon;

  const maxAffordablePayment = monthlyIncome > 0 ? monthlyIncome * 0.3 - otherDebts : 0;
  const savingsNeeded = monthlyIncome > 0
    ? Math.ceil(downPayment / (monthlyIncome - monthlyPayment - otherDebts > 0 ? monthlyIncome - monthlyPayment - otherDebts : monthlyIncome * 0.3))
    : 0;

  if (!monthlyIncome) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-xs sm:text-sm font-medium">Cek Kemampuan Bayar</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-48">Masukkan penghasilan bulanan untuk melihat rasio hutang terhadap pendapatan (DTI)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
            <Input
              placeholder="Penghasilan bulanan"
              value={incomeText}
              onChange={(e) => handleIncomeChange(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
        <Label className="text-xs sm:text-sm font-medium">Cek Kemampuan Bayar</Label>
      </div>

      {/* Income & Debts inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Rp</span>
          <Input
            placeholder="Penghasilan"
            value={incomeText}
            onChange={(e) => handleIncomeChange(e.target.value)}
            className="pl-7 text-xs h-8"
          />
          <span className="text-[9px] text-muted-foreground mt-0.5 block">per bulan</span>
        </div>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Rp</span>
          <Input
            placeholder="Cicilan lain"
            value={otherDebtsText}
            onChange={(e) => handleDebtsChange(e.target.value)}
            className="pl-7 text-xs h-8"
          />
          <span className="text-[9px] text-muted-foreground mt-0.5 block">hutang lain</span>
        </div>
      </div>

      {/* DTI Gauge */}
      <div className={cn('p-3 rounded-xl border', status.bg)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <StatusIcon className={cn('h-4 w-4', status.color)} />
            <span className={cn('text-xs font-semibold', status.color)}>
              {status.label}
            </span>
          </div>
          <Badge variant="outline" className={cn('text-xs', status.color)}>
            DTI {dti.toFixed(1)}%
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              dti <= 30 ? 'bg-chart-1' : dti <= 40 ? 'bg-chart-2' : 'bg-destructive'
            )}
            style={{ width: `${Math.min(dti, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mb-2">
          <span>0%</span>
          <span className="text-chart-1">30% aman</span>
          <span className="text-chart-2">40%</span>
          <span>100%</span>
        </div>

        <p className="text-[10px] text-muted-foreground">{status.desc}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-muted/30 rounded-lg">
          <div className="text-[10px] text-muted-foreground">Cicilan KPR</div>
          <div className="text-xs font-semibold">{formatCurrency(monthlyPayment)}</div>
        </div>
        <div className="p-2 bg-muted/30 rounded-lg">
          <div className="text-[10px] text-muted-foreground">Maks. Cicilan Aman</div>
          <div className={cn('text-xs font-semibold', maxAffordablePayment < monthlyPayment ? 'text-destructive' : 'text-chart-1')}>
            {formatCurrency(Math.max(0, maxAffordablePayment))}
          </div>
        </div>
      </div>

      {savingsNeeded > 0 && savingsNeeded < 600 && (
        <div className="p-2 bg-muted/20 rounded-lg">
          <div className="text-[10px] text-muted-foreground">Estimasi menabung DP</div>
          <div className="text-xs font-semibold">~{savingsNeeded} bulan ({Math.ceil(savingsNeeded / 12)} tahun)</div>
        </div>
      )}
    </div>
  );
};

export default KPRAffordability;

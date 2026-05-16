import React, { useState, useMemo } from 'react';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, ShieldCheck, BadgePercent, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import MortgageCalculator from '@/components/mortgage/MortgageCalculator';
import KPRAmortizationChart from '@/components/property/KPRAmortizationChart';
import KPRAffordability from '@/components/property/KPRAffordability';
import { calculateMortgage } from '@/hooks/useMortgageCalculator';

const DEFAULT_PRICE = 1_000_000_000;
const DEFAULT_DP_PCT = 20;
const DEFAULT_TERM = 15;
const DEFAULT_RATE = 7.0;

const KprCalculatorPage: React.FC = () => {
  // Standalone state for the supplementary widgets (amortization + affordability)
  // These mirror common defaults; the MortgageCalculator manages its own internal state
  const [price] = useState(DEFAULT_PRICE);
  const [dpPct] = useState(DEFAULT_DP_PCT);
  const [term] = useState(DEFAULT_TERM);
  const [rate] = useState(DEFAULT_RATE);

  const dp = (price * dpPct) / 100;
  const loanAmount = price - dp;

  const calc = useMemo(
    () => calculateMortgage({ propertyPrice: price, downPayment: dp, loanTermYears: term, interestRate: rate }),
    [price, dp, term, rate]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[hsl(var(--gold-primary))]/20 bg-gradient-to-b from-[hsl(var(--gold-primary))]/5 to-background">
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-4"
          >
            <Badge variant="outline" className="border-[hsl(var(--gold-primary))]/40 text-[hsl(var(--gold-primary))]">
              <Calculator className="h-3 w-3 mr-1" />
              Smart Property Investment Platform
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Simulasi{' '}
              <span className="text-[hsl(var(--gold-primary))]">KPR</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Hitung cicilan bulanan, bandingkan suku bunga bank Indonesia, dan analisis kemampuan bayar Anda dalam satu halaman.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {[
                { icon: BadgePercent, label: 'Perbandingan Bank' },
                { icon: TrendingUp, label: 'Jadwal Amortisasi' },
                { icon: ShieldCheck, label: 'Analisis DTI' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-muted/40 rounded-full px-3 py-1.5"
                >
                  <Icon className="h-3.5 w-3.5 text-[hsl(var(--gold-primary))]" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Link>
        </Button>

        {/* Mortgage Calculator (full mode) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <MortgageCalculator propertyPrice={DEFAULT_PRICE} compact={false} />
        </motion.div>

        <Separator className="my-4" />

        {/* Supplementary sections: Amortization + Affordability */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Amortization Chart */}
          <Card className="border-[hsl(var(--gold-primary))]/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--gold-primary))]" />
                Jadwal Amortisasi (Default)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Berdasarkan harga {getCurrencyFormatterShort()(1_000_000_000)}, DP 20%, tenor 15 tahun, bunga 7%
              </p>
            </CardHeader>
            <CardContent>
              <KPRAmortizationChart
                loanAmount={loanAmount}
                interestRate={rate}
                loanTermYears={term}
                monthlyPayment={calc.monthlyPayment}
              />
            </CardContent>
          </Card>

          {/* Affordability */}
          <Card className="border-[hsl(var(--gold-primary))]/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--gold-primary))]" />
                Cek Kemampuan Bayar (Default)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Masukkan penghasilan untuk melihat rasio DTI Anda
              </p>
            </CardHeader>
            <CardContent>
              <KPRAffordability
                monthlyPayment={calc.monthlyPayment}
                downPayment={dp}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <Card className="bg-[hsl(var(--gold-primary))]/5 border-[hsl(var(--gold-primary))]/20">
            <CardContent className="py-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">💡 Tips KPR untuk Pembeli Pertama</h2>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground list-disc list-inside">
                <li>Rasio DTI ideal di bawah 30% dari penghasilan bulanan</li>
                <li>DP minimal 10-20% — semakin besar DP, semakin kecil cicilan</li>
                <li>Bandingkan suku bunga fixed vs floating sebelum memilih bank</li>
                <li>Perhatikan biaya-biaya tersembunyi: provisi, administrasi, asuransi</li>
                <li>Pilih tenor yang seimbang antara cicilan terjangkau dan total bunga</li>
                <li>Simpan beberapa skenario untuk perbandingan sebelum mengajukan</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default KprCalculatorPage;

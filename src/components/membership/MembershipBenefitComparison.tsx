import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Crown,
  Star,
  Building2,
  Gem,
  Zap,
  ArrowRight,
  CreditCard,
  Wallet,
  QrCode,
  Landmark,
  Smartphone,
} from 'lucide-react';
import { MEMBERSHIP_LEVELS, MembershipLevel, getMembershipConfig } from '@/types/membership';
import { cn } from '@/lib/utils';

const TIER_ORDER: MembershipLevel[] = ['free', 'pro_agent', 'developer', 'vip_investor'];

const TIER_ICONS: Record<MembershipLevel, React.ReactNode> = {
  free: <Crown className="h-4 w-4" />,
  pro_agent: <Star className="h-4 w-4" />,
  developer: <Building2 className="h-4 w-4" />,
  vip_investor: <Gem className="h-4 w-4" />,
};

type FeatureValue = boolean | string;

interface ComparisonFeature {
  category: string;
  features: {
    name: string;
    tooltip?: string;
    free: FeatureValue;
    pro_agent: FeatureValue;
    developer: FeatureValue;
    vip_investor: FeatureValue;
  }[];
}

const COMPARISON_DATA: ComparisonFeature[] = [
  {
    category: 'Listing & Exposure',
    features: [
      { name: 'Listing Exposure Multiplier', free: '1x', pro_agent: '2x', developer: '5x', vip_investor: '10x' },
      { name: 'Max Property Listings', free: '5', pro_agent: '15', developer: '50', vip_investor: 'Unlimited' },
      { name: 'Max Images per Listing', free: '5', pro_agent: '10', developer: '30', vip_investor: 'Unlimited' },
      { name: 'Priority Search Placement', free: false, pro_agent: true, developer: true, vip_investor: true },
      { name: 'Homepage Spotlight', free: false, pro_agent: false, developer: false, vip_investor: true },
    ],
  },
  {
    category: 'Badges & Branding',
    features: [
      { name: 'Verified Agent Badge', free: false, pro_agent: true, developer: true, vip_investor: true },
      { name: 'Developer Badge', free: false, pro_agent: false, developer: true, vip_investor: true },
      { name: '3D Featured Badge', free: false, pro_agent: false, developer: false, vip_investor: true },
      { name: 'Custom Brand Profile', free: false, pro_agent: true, developer: true, vip_investor: true },
    ],
  },
  {
    category: 'Tools & Analytics',
    features: [
      { name: 'Basic Search & Browse', free: true, pro_agent: true, developer: true, vip_investor: true },
      { name: 'Save Favorites', free: true, pro_agent: true, developer: true, vip_investor: true },
      { name: 'SEO Tools', free: false, pro_agent: true, developer: true, vip_investor: true },
      { name: 'AI Analytics & Insights', free: false, pro_agent: false, developer: true, vip_investor: true },
      { name: 'AI-Generated Descriptions', free: false, pro_agent: false, developer: false, vip_investor: true },
      { name: 'Market Intelligence Reports', free: false, pro_agent: false, developer: true, vip_investor: true },
    ],
  },
  {
    category: 'Media & Presentation',
    features: [
      { name: 'Photo Gallery', free: true, pro_agent: true, developer: true, vip_investor: true },
      { name: 'Virtual Tour / 360°', free: false, pro_agent: false, developer: true, vip_investor: true },
      { name: '3D Model Integration', free: false, pro_agent: false, developer: true, vip_investor: true },
      { name: 'Video Tour Upload', free: false, pro_agent: true, developer: true, vip_investor: true },
    ],
  },
  {
    category: 'Support & Services',
    features: [
      { name: 'Email Support', free: true, pro_agent: true, developer: true, vip_investor: true },
      { name: 'Priority Support', free: false, pro_agent: true, developer: true, vip_investor: true },
      { name: 'Personal Concierge', free: false, pro_agent: false, developer: false, vip_investor: true },
      { name: 'Investment Advisory', free: false, pro_agent: false, developer: false, vip_investor: true },
      { name: 'First Access to New Listings', free: false, pro_agent: false, developer: false, vip_investor: true },
    ],
  },
];

const LOCAL_PAYMENT_METHODS = [
  { name: 'BCA', icon: <Landmark className="h-3.5 w-3.5" />, type: 'Bank Transfer' },
  { name: 'Mandiri', icon: <Landmark className="h-3.5 w-3.5" />, type: 'Bank Transfer' },
  { name: 'BNI', icon: <Landmark className="h-3.5 w-3.5" />, type: 'Bank Transfer' },
  { name: 'BRI', icon: <Landmark className="h-3.5 w-3.5" />, type: 'Bank Transfer' },
  { name: 'GoPay', icon: <Wallet className="h-3.5 w-3.5" />, type: 'E-Wallet' },
  { name: 'OVO', icon: <Smartphone className="h-3.5 w-3.5" />, type: 'E-Wallet' },
  { name: 'DANA', icon: <Wallet className="h-3.5 w-3.5" />, type: 'E-Wallet' },
  { name: 'ShopeePay', icon: <Wallet className="h-3.5 w-3.5" />, type: 'E-Wallet' },
  { name: 'QRIS', icon: <QrCode className="h-3.5 w-3.5" />, type: 'QR Payment' },
  { name: 'Kartu Kredit', icon: <CreditCard className="h-3.5 w-3.5" />, type: 'Credit Card' },
];

const formatIDR = (amount: number) => {
  if (amount === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface MembershipBenefitComparisonProps {
  currentLevel?: MembershipLevel;
  billingCycle?: 'monthly' | 'yearly';
  onUpgrade?: (tier: MembershipLevel) => void;
  compact?: boolean;
}

const CellValue: React.FC<{ value: FeatureValue }> = ({ value }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-3.5 w-3.5 text-primary mx-auto" />
    ) : (
      <X className="h-3 w-3 text-muted-foreground/30 mx-auto" />
    );
  }
  return <span className="font-semibold text-foreground">{value}</span>;
};

const MembershipBenefitComparison: React.FC<MembershipBenefitComparisonProps> = ({
  currentLevel = 'free',
  billingCycle = 'monthly',
  onUpgrade,
  compact = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Full Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Perbandingan Fitur Lengkap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[520px]">
                {/* Sticky Header */}
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-2.5 font-medium text-muted-foreground w-[35%] sticky left-0 bg-muted/40 z-10">
                      Fitur
                    </th>
                    {TIER_ORDER.map((tier) => {
                      const config = MEMBERSHIP_LEVELS[tier];
                      const isCurrent = tier === currentLevel;
                      const price = billingCycle === 'monthly' ? config.monthlyPrice : config.yearlyPrice;
                      return (
                        <th
                          key={tier}
                          className={cn(
                            'p-2 text-center font-semibold min-w-[90px]',
                            isCurrent && 'bg-primary/5'
                          )}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg">{config.icon}</span>
                            <span className={cn('text-[11px] font-bold', config.color)}>
                              {config.label}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-normal">
                              {price === 0
                                ? 'Gratis'
                                : `${formatIDR(price)}/${billingCycle === 'monthly' ? 'bln' : 'thn'}`}
                            </span>
                            {isCurrent && (
                              <Badge
                                variant="default"
                                className="text-[8px] px-1.5 py-0 h-3.5 leading-none"
                              >
                                Paket Anda
                              </Badge>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {COMPARISON_DATA.map((section, sIdx) => (
                    <React.Fragment key={section.category}>
                      {/* Category Header */}
                      <tr className="bg-muted/20">
                        <td
                          colSpan={5}
                          className="p-2 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground"
                        >
                          {section.category}
                        </td>
                      </tr>
                      {/* Features */}
                      {section.features.map((feature, fIdx) => {
                        if (compact && fIdx > 2) return null;
                        return (
                          <tr
                            key={feature.name}
                            className={cn(
                              'border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors',
                              fIdx % 2 === 0 && 'bg-background'
                            )}
                          >
                            <td className="p-2 font-medium sticky left-0 bg-inherit z-10">
                              {feature.name}
                            </td>
                            {TIER_ORDER.map((tier) => (
                              <td
                                key={tier}
                                className={cn(
                                  'p-2 text-center',
                                  tier === currentLevel && 'bg-primary/5'
                                )}
                              >
                                <CellValue value={feature[tier]} />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>

                {/* CTA Row */}
                {onUpgrade && (
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td className="p-2 font-medium text-muted-foreground sticky left-0 bg-card z-10" />
                      {TIER_ORDER.map((tier) => {
                        const isCurrent = tier === currentLevel;
                        const isLower =
                          TIER_ORDER.indexOf(tier) <= TIER_ORDER.indexOf(currentLevel);
                        return (
                          <td key={tier} className="p-2 text-center">
                            {isCurrent ? (
                              <Badge variant="outline" className="text-[9px] px-2 py-0.5">
                                Aktif
                              </Badge>
                            ) : isLower ? (
                              <span className="text-[9px] text-muted-foreground">—</span>
                            ) : (
                              <Button
                                size="sm"
                                className="h-6 text-[9px] px-2"
                                onClick={() => onUpgrade(tier)}
                              >
                                <Zap className="h-2.5 w-2.5 mr-0.5" />
                                Upgrade
                              </Button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Local Payment Methods */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card/80">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Metode Pembayaran Lokal
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Bayar dengan metode pembayaran Indonesia yang Anda kenal
            </p>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="grid grid-cols-5 gap-1.5">
              {LOCAL_PAYMENT_METHODS.map((method) => (
                <div
                  key={method.name}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="text-muted-foreground">{method.icon}</div>
                  <span className="text-[9px] font-medium text-center leading-tight">
                    {method.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <QrCode className="h-3 w-3" />
              <span>Semua pembayaran diproses melalui payment gateway lokal Indonesia (Midtrans)</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MembershipBenefitComparison;

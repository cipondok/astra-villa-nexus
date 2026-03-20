import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Check, TrendingUp, Building2, Crown, Gem, Zap,
  Store, Rocket, Target, Shield, ArrowRight,
  Percent, FileCheck, Landmark, Scale
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
};

interface Plan {
  name: string;
  price: string;
  period?: string;
  icon: React.ElementType;
  features: string[];
  popular?: boolean;
  enterprise?: boolean;
  accentClass: string;
  badgeBg: string;
}

const investorPlans: Plan[] = [
  {
    name: 'Free Explorer', price: 'Rp 0', icon: Zap,
    accentClass: 'border-t-muted-foreground/40', badgeBg: 'bg-muted text-muted-foreground',
    features: ['Browse listings', 'Limited AI deal score view', 'Save 5 properties', 'Basic alerts'],
  },
  {
    name: 'Pro Investor', price: 'Rp 299.000', period: '/month', icon: TrendingUp, popular: true,
    accentClass: 'border-t-primary', badgeBg: 'bg-primary/10 text-primary',
    features: ['Full AI opportunity score', 'District heatmap intelligence', 'Unlimited saved deals', 'ROI projection calculator', 'Deal alerts priority'],
  },
  {
    name: 'Elite Investor', price: 'Rp 1.250.000', period: '/month', icon: Crown,
    accentClass: 'border-t-chart-4', badgeBg: 'bg-chart-4/10 text-chart-4',
    features: ['Predictive market insights', 'Early access off-market deals', 'Portfolio analytics dashboard', 'Negotiation intelligence signals', 'Cross-city investment strategy'],
  },
  {
    name: 'Institutional Terminal', price: 'Rp 15–50 Jt', period: '/month', icon: Building2, enterprise: true,
    accentClass: 'border-t-chart-5', badgeBg: 'bg-chart-5/10 text-chart-5',
    features: ['Multi-portfolio command center', 'Capital allocation simulator', 'API data export', 'Dedicated deal concierge', 'Private market intelligence reports'],
  },
];

const vendorPlans: Plan[] = [
  {
    name: 'Starter Vendor', price: 'Rp 0', icon: Store,
    accentClass: 'border-t-muted-foreground/40', badgeBg: 'bg-muted text-muted-foreground',
    features: ['Basic listing profile', 'Standard lead routing', 'Max 10 leads/month visibility'],
  },
  {
    name: 'Growth Vendor', price: 'Rp 490.000', period: '/month', icon: Rocket, popular: true,
    accentClass: 'border-t-primary', badgeBg: 'bg-primary/10 text-primary',
    features: ['Featured search ranking', 'Lead analytics dashboard', 'Priority routing boost', 'Response score visibility'],
  },
  {
    name: 'Pro Vendor', price: 'Rp 1.500.000', period: '/month', icon: Target,
    accentClass: 'border-t-chart-4', badgeBg: 'bg-chart-4/10 text-chart-4',
    features: ['District spotlight exposure', 'Higher AI match weighting', 'Performance marketing insights', '30–60% more lead allocation'],
  },
  {
    name: 'Dominance Slot', price: 'Rp 3,5–7,5 Jt', period: '/month', icon: Gem, enterprise: true,
    accentClass: 'border-t-chart-5', badgeBg: 'bg-chart-5/10 text-chart-5',
    features: ['Category exclusivity in district', 'Guaranteed lead flow package', 'Homepage feature rotation', 'Sponsored placement priority'],
  },
];

const transactionFees = [
  { icon: Percent, label: 'Property Deal Success Fee', value: '0.8% – 1.5%', detail: 'Of closed transaction value' },
  { icon: Shield, label: 'Escrow Facilitation', value: 'Rp 3–10 Jt', detail: 'Per deal, based on complexity' },
  { icon: Landmark, label: 'Mortgage Referral', value: '0.3%', detail: 'Commission from bank partner' },
  { icon: Scale, label: 'Legal / Inspection Margin', value: '10% – 18%', detail: 'Service marketplace take-rate' },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <motion.div variants={fadeSlide} className="h-full">
      <Card className={`h-full flex flex-col border-t-4 ${plan.accentClass} relative ${plan.popular ? 'shadow-md ring-1 ring-primary/20' : ''}`}>
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground text-[9px] tracking-wider">MOST POPULAR</Badge>
          </div>
        )}
        {plan.enterprise && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="outline" className="bg-card text-[9px] tracking-wider border-chart-5/30 text-chart-5">ENTERPRISE</Badge>
          </div>
        )}
        <CardHeader className="pb-2 pt-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center">
              <plan.icon className="h-4 w-4 text-foreground" />
            </div>
            <CardTitle className="text-sm font-semibold">{plan.name}</CardTitle>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">{plan.price}</span>
            {plan.period && <span className="text-xs text-muted-foreground">{plan.period}</span>}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between pt-0">
          <ul className="space-y-2.5 mb-5">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Button
            variant={plan.popular ? 'default' : 'outline'}
            size="sm"
            className="w-full text-xs"
          >
            {plan.enterprise ? 'Contact Sales' : plan.price === 'Rp 0' ? 'Get Started Free' : 'Subscribe'}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MonetizationPricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-10 text-center space-y-3">
          <motion.div variants={fadeSlide}>
            <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-2">Pricing</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Monetization</h1>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-xl mx-auto">
            Transparent pricing for investors, vendors, and transaction participants across the Astra Villa ecosystem.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-8 space-y-10">
        <Tabs defaultValue="investor" className="w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide} className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="investor" className="text-xs">Investor Plans</TabsTrigger>
              <TabsTrigger value="vendor" className="text-xs">Vendor Plans</TabsTrigger>
              <TabsTrigger value="transaction" className="text-xs">Transaction Fees</TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Investor Plans */}
          <TabsContent value="investor">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {investorPlans.map((p) => <PlanCard key={p.name} plan={p} />)}
            </motion.div>
          </TabsContent>

          {/* Vendor Plans */}
          <TabsContent value="vendor">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {vendorPlans.map((p) => <PlanCard key={p.name} plan={p} />)}
            </motion.div>
          </TabsContent>

          {/* Transaction Fees */}
          <TabsContent value="transaction">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {transactionFees.map((t) => (
                <motion.div key={t.label} variants={fadeSlide}>
                  <Card className="border-border/50 h-full">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <t.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{t.label}</p>
                        <p className="text-lg font-bold font-mono text-foreground">{t.value}</p>
                        <p className="text-[11px] text-muted-foreground">{t.detail}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Footer note */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide} className="text-center">
          <p className="text-xs text-muted-foreground">All prices in IDR. Subject to 11% PPN (VAT). Enterprise plans billed annually with custom terms.</p>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles, Copy, Share2, Users, Lock, Zap, Star, TrendingUp,
  MessageSquare, Shield, Crown, ChevronRight, CheckCircle2,
  ArrowRight, Bell, Gift, Eye, BarChart3, Globe, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ================================================================
   INVESTOR REFERRAL ENGINE — Viral Growth Interface
   ================================================================ */

const REFERRAL_CODE = 'ASTRA-INV-7K2X';
const REFERRAL_LINK = 'https://astra-villa-realty.lovable.app/ref/ASTRA-INV-7K2X';

const TIERS = [
  { id: 'explorer', label: 'Explorer', min: 0, icon: Globe, color: 'text-muted-foreground', bgColor: 'bg-secondary' },
  { id: 'insider', label: 'Insider', min: 3, icon: Eye, color: 'text-primary', bgColor: 'bg-primary/15' },
  { id: 'elite', label: 'Elite Circle', min: 10, icon: Crown, color: 'text-primary', bgColor: 'bg-primary/20' },
];

const BENEFITS = [
  { icon: Zap, title: 'Early Access to New Listings', desc: '48-hour head start before public release' },
  { icon: BarChart3, title: 'Exclusive AI Investor Reports', desc: 'Deep-dive analytics on high-opportunity assets' },
  { icon: MessageSquare, title: 'Priority Deal Room Entry', desc: 'Skip the queue on premium negotiations' },
  { icon: Lock, title: 'Private Market Insights', desc: 'Off-market signals and pre-launch intelligence' },
];

const ACTIVITY_FEED = [
  { text: 'New investor joined from your invite', time: '2 min ago', type: 'join' as const },
  { text: 'Elite listing unlocked — Canggu Villa', time: '1 hour ago', type: 'unlock' as const },
  { text: 'Referral reward credited: Priority access', time: '3 hours ago', type: 'reward' as const },
  { text: 'Your referral viewed 4 properties', time: '5 hours ago', type: 'activity' as const },
];

const TESTIMONIALS = [
  { quote: 'Referred 5 friends and gained early deal access. Closed my best investment through an exclusive listing.', author: 'D. Hartono', role: 'Growth Investor, Jakarta' },
  { quote: 'The Elite Circle insights are worth it alone. Feels like having insider knowledge on the market.', author: 'S. Tanaka', role: 'Portfolio Manager, Singapore' },
];

export default function InvestorReferralEngine() {
  const [copied, setCopied] = useState(false);
  const currentReferrals = 4;
  const currentTierIdx = TIERS.findIndex((t, i) => {
    const next = TIERS[i + 1];
    return !next || currentReferrals < next.min;
  });
  const currentTier = TIERS[currentTierIdx];
  const nextTier = TIERS[currentTierIdx + 1];
  const progressPct = nextTier
    ? ((currentReferrals - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Join ASTRA AI — Indonesia's smartest property investment platform. Use my invite: ${REFERRAL_LINK}`)}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(REFERRAL_LINK)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] pointer-events-none" />
        <div className="absolute top-0 right-[15%] w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-5 px-4 py-1.5 text-xs border-primary/20 text-primary bg-primary/5">
              <Gift className="w-3 h-3 mr-1.5" />Exclusive Referral Program
            </Badge>
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              Unlock Private Investment Signals
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Invite fellow investors and access higher-intelligence deal flow.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-10">
        {/* ========== REFERRAL PROGRESS ========== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-1">Your Referral Progress</h2>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">{currentReferrals}</span> investors invited
                {nextTier && <span> · <span className="text-foreground font-medium">{nextTier.min - currentReferrals}</span> more to {nextTier.label}</span>}
              </p>
            </div>
            <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold', currentTier.bgColor, currentTier.color)}>
              <currentTier.icon className="w-3.5 h-3.5" />
              {currentTier.label}
            </div>
          </div>

          {/* Tier progress */}
          <div className="relative mb-4">
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPct, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Tier labels */}
          <div className="flex justify-between">
            {TIERS.map((tier, i) => {
              const reached = currentReferrals >= tier.min;
              return (
                <div key={tier.id} className={cn('flex flex-col items-center', i === TIERS.length - 1 && 'items-end', i === 0 && 'items-start')}>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors',
                    reached ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                  )}>
                    <tier.icon className="w-4 h-4" />
                  </div>
                  <span className={cn('text-[11px] font-medium', reached ? 'text-foreground' : 'text-muted-foreground')}>{tier.label}</span>
                  <span className="text-[9px] text-muted-foreground">{tier.min} invites</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ========== BENEFITS + INVITE ========== */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />Unlock These Benefits
            </h3>
            <div className="space-y-4">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <b.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{b.title}</div>
                    <div className="text-xs text-muted-foreground">{b.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Invite Module */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />Invite Investors
            </h3>

            {/* Referral link */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1.5 block">Your unique referral link</label>
              <div className="flex gap-2">
                <Input value={REFERRAL_LINK} readOnly className="text-xs font-mono" />
                <Button variant="outline" size="icon" onClick={copyLink} className="shrink-0">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Referral code */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground mb-1.5 block">Referral code</label>
              <div className="bg-accent/60 border border-border rounded-lg px-4 py-3 text-center">
                <span className="text-lg font-bold tracking-widest text-foreground font-mono">{REFERRAL_CODE}</span>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Share buttons */}
            <div className="space-y-2.5">
              <Button className="w-full gap-2 justify-center" onClick={shareWhatsApp}>
                <MessageSquare className="w-4 h-4" />Share via WhatsApp
              </Button>
              <Button variant="outline" className="w-full gap-2 justify-center" onClick={shareLinkedIn}>
                <Globe className="w-4 h-4" />Share via LinkedIn
              </Button>
            </div>
          </motion.div>
        </div>

        {/* ========== LIVE ACTIVITY FEED ========== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />Live Activity
            <Badge variant="outline" className="ml-auto text-[9px] gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Live
            </Badge>
          </h3>
          <div className="space-y-2.5">
            {ACTIVITY_FEED.map((item, i) => {
              const icons = {
                join: <Users className="w-3.5 h-3.5 text-primary" />,
                unlock: <Lock className="w-3.5 h-3.5 text-primary" />,
                reward: <Gift className="w-3.5 h-3.5 text-primary" />,
                activity: <Eye className="w-3.5 h-3.5 text-primary" />,
              };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/30"
                >
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    {icons[item.type]}
                  </div>
                  <span className="text-sm text-foreground flex-1">{item.text}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ========== SOCIAL PROOF ========== */}
        <div className="grid sm:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <p className="text-sm text-foreground/90 italic leading-relaxed mb-4">"{t.quote}"</p>
              <div>
                <div className="text-xs font-semibold text-foreground">{t.author}</div>
                <div className="text-[10px] text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ========== FINAL CTA ========== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Award className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Grow your network, unlock alpha
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Every investor you bring strengthens the intelligence network — and unlocks exclusive opportunities for you.
          </p>
          <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2" onClick={copyLink}>
            <Share2 className="w-4 h-4" />Start Inviting Investors
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

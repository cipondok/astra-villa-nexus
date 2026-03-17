import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useReferralDashboard,
  useJoinReferralProgram,
  useApplyAffiliatePartner,
} from "@/hooks/useReferralDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Share2, Copy, Users, DollarSign, TrendingUp, Gift, Trophy,
  Crown, Star, Zap, Target, UserPlus, Loader2, ExternalLink,
  Award, Rocket, Link2, ChevronRight, Sparkles, Shield,
  MessageCircle, Mail, Linkedin,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";

/* ── Social Share Icons ── */
const SHARE_CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-4 w-4" />, color: "bg-green-500/10 text-green-600 hover:bg-green-500/20" },
  { id: "facebook", label: "Facebook", icon: <Share2 className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
  { id: "twitter", label: "X / Twitter", icon: <ExternalLink className="h-4 w-4" />, color: "bg-sky-500/10 text-sky-600 hover:bg-sky-500/20" },
  { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" />, color: "bg-blue-700/10 text-blue-700 hover:bg-blue-700/20" },
  { id: "email", label: "Email", icon: <Mail className="h-4 w-4" />, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
];

/* ── Milestone tier badges ── */
const TIER_ICONS: Record<number, { icon: React.ReactNode; color: string }> = {
  1: { icon: <Star className="h-4 w-4" />, color: "text-muted-foreground" },
  2: { icon: <Zap className="h-4 w-4" />, color: "text-chart-1" },
  3: { icon: <Award className="h-4 w-4" />, color: "text-chart-4" },
  4: { icon: <Crown className="h-4 w-4" />, color: "text-amber-500" },
  5: { icon: <Trophy className="h-4 w-4" />, color: "text-purple-500" },
};

function formatIDR(amount: number) {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}K`;
  return `Rp ${amount}`;
}

/* ── Main Page ── */
export default function ReferralAffiliatePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading, refetch } = useReferralDashboard();
  const joinProgram = useJoinReferralProgram();
  const applyPartner = useApplyAffiliatePartner();

  const referralCode = data?.affiliate?.referral_code || "";
  const referralLink = referralCode ? `${window.location.origin}/?ref=${referralCode}` : "";

  const copyLink = useCallback(() => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Link copied!", description: "Share it with friends and partners." });
  }, [referralLink, toast]);

  const shareVia = useCallback(
    (channel: string) => {
      const msg = `Join ASTRA Villa — Indonesia's AI-powered property investment platform! Use my referral link:`;
      const url = `${referralLink}&utm_source=${channel}&utm_medium=referral`;
      switch (channel) {
        case "whatsapp":
          window.open(`https://wa.me/?text=${encodeURIComponent(msg + "\n" + url)}`, "_blank");
          break;
        case "facebook":
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
          break;
        case "twitter":
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`, "_blank");
          break;
        case "linkedin":
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
          break;
        case "email":
          window.open(`mailto:?subject=${encodeURIComponent("Join ASTRA Villa")}&body=${encodeURIComponent(msg + "\n\n" + url)}`, "_blank");
          break;
      }
    },
    [referralLink]
  );

  const handleJoin = () => {
    joinProgram.mutate(undefined, {
      onSuccess: (data: any) => {
        toast({ title: "Welcome!", description: data.message || "You're now part of the referral program." });
        refetch();
      },
      onError: (err: any) => toast({ title: "Error", description: err?.message || "Failed to join.", variant: "destructive" }),
    });
  };

  const handleApplyPartner = () => {
    applyPartner.mutate(undefined, {
      onSuccess: (data: any) => {
        toast({ title: "Upgraded!", description: data.message || "You're now an Affiliate Partner." });
        refetch();
      },
      onError: (err: any) => toast({ title: "Error", description: err?.message || "Failed to apply.", variant: "destructive" }),
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Share2 className="h-12 w-12 mx-auto text-primary/50" />
            <h2 className="text-xl font-bold text-foreground">Referral & Affiliate Program</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access your referral dashboard and start earning rewards.
            </p>
            <Button onClick={() => (window.location.href = "/?auth=true")}>
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not enrolled yet
  if (!data?.affiliate) {
    return (
      <>
        <SEOHead
          title="Referral & Affiliate Program | ASTRA Villa"
          description="Earn rewards by referring investors and property owners to ASTRA Villa. Join the referral program and become an affiliate partner."
        />
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            {/* Hero */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Earn by Growing ASTRA Villa</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Invite investors, agents, and property owners. Earn rewards for every signup, listing, and transaction.
              </p>
            </div>

            {/* Reward tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <UserPlus className="h-6 w-6" />, title: "Signup Referral", reward: "Rp 50K", desc: "For every user who signs up" },
                { icon: <Target className="h-6 w-6" />, title: "Listing Referral", reward: "Rp 200K", desc: "When they list a property" },
                { icon: <DollarSign className="h-6 w-6" />, title: "Transaction Bonus", reward: "Up to 2%", desc: "On completed transactions" },
              ].map((r) => (
                <Card key={r.title} className="border-border/50">
                  <CardContent className="p-5 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {r.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{r.title}</h3>
                    <p className="text-xl font-bold text-chart-1">{r.reward}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Milestones preview */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-chart-4" /> Milestone Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3 overflow-x-auto pb-2">
                {[
                  { level: 1, name: "Starter", threshold: 3, reward: "Rp 150K" },
                  { level: 2, name: "Connector", threshold: 10, reward: "Rp 500K" },
                  { level: 3, name: "Influencer", threshold: 25, reward: "Rp 1.5M" },
                  { level: 4, name: "Ambassador", threshold: 50, reward: "Rp 5M" },
                  { level: 5, name: "Legend", threshold: 100, reward: "Rp 15M" },
                ].map((m) => (
                  <div
                    key={m.level}
                    className="flex-shrink-0 w-32 p-3 rounded-xl border border-border/40 text-center space-y-1"
                  >
                    <div className={TIER_ICONS[m.level]?.color || "text-muted-foreground"}>
                      {TIER_ICONS[m.level]?.icon}
                    </div>
                    <p className="text-xs font-semibold text-foreground">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.threshold} referrals</p>
                    <p className="text-xs font-bold text-chart-1">{m.reward}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="text-center">
              <Button size="lg" className="gap-2" onClick={handleJoin} disabled={joinProgram.isPending}>
                {joinProgram.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Join the Referral Program
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Enrolled Dashboard ──
  const { stats, milestones, current_milestone, next_milestone, milestone_progress, leaderboard, recent_activity, commissions } = data;
  const isAffiliatePartner = (data.affiliate.commission_rate || 5) >= 10;

  return (
    <>
      <SEOHead
        title="Referral Dashboard | ASTRA Villa"
        description="Track your referrals, earn rewards, and climb the leaderboard."
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Referral & Affiliate</h1>
                <p className="text-sm text-muted-foreground">
                  Share, earn, and grow the community
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAffiliatePartner ? (
                <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 gap-1">
                  <Shield className="h-3 w-3" /> Affiliate Partner · 10% Commission
                </Badge>
              ) : (
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleApplyPartner} disabled={applyPartner.isPending}>
                  {applyPartner.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
                  Upgrade to Affiliate Partner
                </Button>
              )}
            </div>
          </div>

          {/* Referral Code + Share */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-chart-1/5">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Your Referral Link</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-background/80 px-3 py-1.5 rounded-lg border border-border/50 text-foreground">
                      {referralCode}
                    </code>
                    <Button size="sm" variant="outline" className="gap-1" onClick={copyLink}>
                      <Copy className="h-3.5 w-3.5" /> Copy Link
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {SHARE_CHANNELS.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => shareVia(ch.id)}
                      className={cn("p-2.5 rounded-xl transition-colors", ch.color)}
                      title={ch.label}
                    >
                      {ch.icon}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Users, label: "Total Referrals", value: stats.total_referrals, color: "text-primary" },
              { icon: TrendingUp, label: "Converted", value: stats.converted, color: "text-chart-1" },
              { icon: DollarSign, label: "Total Earned", value: formatIDR(stats.total_earnings), color: "text-chart-3" },
              { icon: Gift, label: "Pending", value: formatIDR(stats.pending_earnings), color: "text-chart-4" },
            ].map((s) => (
              <Card key={s.label} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted/50", s.color)}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Milestone Progress */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={TIER_ICONS[current_milestone.level]?.color || "text-muted-foreground"}>
                    {TIER_ICONS[current_milestone.level]?.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Current: {current_milestone.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {stats.converted} / {next_milestone.threshold} referrals to next level
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {milestone_progress}%
                </Badge>
              </div>

              <Progress value={milestone_progress} className="h-3" />

              {/* All milestones */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {milestones.map((m) => {
                  const reached = stats.converted >= m.threshold;
                  return (
                    <div
                      key={m.level}
                      className={cn(
                        "flex-shrink-0 w-28 p-2.5 rounded-xl border text-center space-y-1 transition-all",
                        reached
                          ? "border-chart-1/40 bg-chart-1/5"
                          : m.level === next_milestone.level
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/30 opacity-50"
                      )}
                    >
                      <div className={cn("mx-auto", reached ? "text-chart-1" : TIER_ICONS[m.level]?.color || "text-muted-foreground")}>
                        {reached ? <Trophy className="h-4 w-4 mx-auto" /> : TIER_ICONS[m.level]?.icon}
                      </div>
                      <p className="text-[10px] font-semibold text-foreground">{m.name}</p>
                      <p className="text-[9px] text-muted-foreground">{m.threshold} refs</p>
                      <p className="text-[10px] font-bold text-chart-1">{formatIDR(m.reward)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tabs: Activity / Leaderboard / Commissions */}
          <Tabs defaultValue="activity">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="activity" className="text-xs">Recent Activity</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs">Leaderboard</TabsTrigger>
              <TabsTrigger value="commissions" className="text-xs">Commissions</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  {recent_activity.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Share2 className="h-8 w-8 mx-auto text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No referral activity yet. Share your link to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recent_activity.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge variant="outline" className="text-[10px] capitalize flex-shrink-0">
                              {a.source_channel || "direct"}
                            </Badge>
                            {a.referee_email && (
                              <span className="text-xs text-muted-foreground truncate">{a.referee_email}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              className={cn(
                                "text-[10px]",
                                a.status === "converted" || a.status === "rewarded"
                                  ? "bg-chart-1/10 text-chart-1 border-chart-1/20"
                                  : a.status === "pending"
                                  ? "bg-chart-4/10 text-chart-4 border-chart-4/20"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {a.status}
                            </Badge>
                            {a.reward_amount && (
                              <span className="text-[10px] font-medium text-chart-1">{formatIDR(a.reward_amount)}</span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-4">
              <Card className="border-border/50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-chart-4" /> Top Referrers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {leaderboard.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No leaderboard data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((entry) => (
                        <div
                          key={entry.rank}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                            entry.is_current_user
                              ? "border-primary/30 bg-primary/5"
                              : "border-border/30 hover:bg-muted/20"
                          )}
                        >
                          {/* Rank */}
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                            entry.rank === 1 ? "bg-amber-500/20 text-amber-600" :
                            entry.rank === 2 ? "bg-gray-300/20 text-gray-500" :
                            entry.rank === 3 ? "bg-orange-400/20 text-orange-500" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {entry.rank <= 3 ? (
                              <Crown className="h-4 w-4" />
                            ) : (
                              `#${entry.rank}`
                            )}
                          </div>

                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.avatar_url || undefined} />
                            <AvatarFallback className="text-[10px]">
                              {entry.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {entry.name}
                              {entry.is_current_user && (
                                <Badge variant="outline" className="text-[9px] ml-2">You</Badge>
                              )}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-foreground">{entry.total_referrals}</p>
                            <p className="text-[10px] text-muted-foreground">referrals</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commissions" className="mt-4">
              <Card className="border-border/50">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-chart-3" /> Commission History
                    </CardTitle>
                    {!isAffiliatePartner && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleApplyPartner}>
                        <Rocket className="h-3 w-3" /> Become Affiliate Partner (10%)
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {/* Earnings summary */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Total Earned", value: formatIDR(stats.total_earnings), color: "text-chart-1" },
                      { label: "Pending", value: formatIDR(stats.pending_earnings), color: "text-chart-4" },
                      { label: "Paid Out", value: formatIDR(stats.paid_earnings), color: "text-chart-3" },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border/30">
                        <p className={cn("text-base font-bold", s.color)}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {commissions.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <DollarSign className="h-8 w-8 mx-auto text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        No commissions yet. Refer users who make transactions to earn commissions.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {commissions.map((c: any) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30"
                        >
                          <div>
                            <p className="text-xs font-medium text-foreground">
                              {formatIDR(c.commission_amount)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {c.commission_rate}% of {formatIDR(c.order_amount || 0)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "text-[10px]",
                                c.status === "paid" ? "bg-chart-1/10 text-chart-1" : "bg-chart-4/10 text-chart-4"
                              )}
                            >
                              {c.status}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

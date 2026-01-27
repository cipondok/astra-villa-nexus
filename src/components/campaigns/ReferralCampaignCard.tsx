import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Gift, Share2, Copy, Trophy, ArrowRight, 
  MessageCircle, Facebook, Twitter, Linkedin, Mail, Link2,
  TrendingUp, Target, Coins
} from "lucide-react";
import useReferralCampaign from "@/hooks/useReferralCampaign";

const CHANNEL_ICONS: Record<string, any> = {
  whatsapp: MessageCircle,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  email: Mail,
  copy: Link2
};

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "bg-green-500 hover:bg-green-600",
  facebook: "bg-blue-600 hover:bg-blue-700",
  twitter: "bg-sky-500 hover:bg-sky-600",
  linkedin: "bg-blue-700 hover:bg-blue-800",
  email: "bg-gray-600 hover:bg-gray-700",
  copy: "bg-primary hover:bg-primary/90"
};

const ReferralCampaignCard = () => {
  const { campaign, referralCode, stats, isLoading, shareVia, getShareUrl } = useReferralCampaign();
  const [activeTab, setActiveTab] = useState("share");

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-96" />
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Active Referral Campaign</h3>
          <p className="text-sm text-muted-foreground">
            Check back later for exciting referral opportunities!
          </p>
        </CardContent>
      </Card>
    );
  }

  const tierProgress = (stats.convertedReferrals / stats.nextTierThreshold) * 100;
  const currentTierInfo = campaign.tier_bonuses?.find((t: any) => t.tier === stats.currentTier);
  const nextTierInfo = campaign.tier_bonuses?.find((t: any) => t.tier === stats.currentTier + 1);

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{campaign.name}</h2>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="share">Share & Earn</TabsTrigger>
            <TabsTrigger value="stats">My Progress</TabsTrigger>
            <TabsTrigger value="tiers">Tiers & Rewards</TabsTrigger>
          </TabsList>

          {/* Share Tab */}
          <TabsContent value="share" className="space-y-6">
            {/* Referral Code */}
            <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed">
              <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-2xl font-mono font-bold tracking-wider">
                  {referralCode}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => shareVia('copy')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Rewards Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">You Earn</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {campaign.referrer_reward_amount} {campaign.referrer_reward_type}
                </p>
                <p className="text-xs text-muted-foreground">per successful referral</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Friend Gets</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {campaign.referee_reward_amount} {campaign.referee_reward_type}
                </p>
                <p className="text-xs text-muted-foreground">on sign up</p>
              </div>
            </div>

            {/* Share Buttons */}
            <div>
              <p className="text-sm font-medium mb-3">Share via</p>
              <div className="grid grid-cols-3 gap-3">
                {(campaign.share_channels || ['whatsapp', 'facebook', 'twitter', 'linkedin', 'email', 'copy']).map((channel: string) => {
                  const Icon = CHANNEL_ICONS[channel] || Share2;
                  const colorClass = CHANNEL_COLORS[channel] || 'bg-primary';
                  return (
                    <Button
                      key={channel}
                      className={`${colorClass} text-white`}
                      onClick={() => shareVia(channel)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </Button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{stats.convertedReferrals}</p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Coins className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">{stats.totalEarnings}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
            </div>

            {/* Tier Progress */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">
                    {currentTierInfo?.badge || 'Newcomer'} (Tier {stats.currentTier})
                  </span>
                </div>
                {nextTierInfo && (
                  <span className="text-sm text-muted-foreground">
                    {stats.nextTierThreshold - stats.convertedReferrals} to {nextTierInfo.badge}
                  </span>
                )}
              </div>
              <Progress value={Math.min(tierProgress, 100)} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {stats.convertedReferrals} / {stats.nextTierThreshold} referrals
              </p>
            </div>
          </TabsContent>

          {/* Tiers Tab */}
          <TabsContent value="tiers" className="space-y-4">
            {campaign.tier_bonuses?.map((tier: any, index: number) => (
              <div 
                key={tier.tier}
                className={`p-4 rounded-lg border ${
                  stats.currentTier >= tier.tier 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      stats.currentTier >= tier.tier ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <Trophy className={`w-5 h-5 ${
                        stats.currentTier >= tier.tier ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{tier.badge}</p>
                      <p className="text-sm text-muted-foreground">
                        {tier.referrals} referrals required
                      </p>
                    </div>
                  </div>
                  <Badge variant={stats.currentTier >= tier.tier ? "default" : "secondary"}>
                    {tier.bonus_multiplier}x Bonus
                  </Badge>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReferralCampaignCard;

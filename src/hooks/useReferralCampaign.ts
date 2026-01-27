import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ReferralCampaign {
  id: string;
  name: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  referrer_reward_type: string;
  referrer_reward_amount: number;
  referee_reward_type: string;
  referee_reward_amount: number;
  tier_bonuses: any[];
  share_channels: string[];
  share_message_template: string;
  target_referrals: number;
  actual_referrals: number;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalEarnings: number;
  currentTier: number;
  nextTierThreshold: number;
}

export const useReferralCampaign = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<ReferralCampaign | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    convertedReferrals: 0,
    totalEarnings: 0,
    currentTier: 0,
    nextTierThreshold: 5
  });
  const [isLoading, setIsLoading] = useState(true);

  // Generate referral code
  const generateReferralCode = useCallback(() => {
    if (!user) return '';
    const base = user.email?.split('@')[0] || user.id.slice(0, 8);
    return `${base.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }, [user]);

  // Fetch active campaign
  const fetchCampaign = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('referral_campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCampaign({
          ...data,
          tier_bonuses: data.tier_bonuses as any[],
          share_channels: data.share_channels as string[]
        });
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    }
  }, []);

  // Fetch user's referral stats
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_tracking')
        .select('*')
        .eq('referrer_id', user.id);

      if (error) throw error;

      const referrals = data || [];
      const converted = referrals.filter(r => r.status === 'converted' || r.status === 'rewarded');
      const pending = referrals.filter(r => r.status === 'pending' || r.status === 'signed_up');
      
      const totalEarnings = referrals
        .filter(r => r.status === 'rewarded')
        .reduce((sum, r) => sum + (r.referrer_reward_amount || 0) + (r.bonus_applied || 0), 0);

      // Calculate tier
      const tierBonuses = campaign?.tier_bonuses || [];
      let currentTier = 0;
      let nextThreshold = 5;
      
      for (const tier of tierBonuses) {
        if (converted.length >= tier.referrals) {
          currentTier = tier.tier;
        } else {
          nextThreshold = tier.referrals;
          break;
        }
      }

      setStats({
        totalReferrals: referrals.length,
        pendingReferrals: pending.length,
        convertedReferrals: converted.length,
        totalEarnings,
        currentTier,
        nextTierThreshold: nextThreshold
      });

      // Get or create referral code
      if (referrals.length > 0 && referrals[0].referral_code) {
        setReferralCode(referrals[0].referral_code);
      } else {
        setReferralCode(generateReferralCode());
      }

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user, campaign, generateReferralCode]);

  // Track a share
  const trackShare = useCallback(async (channel: string) => {
    if (!user || !campaign) return;

    try {
      await supabase.from('referral_tracking').insert({
        campaign_id: campaign.id,
        referrer_id: user.id,
        referral_code: referralCode,
        share_channel: channel,
        status: 'pending'
      });

      toast({
        title: "Link Shared!",
        description: `Referral tracked via ${channel}`,
      });

    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }, [user, campaign, referralCode, toast]);

  // Generate share URL
  const getShareUrl = useCallback((channel?: string) => {
    const baseUrl = window.location.origin;
    let url = `${baseUrl}/?ref=${referralCode}`;
    if (channel) {
      url += `&utm_source=${channel}&utm_medium=referral&utm_campaign=${campaign?.slug || 'default'}`;
    }
    return url;
  }, [referralCode, campaign]);

  // Share via different channels
  const shareVia = useCallback(async (channel: string) => {
    const url = getShareUrl(channel);
    const message = campaign?.share_message_template
      ?.replace('{referral_code}', referralCode)
      ?.replace('{referee_reward}', `${campaign.referee_reward_amount} ${campaign.referee_reward_type}`)
      || `Join ASTRA Villa! Use my code: ${referralCode}`;

    switch (channel) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message + '\n' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Join ASTRA Villa')}&body=${encodeURIComponent(message + '\n\n' + url)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        toast({ title: "Link Copied!", description: "Share it with your friends." });
        break;
    }

    await trackShare(channel);
  }, [campaign, referralCode, getShareUrl, trackShare, toast]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchCampaign();
      setIsLoading(false);
    };
    load();
  }, [fetchCampaign]);

  useEffect(() => {
    if (campaign && user) {
      fetchStats();
    }
  }, [campaign, user, fetchStats]);

  return {
    campaign,
    referralCode,
    stats,
    isLoading,
    shareVia,
    getShareUrl,
    refreshStats: fetchStats
  };
};

export default useReferralCampaign;

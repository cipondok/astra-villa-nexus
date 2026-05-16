import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const REFERRAL_CODE_KEY = 'astra_referral_code';
const REFERRAL_CHANNEL_KEY = 'astra_referral_channel';

export const useReferralTracking = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');

    if (!refCode) return;

    // Store in localStorage for signup attribution
    localStorage.setItem(REFERRAL_CODE_KEY, refCode);
    if (utmSource) localStorage.setItem(REFERRAL_CHANNEL_KEY, utmSource);

    // Track the click
    const trackClick = async () => {
      try {
        // Find the affiliate by referral code
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id, user_id')
          .eq('referral_code', refCode)
          .single();

        if (!affiliate) return;

        // Upsert referral tracking
        const { data: existing } = await supabase
          .from('referral_tracking')
          .select('id, click_count')
          .eq('referral_code', refCode)
          .eq('share_channel', utmSource || 'direct')
          .maybeSingle();

        if (existing) {
          await supabase
            .from('referral_tracking')
            .update({ click_count: (existing.click_count || 0) + 1 })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('referral_tracking')
            .insert({
              referral_code: refCode,
              referrer_id: affiliate.user_id,
              share_channel: utmSource || 'direct',
              utm_source: utmSource,
              utm_medium: utmMedium,
              utm_campaign: utmCampaign,
              landing_page: window.location.pathname,
              click_count: 1,
              status: 'clicked',
            });
        }
      } catch (err) {
        console.error('Referral tracking error:', err);
      }
    };

    trackClick();
  }, []);
};

/**
 * Call this after a successful signup to link the new user to their referrer.
 */
export const processReferralSignup = async (newUserId: string) => {
  const refCode = localStorage.getItem(REFERRAL_CODE_KEY);
  if (!refCode) return;

  try {
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('referral_code', refCode)
      .single();

    if (!affiliate) return;

    // Insert referral record (trigger will auto-increment total_referrals)
    await supabase.from('referrals').insert({
      affiliate_id: affiliate.id,
      referred_user_id: newUserId,
      referral_code: refCode,
      status: 'active',
    });

    // Update tracking record
    await supabase
      .from('referral_tracking')
      .update({
        referee_id: newUserId,
        signed_up_at: new Date().toISOString(),
        status: 'converted',
        converted_at: new Date().toISOString(),
      })
      .eq('referral_code', refCode)
      .eq('status', 'clicked');

    // Clean up localStorage
    localStorage.removeItem(REFERRAL_CODE_KEY);
    localStorage.removeItem(REFERRAL_CHANNEL_KEY);
  } catch (err) {
    console.error('Referral signup processing error:', err);
  }
};

/**
 * Hook to get the current user's affiliate referral code (if they have one).
 */
export const useUserReferralCode = () => {
  // This is used by share components to append ?ref=CODE
  const getUserReferralCode = async (userId: string): Promise<string | null> => {
    const { data } = await supabase
      .from('affiliates')
      .select('referral_code')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    return data?.referral_code || null;
  };

  return { getUserReferralCode };
};

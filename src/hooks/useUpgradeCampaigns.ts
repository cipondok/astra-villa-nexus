import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

type CampaignType = 'interested_viewer' | 'competitor_alert' | 'almost_there';

interface CampaignData {
  propertyName?: string;
  viewCount?: number;
  missedInquiries?: number;
  competitorCount?: number;
  area?: string;
}

export function useUpgradeCampaigns() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const sendCampaignEmail = useCallback(async (
    campaignType: CampaignType,
    data: CampaignData
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('upgrade-campaign-emails', {
        body: {
          action: 'send_campaign_email',
          campaign_type: campaignType,
          user_id: user.id,
          data,
          language,
        },
      });

      if (error) throw error;
      console.log(`Campaign email sent: ${campaignType}`);
    } catch (error) {
      console.error('Failed to send campaign email:', error);
    }
  }, [user, language]);

  const triggerInterestedViewer = useCallback((propertyName: string) => {
    sendCampaignEmail('interested_viewer', { propertyName });
  }, [sendCampaignEmail]);

  const triggerCompetitorAlert = useCallback((propertyName: string, competitorCount: number, area: string) => {
    sendCampaignEmail('competitor_alert', { propertyName, competitorCount, area });
  }, [sendCampaignEmail]);

  const triggerAlmostThere = useCallback((viewCount: number, missedInquiries: number) => {
    sendCampaignEmail('almost_there', { viewCount, missedInquiries });
  }, [sendCampaignEmail]);

  return {
    sendCampaignEmail,
    triggerInterestedViewer,
    triggerCompetitorAlert,
    triggerAlmostThere,
  };
}

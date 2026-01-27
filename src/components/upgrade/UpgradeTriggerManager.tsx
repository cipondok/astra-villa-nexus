import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PropertyLimitModal from './triggers/PropertyLimitModal';
import ViewMilestoneModal from './triggers/ViewMilestoneModal';
import InquiryExpiringModal from './triggers/InquiryExpiringModal';
import UpgradeBanner from './UpgradeBanner';

interface TriggerState {
  propertyLimit: boolean;
  viewMilestone: boolean;
  inquiryExpiring: boolean;
  competitorAlert: boolean;
}

interface UpgradeTriggerContextType {
  triggerPropertyLimit: () => void;
  triggerViewMilestone: (viewCount: number) => void;
  triggerInquiryExpiring: (inquiryCount: number, hoursLeft: number) => void;
  dismissAll: () => void;
  userTier: 'free' | 'basic' | 'pro' | 'enterprise';
  propertyCount: number;
  propertyLimit: number;
}

const UpgradeTriggerContext = createContext<UpgradeTriggerContextType | null>(null);

export const useUpgradeTriggers = () => {
  const context = useContext(UpgradeTriggerContext);
  if (!context) {
    throw new Error('useUpgradeTriggers must be used within UpgradeTriggerManager');
  }
  return context;
};

// Free tier limits
const TIER_LIMITS = {
  free: { properties: 1, photos: 5, aiQueries: 5, contactsPerMonth: 3 },
  basic: { properties: 5, photos: 20, aiQueries: 50, contactsPerMonth: 25 },
  pro: { properties: 50, photos: 100, aiQueries: 500, contactsPerMonth: -1 },
  enterprise: { properties: -1, photos: -1, aiQueries: -1, contactsPerMonth: -1 },
};

interface UpgradeTriggerManagerProps {
  children: React.ReactNode;
}

const UpgradeTriggerManager = ({ children }: UpgradeTriggerManagerProps) => {
  const { user } = useAuth();
  const [userTier, setUserTier] = useState<'free' | 'basic' | 'pro' | 'enterprise'>('free');
  const [propertyCount, setPropertyCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  
  const [modals, setModals] = useState<TriggerState>({
    propertyLimit: false,
    viewMilestone: false,
    inquiryExpiring: false,
    competitorAlert: false,
  });

  const [modalData, setModalData] = useState({
    viewCount: 0,
    inquiryCount: 0,
    hoursLeft: 24,
  });

  // Fetch user tier and property count
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      // Check user subscription tier via profile's user_level_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_level_id')
        .eq('id', user.id)
        .single();

      if (profile?.user_level_id) {
        // Fetch the level name
        const { data: levelData } = await supabase
          .from('user_levels')
          .select('name')
          .eq('id', profile.user_level_id)
          .single();

        if (levelData?.name) {
          const tierMap: Record<string, 'free' | 'basic' | 'pro' | 'enterprise'> = {
            'basic': 'free',
            'verified': 'basic',
            'vip': 'pro',
            'gold': 'pro',
            'platinum': 'enterprise',
            'diamond': 'enterprise',
          };
          setUserTier(tierMap[levelData.name.toLowerCase()] || 'free');
        }
      }

      // Count user's properties
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      setPropertyCount(count || 0);

      // Show banner if near limit
      const limit = TIER_LIMITS[userTier].properties;
      if (limit > 0 && (count || 0) >= limit * 0.8) {
        setShowBanner(true);
      }
    };

    fetchUserData();
  }, [user, userTier]);

  const triggerPropertyLimit = useCallback(() => {
    if (userTier === 'free' || userTier === 'basic') {
      setModals(prev => ({ ...prev, propertyLimit: true }));
    }
  }, [userTier]);

  const triggerViewMilestone = useCallback((viewCount: number) => {
    if (userTier === 'free' && viewCount >= 10) {
      setModalData(prev => ({ ...prev, viewCount }));
      setModals(prev => ({ ...prev, viewMilestone: true }));
    }
  }, [userTier]);

  const triggerInquiryExpiring = useCallback((inquiryCount: number, hoursLeft: number) => {
    if (userTier === 'free' && inquiryCount > 0) {
      setModalData(prev => ({ ...prev, inquiryCount, hoursLeft }));
      setModals(prev => ({ ...prev, inquiryExpiring: true }));
    }
  }, [userTier]);

  const dismissAll = useCallback(() => {
    setModals({
      propertyLimit: false,
      viewMilestone: false,
      inquiryExpiring: false,
      competitorAlert: false,
    });
  }, []);

  const closeModal = (modal: keyof TriggerState) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  return (
    <UpgradeTriggerContext.Provider
      value={{
        triggerPropertyLimit,
        triggerViewMilestone,
        triggerInquiryExpiring,
        dismissAll,
        userTier,
        propertyCount,
        propertyLimit: TIER_LIMITS[userTier].properties,
      }}
    >
      {children}

      {/* Upgrade Banner */}
      {showBanner && userTier === 'free' && (
        <UpgradeBanner onDismiss={() => setShowBanner(false)} />
      )}

      {/* Trigger Modals */}
      <PropertyLimitModal
        open={modals.propertyLimit}
        onClose={() => closeModal('propertyLimit')}
        currentCount={propertyCount}
        limit={TIER_LIMITS[userTier].properties}
      />

      <ViewMilestoneModal
        open={modals.viewMilestone}
        onClose={() => closeModal('viewMilestone')}
        viewCount={modalData.viewCount}
      />

      <InquiryExpiringModal
        open={modals.inquiryExpiring}
        onClose={() => closeModal('inquiryExpiring')}
        inquiryCount={modalData.inquiryCount}
        hoursLeft={modalData.hoursLeft}
      />
    </UpgradeTriggerContext.Provider>
  );
};

export default UpgradeTriggerManager;

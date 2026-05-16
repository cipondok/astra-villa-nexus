import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface VendorCategoryStatus {
  hasMainCategory: boolean;
  mainCategoryId: string | null;
  businessNatureId: string | null;
  canChangeCategory: boolean;
  isLoading: boolean;
  refresh: () => void;
}

export const useVendorCategoryStatus = (): VendorCategoryStatus => {
  const { user } = useAuth();
  const [hasMainCategory, setHasMainCategory] = useState(false);
  const [mainCategoryId, setMainCategoryId] = useState<string | null>(null);
  const [businessNatureId, setBusinessNatureId] = useState<string | null>(null);
  const [canChangeCategory, setCanChangeCategory] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const checkCategoryStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get vendor business profile
      const { data: profile, error } = await supabase
        .from('vendor_business_profiles')
        .select('business_nature_id, main_service_category_id, can_change_nature')
        .eq('vendor_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profile) {
        const categoryId = profile.business_nature_id || profile.main_service_category_id;
        setMainCategoryId(categoryId);
        setBusinessNatureId(profile.business_nature_id);
        setHasMainCategory(!!categoryId);
        setCanChangeCategory(profile.can_change_nature ?? true);
      } else {
        setMainCategoryId(null);
        setBusinessNatureId(null);
        setHasMainCategory(false);
        setCanChangeCategory(true);
      }
    } catch (error) {
      console.error('Error checking category status:', error);
      setMainCategoryId(null);
      setBusinessNatureId(null);
      setHasMainCategory(false);
      setCanChangeCategory(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCategoryStatus();
  }, [user]);

  return {
    hasMainCategory,
    mainCategoryId,
    businessNatureId,
    canChangeCategory,
    isLoading,
    refresh: checkCategoryStatus
  };
};
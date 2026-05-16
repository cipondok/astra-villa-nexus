/**
 * Geo-Personalization Engine
 * Auto-detects user region and adapts experience accordingly
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface GeoProfile {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  currency: string;
  locale: string;
  timezone: string;
  tier: 'domestic' | 'sea' | 'apac' | 'mena' | 'europe' | 'americas';
  compliance: ComplianceRequirements;
}

interface ComplianceRequirements {
  requiresKYC: boolean;
  taxDisclaimer: string;
  legalNotice: string;
  restrictedFeatures: string[];
  maxTransactionWithoutKYC: number;
}

const REGION_CONFIG: Record<string, Partial<GeoProfile>> = {
  ID: {
    country: 'Indonesia', currency: 'IDR', locale: 'id-ID', tier: 'domestic',
    compliance: {
      requiresKYC: true,
      taxDisclaimer: 'Pajak properti dikenakan sesuai peraturan Indonesia',
      legalNotice: 'Transaksi tunduk pada hukum properti Indonesia',
      restrictedFeatures: [],
      maxTransactionWithoutKYC: 50000000,
    },
  },
  SG: {
    country: 'Singapore', currency: 'SGD', locale: 'en-SG', tier: 'sea',
    compliance: {
      requiresKYC: true,
      taxDisclaimer: 'Additional Buyer\'s Stamp Duty (ABSD) may apply for foreign buyers',
      legalNotice: 'Foreign ownership restrictions may apply',
      restrictedFeatures: [],
      maxTransactionWithoutKYC: 0,
    },
  },
  AE: {
    country: 'UAE', currency: 'AED', locale: 'en-AE', tier: 'mena',
    compliance: {
      requiresKYC: true,
      taxDisclaimer: 'No income tax. Registration fees apply at 4%',
      legalNotice: 'Freehold ownership available in designated zones',
      restrictedFeatures: [],
      maxTransactionWithoutKYC: 0,
    },
  },
  US: {
    country: 'United States', currency: 'USD', locale: 'en-US', tier: 'americas',
    compliance: {
      requiresKYC: true,
      taxDisclaimer: 'Capital gains tax and state taxes may apply',
      legalNotice: 'Subject to FIRPTA regulations for foreign investors',
      restrictedFeatures: [],
      maxTransactionWithoutKYC: 0,
    },
  },
  GB: {
    country: 'United Kingdom', currency: 'GBP', locale: 'en-GB', tier: 'europe',
    compliance: {
      requiresKYC: true,
      taxDisclaimer: 'Stamp Duty Land Tax applies. Additional surcharge for non-residents',
      legalNotice: 'Subject to UK property regulations',
      restrictedFeatures: [],
      maxTransactionWithoutKYC: 0,
    },
  },
  JP: {
    country: 'Japan', currency: 'JPY', locale: 'ja-JP', tier: 'apac',
    compliance: {
      requiresKYC: true,
      taxDisclaimer: 'Registration and license tax applies',
      legalNotice: 'No foreign ownership restrictions for most properties',
      restrictedFeatures: [],
      maxTransactionWithoutKYC: 0,
    },
  },
};

const DEFAULT_PROFILE: GeoProfile = {
  country: 'Indonesia',
  countryCode: 'ID',
  region: 'Asia',
  city: 'Jakarta',
  currency: 'IDR',
  locale: 'id-ID',
  timezone: 'Asia/Jakarta',
  tier: 'domestic',
  compliance: REGION_CONFIG.ID!.compliance!,
};

export function useGeoPersonalization() {
  const [geoProfile, setGeoProfile] = useState<GeoProfile>(DEFAULT_PROFILE);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem('astra_geo_profile');
    if (cached) {
      try {
        setGeoProfile(JSON.parse(cached));
        setIsDetecting(false);
        return;
      } catch { /* ignore */ }
    }

    // Use timezone-based detection (no external API needed)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lang = navigator.language;
    
    let detectedCode = 'ID';
    if (tz.startsWith('Asia/Jakarta') || tz.startsWith('Asia/Makassar')) detectedCode = 'ID';
    else if (tz.startsWith('Asia/Singapore')) detectedCode = 'SG';
    else if (tz.startsWith('Asia/Dubai')) detectedCode = 'AE';
    else if (tz.startsWith('America/')) detectedCode = 'US';
    else if (tz.startsWith('Europe/London')) detectedCode = 'GB';
    else if (tz.startsWith('Asia/Tokyo')) detectedCode = 'JP';
    else if (lang.startsWith('id')) detectedCode = 'ID';
    else if (lang.startsWith('ja')) detectedCode = 'JP';
    
    const config = REGION_CONFIG[detectedCode] || REGION_CONFIG.ID;
    const profile: GeoProfile = {
      ...DEFAULT_PROFILE,
      ...config,
      countryCode: detectedCode,
      timezone: tz,
    };

    setGeoProfile(profile);
    sessionStorage.setItem('astra_geo_profile', JSON.stringify(profile));
    setIsDetecting(false);
  }, []);

  const formatPrice = useCallback((amount: number, currency?: string) => {
    const cur = currency || geoProfile.currency;
    try {
      return new Intl.NumberFormat(geoProfile.locale, {
        style: 'currency',
        currency: cur,
        minimumFractionDigits: ['IDR', 'JPY', 'KRW'].includes(cur) ? 0 : 2,
        maximumFractionDigits: ['IDR', 'JPY', 'KRW'].includes(cur) ? 0 : 2,
      }).format(amount);
    } catch {
      return `${cur} ${amount.toLocaleString()}`;
    }
  }, [geoProfile]);

  const getPropertyRecommendationHint = useCallback((): string => {
    switch (geoProfile.tier) {
      case 'mena': return 'luxury_villa';
      case 'europe': return 'premium_apartment';
      case 'americas': return 'investment_property';
      case 'apac': return 'modern_condo';
      case 'sea': return 'tropical_villa';
      default: return 'local_investment';
    }
  }, [geoProfile.tier]);

  return useMemo(() => ({
    geoProfile,
    isDetecting,
    formatPrice,
    getPropertyRecommendationHint,
  }), [geoProfile, isDetecting, formatPrice, getPropertyRecommendationHint]);
}

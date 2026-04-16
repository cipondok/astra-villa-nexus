/**
 * Luxury Investor Microcopy System
 * Transforms generic real estate language into premium investor-grade copy
 */

import { useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type CopyContext = 'property' | 'checkout' | 'escrow' | 'wallet' | 'dashboard' | 'listing' | 'cta';

interface LuxuryCopy {
  /** Premium label replacement */
  label: (key: string) => string;
  /** Scarcity/prestige signal */
  signal: (type: 'scarcity' | 'prestige' | 'trust' | 'urgency', data?: Record<string, unknown>) => string;
  /** Trust badge text */
  trust: (variant: 'escrow' | 'legal' | 'exclusive' | 'institutional') => string;
}

const LUXURY_LABELS: Record<string, Record<string, string>> = {
  en: {
    'buy': 'Secure This Asset',
    'buy_property': 'Secure This Asset',
    'checkout': 'Complete Investment Allocation',
    'listing': 'Curated Investment Opportunity',
    'listings': 'Curated Opportunities',
    'price': 'Investment Value',
    'rent': 'Lease Opportunity',
    'contact_agent': 'Connect with Advisor',
    'make_offer': 'Submit Investment Offer',
    'save': 'Add to Portfolio Watchlist',
    'saved': 'In Your Watchlist',
    'view_details': 'View Full Analysis',
    'compare': 'Compare Assets',
    'search': 'Discover Opportunities',
    'filter': 'Refine Selection',
    'property': 'Asset',
    'properties': 'Assets',
    'mortgage': 'Financing Structure',
    'down_payment': 'Initial Capital Allocation',
    'monthly_payment': 'Monthly Commitment',
    'area': 'Total Living Area',
    'bedroom': 'Private Suite',
    'bathroom': 'En-Suite Bath',
    'add_to_cart': 'Reserve Allocation',
    'proceed': 'Proceed to Secure',
    'confirm': 'Confirm Allocation',
    'submit': 'Submit for Review',
    'topup': 'Fund Investment Account',
    'withdraw': 'Request Capital Release',
    'escrow': 'Secure Custody',
    'portfolio': 'Investment Portfolio',
    'roi': 'Return on Investment',
    'yield': 'Annual Yield',
  },
  id: {
    'buy': 'Amankan Aset Ini',
    'buy_property': 'Amankan Aset Ini',
    'checkout': 'Selesaikan Alokasi Investasi',
    'listing': 'Peluang Investasi Terkurasi',
    'listings': 'Peluang Terkurasi',
    'price': 'Nilai Investasi',
    'rent': 'Peluang Sewa',
    'contact_agent': 'Hubungi Penasihat',
    'make_offer': 'Ajukan Penawaran Investasi',
    'save': 'Tambah ke Watchlist Portofolio',
    'view_details': 'Lihat Analisis Lengkap',
    'search': 'Temukan Peluang',
    'property': 'Aset',
    'properties': 'Aset',
    'topup': 'Dana Akun Investasi',
    'withdraw': 'Ajukan Pelepasan Modal',
    'escrow': 'Kustodi Aman',
    'portfolio': 'Portofolio Investasi',
  },
};

const TRUST_BADGES: Record<string, Record<string, string>> = {
  en: {
    escrow: 'Institutional-grade escrow protection',
    legal: 'Verified legal due diligence completed',
    exclusive: 'Exclusive investor access',
    institutional: 'Bank-level security & compliance',
  },
  id: {
    escrow: 'Perlindungan escrow tingkat institusional',
    legal: 'Due diligence hukum terverifikasi',
    exclusive: 'Akses eksklusif investor',
    institutional: 'Keamanan & kepatuhan tingkat bank',
  },
};

export function useLuxuryMicrocopy(): LuxuryCopy {
  const { language } = useLanguage();

  const label = useCallback((key: string): string => {
    const lang = LUXURY_LABELS[language] || LUXURY_LABELS['en'];
    const fallback = LUXURY_LABELS['en'];
    return lang?.[key] || fallback?.[key] || key;
  }, [language]);

  const signal = useCallback((type: 'scarcity' | 'prestige' | 'trust' | 'urgency', data?: Record<string, unknown>): string => {
    const isEn = language === 'en' || !['id'].includes(language);
    
    switch (type) {
      case 'scarcity': {
        const remaining = data?.remaining ?? 3;
        return isEn
          ? `Only ${remaining} allocations remaining`
          : `Hanya ${remaining} alokasi tersisa`;
      }
      case 'prestige': {
        const percentile = data?.percentile ?? 5;
        return isEn
          ? `Top ${percentile}% high-growth zone`
          : `Zona pertumbuhan tinggi top ${percentile}%`;
      }
      case 'trust':
        return isEn
          ? 'Protected by institutional-grade escrow'
          : 'Dilindungi oleh escrow tingkat institusional';
      case 'urgency': {
        const viewers = data?.viewers ?? 12;
        return isEn
          ? `${viewers} qualified investors viewing now`
          : `${viewers} investor berkualifikasi sedang melihat`;
      }
      default:
        return '';
    }
  }, [language]);

  const trust = useCallback((variant: 'escrow' | 'legal' | 'exclusive' | 'institutional'): string => {
    const lang = TRUST_BADGES[language] || TRUST_BADGES['en'];
    return lang?.[variant] || TRUST_BADGES['en']?.[variant] || '';
  }, [language]);

  return useMemo(() => ({ label, signal, trust }), [label, signal, trust]);
}

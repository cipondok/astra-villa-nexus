import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Check, Globe, Shield, AlertTriangle, MessageSquare, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

// Eligible countries based on bilateral banking agreements and Indonesian banking regulations
// Reference: Bank Indonesia regulations & OJK guidelines for overseas KPR
const ELIGIBLE_COUNTRIES = [
  // Tier 1 - Strong bilateral agreements, major TKI destinations
  { code: 'SG', name: 'Singapore', nameId: 'Singapura', tier: 1, flag: '🇸🇬', minStay: 6, workPermitRequired: true },
  { code: 'MY', name: 'Malaysia', nameId: 'Malaysia', tier: 1, flag: '🇲🇾', minStay: 6, workPermitRequired: true },
  { code: 'JP', name: 'Japan', nameId: 'Jepang', tier: 1, flag: '🇯🇵', minStay: 12, workPermitRequired: true },
  { code: 'KR', name: 'South Korea', nameId: 'Korea Selatan', tier: 1, flag: '🇰🇷', minStay: 12, workPermitRequired: true },
  { code: 'TW', name: 'Taiwan', nameId: 'Taiwan', tier: 1, flag: '🇹🇼', minStay: 6, workPermitRequired: true },
  { code: 'HK', name: 'Hong Kong', nameId: 'Hong Kong', tier: 1, flag: '🇭🇰', minStay: 6, workPermitRequired: true },
  
  // Tier 2 - Major economies with Indonesian diaspora
  { code: 'AE', name: 'UAE (Dubai)', nameId: 'UEA (Dubai)', tier: 1, flag: '🇦🇪', minStay: 6, workPermitRequired: true },
  { code: 'SA', name: 'Saudi Arabia', nameId: 'Arab Saudi', tier: 1, flag: '🇸🇦', minStay: 12, workPermitRequired: true },
  { code: 'AU', name: 'Australia', nameId: 'Australia', tier: 1, flag: '🇦🇺', minStay: 12, workPermitRequired: true },
  { code: 'US', name: 'United States', nameId: 'Amerika Serikat', tier: 2, flag: '🇺🇸', minStay: 12, workPermitRequired: true },
  { code: 'GB', name: 'United Kingdom', nameId: 'Inggris', tier: 2, flag: '🇬🇧', minStay: 12, workPermitRequired: true },
  { code: 'NL', name: 'Netherlands', nameId: 'Belanda', tier: 2, flag: '🇳🇱', minStay: 12, workPermitRequired: true },
  { code: 'DE', name: 'Germany', nameId: 'Jerman', tier: 2, flag: '🇩🇪', minStay: 12, workPermitRequired: true },
  
  // Tier 3 - Other eligible countries
  { code: 'BN', name: 'Brunei', nameId: 'Brunei', tier: 2, flag: '🇧🇳', minStay: 6, workPermitRequired: true },
  { code: 'QA', name: 'Qatar', nameId: 'Qatar', tier: 2, flag: '🇶🇦', minStay: 12, workPermitRequired: true },
  { code: 'KW', name: 'Kuwait', nameId: 'Kuwait', tier: 2, flag: '🇰🇼', minStay: 12, workPermitRequired: true },
  { code: 'CA', name: 'Canada', nameId: 'Kanada', tier: 2, flag: '🇨🇦', minStay: 12, workPermitRequired: true },
  { code: 'NZ', name: 'New Zealand', nameId: 'Selandia Baru', tier: 2, flag: '🇳🇿', minStay: 12, workPermitRequired: true },
];

interface EligibleCountriesSelectorProps {
  selectedCountry: string | null;
  onSelect: (countryCode: string) => void;
  className?: string;
}

// Helper component for "Country not listed" CTA
const CountryNotListedCTA: React.FC<{
  notListed: string;
  notListedDesc: string;
  contactUs: string;
  chatWithUs: string;
}> = ({ notListed, notListedDesc, contactUs, chatWithUs }) => {
  const navigate = useNavigate();
  
  const openChat = () => {
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  };

  return (
    <div className="p-2.5 sm:p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
      <div className="flex items-start gap-2 mb-2">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] sm:text-xs font-medium text-amber-700 dark:text-amber-400">{notListed}</p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">{notListedDesc}</p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <Button
          size="sm"
          onClick={() => navigate('/contact')}
          className="gap-1 text-[10px] sm:text-xs h-7 px-2.5 bg-amber-600 hover:bg-amber-700"
        >
          <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          {contactUs}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={openChat}
          className="gap-1 text-[10px] sm:text-xs h-7 px-2.5 border-amber-500/50 text-amber-700 hover:bg-amber-500/10"
        >
          <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          {chatWithUs}
        </Button>
      </div>
    </div>
  );
};

export const EligibleCountriesSelector: React.FC<EligibleCountriesSelectorProps> = ({
  selectedCountry,
  onSelect,
  className
}) => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 1 | 2>('all');

  const copy = {
    en: {
      title: "Select Your Country of Work",
      subtitle: "KPR eligibility varies by country based on bilateral banking agreements",
      tier1: "Priority Countries",
      tier1Desc: "Strong bilateral agreements, faster processing",
      tier2: "Standard Countries",
      tier2Desc: "Standard processing timeline",
      all: "All Countries",
      minStay: "Min. stay",
      months: "months",
      workPermit: "Work permit required",
      selectCountry: "Click to select",
      selected: "Selected",
      notListed: "Country not listed?",
      notListedDesc: "Contact our team for special assessment",
      contactUs: "Contact Us",
      chatWithUs: "Chat with AI"
    },
    id: {
      title: "Pilih Negara Tempat Anda Bekerja",
      subtitle: "Kelayakan KPR berbeda per negara berdasarkan perjanjian perbankan bilateral",
      tier1: "Negara Prioritas",
      tier1Desc: "Perjanjian bilateral kuat, proses lebih cepat",
      tier2: "Negara Standar",
      tier2Desc: "Waktu proses standar",
      all: "Semua Negara",
      minStay: "Min. tinggal",
      months: "bulan",
      workPermit: "Izin kerja diperlukan",
      selectCountry: "Klik untuk memilih",
      selected: "Terpilih",
      notListed: "Negara tidak terdaftar?",
      notListedDesc: "Hubungi tim kami untuk penilaian khusus",
      contactUs: "Hubungi Kami",
      chatWithUs: "Chat dengan AI"
    }
  };

  const t = copy[language];
  
  const filteredCountries = filter === 'all' 
    ? ELIGIBLE_COUNTRIES 
    : ELIGIBLE_COUNTRIES.filter(c => c.tier === filter);

  const tier1Countries = ELIGIBLE_COUNTRIES.filter(c => c.tier === 1);
  const tier2Countries = ELIGIBLE_COUNTRIES.filter(c => c.tier === 2);

  return (
    <Card className={cn("border border-primary/10 bg-transparent dark:bg-white/5 backdrop-blur-xl shadow-sm", className)}>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-primary/20 flex items-center justify-center">
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
          </div>
          {t.title}
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3">
        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
              filter === 'all' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {t.all}
          </button>
          <button
            onClick={() => setFilter(1)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0",
              filter === 1 
                ? "bg-green-500 text-white" 
                : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
            )}
          >
            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {t.tier1}
          </button>
          <button
            onClick={() => setFilter(2)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
              filter === 2 
                ? "bg-blue-500 text-white" 
                : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
            )}
          >
            {t.tier2}
          </button>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2">
          {filteredCountries.map((country, idx) => {
            const isSelected = selectedCountry === country.code;
            return (
              <motion.button
                key={country.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => onSelect(country.code)}
                className={cn(
                  "relative p-2 sm:p-2.5 rounded-lg border transition-all text-left",
                  "hover:shadow-md hover:border-primary/50 active:scale-95",
                  isSelected 
                    ? "bg-primary/10 border-primary ring-2 ring-primary/30" 
                    : "bg-background/80 border-border/50"
                )}
              >
                <div className="flex items-start justify-between mb-0.5">
                  <span className="text-lg sm:text-xl">{country.flag}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                  {!isSelected && country.tier === 1 && (
                    <Badge className="text-[7px] px-1 py-0 bg-green-500/20 text-green-600 border-0 hidden sm:inline-flex">
                      ★
                    </Badge>
                  )}
                </div>
                <p className="text-[9px] sm:text-[10px] font-semibold text-foreground truncate leading-tight">
                  {language === 'id' ? country.nameId : country.name}
                </p>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground truncate">
                  {country.minStay}+ {t.months}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Country Not Listed */}
        <CountryNotListedCTA 
          notListed={t.notListed}
          notListedDesc={t.notListedDesc}
          contactUs={t.contactUs}
          chatWithUs={t.chatWithUs}
        />
      </CardContent>
    </Card>
  );
};

export const getCountryByCode = (code: string) => {
  return ELIGIBLE_COUNTRIES.find(c => c.code === code);
};

export const ELIGIBLE_COUNTRIES_LIST = ELIGIBLE_COUNTRIES;

export default EligibleCountriesSelector;

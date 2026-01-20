import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Globe, CheckCircle, Star, TrendingUp, Shield, Users, Building2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Country {
  code: string;
  name: string;
  nameId: string;
  flag: string;
  tier: 'platinum' | 'gold' | 'silver';
  investorCount: string;
  benefits: string[];
  processingDays: number;
  treatyStatus: string;
}

const countries: Country[] = [
  // Platinum Tier - Major investment sources
  { code: 'SG', name: 'Singapore', nameId: 'Singapura', flag: '🇸🇬', tier: 'platinum', investorCount: '15,000+', benefits: ['Fast-track visa', 'Tax treaty', 'Banking ease'], processingDays: 14, treatyStatus: 'Full Treaty' },
  { code: 'AU', name: 'Australia', nameId: 'Australia', flag: '🇦🇺', tier: 'platinum', investorCount: '12,000+', benefits: ['Property rights', 'Legal support', 'Retirement visa'], processingDays: 21, treatyStatus: 'Full Treaty' },
  { code: 'JP', name: 'Japan', nameId: 'Jepang', flag: '🇯🇵', tier: 'platinum', investorCount: '10,000+', benefits: ['Business visa', 'Tax incentives', 'Cultural exchange'], processingDays: 18, treatyStatus: 'Full Treaty' },
  { code: 'CN', name: 'China', nameId: 'Tiongkok', flag: '🇨🇳', tier: 'platinum', investorCount: '25,000+', benefits: ['Investment visa', 'Business support', 'Large community'], processingDays: 21, treatyStatus: 'Full Treaty' },
  { code: 'US', name: 'United States', nameId: 'Amerika Serikat', flag: '🇺🇸', tier: 'platinum', investorCount: '8,000+', benefits: ['Dollar investment', 'Legal framework', 'Retirement haven'], processingDays: 28, treatyStatus: 'Partial Treaty' },
  
  // Gold Tier - Strong investment presence
  { code: 'MY', name: 'Malaysia', nameId: 'Malaysia', flag: '🇲🇾', tier: 'gold', investorCount: '7,500+', benefits: ['Cultural familiarity', 'Easy banking', 'Short flights'], processingDays: 10, treatyStatus: 'Full Treaty' },
  { code: 'KR', name: 'South Korea', nameId: 'Korea Selatan', flag: '🇰🇷', tier: 'gold', investorCount: '6,000+', benefits: ['K-Wave access', 'Tech investors', 'Tourism hub'], processingDays: 18, treatyStatus: 'Full Treaty' },
  { code: 'GB', name: 'United Kingdom', nameId: 'Inggris', flag: '🇬🇧', tier: 'gold', investorCount: '5,500+', benefits: ['Colonial history', 'Legal expertise', 'Pound strength'], processingDays: 25, treatyStatus: 'Full Treaty' },
  { code: 'DE', name: 'Germany', nameId: 'Jerman', flag: '🇩🇪', tier: 'gold', investorCount: '4,000+', benefits: ['EU gateway', 'Engineering sector', 'Precision investors'], processingDays: 25, treatyStatus: 'Full Treaty' },
  { code: 'NL', name: 'Netherlands', nameId: 'Belanda', flag: '🇳🇱', tier: 'gold', investorCount: '3,500+', benefits: ['Historical ties', 'Tax efficiency', 'Trading expertise'], processingDays: 22, treatyStatus: 'Full Treaty' },
  { code: 'HK', name: 'Hong Kong', nameId: 'Hong Kong', flag: '🇭🇰', tier: 'gold', investorCount: '5,000+', benefits: ['Financial hub', 'No forex issues', 'Business network'], processingDays: 14, treatyStatus: 'Partial Treaty' },
  
  // Silver Tier - Growing markets
  { code: 'IN', name: 'India', nameId: 'India', flag: '🇮🇳', tier: 'silver', investorCount: '3,000+', benefits: ['IT sector', 'Growing wealth', 'Bali connection'], processingDays: 21, treatyStatus: 'Full Treaty' },
  { code: 'TW', name: 'Taiwan', nameId: 'Taiwan', flag: '🇹🇼', tier: 'silver', investorCount: '2,500+', benefits: ['Tech investors', 'Quality focus', 'Long-term stays'], processingDays: 18, treatyStatus: 'Partial Treaty' },
  { code: 'AE', name: 'UAE', nameId: 'Uni Emirat Arab', flag: '🇦🇪', tier: 'silver', investorCount: '2,000+', benefits: ['Gulf wealth', 'Islamic finance', 'Halal tourism'], processingDays: 21, treatyStatus: 'Full Treaty' },
  { code: 'FR', name: 'France', nameId: 'Prancis', flag: '🇫🇷', tier: 'silver', investorCount: '2,200+', benefits: ['EU investors', 'Cultural tourism', 'Luxury market'], processingDays: 25, treatyStatus: 'Full Treaty' },
  { code: 'RU', name: 'Russia', nameId: 'Rusia', flag: '🇷🇺', tier: 'silver', investorCount: '4,000+', benefits: ['Bali focused', 'Long-term stays', 'Property interest'], processingDays: 28, treatyStatus: 'Partial Treaty' },
  { code: 'TH', name: 'Thailand', nameId: 'Thailand', flag: '🇹🇭', tier: 'silver', investorCount: '1,500+', benefits: ['Regional hub', 'Easy travel', 'Similar culture'], processingDays: 10, treatyStatus: 'Full Treaty' },
  { code: 'NZ', name: 'New Zealand', nameId: 'Selandia Baru', flag: '🇳🇿', tier: 'silver', investorCount: '1,800+', benefits: ['Retirement haven', 'Clean investment', 'Timezone proximity'], processingDays: 21, treatyStatus: 'Full Treaty' },
];

interface WelcomingCountriesListProps {
  selectedCountry: string | null;
  onSelect: (code: string) => void;
}

const WelcomingCountriesList: React.FC<WelcomingCountriesListProps> = ({ selectedCountry, onSelect }) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const copy = {
    en: {
      title: "Top Investment Source Countries",
      subtitle: "Countries with active foreign investor communities in Indonesia",
      search: "Search country...",
      platinum: "Platinum",
      gold: "Gold",
      silver: "Silver",
      investors: "investors",
      days: "days processing",
      benefits: "Key Benefits",
      selected: "Selected"
    },
    id: {
      title: "Negara Sumber Investasi Utama",
      subtitle: "Negara dengan komunitas investor asing aktif di Indonesia",
      search: "Cari negara...",
      platinum: "Platinum",
      gold: "Gold",
      silver: "Silver",
      investors: "investor",
      days: "hari proses",
      benefits: "Manfaat Utama",
      selected: "Dipilih"
    }
  };

  const t = copy[language];

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         country.nameId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = !selectedTier || country.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const tierColors = {
    platinum: 'from-slate-500 to-slate-700 border-slate-500/50 text-white',
    gold: 'from-orange-500 to-orange-700 border-orange-500/50 text-white',
    silver: 'from-gray-400 to-gray-600 border-gray-500/50 text-white'
  };

  const tierBgColors = {
    platinum: 'bg-slate-200 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300',
    gold: 'bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
    silver: 'bg-gray-200 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300'
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Globe className="h-4 w-4 text-accent" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.search}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {(['platinum', 'gold', 'silver'] as const).map((tier) => (
            <Badge
              key={tier}
              variant={selectedTier === tier ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer text-[8px] sm:text-[9px] px-2 py-0.5 capitalize transition-all active:scale-95",
                selectedTier === tier && tierBgColors[tier]
              )}
              onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
            >
              {t[tier]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredCountries.map((country, idx) => (
          <motion.div
            key={country.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => onSelect(country.code)}
            className={cn(
              "relative p-2.5 rounded-lg cursor-pointer transition-all duration-200",
              "bg-white/70 dark:bg-white/5 border-2",
              selectedCountry === country.code
                ? "border-accent shadow-md shadow-accent/20"
                : "border-border/50 hover:border-accent/40",
              "active:scale-[0.98]"
            )}
          >
            {/* Tier Badge */}
            <div className="absolute top-1.5 right-1.5">
              <Badge className={cn(
                "text-[7px] px-1.5 py-0 capitalize bg-gradient-to-r",
                tierColors[country.tier]
              )}>
                {country.tier}
              </Badge>
            </div>

            {/* Country Info */}
            <div className="flex items-start gap-2">
              <span className="text-xl">{country.flag}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] sm:text-xs font-bold text-foreground truncate pr-12">
                  {language === 'id' ? country.nameId : country.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-[8px] text-foreground/70">
                    <Users className="h-2.5 w-2.5" />
                    {country.investorCount} {t.investors}
                  </span>
                  <span className="flex items-center gap-0.5 text-[8px] text-green-600">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {country.processingDays} {t.days}
                  </span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-2 flex flex-wrap gap-1">
              {country.benefits.map((benefit, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 text-[7px] sm:text-[8px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold"
                >
                  <CheckCircle className="h-2 w-2" />
                  {benefit}
                </span>
              ))}
            </div>

            {/* Treaty Status */}
            <div className="mt-1.5 flex items-center gap-1">
              <Shield className="h-2.5 w-2.5 text-blue-500" />
              <span className="text-[7px] text-blue-700 dark:text-blue-400 font-medium">{country.treatyStatus}</span>
            </div>

            {/* Selected indicator */}
            {selectedCountry === country.code && (
              <div className="absolute bottom-1.5 right-1.5">
                <Badge variant="default" className="text-[7px] px-1.5 py-0 bg-accent">
                  <CheckCircle className="h-2 w-2 mr-0.5" />
                  {t.selected}
                </Badge>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="text-center p-2 rounded-lg bg-slate-200 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700">
          <Star className="h-3 w-3 mx-auto text-slate-600 dark:text-slate-400 mb-0.5" />
          <p className="text-[9px] font-semibold text-slate-700 dark:text-slate-400">{t.platinum}</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-300">{countries.filter(c => c.tier === 'platinum').length}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-orange-200 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-700">
          <Star className="h-3 w-3 mx-auto text-orange-600 dark:text-orange-400 mb-0.5" />
          <p className="text-[9px] font-semibold text-orange-700 dark:text-orange-400">{t.gold}</p>
          <p className="text-xs font-bold text-orange-800 dark:text-orange-300">{countries.filter(c => c.tier === 'gold').length}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-200 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600">
          <Star className="h-3 w-3 mx-auto text-gray-600 dark:text-gray-400 mb-0.5" />
          <p className="text-[9px] font-semibold text-gray-700 dark:text-gray-400">{t.silver}</p>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-300">{countries.filter(c => c.tier === 'silver').length}</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomingCountriesList;

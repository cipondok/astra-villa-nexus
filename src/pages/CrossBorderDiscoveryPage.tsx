import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/SEOHead';
import { useCurrency, type CurrencyCode } from '@/contexts/CurrencyContext';
import { useGlobalMarketIntelligence, type GlobalMarket } from '@/hooks/useGlobalMarketIntelligence';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Globe, TrendingUp, Building2, Shield, MapPin, DollarSign, ArrowUpRight,
  ArrowDownRight, Minus, Scale, FileText, Phone, Landmark, Users, Sparkles,
  ChevronRight, BarChart3, Target, CheckCircle2, AlertTriangle, Search,
  Plane, Briefcase, HeartHandshake, BookOpen, Send, Eye, ExternalLink,
  RefreshCw, Star, Banknote, Home, Loader2, ArrowLeft, Zap, Filter,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Cell, Legend, PieChart, Pie,
} from 'recharts';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const CHART_TOOLTIP = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 10,
    fontSize: 11,
    color: 'hsl(var(--popover-foreground))',
  },
};

const COUNTRIES = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia', currency: 'IDR' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Southeast Asia', currency: 'THB' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia', currency: 'MYR' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Southeast Asia', currency: 'VND' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Southeast Asia', currency: 'PHP' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Southeast Asia', currency: 'SGD' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania', currency: 'AUD' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'East Asia', currency: 'JPY' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', region: 'Middle East', currency: 'AED' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europe', currency: 'EUR' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', currency: 'EUR' },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', currency: 'USD' },
];

const LEGAL_GUIDES: Record<string, {
  foreignOwnership: string; visaProgram: string; taxRate: string;
  process: string[]; financing: string;
  keyRisks: string[]; recommendedDueDiligence: string[];
  consultationTypes: { title: string; desc: string; icon: React.ReactNode }[];
}> = {
  ID: {
    foreignOwnership: 'Right of Use (Hak Pakai) — 80-year leasehold for foreigners. Freehold (SHM) restricted to Indonesian citizens.',
    visaProgram: 'Second Home Visa / KITAS Investor',
    taxRate: '2.5% PPh transfer tax + 5% BPHTB acquisition tax + 10% luxury tax on select properties',
    process: ['Select property & verify certificate (SHM/SHGB)', 'Notary verification via PPAT', 'Hak Pakai title registration at BPN', 'Tax payment & ownership transfer'],
    financing: 'Limited — cash purchase strongly recommended for foreign buyers',
    keyRisks: ['Leasehold expiry risk on Hak Pakai titles', 'Nominee arrangement legal grey areas', 'Certificate authenticity verification required', 'Foreign quota restrictions in certain areas'],
    recommendedDueDiligence: ['BPN certificate authenticity check', 'PPAT notary land history verification', 'Tax clearance confirmation', 'Zoning & building permit (IMB) validation'],
    consultationTypes: [
      { title: 'Hak Pakai Title Advisory', desc: 'Navigate leasehold registration, extension rights, and conversion pathways', icon: <FileText className="h-4 w-4" /> },
      { title: 'Tax Structuring', desc: 'Optimize PPh, BPHTB, and luxury tax obligations for foreign investors', icon: <DollarSign className="h-4 w-4" /> },
      { title: 'PT PMA Setup', desc: 'Establish foreign-owned company (PT PMA) for property investment vehicle', icon: <Building2 className="h-4 w-4" /> },
    ],
  },
  TH: {
    foreignOwnership: 'Condo freehold (max 49% foreign quota per building). Land purchase requires Thai company structure.',
    visaProgram: 'Thailand Elite Visa (5-20 year residency)',
    taxRate: '1-3% transfer fee + 0.5% stamp duty + 3.3% specific business tax (if sold within 5 years)',
    process: ['Reserve unit with deposit (1-5%)', 'Due diligence & title search at Land Office', 'Sale agreement signing', 'Transfer registration at Land Department'],
    financing: 'Some banks offer to foreigners at 4-6% — UOB, Bangkok Bank',
    keyRisks: ['49% foreign quota can be full in popular buildings', 'Company structures for land carry legal risk', 'Rental income tax for non-residents'],
    recommendedDueDiligence: ['Chanote title deed verification', 'Foreign quota ratio check', 'Developer track record assessment', 'EIA (Environmental Impact) clearance'],
    consultationTypes: [
      { title: 'Condo Foreign Quota Check', desc: 'Verify available foreign ownership quota before purchase commitment', icon: <Building2 className="h-4 w-4" /> },
      { title: 'Thai Company Setup', desc: 'BOI-registered or standard company for land acquisition', icon: <Briefcase className="h-4 w-4" /> },
    ],
  },
  MY: {
    foreignOwnership: 'Freehold above MM2H threshold (varies by state, typically MYR 1M+)',
    visaProgram: 'MM2H (Malaysia My 2nd Home)',
    taxRate: '1-4% stamp duty + RPGT (Real Property Gains Tax)',
    process: ['State authority consent application', 'Sale & purchase agreement', 'Stamp duty payment', 'Title transfer'],
    financing: 'Up to 70% LTV for foreigners',
    keyRisks: ['Minimum price thresholds vary by state', 'State consent delays possible', 'RPGT on gains within 5 years'],
    recommendedDueDiligence: ['State minimum price compliance', 'Strata title verification', 'Developer license check', 'RPGT exposure calculation'],
    consultationTypes: [
      { title: 'MM2H Application', desc: 'Full visa application support including fixed deposit requirements', icon: <Plane className="h-4 w-4" /> },
      { title: 'State Consent Advisory', desc: 'Navigate state-specific foreign ownership approval processes', icon: <Scale className="h-4 w-4" /> },
    ],
  },
  VN: {
    foreignOwnership: '50-year leasehold for foreigners (renewable once)',
    visaProgram: 'Business Visa / Investment Certificate',
    taxRate: '2% registration tax + 0.5% stamp duty',
    process: ['Verify developer license & project approval', 'Sign purchase contract (SPA)', 'Notarize at local office', 'Pink Book (certificate of ownership) issuance'],
    financing: 'Very limited for foreigners — cash purchase recommended',
    keyRisks: ['50-year ownership cap', 'Limited resale market for foreign-held units', 'Developer project approval verification critical'],
    recommendedDueDiligence: ['Developer project license verification', 'Pink Book eligibility confirmation', 'Construction quality inspection'],
    consultationTypes: [
      { title: 'Pink Book Advisory', desc: 'Ensure property qualifies for foreign ownership certificate', icon: <FileText className="h-4 w-4" /> },
    ],
  },
  PH: {
    foreignOwnership: 'Condo only (max 40% foreign ownership per building)',
    visaProgram: 'SRRV (Special Resident Retiree Visa)',
    taxRate: '1.5% transfer tax + 6% capital gains tax',
    process: ['Letter of intent & reservation', 'Contract to sell signing', 'Deed of absolute sale', 'Title transfer at Registry of Deeds'],
    financing: 'Available at 5-8% for qualified foreign buyers',
    keyRisks: ['40% foreign cap in condominiums', 'No direct land ownership for foreigners', 'Capital gains tax on disposal'],
    recommendedDueDiligence: ['CCT (Condominium Certificate of Title) check', 'Developer HLURB license', 'Tax declaration verification'],
    consultationTypes: [
      { title: 'SRRV Visa Processing', desc: 'Residency visa with property investment pathway', icon: <Plane className="h-4 w-4" /> },
    ],
  },
  SG: {
    foreignOwnership: 'Condo freehold (20% ABSD surcharge for foreigners)',
    visaProgram: 'Employment Pass / Global Investor Programme',
    taxRate: '20% ABSD + 1-4% BSD (Buyer Stamp Duty)',
    process: ['Option to Purchase (OTP)', 'Exercise option within 14 days', 'Completion (8-12 weeks)', 'Stamp duty payment to IRAS'],
    financing: 'Up to 75% LTV from local banks (DBS, OCBC, UOB)',
    keyRisks: ['Very high ABSD for foreigners (20%)', 'Cooling measures frequently updated', 'High entry price point'],
    recommendedDueDiligence: ['URA Master Plan zoning check', 'Lease decay analysis (for leasehold)', 'En-bloc potential assessment'],
    consultationTypes: [
      { title: 'ABSD Optimization', desc: 'Strategies to minimize additional buyer stamp duty exposure', icon: <DollarSign className="h-4 w-4" /> },
      { title: 'GIP Advisory', desc: 'Global Investor Programme pathway through property investment', icon: <Globe className="h-4 w-4" /> },
    ],
  },
  AU: {
    foreignOwnership: 'New property only (requires FIRB approval)',
    visaProgram: 'Significant Investor Visa (subclass 188)',
    taxRate: 'Stamp duty varies by state (2-7%) + foreign surcharge (7-8%)',
    process: ['FIRB application & approval', 'Contract exchange with 10% deposit', 'Settlement period (6-12 weeks)', 'Title registration at Land Registry'],
    financing: 'Limited to 60-70% LTV for foreign buyers',
    keyRisks: ['New property only restriction', 'FIRB approval required before purchase', 'State-level foreign surcharges', 'Vacancy fees if property left empty'],
    recommendedDueDiligence: ['FIRB application timeline planning', 'State surcharge calculation', 'Rental yield vs vacancy fee analysis'],
    consultationTypes: [
      { title: 'FIRB Application', desc: 'Foreign Investment Review Board approval processing', icon: <Shield className="h-4 w-4" /> },
    ],
  },
  JP: {
    foreignOwnership: 'Freehold — no restrictions on foreign ownership',
    visaProgram: 'Business Manager Visa',
    taxRate: '3% acquisition tax + 1.4% annual property tax + 0.3% city planning tax',
    process: ['Property search via agent', 'Sign purchase agreement (baibai keiyaku)', 'Payment at settlement', 'Register at Legal Affairs Bureau'],
    financing: 'Available at 1-3% with residency from Shinsei, SMBC',
    keyRisks: ['Aging population in rural areas', 'Natural disaster risk (earthquake, typhoon)', 'Language barriers in legal processes'],
    recommendedDueDiligence: ['Earthquake resistance certification', 'Building inspection (kensa)', 'Rental demand verification by ward'],
    consultationTypes: [
      { title: 'KK Company Setup', desc: 'Establish Japanese corporation (Kabushiki Kaisha) for property holding', icon: <Building2 className="h-4 w-4" /> },
    ],
  },
  AE: {
    foreignOwnership: 'Freehold in designated zones (Dubai, Abu Dhabi freehold areas)',
    visaProgram: 'Golden Visa (AED 2M+ property investment)',
    taxRate: '4% DLD (Dubai Land Department) registration fee — no annual property tax',
    process: ['Select freehold-zone property', 'Sign MOU & pay 10% deposit', 'NOC from developer', 'DLD transfer & title deed'],
    financing: 'Up to 75% LTV at 3-5% from Emirates NBD, ADCB',
    keyRisks: ['Freehold zones only — verify before purchase', 'Service charge escalation', 'Oversupply in certain developments'],
    recommendedDueDiligence: ['Freehold zone verification', 'Developer RERA registration', 'Service charge history review'],
    consultationTypes: [
      { title: 'Golden Visa Processing', desc: 'Property-linked 10-year residency visa pathway', icon: <Star className="h-4 w-4" /> },
      { title: 'Freehold Zone Advisory', desc: 'Identify approved freehold zones and high-yield areas', icon: <MapPin className="h-4 w-4" /> },
    ],
  },
  PT: {
    foreignOwnership: 'Freehold — no restrictions on foreign ownership',
    visaProgram: 'Golden Visa (via fund investment — direct property no longer qualifying)',
    taxRate: '6-8% IMT (transfer tax) + 0.8% stamp duty + annual IMI (0.3-0.8%)',
    process: ['Obtain NIF (tax identification number)', 'Sign promissory contract (CPCV)', 'Due diligence & final deed (escritura)', 'Land registry (registo predial)'],
    financing: 'Up to 70% LTV at 3-5% from Millennium BCP, CGD',
    keyRisks: ['Golden Visa no longer applies to direct property', 'AL (short-term rental) license restrictions tightening', 'IMI annual tax obligations'],
    recommendedDueDiligence: ['Certidão predial (land registry certificate)', 'Habitation license (licença de habitação)', 'Energy certificate (certificado energético)'],
    consultationTypes: [
      { title: 'NIF & Tax Registration', desc: 'Portuguese tax number registration for foreign buyers', icon: <FileText className="h-4 w-4" /> },
      { title: 'AL Rental License', desc: 'Short-term rental (Alojamento Local) registration in approved zones', icon: <Home className="h-4 w-4" /> },
    ],
  },
  ES: {
    foreignOwnership: 'Freehold — no restrictions on foreign ownership',
    visaProgram: 'Golden Visa (€500K+ property investment)',
    taxRate: '6-10% transfer tax (ITP) + 1.5% stamp duty (AJD)',
    process: ['Obtain NIE (foreigner ID number)', 'Reservation agreement & deposit', 'Notarized purchase deed (escritura pública)', 'Land registry filing (Registro de la Propiedad)'],
    financing: 'Up to 70% LTV at 2-4% from Santander, CaixaBank',
    keyRisks: ['ITP varies significantly by autonomous community', 'Urban planning permit risks in coastal areas', 'Rental regulation differences by region'],
    recommendedDueDiligence: ['Nota simple (land registry extract)', 'Urban planning certificate (cédula urbanística)', 'Community fee history review'],
    consultationTypes: [
      { title: 'Golden Visa Application', desc: '€500K property investment pathway to EU residency', icon: <Star className="h-4 w-4" /> },
      { title: 'NIE Registration', desc: 'Foreign identification number required for all property transactions', icon: <FileText className="h-4 w-4" /> },
    ],
  },
  US: {
    foreignOwnership: 'Freehold — no restrictions on foreign ownership',
    visaProgram: 'EB-5 Investor Visa ($800K-$1.05M investment)',
    taxRate: 'Varies by state — 0.5-5% closing costs + annual property tax (0.5-2.5%)',
    process: ['Make offer through licensed agent', 'Home inspection & appraisal', 'Escrow & title insurance', 'Closing & deed transfer'],
    financing: 'Available at 6-8% for foreign nationals through specialized lenders',
    keyRisks: ['State-specific tax variations', 'FIRPTA withholding on sale (15% of gross)', 'Property management from abroad', 'HOA rules and restrictions'],
    recommendedDueDiligence: ['Title search & insurance', 'Property inspection (structural, pest)', 'HOA financial health review', 'FIRPTA tax planning'],
    consultationTypes: [
      { title: 'EB-5 Pathway', desc: 'Investment immigration visa through qualified property or regional center', icon: <Plane className="h-4 w-4" /> },
      { title: 'FIRPTA Tax Planning', desc: 'Minimize 15% withholding on future property sale proceeds', icon: <DollarSign className="h-4 w-4" /> },
    ],
  },
};

const MARKET_METRICS: Record<string, { yield: number; growth: number; entry: number; risk: number; demand: number; liquidity: number }> = {
  ID: { yield: 7.2, growth: 8.5, entry: 85, risk: 35, demand: 78, liquidity: 55 },
  TH: { yield: 5.8, growth: 6.2, entry: 70, risk: 30, demand: 72, liquidity: 65 },
  MY: { yield: 5.1, growth: 4.8, entry: 65, risk: 25, demand: 60, liquidity: 70 },
  VN: { yield: 6.5, growth: 9.1, entry: 90, risk: 45, demand: 80, liquidity: 40 },
  PH: { yield: 6.8, growth: 7.3, entry: 80, risk: 40, demand: 75, liquidity: 50 },
  SG: { yield: 3.2, growth: 3.5, entry: 20, risk: 10, demand: 85, liquidity: 95 },
  AU: { yield: 3.8, growth: 4.2, entry: 30, risk: 15, demand: 70, liquidity: 90 },
  JP: { yield: 4.5, growth: 3.0, entry: 40, risk: 12, demand: 65, liquidity: 88 },
  AE: { yield: 6.0, growth: 7.8, entry: 50, risk: 20, demand: 82, liquidity: 80 },
  PT: { yield: 4.8, growth: 5.5, entry: 45, risk: 18, demand: 68, liquidity: 75 },
  ES: { yield: 4.2, growth: 5.0, entry: 42, risk: 16, demand: 66, liquidity: 78 },
  US: { yield: 4.0, growth: 4.5, entry: 35, risk: 14, demand: 72, liquidity: 92 },
};

const riskColor = (r: number) => r >= 40 ? 'text-destructive' : r >= 25 ? 'text-chart-3' : 'text-chart-1';
const riskLabel = (r: number) => r >= 40 ? 'High' : r >= 25 ? 'Moderate' : 'Low';

const GrowthArrow = ({ v }: { v: number }) =>
  v > 5 ? <ArrowUpRight className="h-4 w-4 text-chart-1" /> :
  v > 0 ? <TrendingUp className="h-4 w-4 text-primary" /> :
  <ArrowDownRight className="h-4 w-4 text-destructive" />;

const fmtB = (n: number) => {
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(0)}jt`;
  return n.toLocaleString('id-ID');
};

/* ══════════════════════════════════════════════════════════════
   CURRENCY NORMALIZATION BAR
   ══════════════════════════════════════════════════════════════ */
const CurrencyBar: React.FC = () => {
  const { currency, setCurrency, rates, ratesLoading, ratesSource } = useCurrency();
  const currencies: CurrencyCode[] = ['IDR', 'USD', 'SGD', 'AUD'];
  const labels: Record<string, string> = { IDR: '🇮🇩 IDR', USD: '🇺🇸 USD', SGD: '🇸🇬 SGD', AUD: '🇦🇺 AUD' };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
      <Banknote className="h-4 w-4 text-primary shrink-0" />
      <span className="text-xs text-muted-foreground shrink-0">Display currency:</span>
      <div className="flex items-center gap-1.5">
        {currencies.map(c => (
          <Button
            key={c}
            variant={currency === c ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => setCurrency(c)}
          >
            {labels[c]}
          </Button>
        ))}
      </div>
      {ratesLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />}
      <span className="text-[10px] text-muted-foreground ml-auto">
        {ratesSource === 'live' ? '● Live rates' : '○ Cached rates'}
      </span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   INTERNATIONAL OPPORTUNITY FEED
   ══════════════════════════════════════════════════════════════ */
const useGlobalAppealListings = () => {
  return useQuery({
    queryKey: ['global-appeal-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, state, price, property_type, investment_score, demand_heat_score, thumbnail_url, bedrooms, bathrooms, area_sqm')
        .eq('status', 'active')
        .gte('investment_score', 60)
        .order('investment_score', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60_000,
  });
};

const OpportunityFeed: React.FC = () => {
  const { data: listings, isLoading } = useGlobalAppealListings();
  const { formatPrice, currency } = useCurrency();
  const [sortBy, setSortBy] = useState<'score' | 'price_asc' | 'price_desc'>('score');

  const sorted = useMemo(() => {
    if (!listings) return [];
    const copy = [...listings];
    if (sortBy === 'price_asc') copy.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') copy.sort((a, b) => b.price - a.price);
    else copy.sort((a, b) => (b.investment_score || 0) - (a.investment_score || 0));
    return copy;
  }, [listings, sortBy]);

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            International Opportunity Feed
          </h2>
          <p className="text-sm text-muted-foreground">AI-curated listings with strong global investor appeal · Prices in {currency}</p>
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">By Score</SelectItem>
            <SelectItem value="price_asc">Price: Low → High</SelectItem>
            <SelectItem value="price_desc">Price: High → Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((p, i) => {
          const score = p.investment_score || 0;
          const heat = p.demand_heat_score || 0;
          const grade = score >= 85 ? 'Elite' : score >= 70 ? 'Strong' : 'Growth';
          const gradeColor = score >= 85 ? 'bg-chart-1/10 text-chart-1 border-chart-1/20' : score >= 70 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-chart-4/10 text-chart-4 border-chart-4/20';

          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-all group overflow-hidden h-full flex flex-col">
                {/* Image */}
                <div className="relative h-40 bg-muted overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <Badge variant="outline" className={`absolute top-2 right-2 text-[10px] font-bold backdrop-blur-sm ${gradeColor}`}>
                    {grade}
                  </Badge>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-sm border-border/50">
                      <Target className="h-3 w-3 mr-0.5 text-primary" /> {score}
                    </Badge>
                    {heat >= 65 && (
                      <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-sm border-chart-1/30 text-chart-1">
                        <Zap className="h-3 w-3 mr-0.5" /> Hot
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="pt-3 pb-4 px-4 flex-1 flex flex-col">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {p.city}{p.state ? `, ${p.state}` : ''} · {p.property_type}
                  </p>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Price ({currency})</p>
                      <p className="text-base font-bold text-foreground">{formatPrice(p.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">
                        {p.bedrooms && `${p.bedrooms} BR`}{p.bathrooms ? ` · ${p.bathrooms} BA` : ''}{p.area_sqm ? ` · ${p.area_sqm}m²` : ''}
                      </p>
                    </div>
                  </div>

                  <Link to={`/properties/${p.id}`} className="mt-3">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Eye className="h-3 w-3 mr-1.5" /> View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   COUNTRY CARD
   ══════════════════════════════════════════════════════════════ */
const CountryCard = ({ c, selected, onSelect }: { c: typeof COUNTRIES[0]; selected: boolean; onSelect: () => void }) => {
  const m = MARKET_METRICS[c.code];
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`cursor-pointer transition-all border-2 ${selected ? 'border-primary shadow-lg shadow-primary/10' : 'border-transparent hover:border-primary/30'}`}
        onClick={onSelect}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{c.flag}</span>
              <div>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.region}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">{riskLabel(m.risk)}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Yield</p>
              <p className="text-sm font-bold text-primary">{m.yield}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Growth</p>
              <div className="flex items-center justify-center gap-0.5">
                <p className="text-sm font-bold">{m.growth}%</p>
                <GrowthArrow v={m.growth} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Demand</p>
              <p className="text-sm font-bold">{m.demand}</p>
            </div>
          </div>
          <Progress value={m.liquidity} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground text-right">Liquidity: {m.liquidity}/100</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ── Radar Comparison ── */
const ComparisonRadar = ({ countries }: { countries: string[] }) => {
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
  const axes = ['Yield', 'Growth', 'Entry Ease', 'Low Risk', 'Demand', 'Liquidity'];
  const data = axes.map((axis, i) => {
    const row: any = { axis };
    countries.forEach((code) => {
      const m = MARKET_METRICS[code];
      const vals = [m.yield * 10, m.growth * 10, 100 - m.entry, 100 - m.risk, m.demand, m.liquidity];
      row[code] = vals[i];
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        {countries.map((code, i) => (
          <Radar key={code} name={code} dataKey={code} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
        ))}
        <Tooltip {...CHART_TOOLTIP} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

/* ── Yield Comparison Bar Chart ── */
const YieldComparisonChart = ({ countries }: { countries: string[] }) => {
  const data = countries.map(code => {
    const c = COUNTRIES.find(x => x.code === code)!;
    const m = MARKET_METRICS[code];
    return { name: `${c.flag} ${c.code}`, yield: m.yield, growth: m.growth };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip {...CHART_TOOLTIP} />
        <Bar dataKey="yield" name="Rental Yield %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="growth" name="Price Growth %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ══════════════════════════════════════════════════════════════
   ENHANCED LEGAL GUIDE PANEL with Consultation CTAs
   ══════════════════════════════════════════════════════════════ */
const LegalGuidePanel = ({ code }: { code: string }) => {
  const guide = LEGAL_GUIDES[code];
  const country = COUNTRIES.find(c => c.code === code)!;
  if (!guide) return null;

  const requestConsultation = (type: string) => {
    toast.success(`Consultation request for "${type}" submitted. Our cross-border legal team will contact you within 24 hours.`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{country.flag}</span>
        <div>
          <h3 className="text-lg font-bold">{country.name} — Investment Regulatory Guide</h3>
          <p className="text-sm text-muted-foreground">{country.region} · Local currency: {country.currency}</p>
        </div>
      </div>

      {/* Core info cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Foreign Ownership</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm">{guide.foreignOwnership}</p></CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Plane className="h-4 w-4 text-primary" /> Visa Program</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm">{guide.visaProgram}</p></CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Tax & Duties</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm">{guide.taxRate}</p></CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Financing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{guide.financing}</p>
            <Badge variant={guide.financing.toLowerCase().includes('limited') || guide.financing.toLowerCase().includes('cash') ? 'destructive' : 'default'} className="mt-2 text-xs">
              {guide.financing.toLowerCase().includes('limited') || guide.financing.toLowerCase().includes('cash') ? 'Limited' : 'Available'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Process */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Purchase Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {guide.process.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                <p className="text-sm pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Risks & Due Diligence */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Key Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guide.keyRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                  <span className="text-muted-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-chart-1/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-chart-1" /> Recommended Due Diligence</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guide.recommendedDueDiligence.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-chart-1 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Legal Consultation CTAs */}
      <Card className="bg-gradient-to-br from-primary/5 to-chart-4/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Request Legal Consultation
          </CardTitle>
          <CardDescription>Connect with verified legal professionals specializing in {country.name} property law</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {guide.consultationTypes.map((ct, i) => (
              <motion.div key={i} whileHover={{ scale: 1.01 }}>
                <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => requestConsultation(ct.title)}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{ct.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{ct.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ct.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ── Assistance Request Form ── */
const AssistanceRequestForm = ({ selectedCountry }: { selectedCountry: string }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Assistance request submitted! Our cross-border team will contact you within 24 hours.');
      setName(''); setEmail(''); setMessage('');
      setSending(false);
    }, 1200);
  };

  const country = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" />
          Remote Purchase Assistance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get personalized guidance for investing in {country?.name || 'your chosen market'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          <Input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Textarea placeholder="Tell us about your investment goals, budget, and timeline..." value={message} onChange={e => setMessage(e.target.value)} rows={3} required />
          <Button type="submit" className="w-full" disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Submitting...' : 'Request Assistance'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

/* ── Trust Summary Panel ── */
const TrustSummaryPanel = ({ code }: { code: string }) => {
  const m = MARKET_METRICS[code];
  const country = COUNTRIES.find(c => c.code === code)!;
  const { formatPrice, currency } = useCurrency();
  const score = Math.round((m.yield * 8 + m.growth * 6 + (100 - m.risk) * 0.4 + m.demand * 0.3 + m.liquidity * 0.3) / 3);

  // Synthetic entry price based on market metrics
  const entryPriceIDR = Math.round((100 - m.entry) * 50_000_000 + 2_000_000_000);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{country.flag}</span>
            <h3 className="font-bold">{country.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Investment Score</p>
            <p className="text-2xl font-black text-primary">{Math.min(score, 98)}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-chart-1" />
            <span>Rental Yield: <strong>{m.yield}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Price Growth: <strong>{m.growth}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${riskColor(m.risk)}`} />
            <span>Risk: <strong className={riskColor(m.risk)}>{riskLabel(m.risk)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-chart-4" />
            <span>Foreign Demand: <strong>{m.demand}/100</strong></span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-background/50 border border-border/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Est. Entry Price ({currency})</p>
          <p className="text-sm font-bold text-foreground">{formatPrice(entryPriceIDR)}</p>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Market Liquidity</span>
            <span>{m.liquidity}%</span>
          </div>
          <Progress value={m.liquidity} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
const CrossBorderDiscoveryPage = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['ID', 'TH']);
  const [activeTab, setActiveTab] = useState('explore');
  const [focusCountry, setFocusCountry] = useState('ID');
  const [regionFilter, setRegionFilter] = useState('all');

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(code)) return prev.filter(c => c !== code);
      if (prev.length >= 3) { toast.info('Compare up to 3 countries'); return prev; }
      return [...prev, code];
    });
    setFocusCountry(code);
  };

  const filteredCountries = regionFilter === 'all'
    ? COUNTRIES
    : COUNTRIES.filter(c => c.region === regionFilter);

  const regions = [...new Set(COUNTRIES.map(c => c.region))];

  return (
    <>
      <SEOHead
        title="Cross-Border Property Discovery | ASTRA Villa"
        description="Explore international property investment opportunities across 12+ countries with yield comparisons, legal guides, currency conversion, and remote purchase assistance."
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 max-w-3xl mx-auto">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs border-primary/30">
                <Globe className="h-3.5 w-3.5 text-primary" /> Cross-Border Intelligence
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Invest <span className="text-primary">Globally</span>, Decide Locally
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Compare rental yields, legal frameworks, and growth potential across 12 international markets — all from one intelligent platform.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Currency Normalization Bar */}
          <CurrencyBar />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 h-10">
              <TabsTrigger value="explore" className="text-xs gap-1"><Globe className="h-3.5 w-3.5" /> Explore</TabsTrigger>
              <TabsTrigger value="compare" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" /> Compare</TabsTrigger>
              <TabsTrigger value="listings" className="text-xs gap-1"><Sparkles className="h-3.5 w-3.5" /> Listings</TabsTrigger>
              <TabsTrigger value="legal" className="text-xs gap-1"><Scale className="h-3.5 w-3.5" /> Legal</TabsTrigger>
              <TabsTrigger value="assist" className="text-xs gap-1"><Briefcase className="h-3.5 w-3.5" /> Assist</TabsTrigger>
            </TabsList>

            {/* ── EXPLORE TAB ── */}
            <TabsContent value="explore" className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={regionFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setRegionFilter('all')}>All Regions</Badge>
                {regions.map(r => (
                  <Badge key={r} variant={regionFilter === r ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setRegionFilter(r)}>{r}</Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredCountries.map(c => (
                  <CountryCard key={c.code} c={c} selected={selectedCountries.includes(c.code)} onSelect={() => toggleCountry(c.code)} />
                ))}
              </div>

              {selectedCountries.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Quick Summary
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedCountries.map(code => (
                      <TrustSummaryPanel key={code} code={code} />
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* ── COMPARE TAB ── */}
            <TabsContent value="compare" className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground">Comparing:</p>
                {selectedCountries.map(code => {
                  const c = COUNTRIES.find(x => x.code === code)!;
                  return <Badge key={code} className="gap-1">{c.flag} {c.name}</Badge>;
                })}
                {selectedCountries.length < 2 && <p className="text-xs text-muted-foreground italic">Select at least 2 countries from the Explore tab</p>}
              </div>

              {selectedCountries.length >= 2 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Market Profile Radar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ComparisonRadar countries={selectedCountries} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Yield & Growth Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <YieldComparisonChart countries={selectedCountries} />
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Detailed Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Metric</th>
                              {selectedCountries.map(code => {
                                const c = COUNTRIES.find(x => x.code === code)!;
                                return <th key={code} className="text-center py-2 px-3 font-medium">{c.flag} {c.code}</th>;
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: 'Rental Yield', key: 'yield' as const, fmt: (v: number) => `${v}%` },
                              { label: 'Price Growth', key: 'growth' as const, fmt: (v: number) => `${v}%` },
                              { label: 'Entry Barrier', key: 'entry' as const, fmt: (v: number) => `${v}/100` },
                              { label: 'Risk Level', key: 'risk' as const, fmt: (v: number) => riskLabel(v) },
                              { label: 'Foreign Demand', key: 'demand' as const, fmt: (v: number) => `${v}/100` },
                              { label: 'Liquidity', key: 'liquidity' as const, fmt: (v: number) => `${v}/100` },
                            ].map(row => (
                              <tr key={row.label} className="border-b border-border/50">
                                <td className="py-2 px-3 text-muted-foreground">{row.label}</td>
                                {selectedCountries.map(code => (
                                  <td key={code} className="py-2 px-3 text-center font-medium">{row.fmt(MARKET_METRICS[code][row.key])}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ── LISTINGS TAB (NEW) ── */}
            <TabsContent value="listings" className="space-y-6">
              <OpportunityFeed />
            </TabsContent>

            {/* ── LEGAL TAB (ENHANCED) ── */}
            <TabsContent value="legal" className="space-y-6">
              <div className="flex items-center gap-3">
                <Select value={focusCountry} onValueChange={setFocusCountry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Legal, regulatory & due diligence overview</p>
              </div>
              <LegalGuidePanel code={focusCountry} />
            </TabsContent>

            {/* ── ASSIST TAB ── */}
            <TabsContent value="assist" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Investment Support Services
                  </h2>
                  <div className="space-y-3">
                    {[
                      { icon: Scale, title: 'Legal Process Guidance', desc: 'Step-by-step guidance through foreign ownership laws, title verification, and notarization for each country.' },
                      { icon: Landmark, title: 'Financing Consultation', desc: 'Connect with international mortgage brokers and understand LTV ratios, interest rates, and qualification requirements.' },
                      { icon: Phone, title: 'Remote Purchase Assistance', desc: 'End-to-end support for buying property remotely — from due diligence to closing, without traveling.' },
                      { icon: BookOpen, title: 'Tax & Compliance Advisory', desc: 'Understand stamp duty, capital gains, and annual property tax obligations in your target market.' },
                    ].map(item => (
                      <Card key={item.title} className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <AssistanceRequestForm selectedCountry={focusCountry} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CrossBorderDiscoveryPage;

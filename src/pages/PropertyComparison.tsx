import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertyComparison } from '@/contexts/PropertyComparisonContext';
import {
  ArrowLeft, X, Eye, Trash2, Check, Minus,
  Banknote, MapPin, Building, TrendingUp, School, ShoppingBag, HeartPulse, Train,
  Trophy, Sparkles, BarChart3, Scale
} from 'lucide-react';
import ShareComparisonButton from '@/components/property/ShareComparisonButton';
import Price from '@/components/ui/Price';
import { getCurrencyFormatter } from '@/stores/currencyStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend,
} from 'recharts';

// ─── Investment Rate Constants ───────────────────────────────────────
const CITY_RATES: Record<string, number> = {
  'bali': 10, 'seminyak': 12, 'canggu': 14, 'ubud': 9, 'jakarta': 6,
  'bandung': 8, 'surabaya': 7, 'yogyakarta': 9, 'lombok': 12, 'default': 7,
};

const TYPE_YIELDS: Record<string, number> = {
  villa: 8.5, apartment: 6.2, house: 5.5, townhouse: 5.8, land: 0, commercial: 7.5, default: 6,
};

function getInvestmentMetrics(property: any) {
  const cityKey = Object.keys(CITY_RATES).find(k => property.city?.toLowerCase().includes(k)) || 'default';
  const appreciation = CITY_RATES[cityKey];
  const typeKey = property.property_type?.toLowerCase() || 'default';
  const rentalYield = TYPE_YIELDS[typeKey] || TYPE_YIELDS.default;
  const price = property.price || 0;
  const monthlyRental = Math.round(price * (rentalYield / 100) / 12);
  const fiveYearValue = Math.round(price * Math.pow(1 + appreciation / 100, 5));
  const tenYearValue = Math.round(price * Math.pow(1 + appreciation / 100, 10));
  const breakEvenYears = rentalYield > 0 ? Math.round(price / (monthlyRental * 12) * 10) / 10 : 0;
  return { appreciation, rentalYield, monthlyRental, fiveYearValue, tenYearValue, breakEvenYears, price };
}
import { motion, AnimatePresence } from 'framer-motion';

// ─── KPR Calculator Logic ────────────────────────────────────────────
interface KprParams {
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
}

function calculateKpr(price: number, params: KprParams) {
  const dp = price * (params.downPaymentPercent / 100);
  const loan = price - dp;
  const monthlyRate = params.interestRate / 100 / 12;
  const months = params.loanTermYears * 12;
  const monthly = monthlyRate > 0
    ? (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    : loan / months;
  return {
    downPayment: dp,
    loanAmount: loan,
    monthlyPayment: Math.round(monthly),
    totalPayment: Math.round(monthly * months),
    totalInterest: Math.round(monthly * months - loan),
  };
}

// ─── Mock Neighborhood Data ──────────────────────────────────────────
interface NeighborhoodData {
  schools: number;
  hospitals: number;
  shopping: number;
  transit: number;
  restaurants: number;
  safetyScore: number;
  walkScore: number;
  avgRentNearby: number;
}

function getNeighborhoodData(property: any): NeighborhoodData {
  const hash = property.id?.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) || 42;
  return {
    schools: (hash % 8) + 2,
    hospitals: (hash % 4) + 1,
    shopping: (hash % 6) + 3,
    transit: (hash % 5) + 1,
    restaurants: (hash % 15) + 5,
    safetyScore: 60 + (hash % 35),
    walkScore: 40 + (hash % 55),
    avgRentNearby: 5_000_000 + (hash % 20) * 1_000_000,
  };
}

const CHART_COLORS = [
  'hsl(45, 93%, 47%)',   // gold
  'hsl(210, 100%, 56%)', // blue
  'hsl(340, 82%, 52%)',  // pink
  'hsl(142, 71%, 45%)',  // green
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

// ─── Winner Badge ────────────────────────────────────────────────────
const WinnerBadge = ({ label = 'Best' }: { label?: string }) => (
  <Badge className="ml-1.5 text-[10px] px-1.5 py-0 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-0.5">
    <Trophy className="h-2.5 w-2.5" />
    {label}
  </Badge>
);

// ─── Main Component ──────────────────────────────────────────────────
const PropertyComparison = () => {
  const navigate = useNavigate();
  const comparison = usePropertyComparison();

  const [kprParams, setKprParams] = useState<KprParams>({
    downPaymentPercent: 20,
    interestRate: 8.5,
    loanTermYears: 20,
  });

  if (!comparison || comparison.selectedProperties.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div {...fadeUp} className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-400/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Scale className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              No Properties to Compare
            </h1>
            <p className="text-muted-foreground mb-8">
              Add properties to your comparison list to see detailed side-by-side analysis with KPR simulations, neighborhood data, and visual charts.
            </p>
            <Button onClick={() => navigate('/dijual')} className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20">
              <Building className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const { selectedProperties, removeFromComparison, clearComparison } = comparison;

  const getImageUrl = (property: any) => {
    if (property.images?.length) return property.images[0];
    if (property.image_urls?.length) return property.image_urls[0];
    return '/placeholder.svg';
  };

  const prices = selectedProperties.map(p => p.price);
  const areas = selectedProperties.map(p => p.area_sqm || 0).filter(a => a > 0);
  const minPrice = Math.min(...prices);
  const maxArea = areas.length ? Math.max(...areas) : 0;
  const pricePerSqm = (p: typeof selectedProperties[0]) =>
    p.area_sqm && p.area_sqm > 0 ? p.price / p.area_sqm : null;
  const allPricePerSqm = selectedProperties.map(pricePerSqm).filter((v): v is number => v !== null);
  const minPricePerSqm = allPricePerSqm.length ? Math.min(...allPricePerSqm) : null;
  const has3DTour = (p: typeof selectedProperties[0]) => !!(p.three_d_model_url || p.virtual_tour_url);

  // ─── Specs ───
  type SpecRow = { label: string; render: (p: typeof selectedProperties[0]) => React.ReactNode };
  const specs: SpecRow[] = [
    {
      label: 'Price',
      render: (p) => {
        const isLowest = p.price === minPrice && prices.length > 1;
        return (
          <div className="space-y-0.5">
            <span className={`font-bold ${isLowest ? 'text-amber-600 dark:text-amber-400' : ''}`}><Price amount={p.price} /></span>
            {p.listing_type === 'rent' && <span className="text-xs text-muted-foreground">/month</span>}
            {isLowest && <WinnerBadge label="Lowest" />}
          </div>
        );
      },
    },
    { label: 'Location', render: (p) => <span>{p.city || p.state || p.location}</span> },
    { label: 'Property Type', render: (p) => <span className="capitalize">{p.property_type || '—'}</span> },
    {
      label: 'Listing Type',
      render: (p) => (
        <Badge variant={p.listing_type === 'sale' ? 'default' : 'secondary'} className={p.listing_type === 'sale' ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-0' : ''}>
          {p.listing_type === 'sale' ? 'For Sale' : p.listing_type === 'rent' ? 'For Rent' : 'Lease'}
        </Badge>
      ),
    },
    { label: 'Bedrooms', render: (p) => <span>{p.bedrooms ?? '—'}</span> },
    { label: 'Bathrooms', render: (p) => <span>{p.bathrooms ?? '—'}</span> },
    {
      label: 'Area',
      render: (p) => {
        if (!p.area_sqm) return <span>—</span>;
        const isLargest = p.area_sqm === maxArea && areas.length > 1;
        return (
          <div className="space-y-0.5">
            <span className={isLargest ? 'font-bold text-amber-600 dark:text-amber-400' : ''}>{p.area_sqm} m²</span>
            {isLargest && <WinnerBadge label="Largest" />}
          </div>
        );
      },
    },
    {
      label: 'Price / m²',
      render: (p) => {
        const v = pricePerSqm(p);
        if (v === null) return <span>—</span>;
        const isBest = v === minPricePerSqm && allPricePerSqm.length > 1;
        return (
          <div className="space-y-0.5">
            <span className={isBest ? 'font-bold text-amber-600 dark:text-amber-400' : ''}><Price amount={Math.round(v)} /></span>
            {isBest && <WinnerBadge />}
          </div>
        );
      },
    },
    {
      label: '3D Tour',
      render: (p) =>
        has3DTour(p)
          ? <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Available</Badge>
          : <span className="text-muted-foreground">—</span>,
    },
  ];

  // ─── Amenities ───
  const amenityKeys = [
    { key: 'swimming_pool', label: 'Swimming Pool' }, { key: 'pool', label: 'Swimming Pool' },
    { key: 'garage', label: 'Garage' }, { key: 'garden', label: 'Garden' },
    { key: 'parking', label: 'Parking' }, { key: 'security', label: 'Security' },
    { key: 'gym', label: 'Gym / Fitness' }, { key: 'air_conditioning', label: 'Air Conditioning' },
    { key: 'ac', label: 'Air Conditioning' }, { key: 'furnished', label: 'Furnished' },
    { key: 'balcony', label: 'Balcony' }, { key: 'terrace', label: 'Terrace' },
    { key: 'elevator', label: 'Elevator' }, { key: 'cctv', label: 'CCTV' },
    { key: 'playground', label: 'Playground' }, { key: 'clubhouse', label: 'Clubhouse' },
    { key: 'rooftop', label: 'Rooftop' }, { key: 'water_heater', label: 'Water Heater' },
    { key: 'internet', label: 'Internet' }, { key: 'laundry', label: 'Laundry' },
  ];

  const getFeatureValue = (p: typeof selectedProperties[0], key: string) => p.property_features?.[key];

  const seenLabels = new Set<string>();
  const activeAmenities = amenityKeys.filter(({ key, label }) => {
    if (seenLabels.has(label)) return false;
    const hasAny = selectedProperties.some(p => {
      const val = getFeatureValue(p, key);
      return val !== undefined && val !== null && val !== false && val !== '' && val !== 0;
    });
    if (hasAny) seenLabels.add(label);
    return hasAny;
  });

  const predefinedKeys = new Set(amenityKeys.map(a => a.key));
  const extraKeys = new Set<string>();
  selectedProperties.forEach(p => {
    if (p.property_features) {
      Object.keys(p.property_features).forEach(key => {
        if (!predefinedKeys.has(key) && !['bedrooms', 'bathrooms', 'area_sqm', 'parking_spaces'].includes(key)) {
          const val = p.property_features![key];
          if (val !== undefined && val !== null && val !== false && val !== '' && val !== 0) extraKeys.add(key);
        }
      });
    }
  });

  const renderAmenityValue = (value: any) => {
    if (value === undefined || value === null || value === false || value === '' || value === 0) {
      return <Minus className="h-4 w-4 text-muted-foreground/40" />;
    }
    if (value === true) return <Check className="h-4 w-4 text-amber-500" />;
    return <span className="text-sm">{String(value)}</span>;
  };

  // ─── KPR ───
  const kprResults = selectedProperties.map(p => ({
    property: p,
    kpr: calculateKpr(p.price, kprParams),
  }));
  const lowestMonthly = Math.min(...kprResults.map(r => r.kpr.monthlyPayment));

  // ─── Neighborhood ───
  const neighborhoods = selectedProperties.map(p => ({
    property: p,
    data: getNeighborhoodData(p),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Header */}
        <motion.div {...fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-border/50">
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-400/10 border border-amber-500/20 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-amber-500" />
                </div>
                <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                  Property Comparison
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Comparing {selectedProperties.length} properties side by side
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareComparisonButton propertyIds={selectedProperties.map(p => p.id)} />
            <Button variant="destructive" size="sm" onClick={clearComparison}>
              <Trash2 className="h-4 w-4 mr-2" />Clear All
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="specs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-muted/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="specs" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/10 data-[state=active]:to-yellow-400/10 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                <Building className="h-4 w-4" />Specs
              </TabsTrigger>
              <TabsTrigger value="kpr" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/10 data-[state=active]:to-yellow-400/10 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                <Banknote className="h-4 w-4" />KPR
              </TabsTrigger>
              <TabsTrigger value="neighborhood" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/10 data-[state=active]:to-yellow-400/10 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                <MapPin className="h-4 w-4" />Area
              </TabsTrigger>
              <TabsTrigger value="investment" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/10 data-[state=active]:to-yellow-400/10 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                <TrendingUp className="h-4 w-4" />Invest
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/10 data-[state=active]:to-yellow-400/10 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                <BarChart3 className="h-4 w-4" />Charts
              </TabsTrigger>
            </TabsList>

            {/* ═══ SPECS TAB ═══ */}
            <TabsContent value="specs">
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-transparent">
                          <TableHead className="w-[140px] sticky left-0 bg-card z-10 font-semibold text-foreground">Spec</TableHead>
                          {selectedProperties.map((p, i) => (
                            <TableHead key={p.id} className="min-w-[200px]">
                              <div className="space-y-2">
                                <div className="relative group">
                                  <img src={getImageUrl(p)} alt={p.title} className="w-full h-28 object-cover rounded-xl border border-border/50" />
                                  <div className="absolute top-1.5 left-1.5">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                                      {String.fromCharCode(65 + i)}
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromComparison(p.id)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <h3 className="font-semibold text-sm line-clamp-2">{p.title}</h3>
                                <Button variant="outline" size="sm" className="w-full text-xs border-amber-500/20 hover:bg-amber-500/5" onClick={() => navigate(`/properties/${p.id}`)}>
                                  <Eye className="h-3 w-3 mr-1" />View Details
                                </Button>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {specs.map((spec, idx) => (
                          <TableRow key={spec.label} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                            <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10 text-sm">{spec.label}</TableCell>
                            {selectedProperties.map((p) => (
                              <TableCell key={p.id}>{spec.render(p)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                        {(activeAmenities.length > 0 || extraKeys.size > 0) && (
                          <TableRow className="bg-gradient-to-r from-amber-500/5 to-transparent">
                            <TableCell colSpan={selectedProperties.length + 1} className="font-semibold text-amber-700 dark:text-amber-400 sticky left-0 z-10">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" />
                                Amenities & Features
                              </span>
                            </TableCell>
                          </TableRow>
                        )}
                        {activeAmenities.map(({ key, label }) => (
                          <TableRow key={`amenity-${key}`}>
                            <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10 text-sm">{label}</TableCell>
                            {selectedProperties.map((p) => (
                              <TableCell key={p.id}>{renderAmenityValue(getFeatureValue(p, key))}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                        {Array.from(extraKeys).map((key) => (
                          <TableRow key={`extra-${key}`}>
                            <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10 text-sm capitalize">{key.replace(/_/g, ' ')}</TableCell>
                            {selectedProperties.map((p) => (
                              <TableCell key={p.id}>{renderAmenityValue(p.property_features?.[key])}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ KPR TAB ═══ */}
            <TabsContent value="kpr" className="space-y-6">
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card backdrop-blur-xl shadow-xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/10 flex items-center justify-center">
                      <Banknote className="h-4 w-4 text-amber-500" />
                    </div>
                    KPR Parameters
                    <Badge variant="outline" className="ml-auto text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      Shared Settings
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm">Down Payment: <span className="font-bold text-amber-600 dark:text-amber-400">{kprParams.downPaymentPercent}%</span></Label>
                      <Slider
                        value={[kprParams.downPaymentPercent]}
                        onValueChange={([v]) => setKprParams(p => ({ ...p, downPaymentPercent: v }))}
                        min={10} max={50} step={5}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground"><span>10%</span><span>50%</span></div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Interest Rate: <span className="font-bold text-amber-600 dark:text-amber-400">{kprParams.interestRate}%</span></Label>
                      <Slider
                        value={[kprParams.interestRate * 10]}
                        onValueChange={([v]) => setKprParams(p => ({ ...p, interestRate: v / 10 }))}
                        min={50} max={150} step={5}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground"><span>5%</span><span>15%</span></div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Loan Term</Label>
                      <Select
                        value={String(kprParams.loanTermYears)}
                        onValueChange={(v) => setKprParams(p => ({ ...p, loanTermYears: parseInt(v) }))}
                      >
                        <SelectTrigger className="border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[5, 10, 15, 20, 25, 30].map(y => (
                            <SelectItem key={y} value={String(y)}>{y} years</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KPR Results Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kprResults.map((r, i) => {
                  const isLowest = r.kpr.monthlyPayment === lowestMonthly && kprResults.length > 1;
                  return (
                    <motion.div key={r.property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card className={`border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden ${isLowest ? 'ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10' : ''}`}>
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[i % CHART_COLORS.length]}80)` }} />
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <h4 className="text-sm font-semibold line-clamp-1 flex-1">{r.property.title}</h4>
                            {isLowest && <WinnerBadge label="Best" />}
                          </div>
                          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-400/5 border border-amber-500/10 text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Monthly Payment</p>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400"><Price amount={r.kpr.monthlyPayment} /></p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="text-muted-foreground text-[10px]">DP ({kprParams.downPaymentPercent}%)</p>
                              <p className="font-semibold"><Price amount={r.kpr.downPayment} short /></p>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="text-muted-foreground text-[10px]">Loan</p>
                              <p className="font-semibold"><Price amount={r.kpr.loanAmount} short /></p>
                            </div>
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="text-muted-foreground text-[10px]">Total Payment</p>
                              <p className="font-semibold"><Price amount={r.kpr.totalPayment} short /></p>
                            </div>
                            <div className="p-2 bg-destructive/5 rounded-lg">
                              <p className="text-muted-foreground text-[10px]">Total Interest</p>
                              <p className="font-semibold text-destructive"><Price amount={r.kpr.totalInterest} short /></p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Monthly payment bar chart */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-500" />Monthly Payment Comparison</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={kprResults.map((r, i) => ({
                        name: String.fromCharCode(65 + i) + ': ' + (r.property.title?.slice(0, 15) || 'Property'),
                        monthly: r.kpr.monthlyPayment,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                        <Tooltip formatter={(v: number) => getCurrencyFormatter()(v)} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                        {kprResults.map((_, i) => (
                          <Bar key={i} dataKey="monthly" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ NEIGHBORHOOD TAB ═══ */}
            <TabsContent value="neighborhood" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-transparent">
                          <TableHead className="w-[180px] sticky left-0 bg-card z-10 font-semibold text-foreground">Neighborhood</TableHead>
                          {selectedProperties.map((p, i) => (
                            <TableHead key={p.id} className="min-w-[180px]">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                                  {String.fromCharCode(65 + i)}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm line-clamp-1">{p.title}</h4>
                                  <p className="text-[10px] text-muted-foreground">{p.city || p.location}</p>
                                </div>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { label: 'Schools Nearby', icon: School, key: 'schools' as const },
                          { label: 'Hospitals', icon: HeartPulse, key: 'hospitals' as const },
                          { label: 'Shopping Centers', icon: ShoppingBag, key: 'shopping' as const },
                          { label: 'Transit Stations', icon: Train, key: 'transit' as const },
                          { label: 'Restaurants', icon: Building, key: 'restaurants' as const },
                        ].map(({ label, icon: Icon, key }, idx) => {
                          const values = neighborhoods.map(n => n.data[key]);
                          const best = Math.max(...values);
                          return (
                            <TableRow key={key} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                              <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10">
                                <span className="flex items-center gap-1.5 text-sm"><Icon className="h-3.5 w-3.5 text-amber-500/70" />{label}</span>
                              </TableCell>
                              {neighborhoods.map(n => {
                                const isBest = n.data[key] === best && values.length > 1;
                                return (
                                  <TableCell key={n.property.id}>
                                    <span className={isBest ? 'font-bold text-amber-600 dark:text-amber-400' : ''}>{n.data[key]}</span>
                                    {isBest && <WinnerBadge label="Most" />}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}

                        <TableRow className="bg-gradient-to-r from-amber-500/5 to-transparent">
                          <TableCell colSpan={selectedProperties.length + 1} className="font-semibold text-amber-700 dark:text-amber-400 sticky left-0 z-10">
                            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Scores</span>
                          </TableCell>
                        </TableRow>

                        {[
                          { label: 'Safety Score', key: 'safetyScore' as const },
                          { label: 'Walk Score', key: 'walkScore' as const },
                        ].map(({ label, key }) => {
                          const values = neighborhoods.map(n => n.data[key]);
                          const best = Math.max(...values);
                          return (
                            <TableRow key={key}>
                              <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10 text-sm">{label}</TableCell>
                              {neighborhoods.map(n => {
                                const score = n.data[key];
                                const isBest = score === best && values.length > 1;
                                return (
                                  <TableCell key={n.property.id}>
                                    <div className="space-y-1.5">
                                      <span className={`font-bold ${isBest ? 'text-amber-600 dark:text-amber-400' : score >= 80 ? 'text-primary' : score >= 60 ? 'text-chart-4' : 'text-destructive'}`}>{score}/100</span>
                                      <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${score}%` }}
                                          transition={{ duration: 0.8, ease: 'easeOut' }}
                                          className="h-full rounded-full"
                                          style={{ background: `linear-gradient(90deg, ${score >= 80 ? 'hsl(var(--primary))' : score >= 60 ? 'hsl(38, 92%, 50%)' : 'hsl(var(--destructive))'}, ${score >= 80 ? 'hsl(var(--primary) / 0.7)' : score >= 60 ? 'hsl(45, 93%, 47%)' : 'hsl(var(--destructive) / 0.7)'})` }}
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}

                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10 text-sm">Avg. Rent Nearby</TableCell>
                          {neighborhoods.map(n => (
                            <TableCell key={n.property.id}>
                              <span className="text-sm font-semibold"><Price amount={n.data.avgRentNearby} /><span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Neighborhood Radar */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-amber-500" />
                    Neighborhood Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { metric: 'Schools', ...Object.fromEntries(neighborhoods.map((n, i) => [`prop_${i}`, n.data.schools * 10])) },
                        { metric: 'Hospitals', ...Object.fromEntries(neighborhoods.map((n, i) => [`prop_${i}`, n.data.hospitals * 20])) },
                        { metric: 'Shopping', ...Object.fromEntries(neighborhoods.map((n, i) => [`prop_${i}`, n.data.shopping * 10])) },
                        { metric: 'Transit', ...Object.fromEntries(neighborhoods.map((n, i) => [`prop_${i}`, n.data.transit * 15])) },
                        { metric: 'Safety', ...Object.fromEntries(neighborhoods.map((n, i) => [`prop_${i}`, n.data.safetyScore])) },
                        { metric: 'Walkability', ...Object.fromEntries(neighborhoods.map((n, i) => [`prop_${i}`, n.data.walkScore])) },
                      ]} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid className="opacity-20" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                        {selectedProperties.map((_, i) => (
                          <Radar key={i} dataKey={`prop_${i}`} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.12} strokeWidth={2} />
                        ))}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 justify-center">
                    {selectedProperties.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="font-medium">{p.title?.slice(0, 25)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ INVESTMENT TAB ═══ */}
            <TabsContent value="investment" className="space-y-6">
              {(() => {
                const investmentData = selectedProperties.map(p => ({
                  property: p,
                  metrics: getInvestmentMetrics(p),
                }));
                const bestYield = Math.max(...investmentData.map(d => d.metrics.rentalYield));
                const bestGrowth = Math.max(...investmentData.map(d => d.metrics.appreciation));
                const fastestBreakEven = Math.min(...investmentData.filter(d => d.metrics.breakEvenYears > 0).map(d => d.metrics.breakEvenYears));

                // 10-year projection data
                const projectionData = Array.from({ length: 11 }, (_, year) => {
                  const row: Record<string, any> = { year: `Year ${year}` };
                  investmentData.forEach((d, i) => {
                    row[`prop_${i}`] = Math.round(d.metrics.price * Math.pow(1 + d.metrics.appreciation / 100, year)) / 1_000_000;
                  });
                  return row;
                });

                // Bar chart data for yields & appreciation
                const yieldBarData = investmentData.map((d, i) => ({
                  name: String.fromCharCode(65 + i),
                  'Rental Yield': d.metrics.rentalYield,
                  'Annual Growth': d.metrics.appreciation,
                }));

                return (
                  <>
                    {/* Investment Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {investmentData.map((d, i) => {
                        const isbestYield = d.metrics.rentalYield === bestYield && investmentData.length > 1;
                        const isBestGrowth = d.metrics.appreciation === bestGrowth && investmentData.length > 1;
                        const isFastestBE = d.metrics.breakEvenYears === fastestBreakEven && d.metrics.breakEvenYears > 0 && investmentData.length > 1;
                        return (
                          <motion.div key={d.property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <Card className={`border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden ${(isbestYield || isBestGrowth) ? 'ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10' : ''}`}>
                              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[i % CHART_COLORS.length]}80)` }} />
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                                    {String.fromCharCode(65 + i)}
                                  </div>
                                  <h4 className="text-sm font-semibold line-clamp-1 flex-1">{d.property.title}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-400/5 border border-amber-500/10">
                                    <p className="text-muted-foreground text-[10px]">Annual Growth</p>
                                    <p className="font-bold text-amber-600 dark:text-amber-400">{d.metrics.appreciation}%{isBestGrowth && <WinnerBadge label="Best" />}</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-400/5 border border-amber-500/10">
                                    <p className="text-muted-foreground text-[10px]">Rental Yield</p>
                                    <p className="font-bold text-amber-600 dark:text-amber-400">{d.metrics.rentalYield}%{isbestYield && <WinnerBadge label="Best" />}</p>
                                  </div>
                                  <div className="p-2 bg-muted/30 rounded-lg">
                                    <p className="text-muted-foreground text-[10px]">Monthly Rent</p>
                                    <p className="font-semibold"><Price amount={d.metrics.monthlyRental} short /></p>
                                  </div>
                                  <div className="p-2 bg-muted/30 rounded-lg">
                                    <p className="text-muted-foreground text-[10px]">Break Even</p>
                                    <p className="font-semibold">{d.metrics.breakEvenYears > 0 ? `${d.metrics.breakEvenYears} yrs` : '—'}{isFastestBE && <WinnerBadge label="Fastest" />}</p>
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500/[0.06] to-transparent border border-amber-500/10 text-center">
                                  <p className="text-[10px] text-muted-foreground">5-Year Value</p>
                                  <p className="text-lg font-bold text-foreground"><Price amount={d.metrics.fiveYearValue} /></p>
                                  <p className="text-[10px] font-bold text-emerald-500">+<Price amount={d.metrics.fiveYearValue - d.metrics.price} /></p>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Yield & Growth Bar Chart */}
                    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                      <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-500" />Yield & Appreciation Comparison</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 mb-4">
                          {selectedProperties.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="font-medium">{String.fromCharCode(65 + i)}: {p.title?.slice(0, 20)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yieldBarData}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                              <Legend />
                              <Bar dataKey="Rental Yield" fill="hsl(45, 93%, 47%)" radius={[6, 6, 0, 0]} />
                              <Bar dataKey="Annual Growth" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 10-Year Projection Line Chart */}
                    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                      <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-amber-500" />10-Year Value Projection</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 mb-4">
                          {selectedProperties.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="font-medium">{String.fromCharCode(65 + i)}: {p.title?.slice(0, 20)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="h-[320px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={projectionData}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v.toFixed(0)}M`} />
                              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                formatter={(v: number) => [`Rp ${v.toFixed(0)}M`, '']}
                              />
                              {selectedProperties.map((_, i) => (
                                <Line key={i} type="monotone" dataKey={`prop_${i}`} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center mt-3 italic">
                          AI estimates based on historical area trends. Values in millions IDR. Not financial advice.
                        </p>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </TabsContent>

            {/* ═══ CHARTS TAB ═══ */}
            <TabsContent value="charts" className="space-y-6">
              {selectedProperties.length > 1 && <ComparisonCharts selectedProperties={selectedProperties} />}

              {selectedProperties.length > 1 && (
                <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Comparison Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                        <h4 className="font-semibold mb-1 text-sm">Price Range</h4>
                        <p className="text-sm text-muted-foreground"><Price amount={Math.min(...prices)} /> — <Price amount={Math.max(...prices)} /></p>
                      </div>
                      {areas.length > 0 && (
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                          <h4 className="font-semibold mb-1 text-sm">Area Range</h4>
                          <p className="text-sm text-muted-foreground">{Math.min(...areas)} m² — {Math.max(...areas)} m²</p>
                        </div>
                      )}
                      {allPricePerSqm.length > 0 && (
                        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-400/5 rounded-xl border border-amber-500/20">
                          <h4 className="font-semibold mb-1 text-sm text-amber-700 dark:text-amber-400">Best Value (Price/m²)</h4>
                          <p className="text-sm font-medium">
                            {selectedProperties.find(p => pricePerSqm(p) === minPricePerSqm)?.title?.slice(0, 30)}…
                          </p>
                          <p className="text-xs text-muted-foreground"><Price amount={Math.round(minPricePerSqm!)} />/m²</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

// ─── Charts Component ────────────────────────────────────────────────
interface ComparisonChartsProps {
  selectedProperties: ReturnType<typeof usePropertyComparison>['selectedProperties'];
}

const ComparisonCharts = ({ selectedProperties }: ComparisonChartsProps) => {
  const [chartType, setChartType] = React.useState<'bar' | 'radar'>('bar');
  const truncate = (s: string, n = 18) => s.length > n ? s.slice(0, n) + '…' : s;

  const barData = useMemo(() => {
    const metrics = [
      { key: 'price_m', label: 'Price (M)', getValue: (p: any) => p.price ? +(p.price / 1_000_000).toFixed(1) : 0 },
      { key: 'area', label: 'Area (m²)', getValue: (p: any) => p.area_sqm || 0 },
      { key: 'bedrooms', label: 'Bedrooms', getValue: (p: any) => p.bedrooms || 0 },
      { key: 'bathrooms', label: 'Bathrooms', getValue: (p: any) => p.bathrooms || 0 },
    ];
    return metrics.map(m => {
      const row: Record<string, any> = { metric: m.label };
      selectedProperties.forEach((p, i) => { row[`prop_${i}`] = m.getValue(p); });
      return row;
    });
  }, [selectedProperties]);

  const radarData = useMemo(() => {
    const metrics = [
      { label: 'Price', getValue: (p: any) => p.price || 0, invert: true },
      { label: 'Area', getValue: (p: any) => p.area_sqm || 0 },
      { label: 'Bedrooms', getValue: (p: any) => p.bedrooms || 0 },
      { label: 'Bathrooms', getValue: (p: any) => p.bathrooms || 0 },
    ];
    return metrics.map(m => {
      const values = selectedProperties.map(p => m.getValue(p));
      const max = Math.max(...values, 1);
      const row: Record<string, any> = { metric: m.label };
      selectedProperties.forEach((p, i) => {
        const raw = m.getValue(p);
        row[`prop_${i}`] = m.invert
          ? max > 0 ? Math.round(((max - raw) / max) * 100 + 10) : 0
          : max > 0 ? Math.round((raw / max) * 100) : 0;
      });
      return row;
    });
  }, [selectedProperties]);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-500" />
          Visual Comparison
        </CardTitle>
        <div className="flex gap-1">
          <Button variant={chartType === 'bar' ? 'default' : 'outline'} size="sm" onClick={() => setChartType('bar')} className={chartType === 'bar' ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-0' : ''}>Bar</Button>
          <Button variant={chartType === 'radar' ? 'default' : 'outline'} size="sm" onClick={() => setChartType('radar')} className={chartType === 'radar' ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-0' : ''}>Radar</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          {selectedProperties.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="font-medium">{truncate(p.title)}</span>
            </div>
          ))}
        </div>
        <div className="h-[350px] w-full">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="metric" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => {
                    const idx = parseInt(name.replace('prop_', ''));
                    return [value, truncate(selectedProperties[idx]?.title || '')];
                  }}
                />
                {selectedProperties.map((_, i) => (
                  <Bar key={i} dataKey={`prop_${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid className="opacity-20" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 110]} />
                {selectedProperties.map((_, i) => (
                  <Radar key={i} dataKey={`prop_${i}`} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.12} strokeWidth={2} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyComparison;

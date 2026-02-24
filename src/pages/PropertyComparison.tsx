import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePropertyComparison } from '@/contexts/PropertyComparisonContext';
import {
  ArrowLeft, X, Eye, Trash2, Check, Minus,
  Banknote, MapPin, Building, TrendingUp, School, ShoppingBag, HeartPulse, Train
} from 'lucide-react';
import ShareComparisonButton from '@/components/property/ShareComparisonButton';
import { formatIDR } from '@/utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

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
  // Generate consistent pseudo-random data based on property id
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

// ─── Main Component ──────────────────────────────────────────────────
const PropertyComparison = () => {
  const navigate = useNavigate();
  const comparison = usePropertyComparison();

  // KPR parameters (shared for fair comparison)
  const [kprParams, setKprParams] = useState<KprParams>({
    downPaymentPercent: 20,
    interestRate: 8.5,
    loanTermYears: 20,
  });

  if (!comparison || comparison.selectedProperties.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">No Properties to Compare</h1>
            <p className="text-muted-foreground mb-8">
              Add properties to your comparison list to see detailed side-by-side analysis
            </p>
            <Button onClick={() => navigate('/dijual')}>Browse Properties</Button>
          </div>
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

  // ─── Specs Table Rows ───
  type SpecRow = { label: string; render: (p: typeof selectedProperties[0]) => React.ReactNode };

  const specs: SpecRow[] = [
    {
      label: 'Price',
      render: (p) => {
        const isLowest = p.price === minPrice && prices.length > 1;
        return (
          <div className="space-y-1">
            <span className={`font-bold ${isLowest ? 'text-primary' : ''}`}>{formatIDR(p.price)}</span>
            {p.listing_type === 'rent' && <span className="text-xs text-muted-foreground">/month</span>}
            {isLowest && <Badge variant="outline" className="ml-1 text-xs text-primary border-primary">Lowest</Badge>}
          </div>
        );
      },
    },
    { label: 'Location', render: (p) => <span>{p.city || p.state || p.location}</span> },
    { label: 'Property Type', render: (p) => <span className="capitalize">{p.property_type || '—'}</span> },
    {
      label: 'Listing Type',
      render: (p) => (
        <Badge variant={p.listing_type === 'sale' ? 'default' : 'secondary'}>
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
          <div className="space-y-1">
            <span className={isLargest ? 'font-bold text-primary' : ''}>{p.area_sqm} m²</span>
            {isLargest && <Badge variant="outline" className="ml-1 text-xs text-primary border-primary">Largest</Badge>}
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
          <div className="space-y-1">
            <span className={isBest ? 'font-bold text-primary' : ''}>{formatIDR(Math.round(v))}</span>
            {isBest && <Badge variant="outline" className="ml-1 text-xs text-primary border-primary">Best</Badge>}
          </div>
        );
      },
    },
    {
      label: '3D Tour',
      render: (p) =>
        has3DTour(p)
          ? <Badge className="bg-primary/10 text-primary border-primary/20">Available</Badge>
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
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    if (value === true) return <Check className="h-4 w-4 text-primary" />;
    return <span className="text-sm">{String(value)}</span>;
  };

  // ─── KPR calculations for each property ───
  const kprResults = selectedProperties.map(p => ({
    property: p,
    kpr: calculateKpr(p.price, kprParams),
  }));

  const lowestMonthly = Math.min(...kprResults.map(r => r.kpr.monthlyPayment));

  // ─── Neighborhood data ───
  const neighborhoods = selectedProperties.map(p => ({
    property: p,
    data: getNeighborhoodData(p),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Property Comparison</h1>
              <p className="text-muted-foreground">
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
        </div>

        {/* Tabs for sections */}
        <Tabs defaultValue="specs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="specs" className="gap-1.5">
              <Building className="h-4 w-4" />Specs
            </TabsTrigger>
            <TabsTrigger value="kpr" className="gap-1.5">
              <Banknote className="h-4 w-4" />KPR
            </TabsTrigger>
            <TabsTrigger value="neighborhood" className="gap-1.5">
              <MapPin className="h-4 w-4" />Neighborhood
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />Charts
            </TabsTrigger>
          </TabsList>

          {/* ═══ SPECS TAB ═══ */}
          <TabsContent value="specs">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px] sticky left-0 bg-background z-10">Spec</TableHead>
                        {selectedProperties.map((p) => (
                          <TableHead key={p.id} className="min-w-[200px]">
                            <div className="space-y-2">
                              <div className="relative">
                                <img src={getImageUrl(p)} alt={p.title} className="w-full h-28 object-cover rounded-lg" />
                                <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background rounded-full" onClick={() => removeFromComparison(p.id)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <h3 className="font-semibold text-sm line-clamp-2">{p.title}</h3>
                              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate(`/properties/${p.id}`)}>
                                <Eye className="h-3 w-3 mr-1" />View Details
                              </Button>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {specs.map((spec) => (
                        <TableRow key={spec.label}>
                          <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">{spec.label}</TableCell>
                          {selectedProperties.map((p) => (
                            <TableCell key={p.id}>{spec.render(p)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {(activeAmenities.length > 0 || extraKeys.size > 0) && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={selectedProperties.length + 1} className="font-semibold text-foreground sticky left-0 bg-muted/30 z-10">
                            Amenities & Features
                          </TableCell>
                        </TableRow>
                      )}
                      {activeAmenities.map(({ key, label }) => (
                        <TableRow key={`amenity-${key}`}>
                          <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">{label}</TableCell>
                          {selectedProperties.map((p) => (
                            <TableCell key={p.id}>{renderAmenityValue(getFeatureValue(p, key))}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {Array.from(extraKeys).map((key) => (
                        <TableRow key={`extra-${key}`}>
                          <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10 capitalize">{key.replace(/_/g, ' ')}</TableCell>
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
            {/* Shared KPR Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Banknote className="h-5 w-5" />
                  KPR Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Down Payment: {kprParams.downPaymentPercent}%</Label>
                    <Slider
                      value={[kprParams.downPaymentPercent]}
                      onValueChange={([v]) => setKprParams(p => ({ ...p, downPaymentPercent: v }))}
                      min={10} max={50} step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Interest Rate: {kprParams.interestRate}%</Label>
                    <Slider
                      value={[kprParams.interestRate * 10]}
                      onValueChange={([v]) => setKprParams(p => ({ ...p, interestRate: v / 10 }))}
                      min={50} max={150} step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Loan Term</Label>
                    <Select
                      value={String(kprParams.loanTermYears)}
                      onValueChange={(v) => setKprParams(p => ({ ...p, loanTermYears: parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
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

            {/* KPR Comparison Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px] sticky left-0 bg-background z-10">KPR Detail</TableHead>
                        {selectedProperties.map(p => (
                          <TableHead key={p.id} className="min-w-[180px]">
                            <h4 className="font-semibold text-sm line-clamp-1">{p.title}</h4>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">Property Price</TableCell>
                        {kprResults.map(r => <TableCell key={r.property.id}>{formatIDR(r.property.price)}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">Down Payment</TableCell>
                        {kprResults.map(r => <TableCell key={r.property.id}>{formatIDR(r.kpr.downPayment)}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">Loan Amount</TableCell>
                        {kprResults.map(r => <TableCell key={r.property.id}>{formatIDR(r.kpr.loanAmount)}</TableCell>)}
                      </TableRow>
                      <TableRow className="bg-primary/5">
                        <TableCell className="font-semibold sticky left-0 bg-primary/5 z-10">Monthly Payment</TableCell>
                        {kprResults.map(r => {
                          const isLowest = r.kpr.monthlyPayment === lowestMonthly && kprResults.length > 1;
                          return (
                            <TableCell key={r.property.id}>
                              <span className={`font-bold text-base ${isLowest ? 'text-primary' : ''}`}>
                                {formatIDR(r.kpr.monthlyPayment)}
                              </span>
                              {isLowest && <Badge variant="outline" className="ml-1 text-xs text-primary border-primary">Lowest</Badge>}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">Total Payment ({kprParams.loanTermYears}yr)</TableCell>
                        {kprResults.map(r => <TableCell key={r.property.id}>{formatIDR(r.kpr.totalPayment)}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">Total Interest</TableCell>
                        {kprResults.map(r => (
                          <TableCell key={r.property.id}>
                            <span className="text-destructive">{formatIDR(r.kpr.totalInterest)}</span>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">Interest / Price Ratio</TableCell>
                        {kprResults.map(r => (
                          <TableCell key={r.property.id}>
                            <span className={r.kpr.totalInterest / r.property.price > 1 ? 'text-destructive' : 'text-muted-foreground'}>
                              {((r.kpr.totalInterest / r.property.price) * 100).toFixed(0)}%
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Monthly payment bar chart */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Monthly Payment Comparison</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kprResults.map(r => ({
                      name: r.property.title?.slice(0, 20) || 'Property',
                      monthly: r.kpr.monthlyPayment,
                      interest: r.kpr.totalInterest,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1_000_000).toFixed(0)}M`} />
                      <Tooltip formatter={(v: number) => formatIDR(v)} contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="monthly" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Monthly" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ NEIGHBORHOOD TAB ═══ */}
          <TabsContent value="neighborhood">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px] sticky left-0 bg-background z-10">Neighborhood</TableHead>
                        {selectedProperties.map(p => (
                          <TableHead key={p.id} className="min-w-[180px]">
                            <h4 className="font-semibold text-sm line-clamp-1">{p.title}</h4>
                            <p className="text-xs text-muted-foreground">{p.city || p.location}</p>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { label: 'Schools Nearby', icon: School, key: 'schools' as const, suffix: '' },
                        { label: 'Hospitals', icon: HeartPulse, key: 'hospitals' as const, suffix: '' },
                        { label: 'Shopping Centers', icon: ShoppingBag, key: 'shopping' as const, suffix: '' },
                        { label: 'Transit Stations', icon: Train, key: 'transit' as const, suffix: '' },
                        { label: 'Restaurants', icon: Building, key: 'restaurants' as const, suffix: '' },
                      ].map(({ label, icon: Icon, key }) => {
                        const values = neighborhoods.map(n => n.data[key]);
                        const best = Math.max(...values);
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">
                              <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{label}</span>
                            </TableCell>
                            {neighborhoods.map(n => {
                              const isBest = n.data[key] === best && values.length > 1;
                              return (
                                <TableCell key={n.property.id}>
                                  <span className={isBest ? 'font-bold text-primary' : ''}>{n.data[key]}</span>
                                  {isBest && <Badge variant="outline" className="ml-1 text-xs text-primary border-primary">Most</Badge>}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}

                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={selectedProperties.length + 1} className="font-semibold sticky left-0 bg-muted/30 z-10">Scores</TableCell>
                      </TableRow>

                      {[
                        { label: 'Safety Score', key: 'safetyScore' as const },
                        { label: 'Walk Score', key: 'walkScore' as const },
                      ].map(({ label, key }) => {
                        const values = neighborhoods.map(n => n.data[key]);
                        const best = Math.max(...values);
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">{label}</TableCell>
                            {neighborhoods.map(n => {
                              const score = n.data[key];
                              const isBest = score === best && values.length > 1;
                              const color = score >= 80 ? 'text-primary' : score >= 60 ? 'text-chart-4' : 'text-destructive';
                              return (
                                <TableCell key={n.property.id}>
                                  <div className="space-y-1">
                                    <span className={`font-bold ${isBest ? 'text-primary' : color}`}>{score}/100</span>
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${score >= 80 ? 'bg-primary' : score >= 60 ? 'bg-chart-4' : 'bg-destructive'}`} style={{ width: `${score}%` }} />
                                    </div>
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}

                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">Avg. Rent Nearby</TableCell>
                        {neighborhoods.map(n => (
                          <TableCell key={n.property.id}>
                            <span className="text-sm">{formatIDR(n.data.avgRentNearby)}<span className="text-xs text-muted-foreground">/mo</span></span>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Neighborhood Radar */}
            <Card className="mt-6">
              <CardHeader><CardTitle className="text-lg">Neighborhood Comparison</CardTitle></CardHeader>
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
                      <PolarGrid className="opacity-30" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                      {selectedProperties.map((_, i) => (
                        <Radar key={i} dataKey={`prop_${i}`} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.15} strokeWidth={2} />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 justify-center">
                  {selectedProperties.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span>{p.title?.slice(0, 25)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ CHARTS TAB ═══ */}
          <TabsContent value="charts">
            {selectedProperties.length > 1 && <ComparisonCharts selectedProperties={selectedProperties} />}

            {/* Summary */}
            {selectedProperties.length > 1 && (
              <Card className="mt-6">
                <CardHeader><CardTitle>Comparison Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Price Range</h4>
                      <p className="text-sm text-muted-foreground">{formatIDR(Math.min(...prices))} — {formatIDR(Math.max(...prices))}</p>
                    </div>
                    {areas.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Area Range</h4>
                        <p className="text-sm text-muted-foreground">{Math.min(...areas)} m² — {Math.max(...areas)} m²</p>
                      </div>
                    )}
                    {allPricePerSqm.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Best Value (Price/m²)</h4>
                        <p className="text-sm text-primary font-medium">
                          {selectedProperties.find(p => pricePerSqm(p) === minPricePerSqm)?.title?.slice(0, 30)}…
                        </p>
                        <p className="text-xs text-muted-foreground">{formatIDR(Math.round(minPricePerSqm!))}/m²</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ─── Chart Colors & Component ────────────────────────────────────────
const CHART_COLORS = [
  'hsl(210, 100%, 56%)', 'hsl(340, 82%, 52%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)',
];

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Visual Comparison</CardTitle>
        <div className="flex gap-1">
          <Button variant={chartType === 'bar' ? 'default' : 'outline'} size="sm" onClick={() => setChartType('bar')}>Bar</Button>
          <Button variant={chartType === 'radar' ? 'default' : 'outline'} size="sm" onClick={() => setChartType('radar')}>Radar</Button>
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
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => {
                    const idx = parseInt(name.replace('prop_', ''));
                    return [value, truncate(selectedProperties[idx]?.title || '')];
                  }}
                />
                {selectedProperties.map((_, i) => (
                  <Bar key={i} dataKey={`prop_${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid className="opacity-30" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 110]} />
                {selectedProperties.map((_, i) => (
                  <Radar key={i} dataKey={`prop_${i}`} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.15} strokeWidth={2} />
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

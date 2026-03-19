import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, TrendingUp, Upload, ImagePlus, Sparkles, CheckCircle2, BedDouble, Bath, Maximize, LandPlot, Armchair, X, ChevronDown, Star, Users, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FormData {
  title: string;
  location: string;
  propertyType: string;
  askingPrice: string;
  rentalYield: string;
  investmentAngle: string;
  growthNarrative: string;
  landSize: string;
  buildingSize: string;
  bedrooms: string;
  bathrooms: string;
  furnished: boolean;
}

const initialForm: FormData = {
  title: '',
  location: '',
  propertyType: '',
  askingPrice: '',
  rentalYield: '',
  investmentAngle: '',
  growthNarrative: '',
  landSize: '',
  buildingSize: '',
  bedrooms: '',
  bathrooms: '',
  furnished: false,
};

const locations = [
  'Seminyak, Bali', 'Canggu, Bali', 'Ubud, Bali', 'Uluwatu, Bali',
  'Sanur, Bali', 'Nusa Dua, Bali', 'Jimbaran, Bali', 'Kuta, Bali',
  'Tabanan, Bali', 'Karangasem, Bali',
  'Jakarta Selatan', 'Jakarta Pusat', 'Tangerang Selatan',
  'Bandung', 'Yogyakarta', 'Surabaya', 'Lombok', 'Labuan Bajo',
];

function computeOpportunityScore(form: FormData): number {
  let score = 0;
  if (form.title.length > 5) score += 12;
  if (form.location) score += 15;
  if (form.propertyType) score += 10;
  if (form.askingPrice) score += 10;
  if (form.rentalYield && parseFloat(form.rentalYield) > 0) score += 15;
  if (form.investmentAngle.length > 20) score += 10;
  if (form.growthNarrative.length > 20) score += 8;
  if (form.landSize) score += 5;
  if (form.buildingSize) score += 5;
  if (form.bedrooms) score += 5;
  if (form.bathrooms) score += 5;
  return Math.min(score, 100);
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-primary';
  if (score >= 50) return 'text-warning';
  return 'text-muted-foreground';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Good';
  if (score >= 20) return 'Building...';
  return 'Getting started';
}

function getDemandLevel(form: FormData): { level: string; percent: number; color: string } {
  const yld = parseFloat(form.rentalYield) || 0;
  const hasLocation = !!form.location;
  const hotLocations = ['Canggu', 'Seminyak', 'Uluwatu', 'Ubud'];
  const isHot = hotLocations.some(l => form.location.includes(l));

  if (isHot && yld >= 10) return { level: 'Very High', percent: 92, color: 'bg-primary' };
  if (isHot || yld >= 8) return { level: 'High', percent: 75, color: 'bg-primary' };
  if (hasLocation && yld > 0) return { level: 'Moderate', percent: 55, color: 'bg-warning' };
  if (hasLocation) return { level: 'Growing', percent: 35, color: 'bg-warning' };
  return { level: 'Awaiting data', percent: 10, color: 'bg-muted-foreground' };
}

function generateInsight(form: FormData): string {
  const parts: string[] = [];
  if (form.location) {
    const hotLocations = ['Canggu', 'Seminyak', 'Uluwatu'];
    if (hotLocations.some(l => form.location.includes(l))) {
      parts.push(`${form.location.split(',')[0]} is trending among international investors.`);
    } else {
      parts.push(`${form.location.split(',')[0]} shows emerging potential.`);
    }
  }
  const yld = parseFloat(form.rentalYield) || 0;
  if (yld >= 12) parts.push(`${yld}% yield positions this in the top 10% of listings.`);
  else if (yld >= 8) parts.push(`${yld}% yield is competitive for this market.`);

  if (form.propertyType === 'villa') parts.push('Villas attract premium short-term rental demand.');
  if (form.propertyType === 'apartment') parts.push('Apartments appeal to long-term lease investors.');

  return parts.length > 0 ? parts.join(' ') : 'Complete more fields to generate AI insights.';
}

export default function SubmitPropertyListing() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback((key: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const score = computeOpportunityScore(form);
  const demand = getDemandLevel(form);
  const insight = generateInsight(form);
  const filteredLocations = locations.filter(l => l.toLowerCase().includes(locationQuery.toLowerCase()));

  const handleHero = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImage(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeGallery = (idx: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.location || !form.propertyType || !form.askingPrice) {
      toast.error('Please fill in all required fields in Basic Info');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-3">
            Listing Published
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Your listing is now visible to active investors
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            AI is matching your property with qualified buyers in real-time.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setSubmitted(false); setForm(initialForm); setHeroImage(null); setHeroPreview(null); setGalleryFiles([]); setGalleryPreviews([]); }}>
              List Another Property
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">
              List Your Investment Property
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-11">
            Reach qualified investors powered by AI intelligence
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form */}
          <div className="flex-1 space-y-8">
            {/* Section 1 — Basic Info */}
            <Section title="Basic Information" icon={<Building2 className="w-4 h-4" />} number={1}>
              <div className="space-y-4">
                <Field label="Property Title" required>
                  <Input
                    placeholder="e.g. Modern Villa with Infinity Pool in Canggu"
                    value={form.title}
                    onChange={e => update('title', e.target.value)}
                  />
                </Field>
                <Field label="Location" required>
                  <div className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Search location..."
                        value={locationQuery || form.location}
                        onChange={e => { setLocationQuery(e.target.value); setLocationOpen(true); update('location', ''); }}
                        onFocus={() => setLocationOpen(true)}
                      />
                    </div>
                    <AnimatePresence>
                      {locationOpen && filteredLocations.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                        >
                          {filteredLocations.map(loc => (
                            <button
                              key={loc}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors text-popover-foreground"
                              onClick={() => { update('location', loc); setLocationQuery(''); setLocationOpen(false); }}
                            >
                              <MapPin className="w-3.5 h-3.5 inline mr-2 text-muted-foreground" />
                              {loc}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Property Type" required>
                    <Select value={form.propertyType} onValueChange={v => update('propertyType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="project">Development Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Asking Price (IDR)" required>
                    <Input
                      placeholder="e.g. 5,500,000,000"
                      value={form.askingPrice}
                      onChange={e => update('askingPrice', e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Section 2 — Investment Details */}
            <Section title="Investment Details" icon={<TrendingUp className="w-4 h-4" />} number={2}>
              <div className="space-y-4">
                <Field label="Estimated Rental Yield (%)">
                  <Input
                    type="number"
                    placeholder="e.g. 12"
                    value={form.rentalYield}
                    onChange={e => update('rentalYield', e.target.value)}
                  />
                </Field>
                <Field label="Key Investment Angle">
                  <Textarea
                    placeholder="What makes this property a compelling investment? Highlight ROI drivers, location advantages, or unique selling points..."
                    rows={3}
                    value={form.investmentAngle}
                    onChange={e => update('investmentAngle', e.target.value)}
                  />
                </Field>
                <Field label="Area Growth Narrative">
                  <Textarea
                    placeholder="Describe upcoming infrastructure, tourism trends, or development plans that support long-term value appreciation..."
                    rows={3}
                    value={form.growthNarrative}
                    onChange={e => update('growthNarrative', e.target.value)}
                  />
                </Field>
              </div>
            </Section>

            {/* Section 3 — Media Upload */}
            <Section title="Media" icon={<ImagePlus className="w-4 h-4" />} number={3}>
              <div className="space-y-4">
                <Field label="Hero Image">
                  {heroPreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img src={heroPreview} alt="Hero" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => { setHeroImage(null); setHeroPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                          Good quality
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Drop hero image or click to upload</span>
                      <span className="text-xs text-muted-foreground/60 mt-1">JPG, PNG up to 10MB</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleHero} />
                    </label>
                  )}
                </Field>
                <Field label="Gallery">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {galleryPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeGallery(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col items-center justify-center">
                      <ImagePlus className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} />
                    </label>
                  </div>
                </Field>
              </div>
            </Section>

            {/* Section 4 — Specs */}
            <Section title="Property Specifications" icon={<Maximize className="w-4 h-4" />} number={4}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Land Size (m²)">
                  <Input placeholder="e.g. 200" value={form.landSize} onChange={e => update('landSize', e.target.value)} />
                </Field>
                <Field label="Building Size (m²)">
                  <Input placeholder="e.g. 150" value={form.buildingSize} onChange={e => update('buildingSize', e.target.value)} />
                </Field>
                <Field label="Bedrooms">
                  <Input type="number" placeholder="e.g. 3" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} />
                </Field>
                <Field label="Bathrooms">
                  <Input type="number" placeholder="e.g. 2" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} />
                </Field>
                <div className="flex flex-col gap-2 justify-center col-span-2 sm:col-span-1">
                  <Label className="text-sm font-medium text-foreground">Furnished</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.furnished} onCheckedChange={v => update('furnished', v)} />
                    <span className="text-sm text-muted-foreground">{form.furnished ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Submit — mobile AI preview + button */}
            <div className="lg:hidden">
              <AIPreviewPanel score={score} demand={demand} insight={insight} />
            </div>

            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Publish to Investor Marketplace
                </>
              )}
            </Button>
          </div>

          {/* Sticky AI Panel — desktop */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-28">
              <AIPreviewPanel score={score} demand={demand} insight={insight} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function Section({ title, icon, number, children }: { title: string; icon: React.ReactNode; number: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.05 }}
      className="bg-card border border-border rounded-xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function AIPreviewPanel({ score, demand, insight }: { score: number; demand: { level: string; percent: number; color: string }; insight: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">AI Preview</h3>
        <Badge variant="outline" className="ml-auto text-[10px]">Live</Badge>
      </div>

      {/* Opportunity Score */}
      <div className="text-center py-3">
        <div className={cn('text-4xl font-bold tabular-nums', getScoreColor(score))}>
          {score}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Opportunity Score</div>
        <div className={cn('text-xs font-medium mt-0.5', getScoreColor(score))}>
          {getScoreLabel(score)}
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-accent/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Star className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-foreground/80 leading-relaxed">{insight}</p>
        </div>
      </div>

      {/* Investor Demand */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Investor Demand</span>
          </div>
          <span className="text-xs font-medium text-foreground">{demand.level}</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', demand.color)}
            initial={{ width: 0 }}
            animate={{ width: `${demand.percent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Trust indicators */}
      <div className="border-t border-border pt-4 space-y-2">
        <TrustRow icon="🔒" text="Verified agent listings only" />
        <TrustRow icon="🤖" text="AI-matched to investor profiles" />
        <TrustRow icon="📊" text="Real-time market analytics" />
      </div>
    </div>
  );
}

function TrustRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs">{icon}</span>
      <span className="text-[11px] text-muted-foreground">{text}</span>
    </div>
  );
}

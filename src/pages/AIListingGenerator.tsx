import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sparkles, Loader2, Copy, Check, RefreshCw, Wand2, Target, Hash, PenLine, ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GeneratedContent {
  listing_title: string;
  long_description: string;
  seo_description: string;
  highlights: string[];
  investment_statement: string;
  social_caption: string;
  seo_keywords: string[];
}

const PROPERTY_TYPES = ['Villa', 'Apartment', 'House', 'Land', 'Commercial', 'Townhouse', 'Warehouse', 'Office'];
const BUYER_TYPES = ['Investor', 'Family', 'Rental Operator', 'Expat', 'First-Time Buyer', 'Developer'];
const TONES = [
  { value: 'luxury', label: '🏛️ Luxury', desc: 'Sophisticated, aspirational' },
  { value: 'investment', label: '📈 Investment', desc: 'Data-driven, ROI focused' },
  { value: 'family', label: '👨‍👩‍👧 Family', desc: 'Warm, community-oriented' },
  { value: 'minimalist', label: '🔲 Modern', desc: 'Clean, design-focused' },
  { value: 'resort', label: '🌴 Resort', desc: 'Tropical, lifestyle' },
];

const AIListingGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [form, setForm] = useState({
    property_type: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    land_area_sqm: '',
    price: '',
    features: '',
    year_built: '',
    target_buyer: '',
    tone: 'luxury',
  });

  const update = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleGenerate = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please sign in to use AI generation.', variant: 'destructive' });
      return;
    }
    if (!form.property_type || !form.location) {
      toast({ title: 'Missing Info', description: 'Property type and location are required.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      // Create a temporary property record for the AI engine
      const { data: prop, error: insertErr } = await supabase.from('properties').insert({
        title: `${form.property_type} in ${form.location}`,
        property_type: form.property_type.toLowerCase(),
        listing_type: 'sale',
        city: form.location.split(',')[0]?.trim() || form.location,
        state: form.location.split(',')[1]?.trim() || 'Indonesia',
        location: form.location,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        area_sqm: form.area_sqm ? parseInt(form.area_sqm) : null,
        land_area_sqm: form.land_area_sqm ? parseInt(form.land_area_sqm) : null,
        price: form.price ? parseInt(form.price.replace(/\D/g, '')) : 0,
        features: form.features ? form.features.split(',').map(f => f.trim()) : [],
        year_built: form.year_built ? parseInt(form.year_built) : null,
        description: '',
        status: 'draft',
        user_id: user.id,
      }).select('id').single();

      if (insertErr) throw insertErr;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-description-generator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            property_id: prop.id,
            tone: form.tone,
            save_results: false,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          toast({ title: 'Rate Limited', description: 'Please wait before trying again.', variant: 'destructive' });
          return;
        }
        if (res.status === 402) {
          toast({ title: 'Credits Depleted', description: 'AI credits used up.', variant: 'destructive' });
          return;
        }
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      setResult(data);
      toast({ title: 'Content Generated!', description: 'Your listing content is ready.' });

      // Clean up draft
      await supabase.from('properties').delete().eq('id', prop.id);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyField = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost" size="sm"
      onClick={() => copyField(text, field)}
      className="h-7 px-2 text-muted-foreground hover:text-foreground"
    >
      {copiedField === field ? <Check className="w-3.5 h-3.5 text-intel-success" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );

  return (
    <>
      <SEOHead title="AI Listing Content Generator" description="Generate professional property listing descriptions instantly with AI." />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">
                  AI Listing Content Generator
                </h1>
                <p className="font-inter text-sm text-muted-foreground">
                  Generate professional titles, descriptions, and marketing content in seconds.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-inter">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Type */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Property Type *</Label>
                    <Select value={form.property_type} onValueChange={v => update('property_type', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Location *</Label>
                    <Input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Seminyak, Bali" />
                  </div>

                  {/* Specs grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Bedrooms</Label>
                      <Input type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} placeholder="3" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Bathrooms</Label>
                      <Input type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} placeholder="2" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Building (sqm)</Label>
                      <Input type="number" value={form.area_sqm} onChange={e => update('area_sqm', e.target.value)} placeholder="250" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Land (sqm)</Label>
                      <Input type="number" value={form.land_area_sqm} onChange={e => update('land_area_sqm', e.target.value)} placeholder="500" />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Price (IDR)</Label>
                    <Input value={form.price} onChange={e => update('price', e.target.value)} placeholder="5,500,000,000" />
                  </div>

                  {/* Features */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Key Features</Label>
                    <Textarea value={form.features} onChange={e => update('features', e.target.value)} placeholder="Pool, ocean view, smart home, modern kitchen..." className="min-h-[70px]" />
                  </div>

                  {/* Year Built */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Year Built</Label>
                    <Input type="number" value={form.year_built} onChange={e => update('year_built', e.target.value)} placeholder="2023" />
                  </div>

                  {/* Target Buyer */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Target Buyer</Label>
                    <Select value={form.target_buyer} onValueChange={v => update('target_buyer', v)}>
                      <SelectTrigger><SelectValue placeholder="Select buyer type" /></SelectTrigger>
                      <SelectContent>
                        {BUYER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tone */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Content Tone</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                      {TONES.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => update('tone', t.value)}
                          className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                            form.tone === t.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-card hover:border-primary/30'
                          }`}
                        >
                          <div className="font-medium">{t.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate */}
                  <Button
                    onClick={handleGenerate}
                    disabled={loading || !form.property_type || !form.location}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold py-5 rounded-xl"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Generate Listing Content</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 space-y-4"
            >
              {loading && (
                <Card className="border-primary/20">
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                      <div>
                        <p className="font-inter text-sm font-medium text-foreground">AI is crafting your listing...</p>
                        <p className="font-inter text-xs text-muted-foreground mt-1">Analyzing property data and market context</p>
                      </div>
                      <div className="space-y-2 max-w-xs mx-auto">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-3 bg-muted rounded-full animate-pulse" style={{ width: `${70 + i * 8}%`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!loading && !result && (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="py-16 text-center">
                    <Wand2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="font-inter text-sm text-muted-foreground">
                      Fill in the property details and click Generate to create professional listing content.
                    </p>
                  </CardContent>
                </Card>
              )}

              {result && (
                <div className="space-y-4 animate-fade-in">
                  {/* Title */}
                  <Card>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground font-medium">Listing Title</Label>
                        <CopyBtn text={result.listing_title} field="title" />
                      </div>
                      <h2 className="font-playfair text-xl font-bold text-foreground">{result.listing_title}</h2>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  <Card>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground font-medium">Marketing Description</Label>
                        <CopyBtn text={result.long_description} field="desc" />
                      </div>
                      <div className="prose prose-sm max-w-none text-foreground">
                        <ReactMarkdown>{result.long_description}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Highlights */}
                  <Card>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-xs text-muted-foreground font-medium">Highlight Bullet Points</Label>
                        <CopyBtn text={result.highlights.map(h => `• ${h}`).join('\n')} field="highlights" />
                      </div>
                      <ul className="space-y-2">
                        {result.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <Check className="w-4 h-4 text-intel-success mt-0.5 flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Investment Statement */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          <Label className="text-xs text-muted-foreground font-medium">Investment Potential</Label>
                        </div>
                        <CopyBtn text={result.investment_statement} field="invest" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{result.investment_statement}</p>
                    </CardContent>
                  </Card>

                  {/* SEO & Social */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground font-medium">SEO Meta Description</Label>
                          <CopyBtn text={result.seo_description} field="seo" />
                        </div>
                        <p className="text-sm text-foreground">{result.seo_description}</p>
                        <Badge variant="outline" className={`mt-2 text-[10px] ${result.seo_description.length <= 160 ? 'border-intel-success/30 text-intel-success' : 'border-destructive/30 text-destructive'}`}>
                          {result.seo_description.length}/160 chars
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground font-medium">Social Caption</Label>
                          <CopyBtn text={result.social_caption} field="social" />
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{result.social_caption}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Keywords */}
                  {result.seo_keywords?.length > 0 && (
                    <Card>
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-xs text-muted-foreground font-medium">SEO Keywords</Label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.seo_keywords.map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Regenerate */}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleGenerate} disabled={loading} className="rounded-xl">
                      <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                    <Button
                      onClick={() => {
                        const all = `# ${result.listing_title}\n\n${result.long_description}\n\n## Highlights\n${result.highlights.map(h => `- ${h}`).join('\n')}\n\n## Investment Potential\n${result.investment_statement}\n\n## SEO Description\n${result.seo_description}\n\n## Social Caption\n${result.social_caption}`;
                        navigator.clipboard.writeText(all);
                        toast({ title: 'Copied!', description: 'All content copied to clipboard.' });
                      }}
                      className="rounded-xl"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy All
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIListingGenerator;

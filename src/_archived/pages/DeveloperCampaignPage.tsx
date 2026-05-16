import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Sparkles, Target, Clock, Mail, Image, Pencil, Copy, Check, ChevronRight, Calendar, Users, Tag, MapPin, Building2, Layers, Rocket, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CampaignData {
  headline: string;
  subheadline: string;
  description: string;
  sellingPoints: string[];
  campaignTiming: {
    recommendedLaunchWindow: string;
    prelaunchDuration: string;
    reasoning: string;
  };
  emailSubject: string;
  emailBody: string;
  bannerTagline: string;
  ctaText: string;
  targetAudience: string;
  pricingStrategy: string;
}

// ─── Editable Text Block ─────────────────────────────────────────────
function EditableBlock({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditing(!editing)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      {editing ? (
        multiline ? (
          <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="text-sm bg-muted/30 border-primary/20 min-h-[80px]" onBlur={() => setEditing(false)} autoFocus />
        ) : (
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm bg-muted/30 border-primary/20" onBlur={() => setEditing(false)} autoFocus />
        )
      ) : (
        <p className={`text-sm text-foreground cursor-pointer hover:bg-muted/20 rounded px-2 py-1 -mx-2 transition-colors ${multiline ? 'whitespace-pre-wrap' : ''}`} onClick={() => setEditing(true)}>
          {value}
        </p>
      )}
    </div>
  );
}

// ─── Banner Preview Card ─────────────────────────────────────────────
function BannerPreview({ campaign, projectName }: { campaign: CampaignData; projectName: string }) {
  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="relative bg-gradient-to-br from-primary/20 via-card to-accent/10 p-6">
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground text-[10px]">FEATURED PROJECT</Badge>
        </div>
        <div className="space-y-2 max-w-md">
          <p className="text-[10px] uppercase tracking-widest text-primary font-medium">{campaign.bannerTagline}</p>
          <h3 className="text-xl font-bold text-foreground leading-tight">{campaign.headline}</h3>
          <p className="text-sm text-muted-foreground">{campaign.subheadline}</p>
          <Button size="sm" className="mt-3 h-8 text-xs">
            {campaign.ctaText} <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="absolute bottom-3 right-4 text-[9px] text-muted-foreground">by {projectName}</div>
      </div>
    </Card>
  );
}

// ─── Email Preview ───────────────────────────────────────────────────
function EmailPreview({ campaign, projectName }: { campaign: CampaignData; projectName: string }) {
  return (
    <Card className="bg-card/60 border-border/40">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-primary" /> Investor Email Template
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="rounded-lg bg-muted/20 border border-border/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/20 pb-2">
            <span className="font-medium text-foreground">Subject:</span> {campaign.emailSubject}
          </div>
          <div className="text-sm text-foreground leading-relaxed">{campaign.emailBody}</div>
          <Button size="sm" className="h-8 text-xs w-full">{campaign.ctaText}</Button>
          <p className="text-[10px] text-muted-foreground text-center">ASTRA Villa · {projectName}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Countdown Widget Preview ────────────────────────────────────────
function CountdownPreview({ campaign }: { campaign: CampaignData }) {
  return (
    <Card className="bg-gradient-to-br from-card via-card/80 to-primary/5 border-primary/20">
      <CardContent className="p-5 text-center space-y-3">
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">LAUNCHING SOON</Badge>
        <h4 className="text-lg font-bold text-foreground">{campaign.bannerTagline}</h4>
        <div className="flex justify-center gap-3">
          {[{ v: '14', l: 'Days' }, { v: '08', l: 'Hours' }, { v: '32', l: 'Min' }].map((t) => (
            <div key={t.l} className="bg-muted/30 rounded-lg px-3 py-2 min-w-[56px]">
              <p className="text-xl font-bold text-primary font-mono">{t.v}</p>
              <p className="text-[9px] text-muted-foreground">{t.l}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{campaign.campaignTiming.recommendedLaunchWindow}</p>
        <Button size="sm" className="h-8 text-xs">Register Interest</Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function DeveloperCampaignPage() {
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [pricingTier, setPricingTier] = useState('');
  const [positioning, setPositioning] = useState('');
  const [unitCount, setUnitCount] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);

  const handleGenerate = async () => {
    if (!projectName || !location || !positioning) {
      toast.error('Please fill Project Name, Location, and Positioning');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-dev-campaign', {
        body: { projectName, location, targetSegment, pricingTier, positioning, unitCount, launchDate },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Generation failed');
      setCampaign(data.campaign);
      toast.success('Campaign generated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate campaign');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CampaignData, value: any) => {
    if (!campaign) return;
    setCampaign({ ...campaign, [field]: value });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/30 bg-gradient-to-br from-background via-card/50 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--gold-primary)/0.06),transparent_60%)]" />
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Campaign Generator</h1>
              <p className="text-sm text-muted-foreground">Data-driven marketing campaigns for developer project launches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input Form */}
          <div className="space-y-4">
            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" /> Campaign Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div>
                  <Label className="text-xs">Project Name *</Label>
                  <Input placeholder="e.g. The Riviera Residence" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Location *</Label>
                  <Input placeholder="e.g. BSD City, Tangerang" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Positioning *</Label>
                  <Select value={positioning} onValueChange={setPositioning}>
                    <SelectTrigger className="h-9 text-sm mt-1"><SelectValue placeholder="Select positioning" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                      <SelectItem value="resort">Resort / Hospitality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Target Buyer Segment</Label>
                  <Select value={targetSegment} onValueChange={setTargetSegment}>
                    <SelectTrigger className="h-9 text-sm mt-1"><SelectValue placeholder="Select segment" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-time-buyers">First-time Buyers</SelectItem>
                      <SelectItem value="investors">Investors</SelectItem>
                      <SelectItem value="upgraders">Upgraders</SelectItem>
                      <SelectItem value="expats">Expats / Foreign Buyers</SelectItem>
                      <SelectItem value="hnwi">High-Net-Worth Individuals</SelectItem>
                      <SelectItem value="mixed">Mixed Audience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Pricing Tier</Label>
                  <Select value={pricingTier} onValueChange={setPricingTier}>
                    <SelectTrigger className="h-9 text-sm mt-1"><SelectValue placeholder="Select tier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry-level (&lt; 500 Juta)</SelectItem>
                      <SelectItem value="mid-range">Mid-range (500 Juta - 2 Miliar)</SelectItem>
                      <SelectItem value="premium">Premium (2 - 5 Miliar)</SelectItem>
                      <SelectItem value="ultra-premium">Ultra-Premium (&gt; 5 Miliar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Total Units</Label>
                    <Input placeholder="e.g. 120" value={unitCount} onChange={(e) => setUnitCount(e.target.value)} className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Launch Date</Label>
                    <Input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} className="mt-1 h-9 text-sm" />
                  </div>
                </div>

                <Button className="w-full h-10 mt-2" onClick={handleGenerate} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 animate-pulse" /> Generating…</span>
                  ) : (
                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Generate Campaign</span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            {campaign && (
              <Card className="bg-card/40 border-border/30">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" /> Performance Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {[
                    { label: 'Headline Impact', score: 85, tip: 'Strong emotional trigger' },
                    { label: 'CTA Clarity', score: 92, tip: 'Action-oriented language' },
                    { label: 'Investor Appeal', score: positioning === 'investment' ? 95 : 78, tip: positioning === 'investment' ? 'Investment-first positioning' : 'Consider adding ROI data' },
                    { label: 'Timing Alignment', score: 88, tip: 'Demand cycle match' },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-xs text-foreground">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground">{m.tip}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${m.score >= 85 ? 'text-emerald-400 border-emerald-400/30' : 'text-amber-400 border-amber-400/30'}`}>
                        {m.score}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center + Right: Campaign Output */}
          <div className="lg:col-span-2">
            {!campaign ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-center">
                <div className="p-4 rounded-full bg-muted/20 mb-4">
                  <Megaphone className="h-10 w-10 text-muted-foreground opacity-40" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">No Campaign Yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">Fill in the project details and click Generate to create an AI-powered marketing campaign.</p>
              </div>
            ) : (
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="h-9 mb-4">
                  <TabsTrigger value="content" className="text-xs h-8">Content & Copy</TabsTrigger>
                  <TabsTrigger value="promo" className="text-xs h-8">Promotion Widgets</TabsTrigger>
                  <TabsTrigger value="strategy" className="text-xs h-8">Strategy & Timing</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4 mt-0">
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {/* Headline Card */}
                      <Card className="bg-card/60 border-border/40">
                        <CardContent className="p-5 space-y-4">
                          <EditableBlock label="Marketing Headline" value={campaign.headline} onChange={(v) => updateField('headline', v)} />
                          <EditableBlock label="Subheadline" value={campaign.subheadline} onChange={(v) => updateField('subheadline', v)} />
                          <Separator className="opacity-30" />
                          <EditableBlock label="Promotional Description" value={campaign.description} onChange={(v) => updateField('description', v)} multiline />
                        </CardContent>
                      </Card>

                      {/* Selling Points */}
                      <Card className="bg-card/60 border-border/40">
                        <CardHeader className="pb-2 pt-4 px-5">
                          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-primary" /> Key Investment Selling Points
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-4 space-y-2">
                          {campaign.sellingPoints.map((sp, i) => (
                            <div key={i} className="flex items-start gap-2 group">
                              <span className="text-primary text-xs mt-0.5 font-bold shrink-0">{i + 1}.</span>
                              <EditableBlock label="" value={sp} onChange={(v) => {
                                const pts = [...campaign.sellingPoints];
                                pts[i] = v;
                                updateField('sellingPoints', pts);
                              }} />
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Target & Pricing */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/40 border-border/30">
                          <CardContent className="p-4">
                            <EditableBlock label="Target Audience" value={campaign.targetAudience} onChange={(v) => updateField('targetAudience', v)} multiline />
                          </CardContent>
                        </Card>
                        <Card className="bg-card/40 border-border/30">
                          <CardContent className="p-4">
                            <EditableBlock label="Pricing Strategy" value={campaign.pricingStrategy} onChange={(v) => updateField('pricingStrategy', v)} multiline />
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>

                {/* Promo Widgets Tab */}
                <TabsContent value="promo" className="space-y-4 mt-0">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <BannerPreview campaign={campaign} projectName={projectName} />
                    <div className="grid grid-cols-2 gap-4">
                      <CountdownPreview campaign={campaign} />
                      <EmailPreview campaign={campaign} projectName={projectName} />
                    </div>
                    {/* Editable banner fields */}
                    <Card className="bg-card/40 border-border/30">
                      <CardContent className="p-4 space-y-3">
                        <EditableBlock label="Banner Tagline" value={campaign.bannerTagline} onChange={(v) => updateField('bannerTagline', v)} />
                        <EditableBlock label="CTA Button Text" value={campaign.ctaText} onChange={(v) => updateField('ctaText', v)} />
                        <EditableBlock label="Email Subject" value={campaign.emailSubject} onChange={(v) => updateField('emailSubject', v)} />
                        <EditableBlock label="Email Body" value={campaign.emailBody} onChange={(v) => updateField('emailBody', v)} multiline />
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Strategy Tab */}
                <TabsContent value="strategy" className="space-y-4 mt-0">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <Card className="bg-card/60 border-border/40">
                      <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" /> Recommended Campaign Timing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                            <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Launch Window</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{campaign.campaignTiming.recommendedLaunchWindow}</p>
                          </div>
                          <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 text-center">
                            <Rocket className="h-5 w-5 text-accent-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Pre-launch Duration</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{campaign.campaignTiming.prelaunchDuration}</p>
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/10 border border-border/20 p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-foreground mb-1">Timing Rationale</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{campaign.campaignTiming.reasoning}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Campaign Timeline */}
                    <Card className="bg-card/40 border-border/30">
                      <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-xs font-medium">Suggested Campaign Phases</CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-4">
                        <div className="space-y-3">
                          {[
                            { phase: 'Teaser', duration: '2 weeks', desc: 'Social media teasers, countdown page', color: 'bg-sky-400' },
                            { phase: 'Pre-launch', duration: campaign.campaignTiming.prelaunchDuration, desc: 'Email captures, VIP preview invitations', color: 'bg-primary' },
                            { phase: 'Launch', duration: '1 week', desc: 'Full campaign deployment, open sales', color: 'bg-emerald-400' },
                            { phase: 'Sustain', duration: '4 weeks', desc: 'Retargeting, testimonials, urgency CTAs', color: 'bg-amber-400' },
                          ].map((p, i) => (
                            <div key={p.phase} className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full ${p.color}/20 flex items-center justify-center shrink-0`}>
                                <span className="text-xs font-bold text-foreground">{i + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium text-foreground">{p.phase}</p>
                                  <Badge variant="outline" className="text-[9px]">{p.duration}</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

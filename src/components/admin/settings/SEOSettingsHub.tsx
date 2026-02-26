
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Search, Globe, Image, Tags, FileText, ExternalLink, BarChart3, Shield,
  CheckCircle2, XCircle, AlertTriangle, Eye, Sparkles, Code, Gauge
} from 'lucide-react';

interface SEOSettingsHubProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

const PAGE_SEO_DEFAULTS = [
  { page: 'Home', path: '/', titleKey: 'seoPageHome_title', descKey: 'seoPageHome_desc' },
  { page: 'Dijual', path: '/dijual', titleKey: 'seoPageDijual_title', descKey: 'seoPageDijual_desc' },
  { page: 'Disewa', path: '/disewa', titleKey: 'seoPageDisewa_title', descKey: 'seoPageDisewa_desc' },
  { page: 'Search', path: '/search', titleKey: 'seoPageSearch_title', descKey: 'seoPageSearch_desc' },
  { page: 'About', path: '/about', titleKey: 'seoPageAbout_title', descKey: 'seoPageAbout_desc' },
  { page: 'Contact', path: '/contact', titleKey: 'seoPageContact_title', descKey: 'seoPageContact_desc' },
];

const SEOSettingsHub = ({ settings, loading, onInputChange, onSave }: SEOSettingsHubProps) => {
  const [activeTab, setActiveTab] = useState('on-page');

  // SEO Score Algorithm
  const seoScore = useMemo(() => {
    let score = 0;
    const checks: { label: string; passed: boolean; suggestion: string }[] = [];

    // Title check (50-60 chars)
    const title = settings.seoTitle || '';
    const titleOk = title.length >= 30 && title.length <= 60;
    checks.push({ label: 'SEO Title Length', passed: titleOk, suggestion: titleOk ? 'Title length is optimal' : 'Title should be 30-60 characters' });
    if (titleOk) score += 15;
    else if (title.length > 0) score += 7;

    // Description check (150-160 chars)
    const desc = settings.seoDescription || '';
    const descOk = desc.length >= 120 && desc.length <= 160;
    checks.push({ label: 'Meta Description', passed: descOk, suggestion: descOk ? 'Description length is optimal' : 'Description should be 120-160 characters' });
    if (descOk) score += 15;
    else if (desc.length > 0) score += 7;

    // Keywords
    const hasKeywords = (settings.seoKeywords || '').trim().length > 0;
    checks.push({ label: 'Keywords Defined', passed: hasKeywords, suggestion: hasKeywords ? 'Keywords are set' : 'Add target keywords' });
    if (hasKeywords) score += 10;

    // OG Image
    const hasOgImage = (settings.ogImage || '').trim().length > 0;
    checks.push({ label: 'Open Graph Image', passed: hasOgImage, suggestion: hasOgImage ? 'OG image is set' : 'Add a social sharing image (1200x630px recommended)' });
    if (hasOgImage) score += 10;

    // Open Graph enabled
    const ogEnabled = settings.enableOpenGraph !== false;
    checks.push({ label: 'Open Graph Enabled', passed: ogEnabled, suggestion: ogEnabled ? 'Open Graph is active' : 'Enable Open Graph for better social sharing' });
    if (ogEnabled) score += 5;

    // Schema markup
    const schemaEnabled = settings.enableSchemaMarkup !== false;
    checks.push({ label: 'Schema Markup', passed: schemaEnabled, suggestion: schemaEnabled ? 'Structured data is active' : 'Enable schema markup for rich snippets' });
    if (schemaEnabled) score += 10;

    // Sitemap
    const sitemapEnabled = settings.enableSitemap !== false;
    checks.push({ label: 'XML Sitemap', passed: sitemapEnabled, suggestion: sitemapEnabled ? 'Sitemap generation is active' : 'Enable sitemap for better indexing' });
    if (sitemapEnabled) score += 10;

    // Canonical URLs
    const canonicalEnabled = settings.enableCanonicalUrls !== false;
    checks.push({ label: 'Canonical URLs', passed: canonicalEnabled, suggestion: canonicalEnabled ? 'Canonical URLs are active' : 'Enable canonical URLs to prevent duplicate content' });
    if (canonicalEnabled) score += 5;

    // Analytics connected
    const hasAnalytics = (settings.googleAnalyticsId || '').trim().length > 0;
    checks.push({ label: 'Analytics Connected', passed: hasAnalytics, suggestion: hasAnalytics ? 'Google Analytics is connected' : 'Connect Google Analytics to track performance' });
    if (hasAnalytics) score += 10;

    // Google Search Console verification
    const hasGSC = (settings.googleSiteVerification || '').trim().length > 0;
    checks.push({ label: 'Search Console Verified', passed: hasGSC, suggestion: hasGSC ? 'Google Search Console verified' : 'Verify with Google Search Console' });
    if (hasGSC) score += 10;

    return { score, checks };
  }, [settings]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-chart-3';
    if (score >= 50) return 'text-chart-4';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 60) return { label: 'Good', variant: 'secondary' as const };
    if (score >= 40) return { label: 'Needs Work', variant: 'outline' as const };
    return { label: 'Poor', variant: 'destructive' as const };
  };

  // Google preview snippet
  const googlePreviewTitle = settings.seoTitle || settings.siteName || 'Your Page Title';
  const googlePreviewDesc = settings.seoDescription || settings.siteDescription || 'Your page description will appear here...';
  const googlePreviewUrl = 'astra-villa-realty.lovable.app';

  return (
    <div className="space-y-3">
      {/* SEO Score Overview Card */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <Gauge className="h-3.5 w-3.5 text-primary" />
              SEO Health Score
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getScoreColor(seoScore.score)}`}>{seoScore.score}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
              <Badge variant={getScoreBadge(seoScore.score).variant} className="text-[8px] h-4 px-1.5">
                {getScoreBadge(seoScore.score).label}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          <Progress value={seoScore.score} className="h-1.5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {seoScore.checks.map((check, i) => (
              <div key={i} className="flex items-center gap-1 text-[8px]">
                {check.passed ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-chart-3 shrink-0" />
                ) : (
                  <XCircle className="h-2.5 w-2.5 text-destructive shrink-0" />
                )}
                <span className={check.passed ? 'text-muted-foreground' : 'text-foreground'}>{check.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Internal Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-7 w-auto gap-0.5 bg-muted/40 p-0.5 rounded-lg border border-border/30">
            <TabsTrigger value="on-page" className="text-[10px] h-6 px-2 gap-1"><Search className="h-2.5 w-2.5" />On-Page</TabsTrigger>
            <TabsTrigger value="social" className="text-[10px] h-6 px-2 gap-1"><Image className="h-2.5 w-2.5" />Social</TabsTrigger>
            <TabsTrigger value="schema" className="text-[10px] h-6 px-2 gap-1"><Code className="h-2.5 w-2.5" />Schema</TabsTrigger>
            <TabsTrigger value="technical" className="text-[10px] h-6 px-2 gap-1"><FileText className="h-2.5 w-2.5" />Technical</TabsTrigger>
            <TabsTrigger value="analytics" className="text-[10px] h-6 px-2 gap-1"><BarChart3 className="h-2.5 w-2.5" />Analytics</TabsTrigger>
            <TabsTrigger value="verification" className="text-[10px] h-6 px-2 gap-1"><Shield className="h-2.5 w-2.5" />Verification</TabsTrigger>
            <TabsTrigger value="audit" className="text-[10px] h-6 px-2 gap-1"><Sparkles className="h-2.5 w-2.5" />Audit</TabsTrigger>
            <TabsTrigger value="pages" className="text-[10px] h-6 px-2 gap-1"><Globe className="h-2.5 w-2.5" />Pages</TabsTrigger>
          </TabsList>
        </div>

        {/* ON-PAGE SEO */}
        <TabsContent value="on-page" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-primary" />
                On-Page SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">SEO Title</Label>
                  <Input value={settings.seoTitle || ''} onChange={(e) => onInputChange('seoTitle', e.target.value)} placeholder="Primary SEO title" className="h-7 text-xs bg-background/50 border-border/50" />
                  <p className="text-[8px] text-muted-foreground">{(settings.seoTitle || '').length}/60 chars</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Title Template</Label>
                  <Input value={settings.seoTitleTemplate || ''} onChange={(e) => onInputChange('seoTitleTemplate', e.target.value)} placeholder="{page} | {siteName}" className="h-7 text-xs bg-background/50 border-border/50" />
                  <p className="text-[8px] text-muted-foreground">Use {'{page}'}, {'{siteName}'} placeholders</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Meta Description</Label>
                <Textarea value={settings.seoDescription || ''} onChange={(e) => onInputChange('seoDescription', e.target.value)} placeholder="Compelling description for search results (120-160 chars)" rows={2} className="text-xs min-h-[40px] bg-background/50 border-border/50" />
                <p className="text-[8px] text-muted-foreground">{(settings.seoDescription || '').length}/160 chars</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Keywords</Label>
                  <Input value={settings.seoKeywords || ''} onChange={(e) => onInputChange('seoKeywords', e.target.value)} placeholder="property, real estate, villa, bali" className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Default Robots</Label>
                  <Select value={settings.seoDefaultRobots || 'index,follow'} onValueChange={(v) => onInputChange('seoDefaultRobots', v)}>
                    <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index,follow">Index, Follow</SelectItem>
                      <SelectItem value="index,nofollow">Index, No Follow</SelectItem>
                      <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                      <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Google Preview */}
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Eye className="h-2.5 w-2.5" /> Google Search Preview
                </Label>
                <div className="p-2 bg-background rounded border border-border/50 space-y-0.5">
                  <p className="text-[10px] text-muted-foreground truncate">{googlePreviewUrl}</p>
                  <p className="text-sm text-primary font-medium truncate">{googlePreviewTitle}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{googlePreviewDesc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPEN GRAPH & SOCIAL */}
        <TabsContent value="social" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Image className="h-3.5 w-3.5 text-secondary" />
                Open Graph & Social Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label className="text-[10px] font-medium text-foreground">Enable Open Graph</Label>
                  <p className="text-[8px] text-muted-foreground">Optimize sharing on Facebook, LinkedIn</p>
                </div>
                <Switch checked={settings.enableOpenGraph !== false} onCheckedChange={(c) => onInputChange('enableOpenGraph', c)} className="scale-75" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">OG Title</Label>
                  <Input value={settings.ogTitle || ''} onChange={(e) => onInputChange('ogTitle', e.target.value)} placeholder="Social share title" className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">OG Site Name</Label>
                  <Input value={settings.ogSiteName || ''} onChange={(e) => onInputChange('ogSiteName', e.target.value)} placeholder="Site name for OG" className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">OG Description</Label>
                <Textarea value={settings.ogDescription || ''} onChange={(e) => onInputChange('ogDescription', e.target.value)} placeholder="Description when shared on social media" rows={2} className="text-xs min-h-[40px] bg-background/50 border-border/50" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">OG Image URL</Label>
                  <Input value={settings.ogImage || ''} onChange={(e) => onInputChange('ogImage', e.target.value)} placeholder="https://example.com/og-image.jpg" className="h-7 text-xs bg-background/50 border-border/50" />
                  <p className="text-[8px] text-muted-foreground">Recommended: 1200×630px</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Twitter Card Type</Label>
                  <Select value={settings.twitterCard || 'summary_large_image'} onValueChange={(v) => onInputChange('twitterCard', v)}>
                    <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="player">Player</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Twitter Handle</Label>
                <Input value={settings.twitterSite || ''} onChange={(e) => onInputChange('twitterSite', e.target.value)} placeholder="@yourhandle" className="h-7 text-xs bg-background/50 border-border/50" />
              </div>

              {/* Social Preview Simulator */}
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Eye className="h-2.5 w-2.5" /> Facebook Share Preview
                </Label>
                <div className="rounded border border-border/50 overflow-hidden bg-background">
                  {settings.ogImage && (
                    <div className="h-28 bg-muted flex items-center justify-center overflow-hidden">
                      <img src={settings.ogImage} alt="OG Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="p-2 space-y-0.5">
                    <p className="text-[8px] text-muted-foreground uppercase">{googlePreviewUrl}</p>
                    <p className="text-[11px] font-semibold text-foreground truncate">{settings.ogTitle || googlePreviewTitle}</p>
                    <p className="text-[9px] text-muted-foreground line-clamp-2">{settings.ogDescription || googlePreviewDesc}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCHEMA MARKUP */}
        <TabsContent value="schema" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-accent" />
                Schema Markup & Structured Data
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label className="text-[10px] font-medium text-foreground">Enable Schema Markup</Label>
                  <p className="text-[8px] text-muted-foreground">Add JSON-LD structured data to pages</p>
                </div>
                <Switch checked={settings.enableSchemaMarkup !== false} onCheckedChange={(c) => onInputChange('enableSchemaMarkup', c)} className="scale-75" />
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Organization Type</Label>
                <Select value={settings.organizationType || 'RealEstateAgent'} onValueChange={(v) => onInputChange('organizationType', v)}>
                  <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RealEstateAgent">Real Estate Agent</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                    <SelectItem value="LocalBusiness">Local Business</SelectItem>
                    <SelectItem value="Corporation">Corporation</SelectItem>
                    <SelectItem value="RealEstateAgency">Real Estate Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Organization Name</Label>
                  <Input value={settings.organizationName || ''} onChange={(e) => onInputChange('organizationName', e.target.value)} placeholder="Your company name" className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Organization Logo URL</Label>
                  <Input value={settings.organizationLogo || ''} onChange={(e) => onInputChange('organizationLogo', e.target.value)} placeholder="https://..." className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
              </div>

              {/* Schema Type Toggles */}
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">JSON-LD Schema Types</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'schemaRealEstate', label: 'RealEstateListing', desc: 'Property listings' },
                    { key: 'schemaBreadcrumb', label: 'BreadcrumbList', desc: 'Navigation breadcrumbs' },
                    { key: 'schemaSearchAction', label: 'SearchAction', desc: 'Sitelinks search box' },
                    { key: 'schemaFAQ', label: 'FAQPage', desc: 'FAQ rich snippets' },
                  ].map(s => (
                    <div key={s.key} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                      <div>
                        <Label className="text-[9px] font-medium text-foreground">{s.label}</Label>
                        <p className="text-[7px] text-muted-foreground">{s.desc}</p>
                      </div>
                      <Switch checked={settings[s.key] !== false} onCheckedChange={(c) => onInputChange(s.key, c)} className="scale-[0.65]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Live JSON-LD Preview */}
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Code className="h-2.5 w-2.5" /> JSON-LD Preview
                </Label>
                <pre className="p-2 bg-muted/30 rounded border border-border/30 text-[8px] text-muted-foreground overflow-x-auto max-h-32">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": settings.organizationType || "RealEstateAgent",
  "name": settings.organizationName || settings.siteName || "Your Organization",
  "url": "https://astra-villa-realty.lovable.app",
  "logo": settings.organizationLogo || "",
  "description": settings.seoDescription || "",
  "sameAs": []
}, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TECHNICAL SEO */}
        <TabsContent value="technical" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Technical SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'enableSitemap', label: 'XML Sitemap', desc: 'Auto-generate sitemap' },
                  { key: 'enableRobotsTxt', label: 'Robots.txt', desc: 'Manage crawl rules' },
                  { key: 'enableCanonicalUrls', label: 'Canonical URLs', desc: 'Prevent duplicate content' },
                  { key: 'enableSchemaMarkup', label: 'Structured Data', desc: 'JSON-LD on pages' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                    <div>
                      <Label className="text-[10px] font-medium text-foreground">{item.label}</Label>
                      <p className="text-[8px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={settings[item.key] !== false} onCheckedChange={(c) => onInputChange(item.key, c)} className="scale-75" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Hreflang</Label>
                  <Select value={settings.seoHreflang || 'id'} onValueChange={(v) => onInputChange('seoHreflang', v)}>
                    <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesian (id)</SelectItem>
                      <SelectItem value="en">English (en)</SelectItem>
                      <SelectItem value="id,en">Multi: ID + EN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Default Robots</Label>
                  <Select value={settings.seoDefaultRobots || 'index,follow'} onValueChange={(v) => onInputChange('seoDefaultRobots', v)}>
                    <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index,follow">Index, Follow</SelectItem>
                      <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                      <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Custom Meta Tags</Label>
                <Textarea value={settings.customMetaTags || ''} onChange={(e) => onInputChange('customMetaTags', e.target.value)} placeholder='<meta name="custom" content="value" />' rows={3} className="text-xs min-h-[50px] bg-background/50 border-border/50 font-mono" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS & TRACKING */}
        <TabsContent value="analytics" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-destructive" />
                Analytics & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Google Analytics ID</Label>
                  <Input value={settings.googleAnalyticsId || ''} onChange={(e) => onInputChange('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Google Tag Manager</Label>
                  <Input value={settings.googleTagManagerId || ''} onChange={(e) => onInputChange('googleTagManagerId', e.target.value)} placeholder="GTM-XXXXXXX" className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Facebook Pixel ID</Label>
                  <Input value={settings.facebookPixelId || ''} onChange={(e) => onInputChange('facebookPixelId', e.target.value)} placeholder="123456789012345" className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Hotjar ID</Label>
                  <Input value={settings.hotjarId || ''} onChange={(e) => onInputChange('hotjarId', e.target.value)} placeholder="1234567" className="h-7 text-xs bg-background/50 border-border/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                  <div>
                    <Label className="text-[10px] font-medium text-foreground">Enable Analytics</Label>
                    <p className="text-[8px] text-muted-foreground">Track user behavior</p>
                  </div>
                  <Switch checked={settings.enableAnalytics !== false} onCheckedChange={(c) => onInputChange('enableAnalytics', c)} className="scale-75" />
                </div>
                <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                  <div>
                    <Label className="text-[10px] font-medium text-foreground">Cookie Consent</Label>
                    <p className="text-[8px] text-muted-foreground">Show consent banner</p>
                  </div>
                  <Switch checked={settings.enableCookieConsent !== false} onCheckedChange={(c) => onInputChange('enableCookieConsent', c)} className="scale-75" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEBMASTER VERIFICATION */}
        <TabsContent value="verification" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-accent" />
                Search Engine Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'googleSiteVerification', label: 'Google Search Console', placeholder: 'Google verification code' },
                  { key: 'bingSiteVerification', label: 'Bing Webmaster', placeholder: 'Bing verification code' },
                  { key: 'yandexVerification', label: 'Yandex Webmaster', placeholder: 'Yandex verification code' },
                  { key: 'pinterestVerification', label: 'Pinterest', placeholder: 'Pinterest verification code' },
                ].map(item => (
                  <div key={item.key} className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</Label>
                    <Input value={settings[item.key] || ''} onChange={(e) => onInputChange(item.key, e.target.value)} placeholder={item.placeholder} className="h-7 text-xs bg-background/50 border-border/50" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO AUDIT */}
        <TabsContent value="audit" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-chart-4" />
                SEO Audit & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
                <div className={`text-2xl font-bold ${getScoreColor(seoScore.score)}`}>{seoScore.score}</div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Overall SEO Score</p>
                  <p className="text-[9px] text-muted-foreground">{seoScore.checks.filter(c => c.passed).length}/{seoScore.checks.length} checks passed</p>
                </div>
                <Badge variant={getScoreBadge(seoScore.score).variant} className="ml-auto text-[9px]">
                  {getScoreBadge(seoScore.score).label}
                </Badge>
              </div>

              <div className="space-y-1.5">
                {seoScore.checks.map((check, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded border ${check.passed ? 'bg-chart-3/5 border-chart-3/20' : 'bg-destructive/5 border-destructive/20'}`}>
                    {check.passed ? (
                      <CheckCircle2 className="h-3 w-3 text-chart-3 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{check.label}</p>
                      <p className="text-[8px] text-muted-foreground">{check.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label className="text-[10px] font-medium text-foreground">Auto-Run Audit on Save</Label>
                  <p className="text-[8px] text-muted-foreground">Automatically check SEO score when saving settings</p>
                </div>
                <Switch checked={settings.seoAuditAutoRun !== false} onCheckedChange={(c) => onInputChange('seoAuditAutoRun', c)} className="scale-75" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAGE-LEVEL SEO */}
        <TabsContent value="pages" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Page-Level SEO Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[8px] h-7 px-2">Page</TableHead>
                    <TableHead className="text-[8px] h-7 px-2">Path</TableHead>
                    <TableHead className="text-[8px] h-7 px-2">Custom Title</TableHead>
                    <TableHead className="text-[8px] h-7 px-2">Custom Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PAGE_SEO_DEFAULTS.map(page => (
                    <TableRow key={page.page}>
                      <TableCell className="text-[9px] font-medium px-2 py-1">{page.page}</TableCell>
                      <TableCell className="text-[9px] text-muted-foreground px-2 py-1">{page.path}</TableCell>
                      <TableCell className="px-2 py-1">
                        <Input
                          value={settings[page.titleKey] || ''}
                          onChange={(e) => onInputChange(page.titleKey, e.target.value)}
                          placeholder={`${page.page} | ${settings.siteName || 'Site'}`}
                          className="h-6 text-[9px] bg-background/50 border-border/50"
                        />
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        <Input
                          value={settings[page.descKey] || ''}
                          onChange={(e) => onInputChange(page.descKey, e.target.value)}
                          placeholder="Custom meta description..."
                          className="h-6 text-[9px] bg-background/50 border-border/50"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={loading} size="sm" className="h-7 text-xs px-4">
          {loading ? 'Saving...' : 'Save SEO Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SEOSettingsHub;

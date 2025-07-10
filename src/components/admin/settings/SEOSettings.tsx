import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, Globe, Tags, Image, FileText, ExternalLink } from 'lucide-react';

interface SEOSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const SEOSettings = ({ settings, onInputChange }: SEOSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Basic SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Basic SEO Settings
          </CardTitle>
          <CardDescription>Configure fundamental SEO settings for your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Site Title</Label>
              <Input
                id="seoTitle"
                value={settings.seoTitle || settings.siteName || ''}
                onChange={(e) => onInputChange('seoTitle', e.target.value)}
                placeholder="Enter your site title"
              />
              <p className="text-xs text-muted-foreground">Appears in browser tabs and search results</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoTagline">Site Tagline</Label>
              <Input
                id="seoTagline"
                value={settings.seoTagline || ''}
                onChange={(e) => onInputChange('seoTagline', e.target.value)}
                placeholder="Your site tagline"
              />
              <p className="text-xs text-muted-foreground">Brief description of your site</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">Meta Description</Label>
            <Textarea
              id="seoDescription"
              value={settings.seoDescription || settings.siteDescription || ''}
              onChange={(e) => onInputChange('seoDescription', e.target.value)}
              placeholder="Enter your site description for search engines"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">155-160 characters recommended. Appears in search results.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoKeywords">Meta Keywords</Label>
            <Input
              id="seoKeywords"
              value={settings.seoKeywords || ''}
              onChange={(e) => onInputChange('seoKeywords', e.target.value)}
              placeholder="property, real estate, villa, rental"
            />
            <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Open Graph & Social Media
          </CardTitle>
          <CardDescription>Configure how your site appears when shared on social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableOpenGraph">Enable Open Graph</Label>
              <p className="text-xs text-muted-foreground">Generate Open Graph meta tags</p>
            </div>
            <Switch
              id="enableOpenGraph"
              checked={settings.enableOpenGraph !== false}
              onCheckedChange={(checked) => onInputChange('enableOpenGraph', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ogTitle">Open Graph Title</Label>
              <Input
                id="ogTitle"
                value={settings.ogTitle || settings.seoTitle || settings.siteName || ''}
                onChange={(e) => onInputChange('ogTitle', e.target.value)}
                placeholder="Title for social media"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogSiteName">Site Name</Label>
              <Input
                id="ogSiteName"
                value={settings.ogSiteName || settings.siteName || ''}
                onChange={(e) => onInputChange('ogSiteName', e.target.value)}
                placeholder="Your site name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogDescription">Open Graph Description</Label>
            <Textarea
              id="ogDescription"
              value={settings.ogDescription || settings.seoDescription || ''}
              onChange={(e) => onInputChange('ogDescription', e.target.value)}
              placeholder="Description for social media shares"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogImage">Open Graph Image URL</Label>
            <Input
              id="ogImage"
              value={settings.ogImage || ''}
              onChange={(e) => onInputChange('ogImage', e.target.value)}
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground">Recommended size: 1200x630px</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitterCard">Twitter Card Type</Label>
              <Select
                value={settings.twitterCard || 'summary_large_image'}
                onValueChange={(value) => onInputChange('twitterCard', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterSite">Twitter Site Handle</Label>
              <Input
                id="twitterSite"
                value={settings.twitterSite || ''}
                onChange={(e) => onInputChange('twitterSite', e.target.value)}
                placeholder="@yoursite"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Analytics & Tracking
          </CardTitle>
          <CardDescription>Configure tracking and analytics services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => onInputChange('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
              <Input
                id="googleTagManagerId"
                value={settings.googleTagManagerId || ''}
                onChange={(e) => onInputChange('googleTagManagerId', e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={settings.facebookPixelId || ''}
                onChange={(e) => onInputChange('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotjarId">Hotjar ID</Label>
              <Input
                id="hotjarId"
                value={settings.hotjarId || ''}
                onChange={(e) => onInputChange('hotjarId', e.target.value)}
                placeholder="1234567"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableAnalytics">Enable Analytics Tracking</Label>
                <p className="text-xs text-muted-foreground">Track user behavior and page views</p>
              </div>
              <Switch
                id="enableAnalytics"
                checked={settings.enableAnalytics !== false}
                onCheckedChange={(checked) => onInputChange('enableAnalytics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCookieConsent">Enable Cookie Consent</Label>
                <p className="text-xs text-muted-foreground">Show cookie consent banner</p>
              </div>
              <Switch
                id="enableCookieConsent"
                checked={settings.enableCookieConsent !== false}
                onCheckedChange={(checked) => onInputChange('enableCookieConsent', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schema Markup & Technical SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Technical SEO
          </CardTitle>
          <CardDescription>Advanced SEO configuration and schema markup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableSitemap">Auto-Generate Sitemap</Label>
                <p className="text-xs text-muted-foreground">Automatically create XML sitemap</p>
              </div>
              <Switch
                id="enableSitemap"
                checked={settings.enableSitemap !== false}
                onCheckedChange={(checked) => onInputChange('enableSitemap', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableRobotsTxt">Generate Robots.txt</Label>
                <p className="text-xs text-muted-foreground">Control search engine crawling</p>
              </div>
              <Switch
                id="enableRobotsTxt"
                checked={settings.enableRobotsTxt !== false}
                onCheckedChange={(checked) => onInputChange('enableRobotsTxt', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableSchemaMarkup">Enable Schema Markup</Label>
                <p className="text-xs text-muted-foreground">Add structured data to pages</p>
              </div>
              <Switch
                id="enableSchemaMarkup"
                checked={settings.enableSchemaMarkup !== false}
                onCheckedChange={(checked) => onInputChange('enableSchemaMarkup', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCanonicalUrls">Canonical URLs</Label>
                <p className="text-xs text-muted-foreground">Prevent duplicate content issues</p>
              </div>
              <Switch
                id="enableCanonicalUrls"
                checked={settings.enableCanonicalUrls !== false}
                onCheckedChange={(checked) => onInputChange('enableCanonicalUrls', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="organizationType">Organization Type</Label>
            <Select
              value={settings.organizationType || 'RealEstateAgent'}
              onValueChange={(value) => onInputChange('organizationType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RealEstateAgent">Real Estate Agent</SelectItem>
                <SelectItem value="Organization">Organization</SelectItem>
                <SelectItem value="LocalBusiness">Local Business</SelectItem>
                <SelectItem value="Corporation">Corporation</SelectItem>
                <SelectItem value="WebSite">Website</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                value={settings.organizationName || settings.siteName || ''}
                onChange={(e) => onInputChange('organizationName', e.target.value)}
                placeholder="Your organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationLogo">Organization Logo URL</Label>
              <Input
                id="organizationLogo"
                value={settings.organizationLogo || ''}
                onChange={(e) => onInputChange('organizationLogo', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMetaTags">Custom Meta Tags</Label>
            <Textarea
              id="customMetaTags"
              value={settings.customMetaTags || ''}
              onChange={(e) => onInputChange('customMetaTags', e.target.value)}
              placeholder="<meta name='custom' content='value' />"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Add custom meta tags (HTML format)</p>
          </div>
        </CardContent>
      </Card>

      {/* Search Console & Webmaster Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Webmaster Tools
          </CardTitle>
          <CardDescription>Verification codes for search engines and webmaster tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="googleSiteVerification">Google Search Console</Label>
              <Input
                id="googleSiteVerification"
                value={settings.googleSiteVerification || ''}
                onChange={(e) => onInputChange('googleSiteVerification', e.target.value)}
                placeholder="Verification meta tag content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bingSiteVerification">Bing Webmaster Tools</Label>
              <Input
                id="bingSiteVerification"
                value={settings.bingSiteVerification || ''}
                onChange={(e) => onInputChange('bingSiteVerification', e.target.value)}
                placeholder="Bing verification code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yandexVerification">Yandex Webmaster</Label>
              <Input
                id="yandexVerification"
                value={settings.yandexVerification || ''}
                onChange={(e) => onInputChange('yandexVerification', e.target.value)}
                placeholder="Yandex verification code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pinterestVerification">Pinterest</Label>
              <Input
                id="pinterestVerification"
                value={settings.pinterestVerification || ''}
                onChange={(e) => onInputChange('pinterestVerification', e.target.value)}
                placeholder="Pinterest verification code"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOSettings;
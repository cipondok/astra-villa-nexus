
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Globe, Search, Tags, FileText, ExternalLink, Image } from 'lucide-react';

interface GeneralSettingsProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

const GeneralSettings = ({ settings, loading, onInputChange, onSave }: GeneralSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Basic Site Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Basic Site Configuration
          </CardTitle>
          <CardDescription>Fundamental site information and operational settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName || ''}
                onChange={(e) => onInputChange('siteName', e.target.value)}
                placeholder="Enter your site name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteTagline">Site Tagline</Label>
              <Input
                id="siteTagline"
                value={settings.seoTagline || ''}
                onChange={(e) => onInputChange('seoTagline', e.target.value)}
                placeholder="Brief description or slogan"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription || ''}
              onChange={(e) => onInputChange('siteDescription', e.target.value)}
              placeholder="Describe your website's purpose and content"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Temporarily disable site access</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode || false}
                  onCheckedChange={(checked) => onInputChange('maintenanceMode', checked)}
                />
                {settings.maintenanceMode && (
                  <Badge variant="destructive">Under Maintenance</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="registrationEnabled">User Registration</Label>
                <p className="text-xs text-muted-foreground">Allow new users to register</p>
              </div>
              <Switch
                id="registrationEnabled"
                checked={settings.registrationEnabled !== false}
                onCheckedChange={(checked) => onInputChange('registrationEnabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Configuration
          </CardTitle>
          <CardDescription>Search engine optimization and meta information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={settings.seoTitle || settings.siteName || ''}
                onChange={(e) => onInputChange('seoTitle', e.target.value)}
                placeholder="Title for search engines"
              />
              <p className="text-xs text-muted-foreground">Appears in search results and browser tabs</p>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">Meta Description</Label>
            <Textarea
              id="seoDescription"
              value={settings.seoDescription || settings.siteDescription || ''}
              onChange={(e) => onInputChange('seoDescription', e.target.value)}
              placeholder="Description for search engines (155-160 characters recommended)"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media & Open Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Social Media Integration
          </CardTitle>
          <CardDescription>Configure how your site appears when shared on social platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableOpenGraph">Enable Open Graph</Label>
              <p className="text-xs text-muted-foreground">Optimize sharing on Facebook, LinkedIn, etc.</p>
            </div>
            <Switch
              id="enableOpenGraph"
              checked={settings.enableOpenGraph !== false}
              onCheckedChange={(checked) => onInputChange('enableOpenGraph', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ogImage">Social Sharing Image</Label>
              <Input
                id="ogImage"
                value={settings.ogImage || ''}
                onChange={(e) => onInputChange('ogImage', e.target.value)}
                placeholder="https://example.com/share-image.jpg"
              />
              <p className="text-xs text-muted-foreground">Recommended: 1200x630px</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterSite">Twitter Handle</Label>
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
          <CardDescription>Website analytics and user tracking configuration</CardDescription>
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
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={settings.facebookPixelId || ''}
                onChange={(e) => onInputChange('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableAnalytics">Enable Analytics</Label>
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
                <Label htmlFor="enableCookieConsent">Cookie Consent</Label>
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

      {/* Technical Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Technical SEO
          </CardTitle>
          <CardDescription>Advanced SEO and search engine configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableSitemap">Auto Sitemap</Label>
                <p className="text-xs text-muted-foreground">Generate XML sitemap automatically</p>
              </div>
              <Switch
                id="enableSitemap"
                checked={settings.enableSitemap !== false}
                onCheckedChange={(checked) => onInputChange('enableSitemap', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableSchemaMarkup">Schema Markup</Label>
                <p className="text-xs text-muted-foreground">Add structured data to pages</p>
              </div>
              <Switch
                id="enableSchemaMarkup"
                checked={settings.enableSchemaMarkup !== false}
                onCheckedChange={(checked) => onInputChange('enableSchemaMarkup', checked)}
              />
            </div>
          </div>

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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Webmaster Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Search Engine Verification
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
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={onSave} disabled={loading} size="lg">
          {loading ? 'Saving All Settings...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;

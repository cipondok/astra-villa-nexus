
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Search, Tags, FileText, ExternalLink, Image } from 'lucide-react';

interface GeneralSettingsProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

const GeneralSettings = ({ settings, loading, onInputChange, onSave }: GeneralSettingsProps) => {
  return (
    <div className="space-y-4">
      {/* Basic Site Configuration */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Globe className="h-4 w-4 text-blue-500" />
            Basic Site Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="siteName" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName || ''}
                onChange={(e) => onInputChange('siteName', e.target.value)}
                placeholder="Enter your site name"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="siteTagline" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tagline</Label>
              <Input
                id="siteTagline"
                value={settings.seoTagline || ''}
                onChange={(e) => onInputChange('seoTagline', e.target.value)}
                placeholder="Brief description or slogan"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="siteDescription" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription || ''}
              onChange={(e) => onInputChange('siteDescription', e.target.value)}
              placeholder="Describe your website's purpose"
              rows={2}
              className="text-xs min-h-[50px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="maintenanceMode" className="text-xs font-medium">Maintenance Mode</Label>
                <p className="text-[9px] text-muted-foreground">Temporarily disable access</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode || false}
                  onCheckedChange={(checked) => onInputChange('maintenanceMode', checked)}
                />
                {settings.maintenanceMode && (
                  <Badge variant="destructive" className="text-[9px]">On</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="registrationEnabled" className="text-xs font-medium">User Registration</Label>
                <p className="text-[9px] text-muted-foreground">Allow new users</p>
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
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4 text-green-500" />
            SEO Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="seoTitle" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">SEO Title</Label>
              <Input
                id="seoTitle"
                value={settings.seoTitle || settings.siteName || ''}
                onChange={(e) => onInputChange('seoTitle', e.target.value)}
                placeholder="Title for search engines"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seoKeywords" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Keywords</Label>
              <Input
                id="seoKeywords"
                value={settings.seoKeywords || ''}
                onChange={(e) => onInputChange('seoKeywords', e.target.value)}
                placeholder="property, real estate, villa"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="seoDescription" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Meta Description</Label>
            <Textarea
              id="seoDescription"
              value={settings.seoDescription || settings.siteDescription || ''}
              onChange={(e) => onInputChange('seoDescription', e.target.value)}
              placeholder="Description for search engines (155-160 chars)"
              rows={2}
              className="text-xs min-h-[50px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Integration */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Image className="h-4 w-4 text-purple-500" />
            Social Media Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
            <div>
              <Label htmlFor="enableOpenGraph" className="text-xs font-medium">Enable Open Graph</Label>
              <p className="text-[9px] text-muted-foreground">Optimize sharing on Facebook, LinkedIn</p>
            </div>
            <Switch
              id="enableOpenGraph"
              checked={settings.enableOpenGraph !== false}
              onCheckedChange={(checked) => onInputChange('enableOpenGraph', checked)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ogImage" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Social Image URL</Label>
              <Input
                id="ogImage"
                value={settings.ogImage || ''}
                onChange={(e) => onInputChange('ogImage', e.target.value)}
                placeholder="https://example.com/share.jpg"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="twitterSite" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Twitter Handle</Label>
              <Input
                id="twitterSite"
                value={settings.twitterSite || ''}
                onChange={(e) => onInputChange('twitterSite', e.target.value)}
                placeholder="@yoursite"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Tags className="h-4 w-4 text-yellow-500" />
            Analytics & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="googleAnalyticsId" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => onInputChange('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="facebookPixelId" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={settings.facebookPixelId || ''}
                onChange={(e) => onInputChange('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="enableAnalytics" className="text-xs font-medium">Enable Analytics</Label>
                <p className="text-[9px] text-muted-foreground">Track user behavior</p>
              </div>
              <Switch
                id="enableAnalytics"
                checked={settings.enableAnalytics !== false}
                onCheckedChange={(checked) => onInputChange('enableAnalytics', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="enableCookieConsent" className="text-xs font-medium">Cookie Consent</Label>
                <p className="text-[9px] text-muted-foreground">Show consent banner</p>
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

      {/* Technical SEO */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-red-500" />
            Technical SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="enableSitemap" className="text-xs font-medium">Auto Sitemap</Label>
                <p className="text-[9px] text-muted-foreground">Generate XML sitemap</p>
              </div>
              <Switch
                id="enableSitemap"
                checked={settings.enableSitemap !== false}
                onCheckedChange={(checked) => onInputChange('enableSitemap', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="enableSchemaMarkup" className="text-xs font-medium">Schema Markup</Label>
                <p className="text-[9px] text-muted-foreground">Structured data</p>
              </div>
              <Switch
                id="enableSchemaMarkup"
                checked={settings.enableSchemaMarkup !== false}
                onCheckedChange={(checked) => onInputChange('enableSchemaMarkup', checked)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="organizationType" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Organization Type</Label>
            <Select
              value={settings.organizationType || 'RealEstateAgent'}
              onValueChange={(value) => onInputChange('organizationType', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
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
      <Card className="border-l-4 border-l-cyan-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ExternalLink className="h-4 w-4 text-cyan-500" />
            Search Engine Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="googleSiteVerification" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Google Search Console</Label>
              <Input
                id="googleSiteVerification"
                value={settings.googleSiteVerification || ''}
                onChange={(e) => onInputChange('googleSiteVerification', e.target.value)}
                placeholder="Verification meta tag"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bingSiteVerification" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Bing Webmaster</Label>
              <Input
                id="bingSiteVerification"
                value={settings.bingSiteVerification || ''}
                onChange={(e) => onInputChange('bingSiteVerification', e.target.value)}
                placeholder="Bing verification code"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={loading} size="sm" className="h-8 text-xs">
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;


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
    <div className="space-y-3">
      {/* Basic Site Configuration */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Globe className="h-3.5 w-3.5 text-primary" />
            Basic Site Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="siteName" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName || ''}
                onChange={(e) => onInputChange('siteName', e.target.value)}
                placeholder="Enter your site name"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="siteTagline" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Tagline</Label>
              <Input
                id="siteTagline"
                value={settings.seoTagline || ''}
                onChange={(e) => onInputChange('seoTagline', e.target.value)}
                placeholder="Brief description or slogan"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="siteDescription" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription || ''}
              onChange={(e) => onInputChange('siteDescription', e.target.value)}
              placeholder="Describe your website's purpose"
              rows={2}
              className="text-xs min-h-[40px] bg-background/50 border-border/50"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
              <div>
                <Label htmlFor="maintenanceMode" className="text-[10px] font-medium text-foreground">Maintenance Mode</Label>
                <p className="text-[8px] text-muted-foreground">Temporarily disable access</p>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode || false}
                  onCheckedChange={(checked) => onInputChange('maintenanceMode', checked)}
                  className="scale-75"
                />
                {settings.maintenanceMode && (
                  <Badge variant="destructive" className="text-[8px] h-4 px-1">On</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
              <div>
                <Label htmlFor="registrationEnabled" className="text-[10px] font-medium text-foreground">User Registration</Label>
                <p className="text-[8px] text-muted-foreground">Allow new users</p>
              </div>
              <Switch
                id="registrationEnabled"
                checked={settings.registrationEnabled !== false}
                onCheckedChange={(checked) => onInputChange('registrationEnabled', checked)}
                className="scale-75"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Configuration */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Search className="h-3.5 w-3.5 text-accent" />
            SEO Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="seoTitle" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">SEO Title</Label>
              <Input
                id="seoTitle"
                value={settings.seoTitle || settings.siteName || ''}
                onChange={(e) => onInputChange('seoTitle', e.target.value)}
                placeholder="Title for search engines"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seoKeywords" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Keywords</Label>
              <Input
                id="seoKeywords"
                value={settings.seoKeywords || ''}
                onChange={(e) => onInputChange('seoKeywords', e.target.value)}
                placeholder="property, real estate, villa"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="seoDescription" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Meta Description</Label>
            <Textarea
              id="seoDescription"
              value={settings.seoDescription || settings.siteDescription || ''}
              onChange={(e) => onInputChange('seoDescription', e.target.value)}
              placeholder="Description for search engines (155-160 chars)"
              rows={2}
              className="text-xs min-h-[40px] bg-background/50 border-border/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Integration */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Image className="h-3.5 w-3.5 text-secondary" />
            Social Media Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
            <div>
              <Label htmlFor="enableOpenGraph" className="text-[10px] font-medium text-foreground">Enable Open Graph</Label>
              <p className="text-[8px] text-muted-foreground">Optimize sharing on Facebook, LinkedIn</p>
            </div>
            <Switch
              id="enableOpenGraph"
              checked={settings.enableOpenGraph !== false}
              onCheckedChange={(checked) => onInputChange('enableOpenGraph', checked)}
              className="scale-75"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="ogImage" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Social Image URL</Label>
              <Input
                id="ogImage"
                value={settings.ogImage || ''}
                onChange={(e) => onInputChange('ogImage', e.target.value)}
                placeholder="https://example.com/share.jpg"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="twitterSite" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Twitter Handle</Label>
              <Input
                id="twitterSite"
                value={settings.twitterSite || ''}
                onChange={(e) => onInputChange('twitterSite', e.target.value)}
                placeholder="@yoursite"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-destructive">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Tags className="h-3.5 w-3.5 text-destructive" />
            Analytics & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="googleAnalyticsId" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => onInputChange('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="facebookPixelId" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={settings.facebookPixelId || ''}
                onChange={(e) => onInputChange('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
              <div>
                <Label htmlFor="enableAnalytics" className="text-[10px] font-medium text-foreground">Enable Analytics</Label>
                <p className="text-[8px] text-muted-foreground">Track user behavior</p>
              </div>
              <Switch
                id="enableAnalytics"
                checked={settings.enableAnalytics !== false}
                onCheckedChange={(checked) => onInputChange('enableAnalytics', checked)}
                className="scale-75"
              />
            </div>
            <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
              <div>
                <Label htmlFor="enableCookieConsent" className="text-[10px] font-medium text-foreground">Cookie Consent</Label>
                <p className="text-[8px] text-muted-foreground">Show consent banner</p>
              </div>
              <Switch
                id="enableCookieConsent"
                checked={settings.enableCookieConsent !== false}
                onCheckedChange={(checked) => onInputChange('enableCookieConsent', checked)}
                className="scale-75"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical SEO */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Technical SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
              <div>
                <Label htmlFor="enableSitemap" className="text-[10px] font-medium text-foreground">Auto Sitemap</Label>
                <p className="text-[8px] text-muted-foreground">Generate XML sitemap</p>
              </div>
              <Switch
                id="enableSitemap"
                checked={settings.enableSitemap !== false}
                onCheckedChange={(checked) => onInputChange('enableSitemap', checked)}
                className="scale-75"
              />
            </div>
            <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
              <div>
                <Label htmlFor="enableSchemaMarkup" className="text-[10px] font-medium text-foreground">Schema Markup</Label>
                <p className="text-[8px] text-muted-foreground">Structured data</p>
              </div>
              <Switch
                id="enableSchemaMarkup"
                checked={settings.enableSchemaMarkup !== false}
                onCheckedChange={(checked) => onInputChange('enableSchemaMarkup', checked)}
                className="scale-75"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="organizationType" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Organization Type</Label>
            <Select
              value={settings.organizationType || 'RealEstateAgent'}
              onValueChange={(value) => onInputChange('organizationType', value)}
            >
              <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
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
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <ExternalLink className="h-3.5 w-3.5 text-accent" />
            Search Engine Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="googleSiteVerification" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Google Search Console</Label>
              <Input
                id="googleSiteVerification"
                value={settings.googleSiteVerification || ''}
                onChange={(e) => onInputChange('googleSiteVerification', e.target.value)}
                placeholder="Verification meta tag"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bingSiteVerification" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Bing Webmaster</Label>
              <Input
                id="bingSiteVerification"
                value={settings.bingSiteVerification || ''}
                onChange={(e) => onInputChange('bingSiteVerification', e.target.value)}
                placeholder="Bing verification code"
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={loading} size="sm" className="h-6 text-[10px] px-2">
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;

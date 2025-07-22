import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, TrendingUp, BarChart3, Settings, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SEOSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const [seoSettings, setSeoSettings] = useState({
    siteTitle: 'Property Platform',
    siteDescription: 'Find your perfect property with our comprehensive real estate platform',
    keywords: 'real estate, property, buy, rent, sell',
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapEnabled: true,
    analyticsEnabled: true,
    structuredDataEnabled: true,
    metaTagsEnabled: true
  });

  const handleSave = () => {
    toast({
      title: "SEO Settings Saved",
      description: "Your SEO configuration has been updated successfully.",
    });
  };

  const generateSitemap = () => {
    toast({
      title: "Sitemap Generated",
      description: "XML sitemap has been updated with latest pages.",
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
          <Search className="w-6 h-6" />
          SEO Configuration
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Optimize your website for search engines and improve visibility
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
          <TabsTrigger value="meta" className="text-xs sm:text-sm">Meta Tags</TabsTrigger>
          <TabsTrigger value="technical" className="text-xs sm:text-sm">Technical</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Basic SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={seoSettings.siteTitle}
                  onChange={(e) => setSeoSettings({...seoSettings, siteTitle: e.target.value})}
                  placeholder="Your website title"
                />
                <p className="text-xs text-muted-foreground">
                  This appears in search results and browser tabs (50-60 characters recommended)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={seoSettings.siteDescription}
                  onChange={(e) => setSeoSettings({...seoSettings, siteDescription: e.target.value})}
                  placeholder="Brief description of your website"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Meta description for search results (150-160 characters recommended)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={seoSettings.keywords}
                  onChange={(e) => setSeoSettings({...seoSettings, keywords: e.target.value})}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated keywords relevant to your content
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meta Tags Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Meta Tags</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate meta tags for all pages
                  </p>
                </div>
                <Switch
                  checked={seoSettings.metaTagsEnabled}
                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, metaTagsEnabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Structured Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable schema.org structured data markup
                  </p>
                </div>
                <Switch
                  checked={seoSettings.structuredDataEnabled}
                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, structuredDataEnabled: checked})}
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Open Graph</h4>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Social media previews
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Twitter Cards</h4>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Twitter link previews
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">JSON-LD</h4>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Structured data format
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>XML Sitemap</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate and update XML sitemap
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={seoSettings.sitemapEnabled}
                    onCheckedChange={(checked) => setSeoSettings({...seoSettings, sitemapEnabled: checked})}
                  />
                  <Button variant="outline" size="sm" onClick={generateSitemap}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robotsTxt">Robots.txt</Label>
                <Textarea
                  id="robotsTxt"
                  value={seoSettings.robotsTxt}
                  onChange={(e) => setSeoSettings({...seoSettings, robotsTxt: e.target.value})}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Configure search engine crawler access
                </p>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Page Speed
                  </h4>
                  <Badge variant="outline" className="text-green-600">
                    Good (92/100)
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Core Web Vitals optimized
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    SSL Status
                  </h4>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    HTTPS enabled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                SEO Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable SEO Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Track SEO performance and search rankings
                  </p>
                </div>
                <Switch
                  checked={seoSettings.analyticsEnabled}
                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, analyticsEnabled: checked})}
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Organic Traffic</h4>
                  <p className="text-2xl font-bold">12,543</p>
                  <Badge variant="secondary" className="mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.5% this month
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Keywords Ranking</h4>
                  <p className="text-2xl font-bold">247</p>
                  <Badge variant="secondary" className="mt-1">
                    Top 10 positions
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Click-through Rate</h4>
                  <p className="text-2xl font-bold">3.2%</p>
                  <Badge variant="secondary" className="mt-1">
                    Above average
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Settings className="w-4 h-4 mr-2" />
          Save SEO Settings
        </Button>
      </div>
    </div>
  );
};

export default SEOSettings;
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
    <div className="space-y-3 p-1 md:p-0">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 dark:from-teal-500/20 dark:via-cyan-500/20 dark:to-blue-500/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
              <Search className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">SEO Configuration</h1>
                <Badge className="bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700 text-[9px] px-1.5 py-0 h-4">
                  <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                  Optimized
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Optimize your website for search engines and improve visibility</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="h-7 p-0.5 bg-teal-100/50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 grid w-full grid-cols-4">
          <TabsTrigger value="general" className="text-[10px] h-6 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <Globe className="h-3 w-3 mr-1" />
            General
          </TabsTrigger>
          <TabsTrigger value="meta" className="text-[10px] h-6 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <Settings className="h-3 w-3 mr-1" />
            Meta
          </TabsTrigger>
          <TabsTrigger value="technical" className="text-[10px] h-6 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-[10px] h-6 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <BarChart3 className="h-3 w-3 mr-1" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-3">
          <Card className="border-teal-200/50 dark:border-teal-800/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Globe className="h-3.5 w-3.5 text-teal-600" />
                Basic SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="siteTitle" className="text-[10px]">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={seoSettings.siteTitle}
                  onChange={(e) => setSeoSettings({...seoSettings, siteTitle: e.target.value})}
                  placeholder="Your website title"
                  className="h-7 text-xs"
                />
                <p className="text-[9px] text-muted-foreground">
                  This appears in search results and browser tabs (50-60 characters recommended)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="siteDescription" className="text-[10px]">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={seoSettings.siteDescription}
                  onChange={(e) => setSeoSettings({...seoSettings, siteDescription: e.target.value})}
                  placeholder="Brief description of your website"
                  rows={2}
                  className="text-xs"
                />
                <p className="text-[9px] text-muted-foreground">
                  Meta description for search results (150-160 characters recommended)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="keywords" className="text-[10px]">Keywords</Label>
                <Input
                  id="keywords"
                  value={seoSettings.keywords}
                  onChange={(e) => setSeoSettings({...seoSettings, keywords: e.target.value})}
                  placeholder="keyword1, keyword2, keyword3"
                  className="h-7 text-xs"
                />
                <p className="text-[9px] text-muted-foreground">
                  Comma-separated keywords relevant to your content
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="space-y-3">
          <Card className="border-teal-200/50 dark:border-teal-800/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs">Meta Tags Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[10px]">Enable Meta Tags</Label>
                  <p className="text-[9px] text-muted-foreground">
                    Automatically generate meta tags for all pages
                  </p>
                </div>
                <Switch
                  checked={seoSettings.metaTagsEnabled}
                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, metaTagsEnabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[10px]">Structured Data</Label>
                  <p className="text-[9px] text-muted-foreground">
                    Enable schema.org structured data markup
                  </p>
                </div>
                <Switch
                  checked={seoSettings.structuredDataEnabled}
                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, structuredDataEnabled: checked})}
                />
              </div>

              <div className="grid gap-2 grid-cols-3 mt-3">
                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                  <CardContent className="p-2">
                    <h4 className="text-[10px] font-medium mb-1">Open Graph</h4>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-[8px] px-1 py-0 h-4">
                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                      Enabled
                    </Badge>
                    <p className="text-[8px] text-muted-foreground mt-1">Social previews</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                  <CardContent className="p-2">
                    <h4 className="text-[10px] font-medium mb-1">Twitter Cards</h4>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-[8px] px-1 py-0 h-4">
                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                      Enabled
                    </Badge>
                    <p className="text-[8px] text-muted-foreground mt-1">Twitter previews</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                  <CardContent className="p-2">
                    <h4 className="text-[10px] font-medium mb-1">JSON-LD</h4>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-[8px] px-1 py-0 h-4">
                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                      Enabled
                    </Badge>
                    <p className="text-[8px] text-muted-foreground mt-1">Structured data</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-3">
          <Card className="border-teal-200/50 dark:border-teal-800/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs">Technical SEO</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[10px]">XML Sitemap</Label>
                  <p className="text-[9px] text-muted-foreground">
                    Automatically generate and update XML sitemap
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={seoSettings.sitemapEnabled}
                    onCheckedChange={(checked) => setSeoSettings({...seoSettings, sitemapEnabled: checked})}
                  />
                  <Button variant="outline" size="sm" onClick={generateSitemap} className="h-6 text-[10px] px-2">
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="robotsTxt" className="text-[10px]">Robots.txt</Label>
                <Textarea
                  id="robotsTxt"
                  value={seoSettings.robotsTxt}
                  onChange={(e) => setSeoSettings({...seoSettings, robotsTxt: e.target.value})}
                  rows={3}
                  className="font-mono text-[10px]"
                />
                <p className="text-[9px] text-muted-foreground">
                  Configure search engine crawler access
                </p>
              </div>

              <div className="grid gap-2 grid-cols-2 mt-3">
                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <h4 className="text-[10px] font-medium">Page Speed</h4>
                    </div>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-[8px] px-1 py-0 h-4">
                      Good (92/100)
                    </Badge>
                    <p className="text-[8px] text-muted-foreground mt-1">Core Web Vitals optimized</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Globe className="h-3 w-3 text-green-600" />
                      <h4 className="text-[10px] font-medium">SSL Status</h4>
                    </div>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-[8px] px-1 py-0 h-4">
                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                      Secure
                    </Badge>
                    <p className="text-[8px] text-muted-foreground mt-1">HTTPS enabled</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-3">
          <Card className="border-teal-200/50 dark:border-teal-800/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <BarChart3 className="h-3.5 w-3.5 text-teal-600" />
                SEO Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[10px]">Enable SEO Analytics</Label>
                  <p className="text-[9px] text-muted-foreground">
                    Track SEO performance and search rankings
                  </p>
                </div>
                <Switch
                  checked={seoSettings.analyticsEnabled}
                  onCheckedChange={(checked) => setSeoSettings({...seoSettings, analyticsEnabled: checked})}
                />
              </div>

              <div className="grid gap-2 grid-cols-3">
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                  <CardContent className="p-2">
                    <h4 className="text-[10px] font-medium mb-1">Organic Traffic</h4>
                    <p className="text-lg font-bold text-blue-600">12,543</p>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-[8px] px-1 py-0 h-4 mt-1">
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                      +8.5%
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
                  <CardContent className="p-2">
                    <h4 className="text-[10px] font-medium mb-1">Keywords Ranking</h4>
                    <p className="text-lg font-bold text-purple-600">247</p>
                    <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 text-[8px] px-1 py-0 h-4 mt-1">
                      Top 10 positions
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20">
                  <CardContent className="p-2">
                    <h4 className="text-[10px] font-medium mb-1">Click-through Rate</h4>
                    <p className="text-lg font-bold text-orange-600">3.2%</p>
                    <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 text-[8px] px-1 py-0 h-4 mt-1">
                      Above average
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-3">
        <Button onClick={handleSave} size="sm" className="h-7 text-[10px] px-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white">
          <Settings className="h-3 w-3 mr-1" />
          Save SEO Settings
        </Button>
      </div>
    </div>
  );
};

export default SEOSettings;
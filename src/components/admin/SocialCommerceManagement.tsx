import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Instagram, Video, Image, Facebook, MessageCircle,
  Settings, ToggleLeft, ToggleRight, ExternalLink,
  TrendingUp, Eye, Heart, Share2, ShoppingBag,
  Zap, RefreshCw, Plus, Calendar, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Platform {
  id: string;
  name: string;
  displayName: string;
  icon: React.ElementType;
  color: string;
  isEnabled: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
  lastSync: string;
}

const SocialCommerceManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('platforms');

  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: 'instagram',
      name: 'instagram',
      displayName: 'Instagram Storefront',
      icon: Instagram,
      color: 'text-pink-500',
      isEnabled: true,
      impressions: 45200,
      clicks: 3420,
      conversions: 156,
      lastSync: '2 hours ago'
    },
    {
      id: 'tiktok',
      name: 'tiktok',
      displayName: 'TikTok Shop',
      icon: Video,
      color: 'text-black dark:text-white',
      isEnabled: true,
      impressions: 128500,
      clicks: 8950,
      conversions: 234,
      lastSync: '1 hour ago'
    },
    {
      id: 'pinterest',
      name: 'pinterest',
      displayName: 'Pinterest Ideas',
      icon: Image,
      color: 'text-red-600',
      isEnabled: true,
      impressions: 23400,
      clicks: 1890,
      conversions: 67,
      lastSync: '4 hours ago'
    },
    {
      id: 'facebook',
      name: 'facebook',
      displayName: 'Facebook Marketplace',
      icon: Facebook,
      color: 'text-blue-600',
      isEnabled: true,
      impressions: 67800,
      clicks: 4560,
      conversions: 189,
      lastSync: '30 minutes ago'
    },
    {
      id: 'whatsapp',
      name: 'whatsapp',
      displayName: 'WhatsApp Business',
      icon: MessageCircle,
      color: 'text-green-500',
      isEnabled: true,
      impressions: 12300,
      clicks: 2100,
      conversions: 312,
      lastSync: 'Real-time'
    }
  ]);

  const campaigns = [
    {
      id: '1',
      name: 'Luxury Villa Launch',
      platform: 'instagram',
      status: 'active',
      budget: 5000000,
      spent: 3200000,
      impressions: 45000,
      conversions: 12
    },
    {
      id: '2',
      name: 'TikTok Property Tours',
      platform: 'tiktok',
      status: 'active',
      budget: 3000000,
      spent: 1800000,
      impressions: 128000,
      conversions: 28
    },
    {
      id: '3',
      name: 'Dream Home Ideas',
      platform: 'pinterest',
      status: 'paused',
      budget: 2000000,
      spent: 900000,
      impressions: 23000,
      conversions: 5
    }
  ];

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => prev.map(p => 
      p.id === platformId ? { ...p, isEnabled: !p.isEnabled } : p
    ));
    toast({
      title: "Platform Updated",
      description: "Integration settings have been saved"
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalStats = {
    impressions: platforms.reduce((sum, p) => sum + p.impressions, 0),
    clicks: platforms.reduce((sum, p) => sum + p.clicks, 0),
    conversions: platforms.reduce((sum, p) => sum + p.conversions, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Social Commerce
          </h1>
          <p className="text-muted-foreground">
            Manage your social media storefronts and campaigns
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{formatNumber(totalStats.impressions)}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{formatNumber(totalStats.clicks)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{totalStats.conversions}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {((totalStats.conversions / totalStats.clicks) * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 bg-muted/50 border border-border rounded-[6px] p-1">
          <TabsTrigger value="platforms" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Platforms</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Campaigns</TabsTrigger>
          <TabsTrigger value="listings" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Listings</TabsTrigger>
          <TabsTrigger value="automation" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform, idx) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={cn(
                  "transition-all",
                  !platform.isEnabled && "opacity-60"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg bg-muted", platform.color)}>
                          <platform.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{platform.displayName}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Synced {platform.lastSync}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={platform.isEnabled}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-semibold">
                          {formatNumber(platform.impressions)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Views</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-semibold">
                          {formatNumber(platform.clicks)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Clicks</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-semibold">{platform.conversions}</div>
                        <div className="text-[10px] text-muted-foreground">Sales</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Settings className="h-3.5 w-3.5" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sync
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Manage your social commerce campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const platform = platforms.find(p => p.id === campaign.platform);
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          {platform && (
                            <div className="flex items-center gap-2">
                              <platform.icon className={cn("h-4 w-4", platform.color)} />
                              {platform.displayName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                        <TableCell>{formatCurrency(campaign.spent)}</TableCell>
                        <TableCell>{formatNumber(campaign.impressions)}</TableCell>
                        <TableCell>{campaign.conversions}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Property Listings</h3>
              <p className="text-muted-foreground mb-4">
                Manage which properties are listed on social commerce platforms
              </p>
              <Button>Configure Listings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Automation Flows</CardTitle>
              <CardDescription>
                Automated messaging for viewings and inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Viewing Request', 'Pre-Approval Inquiry', 'General Inquiry'].map((flow) => (
                <div key={flow} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">{flow}</div>
                      <div className="text-xs text-muted-foreground">
                        Automated response flow
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Active</Badge>
                    <Switch checked />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialCommerceManagement;

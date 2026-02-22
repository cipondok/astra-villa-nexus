import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Share2, TrendingUp, Lock, FileText,
  Users, Building2, BarChart3, Key, DollarSign,
  RefreshCw, Plus, Settings, Eye, Download,
  Shield, Globe, Zap, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DataExchangeManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const syndicationNetworks = [
    { id: '1', name: 'Rumah123', type: 'portal', listings: 234, leads: 89, status: 'active' },
    { id: '2', name: 'OLX Property', type: 'aggregator', listings: 156, leads: 45, status: 'active' },
    { id: '3', name: 'PropertyGuru', type: 'portal', listings: 312, leads: 123, status: 'active' },
    { id: '4', name: 'Lamudi', type: 'portal', listings: 189, leads: 67, status: 'active' },
    { id: '5', name: 'Agent Alliance MLS', type: 'mls', listings: 423, leads: 201, status: 'active' }
  ];

  const researchPackages = [
    { id: '1', name: 'Transaction Analytics Basic', subscribers: 45, revenue: 112500000, type: 'transaction' },
    { id: '2', name: 'Market Trends Pro', subscribers: 23, revenue: 115000000, type: 'market_trends' },
    { id: '3', name: 'Demographics Insights', subscribers: 18, revenue: 63000000, type: 'demographics' },
    { id: '4', name: 'Rental Yields Index', subscribers: 31, revenue: 62000000, type: 'rental_yields' },
    { id: '5', name: 'Enterprise Data Suite', subscribers: 8, revenue: 120000000, type: 'enterprise' }
  ];

  const offMarketDeals = [
    { id: '1', type: 'quick_sale', city: 'Jakarta', price: 8500000000, discount: 15, interest: 12, status: 'available' },
    { id: '2', type: 'developer_exit', city: 'Bali', price: 25000000000, discount: 20, interest: 8, status: 'under_offer' },
    { id: '3', type: 'estate', city: 'Surabaya', price: 4200000000, discount: 12, interest: 5, status: 'available' },
    { id: '4', type: 'distressed', city: 'Bandung', price: 2800000000, discount: 25, interest: 15, status: 'available' }
  ];

  const apiUsageStats = {
    totalCalls: 125000,
    thisMonth: 18500,
    avgResponseTime: 145,
    successRate: 99.7
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}M`;
    return `Rp ${value.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalRevenue = researchPackages.reduce((sum, p) => sum + p.revenue, 0);
  const totalSubscribers = researchPackages.reduce((sum, p) => sum + p.subscribers, 0);
  const totalListings = syndicationNetworks.reduce((sum, n) => sum + n.listings, 0);
  const totalLeads = syndicationNetworks.reduce((sum, n) => sum + n.leads, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Data Exchange Platform
          </h1>
          <p className="text-muted-foreground">
            Manage listing syndication, buyer data, off-market deals & research access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Data Package
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-chart-1 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subscribers</p>
                <p className="text-2xl font-bold">{totalSubscribers}</p>
              </div>
              <Users className="h-8 w-8 text-chart-4 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Syndicated Listings</p>
                <p className="text-2xl font-bold">{formatNumber(totalListings)}</p>
              </div>
              <Share2 className="h-8 w-8 text-chart-5 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Generated</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-3 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Calls (MTD)</p>
                <p className="text-2xl font-bold">{formatNumber(apiUsageStats.thisMonth)}</p>
              </div>
              <Zap className="h-8 w-8 text-accent-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="syndication">Syndication</TabsTrigger>
          <TabsTrigger value="demand">Buyer Data</TabsTrigger>
          <TabsTrigger value="offmarket">Off-Market</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Syndication Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Listing Syndication
                </CardTitle>
                <CardDescription>
                  Share listings across {syndicationNetworks.length} partner networks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {syndicationNetworks.slice(0, 3).map((network) => (
                  <div key={network.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{network.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{network.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{network.listings} listings</div>
                      <div className="text-xs text-chart-1">+{network.leads} leads</div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">View All Networks</Button>
              </CardContent>
            </Card>

            {/* Off-Market Deals Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Off-Market Deals
                </CardTitle>
                <CardDescription>
                  Exclusive early access for qualified investors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {offMarketDeals.slice(0, 3).map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {formatCurrency(deal.price)}
                        <Badge variant="secondary" className="text-xs">
                          -{deal.discount}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {deal.city} • {deal.type.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={deal.status === 'available' ? 'default' : 'secondary'}>
                        {deal.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {deal.interest} interested
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">Manage Deals</Button>
              </CardContent>
            </Card>
          </div>

          {/* API Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Usage & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <div className="text-3xl font-bold">{formatNumber(apiUsageStats.totalCalls)}</div>
                  <div className="text-sm text-muted-foreground">Total API Calls</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <div className="text-3xl font-bold">{apiUsageStats.avgResponseTime}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <div className="text-3xl font-bold text-chart-1">{apiUsageStats.successRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <div className="text-3xl font-bold">5</div>
                  <div className="text-sm text-muted-foreground">Data Endpoints</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syndication Tab */}
        <TabsContent value="syndication" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Syndication Networks</CardTitle>
                <CardDescription>Manage partner portals and MLS connections</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Network
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Listings</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syndicationNetworks.map((network) => (
                    <TableRow key={network.id}>
                      <TableCell className="font-medium">{network.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{network.type}</Badge>
                      </TableCell>
                      <TableCell>{network.listings}</TableCell>
                      <TableCell className="text-chart-1">+{network.leads}</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buyer Demand Tab */}
        <TabsContent value="demand" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Buyer Demand Data API</CardTitle>
              <CardDescription>
                Real-time insights for developers and investors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Search Trends</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Real-time search volume, popular locations, and property type preferences
                  </p>
                  <Badge className="mt-3">10 credits/call</Badge>
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-chart-4" />
                    <h4 className="font-medium">Buyer Demographics</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Age groups, income ranges, and buyer behavior patterns by region
                  </p>
                  <Badge className="mt-3">30 credits/call</Badge>
                </div>
                <div className="p-4 rounded-xl border">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-chart-1" />
                    <h4 className="font-medium">Price Analytics</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Median prices, budget ranges, and price trend predictions
                  </p>
                  <Badge className="mt-3">20 credits/call</Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <h4 className="font-medium mb-2">API Endpoint</h4>
                <code className="text-sm bg-background p-2 rounded block">
                  GET /api/v1/data-exchange/buyer-demand?city=Jakarta&property_type=apartment
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Off-Market Tab */}
        <TabsContent value="offmarket" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Off-Market Deals</CardTitle>
                <CardDescription>Exclusive opportunities for qualified investors</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Deal
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offMarketDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="capitalize">
                        <Badge variant="outline">{deal.type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>{deal.city}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(deal.price)}</TableCell>
                      <TableCell className="text-chart-1">-{deal.discount}%</TableCell>
                      <TableCell>{deal.interest} investors</TableCell>
                      <TableCell>
                        <Badge variant={deal.status === 'available' ? 'default' : 'secondary'}>
                          {deal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Research Data Packages</CardTitle>
                <CardDescription>Anonymized data for academic and commercial research</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Package
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {researchPackages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {pkg.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{pkg.subscribers}</TableCell>
                      <TableCell className="text-chart-1">{formatCurrency(pkg.revenue)}</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataExchangeManagement;

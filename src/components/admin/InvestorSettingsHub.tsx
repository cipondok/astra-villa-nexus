import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plane, Landmark, Globe, Settings, Users, FileText, 
  CheckCircle, XCircle, Clock, TrendingUp, Save, Plus, Trash2,
  BarChart3, ArrowUpRight, ArrowDownRight, Calendar, Target, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

interface Country {
  code: string;
  name: string;
  tier: 'gold' | 'silver' | 'bronze' | 'unlisted';
  enabled: boolean;
}

interface InvestorSettingsHubProps {
  initialTab?: 'wna' | 'wni' | 'countries' | 'analytics';
}

const InvestorSettingsHub = ({ initialTab = 'wna' }: InvestorSettingsHubProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [wnaSettings, setWnaSettings] = useState({
    enabled: true,
    eligibilityCheckerEnabled: true,
    faqEnabled: true,
    processingDays: 14,
    minInvestment: 500000000,
  });

  const [wniSettings, setWniSettings] = useState({
    enabled: true,
    kprEnabled: true,
    eligibilityCheckerEnabled: true,
    slikCheckerAdminOnly: true,
  });

  const [wnaCountries] = useState<Country[]>([
    { code: 'SG', name: 'Singapore', tier: 'gold', enabled: true },
    { code: 'AU', name: 'Australia', tier: 'gold', enabled: true },
    { code: 'JP', name: 'Japan', tier: 'gold', enabled: true },
    { code: 'US', name: 'United States', tier: 'gold', enabled: true },
    { code: 'GB', name: 'United Kingdom', tier: 'silver', enabled: true },
    { code: 'DE', name: 'Germany', tier: 'silver', enabled: true },
    { code: 'NL', name: 'Netherlands', tier: 'silver', enabled: true },
    { code: 'MY', name: 'Malaysia', tier: 'bronze', enabled: true },
    { code: 'TH', name: 'Thailand', tier: 'bronze', enabled: true },
  ]);

  const [wniCountries] = useState<Country[]>([
    { code: 'SG', name: 'Singapore', tier: 'gold', enabled: true },
    { code: 'AU', name: 'Australia', tier: 'gold', enabled: true },
    { code: 'JP', name: 'Japan', tier: 'gold', enabled: true },
    { code: 'MY', name: 'Malaysia', tier: 'gold', enabled: true },
    { code: 'HK', name: 'Hong Kong', tier: 'gold', enabled: true },
    { code: 'US', name: 'United States', tier: 'silver', enabled: true },
    { code: 'GB', name: 'United Kingdom', tier: 'silver', enabled: true },
    { code: 'AE', name: 'UAE', tier: 'silver', enabled: true },
  ]);

  const handleSave = () => {
    toast.success('Investor settings saved successfully');
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      gold: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
      silver: 'bg-slate-400/20 text-slate-600 border-slate-400/30',
      bronze: 'bg-orange-600/20 text-orange-700 border-orange-600/30',
      unlisted: 'bg-muted text-muted-foreground border-border',
    };
    return colors[tier as keyof typeof colors] || colors.unlisted;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Investor Management Settings</h1>
            <p className="text-sm text-muted-foreground">Configure WNA & WNI investment programs</p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" />
          Save All
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Plane className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold">47</p>
              <p className="text-[10px] text-muted-foreground">WNA Inquiries</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Landmark className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold">82</p>
              <p className="text-[10px] text-muted-foreground">WNI Inquiries</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold">23</p>
              <p className="text-[10px] text-muted-foreground">Eligible Checks</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold">68%</p>
              <p className="text-[10px] text-muted-foreground">Conversion</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'wna' | 'wni' | 'countries' | 'analytics')} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="wna" className="text-xs gap-1.5">
            <Plane className="h-3.5 w-3.5" />
            WNA Settings
          </TabsTrigger>
          <TabsTrigger value="wni" className="text-xs gap-1.5">
            <Landmark className="h-3.5 w-3.5" />
            WNI Settings
          </TabsTrigger>
          <TabsTrigger value="countries" className="text-xs gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Countries
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* WNA Settings Tab */}
        <TabsContent value="wna" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Program Settings
                </CardTitle>
                <CardDescription className="text-xs">Foreign Investor (WNA) program configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Enable WNA Program</Label>
                    <p className="text-[10px] text-muted-foreground">Show WNA investment page</p>
                  </div>
                  <Switch 
                    checked={wnaSettings.enabled}
                    onCheckedChange={(checked) => setWnaSettings({...wnaSettings, enabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Eligibility Checker</Label>
                    <p className="text-[10px] text-muted-foreground">Interactive eligibility form</p>
                  </div>
                  <Switch 
                    checked={wnaSettings.eligibilityCheckerEnabled}
                    onCheckedChange={(checked) => setWnaSettings({...wnaSettings, eligibilityCheckerEnabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">FAQ Section</Label>
                    <p className="text-[10px] text-muted-foreground">Show FAQ & Help</p>
                  </div>
                  <Switch 
                    checked={wnaSettings.faqEnabled}
                    onCheckedChange={(checked) => setWnaSettings({...wnaSettings, faqEnabled: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Investment Parameters
                </CardTitle>
                <CardDescription className="text-xs">Configure investment requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Processing Time (Days)</Label>
                  <Input 
                    type="number"
                    value={wnaSettings.processingDays}
                    onChange={(e) => setWnaSettings({...wnaSettings, processingDays: parseInt(e.target.value)})}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Minimum Investment (IDR)</Label>
                  <Input 
                    type="number"
                    value={wnaSettings.minInvestment}
                    onChange={(e) => setWnaSettings({...wnaSettings, minInvestment: parseInt(e.target.value)})}
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Current: Rp {wnaSettings.minInvestment.toLocaleString('id-ID')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WNI Settings Tab */}
        <TabsContent value="wni" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  KPR Program Settings
                </CardTitle>
                <CardDescription className="text-xs">Overseas Indonesian mortgage configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Enable WNI Program</Label>
                    <p className="text-[10px] text-muted-foreground">Show WNI mortgage page</p>
                  </div>
                  <Switch 
                    checked={wniSettings.enabled}
                    onCheckedChange={(checked) => setWniSettings({...wniSettings, enabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">KPR Calculator</Label>
                    <p className="text-[10px] text-muted-foreground">Mortgage calculator tool</p>
                  </div>
                  <Switch 
                    checked={wniSettings.kprEnabled}
                    onCheckedChange={(checked) => setWniSettings({...wniSettings, kprEnabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Eligibility Checker</Label>
                    <p className="text-[10px] text-muted-foreground">Interactive eligibility form</p>
                  </div>
                  <Switch 
                    checked={wniSettings.eligibilityCheckerEnabled}
                    onCheckedChange={(checked) => setWniSettings({...wniSettings, eligibilityCheckerEnabled: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Access Control
                </CardTitle>
                <CardDescription className="text-xs">Configure feature access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">SLIK Checker - Admin Only</Label>
                    <p className="text-[10px] text-muted-foreground">Restrict credit check to admins</p>
                  </div>
                  <Switch 
                    checked={wniSettings.slikCheckerAdminOnly}
                    onCheckedChange={(checked) => setWniSettings({...wniSettings, slikCheckerAdminOnly: checked})}
                  />
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    ⚠️ SLIK Credit Checker contains sensitive financial data and should remain admin-only for compliance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* WNA Countries */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      WNA Eligible Countries
                    </CardTitle>
                    <CardDescription className="text-xs">Countries for foreign investor program</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {wnaCountries.map((country) => (
                    <div key={country.code} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.code === 'SG' ? '🇸🇬' : country.code === 'AU' ? '🇦🇺' : country.code === 'JP' ? '🇯🇵' : country.code === 'US' ? '🇺🇸' : country.code === 'GB' ? '🇬🇧' : country.code === 'DE' ? '🇩🇪' : country.code === 'NL' ? '🇳🇱' : country.code === 'MY' ? '🇲🇾' : country.code === 'TH' ? '🇹🇭' : '🌍'}</span>
                        <span className="text-xs font-medium">{country.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] ${getTierBadge(country.tier)}`}>
                          {country.tier.toUpperCase()}
                        </Badge>
                        <Switch checked={country.enabled} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* WNI Countries */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Landmark className="h-4 w-4" />
                      WNI KPR Countries
                    </CardTitle>
                    <CardDescription className="text-xs">Countries for overseas Indonesian mortgage</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {wniCountries.map((country) => (
                    <div key={country.code} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.code === 'SG' ? '🇸🇬' : country.code === 'AU' ? '🇦🇺' : country.code === 'JP' ? '🇯🇵' : country.code === 'MY' ? '🇲🇾' : country.code === 'HK' ? '🇭🇰' : country.code === 'US' ? '🇺🇸' : country.code === 'GB' ? '🇬🇧' : country.code === 'AE' ? '🇦🇪' : '🌍'}</span>
                        <span className="text-xs font-medium">{country.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] ${getTierBadge(country.tier)}`}>
                          {country.tier.toUpperCase()}
                        </Badge>
                        <Switch checked={country.enabled} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <InvestorAnalyticsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Investor Analytics Component
const InvestorAnalyticsContent = () => {
  // Sample data for charts
  const inquiryTrendData = [
    { month: 'Jan', wna: 12, wni: 28, total: 40 },
    { month: 'Feb', wna: 19, wni: 32, total: 51 },
    { month: 'Mar', wna: 15, wni: 41, total: 56 },
    { month: 'Apr', wna: 23, wni: 35, total: 58 },
    { month: 'May', wna: 28, wni: 42, total: 70 },
    { month: 'Jun', wna: 35, wni: 52, total: 87 },
  ];

  const conversionData = [
    { name: 'WNA', value: 68, fill: 'hsl(var(--chart-1))' },
    { name: 'WNI', value: 74, fill: 'hsl(var(--chart-2))' },
  ];

  const countryDistribution = [
    { country: 'Singapore', wna: 18, wni: 25 },
    { country: 'Australia', wna: 12, wni: 15 },
    { country: 'Japan', wna: 8, wni: 10 },
    { country: 'USA', wna: 15, wni: 8 },
    { country: 'UK', wna: 7, wni: 12 },
    { country: 'Malaysia', wna: 5, wni: 22 },
  ];

  const eligibilityStats = [
    { status: 'Eligible', count: 89, color: 'bg-green-500' },
    { status: 'Pending Review', count: 23, color: 'bg-amber-500' },
    { status: 'Not Eligible', count: 17, color: 'bg-red-500' },
  ];

  const recentInquiries = [
    { id: 1, name: 'John Smith', type: 'WNA', country: 'Singapore', status: 'eligible', date: '2 hours ago' },
    { id: 2, name: 'Ahmad Wijaya', type: 'WNI', country: 'Australia', status: 'pending', date: '5 hours ago' },
    { id: 3, name: 'Sarah Chen', type: 'WNA', country: 'Japan', status: 'eligible', date: '1 day ago' },
    { id: 4, name: 'Budi Santoso', type: 'WNI', country: 'Malaysia', status: 'eligible', date: '1 day ago' },
    { id: 5, name: 'Michael Brown', type: 'WNA', country: 'USA', status: 'not_eligible', date: '2 days ago' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'eligible':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-[9px]">Eligible</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[9px]">Pending</Badge>;
      case 'not_eligible':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-[9px]">Not Eligible</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Total Inquiries</p>
              <p className="text-xl font-bold">129</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-[10px] text-green-500">+12.5%</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Eligibility Checks</p>
              <p className="text-xl font-bold">89</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-[10px] text-green-500">+8.3%</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Conversion Rate</p>
              <p className="text-xl font-bold">71%</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-[10px] text-green-500">+5.2%</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">This Month</p>
              <p className="text-xl font-bold">47</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowDownRight className="h-3 w-3 text-red-500" />
                <span className="text-[10px] text-red-500">-2.1%</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inquiry Trends Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Inquiry Trends
            </CardTitle>
            <CardDescription className="text-xs">WNA vs WNI inquiries over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inquiryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }} 
                  />
                  <Line type="monotone" dataKey="wna" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="WNA" />
                  <Line type="monotone" dataKey="wni" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="WNI" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Country Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Country Distribution
            </CardTitle>
            <CardDescription className="text-xs">Inquiries by country of origin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="country" type="category" tick={{ fontSize: 9 }} width={60} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }} 
                  />
                  <Bar dataKey="wna" fill="hsl(var(--chart-1))" name="WNA" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="wni" fill="hsl(var(--chart-2))" name="WNI" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Eligibility Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Eligibility Status
            </CardTitle>
            <CardDescription className="text-xs">Breakdown of eligibility checks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eligibilityStats.map((stat) => (
              <div key={stat.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                  <span className="text-xs">{stat.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stat.color}`} 
                      style={{ width: `${(stat.count / 129) * 100}%` }} 
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{stat.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recent Inquiries
                </CardTitle>
                <CardDescription className="text-xs">Latest investor inquiries</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">{inquiry.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">{inquiry.name}</p>
                      <p className="text-[10px] text-muted-foreground">{inquiry.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">
                      {inquiry.type}
                    </Badge>
                    {getStatusBadge(inquiry.status)}
                    <span className="text-[10px] text-muted-foreground">{inquiry.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestorSettingsHub;

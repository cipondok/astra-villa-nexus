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
  CheckCircle, XCircle, Clock, TrendingUp, Save, Plus, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface Country {
  code: string;
  name: string;
  tier: 'gold' | 'silver' | 'bronze' | 'unlisted';
  enabled: boolean;
}

const InvestorSettingsHub = () => {
  const [activeTab, setActiveTab] = useState('wna');
  
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-9">
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
      </Tabs>
    </div>
  );
};

export default InvestorSettingsHub;

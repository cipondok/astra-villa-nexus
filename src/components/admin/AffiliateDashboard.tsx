import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Users, DollarSign, TrendingUp, Award, Share2, Copy, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const affiliates = [
  { id: 'AFF-001', name: 'Property Insider Blog', code: 'PROPINS2024', tier: 'Gold', referrals: 145, conversions: 32, earnings: 48500000, pendingPayout: 12500000, status: 'active', rate: 5 },
  { id: 'AFF-002', name: 'Jakarta Home Finder', code: 'JKTHOME', tier: 'Silver', referrals: 89, conversions: 18, earnings: 27000000, pendingPayout: 8200000, status: 'active', rate: 4 },
  { id: 'AFF-003', name: 'Bali Living Guide', code: 'BALILIV', tier: 'Platinum', referrals: 312, conversions: 67, earnings: 134000000, pendingPayout: 0, status: 'active', rate: 7 },
  { id: 'AFF-004', name: 'Indo Property TV', code: 'INDOTV', tier: 'Gold', referrals: 201, conversions: 45, earnings: 67500000, pendingPayout: 22000000, status: 'active', rate: 5 },
  { id: 'AFF-005', name: 'Student Housing ID', code: 'STDHSG', tier: 'Bronze', referrals: 34, conversions: 5, earnings: 5000000, pendingPayout: 3000000, status: 'pending', rate: 3 },
];

const monthlyPerformance = [
  { month: 'Sep', referrals: 85, conversions: 18, revenue: 27 },
  { month: 'Oct', referrals: 112, conversions: 24, revenue: 36 },
  { month: 'Nov', referrals: 98, conversions: 21, revenue: 31.5 },
  { month: 'Dec', referrals: 134, conversions: 29, revenue: 43.5 },
  { month: 'Jan', referrals: 156, conversions: 34, revenue: 51 },
  { month: 'Feb', referrals: 142, conversions: 31, revenue: 46.5 },
];

const tierDistribution = [
  { name: 'Platinum', value: 3, color: 'hsl(var(--chart-1))' },
  { name: 'Gold', value: 8, color: 'hsl(var(--chart-3))' },
  { name: 'Silver', value: 12, color: 'hsl(var(--chart-4))' },
  { name: 'Bronze', value: 15, color: 'hsl(var(--chart-5))' },
];

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Platinum': return 'bg-chart-1/10 text-chart-1 border-chart-1/30';
    case 'Gold': return 'bg-chart-3/10 text-chart-3 border-chart-3/30';
    case 'Silver': return 'bg-muted text-muted-foreground';
    case 'Bronze': return 'bg-chart-5/10 text-chart-5 border-chart-5/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

const formatIDR = (amount: number) => `Rp ${(amount / 1000000).toFixed(1)}M`;

const AffiliateDashboard = () => {
  const totalEarnings = affiliates.reduce((s, a) => s + a.earnings, 0);
  const totalPending = affiliates.reduce((s, a) => s + a.pendingPayout, 0);
  const totalConversions = affiliates.reduce((s, a) => s + a.conversions, 0);
  const avgConversionRate = (totalConversions / affiliates.reduce((s, a) => s + a.referrals, 0) * 100).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Affiliate Program</h2>
          <p className="text-xs text-muted-foreground">Manage affiliates, commissions, and payouts</p>
        </div>
        <Button size="sm" className="text-xs"><Users className="h-3 w-3 mr-1" /> Add Affiliate</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-primary" /><span className="text-[10px] text-muted-foreground">Total Earnings</span></div>
          <div className="text-lg font-bold text-foreground">{formatIDR(totalEarnings)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-chart-3" /><span className="text-[10px] text-muted-foreground">Pending Payout</span></div>
          <div className="text-lg font-bold text-foreground">{formatIDR(totalPending)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-chart-4" /><span className="text-[10px] text-muted-foreground">Conversions</span></div>
          <div className="text-lg font-bold text-foreground">{totalConversions}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><Award className="h-4 w-4 text-chart-1" /><span className="text-[10px] text-muted-foreground">Avg Conv. Rate</span></div>
          <div className="text-lg font-bold text-foreground">{avgConversionRate}%</div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="affiliates" className="w-full">
        <TabsList className="h-8 bg-muted/30">
          <TabsTrigger value="affiliates" className="text-xs">Affiliates</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
          <TabsTrigger value="payouts" className="text-xs">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates" className="space-y-2 mt-3">
          {affiliates.map(aff => (
            <Card key={aff.id} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{aff.name}</span>
                      <Badge className={`text-[9px] ${getTierColor(aff.tier)}`}>{aff.tier}</Badge>
                      <Badge variant={aff.status === 'active' ? 'default' : 'secondary'} className="text-[9px]">{aff.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <code className="bg-muted px-1 py-0.5 rounded">{aff.code}</code>
                      <span>{aff.rate}% commission</span>
                    </div>
                    <div className="flex gap-4 text-[10px] mt-1">
                      <span className="text-muted-foreground">{aff.referrals} referrals</span>
                      <span className="text-primary font-medium">{aff.conversions} conversions</span>
                      <span className="text-chart-4 font-medium">{formatIDR(aff.earnings)} earned</span>
                      {aff.pendingPayout > 0 && <span className="text-chart-3">{formatIDR(aff.pendingPayout)} pending</span>}
                    </div>
                    <Progress value={(aff.conversions / aff.referrals) * 100} className="h-1 mt-1" />
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Copy className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><ExternalLink className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Referrals & Conversions</CardTitle></CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="referrals" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" name="Referrals" />
                    <Area type="monotone" dataKey="conversions" fill="hsl(var(--chart-4) / 0.2)" stroke="hsl(var(--chart-4))" name="Conversions" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Affiliate Tiers</CardTitle></CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tierDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {tierDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="mt-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Revenue from Affiliates (Rp Millions)</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue (M)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateDashboard;

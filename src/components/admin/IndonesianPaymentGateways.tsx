import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, Building, CheckCircle, Save } from 'lucide-react';

const IndonesianPaymentGateways = () => {
  const [activeGateways, setActiveGateways] = useState({
    gopay: true,
    ovo: true,
    dana: false,
    linkaja: false,
    shopeepay: true,
    bca: true,
    mandiri: false,
    bni: false,
    bri: false,
    permata: false,
    cimb: false,
    danamon: false,
    qris: true,
    kredivo: false,
    akulaku: false
  });

  const paymentMethods = [
    {
      category: 'E-Wallets',
      icon: Smartphone,
      color: 'border-l-emerald-500',
      methods: [
        { id: 'gopay', name: 'GoPay', logo: '🏍️', fee: '2.9%', status: 'active', transactions: 15420 },
        { id: 'ovo', name: 'OVO', logo: '💜', fee: '2.9%', status: 'active', transactions: 12350 },
        { id: 'dana', name: 'DANA', logo: '💙', fee: '2.9%', status: 'inactive', transactions: 0 },
        { id: 'linkaja', name: 'LinkAja', logo: '❤️', fee: '2.9%', status: 'inactive', transactions: 0 },
        { id: 'shopeepay', name: 'ShopeePay', logo: '🛒', fee: '2.9%', status: 'active', transactions: 8760 }
      ]
    },
    {
      category: 'Bank Transfer',
      icon: Building,
      color: 'border-l-blue-500',
      methods: [
        { id: 'bca', name: 'BCA VA', logo: '🏦', fee: '4000', status: 'active', transactions: 23450 },
        { id: 'mandiri', name: 'Mandiri VA', logo: '🏛️', fee: '4000', status: 'inactive', transactions: 0 },
        { id: 'bni', name: 'BNI VA', logo: '🏢', fee: '4000', status: 'inactive', transactions: 0 },
        { id: 'bri', name: 'BRI VA', logo: '🏪', fee: '4000', status: 'inactive', transactions: 0 },
        { id: 'permata', name: 'Permata VA', logo: '💎', fee: '4000', status: 'inactive', transactions: 0 }
      ]
    },
    {
      category: 'Others',
      icon: CreditCard,
      color: 'border-l-purple-500',
      methods: [
        { id: 'qris', name: 'QRIS', logo: '📱', fee: '0.7%', status: 'active', transactions: 5670 },
        { id: 'kredivo', name: 'Kredivo', logo: '💳', fee: '2.95%', status: 'inactive', transactions: 0 },
        { id: 'akulaku', name: 'Akulaku', logo: '🛍️', fee: '2.95%', status: 'inactive', transactions: 0 }
      ]
    }
  ];

  const toggleGateway = (gatewayId: string) => {
    setActiveGateways(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  const stats = [
    { label: 'Active Gateways', value: Object.values(activeGateways).filter(Boolean).length, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Monthly Txns', value: '65.6K', icon: CreditCard, color: 'text-blue-400' },
    { label: 'Success Rate', value: '98.5%', icon: CheckCircle, color: 'text-green-400' },
    { label: 'Revenue', value: 'Rp 2.3B', icon: Building, color: 'text-purple-400' }
  ];

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Indonesian Payment Gateways</h2>
          <p className="text-[10px] text-muted-foreground">Manage local payment integrations</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-8 bg-muted/50">
          <TabsTrigger value="overview" className="h-6 px-3 text-xs">Overview</TabsTrigger>
          <TabsTrigger value="configuration" className="h-6 px-3 text-xs">Config</TabsTrigger>
          <TabsTrigger value="analytics" className="h-6 px-3 text-xs">Analytics</TabsTrigger>
          <TabsTrigger value="fees" className="h-6 px-3 text-xs">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/50 border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods by Category */}
          {paymentMethods.map((category) => (
            <Card key={category.category} className={`bg-card/50 border-border/50 border-l-2 ${category.color}`}>
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-2 text-xs text-foreground">
                  <category.icon className="h-4 w-4" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {category.methods.map((method) => (
                    <div key={method.id} className="p-2 border border-border/50 rounded-md bg-background/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{method.logo}</span>
                          <div>
                            <p className="text-xs font-medium text-foreground">{method.name}</p>
                            <p className="text-[9px] text-muted-foreground">Fee: {method.fee}</p>
                          </div>
                        </div>
                        <Switch
                          checked={activeGateways[method.id as keyof typeof activeGateways]}
                          onCheckedChange={() => toggleGateway(method.id)}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={method.status === 'active' ? 'default' : 'secondary'} className="text-[8px] px-1 py-0">
                          {method.status}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">
                          {method.transactions.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="configuration" className="mt-3">
          <Card className="bg-card/50 border-border/50 border-l-2 border-l-orange-500">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground">Gateway Configuration</CardTitle>
              <CardDescription className="text-[10px]">Configure API keys and settings</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Midtrans Server Key</Label>
                    <Input type="password" placeholder="SB-Mid-server-..." className="h-8 text-xs bg-background/50" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Midtrans Client Key</Label>
                    <Input placeholder="SB-Mid-client-..." className="h-8 text-xs bg-background/50" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Environment</Label>
                    <Select defaultValue="sandbox">
                      <SelectTrigger className="h-8 text-xs bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Xendit Secret Key</Label>
                    <Input type="password" placeholder="xnd_development_..." className="h-8 text-xs bg-background/50" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Xendit Public Key</Label>
                    <Input placeholder="xnd_public_development_..." className="h-8 text-xs bg-background/50" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Webhook URL</Label>
                    <Input placeholder="https://yoursite.com/webhook" className="h-8 text-xs bg-background/50" />
                  </div>
                </div>
              </div>
              <Button size="sm" className="h-7 text-xs w-full">
                <Save className="h-3 w-3 mr-1" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-card/50 border-border/50 border-l-2 border-l-cyan-500">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs text-foreground">Payment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-2">
                  {[
                    { name: 'GoPay', pct: 35.2, color: 'bg-emerald-500' },
                    { name: 'BCA VA', pct: 28.7, color: 'bg-blue-500' },
                    { name: 'OVO', pct: 18.9, color: 'bg-purple-500' },
                    { name: 'ShopeePay', pct: 12.4, color: 'bg-orange-500' },
                    { name: 'Others', pct: 4.8, color: 'bg-gray-500' }
                  ].map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50 border-l-2 border-l-green-500">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs text-foreground">Success Rates</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-2">
                  {[
                    { name: 'E-Wallets', rate: '99.2%', status: 'success' },
                    { name: 'Bank Transfer', rate: '98.7%', status: 'success' },
                    { name: 'QRIS', rate: '97.8%', status: 'success' },
                    { name: 'BNPL', rate: '95.3%', status: 'warning' }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                      <span className="text-[10px] text-foreground">{item.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-[9px] px-1.5 py-0 ${
                          item.status === 'success' 
                            ? 'border-emerald-500/50 text-emerald-400' 
                            : 'border-yellow-500/50 text-yellow-400'
                        }`}
                      >
                        {item.rate}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="mt-3">
          <Card className="bg-card/50 border-border/50 border-l-2 border-l-amber-500">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground">Fee Structure</CardTitle>
              <CardDescription className="text-[10px]">Current gateway fees</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 text-[10px] font-medium text-muted-foreground">Method</th>
                      <th className="text-left py-2 text-[10px] font-medium text-muted-foreground">MDR</th>
                      <th className="text-left py-2 text-[10px] font-medium text-muted-foreground">Fixed</th>
                      <th className="text-left py-2 text-[10px] font-medium text-muted-foreground">Settlement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: '🏍️ GoPay', mdr: '2.9%', fixed: '-', settle: 'T+1' },
                      { name: '💜 OVO', mdr: '2.9%', fixed: '-', settle: 'T+1' },
                      { name: '🏦 BCA VA', mdr: '-', fixed: 'Rp 4K', settle: 'T+1' },
                      { name: '📱 QRIS', mdr: '0.7%', fixed: '-', settle: 'T+1' }
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-border/30 last:border-0">
                        <td className="py-2 text-foreground">{row.name}</td>
                        <td className="py-2 text-muted-foreground">{row.mdr}</td>
                        <td className="py-2 text-muted-foreground">{row.fixed}</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-[8px] px-1 py-0">{row.settle}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndonesianPaymentGateways;

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CreditCard, Smartphone, Building, Settings, CheckCircle, XCircle } from 'lucide-react';

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
      methods: [
        { id: 'bca', name: 'BCA Virtual Account', logo: '🏦', fee: '4000', status: 'active', transactions: 23450 },
        { id: 'mandiri', name: 'Mandiri Virtual Account', logo: '🏛️', fee: '4000', status: 'inactive', transactions: 0 },
        { id: 'bni', name: 'BNI Virtual Account', logo: '🏢', fee: '4000', status: 'inactive', transactions: 0 },
        { id: 'bri', name: 'BRI Virtual Account', logo: '🏪', fee: '4000', status: 'inactive', transactions: 0 },
        { id: 'permata', name: 'Permata Virtual Account', logo: '💎', fee: '4000', status: 'inactive', transactions: 0 }
      ]
    },
    {
      category: 'Others',
      methods: [
        { id: 'qris', name: 'QRIS', logo: '📱', fee: '0.7%', status: 'active', transactions: 5670 },
        { id: 'kredivo', name: 'Kredivo', logo: '💳', fee: '2.95%', status: 'inactive', transactions: 0 },
        { id: 'akulaku', name: 'Akulaku PayLater', logo: '🛍️', fee: '2.95%', status: 'inactive', transactions: 0 }
      ]
    }
  ];

  const toggleGateway = (gatewayId: string) => {
    setActiveGateways(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Indonesian Payment Gateways</h2>
          <p className="text-muted-foreground">Manage local Indonesian payment methods</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Gateway Settings
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="fees">Fee Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Gateways</p>
                    <p className="text-2xl font-bold">
                      {Object.values(activeGateways).filter(Boolean).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Transactions</p>
                    <p className="text-2xl font-bold">65,650</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">98.5%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">Rp 2.3B</p>
                  </div>
                  <Building className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods by Category */}
          {paymentMethods.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.category === 'E-Wallets' && <Smartphone className="h-5 w-5" />}
                  {category.category === 'Bank Transfer' && <Building className="h-5 w-5" />}
                  {category.category === 'Others' && <CreditCard className="h-5 w-5" />}
                  {category.category}
                </CardTitle>
                <CardDescription>
                  Manage {category.category.toLowerCase()} payment options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.methods.map((method) => (
                    <div key={method.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{method.logo}</span>
                          <div>
                            <h4 className="font-semibold">{method.name}</h4>
                            <p className="text-sm text-muted-foreground">Fee: {method.fee}</p>
                          </div>
                        </div>
                        <Switch
                          checked={activeGateways[method.id]}
                          onCheckedChange={() => toggleGateway(method.id)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                          {method.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {method.transactions.toLocaleString()} txns
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gateway Configuration</CardTitle>
              <CardDescription>Configure payment gateway settings and API keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="midtrans-server">Midtrans Server Key</Label>
                    <Input id="midtrans-server" type="password" placeholder="SB-Mid-server-..." />
                  </div>
                  <div>
                    <Label htmlFor="midtrans-client">Midtrans Client Key</Label>
                    <Input id="midtrans-client" placeholder="SB-Mid-client-..." />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select defaultValue="sandbox">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="xendit-secret">Xendit Secret Key</Label>
                    <Input id="xendit-secret" type="password" placeholder="xnd_development_..." />
                  </div>
                  <div>
                    <Label htmlFor="xendit-public">Xendit Public Key</Label>
                    <Input id="xendit-public" placeholder="xnd_public_development_..." />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input id="webhook-url" placeholder="https://yoursite.com/webhook" />
                  </div>
                </div>
              </div>
              <Button className="w-full">Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>GoPay</span>
                    <span className="font-semibold">35.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>BCA Virtual Account</span>
                    <span className="font-semibold">28.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>OVO</span>
                    <span className="font-semibold">18.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ShopeePay</span>
                    <span className="font-semibold">12.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Others</span>
                    <span className="font-semibold">4.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>E-Wallets</span>
                    <Badge className="bg-green-100 text-green-800">99.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bank Transfer</span>
                    <Badge className="bg-green-100 text-green-800">98.7%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>QRIS</span>
                    <Badge className="bg-green-100 text-green-800">97.8%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Buy Now Pay Later</span>
                    <Badge className="bg-yellow-100 text-yellow-800">95.3%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure</CardTitle>
              <CardDescription>Current payment gateway fees and charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Payment Method</th>
                      <th className="text-left p-4">MDR Fee</th>
                      <th className="text-left p-4">Fixed Fee</th>
                      <th className="text-left p-4">Settlement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">🏍️ GoPay</td>
                      <td className="p-4">2.9%</td>
                      <td className="p-4">-</td>
                      <td className="p-4">T+1</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">💜 OVO</td>
                      <td className="p-4">2.9%</td>
                      <td className="p-4">-</td>
                      <td className="p-4">T+1</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">🏦 BCA VA</td>
                      <td className="p-4">-</td>
                      <td className="p-4">Rp 4,000</td>
                      <td className="p-4">T+1</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">📱 QRIS</td>
                      <td className="p-4">0.7%</td>
                      <td className="p-4">-</td>
                      <td className="p-4">T+1</td>
                    </tr>
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
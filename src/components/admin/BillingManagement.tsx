import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign, Receipt, Users, TrendingUp, Calendar, Save, Search } from 'lucide-react';

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const billingData = {
    monthlyRevenue: '$45,678',
    totalUsers: 1247,
    activeSubscriptions: 892,
    pendingPayments: 23
  };

  const recentTransactions = [
    { id: '1', user: 'John Doe', amount: '$299', status: 'completed', date: '2024-01-15' },
    { id: '2', user: 'Jane Smith', amount: '$199', status: 'pending', date: '2024-01-14' },
    { id: '3', user: 'Mike Johnson', amount: '$399', status: 'completed', date: '2024-01-13' },
  ];

  const stats = [
    { label: 'Monthly Revenue', value: billingData.monthlyRevenue, icon: DollarSign, color: 'text-emerald-400', badge: '+15%', badgeColor: 'border-emerald-500/50 text-emerald-400' },
    { label: 'Total Users', value: billingData.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-400', badge: 'Active', badgeColor: 'border-blue-500/50 text-blue-400' },
    { label: 'Subscriptions', value: billingData.activeSubscriptions.toLocaleString(), icon: CreditCard, color: 'text-purple-400', badge: 'Paid', badgeColor: 'border-purple-500/50 text-purple-400' },
    { label: 'Pending', value: billingData.pendingPayments, icon: Receipt, color: 'text-orange-400', badge: 'Action', badgeColor: 'border-orange-500/50 text-orange-400' }
  ];

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Billing Management</h2>
          <p className="text-[10px] text-muted-foreground">Manage subscriptions, payments, and billing</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-8 bg-muted/50">
          <TabsTrigger value="overview" className="h-6 px-3 text-xs">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions" className="h-6 px-3 text-xs">Subscriptions</TabsTrigger>
          <TabsTrigger value="transactions" className="h-6 px-3 text-xs">Transactions</TabsTrigger>
          <TabsTrigger value="settings" className="h-6 px-3 text-xs">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/50 border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <Badge variant="outline" className={`text-[8px] px-1 py-0 ${stat.badgeColor}`}>
                      {stat.badge}
                    </Badge>
                  </div>
                  <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Overview */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-card/50 border-border/50 border-l-2 border-l-emerald-500">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs text-foreground flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-2">
                  {['This Month', 'Last Month', 'This Quarter'].map((period, idx) => (
                    <div key={period} className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
                      <span className="text-[10px] text-foreground">{period}</span>
                      <span className="text-xs font-medium text-foreground">
                        ${(45678 - idx * 5000).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 border-l-2 border-l-blue-500">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs text-foreground flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5" />
                  Plan Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-2">
                  {[
                    { plan: 'Enterprise', pct: 45, color: 'bg-purple-500' },
                    { plan: 'Premium', pct: 35, color: 'bg-blue-500' },
                    { plan: 'Basic', pct: 20, color: 'bg-emerald-500' }
                  ].map((item) => (
                    <div key={item.plan} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-foreground">{item.plan}</span>
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
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-3">
          <Card className="bg-card/50 border-border/50 border-l-2 border-l-purple-500">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground">Subscription Plans</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Search users..." className="h-7 text-xs pl-7 bg-background/50" />
                </div>
                <Select>
                  <SelectTrigger className="h-7 text-xs w-32 bg-background/50">
                    <SelectValue placeholder="Filter plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {[
                  { plan: 'Basic Plan', price: '$9.99/mo', subs: 247 },
                  { plan: 'Premium Plan', price: '$19.99/mo', subs: 385 },
                  { plan: 'Enterprise Plan', price: '$49.99/mo', subs: 260 }
                ].map((item) => (
                  <div key={item.plan} className="flex items-center justify-between p-2 border border-border/50 rounded-md bg-background/30">
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.plan}</p>
                      <p className="text-[9px] text-muted-foreground">{item.subs} subscribers • {item.price}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">Manage</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-3">
          <Card className="bg-card/50 border-border/50 border-l-2 border-l-cyan-500">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 border border-border/50 rounded-md bg-background/30">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{transaction.user}</p>
                      <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {transaction.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{transaction.amount}</span>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        className="text-[8px] px-1 py-0"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-3">
          <Card className="bg-card/50 border-border/50 border-l-2 border-l-orange-500">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground">Billing Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="idr">IDR (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Tax Rate (%)</Label>
                  <Input placeholder="10" type="number" className="h-7 text-xs bg-background/50" />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Payment Gateway</Label>
                  <Select defaultValue="stripe">
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="midtrans">Midtrans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button size="sm" className="h-7 text-xs w-full">
                <Save className="h-3 w-3 mr-1" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingManagement;

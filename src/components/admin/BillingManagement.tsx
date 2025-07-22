import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign, Receipt, Users, TrendingUp, Calendar } from 'lucide-react';

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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Billing Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage subscriptions, payments, and billing settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-xs sm:text-sm">Subscriptions</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{billingData.monthlyRevenue}</div>
                <Badge variant="secondary" className="mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% vs last month
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{billingData.totalUsers}</div>
                <Badge variant="outline" className="mt-1">Active</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Active Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{billingData.activeSubscriptions}</div>
                <Badge variant="secondary" className="mt-1">Paid plans</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Pending Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{billingData.pendingPayments}</div>
                <Badge variant="destructive" className="mt-1">Needs attention</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input placeholder="Search users..." className="flex-1" />
                  <Select>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Plan</SelectItem>
                      <SelectItem value="premium">Premium Plan</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {['Basic Plan - $9.99/month', 'Premium Plan - $19.99/month', 'Enterprise Plan - $49.99/month'].map((plan, index) => (
                    <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{plan}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 300) + 50} active subscribers
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{transaction.user}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {transaction.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <span className="font-bold">{transaction.amount}</span>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
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

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="idr">IDR (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Rate (%)</label>
                  <Input placeholder="10" type="number" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Gateway</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="midtrans">Midtrans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full sm:w-auto">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingManagement;
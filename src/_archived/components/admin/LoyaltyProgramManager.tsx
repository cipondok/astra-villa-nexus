import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Gift, Star, Users, TrendingUp, Zap, Crown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const pointsActivity = [
  { month: 'Sep', earned: 45200, redeemed: 12800, expired: 3200 },
  { month: 'Oct', earned: 52100, redeemed: 15400, expired: 2900 },
  { month: 'Nov', earned: 48900, redeemed: 18200, expired: 3100 },
  { month: 'Dec', earned: 61300, redeemed: 22500, expired: 2700 },
  { month: 'Jan', earned: 55800, redeemed: 19800, expired: 3400 },
  { month: 'Feb', earned: 58400, redeemed: 21300, expired: 2800 },
];

const tierDistribution = [
  { name: 'Bronze', value: 4520, fill: 'hsl(var(--muted-foreground))' },
  { name: 'Silver', value: 2340, fill: 'hsl(var(--secondary))' },
  { name: 'Gold', value: 890, fill: 'hsl(var(--primary))' },
  { name: 'Platinum', value: 320, fill: 'hsl(var(--accent))' },
  { name: 'Diamond', value: 85, fill: 'hsl(var(--destructive))' },
];

const rewards = [
  { name: 'Property Listing Boost', points: 500, claimed: 234, stock: 'Unlimited', category: 'Listing' },
  { name: 'Premium Photo Session', points: 2000, claimed: 45, stock: '50/month', category: 'Service' },
  { name: 'Free Property Valuation', points: 1500, claimed: 89, stock: '100/month', category: 'Service' },
  { name: 'VIP Support Access', points: 3000, claimed: 28, stock: 'Unlimited', category: 'Support' },
  { name: 'Featured Agent Badge', points: 5000, claimed: 12, stock: '20/month', category: 'Badge' },
  { name: 'Commission Discount 10%', points: 10000, claimed: 5, stock: '10/month', category: 'Financial' },
];

const topEarners = [
  { name: 'Andi Wijaya', tier: 'Diamond', points: 52400, lifetime: 185000 },
  { name: 'Sari Indah', tier: 'Platinum', points: 38200, lifetime: 142000 },
  { name: 'Rudi Hartono', tier: 'Platinum', points: 35100, lifetime: 128000 },
  { name: 'Lina Kusuma', tier: 'Gold', points: 24800, lifetime: 95000 },
  { name: 'Fadli Rahman', tier: 'Gold', points: 22100, lifetime: 87000 },
];

const LoyaltyProgramManager = () => {
  const totalMembers = tierDistribution.reduce((s, t) => s + t.value, 0);
  const totalPointsCirculating = pointsActivity.reduce((s, m) => s + m.earned - m.redeemed - m.expired, 0);

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      Bronze: 'bg-muted text-muted-foreground',
      Silver: 'bg-secondary text-secondary-foreground',
      Gold: 'bg-primary/20 text-primary',
      Platinum: 'bg-accent text-accent-foreground',
      Diamond: 'bg-destructive/20 text-destructive',
    };
    return colors[tier] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" /> Loyalty Program Manager
          </h2>
          <p className="text-xs text-muted-foreground">Points, tiers, rewards, and member engagement tracking</p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1"><Zap className="h-3 w-3" /> New Reward</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Members', value: totalMembers.toLocaleString(), icon: Users },
          { label: 'Points in Circulation', value: `${(totalPointsCirculating / 1000).toFixed(0)}K`, icon: Star },
          { label: 'Rewards Claimed', value: rewards.reduce((s, r) => s + r.claimed, 0), icon: Gift },
          { label: 'Diamond Members', value: tierDistribution.find(t => t.name === 'Diamond')?.value || 0, icon: Crown },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-foreground mt-1">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="activity">
        <TabsList className="h-8">
          <TabsTrigger value="activity" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Points Activity</TabsTrigger>
          <TabsTrigger value="rewards" className="text-xs gap-1"><Gift className="h-3 w-3" /> Rewards Catalog</TabsTrigger>
          <TabsTrigger value="members" className="text-xs gap-1"><Crown className="h-3 w-3" /> Top Members</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Points Flow</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={pointsActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="earned" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" name="Earned" />
                    <Area type="monotone" dataKey="redeemed" fill="hsl(var(--secondary) / 0.2)" stroke="hsl(var(--secondary))" name="Redeemed" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tier Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={tierDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                      {tierDistribution.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                {rewards.map((reward, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                    <div>
                      <p className="text-xs font-medium text-foreground">{reward.name}</p>
                      <p className="text-[10px] text-muted-foreground">{reward.category} · Stock: {reward.stock}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{reward.claimed} claimed</span>
                      <Badge className="bg-primary/20 text-primary text-[9px]">
                        <Star className="h-2.5 w-2.5 mr-0.5" /> {reward.points.toLocaleString()} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                {topEarners.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">Lifetime: {(member.lifetime / 1000).toFixed(0)}K pts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground">{member.points.toLocaleString()} pts</span>
                      <Badge className={`text-[9px] ${getTierColor(member.tier)}`}>{member.tier}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoyaltyProgramManager;

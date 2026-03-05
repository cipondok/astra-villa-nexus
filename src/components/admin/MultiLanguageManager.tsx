import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Globe, Languages, Search, CheckCircle, AlertTriangle, FileText, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const languages = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', translated: 100, total: 2450, status: 'complete', users: 68 },
  { code: 'en', name: 'English', flag: '🇬🇧', translated: 2380, total: 2450, status: 'in-progress', users: 22 },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳', translated: 1820, total: 2450, status: 'in-progress', users: 5 },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵', translated: 1540, total: 2450, status: 'in-progress', users: 2 },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷', translated: 980, total: 2450, status: 'draft', users: 1.5 },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦', translated: 650, total: 2450, status: 'draft', users: 1.5 },
];

const translationCategories = [
  { category: 'UI Labels', keys: 580, translated: 560, priority: 'high' },
  { category: 'Property Fields', keys: 420, translated: 380, priority: 'high' },
  { category: 'Error Messages', keys: 280, translated: 240, priority: 'medium' },
  { category: 'Email Templates', keys: 150, translated: 120, priority: 'medium' },
  { category: 'Legal & Terms', keys: 320, translated: 180, priority: 'low' },
  { category: 'Marketing Copy', keys: 400, translated: 210, priority: 'low' },
  { category: 'Help & Guides', keys: 300, translated: 150, priority: 'low' },
];

const userLangDistribution = languages.map(l => ({
  name: l.code.toUpperCase(),
  value: l.users,
  fill: l.code === 'id' ? 'hsl(var(--primary))' : l.code === 'en' ? 'hsl(var(--secondary))' : l.code === 'zh' ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
}));

const MultiLanguageManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const totalKeys = 2450;
  const avgCompletion = Math.round(languages.reduce((s, l) => s + (l.code === 'id' ? l.total : l.translated), 0) / languages.length / totalKeys * 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete': return <Badge className="bg-primary/20 text-primary text-[9px]"><CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Complete</Badge>;
      case 'in-progress': return <Badge variant="secondary" className="text-[9px]">In Progress</Badge>;
      case 'draft': return <Badge variant="outline" className="text-[9px]">Draft</Badge>;
      default: return <Badge variant="outline" className="text-[9px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" /> Multi-Language Manager
          </h2>
          <p className="text-xs text-muted-foreground">Translation management, language coverage, and localization tracking</p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1"><Globe className="h-3 w-3" /> Add Language</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Languages', value: languages.length, icon: Globe },
          { label: 'Total Keys', value: totalKeys.toLocaleString(), icon: FileText },
          { label: 'Avg Completion', value: `${avgCompletion}%`, icon: CheckCircle },
          { label: 'Missing Keys', value: languages.reduce((s, l) => s + (l.code === 'id' ? 0 : l.total - l.translated), 0), icon: AlertTriangle },
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

      <Tabs defaultValue="languages">
        <TabsList className="h-8">
          <TabsTrigger value="languages" className="text-xs gap-1"><Globe className="h-3 w-3" /> Languages</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs gap-1"><FileText className="h-3 w-3" /> Categories</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs gap-1"><Users className="h-3 w-3" /> User Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="languages">
          <Card>
            <CardContent className="p-3 space-y-2">
              {languages.map((lang) => {
                const pct = lang.code === 'id' ? 100 : Math.round((lang.translated / lang.total) * 100);
                return (
                  <div key={lang.code} className="p-2.5 rounded-lg border border-border/40 bg-muted/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <div>
                          <p className="text-xs font-medium text-foreground">{lang.name}</p>
                          <p className="text-[10px] text-muted-foreground">{lang.translated}/{lang.total} keys · {lang.users}% users</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{pct}%</span>
                        {getStatusBadge(lang.status)}
                      </div>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Translation by Category (English)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={translationCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="category" className="text-xs" width={110} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="translated" fill="hsl(var(--primary))" name="Translated" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="keys" fill="hsl(var(--muted))" name="Total Keys" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">User Language Preference (%)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={userLangDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}%`}>
                    {userLangDistribution.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiLanguageManager;

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Search, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WebTrafficAnalytics from './WebTrafficAnalytics';
import { SearchAnalytics } from './SearchAnalytics';

const SystemAnalytics = () => {
  // Fetch real user count
  const { data: userCount = 0 } = useQuery({
    queryKey: ['total-users'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Fetch real property count
  const { data: propertyCount = 0 } = useQuery({
    queryKey: ['total-properties'],
    queryFn: async () => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Fetch page views from web_analytics (last 30 days)
  const { data: pageViews = 0 } = useQuery({
    queryKey: ['total-page-views'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count } = await supabase
        .from('web_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return count || 0;
    },
  });

  // Fetch search count from web_analytics page paths (last 30 days)
  const { data: searchCount = 0 } = useQuery({
    queryKey: ['total-searches'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count } = await supabase
        .from('web_analytics')
        .select('*', { count: 'exact', head: true })
        .ilike('page_path', '%search%')
        .gte('created_at', thirtyDaysAgo.toISOString());

      return count || 0;
    },
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userCount.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Properties Listed</p>
                <p className="text-2xl font-bold">{propertyCount.toLocaleString()}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views (30d)</p>
                <p className="text-2xl font-bold">{pageViews.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Searches (30d)</p>
                <p className="text-2xl font-bold">{searchCount.toLocaleString()}</p>
              </div>
              <Search className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Web Traffic</TabsTrigger>
          <TabsTrigger value="search">Search Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <WebTrafficAnalytics />
        </TabsContent>

        <TabsContent value="search">
          <SearchAnalytics metrics={{}} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAnalytics;

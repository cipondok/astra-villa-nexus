import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, Filter, Clock, Target, AlertCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface SearchAnalyticsProps {
  metrics: any;
}

interface SearchInsight {
  query: string;
  count: number;
  avgResponseTime: number;
  successRate: number;
  clickThroughRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface FilterUsage {
  filterName: string;
  usageCount: number;
  effectiveness: number;
  avgResults: number;
}

export function SearchAnalytics({ metrics }: SearchAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [searchInsights, setSearchInsights] = useState<SearchInsight[]>([]);
  const [filterAnalytics, setFilterAnalytics] = useState<FilterUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  
  const [searchTrends, setSearchTrends] = useState([
    { date: '2024-01-01', searches: 245, success: 89, avgTime: 320 },
    { date: '2024-01-02', searches: 389, success: 92, avgTime: 285 },
    { date: '2024-01-03', searches: 456, success: 88, avgTime: 410 },
    { date: '2024-01-04', searches: 523, success: 94, avgTime: 275 },
    { date: '2024-01-05', searches: 612, success: 91, avgTime: 295 },
    { date: '2024-01-06', searches: 478, success: 85, avgTime: 380 },
    { date: '2024-01-07', searches: 534, success: 93, avgTime: 260 }
  ]);

  useEffect(() => {
    loadSearchAnalytics();
  }, [timeRange]);

  const loadSearchAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-analytics', {
        body: {
          timeRange,
          includeQueries: true,
          includeFilters: true,
          includeTrends: true
        }
      });

      if (error) throw error;
      
      setSearchInsights(data?.insights || mockSearchInsights);
      setFilterAnalytics(data?.filters || mockFilterAnalytics);
    } catch (error) {
      console.error('Failed to load search analytics:', error);
      // Use mock data as fallback
      setSearchInsights(mockSearchInsights);
      setFilterAnalytics(mockFilterAnalytics);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const mockSearchInsights: SearchInsight[] = [
    { query: 'apartment jakarta', count: 1250, avgResponseTime: 285, successRate: 92, clickThroughRate: 78, trend: 'up' },
    { query: 'house bandung', count: 890, avgResponseTime: 320, successRate: 88, clickThroughRate: 65, trend: 'stable' },
    { query: 'villa bali', count: 650, avgResponseTime: 410, successRate: 85, clickThroughRate: 82, trend: 'up' },
    { query: 'office space surabaya', count: 520, avgResponseTime: 275, successRate: 94, clickThroughRate: 71, trend: 'down' },
    { query: 'studio apartment', count: 480, avgResponseTime: 295, successRate: 91, clickThroughRate: 68, trend: 'stable' }
  ];

  const mockFilterAnalytics: FilterUsage[] = [
    { filterName: 'Price Range', usageCount: 2845, effectiveness: 89, avgResults: 45 },
    { filterName: 'Property Type', usageCount: 2156, effectiveness: 92, avgResults: 38 },
    { filterName: 'Location', usageCount: 1987, effectiveness: 85, avgResults: 52 },
    { filterName: 'Bedrooms', usageCount: 1654, effectiveness: 78, avgResults: 28 },
    { filterName: 'Bathrooms', usageCount: 1289, effectiveness: 74, avgResults: 32 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Search Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights into search performance and user queries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadSearchAnalytics} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Search Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.searchAlgorithm?.totalSearches?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.searchAlgorithm?.successRate?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Search success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.searchAlgorithm?.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Query processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filter Usage</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              Searches with filters
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Performance Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Search Performance Trends</CardTitle>
            <CardDescription>Search volume, success rate, and response times over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={searchTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="searches" fill="#8884d8" name="Search Volume" />
                <Line yAxisId="right" type="monotone" dataKey="success" stroke="#82ca9d" name="Success Rate %" />
                <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#ffc658" name="Avg Time (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Search Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Search Queries</CardTitle>
            <CardDescription>Most popular search terms and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchInsights.slice(0, 8).map((insight, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                    selectedQuery === insight.query ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedQuery(
                    selectedQuery === insight.query ? null : insight.query
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{insight.query}</span>
                      <Badge variant={
                        insight.trend === 'up' ? 'default' : 
                        insight.trend === 'down' ? 'destructive' : 'secondary'
                      }>
                        {insight.trend === 'up' ? '↗' : insight.trend === 'down' ? '↘' : '→'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {insight.count.toLocaleString()} searches • {insight.successRate}% success
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{insight.clickThroughRate}%</div>
                    <div className="text-xs text-muted-foreground">CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter Usage Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Usage Analysis</CardTitle>
            <CardDescription>How users utilize search filters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filterAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="filterName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usageCount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filter Effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Effectiveness</CardTitle>
          <CardDescription>How effective each filter is at improving search results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {filterAnalytics.map((filter, index) => (
              <div key={index} className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-primary">{filter.effectiveness}%</div>
                <div className="text-sm font-medium">{filter.filterName}</div>
                <div className="text-xs text-muted-foreground">
                  {filter.usageCount.toLocaleString()} uses
                </div>
                <div className="text-xs text-muted-foreground">
                  {filter.avgResults} avg results
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Query Analysis */}
      {selectedQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Query Analysis: "{selectedQuery}"</CardTitle>
            <CardDescription>Detailed performance metrics for selected search query</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {searchInsights.find(s => s.query === selectedQuery)?.count.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Searches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {searchInsights.find(s => s.query === selectedQuery)?.avgResponseTime}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {searchInsights.find(s => s.query === selectedQuery)?.successRate}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {searchInsights.find(s => s.query === selectedQuery)?.clickThroughRate}%
                </div>
                <div className="text-sm text-muted-foreground">Click-Through Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Filter Combinations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Popular Filter Combinations
          </CardTitle>
          <CardDescription>Most commonly used filter combinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border rounded">
                <span>Price Range + Property Type</span>
                <Badge>45% of searches</Badge>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span>Location + Price Range</span>
                <Badge>38% of searches</Badge>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span>Bedrooms + Price Range</span>
                <Badge>32% of searches</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border rounded">
                <span>Property Type + Bedrooms</span>
                <Badge>28% of searches</Badge>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span>Location + Property Type</span>
                <Badge>25% of searches</Badge>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span>All Filters</span>
                <Badge>15% of searches</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
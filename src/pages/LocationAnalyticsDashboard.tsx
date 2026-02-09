import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, Search, Eye, MapPin, Clock, Users, Loader2 } from 'lucide-react';
import { useSearchKeywordAnalytics, useVisitorLocationAnalytics, usePropertyViewsByLocation } from '@/hooks/useLocationAnalytics';
import { format } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const LocationAnalyticsDashboard = () => {
  const [days, setDays] = useState(30);
  const { data: keywords, isLoading: kwLoading } = useSearchKeywordAnalytics(days);
  const { data: visitors, isLoading: visLoading } = useVisitorLocationAnalytics(days);
  const { data: propViews, isLoading: pvLoading } = usePropertyViewsByLocation(days);

  const isLoading = kwLoading || visLoading || pvLoading;

  // Aggregate visitor data by country
  const countryData = visitors
    ? Object.entries(
        visitors.reduce((acc, v) => {
          acc[v.country] = (acc[v.country] || 0) + v.visitor_count;
          return acc;
        }, {} as Record<string, number>)
      )
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    : [];

  const totalVisitors = visitors?.reduce((s, v) => s + v.visitor_count, 0) || 0;
  const totalSearches = keywords?.reduce((s, k) => s + k.search_count, 0) || 0;
  const totalPropViews = propViews?.reduce((s, p) => s + p.view_count, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Location Analytics</h1>
          <p className="text-muted-foreground">Visitor location, search keywords & property views</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                days === d ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-blue-500/10 rounded-xl"><Users className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Visitors</p>
              <p className="text-3xl font-bold">{totalVisitors.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-green-500/10 rounded-xl"><Search className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Searches</p>
              <p className="text-3xl font-bold">{totalSearches.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-purple-500/10 rounded-xl"><Eye className="h-6 w-6 text-purple-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Property Views</p>
              <p className="text-3xl font-bold">{totalPropViews.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="visitors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visitors">Visitor Locations</TabsTrigger>
            <TabsTrigger value="keywords">Search Keywords</TabsTrigger>
            <TabsTrigger value="property-views">Property Views</TabsTrigger>
          </TabsList>

          {/* Visitor Locations */}
          <TabsContent value="visitors" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Top Countries</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={countryData} dataKey="count" nameKey="country" cx="50%" cy="50%" outerRadius={100} label={e => e.country}>
                        {countryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Top Cities</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {visitors?.slice(0, 20).map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{v.city}</span>
                          <span className="text-xs text-muted-foreground">{v.country}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span>{v.visitor_count} visitors</span>
                          <span className="text-muted-foreground">{v.page_views} views</span>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />{v.avg_duration}s
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Keywords */}
          <TabsContent value="keywords" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Top Search Keywords</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={keywords?.slice(0, 15)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="search_query" type="category" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="search_count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Search Details</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead className="text-right">Searches</TableHead>
                        <TableHead className="text-right">Avg Results</TableHead>
                        <TableHead>Last Searched</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keywords?.slice(0, 20).map((k, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{k.search_query}</TableCell>
                          <TableCell className="text-right">{k.search_count}</TableCell>
                          <TableCell className="text-right">{k.avg_results}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(k.last_searched), 'dd MMM yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Property Views by Location */}
          <TabsContent value="property-views" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Property Views by Visitor Location</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Page</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propViews?.slice(0, 30).map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-sm max-w-[300px] truncate">{p.page_path}</TableCell>
                        <TableCell>{p.country}</TableCell>
                        <TableCell>{p.city}</TableCell>
                        <TableCell className="text-right font-bold">{p.view_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!propViews || propViews.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">No property view data available for this period</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default LocationAnalyticsDashboard;

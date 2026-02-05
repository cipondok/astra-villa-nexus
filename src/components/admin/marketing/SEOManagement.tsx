import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Search, TrendingUp, Globe, FileText, Play, Pause, RefreshCw, 
  Eye, BarChart3, Target, Zap, Clock, CheckCircle, AlertCircle,
  ArrowUp, ArrowDown, Minus, MapPin, Building2, Loader2
} from 'lucide-react';

interface SEOLandingPage {
  id: string;
  slug: string;
  page_type: string;
  state_name: string;
  category: string | null;
  property_type: string | null;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  primary_keyword: string | null;
  property_count: number;
  seo_score: number | null;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

interface SEOKeyword {
  id: string;
  keyword: string;
  search_volume: number | null;
  current_position: number | null;
  previous_position: number | null;
  position_change: number | null;
  target_url: string | null;
  is_tracked: boolean;
  last_checked_at: string | null;
}

interface InternalSearch {
  id: string;
  search_query: string;
  results_count: number;
  location_filter: string | null;
  property_type_filter: string | null;
  created_at: string;
}

const SEOManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch landing pages
  const { data: landingPages = [], isLoading: loadingPages } = useQuery({
    queryKey: ['seo-landing-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_landing_pages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SEOLandingPage[];
    },
  });

  // Fetch keywords
  const { data: keywords = [], isLoading: loadingKeywords } = useQuery({
    queryKey: ['seo-keywords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_keywords')
        .select('*')
        .order('search_volume', { ascending: false });
      if (error) throw error;
      return data as SEOKeyword[];
    },
  });

  // Fetch internal searches
  const { data: internalSearches = [], isLoading: loadingSearches } = useQuery({
    queryKey: ['seo-internal-searches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_internal_searches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as InternalSearch[];
    },
  });

  // Fetch queue stats
  const { data: queueStats } = useQuery({
    queryKey: ['seo-queue-stats'],
    queryFn: async () => {
      const { data: pending } = await supabase
        .from('seo_publish_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      const { data: processing } = await supabase
        .from('seo_publish_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'processing');
      const { data: completed } = await supabase
        .from('seo_publish_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');
      return {
        pending: pending?.length || 0,
        processing: processing?.length || 0,
        completed: completed?.length || 0,
      };
    },
  });

  // Generate all states mutation
  const generateAllStatesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seo-content-generator', {
        body: { action: 'generate-all-states' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Queued ${data.queued} state pages for generation`);
      queryClient.invalidateQueries({ queryKey: ['seo-landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['seo-queue-stats'] });
    },
    onError: (error) => {
      toast.error('Failed to queue generation: ' + error.message);
    },
  });

  // Generate all combinations mutation
  const generateAllCombinationsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seo-content-generator', {
        body: { action: 'generate-all-combinations' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Queued ${data.queued} pages for generation`);
      queryClient.invalidateQueries({ queryKey: ['seo-landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['seo-queue-stats'] });
    },
    onError: (error) => {
      toast.error('Failed to queue generation: ' + error.message);
    },
  });

  // Generate all property posts mutation (new one-click feature)
  const generateAllPropertyPostsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seo-content-generator', {
        body: { action: 'generate-all-property-posts' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Created ${data.created} pages, updated ${data.updated} pages (Total: ${data.total})`);
      queryClient.invalidateQueries({ queryKey: ['seo-landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['seo-queue-stats'] });
    },
    onError: (error) => {
      toast.error('Failed to generate: ' + error.message);
    },
  });

  // Sync property counts mutation
  const syncPropertyCountsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seo-content-generator', {
        body: { action: 'sync-property-counts' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Synced ${data.synced} pages with real property counts`);
      queryClient.invalidateQueries({ queryKey: ['seo-landing-pages'] });
    },
    onError: (error) => {
      toast.error('Failed to sync: ' + error.message);
    },
  });

  // Process queue mutation
  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seo-content-generator', {
        body: { action: 'process-queue', batchSize: 5 },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Processed ${data.processed} pages`);
      queryClient.invalidateQueries({ queryKey: ['seo-landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['seo-queue-stats'] });
    },
    onError: (error) => {
      toast.error('Failed to process queue: ' + error.message);
    },
  });

  // Publish/unpublish page mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from('seo_landing_pages')
        .update({ is_published: !isPublished })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Page status updated');
      queryClient.invalidateQueries({ queryKey: ['seo-landing-pages'] });
    },
  });

  // Stats
  const totalPages = landingPages.length;
  const publishedPages = landingPages.filter(p => p.is_published).length;
  const avgSeoScore = landingPages.length > 0
    ? Math.round(landingPages.reduce((acc, p) => acc + (p.seo_score || 0), 0) / landingPages.length)
    : 0;
  const totalViews = landingPages.reduce((acc, p) => acc + (p.views_count || 0), 0);

  // Filter pages
  const filteredPages = landingPages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.state_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get top searches
  const searchCounts = internalSearches.reduce((acc, s) => {
    acc[s.search_query] = (acc[s.search_query] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const getPositionChangeIcon = (change: number | null) => {
    if (!change || change === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (change > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    return <ArrowDown className="h-3 w-3 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">SEO Management</h2>
          <p className="text-sm text-muted-foreground">AI-powered SEO content generation & keyword tracking</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm"
            onClick={() => generateAllPropertyPostsMutation.mutate()}
            disabled={generateAllPropertyPostsMutation.isPending}
            className="bg-primary"
          >
            {generateAllPropertyPostsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Generate All State+Type Posts
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => syncPropertyCountsMutation.mutate()}
            disabled={syncPropertyCountsMutation.isPending}
          >
            {syncPropertyCountsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync Counts
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateAllStatesMutation.mutate()}
            disabled={generateAllStatesMutation.isPending}
          >
            {generateAllStatesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
            State Pages
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => processQueueMutation.mutate()}
            disabled={processQueueMutation.isPending || (queueStats?.pending || 0) === 0}
          >
            {processQueueMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
            Queue ({queueStats?.pending || 0})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border rounded-[6px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[6px] bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{totalPages}</p>
                <p className="text-xs text-muted-foreground">Total Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border rounded-[6px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[6px] bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{publishedPages}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border rounded-[6px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[6px] bg-amber-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{avgSeoScore}</p>
                <p className="text-xs text-muted-foreground">Avg SEO Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border rounded-[6px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[6px] bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">
            <Globe className="h-4 w-4 mr-2" />
            Landing Pages
          </TabsTrigger>
          <TabsTrigger value="keywords">
            <Target className="h-4 w-4 mr-2" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="searches">
            <Search className="h-4 w-4 mr-2" />
            Internal Searches
          </TabsTrigger>
          <TabsTrigger value="queue">
            <Clock className="h-4 w-4 mr-2" />
            Queue
          </TabsTrigger>
        </TabsList>

        {/* Landing Pages Tab */}
        <TabsContent value="overview" className="mt-4">
          <Card className="border border-border rounded-[6px]">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">SEO Landing Pages</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>SEO Score</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPages ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredPages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No landing pages found. Click "Generate State Pages" to create.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPages.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{page.title}</p>
                              <p className="text-xs text-muted-foreground">/{page.slug}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {page.page_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{page.property_count}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={page.seo_score || 0} className="w-16 h-2" />
                              <span className="text-xs">{page.seo_score || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{page.views_count}</TableCell>
                          <TableCell>
                            <Badge variant={page.is_published ? 'default' : 'secondary'} className="text-xs">
                              {page.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePublishMutation.mutate({ id: page.id, isPublished: page.is_published })}
                            >
                              {page.is_published ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="mt-4">
          <Card className="border border-border rounded-[6px]">
            <CardHeader>
              <CardTitle className="text-base">Keyword Tracking</CardTitle>
              <CardDescription>Monitor your keyword rankings and search volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Target URL</TableHead>
                      <TableHead>Last Check</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingKeywords ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : keywords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No keywords tracked yet. Add keywords to start monitoring.
                        </TableCell>
                      </TableRow>
                    ) : (
                      keywords.map((kw) => (
                        <TableRow key={kw.id}>
                          <TableCell className="font-medium">{kw.keyword}</TableCell>
                          <TableCell>{kw.search_volume?.toLocaleString() || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{kw.current_position || '-'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getPositionChangeIcon(kw.position_change)}
                              <span className="text-xs">{Math.abs(kw.position_change || 0)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {kw.target_url || '-'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {kw.last_checked_at ? new Date(kw.last_checked_at).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internal Searches Tab */}
        <TabsContent value="searches" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border rounded-[6px]">
              <CardHeader>
                <CardTitle className="text-base">Top Search Queries</CardTitle>
                <CardDescription>Most popular searches on your site</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {topSearches.map(([query, count], index) => (
                      <div key={query} className="flex items-center justify-between p-2 bg-muted/50 rounded-[6px]">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground w-6">#{index + 1}</span>
                          <span className="text-sm">{query}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                    {topSearches.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No search data yet</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-[6px]">
              <CardHeader>
                <CardTitle className="text-base">Recent Searches</CardTitle>
                <CardDescription>Latest user search queries</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {internalSearches.slice(0, 20).map((search) => (
                      <div key={search.id} className="flex items-center justify-between p-2 border-b border-border/50">
                        <div>
                          <p className="text-sm font-medium">{search.search_query}</p>
                          <p className="text-xs text-muted-foreground">
                            {search.results_count} results
                            {search.location_filter && ` • ${search.location_filter}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(search.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {internalSearches.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No search data yet</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue" className="mt-4">
          <Card className="border border-border rounded-[6px]">
            <CardHeader>
              <CardTitle className="text-base">Generation Queue</CardTitle>
              <CardDescription>AI content generation status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-amber-500/10 rounded-[6px] text-center">
                  <p className="text-2xl font-bold text-amber-500">{queueStats?.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-[6px] text-center">
                  <p className="text-2xl font-bold text-blue-500">{queueStats?.processing || 0}</p>
                  <p className="text-xs text-muted-foreground">Processing</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-[6px] text-center">
                  <p className="text-2xl font-bold text-green-500">{queueStats?.completed || 0}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
              
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {(queueStats?.pending || 0) > 0 
                    ? `${queueStats?.pending} pages waiting to be generated with AI`
                    : 'Queue is empty. Generate new pages to start.'}
                </p>
                <Button 
                  onClick={() => processQueueMutation.mutate()}
                  disabled={processQueueMutation.isPending || (queueStats?.pending || 0) === 0}
                >
                  {processQueueMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Process Next Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOManagement;

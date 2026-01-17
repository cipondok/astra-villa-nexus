import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, subDays } from 'date-fns';
import { MessageDetailsDialog } from './MessageDetailsDialog';
import { toast } from 'sonner';

interface ReactionStats {
  total_reactions: number;
  positive_reactions: number;
  negative_reactions: number;
  positive_percentage: number;
  negative_percentage: number;
}

interface TimeSeriesData {
  date: string;
  positive: number;
  negative: number;
  total: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

export function AIFeedbackAnalytics() {
  const [timeRange, setTimeRange] = useState(30);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReactionType, setSelectedReactionType] = useState<'positive' | 'negative' | 'all'>('all');

  // Fetch overall reaction stats
  const { data: reactionStats, isLoading: statsLoading } = useQuery({
    queryKey: ['ai-reaction-stats', timeRange],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), timeRange), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('ai_message_reactions')
        .select('reaction_type')
        .gte('created_at', startDate);

      if (error) throw error;

      const total = data?.length || 0;
      const positive = data?.filter(r => r.reaction_type === 'positive').length || 0;
      const negative = data?.filter(r => r.reaction_type === 'negative').length || 0;

      return {
        total_reactions: total,
        positive_reactions: positive,
        negative_reactions: negative,
        positive_percentage: total > 0 ? (positive / total) * 100 : 0,
        negative_percentage: total > 0 ? (negative / total) * 100 : 0,
      } as ReactionStats;
    },
  });

  // Fetch time series data for charts
  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['ai-reaction-timeseries', timeRange],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), timeRange), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('ai_message_reactions')
        .select('created_at, reaction_type')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = (data || []).reduce((acc: Record<string, { positive: number; negative: number }>, curr) => {
        const date = format(new Date(curr.created_at), 'MMM dd');
        if (!acc[date]) {
          acc[date] = { positive: 0, negative: 0 };
        }
        if (curr.reaction_type === 'positive') {
          acc[date].positive++;
        } else {
          acc[date].negative++;
        }
        return acc;
      }, {});

      return Object.entries(grouped).map(([date, counts]) => ({
        date,
        positive: counts.positive,
        negative: counts.negative,
        total: counts.positive + counts.negative,
      })) as TimeSeriesData[];
    },
  });

  // Fetch distribution data for pie chart
  const { data: distributionData } = useQuery({
    queryKey: ['ai-reaction-distribution', timeRange],
    queryFn: async () => {
      const stats = reactionStats;
      if (!stats) return [];

      return [
        { name: 'Positive', value: stats.positive_reactions },
        { name: 'Negative', value: stats.negative_reactions },
      ];
    },
    enabled: !!reactionStats,
  });

  const handleChartClick = (data: any, reactionType: 'positive' | 'negative' | 'all' = 'all') => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedDate = data.activePayload[0].payload.date;
      setSelectedDate(clickedDate);
      setSelectedReactionType(reactionType);
      setDialogOpen(true);
      toast.info(`Viewing messages from ${clickedDate}`);
    }
  };

  const handlePieClick = (data: any) => {
    if (data && data.name) {
      const reactionType = data.name.toLowerCase() as 'positive' | 'negative';
      setSelectedReactionType(reactionType);
      // For pie chart, we don't have a specific date, so we'll show all messages with that reaction type
      setSelectedDate(null);
      setDialogOpen(true);
      toast.info(`Viewing all ${data.name.toLowerCase()} reactions`);
    }
  };

  const handleExportData = async () => {
    const startDate = format(subDays(new Date(), timeRange), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('ai_message_reactions')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error exporting data:', error);
      return;
    }

    // Convert to CSV
    const csv = [
      ['Date', 'Message ID', 'Reaction', 'User ID', 'Conversation ID'].join(','),
      ...(data || []).map(row => [
        format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss'),
        row.message_id,
        row.reaction_type,
        row.user_id || 'anonymous',
        row.conversation_id || 'N/A',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-feedback-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (statsLoading || timeSeriesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-lg border border-green-200/50 dark:border-green-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">AI Feedback Analytics</h2>
            <p className="text-[10px] text-muted-foreground">Track user reactions to AI responses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
            <SelectTrigger className="w-28 h-7 text-[10px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7" className="text-xs">Last 7 days</SelectItem>
              <SelectItem value="30" className="text-xs">Last 30 days</SelectItem>
              <SelectItem value="90" className="text-xs">Last 90 days</SelectItem>
              <SelectItem value="365" className="text-xs">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData} size="sm" className="h-7 text-[10px]">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold">{reactionStats?.total_reactions || 0}</div>
              <div className="text-[9px] text-muted-foreground">Total Reactions</div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
              <ThumbsUp className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-bold">{reactionStats?.positive_reactions || 0}</div>
              <div className="text-[9px] text-muted-foreground">{reactionStats?.positive_percentage.toFixed(1)}% positive</div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg border bg-red-50/50 dark:bg-red-950/20 border-red-200/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
              <ThumbsDown className="h-3 w-3 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-bold">{reactionStats?.negative_reactions || 0}</div>
              <div className="text-[9px] text-muted-foreground">{reactionStats?.negative_percentage.toFixed(1)}% negative</div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-bold">{reactionStats?.positive_percentage.toFixed(0)}%</div>
              <div className="text-[9px] text-muted-foreground">Satisfaction Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Reactions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Reactions Timeline</CardTitle>
            <CardDescription>Click on any data point to view messages from that date</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                positive: {
                  label: 'Positive',
                  color: 'hsl(var(--chart-1))',
                },
                negative: {
                  label: 'Negative',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={timeSeriesData || []}
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                    cursor="pointer"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                    cursor="pointer"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Reaction Distribution</CardTitle>
            <CardDescription>Click on a segment to view messages by reaction type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                positive: {
                  label: 'Positive',
                  color: 'hsl(var(--chart-1))',
                },
                negative: {
                  label: 'Negative',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={handlePieClick}
                    cursor="pointer"
                  >
                    {(distributionData || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Message Details Dialog */}
      <MessageDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        reactionType={selectedReactionType}
        timeRange={timeRange}
      />
    </div>
  );
}

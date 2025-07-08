import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, Star, ThumbsUp, MessageSquare } from 'lucide-react';

const FeedbackAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['feedback-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_monitoring')
        .select('*')
        .eq('feedback_type', 'service_completion');
      
      if (error) throw error;
      
      // Process analytics data
      const totalFeedback = data.length;
      const avgRating = data.reduce((acc, item) => acc + (item.rating || 0), 0) / totalFeedback;
      
      // Service aspects analysis
      const aspectCounts: Record<string, number> = {};
      data.forEach(item => {
        // Parse metadata if it exists (stored as JSON in database)
        const metadata = typeof item.content === 'string' ? 
          (() => {
            try { return JSON.parse(item.content); } catch { return {}; }
          })() : {};
        const aspects = metadata?.service_aspects || [];
        if (Array.isArray(aspects)) {
          aspects.forEach((aspect: string) => {
            aspectCounts[aspect] = (aspectCounts[aspect] || 0) + 1;
          });
        }
      });

      // Rating distribution
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: data.filter(item => item.rating === rating).length,
        percentage: (data.filter(item => item.rating === rating).length / totalFeedback) * 100
      }));

      // Most appreciated aspects
      const topAspects = Object.entries(aspectCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([aspect, count]) => ({
          aspect: aspect.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count,
          percentage: (count / totalFeedback) * 100
        }));

      return {
        totalFeedback,
        avgRating: avgRating || 0,
        ratingDistribution,
        topAspects,
        completionRate: 85, // This would be calculated from actual completion tracking
        tipFrequency: 42 // This would be calculated from actual tip data
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalFeedback || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.avgRating.toFixed(1) || '0.0'}/5
            </div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tip Frequency</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.tipFrequency || 0}%</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rating Distribution
          </CardTitle>
          <CardDescription>
            How customers rate their service experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics?.ratingDistribution.map((item) => (
            <div key={item.rating} className="flex items-center gap-4">
              <div className="flex items-center gap-1 w-16">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{item.rating}</span>
              </div>
              <div className="flex-1">
                <Progress value={item.percentage} className="h-2" />
              </div>
              <div className="text-sm text-muted-foreground w-16 text-right">
                {item.count} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Most Appreciated Aspects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Most Appreciated Service Aspects
          </CardTitle>
          <CardDescription>
            What customers like most about your services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics?.topAspects.map((aspect, index) => (
            <div key={aspect.aspect} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                <span className="font-medium">{aspect.aspect}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={aspect.percentage} className="h-2 w-20" />
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {aspect.count} ({aspect.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackAnalytics;
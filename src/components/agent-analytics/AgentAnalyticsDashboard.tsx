import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, TrendingUp, Target, DollarSign, 
  Clock, Brain, FileText, Calendar, RefreshCw, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgentAnalytics } from '@/hooks/useAgentAnalytics';

// Metric Components
import LeadGenerationStats from './metrics/LeadGenerationStats';
import ListingPerformance from './metrics/ListingPerformance';
import ConversionFunnel from './metrics/ConversionFunnel';
import MarketComparison from './metrics/MarketComparison';
import ROICalculator from './metrics/ROICalculator';
import TimeToSellTrends from './metrics/TimeToSellTrends';

// Insights & Reports
import PredictiveInsights from './insights/PredictiveInsights';
import AutomatedReports from './reports/AutomatedReports';

interface AgentAnalyticsDashboardProps {
  className?: string;
}

const AgentAnalyticsDashboard: React.FC<AgentAnalyticsDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const analytics = useAgentAnalytics();

  if (analytics.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (analytics.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">{analytics.error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'listings', label: 'Listings', icon: TrendingUp },
    { id: 'conversion', label: 'Funnel', icon: Target },
    { id: 'market', label: 'Market', icon: BarChart3 },
    { id: 'roi', label: 'ROI', icon: DollarSign },
    { id: 'timing', label: 'Timing', icon: Clock },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Agent Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Comprehensive performance insights and predictions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex bg-muted/50 rounded-lg p-0.5">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  dateRange === range 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-3"
        >
          <p className="text-[10px] text-muted-foreground">Total Leads</p>
          <p className="text-xl font-bold text-foreground">{analytics.leads?.totalLeads.toLocaleString()}</p>
          <p className="text-[10px] text-green-500">+{analytics.leads?.newLeads} this week</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
        >
          <p className="text-[10px] text-muted-foreground">Total Views</p>
          <p className="text-xl font-bold text-foreground">{analytics.listings?.totalViews.toLocaleString()}</p>
          <p className="text-[10px] text-primary">{analytics.listings?.avgViewsPerListing} avg/listing</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
        >
          <p className="text-[10px] text-muted-foreground">Conversion Rate</p>
          <p className="text-xl font-bold text-foreground">{(analytics.conversion?.overallRate * 100).toFixed(2)}%</p>
          <p className="text-[10px] text-muted-foreground">{analytics.conversion?.avgTimeToConvert}d avg</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-3"
        >
          <p className="text-[10px] text-muted-foreground">ROI</p>
          <p className="text-xl font-bold text-green-500">{analytics.roi?.roi.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Rp {((analytics.roi?.netProfit || 0) / 1_000_000_000).toFixed(1)}B profit</p>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/30 p-1 h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="overview" className="space-y-4 mt-0">
            <div className="grid lg:grid-cols-2 gap-4">
              <LeadGenerationStats data={analytics.leads!} />
              <ListingPerformance data={analytics.listings!} />
            </div>
            <PredictiveInsights insights={analytics.insights!} />
          </TabsContent>

          <TabsContent value="leads" className="mt-0">
            <LeadGenerationStats data={analytics.leads!} />
          </TabsContent>

          <TabsContent value="listings" className="mt-0">
            <ListingPerformance data={analytics.listings!} />
          </TabsContent>

          <TabsContent value="conversion" className="mt-0">
            <ConversionFunnel data={analytics.conversion!} />
          </TabsContent>

          <TabsContent value="market" className="mt-0">
            <MarketComparison data={analytics.market!} />
          </TabsContent>

          <TabsContent value="roi" className="mt-0">
            <ROICalculator data={analytics.roi!} />
          </TabsContent>

          <TabsContent value="timing" className="mt-0">
            <TimeToSellTrends data={analytics.timeToSell!} />
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <PredictiveInsights insights={analytics.insights!} />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <AutomatedReports />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AgentAnalyticsDashboard;

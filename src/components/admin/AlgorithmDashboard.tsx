import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Settings, BarChart3, Brain, Search, Eye, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { AlgorithmSettings } from "./AlgorithmSettings";
import { BehaviorAnalytics } from "./BehaviorAnalytics";
import { SearchAnalytics } from "./SearchAnalytics";
import { PerformanceMonitor } from "./PerformanceMonitor";

interface AlgorithmMetrics {
  searchAlgorithm: {
    avgResponseTime: number;
    totalSearches: number;
    successRate: number;
    popularFilters: Record<string, number>;
  };
  recommendationEngine: {
    avgRecommendations: number;
    clickThroughRate: number;
    userSatisfaction: number;
    totalRecommendations: number;
  };
  behaviorAnalytics: {
    totalUsers: number;
    avgEngagementScore: number;
    avgIntentScore: number;
    topBehaviorPatterns: string[];
  };
  modelOptimization: {
    avgLoadTime: number;
    avgFPS: number;
    totalModelsLoaded: number;
    optimizationSavings: number;
  };
}

export function AlgorithmDashboard() {
  const [metrics, setMetrics] = useState<AlgorithmMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeAlgorithms, setActiveAlgorithms] = useState({
    search: true,
    recommendations: true,
    behavior: true,
    optimization: true
  });

  useEffect(() => {
    loadAlgorithmMetrics();
    const interval = setInterval(loadAlgorithmMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAlgorithmMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('algorithm-analytics', {
        body: { requestType: 'dashboard_metrics' }
      });

      if (error) throw error;
      
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load metrics:', error);
      toast.error('Failed to load algorithm metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlgorithm = async (algorithmName: keyof typeof activeAlgorithms) => {
    const newState = !activeAlgorithms[algorithmName];
    
    try {
      const { error } = await supabase.functions.invoke('algorithm-controller', {
        body: {
          action: newState ? 'enable' : 'disable',
          algorithm: algorithmName
        }
      });

      if (error) throw error;

      setActiveAlgorithms(prev => ({ ...prev, [algorithmName]: newState }));
      toast.success(`${algorithmName} algorithm ${newState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(`Failed to toggle ${algorithmName} algorithm`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Algorithm Dashboard</h2>
            <p className="text-[10px] text-muted-foreground">Manage and monitor AI algorithms and analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[8px] h-5 px-1.5">
            Updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button onClick={loadAlgorithmMetrics} size="sm" className="h-7 text-[10px]">
            Refresh
          </Button>
        </div>
      </div>

      {/* Algorithm Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Search className="h-3 w-3 text-blue-600" />
              <span className="text-[9px] font-medium text-muted-foreground">Search Algorithm</span>
            </div>
            <Button
              variant={activeAlgorithms.search ? "default" : "secondary"}
              size="sm"
              className="h-5 text-[8px] px-1.5"
              onClick={() => toggleAlgorithm('search')}
            >
              {activeAlgorithms.search ? 'Active' : 'Off'}
            </Button>
          </div>
          <div className="text-lg font-bold">{metrics?.searchAlgorithm.successRate.toFixed(1)}%</div>
          <div className="text-[8px] text-muted-foreground">Success Rate</div>
        </div>

        <div className="p-2 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Brain className="h-3 w-3 text-purple-600" />
              <span className="text-[9px] font-medium text-muted-foreground">Recommendations</span>
            </div>
            <Button
              variant={activeAlgorithms.recommendations ? "default" : "secondary"}
              size="sm"
              className="h-5 text-[8px] px-1.5"
              onClick={() => toggleAlgorithm('recommendations')}
            >
              {activeAlgorithms.recommendations ? 'Active' : 'Off'}
            </Button>
          </div>
          <div className="text-lg font-bold">{metrics?.recommendationEngine.clickThroughRate.toFixed(1)}%</div>
          <div className="text-[8px] text-muted-foreground">Click-through Rate</div>
        </div>

        <div className="p-2 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3 w-3 text-green-600" />
              <span className="text-[9px] font-medium text-muted-foreground">Behavior Analytics</span>
            </div>
            <Button
              variant={activeAlgorithms.behavior ? "default" : "secondary"}
              size="sm"
              className="h-5 text-[8px] px-1.5"
              onClick={() => toggleAlgorithm('behavior')}
            >
              {activeAlgorithms.behavior ? 'Active' : 'Off'}
            </Button>
          </div>
          <div className="text-lg font-bold">{metrics?.behaviorAnalytics.avgEngagementScore.toFixed(0)}</div>
          <div className="text-[8px] text-muted-foreground">Avg Engagement</div>
        </div>

        <div className="p-2 rounded-lg border bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-orange-600" />
              <span className="text-[9px] font-medium text-muted-foreground">3D Optimization</span>
            </div>
            <Button
              variant={activeAlgorithms.optimization ? "default" : "secondary"}
              size="sm"
              className="h-5 text-[8px] px-1.5"
              onClick={() => toggleAlgorithm('optimization')}
            >
              {activeAlgorithms.optimization ? 'Active' : 'Off'}
            </Button>
          </div>
          <div className="text-lg font-bold">{metrics?.modelOptimization.avgFPS.toFixed(0)}</div>
          <div className="text-[8px] text-muted-foreground">Avg FPS</div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="grid w-full grid-cols-5 h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="overview" className="text-[10px] h-7">Overview</TabsTrigger>
          <TabsTrigger value="settings" className="text-[10px] h-7">Settings</TabsTrigger>
          <TabsTrigger value="analytics" className="text-[10px] h-7">Analytics</TabsTrigger>
          <TabsTrigger value="performance" className="text-[10px] h-7">Performance</TabsTrigger>
          <TabsTrigger value="search" className="text-[10px] h-7">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Key Performance Indicators */}
            <Card className="border-indigo-200/50 dark:border-indigo-800/30">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <BarChart3 className="h-3 w-3 text-indigo-600" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-primary">
                      {metrics?.searchAlgorithm.totalSearches.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted-foreground">Total Searches</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-primary">
                      {metrics?.behaviorAnalytics.totalUsers.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-primary">
                      {metrics?.recommendationEngine.totalRecommendations.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted-foreground">Recommendations</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-primary">
                      {metrics?.modelOptimization.totalModelsLoaded.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted-foreground">3D Models Loaded</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Algorithm Health Status */}
            <Card className="border-orange-200/50 dark:border-orange-800/30">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-orange-600" />
                  Algorithm Health Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1.5">
                  <AlgorithmHealthItem
                    name="Search Performance"
                    status={metrics?.searchAlgorithm.avgResponseTime < 500 ? 'healthy' : 'warning'}
                    value={`${metrics?.searchAlgorithm.avgResponseTime}ms avg`}
                  />
                  <AlgorithmHealthItem
                    name="Recommendation Quality"
                    status={metrics?.recommendationEngine.userSatisfaction > 0.7 ? 'healthy' : 'warning'}
                    value={`${(metrics?.recommendationEngine.userSatisfaction * 100).toFixed(1)}% satisfaction`}
                  />
                  <AlgorithmHealthItem
                    name="3D Performance"
                    status={metrics?.modelOptimization.avgFPS > 30 ? 'healthy' : 'critical'}
                    value={`${metrics?.modelOptimization.avgFPS.toFixed(0)} FPS avg`}
                  />
                  <AlgorithmHealthItem
                    name="User Engagement"
                    status={metrics?.behaviorAnalytics.avgEngagementScore > 60 ? 'healthy' : 'warning'}
                    value={`${metrics?.behaviorAnalytics.avgEngagementScore.toFixed(0)} avg score`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <AlgorithmSettings onSettingsChange={loadAlgorithmMetrics} />
        </TabsContent>

        <TabsContent value="analytics">
          <BehaviorAnalytics metrics={metrics} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitor metrics={metrics} onRefresh={loadAlgorithmMetrics} />
        </TabsContent>

        <TabsContent value="search">
          <SearchAnalytics metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AlgorithmHealthItemProps {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
}

function AlgorithmHealthItem({ name, status, value }: AlgorithmHealthItemProps) {
  const statusColors = {
    healthy: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    critical: 'text-red-600 bg-red-100 dark:bg-red-900/30'
  };

  const statusLabels = {
    healthy: 'OK',
    warning: 'Warn',
    critical: 'Crit'
  };

  return (
    <div className="flex items-center justify-between p-1.5 rounded border bg-muted/20">
      <div>
        <div className="text-[10px] font-medium">{name}</div>
        <div className="text-[8px] text-muted-foreground">{value}</div>
      </div>
      <Badge className={`${statusColors[status]} text-[8px] h-4 px-1`}>
        {statusLabels[status]}
      </Badge>
    </div>
  );
}
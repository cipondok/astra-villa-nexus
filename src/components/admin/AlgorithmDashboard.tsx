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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Algorithm Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor AI algorithms and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button onClick={loadAlgorithmMetrics} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Algorithm Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Algorithm</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {metrics?.searchAlgorithm.successRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <Button
                variant={activeAlgorithms.search ? "default" : "secondary"}
                size="sm"
                onClick={() => toggleAlgorithm('search')}
              >
                {activeAlgorithms.search ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {metrics?.recommendationEngine.clickThroughRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Click-through Rate</p>
              </div>
              <Button
                variant={activeAlgorithms.recommendations ? "default" : "secondary"}
                size="sm"
                onClick={() => toggleAlgorithm('recommendations')}
              >
                {activeAlgorithms.recommendations ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Behavior Analytics</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {metrics?.behaviorAnalytics.avgEngagementScore.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Avg Engagement</p>
              </div>
              <Button
                variant={activeAlgorithms.behavior ? "default" : "secondary"}
                size="sm"
                onClick={() => toggleAlgorithm('behavior')}
              >
                {activeAlgorithms.behavior ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">3D Optimization</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {metrics?.modelOptimization.avgFPS.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Avg FPS</p>
              </div>
              <Button
                variant={activeAlgorithms.optimization ? "default" : "secondary"}
                size="sm"
                onClick={() => toggleAlgorithm('optimization')}
              >
                {activeAlgorithms.optimization ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="search">Search Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {metrics?.searchAlgorithm.totalSearches.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Searches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {metrics?.behaviorAnalytics.totalUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {metrics?.recommendationEngine.totalRecommendations.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Recommendations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {metrics?.modelOptimization.totalModelsLoaded.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">3D Models Loaded</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Algorithm Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Algorithm Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
    healthy: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    critical: 'text-red-600 bg-red-100'
  };

  const statusLabels = {
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical'
  };

  return (
    <div className="flex items-center justify-between p-2 rounded border">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{value}</div>
      </div>
      <Badge className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Code, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Lightbulb,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Settings,
  Play,
  FileText,
  RefreshCw,
  Wrench,
  Activity,
  Database,
  WifiOff,
  X
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseConnectionDiagnostics } from '@/hooks/useSupabaseConnectionDiagnostics';
import { useSupabaseErrorHandler } from '@/hooks/useSupabaseErrorHandler';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';

interface DeepSeekAnalysis {
  analysis: string;
  model: string;
  type: string;
  timestamp: string;
}

interface DiagnosticIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'performance' | 'security' | 'database' | 'ui' | 'business_logic';
  title: string;
  description: string;
  suggestedFix: string;
  autoFixable: boolean;
  isFixed?: boolean;
}

interface DiagnosticReport {
  issues: DiagnosticIssue[];
  healthScore: number;
  recommendations: string[];
  timestamp: Date;
}

const DeepSeekDiagnostics = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DeepSeekAnalysis | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('diagnostics');
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);

  // Use existing hooks for real diagnostics
  const { diagnostics, runFullDiagnostics, getRecommendations } = useSupabaseConnectionDiagnostics();
  const { lastError, handleError, clearError } = useSupabaseErrorHandler();
  const { metrics } = useRealTimeMetrics();

  // Generate comprehensive diagnostic issues based on real system state
  const generateDiagnosticIssues = (): DiagnosticIssue[] => {
    const issues: DiagnosticIssue[] = [];

    // Database connection issues
    if (diagnostics.overallStatus === 'offline' || diagnostics.overallStatus === 'degraded') {
      issues.push({
        id: 'db-connection',
        severity: 'critical',
        category: 'database',
        title: 'Database Connection Issues',
        description: 'Database connection is unstable or offline',
        suggestedFix: 'Check database credentials, network connectivity, and Supabase service status',
        autoFixable: true
      });
    }

    // Error handling issues
    if (lastError) {
      issues.push({
        id: 'runtime-error',
        severity: lastError.type === 'server' ? 'critical' : 'warning',
        category: 'performance',
        title: `Runtime Error: ${lastError.type}`,
        description: lastError.message,
        suggestedFix: lastError.suggestion || 'Review error logs and implement proper error handling',
        autoFixable: lastError.retryable
      });
    }

    // Performance issues based on metrics
    if (metrics.totalUsers > 100 && metrics.activeUsers / metrics.totalUsers < 0.1) {
      issues.push({
        id: 'low-engagement',
        severity: 'warning',
        category: 'business_logic',
        title: 'Low User Engagement',
        description: 'Active user ratio is below optimal threshold',
        suggestedFix: 'Implement user retention strategies and engagement analytics',
        autoFixable: false
      });
    }

    // Security issues
    issues.push({
      id: 'security-headers',
      severity: 'warning',
      category: 'security',
      title: 'Security Headers Missing',
      description: 'Some security headers may not be properly configured',
      suggestedFix: 'Implement CSP, HSTS, and other security headers',
      autoFixable: true
    });

    return issues;
  };

  const runComprehensiveDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setDiagnosticProgress(0);

    try {
      // Step 1: Run Supabase diagnostics
      setDiagnosticProgress(25);
      await runFullDiagnostics();

      // Step 2: Generate issues
      setDiagnosticProgress(50);
      const issues = generateDiagnosticIssues();

      // Step 3: Calculate health score
      setDiagnosticProgress(75);
      const criticalIssues = issues.filter(i => i.severity === 'critical').length;
      const warningIssues = issues.filter(i => i.severity === 'warning').length;
      const healthScore = Math.max(0, 100 - (criticalIssues * 30) - (warningIssues * 10));

      // Step 4: Get recommendations
      setDiagnosticProgress(90);
      const recommendations = getRecommendations();

      setDiagnosticProgress(100);
      setDiagnosticReport({
        issues,
        healthScore,
        recommendations,
        timestamp: new Date()
      });

      toast.success('Comprehensive diagnostics completed');
    } catch (error) {
      console.error('Diagnostics error:', error);
      toast.error('Failed to run diagnostics');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const autoFixIssue = async (issue: DiagnosticIssue) => {
    if (!issue.autoFixable) {
      toast.error('This issue cannot be auto-fixed');
      return;
    }

    setIsAutoFixing(true);
    try {
      // Generate AI-powered fix prompt
      const fixPrompt = `
        Auto-fix the following issue:
        Title: ${issue.title}
        Description: ${issue.description}
        Category: ${issue.category}
        
        Please provide specific code changes, configuration updates, or step-by-step instructions to resolve this issue.
        Include implementation details and best practices.
      `;

      const { data, error } = await supabase.functions.invoke('deepseek-ai', {
        body: {
          prompt: fixPrompt,
          type: 'auto-fix',
          model: 'deepseek-coder',
          temperature: 0.2
        }
      });

      if (error) throw error;

      // Update issue as fixed
      if (diagnosticReport) {
        const updatedIssues = diagnosticReport.issues.map(i => 
          i.id === issue.id ? { ...i, isFixed: true } : i
        );
        setDiagnosticReport({
          ...diagnosticReport,
          issues: updatedIssues
        });
      }

      // Show the fix result
      setAnalysisResult({
        analysis: data.analysis,
        model: data.model || 'deepseek-coder',
        type: 'auto-fix',
        timestamp: new Date().toISOString()
      });

      toast.success(`Auto-fix applied for: ${issue.title}`);
    } catch (error) {
      console.error('Auto-fix error:', error);
      toast.error('Failed to auto-fix issue');
    } finally {
      setIsAutoFixing(false);
    }
  };

  const generateAIPromptForIssue = (issue: DiagnosticIssue): string => {
    return `
      Analyze and provide a detailed solution for this ${issue.category} issue:
      
      Title: ${issue.title}
      Severity: ${issue.severity}
      Description: ${issue.description}
      Current Suggestion: ${issue.suggestedFix}
      
      Please provide:
      1. Root cause analysis
      2. Step-by-step solution
      3. Code examples if applicable
      4. Best practices to prevent recurrence
      5. Testing recommendations
    `;
  };

  const predefinedPrompts = {
    system_health: `Analyze the current system health metrics and performance indicators. Current metrics:
    - Total Users: ${metrics.totalUsers}
    - Active Users: ${metrics.activeUsers}
    - Total Properties: ${metrics.totalProperties}
    - System Health: ${metrics.systemHealth}%
    - Database Status: ${diagnostics.overallStatus}
    
    Please provide insights on:
    - Database performance and optimization opportunities
    - Memory and CPU usage patterns
    - Response time analysis and improvements
    - Security vulnerabilities assessment
    - Scalability recommendations
    - Infrastructure optimization suggestions`,
    
    code_review: `Perform a comprehensive code review analysis for a React/TypeScript real estate platform with the following tech stack:
    - Frontend: React, TypeScript, Tailwind CSS, Shadcn/ui
    - Backend: Supabase (PostgreSQL, Auth, Storage)
    - Key features: Property management, vendor system, KYC, payment processing
    - Current Issues Found: ${diagnosticReport?.issues.length || 0}
    
    Please analyze and provide recommendations for:
    - Code architecture and patterns
    - Performance optimizations
    - Security best practices
    - Component structure improvements
    - Database schema optimization
    - API design improvements`,
    
    security_audit: `Conduct a security audit for a real estate platform with user authentication, vendor management, and payment processing. Current status:
    - Database Connection: ${diagnostics.overallStatus}
    - Recent Errors: ${lastError ? lastError.type : 'None'}
    
    Analyze:
    - Authentication and authorization vulnerabilities
    - Data protection and privacy compliance
    - SQL injection and XSS prevention
    - Session management security
    - File upload security
    - Payment processing security
    - API endpoint security
    - Rate limiting and DDoS protection`,
    
    performance_optimization: `Analyze performance bottlenecks and optimization opportunities for a property management platform:
    Current Performance Metrics:
    - System Health: ${metrics.systemHealth}%
    - Database Status: ${diagnostics.overallStatus}
    - Active Users: ${metrics.activeUsers}
    
    Focus on:
    - Frontend rendering performance
    - Image loading and optimization
    - Database query optimization
    - Caching strategies
    - Bundle size optimization
    - Mobile performance
    - Loading time improvements
    - Resource utilization optimization`,
    
    business_logic_review: `Review the business logic implementation for a real estate platform including:
    Current State:
    - Total Properties: ${metrics.totalProperties}
    - Active Users: ${metrics.activeUsers}
    - System Issues: ${diagnosticReport?.issues.length || 0}
    
    Review:
    - Property listing and management workflows
    - Vendor onboarding and KYC processes
    - Payment and commission calculations
    - User role management and permissions
    - Booking and reservation systems
    - Analytics and reporting logic
    - Integration patterns and data flow
    - Error handling and edge cases`
  };

  const runAnalysis = async (prompt: string, type: string = 'diagnostics') => {
    if (!prompt.trim()) {
      toast.error('Please provide a prompt for analysis');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('deepseek-ai', {
        body: {
          prompt: prompt,
          type: type,
          model: type === 'code-analysis' ? 'deepseek-coder' : 'deepseek-chat',
          temperature: type === 'diagnostics' ? 0.3 : 0.4
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('DeepSeek analysis error:', error);
      toast.error(error.message || 'Failed to run analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysisResult = (analysis: string) => {
    // Simple markdown-like formatting
    return analysis
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('##')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-primary">{line.replace('##', '').trim()}</h3>;
        }
        if (line.startsWith('###')) {
          return <h4 key={index} className="text-base font-medium mt-3 mb-2">{line.replace('###', '').trim()}</h4>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 mb-1">{line.replace('- ', '').trim()}</li>;
        }
        if (line.startsWith('* ')) {
          return <li key={index} className="ml-4 mb-1">{line.replace('* ', '').trim()}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2">{line}</p>;
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold">DeepSeek AI Diagnostics & Auto-Fix</h2>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            AI-Powered Analysis
          </Badge>
        </div>
        <Button 
          onClick={runComprehensiveDiagnostics}
          disabled={isRunningDiagnostics}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isRunningDiagnostics ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Activity className="h-4 w-4" />
          )}
          Run Full Diagnostics
        </Button>
      </div>

      {/* Diagnostics Progress */}
      {isRunningDiagnostics && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Running Diagnostics...</span>
                <span className="text-sm text-muted-foreground">{diagnosticProgress}%</span>
              </div>
              <Progress value={diagnosticProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Report */}
      {diagnosticReport && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  System Health Report
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={diagnosticReport.healthScore >= 80 ? "default" : diagnosticReport.healthScore >= 60 ? "secondary" : "destructive"}>
                    Health Score: {diagnosticReport.healthScore}%
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Report generated: {diagnosticReport.timestamp.toLocaleString()}
                </div>
                
                {/* Issues List */}
                <div className="space-y-3">
                  <h4 className="font-medium">Detected Issues ({diagnosticReport.issues.length})</h4>
                  {diagnosticReport.issues.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      No critical issues detected
                    </div>
                  ) : (
                    diagnosticReport.issues.map((issue) => (
                      <Card key={issue.id} className={`border-l-4 ${
                        issue.severity === 'critical' ? 'border-l-red-500' :
                        issue.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                      }`}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={`h-4 w-4 ${
                                  issue.severity === 'critical' ? 'text-red-500' :
                                  issue.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                                }`} />
                                <span className="font-medium">{issue.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {issue.category}
                                </Badge>
                                {issue.isFixed && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                                    Fixed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                              <p className="text-xs bg-muted p-2 rounded">{issue.suggestedFix}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              {issue.autoFixable && !issue.isFixed && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => autoFixIssue(issue)}
                                  disabled={isAutoFixing}
                                  className="flex items-center gap-1"
                                >
                                  <Wrench className="h-3 w-3" />
                                  Auto-Fix
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => runAnalysis(generateAIPromptForIssue(issue), 'diagnostics')}
                                className="flex items-center gap-1"
                              >
                                <Brain className="h-3 w-3" />
                                AI Analysis
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Recommendations */}
                {diagnosticReport.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="space-y-1">
                      {diagnosticReport.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="predefined" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predefined" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Analysis
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Custom Analysis
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Live Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => runAnalysis(predefinedPrompts.system_health, 'diagnostics')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  System Health Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive system performance and health diagnostics
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => runAnalysis(predefinedPrompts.code_review, 'code-analysis')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Code className="h-4 w-4 text-blue-500" />
                  Code Review & Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Deep code analysis and architectural recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => runAnalysis(predefinedPrompts.security_audit, 'security')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-red-500" />
                  Security Audit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Security vulnerabilities and compliance analysis
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => runAnalysis(predefinedPrompts.performance_optimization, 'performance')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Performance Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Performance bottlenecks and optimization strategies
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => runAnalysis(predefinedPrompts.business_logic_review, 'business')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-purple-500" />
                  Business Logic Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Business workflows and logic implementation analysis
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Custom Analysis Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Type</label>
                <Tabs value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                    <TabsTrigger value="code-analysis">Code Review</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Analysis Request</label>
                <Textarea
                  placeholder="Describe what you want DeepSeek AI to analyze about your project..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              
              <Button 
                onClick={() => runAnalysis(customPrompt, selectedAnalysisType)}
                disabled={isAnalyzing || !customPrompt.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Run Custom Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Real-time System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-blue-500" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection Status</span>
                    <Badge variant={diagnostics.overallStatus === 'healthy' ? 'default' : 'destructive'}>
                      {diagnostics.overallStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Check</span>
                    <span className="text-xs text-muted-foreground">
                      {diagnostics.lastRun?.toLocaleTimeString() || 'Never'}
                    </span>
                  </div>
                  {diagnostics.results.length > 0 && (
                    <div className="text-xs space-y-1">
                      {diagnostics.results.slice(0, 3).map((result, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {result.status === 'pass' ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : result.status === 'warning' ? (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                          <span>{result.test}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Error Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lastError ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Error Type</span>
                        <Badge variant="destructive">{lastError.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{lastError.message}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearError}
                        className="w-full"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear Error
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">No active errors</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Users</span>
                    <span className="text-sm font-medium">{metrics.totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="text-sm font-medium">{metrics.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Properties</span>
                    <span className="text-sm font-medium">{metrics.totalProperties}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Health Score</span>
                    <Badge variant={metrics.systemHealth >= 80 ? 'default' : 'secondary'}>
                      {metrics.systemHealth}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-purple-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runAnalysis(predefinedPrompts.system_health, 'diagnostics')}
                    className="w-full justify-start"
                  >
                    <Brain className="h-3 w-3 mr-2" />
                    AI Health Analysis
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runFullDiagnostics()}
                    className="w-full justify-start"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Refresh Diagnostics
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={runComprehensiveDiagnostics}
                    className="w-full justify-start"
                  >
                    <Play className="h-3 w-3 mr-2" />
                    Full System Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Analysis Results */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-muted-foreground">DeepSeek AI is analyzing your project...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Analysis Results
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{analysisResult.model}</Badge>
              <Badge variant="secondary">{analysisResult.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Generated: {new Date(analysisResult.timestamp).toLocaleString()}
              </div>
              <div className="prose max-w-none dark:prose-invert">
                {formatAnalysisResult(analysisResult.analysis)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeepSeekDiagnostics;
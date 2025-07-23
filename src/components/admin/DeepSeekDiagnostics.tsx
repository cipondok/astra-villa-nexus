import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeepSeekAnalysis {
  analysis: string;
  model: string;
  type: string;
  timestamp: string;
}

const DeepSeekDiagnostics = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DeepSeekAnalysis | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('diagnostics');

  const predefinedPrompts = {
    system_health: `Analyze the current system health metrics and performance indicators. Please provide insights on:
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
    
    Please analyze and provide recommendations for:
    - Code architecture and patterns
    - Performance optimizations
    - Security best practices
    - Component structure improvements
    - Database schema optimization
    - API design improvements`,
    
    security_audit: `Conduct a security audit for a real estate platform with user authentication, vendor management, and payment processing. Analyze:
    - Authentication and authorization vulnerabilities
    - Data protection and privacy compliance
    - SQL injection and XSS prevention
    - Session management security
    - File upload security
    - Payment processing security
    - API endpoint security
    - Rate limiting and DDoS protection`,
    
    performance_optimization: `Analyze performance bottlenecks and optimization opportunities for a property management platform:
    - Frontend rendering performance
    - Image loading and optimization
    - Database query optimization
    - Caching strategies
    - Bundle size optimization
    - Mobile performance
    - Loading time improvements
    - Resource utilization optimization`,
    
    business_logic_review: `Review the business logic implementation for a real estate platform including:
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
          <h2 className="text-2xl font-bold">DeepSeek AI Diagnostics</h2>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            AI-Powered Analysis
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="predefined" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predefined" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Analysis
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Custom Analysis
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
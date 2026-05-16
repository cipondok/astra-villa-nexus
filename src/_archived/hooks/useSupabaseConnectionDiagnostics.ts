
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface ConnectionDiagnostics {
  isRunning: boolean;
  results: DiagnosticResult[];
  overallStatus: 'healthy' | 'degraded' | 'offline';
  lastRun: Date | null;
}

export const useSupabaseConnectionDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics>({
    isRunning: false,
    results: [],
    overallStatus: 'offline',
    lastRun: null
  });

  const runDiagnostic = async (test: string, testFn: () => Promise<any>): Promise<DiagnosticResult> => {
    try {
      const startTime = Date.now();
      const result = await testFn();
      const responseTime = Date.now() - startTime;
      
      return {
        test,
        status: 'pass',
        message: `✅ ${test} successful (${responseTime}ms)`,
        details: { responseTime, result }
      };
    } catch (error: any) {
      console.error(`Diagnostic failed for ${test}:`, error);
      return {
        test,
        status: 'fail',
        message: `❌ ${test} failed: ${error.message}`,
        details: { error: error.message, code: error.code }
      };
    }
  };

  const runFullDiagnostics = useCallback(async () => {
    console.log('🔬 Running comprehensive Supabase diagnostics...');
    setDiagnostics(prev => ({ ...prev, isRunning: true, results: [] }));

    const tests: DiagnosticResult[] = [];

    // Test 1: Basic connectivity
    tests.push(await runDiagnostic('Basic Connectivity', async () => {
      const response = await fetch('https://supabase.com/favicon.ico');
      if (!response.ok) throw new Error('Cannot reach Supabase servers');
      return 'Connected to Supabase infrastructure';
    }));

    // Test 2: Project availability
    tests.push(await runDiagnostic('Project Health Check', async () => {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error && error.code !== 'PGRST301') throw error;
      return 'Project is accessible';
    }));

    // Test 3: Authentication service
    tests.push(await runDiagnostic('Auth Service', async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session ? 'Authenticated session active' : 'Auth service responding (no active session)';
    }));

    // Test 4: Database performance
    tests.push(await runDiagnostic('Database Performance', async () => {
      const startTime = Date.now();
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error && error.code !== 'PGRST301') throw error;
      
      if (responseTime > 2000) {
        throw new Error(`Slow response: ${responseTime}ms (threshold: 2000ms)`);
      }
      
      return `Database responding in ${responseTime}ms`;
    }));

    // Test 5: Real-time capabilities
    tests.push(await runDiagnostic('Real-time Service', async () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Real-time connection timeout'));
        }, 5000);

        const channel = supabase.channel(`diagnostic-test-${Date.now()}`);
        
        const cleanup = () => {
          clearTimeout(timeout);
          try {
            supabase.removeChannel(channel);
          } catch (error) {
            console.warn('Error removing channel:', error);
          }
        };
        
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            cleanup();
            resolve('Real-time subscriptions working');
          } else if (status === 'CHANNEL_ERROR') {
            cleanup();
            reject(new Error(`Real-time subscription failed: ${status}`));
          }
        });
      });
    }));

    // Calculate overall status
    const failedTests = tests.filter(t => t.status === 'fail').length;
    const warningTests = tests.filter(t => t.status === 'warning').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'offline';
    if (failedTests === 0 && warningTests === 0) {
      overallStatus = 'healthy';
    } else if (failedTests <= 1) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'offline';
    }

    setDiagnostics({
      isRunning: false,
      results: tests,
      overallStatus,
      lastRun: new Date()
    });

    console.log(`🔬 Diagnostics complete. Status: ${overallStatus}`);
    return { tests, overallStatus };
  }, []);

  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    diagnostics.results.forEach(result => {
      if (result.status === 'fail') {
        switch (result.test) {
          case 'Basic Connectivity':
            recommendations.push('Check your internet connection and firewall settings');
            break;
          case 'Project Health Check':
            recommendations.push('Verify your Supabase project URL and API key');
            recommendations.push('Check if your project is paused in the Supabase dashboard');
            break;
          case 'Auth Service':
            recommendations.push('Review authentication configuration');
            recommendations.push('Check for expired sessions');
            break;
          case 'Database Performance':
            recommendations.push('Database may be under heavy load');
            recommendations.push('Consider upgrading your Supabase plan');
            break;
          case 'Real-time Service':
            recommendations.push('Real-time features may be unavailable');
            recommendations.push('Check WebSocket connectivity');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All systems are functioning normally');
    }

    return recommendations;
  }, [diagnostics.results]);

  return {
    diagnostics,
    runFullDiagnostics,
    getRecommendations
  };
};

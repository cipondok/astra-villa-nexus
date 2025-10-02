import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoadTestConfig {
  targetUrl: string;
  requests: number;
  concurrency: number;
  testType: 'database' | 'api' | 'page';
  duration?: number; // in seconds
}

interface TestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  p50: number;
  p95: number;
  p99: number;
  timestamp: string;
  duration: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { config }: { config: LoadTestConfig } = await req.json();

    console.log('Starting load test:', config);

    const startTime = Date.now();
    const responseTimes: number[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Function to perform a single request
    const performRequest = async (): Promise<number> => {
      const requestStart = Date.now();
      try {
        let response;
        
        switch (config.testType) {
          case 'database':
            // Test database query performance
            const { data, error } = await supabase
              .from('profiles')
              .select('id, email, role')
              .limit(10);
            
            if (error) throw error;
            response = { ok: true };
            break;

          case 'api':
            // Test API endpoint
            response = await fetch(config.targetUrl, {
              method: 'GET',
              headers: {
                'apikey': supabaseKey,
              },
            });
            break;

          case 'page':
            // Test page load
            response = await fetch(config.targetUrl);
            break;

          default:
            throw new Error('Invalid test type');
        }

        const requestEnd = Date.now();
        const duration = requestEnd - requestStart;

        if (response.ok) {
          successCount++;
        } else {
          failureCount++;
          errors.push(`Request failed with status ${response.status}`);
        }

        return duration;
      } catch (error) {
        failureCount++;
        errors.push(error instanceof Error ? error.message : 'Unknown error');
        return Date.now() - requestStart;
      }
    };

    // Execute load test with concurrency control
    const batches = Math.ceil(config.requests / config.concurrency);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(
        config.concurrency,
        config.requests - batch * config.concurrency
      );
      
      const promises = Array(batchSize)
        .fill(null)
        .map(() => performRequest());
      
      const batchResults = await Promise.all(promises);
      responseTimes.push(...batchResults);

      // Small delay between batches to prevent overwhelming the system
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000; // in seconds

    // Calculate statistics
    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    const requestsPerSecond = config.requests / totalDuration;
    const errorRate = (failureCount / config.requests) * 100;

    // Calculate percentiles
    const p50Index = Math.floor(sortedTimes.length * 0.5);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    const result: TestResult = {
      totalRequests: config.requests,
      successfulRequests: successCount,
      failedRequests: failureCount,
      averageResponseTime: Math.round(avgResponseTime),
      minResponseTime: Math.round(minResponseTime),
      maxResponseTime: Math.round(maxResponseTime),
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      p50: Math.round(sortedTimes[p50Index] || 0),
      p95: Math.round(sortedTimes[p95Index] || 0),
      p99: Math.round(sortedTimes[p99Index] || 0),
      timestamp: new Date().toISOString(),
      duration: Math.round(totalDuration * 100) / 100,
    };

    // Store test results in database
    try {
      await supabase.from('load_test_results').insert({
        test_type: config.testType,
        target_url: config.targetUrl,
        total_requests: result.totalRequests,
        successful_requests: result.successfulRequests,
        failed_requests: result.failedRequests,
        average_response_time: result.averageResponseTime,
        min_response_time: result.minResponseTime,
        max_response_time: result.maxResponseTime,
        requests_per_second: result.requestsPerSecond,
        error_rate: result.errorRate,
        p50_response_time: result.p50,
        p95_response_time: result.p95,
        p99_response_time: result.p99,
        test_duration: result.duration,
        concurrency: config.concurrency,
        errors: errors.slice(0, 10), // Store first 10 errors
      });
    } catch (dbError) {
      console.error('Failed to store test results:', dbError);
    }

    console.log('Load test completed:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Load test error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

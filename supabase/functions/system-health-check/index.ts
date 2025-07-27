import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  details?: string
  timestamp: string
}

interface SystemHealthReport {
  overall: 'healthy' | 'unhealthy' | 'degraded'
  checks: HealthCheckResult[]
  summary: {
    total: number
    healthy: number
    unhealthy: number
    degraded: number
  }
  generatedAt: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔍 Starting system health check...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const healthChecks: HealthCheckResult[] = []
    
    // 1. Database Connectivity Check
    console.log('📊 Checking database connectivity...')
    const dbCheck = await checkDatabaseHealth(supabase)
    healthChecks.push(dbCheck)
    
    // 2. Storage Buckets Check
    console.log('🗄️ Checking storage buckets...')
    const storageCheck = await checkStorageHealth(supabase)
    healthChecks.push(storageCheck)
    
    // 3. Authentication Check
    console.log('🔐 Checking authentication service...')
    const authCheck = await checkAuthHealth(supabase)
    healthChecks.push(authCheck)
    
    // 4. Edge Functions Check
    console.log('⚡ Checking edge functions...')
    const functionsCheck = await checkEdgeFunctionsHealth(supabase)
    healthChecks.push(functionsCheck)
    
    // 5. API Response Time Check
    console.log('🌐 Checking API response times...')
    const apiCheck = await checkAPIHealth(supabaseUrl)
    healthChecks.push(apiCheck)
    
    // 6. External Dependencies Check
    console.log('🔗 Checking external dependencies...')
    const externalCheck = await checkExternalDependencies()
    healthChecks.push(externalCheck)
    
    // Calculate overall health
    const summary = {
      total: healthChecks.length,
      healthy: healthChecks.filter(c => c.status === 'healthy').length,
      unhealthy: healthChecks.filter(c => c.status === 'unhealthy').length,
      degraded: healthChecks.filter(c => c.status === 'degraded').length
    }
    
    const overall = summary.unhealthy > 0 ? 'unhealthy' : 
                   summary.degraded > 0 ? 'degraded' : 'healthy'
    
    const report: SystemHealthReport = {
      overall,
      checks: healthChecks,
      summary,
      generatedAt: new Date().toISOString()
    }
    
    // Log health check results to database
    await logHealthCheckResults(supabase, report)
    
    console.log('✅ Health check completed:', {
      overall,
      healthy: summary.healthy,
      total: summary.total
    })
    
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: overall === 'healthy' ? 200 : overall === 'degraded' ? 206 : 503
    })
    
  } catch (error) {
    console.error('❌ Health check failed:', error)
    
    const errorReport: SystemHealthReport = {
      overall: 'unhealthy',
      checks: [{
        service: 'health-check-system',
        status: 'unhealthy',
        responseTime: 0,
        details: error.message,
        timestamp: new Date().toISOString()
      }],
      summary: { total: 1, healthy: 0, unhealthy: 1, degraded: 0 },
      generatedAt: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(errorReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 503
    })
  }
})

async function checkDatabaseHealth(supabase: any): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Test basic connectivity and query performance
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        details: `Database error: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
    
    // Check response time
    const status = responseTime > 2000 ? 'degraded' : 'healthy'
    
    return {
      service: 'database',
      status,
      responseTime,
      details: `Query executed successfully in ${responseTime}ms`,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: `Database connection failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  }
}

async function checkStorageHealth(supabase: any): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // List buckets to test storage connectivity
    const { data, error } = await supabase.storage.listBuckets()
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        service: 'storage',
        status: 'unhealthy',
        responseTime,
        details: `Storage error: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
    
    const bucketCount = data?.length || 0
    const status = responseTime > 3000 ? 'degraded' : 'healthy'
    
    return {
      service: 'storage',
      status,
      responseTime,
      details: `Found ${bucketCount} storage buckets, response time: ${responseTime}ms`,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      service: 'storage',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: `Storage check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  }
}

async function checkAuthHealth(supabase: any): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Test auth service by getting session info
    const { data, error } = await supabase.auth.getSession()
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        service: 'authentication',
        status: 'unhealthy',
        responseTime,
        details: `Auth error: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
    
    const status = responseTime > 1500 ? 'degraded' : 'healthy'
    
    return {
      service: 'authentication',
      status,
      responseTime,
      details: `Auth service responding in ${responseTime}ms`,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      service: 'authentication',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: `Auth check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  }
}

async function checkEdgeFunctionsHealth(supabase: any): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Test a simple edge function call (this function itself)
    const { data, error } = await supabase.functions.invoke('system-health-check', {
      body: { test: 'ping' }
    })
    
    const responseTime = Date.now() - startTime
    
    if (error && error.message !== 'FunctionsRelayError') {
      return {
        service: 'edge-functions',
        status: 'degraded',
        responseTime,
        details: `Edge functions may have issues: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
    
    const status = responseTime > 5000 ? 'degraded' : 'healthy'
    
    return {
      service: 'edge-functions',
      status,
      responseTime,
      details: `Edge functions accessible, response time: ${responseTime}ms`,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      service: 'edge-functions',
      status: 'degraded',
      responseTime: Date.now() - startTime,
      details: `Edge function test inconclusive: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  }
}

async function checkAPIHealth(supabaseUrl: string): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Test REST API health endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!
      }
    })
    
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      return {
        service: 'rest-api',
        status: 'unhealthy',
        responseTime,
        details: `API returned status ${response.status}`,
        timestamp: new Date().toISOString()
      }
    }
    
    const status = responseTime > 2000 ? 'degraded' : 'healthy'
    
    return {
      service: 'rest-api',
      status,
      responseTime,
      details: `REST API responding in ${responseTime}ms`,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      service: 'rest-api',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: `REST API check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  }
}

async function checkExternalDependencies(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Check critical external services (example: OpenAI API)
    const checks = []
    
    // Check OpenAI API if key exists
    if (Deno.env.get('OPENAI_API_KEY')) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json'
          }
        })
        checks.push({ service: 'openai', healthy: response.ok })
      } catch (error) {
        checks.push({ service: 'openai', healthy: false, error: error.message })
      }
    }
    
    const responseTime = Date.now() - startTime
    const allHealthy = checks.every(c => c.healthy)
    const anyHealthy = checks.some(c => c.healthy)
    
    const status = allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy'
    
    return {
      service: 'external-dependencies',
      status,
      responseTime,
      details: `Checked ${checks.length} external services. Healthy: ${checks.filter(c => c.healthy).length}`,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      service: 'external-dependencies',
      status: 'degraded',
      responseTime: Date.now() - startTime,
      details: `External dependency check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  }
}

async function logHealthCheckResults(supabase: any, report: SystemHealthReport): Promise<void> {
  try {
    // Log to database for historical tracking
    await supabase.from('system_health_logs').insert({
      overall_status: report.overall,
      checks_data: report.checks,
      summary_data: report.summary,
      generated_at: report.generatedAt
    })
    
    console.log('📝 Health check results logged to database')
  } catch (error) {
    console.warn('⚠️ Failed to log health check results:', error.message)
  }
}
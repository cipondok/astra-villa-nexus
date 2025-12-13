import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DetectedBug {
  id: string;
  type: 'runtime' | 'logic' | 'memory' | 'performance' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  impact: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  status: 'open' | 'investigating' | 'fixed';
  stackTrace?: string;
}

export interface SecurityFinding {
  id: string;
  internal_id: string;
  name: string;
  description: string;
  level: 'error' | 'warn' | 'info';
  category?: string;
  details?: string;
  link?: string;
  ignore?: boolean;
  ignore_reason?: string;
}

export interface ErrorLogEntry {
  id: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  severity: string;
  component_name?: string;
  page_url?: string;
  created_at: string;
  status: string;
}

export interface BugDetectionStats {
  totalBugs: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  fixedCount: number;
  bugCount24h: number;
  bugCount7d: number;
  trendDirection: 'up' | 'down' | 'stable';
  securityFindings: SecurityFinding[];
  errorLogs: ErrorLogEntry[];
  detectedBugs: DetectedBug[];
}

export function useBugErrorDetection() {
  const [stats, setStats] = useState<BugDetectionStats>({
    totalBugs: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    fixedCount: 0,
    bugCount24h: 0,
    bugCount7d: 0,
    trendDirection: 'stable',
    securityFindings: [],
    errorLogs: [],
    detectedBugs: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchErrorLogs = useCallback(async () => {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch error logs from database
      const { data: errorLogs, error: logsError } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) {
        console.error('Error fetching error logs:', logsError);
        return [];
      }

      return (errorLogs || []).map((log: any) => ({
        id: log.id,
        error_type: log.error_type || 'unknown',
        error_message: log.error_message || '',
        error_stack: log.error_stack,
        severity: log.severity || 'medium',
        component_name: log.component_name,
        page_url: log.error_page || log.page_url,
        created_at: log.created_at,
        status: log.status || 'new'
      }));
    } catch (err) {
      console.error('Error in fetchErrorLogs:', err);
      return [];
    }
  }, []);

  const convertToDetectedBugs = useCallback((
    errorLogs: ErrorLogEntry[],
    securityFindings: SecurityFinding[]
  ): DetectedBug[] => {
    const bugs: DetectedBug[] = [];

    // Convert security findings to bugs
    securityFindings.forEach((finding, index) => {
      if (!finding.ignore) {
        bugs.push({
          id: `security-${finding.internal_id || index}`,
          type: 'security',
          severity: finding.level === 'error' ? 'critical' : finding.level === 'warn' ? 'high' : 'low',
          title: finding.name,
          description: finding.description,
          location: finding.category || 'Security Scan',
          impact: finding.details?.split('\n')[0] || 'Security vulnerability detected',
          occurrences: 1,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          status: 'open',
          stackTrace: finding.details
        });
      }
    });

    // Group error logs by error_type and error_message
    const errorGroups = new Map<string, ErrorLogEntry[]>();
    errorLogs.forEach(log => {
      const key = `${log.error_type}:${log.error_message.substring(0, 100)}`;
      const existing = errorGroups.get(key) || [];
      existing.push(log);
      errorGroups.set(key, existing);
    });

    // Convert grouped errors to bugs
    errorGroups.forEach((logs, key) => {
      const firstLog = logs[logs.length - 1];
      const lastLog = logs[0];
      
      bugs.push({
        id: `error-${firstLog.id}`,
        type: mapErrorTypeToType(firstLog.error_type),
        severity: mapSeverity(firstLog.severity),
        title: truncate(firstLog.error_message, 80),
        description: firstLog.error_message,
        location: firstLog.component_name || firstLog.page_url || 'Unknown',
        impact: getImpactFromType(firstLog.error_type),
        occurrences: logs.length,
        firstSeen: firstLog.created_at,
        lastSeen: lastLog.created_at,
        status: firstLog.status === 'resolved' ? 'fixed' : 'open',
        stackTrace: firstLog.error_stack
      });
    });

    return bugs;
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const errorLogs = await fetchErrorLogs();
      
      // Calculate time-based stats
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const logsLast24h = errorLogs.filter(log => 
        new Date(log.created_at) >= twentyFourHoursAgo
      );
      const logsLast7d = errorLogs.filter(log => 
        new Date(log.created_at) >= sevenDaysAgo
      );
      const logsPrevious7d = errorLogs.filter(log => {
        const date = new Date(log.created_at);
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
      });

      // Determine trend
      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (logsLast7d.length > logsPrevious7d.length * 1.2) {
        trendDirection = 'up';
      } else if (logsLast7d.length < logsPrevious7d.length * 0.8) {
        trendDirection = 'down';
      }

      // Mock security findings - in a real scenario, this would come from the security scan API
      const securityFindings: SecurityFinding[] = [];

      const detectedBugs = convertToDetectedBugs(errorLogs, securityFindings);

      const criticalCount = detectedBugs.filter(b => b.severity === 'critical' && b.status !== 'fixed').length;
      const highCount = detectedBugs.filter(b => b.severity === 'high' && b.status !== 'fixed').length;
      const mediumCount = detectedBugs.filter(b => b.severity === 'medium' && b.status !== 'fixed').length;
      const lowCount = detectedBugs.filter(b => b.severity === 'low' && b.status !== 'fixed').length;
      const fixedCount = detectedBugs.filter(b => b.status === 'fixed').length;

      setStats({
        totalBugs: detectedBugs.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        fixedCount,
        bugCount24h: logsLast24h.length,
        bugCount7d: logsLast7d.length,
        trendDirection,
        securityFindings,
        errorLogs,
        detectedBugs
      });
    } catch (err) {
      console.error('Error in bug detection refresh:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bug data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchErrorLogs, convertToDetectedBugs]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    isLoading,
    error,
    refresh
  };
}

// Helper functions
function mapErrorTypeToType(errorType: string): DetectedBug['type'] {
  const typeMap: Record<string, DetectedBug['type']> = {
    'api_error': 'runtime',
    'component_error': 'runtime',
    'search_error': 'logic',
    'auth_error': 'security',
    'security_error': 'security',
    'performance_error': 'performance',
    'memory_error': 'memory'
  };
  return typeMap[errorType] || 'runtime';
}

function mapSeverity(severity: string): DetectedBug['severity'] {
  const severityMap: Record<string, DetectedBug['severity']> = {
    'critical': 'critical',
    'high': 'high',
    'medium': 'medium',
    'low': 'low'
  };
  return severityMap[severity] || 'medium';
}

function getImpactFromType(errorType: string): string {
  const impactMap: Record<string, string> = {
    'api_error': 'API functionality may be degraded',
    'component_error': 'UI component rendering issues',
    'search_error': 'Search functionality affected',
    'auth_error': 'Authentication/authorization issues',
    'security_error': 'Potential security vulnerability',
    'performance_error': 'Application performance degraded',
    'memory_error': 'Memory usage issues detected'
  };
  return impactMap[errorType] || 'Application functionality may be affected';
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

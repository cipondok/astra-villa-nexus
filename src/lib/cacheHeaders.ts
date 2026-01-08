/**
 * Cache Headers Utility
 * Provides consistent caching headers for edge functions and API responses
 */

export type CacheStrategy = 
  | 'no-cache'
  | 'short'      // 1 minute - rapidly changing data
  | 'medium'     // 5 minutes - user-specific dynamic data  
  | 'long'       // 1 hour - semi-static data
  | 'static'     // 1 day - rarely changing data
  | 'immutable'; // 1 year - never changes

interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate?: number;
  private?: boolean;
  immutable?: boolean;
}

const CACHE_STRATEGIES: Record<CacheStrategy, CacheConfig> = {
  'no-cache': {
    maxAge: 0,
    private: true,
  },
  'short': {
    maxAge: 60,
    staleWhileRevalidate: 30,
    private: true,
  },
  'medium': {
    maxAge: 300,
    staleWhileRevalidate: 120,
    private: true,
  },
  'long': {
    maxAge: 3600,
    staleWhileRevalidate: 600,
    private: false,
  },
  'static': {
    maxAge: 86400,
    staleWhileRevalidate: 3600,
    private: false,
  },
  'immutable': {
    maxAge: 31536000,
    immutable: true,
    private: false,
  },
};

export function getCacheHeaders(strategy: CacheStrategy): Record<string, string> {
  const config = CACHE_STRATEGIES[strategy];
  const parts: string[] = [];

  if (config.private) {
    parts.push('private');
  } else {
    parts.push('public');
  }

  if (config.maxAge === 0) {
    parts.push('no-store', 'no-cache', 'must-revalidate');
  } else {
    parts.push(`max-age=${config.maxAge}`);
    
    if (config.staleWhileRevalidate) {
      parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
    }
    
    if (config.immutable) {
      parts.push('immutable');
    }
  }

  return {
    'Cache-Control': parts.join(', '),
  };
}

// Recommended strategies by endpoint type
export const ENDPOINT_CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  // Public read-heavy endpoints
  'get-trending-searches': 'medium',
  'get-filter-analytics': 'medium',
  'ai-search-suggestions': 'short',
  'get-smart-filter-suggestions': 'medium',
  'get-collaborative-recommendations': 'short',
  
  // User-specific endpoints
  'smart-recommendations': 'short',
  'user-behavior-analyzer': 'no-cache',
  
  // Static/semi-static data
  'algorithm-analytics': 'long',
  'algorithm-controller': 'long',
  
  // Always fresh
  'login-rate-limiter': 'no-cache',
  'verify-otp': 'no-cache',
  'verify-2fa': 'no-cache',
  'midtrans-webhook': 'no-cache',
};

export function getEndpointCacheStrategy(endpoint: string): CacheStrategy {
  return ENDPOINT_CACHE_STRATEGIES[endpoint] || 'no-cache';
}

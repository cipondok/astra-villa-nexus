import { useMemo } from 'react';
import { useAICommandCenterData } from './useAICommandCenterData';
import { useMarketHeatZones } from './useMarketHeatZones';
import { useInvestmentRanking } from './useInvestmentRanking';
import { usePricePredictionStats } from './usePricePredictionEngine';
import { useOpportunityScoreStats } from './useOpportunityEngine';
import { useDealHunterFeed } from './useDealHunter';

// ── Types ──

export type AutopilotSignalType =
  | 'elite_opportunity'
  | 'heat_surge'
  | 'valuation_reversal'
  | 'risk_spike'
  | 'appreciation_forecast'
  | 'cooling_alert'
  | 'flip_detected'
  | 'rebalance_suggestion';

export interface AutopilotSignal {
  id: string;
  type: AutopilotSignalType;
  severity: 'info' | 'warning' | 'critical' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
}

export interface AutopilotRecommendation {
  action: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
  category: 'buy' | 'sell' | 'hold' | 'diversify' | 'monitor';
}

export interface AutopilotHealthModule {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  coverage: number;
  lastRefresh: string | null;
}

export interface AutopilotState {
  isLoading: boolean;
  signals: AutopilotSignal[];
  recommendations: AutopilotRecommendation[];
  modules: AutopilotHealthModule[];
  kpis: {
    totalOpportunitiesTracked: number;
    eliteOpportunities: number;
    hotZones: number;
    coolingZones: number;
    pricePredictionCoverage: number;
    avgConfidence: number;
    flipOpportunities: number;
    riskZones: number;
    primeInvestments: number;
    dealHunterActive: number;
  };
}

// ── Derived Intelligence ──

function deriveSignals(
  heatZones: ReturnType<typeof useMarketHeatZones>['data'],
  predStats: ReturnType<typeof usePricePredictionStats>['data'],
  scoreStats: ReturnType<typeof useOpportunityScoreStats>['data'],
  rankings: ReturnType<typeof useInvestmentRanking>['data'],
): AutopilotSignal[] {
  const signals: AutopilotSignal[] = [];
  const now = new Date().toISOString();

  // Heat surge signals
  const surgingZones = heatZones?.filter(z => z.zone_status === 'surging' || z.zone_status === 'hotspot') ?? [];
  if (surgingZones.length > 0) {
    signals.push({
      id: 'heat-surge',
      type: 'heat_surge',
      severity: 'opportunity',
      title: `${surgingZones.length} Market Heat Surge${surgingZones.length > 1 ? 's' : ''} Detected`,
      description: `Hot zones: ${surgingZones.slice(0, 3).map(z => z.city).join(', ')}`,
      confidence: Math.round(surgingZones.reduce((s, z) => s + z.trend_confidence, 0) / surgingZones.length),
      timestamp: now,
    });
  }

  // Cooling risk
  const coolingRisk = heatZones?.filter(z => z.zone_status === 'cooling_risk') ?? [];
  if (coolingRisk.length > 0) {
    signals.push({
      id: 'cooling-alert',
      type: 'cooling_alert',
      severity: 'warning',
      title: `${coolingRisk.length} Cooling Risk Zone${coolingRisk.length > 1 ? 's' : ''}`,
      description: `Areas showing decline: ${coolingRisk.slice(0, 3).map(z => z.city).join(', ')}`,
      confidence: 72,
      timestamp: now,
    });
  }

  // Elite opportunities from scoring engine
  if (scoreStats && scoreStats.elite_count > 0) {
    signals.push({
      id: 'elite-opps',
      type: 'elite_opportunity',
      severity: 'opportunity',
      title: `${scoreStats.elite_count} Elite Investment Opportunities`,
      description: `Properties scoring 85+ detected across the platform`,
      confidence: 88,
      timestamp: now,
    });
  }

  // Flip opportunities from price prediction
  if (predStats && predStats.flip_opportunities > 0) {
    signals.push({
      id: 'flip-detected',
      type: 'flip_detected',
      severity: 'opportunity',
      title: `${predStats.flip_opportunities} Flip Opportunities Identified`,
      description: `Deeply undervalued properties with strong growth forecast`,
      confidence: predStats.avg_confidence || 65,
      timestamp: now,
    });
  }

  // Risk zones
  if (predStats && predStats.risk_zones > 5) {
    signals.push({
      id: 'risk-spike',
      type: 'risk_spike',
      severity: 'critical',
      title: `${predStats.risk_zones} Short-Term Risk Zones`,
      description: `Properties flagged with decline risk or bubble signals`,
      confidence: predStats.avg_confidence || 60,
      timestamp: now,
    });
  }

  // Prime investments from ranking
  if (rankings && rankings.prime_count > 0) {
    signals.push({
      id: 'prime-invest',
      type: 'appreciation_forecast',
      severity: 'opportunity',
      title: `${rankings.prime_count} Prime Investment Properties`,
      description: `Top-ranked assets with ACQUIRE_NOW action signals`,
      confidence: 82,
      timestamp: now,
    });
  }

  return signals;
}

function deriveRecommendations(
  heatZones: ReturnType<typeof useMarketHeatZones>['data'],
  predStats: ReturnType<typeof usePricePredictionStats>['data'],
  scoreStats: ReturnType<typeof useOpportunityScoreStats>['data'],
): AutopilotRecommendation[] {
  const recs: AutopilotRecommendation[] = [];

  const surgingZones = heatZones?.filter(z => z.zone_status === 'surging') ?? [];
  if (surgingZones.length > 0) {
    recs.push({
      action: `Increase exposure in ${surgingZones[0]?.city || 'surging zones'}`,
      rationale: `${surgingZones.length} zone(s) showing accelerating demand and fast absorption`,
      priority: 'high',
      category: 'buy',
    });
  }

  if (predStats && predStats.flip_opportunities > 3) {
    recs.push({
      action: 'Review flip opportunity candidates',
      rationale: `${predStats.flip_opportunities} undervalued properties with strong appreciation forecast`,
      priority: 'high',
      category: 'buy',
    });
  }

  const coolingZones = heatZones?.filter(z => z.zone_status === 'cooling_risk') ?? [];
  if (coolingZones.length > 0) {
    recs.push({
      action: `Monitor assets in ${coolingZones[0]?.city || 'cooling zones'}`,
      rationale: `${coolingZones.length} zone(s) showing declining demand velocity`,
      priority: 'medium',
      category: 'sell',
    });
  }

  if (predStats && predStats.bubble_risk > 0) {
    recs.push({
      action: `Evaluate ${predStats.bubble_risk} bubble-risk flagged properties`,
      rationale: 'Overpriced listings detected — consider exit timing',
      priority: 'high',
      category: 'sell',
    });
  }

  if (scoreStats && scoreStats.coverage_pct < 80) {
    recs.push({
      action: 'Run batch scoring to improve data coverage',
      rationale: `Only ${scoreStats.coverage_pct}% of active properties have been scored`,
      priority: 'medium',
      category: 'monitor',
    });
  }

  // Diversification
  const uniqueCities = new Set(heatZones?.map(z => z.city) ?? []);
  if (uniqueCities.size > 5) {
    recs.push({
      action: 'Diversify into emerging micro-markets',
      rationale: `${uniqueCities.size} distinct market clusters available for portfolio distribution`,
      priority: 'low',
      category: 'diversify',
    });
  }

  return recs;
}

// ── Main Hook ──

export function useAIAutopilot(enabled = true) {
  const commandCenter = useAICommandCenterData(enabled);
  const heatZones = useMarketHeatZones(3);
  const rankings = useInvestmentRanking(15, enabled);
  const predStats = usePricePredictionStats();
  const scoreStats = useOpportunityScoreStats();
  const dealFeed = useDealHunterFeed(10);

  const state = useMemo<AutopilotState>(() => {
    const isLoading = commandCenter.isLoading || heatZones.isLoading || rankings.isLoading || predStats.isLoading || scoreStats.isLoading;

    const zones = heatZones.data ?? [];
    const hotZones = zones.filter(z => z.zone_status === 'hotspot' || z.zone_status === 'surging').length;
    const coolingZones = zones.filter(z => z.zone_status === 'cooling_risk' || z.zone_status === 'cooling').length;

    const signals = deriveSignals(heatZones.data, predStats.data, scoreStats.data, rankings.data);
    const recommendations = deriveRecommendations(heatZones.data, predStats.data, scoreStats.data);

    const modules: AutopilotHealthModule[] = [
      {
        name: 'Opportunity Scoring',
        status: scoreStats.data ? 'online' : scoreStats.isLoading ? 'degraded' : 'offline',
        coverage: scoreStats.data?.coverage_pct ?? 0,
        lastRefresh: scoreStats.data?.last_batch_run ?? null,
      },
      {
        name: 'Price Prediction',
        status: predStats.data ? 'online' : predStats.isLoading ? 'degraded' : 'offline',
        coverage: predStats.data?.coverage_pct ?? 0,
        lastRefresh: null,
      },
      {
        name: 'Market Heat Clusters',
        status: heatZones.data ? 'online' : heatZones.isLoading ? 'degraded' : 'offline',
        coverage: zones.length > 0 ? 100 : 0,
        lastRefresh: zones[0]?.computed_at ?? null,
      },
      {
        name: 'Investment Ranking',
        status: rankings.data ? 'online' : rankings.isLoading ? 'degraded' : 'offline',
        coverage: rankings.data ? 100 : 0,
        lastRefresh: rankings.data?.ranked_at ?? null,
      },
      {
        name: 'Deal Hunter',
        status: dealFeed.data ? 'online' : dealFeed.isLoading ? 'degraded' : 'offline',
        coverage: dealFeed.data && dealFeed.data.length > 0 ? 100 : 0,
        lastRefresh: null,
      },
      {
        name: 'AI Command Center',
        status: commandCenter.data ? 'online' : commandCenter.isLoading ? 'degraded' : 'offline',
        coverage: commandCenter.data ? 100 : 0,
        lastRefresh: commandCenter.data?.fetchedAt ?? null,
      },
    ];

    return {
      isLoading,
      signals,
      recommendations,
      modules,
      kpis: {
        totalOpportunitiesTracked: scoreStats.data?.total_active ?? 0,
        eliteOpportunities: scoreStats.data?.elite_count ?? 0,
        hotZones,
        coolingZones,
        pricePredictionCoverage: predStats.data?.coverage_pct ?? 0,
        avgConfidence: predStats.data?.avg_confidence ?? 0,
        flipOpportunities: predStats.data?.flip_opportunities ?? 0,
        riskZones: predStats.data?.risk_zones ?? 0,
        primeInvestments: rankings.data?.prime_count ?? 0,
        dealHunterActive: dealFeed.data?.length ?? 0,
      },
    };
  }, [commandCenter.data, commandCenter.isLoading, heatZones.data, heatZones.isLoading, rankings.data, rankings.isLoading, predStats.data, predStats.isLoading, scoreStats.data, scoreStats.isLoading, dealFeed.data, dealFeed.isLoading]);

  return state;
}

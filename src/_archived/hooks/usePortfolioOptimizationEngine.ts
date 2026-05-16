/**
 * Portfolio Optimization Engine
 * Modern Portfolio Theory applied to real estate allocations
 * Optimizes for ROI, risk, and liquidity based on user constraints
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PortfolioAsset {
  propertyId: string;
  city: string;
  propertyType: string;
  currentValue: number;
  expectedReturn: number;
  riskScore: number;
  liquidityScore: number;
  correlation: number; // how correlated with other assets
}

interface OptimizationConstraints {
  totalBudget: number;
  maxRiskScore?: number;
  minLiquidity?: number;
  maxConcentration?: number; // max % in single asset
  strategy: 'aggressive' | 'balanced' | 'conservative' | 'income';
}

interface PortfolioAllocation {
  propertyId: string | null;
  city: string;
  propertyType: string;
  allocationPct: number;
  allocatedAmount: number;
  expectedReturn: number;
  riskContribution: number;
  reason: string;
}

interface OptimizedPortfolio {
  allocations: PortfolioAllocation[];
  totalExpectedReturn: number;
  portfolioRiskScore: number;
  sharpeRatio: number;
  diversificationScore: number;
  strategy: string;
}

const STRATEGY_PARAMS = {
  aggressive: { returnWeight: 0.7, riskTolerance: 80, minYield: 0 },
  balanced: { returnWeight: 0.5, riskTolerance: 50, minYield: 4 },
  conservative: { returnWeight: 0.3, riskTolerance: 30, minYield: 6 },
  income: { returnWeight: 0.2, riskTolerance: 40, minYield: 8 },
};

function optimizeAllocation(
  assets: PortfolioAsset[],
  constraints: OptimizationConstraints
): OptimizedPortfolio {
  const params = STRATEGY_PARAMS[constraints.strategy];
  const maxConcentration = constraints.maxConcentration || 0.35;

  // Score each asset based on strategy
  const scoredAssets = assets.map(asset => {
    const returnScore = asset.expectedReturn * params.returnWeight;
    const riskPenalty = asset.riskScore > params.riskTolerance 
      ? (asset.riskScore - params.riskTolerance) * 0.02 
      : 0;
    const liquidityBonus = constraints.strategy === 'conservative' 
      ? asset.liquidityScore * 0.003 
      : 0;
    const diversificationBonus = (1 - asset.correlation) * 0.1;

    return {
      ...asset,
      compositeScore: returnScore - riskPenalty + liquidityBonus + diversificationBonus,
    };
  });

  scoredAssets.sort((a, b) => b.compositeScore - a.compositeScore);

  // Allocate budget using greedy optimization with constraints
  const allocations: PortfolioAllocation[] = [];
  let remainingBudget = constraints.totalBudget;
  let totalWeight = scoredAssets.reduce((sum, a) => sum + Math.max(a.compositeScore, 0.01), 0);

  for (const asset of scoredAssets) {
    if (remainingBudget <= 0) break;
    
    // Skip if risk too high for strategy
    if (constraints.maxRiskScore && asset.riskScore > constraints.maxRiskScore) continue;
    if (constraints.minLiquidity && asset.liquidityScore < constraints.minLiquidity) continue;

    const rawPct = Math.max(asset.compositeScore, 0.01) / totalWeight;
    const cappedPct = Math.min(rawPct, maxConcentration);
    const amount = Math.min(cappedPct * constraints.totalBudget, remainingBudget, asset.currentValue);

    if (amount < constraints.totalBudget * 0.05) continue; // Skip tiny allocations

    const allocationPct = (amount / constraints.totalBudget) * 100;

    let reason = '';
    if (asset.expectedReturn > 0.12) reason = 'High growth potential';
    else if (asset.riskScore < 30) reason = 'Low risk, stable value';
    else if (asset.liquidityScore > 70) reason = 'High liquidity for flexibility';
    else reason = 'Balanced risk-reward profile';

    allocations.push({
      propertyId: asset.propertyId,
      city: asset.city,
      propertyType: asset.propertyType,
      allocationPct,
      allocatedAmount: amount,
      expectedReturn: asset.expectedReturn,
      riskContribution: (asset.riskScore * allocationPct) / 100,
      reason,
    });

    remainingBudget -= amount;
  }

  // Calculate portfolio metrics
  const totalReturn = allocations.reduce(
    (sum, a) => sum + a.expectedReturn * (a.allocationPct / 100), 0
  );
  const portfolioRisk = allocations.reduce(
    (sum, a) => sum + a.riskContribution, 0
  );
  const riskFreeRate = 0.04;
  const sharpe = portfolioRisk > 0 
    ? (totalReturn - riskFreeRate) / (portfolioRisk / 100) 
    : 0;

  // Diversification: 1 - HHI (Herfindahl index)
  const hhi = allocations.reduce((sum, a) => sum + (a.allocationPct / 100) ** 2, 0);
  const diversification = Math.max(0, (1 - hhi) * 100);

  return {
    allocations,
    totalExpectedReturn: totalReturn * 100,
    portfolioRiskScore: portfolioRisk,
    sharpeRatio: sharpe,
    diversificationScore: diversification,
    strategy: constraints.strategy,
  };
}

export function usePortfolioOptimizer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's current allocations
  const { data: currentAllocations, isLoading } = useQuery({
    queryKey: ['portfolio-allocations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_allocations')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch available properties for optimization
  const { data: availableAssets } = useQuery({
    queryKey: ['portfolio-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, property_type, price, investment_score, liquidity_score, rental_yield_percentage, risk_level')
        .eq('status', 'active')
        .not('price', 'is', null)
        .limit(100);
      if (error) throw error;
      
      return (data || []).map(p => ({
        propertyId: p.id,
        city: p.city || 'Unknown',
        propertyType: p.property_type || 'villa',
        currentValue: p.price || 0,
        expectedReturn: (p.rental_yield_percentage || 6) / 100 + 0.04, // yield + appreciation
        riskScore: p.risk_level === 'high' ? 75 : p.risk_level === 'low' ? 25 : 50,
        liquidityScore: p.liquidity_score || 50,
        correlation: 0.5, // Simplified — in production compute from covariance matrix
      })) as PortfolioAsset[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const optimize = useCallback((constraints: OptimizationConstraints): OptimizedPortfolio => {
    if (!availableAssets?.length) {
      return {
        allocations: [],
        totalExpectedReturn: 0,
        portfolioRiskScore: 0,
        sharpeRatio: 0,
        diversificationScore: 0,
        strategy: constraints.strategy,
      };
    }
    return optimizeAllocation(availableAssets, constraints);
  }, [availableAssets]);

  // Save allocation to DB
  const saveAllocation = useMutation({
    mutationFn: async (allocation: PortfolioAllocation) => {
      const { error } = await supabase.from('portfolio_allocations').insert({
        user_id: user!.id,
        property_id: allocation.propertyId,
        city: allocation.city,
        property_type: allocation.propertyType,
        target_allocation_pct: allocation.allocationPct,
        current_value: allocation.allocatedAmount,
        invested_amount: allocation.allocatedAmount,
        expected_roi_pct: allocation.expectedReturn * 100,
        risk_score: allocation.riskContribution,
        liquidity_score: 50,
        optimization_strategy: 'balanced',
        status: 'recommended',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-allocations'] });
    },
  });

  return {
    currentAllocations,
    isLoading,
    optimize,
    saveAllocation,
    availableAssets: availableAssets || [],
  };
}

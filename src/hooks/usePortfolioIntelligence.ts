import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

async function invokeEngine(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('portfolio-wealth-engine', {
    body: { mode, ...params },
  });
  if (error) throw error;
  return data;
}

export function useEnsurePortfolio() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ensure-portfolio', user?.id],
    queryFn: () => invokeEngine('ensure_portfolio', { user_id: user?.id }),
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
  });
}

export function useInvestorPortfolio() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['investor-portfolio', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_portfolios')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

export function usePortfolioAssets(portfolioId?: string) {
  return useQuery({
    queryKey: ['portfolio-assets', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolioId!)
        .order('asset_roi', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolioId,
  });
}

export function usePortfolioValueHistory(portfolioId?: string) {
  return useQuery({
    queryKey: ['portfolio-value-history', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_value_history')
        .select('*')
        .eq('portfolio_id', portfolioId!)
        .order('snapshot_date', { ascending: true })
        .limit(90);
      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolioId,
  });
}

export function useWealthForecasts(portfolioId?: string) {
  return useQuery({
    queryKey: ['wealth-forecasts', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wealth_forecasts')
        .select('*')
        .eq('portfolio_id', portfolioId!)
        .order('forecast_horizon_months');
      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolioId,
  });
}

export function usePortfolioRiskMetrics(portfolioId?: string) {
  return useQuery({
    queryKey: ['portfolio-risk-metrics', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_risk_metrics')
        .select('*')
        .eq('portfolio_id', portfolioId!)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });
}

export function usePortfolioRecommendations(portfolioId?: string) {
  return useQuery({
    queryKey: ['portfolio-recommendations', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_recommendations')
        .select('*')
        .eq('portfolio_id', portfolioId!)
        .order('expected_impact_score', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolioId,
  });
}

export function useValuatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (portfolioId: string) => invokeEngine('valuate', { portfolio_id: portfolioId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investor-portfolio'] });
      qc.invalidateQueries({ queryKey: ['portfolio-assets'] });
      qc.invalidateQueries({ queryKey: ['portfolio-value-history'] });
      toast.success('Portfolio valuation updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useForecastWealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (portfolioId: string) => invokeEngine('forecast', { portfolio_id: portfolioId, params: { horizons: [12, 36, 60] } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-forecasts'] });
      toast.success('Wealth forecast generated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAnalyzePortfolioRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (portfolioId: string) => invokeEngine('risk_analysis', { portfolio_id: portfolioId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio-risk-metrics'] });
      qc.invalidateQueries({ queryKey: ['investor-portfolio'] });
      toast.success('Risk analysis complete');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGeneratePortfolioRecommendations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (portfolioId: string) => invokeEngine('recommend', { portfolio_id: portfolioId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio-recommendations'] });
      toast.success('AI recommendations generated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminPortfolioStats() {
  return useQuery({
    queryKey: ['admin-portfolio-stats'],
    queryFn: () => invokeEngine('dashboard_stats'),
    staleTime: 120_000,
  });
}

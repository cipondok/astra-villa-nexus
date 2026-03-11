-- Fix: Drop overly permissive "service role" RLS policies that use USING(true) / WITH CHECK(true)
-- Service role bypasses RLS anyway, so these policies are redundant and dangerously grant access to ALL users

-- ai_feature_importance
DROP POLICY IF EXISTS "Service role manages feature importance" ON public.ai_feature_importance;

-- ai_feedback_signals
DROP POLICY IF EXISTS "Service role full access" ON public.ai_feedback_signals;

-- ai_investor_cluster_membership
DROP POLICY IF EXISTS "Service role manages cluster membership" ON public.ai_investor_cluster_membership;

-- ai_investor_clusters
DROP POLICY IF EXISTS "Service role manages clusters" ON public.ai_investor_clusters;

-- ai_job_logs
DROP POLICY IF EXISTS "Service role full access on ai_job_logs" ON public.ai_job_logs;

-- ai_job_tasks
DROP POLICY IF EXISTS "Service role full access tasks" ON public.ai_job_tasks;

-- ai_jobs
DROP POLICY IF EXISTS "Service role full access jobs" ON public.ai_jobs;

-- ai_learning_cycles
DROP POLICY IF EXISTS "Service role manages learning cycles" ON public.ai_learning_cycles;

-- ai_learning_snapshots
DROP POLICY IF EXISTS "Service role full access snapshots" ON public.ai_learning_snapshots;

-- ai_market_patterns
DROP POLICY IF EXISTS "Service role manages market patterns" ON public.ai_market_patterns;

-- ai_model_performance_history
DROP POLICY IF EXISTS "Service role manages performance history" ON public.ai_model_performance_history;

-- ai_model_registry
DROP POLICY IF EXISTS "Service role manages model registry" ON public.ai_model_registry;

-- ai_model_weights
DROP POLICY IF EXISTS "Allow service role full access on ai_model_weights" ON public.ai_model_weights;

-- ai_prediction_log
DROP POLICY IF EXISTS "Service role manages prediction log" ON public.ai_prediction_log;

-- ai_recommendation_events
DROP POLICY IF EXISTS "Allow service role full access on ai_recommendation_events" ON public.ai_recommendation_events;

-- ai_strategy_simulations
DROP POLICY IF EXISTS "Service role manages simulations" ON public.ai_strategy_simulations;

-- copilot_investment_alerts
DROP POLICY IF EXISTS "Service role manages copilot alerts" ON public.copilot_investment_alerts;

-- deal_hunter_notifications
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.deal_hunter_notifications;

-- deal_hunter_opportunities
DROP POLICY IF EXISTS "Service role can manage deal opportunities" ON public.deal_hunter_opportunities;

-- hedging tables
DROP POLICY IF EXISTS "Service insert hedging_downside_protection" ON public.hedging_downside_protection;
DROP POLICY IF EXISTS "Service insert hedging_macro_risk" ON public.hedging_macro_risk;
DROP POLICY IF EXISTS "Service insert hedging_portfolio_exposure" ON public.hedging_portfolio_exposure;
DROP POLICY IF EXISTS "Service insert hedging_safe_havens" ON public.hedging_safe_havens;
DROP POLICY IF EXISTS "Service insert hedging_strategies" ON public.hedging_strategies;

-- investor_dna
DROP POLICY IF EXISTS "Service can manage DNA" ON public.investor_dna;
DROP POLICY IF EXISTS "Service can manage signals" ON public.investor_dna_signals;

-- knowledge_graph_edges
DROP POLICY IF EXISTS "Service role full access" ON public.knowledge_graph_edges;

-- launch_radar tables
DROP POLICY IF EXISTS "Service can insert radar alerts" ON public.launch_radar_alerts;
DROP POLICY IF EXISTS "Service can insert demand forecasts" ON public.launch_radar_demand_forecasts;
DROP POLICY IF EXISTS "Service can insert developer risks" ON public.launch_radar_developer_risks;
DROP POLICY IF EXISTS "Service can insert launch radar signals" ON public.launch_radar_developer_signals;
DROP POLICY IF EXISTS "Service can insert price predictions" ON public.launch_radar_price_predictions;

-- property AI tables
DROP POLICY IF EXISTS "Service role can manage insights" ON public.property_ai_insights;
DROP POLICY IF EXISTS "Service role can manage deal analysis" ON public.property_deal_analysis;
DROP POLICY IF EXISTS "Service role can manage investment scores" ON public.property_investment_scores;
DROP POLICY IF EXISTS "Service role manages recommendations" ON public.property_recommendations;
DROP POLICY IF EXISTS "Service role can manage ROI forecasts" ON public.property_roi_forecast;

-- smart_city tables
DROP POLICY IF EXISTS "Service insert smart_city_demographics" ON public.smart_city_demographics;
DROP POLICY IF EXISTS "Service insert smart_city_districts" ON public.smart_city_districts;
DROP POLICY IF EXISTS "Service insert smart_city_infrastructure" ON public.smart_city_infrastructure;
DROP POLICY IF EXISTS "Service insert smart_city_opportunities" ON public.smart_city_opportunities;
DROP POLICY IF EXISTS "Service insert smart_city_policies" ON public.smart_city_policies;

-- stress test tables
DROP POLICY IF EXISTS "Service insert stress_crisis_strategies" ON public.stress_crisis_strategies;
DROP POLICY IF EXISTS "Service insert stress_portfolio_projections" ON public.stress_portfolio_projections;
DROP POLICY IF EXISTS "Service insert stress_recovery_forecasts" ON public.stress_recovery_forecasts;
DROP POLICY IF EXISTS "Service insert stress_scenarios" ON public.stress_scenarios;
DROP POLICY IF EXISTS "Service insert stress_survival_scores" ON public.stress_survival_scores;

-- user AI tables
DROP POLICY IF EXISTS "Service role full access" ON public.user_ai_cache;
DROP POLICY IF EXISTS "Service role full access on user_intent_profiles" ON public.user_intent_profiles;
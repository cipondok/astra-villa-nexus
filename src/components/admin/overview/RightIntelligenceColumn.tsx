import React from "react";
import SectionErrorBoundary from "../shared/SectionErrorBoundary";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Database, Globe, Cpu, ShieldCheck, Zap, Gauge, ChevronDown,
} from "lucide-react";
import HealthBar from "./HealthBar";
import ServiceRow from "./ServiceRow";
import ZoneSkeleton from "./ZoneSkeleton";

// AI Intelligence cards
import AIHealthSummaryCard from "../AIHealthSummaryCard";
import LeadIntelligenceCard from "../LeadIntelligenceCard";
import MarketIntelligenceCard from "../MarketIntelligenceCard";
import AgentPerformanceCard from "../AgentPerformanceCard";
import DealPipelineCard from "../DealPipelineCard";
import GeoExpansionCard from "../GeoExpansionCard";
import AIBatchControlPanel from "../AIBatchControlPanel";
import AISchedulingDashboard from "../AISchedulingDashboard";
import JobQueueHealthCard from "../JobQueueHealthCard";
import AIJobObservabilityPanel from "../AIJobObservabilityPanel";
import MarketAnomalyCard from "../MarketAnomalyCard";
import ListingPerformanceOptimizerCard from "../ListingPerformanceOptimizerCard";
import PricingIntelligenceCard from "../PricingIntelligenceCard";
import DealClosingTimelineCard from "../DealClosingTimelineCard";
import InvestmentAttractivenessCard from "../InvestmentAttractivenessCard";
import BuyerListingMatchCard from "../BuyerListingMatchCard";
import PricingAutomationCard from "../PricingAutomationCard";
import MarketCyclePredictionCard from "../MarketCyclePredictionCard";
import DealTimingSignalCard from "../DealTimingSignalCard";
import NationalForecastCard from "../NationalForecastCard";
import PortfolioStrategyCard from "../PortfolioStrategyCard";
import CapitalFlowCard from "../CapitalFlowCard";
import MarketplaceOptimizationCard from "../MarketplaceOptimizationCard";

interface RightIntelligenceColumnProps {
  systemHealth: {
    status: string;
    dbErrors: number;
    aiSystems: {
      jobsRunning: number;
      jobsFailed: number;
      jobsPending: number;
      avgSeoScore: number;
      totalValuations: number;
      seoStatus: 'operational' | 'degraded' | 'unknown';
      jobStatus: 'operational' | 'degraded' | 'unknown';
      valuationStatus: 'operational' | 'degraded' | 'unknown';
    };
  } | undefined;
  healthAgo: string | null;
  aiData: any;
  aiLoading: boolean;
  aiAgo: string | null;
  onQuickAction: (section: string) => void;
}

const RightIntelligenceColumn = React.memo(function RightIntelligenceColumn({
  systemHealth, healthAgo, aiData, aiLoading, aiAgo, onQuickAction,
}: RightIntelligenceColumnProps) {
  return (
    <div className="col-span-12 md:col-span-4 space-y-3">
      <SectionErrorBoundary sectionName="AI Intelligence & Health">

        {/* ═══ ZONE 1: System Health (Compact Collapsible) ═══ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-chart-1/50 to-transparent" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-chart-1">System Health</span>
            {healthAgo && <span className="text-[10px] text-muted-foreground">↻ {healthAgo}</span>}
          </div>

          <Collapsible>
            <Card className="border-border bg-card overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full p-3 flex items-center justify-between gap-2 hover:bg-muted/40 transition-colors group text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      systemHealth?.status === 'healthy' ? 'bg-chart-1 shadow-[0_0_6px_hsl(var(--chart-1)/0.5)]' : 'bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.5)]'
                    }`} />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {systemHealth?.status === 'healthy' ? 'All Systems OK' : 'Issues Detected'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      DB·{systemHealth?.dbErrors === 0 ? 'OK' : `${systemHealth?.dbErrors}err`}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      SEO·{systemHealth?.aiSystems.avgSeoScore || 0}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      Jobs·{(systemHealth?.aiSystems.jobsFailed || 0) === 0 ? 'OK' : `${systemHealth?.aiSystems.jobsFailed}F`}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-border">
                  <div className="p-3 space-y-2.5">
                    <HealthBar label="Database" value={systemHealth?.dbErrors === 0 ? 100 : 70} icon={Database} isStatus />
                    <HealthBar label="SEO Engine" value={systemHealth?.aiSystems.avgSeoScore || 0} icon={Globe} />
                    <HealthBar label="Job Queue" value={
                      (systemHealth?.aiSystems.jobsFailed || 0) === 0 ? 100 :
                      Math.max(100 - (systemHealth?.aiSystems.jobsFailed || 0) * 10, 20)
                    } icon={Cpu} isStatus />
                  </div>

                  <div className="border-t border-border p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-chart-2" />
                      <span className="text-xs font-semibold text-foreground">AI Systems</span>
                    </div>
                    <ServiceRow name="SEO Engine" status={systemHealth?.aiSystems.seoStatus || 'unknown'} detail={`${systemHealth?.aiSystems.avgSeoScore || 0}% avg`} />
                    <ServiceRow name="Job Worker" status={systemHealth?.aiSystems.jobStatus || 'unknown'} detail={`${systemHealth?.aiSystems.jobsRunning || 0} running`} />
                    <ServiceRow name="Valuations" status={systemHealth?.aiSystems.valuationStatus || 'unknown'} detail={`${systemHealth?.aiSystems.totalValuations || 0} total`} />
                    <ServiceRow name="Database" status={systemHealth?.dbErrors === 0 ? 'operational' : 'degraded'} detail={`${systemHealth?.dbErrors || 0} errors`} />
                    <ServiceRow name="Auth" status="operational" />
                    {(systemHealth?.aiSystems.jobsPending || 0) > 0 && (
                      <div className="mt-1.5 p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-foreground">Queued Jobs</span>
                          <Badge variant="secondary" className="text-[10px] h-5">{systemHealth?.aiSystems.jobsPending}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* ═══ ZONE 2: AI Intelligence ═══ */}
        {aiLoading ? (
          <ZoneSkeleton label="AI Intelligence" cards={5} />
        ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">AI Intelligence</span>
            {aiAgo && <span className="text-[10px] text-muted-foreground">↻ {aiAgo}</span>}
          </div>

          {/* Tier 1 */}
          <SectionErrorBoundary sectionName="AI Health Summary">
            <div className="shadow-md rounded-lg border border-primary/30 ring-1 ring-primary/10">
              <AIHealthSummaryCard onNavigate={() => onQuickAction('ai-command-center')} data={(aiData as any)?.systemHealth} />
            </div>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Lead Intelligence">
            <div className="shadow-md rounded-lg border border-primary/30 ring-1 ring-primary/10">
              <LeadIntelligenceCard onNavigate={() => onQuickAction('lead-management')} data={(aiData as any)?.leadIntelligence} />
            </div>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Market Anomaly">
            <div className="shadow-md rounded-lg border border-primary/30 ring-1 ring-primary/10">
              <MarketAnomalyCard data={(aiData as any)?.marketAnomalies} />
            </div>
          </SectionErrorBoundary>

          {/* Tier 2 */}
          <SectionErrorBoundary sectionName="Market Intelligence">
            <div className="shadow-sm rounded-lg">
              <MarketIntelligenceCard onNavigate={() => onQuickAction('ai-command-center')} data={(aiData as any)?.marketIntelligence} />
            </div>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Agent Performance">
            <div className="shadow-sm rounded-lg">
              <AgentPerformanceCard onNavigate={() => onQuickAction('agent-management')} data={(aiData as any)?.agentPerformance} />
            </div>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Deal Pipeline">
            <div className="shadow-sm rounded-lg">
              <DealPipelineCard onNavigate={() => onQuickAction('financial-management')} data={(aiData as any)?.dealPipeline} />
            </div>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Geo Expansion">
            <div className="shadow-sm rounded-lg">
              <GeoExpansionCard onNavigate={() => onQuickAction('ai-command-center')} data={(aiData as any)?.geoExpansion} />
            </div>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Investment Attractiveness">
            <div className="shadow-sm rounded-lg">
              <InvestmentAttractivenessCard />
            </div>
          </SectionErrorBoundary>

          {/* Tier 3 */}
          <SectionErrorBoundary sectionName="Buyer-Listing Match">
            <BuyerListingMatchCard data={(aiData as any)?.buyerListingMatch} />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="National Forecast">
            <NationalForecastCard data={(aiData as any)?.nationalForecast} />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Market Cycle">
            <MarketCyclePredictionCard data={(aiData as any)?.marketCycle} />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Capital Flow">
            <CapitalFlowCard data={(aiData as any)?.capitalFlow} />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Portfolio Strategy">
            <PortfolioStrategyCard />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Deal Timing">
            <DealTimingSignalCard data={(aiData as any)?.dealTiming} />
          </SectionErrorBoundary>
        </div>
        )}

        {/* ═══ ZONE 3: Operations ═══ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-chart-3/50 to-transparent" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-chart-3">Operations</span>
            <div className="h-px flex-1 bg-gradient-to-l from-chart-3/50 to-transparent" />
          </div>

          <SectionErrorBoundary sectionName="AI Batch Control">
            <AIBatchControlPanel />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="AI Scheduling">
            <AISchedulingDashboard />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Job Queue Health">
            <JobQueueHealthCard />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="AI Job Observability">
            <AIJobObservabilityPanel />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Listing Performance">
            <ListingPerformanceOptimizerCard onNavigate={() => onQuickAction("listing-optimization-center")} />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Pricing Intelligence">
            <PricingIntelligenceCard />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Deal Closing Timeline">
            <DealClosingTimelineCard />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Pricing Automation">
            <PricingAutomationCard />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Marketplace Optimization">
            <MarketplaceOptimizationCard />
          </SectionErrorBoundary>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={() => onQuickAction('ai-command-center')}>
              <Zap className="h-3.5 w-3.5" />
              AI Center
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={() => onQuickAction('diagnostic')}>
              <Gauge className="h-3.5 w-3.5" />
              Diagnostics
            </Button>
          </div>
        </div>
      </SectionErrorBoundary>
    </div>
  );
});

export default RightIntelligenceColumn;

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, DollarSign, TrendingUp, ChevronRight } from "lucide-react";

const STAGES = ["inquiry", "viewing", "negotiation", "offer", "closed"] as const;
type Stage = typeof STAGES[number];

const STAGE_LABELS: Record<Stage, string> = {
  inquiry: "Inquiry",
  viewing: "Viewing",
  negotiation: "Negotiation",
  offer: "Offer",
  closed: "Closed",
};

const STAGE_COLORS: Record<Stage, string> = {
  inquiry: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  viewing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  negotiation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  offer: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  closed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const MOCK_DEALS = [
  { id: "D-001", buyer: "Ahmad Rizky", property: "Modern Apartment Kemang", price: 2500000000, stage: "negotiation" as Stage, probability: 70 },
  { id: "D-002", buyer: "Sarah Chen", property: "Villa Bali Style Canggu", price: 8500000000, stage: "viewing" as Stage, probability: 40 },
  { id: "D-003", buyer: "Putri Wulandari", property: "Townhouse BSD City", price: 1800000000, stage: "offer" as Stage, probability: 85 },
  { id: "D-004", buyer: "James Wong", property: "Land Plot Serpong", price: 3200000000, stage: "inquiry" as Stage, probability: 20 },
  { id: "D-005", buyer: "Michael Tan", property: "Office Space Sudirman", price: 15000000000, stage: "closed" as Stage, probability: 100 },
  { id: "D-006", buyer: "David Lee", property: "Studio Menteng Park", price: 950000000, stage: "viewing" as Stage, probability: 35 },
];

const formatPrice = (n: number) => `Rp ${(n / 1e9).toFixed(1)}B`;

const MVPDealPipelineTracker = () => {
  const [stageFilter, setStageFilter] = useState("all");

  const filtered = stageFilter === "all" ? MOCK_DEALS : MOCK_DEALS.filter(d => d.stage === stageFilter);
  const pipelineValue = MOCK_DEALS.filter(d => d.stage !== "closed").reduce((s, d) => s + d.price, 0);
  const closedValue = MOCK_DEALS.filter(d => d.stage === "closed").reduce((s, d) => s + d.price, 0);
  const stageCounts = STAGES.map(s => ({ stage: s, count: MOCK_DEALS.filter(d => d.stage === s).length }));

  return (
    <div className="space-y-4">
      {/* Pipeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{MOCK_DEALS.length}</p>
          <p className="text-xs text-muted-foreground">Total Deals</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{formatPrice(pipelineValue)}</p>
          <p className="text-xs text-muted-foreground">Pipeline Value</p>
        </CardContent></Card>
        <Card className="col-span-2 md:col-span-1"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{formatPrice(closedValue)}</p>
          <p className="text-xs text-muted-foreground">Closed Value</p>
        </CardContent></Card>
      </div>

      {/* Stage funnel bar */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Deal Pipeline Funnel</p>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {stageCounts.map((s, i) => (
              <React.Fragment key={s.stage}>
                <button
                  onClick={() => setStageFilter(stageFilter === s.stage ? "all" : s.stage)}
                  className={`flex-1 min-w-[80px] rounded-lg p-2 text-center transition-all border ${stageFilter === s.stage ? "ring-2 ring-primary" : "border-border"}`}
                >
                  <p className="text-lg font-bold">{s.count}</p>
                  <p className="text-[10px] text-muted-foreground">{STAGE_LABELS[s.stage]}</p>
                </button>
                {i < stageCounts.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deal cards */}
      <div className="space-y-3">
        {filtered.map(deal => (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{deal.property}</h3>
                    <Badge variant="outline" className={STAGE_COLORS[deal.stage]}>{STAGE_LABELS[deal.stage]}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                    <span>Buyer: {deal.buyer}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatPrice(deal.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Closing probability:</span>
                    <Progress value={deal.probability} className="flex-1 h-2 max-w-[200px]" />
                    <span className="text-xs font-medium">{deal.probability}%</span>
                  </div>
                </div>
                {deal.stage !== "closed" && (
                  <Button size="sm" variant="outline">
                    <ArrowRight className="h-3.5 w-3.5 mr-1" /> Advance
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MVPDealPipelineTracker;

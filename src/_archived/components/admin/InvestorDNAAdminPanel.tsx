import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dna, Users, AlertTriangle, TrendingUp, Search, Filter, ShieldAlert, Brain } from "lucide-react";
import { AdminPageHeader } from "./shared/AdminPageHeader";

interface InvestorDNARow {
  user_id: string;
  risk_tolerance_score: number;
  investment_horizon_years: number;
  preferred_property_types: string[];
  preferred_cities: string[];
  budget_range_min: number;
  budget_range_max: number;
  rental_income_pref_weight: number;
  capital_growth_pref_weight: number;
  flip_strategy_affinity: number;
  luxury_bias_score: number;
  diversification_score: number;
  probability_next_purchase: number;
  churn_risk_score: number;
  expected_budget_upgrade: number;
  geo_expansion_likelihood: number;
  investor_persona: string;
  last_computed_at: string;
  version: number;
}

const PERSONA_COLORS: Record<string, string> = {
  conservative: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  balanced: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  aggressive: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  luxury: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  flipper: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

const riskLabel = (score: number) => {
  if (score >= 75) return { label: "High", color: "text-red-500" };
  if (score >= 40) return { label: "Medium", color: "text-yellow-500" };
  return { label: "Low", color: "text-emerald-500" };
};

const churnLabel = (score: number) => {
  if (score >= 70) return { label: "Critical", variant: "destructive" as const };
  if (score >= 40) return { label: "At Risk", variant: "secondary" as const };
  return { label: "Healthy", variant: "outline" as const };
};

const InvestorDNAAdminPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [personaFilter, setPersonaFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [churnFilter, setChurnFilter] = useState("all");

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-investor-dna-profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("investor_dna" as any)
        .select("*")
        .order("last_computed_at", { ascending: false });
      return (data || []) as unknown as InvestorDNARow[];
    },
  });

  // Fetch user emails for display
  const userIds = useMemo(() => profiles.map((p) => p.user_id), [profiles]);
  const { data: userMap = {} } = useQuery({
    queryKey: ["admin-dna-user-emails", userIds],
    queryFn: async () => {
      if (!userIds.length) return {};
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds.slice(0, 200));
      const map: Record<string, { email: string; full_name: string | null }> = {};
      (data || []).forEach((u: any) => {
        map[u.id] = { email: u.email || "", full_name: u.full_name };
      });
      return map;
    },
    enabled: userIds.length > 0,
  });

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (personaFilter !== "all" && p.investor_persona !== personaFilter) return false;
      if (riskFilter === "high" && p.risk_tolerance_score < 75) return false;
      if (riskFilter === "medium" && (p.risk_tolerance_score < 40 || p.risk_tolerance_score >= 75)) return false;
      if (riskFilter === "low" && p.risk_tolerance_score >= 40) return false;
      if (churnFilter === "critical" && p.churn_risk_score < 70) return false;
      if (churnFilter === "at-risk" && (p.churn_risk_score < 40 || p.churn_risk_score >= 70)) return false;
      if (churnFilter === "healthy" && p.churn_risk_score >= 40) return false;
      if (searchTerm) {
        const user = userMap[p.user_id];
        const haystack = `${user?.email || ""} ${user?.full_name || ""} ${p.user_id}`.toLowerCase();
        if (!haystack.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }, [profiles, personaFilter, riskFilter, churnFilter, searchTerm, userMap]);

  // Stats
  const stats = useMemo(() => {
    const total = profiles.length;
    const personaCounts: Record<string, number> = {};
    let highChurn = 0;
    let avgRisk = 0;

    profiles.forEach((p) => {
      personaCounts[p.investor_persona] = (personaCounts[p.investor_persona] || 0) + 1;
      if (p.churn_risk_score >= 70) highChurn++;
      avgRisk += p.risk_tolerance_score;
    });

    return {
      total,
      personaCounts,
      highChurn,
      avgRisk: total ? Math.round(avgRisk / total) : 0,
      topPersona: Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
    };
  }, [profiles]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Investor DNA Intelligence"
        description="Platform-wide behavioral intelligence oversight — view all investor DNA profiles with filtering"
        icon={Dna}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Profiles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Brain className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground capitalize">{stats.topPersona}</p>
              <p className="text-xs text-muted-foreground">Top Persona</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgRisk}</p>
              <p className="text-xs text-muted-foreground">Avg Risk Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.highChurn}</p>
              <p className="text-xs text-muted-foreground">High Churn Risk</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={personaFilter} onValueChange={setPersonaFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Personas</SelectItem>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="flipper">Flipper</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High (≥75)</SelectItem>
                <SelectItem value="medium">Medium (40-74)</SelectItem>
                <SelectItem value="low">Low (&lt;40)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={churnFilter} onValueChange={setChurnFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Churn Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Churn Levels</SelectItem>
                <SelectItem value="critical">Critical (≥70)</SelectItem>
                <SelectItem value="at-risk">At Risk (40-69)</SelectItem>
                <SelectItem value="healthy">Healthy (&lt;40)</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs">
              <Filter className="h-3 w-3 mr-1" />
              {filtered.length} / {profiles.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {profilesLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading investor DNA profiles...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {profiles.length === 0
                ? "No investor DNA profiles computed yet. Profiles are generated from user behavior signals."
                : "No profiles match the current filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Persona</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Churn</TableHead>
                    <TableHead>Horizon</TableHead>
                    <TableHead>Budget Range</TableHead>
                    <TableHead>Yield / Growth</TableHead>
                    <TableHead>Next Purchase</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 100).map((p) => {
                    const user = userMap[p.user_id];
                    const risk = riskLabel(p.risk_tolerance_score);
                    const churn = churnLabel(p.churn_risk_score);
                    return (
                      <TableRow key={p.user_id}>
                        <TableCell>
                          <div className="max-w-[180px]">
                            <p className="text-sm font-medium truncate text-foreground">
                              {user?.full_name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user?.email || p.user_id.slice(0, 8)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize text-xs ${PERSONA_COLORS[p.investor_persona] || ""}`}
                          >
                            {p.investor_persona}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className={`text-sm font-medium ${risk.color}`}>
                              {p.risk_tolerance_score}
                            </span>
                            <Progress value={p.risk_tolerance_score} className="h-1.5 w-16" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={churn.variant} className="text-xs">
                            {churn.label} ({p.churn_risk_score})
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {p.investment_horizon_years}Y
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatIDR(p.budget_range_min)} – {formatIDR(p.budget_range_max)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-blue-500">{Math.round(p.rental_income_pref_weight * 100)}%</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-emerald-500">{Math.round(p.capital_growth_pref_weight * 100)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">
                            {Math.round(p.probability_next_purchase * 100)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(p.last_computed_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function formatIDR(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  return value.toLocaleString();
}

export default InvestorDNAAdminPanel;

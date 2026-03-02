import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Trophy, Loader2, Zap, Flame, Clock, BarChart3, Eye, Sparkles,
} from 'lucide-react';
import Price from '@/components/ui/Price';

interface PropertyOption {
  id: string;
  title: string;
  city: string;
  price: number;
  property_type: string;
}

interface ComparisonResult {
  property_id: string;
  title: string;
  city: string;
  price: number;
  property_type: string;
  roi_percent: number;
  annualized_return: number;
  investment_score: number;
  heat_score: number;
  days_to_sell: number;
  comparison_score: number;
}

interface CompareResponse {
  hold_years: number;
  properties_compared: number;
  comparison: ComparisonResult[];
  winner: { property_id: string; comparison_score: number };
  decision_reasoning: string[];
}

const InvestmentComparePanel = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [propertyA, setPropertyA] = useState('');
  const [propertyB, setPropertyB] = useState('');
  const [holdYears, setHoldYears] = useState('5');
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, city, price, property_type')
        .eq('status', 'published')
        .not('price', 'is', null)
        .gt('price', 0)
        .order('created_at', { ascending: false })
        .limit(200);
      setProperties(data || []);
      setLoadingProperties(false);
    };
    fetchProperties();
  }, []);

  const runComparison = async () => {
    if (!propertyA || !propertyB || propertyA === propertyB) {
      setError('Please select two different properties');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setError('Please sign in to use this feature');
        setLoading(false);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('property-intelligence-engine', {
        body: {
          mode: 'compare_properties',
          property_ids: [propertyA, propertyB],
          hold_years: parseInt(holdYears),
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const getHeatLabel = (score: number) => {
    if (score >= 80) return { label: 'Very Hot', color: 'text-red-500' };
    if (score >= 65) return { label: 'Hot', color: 'text-orange-500' };
    if (score >= 50) return { label: 'Stable', color: 'text-amber-500' };
    return { label: 'Cool', color: 'text-blue-500' };
  };

  const getSpeedLabel = (days: number) => {
    if (days <= 30) return 'Very Fast';
    if (days <= 60) return 'Fast';
    if (days <= 90) return 'Moderate';
    return 'Slow';
  };

  const winnerId = result?.winner?.property_id;

  return (
    <div className="space-y-6">
      {/* Selection Panel */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" />
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-amber-400/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
              AI Investment Comparison
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select two properties and a hold period to get AI-powered investment analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Property A */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Property A</Label>
              <Select value={propertyA} onValueChange={setPropertyA} disabled={loadingProperties}>
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue placeholder={loadingProperties ? 'Loading...' : 'Select property'} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {properties.filter(p => p.id !== propertyB).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex flex-col">
                        <span className="font-medium text-sm truncate max-w-[280px]">{p.title}</span>
                        <span className="text-xs text-muted-foreground">{p.city} · {p.property_type}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property B */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Property B</Label>
              <Select value={propertyB} onValueChange={setPropertyB} disabled={loadingProperties}>
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue placeholder={loadingProperties ? 'Loading...' : 'Select property'} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {properties.filter(p => p.id !== propertyA).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex flex-col">
                        <span className="font-medium text-sm truncate max-w-[280px]">{p.title}</span>
                        <span className="text-xs text-muted-foreground">{p.city} · {p.property_type}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hold Period */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hold Period</Label>
              <Select value={holdYears} onValueChange={setHoldYears}>
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 15, 20].map(y => (
                    <SelectItem key={y} value={String(y)}>{y} Years</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button
            onClick={runComparison}
            disabled={loading || !propertyA || !propertyB}
            className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600 text-white shadow-lg shadow-emerald-500/20"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Investment Comparison
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Winner Banner */}
            <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent shadow-xl shadow-emerald-500/5 overflow-hidden">
              <CardContent className="py-5 px-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Recommended Investment</p>
                    <p className="text-lg font-bold">
                      {result.comparison.find(c => c.property_id === winnerId)?.title || winnerId}
                    </p>
                  </div>
                  <Badge className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-sm px-3">
                    Score: {result.winner.comparison_score}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Side-by-side Table */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Side-by-Side Comparison
                  <Badge variant="secondary" className="ml-2 text-xs">{result.hold_years}-Year Hold</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-transparent">
                        <TableHead className="w-[180px] sticky left-0 bg-card z-10 font-semibold text-foreground">Metric</TableHead>
                        {result.comparison.map(c => {
                          const isWinner = c.property_id === winnerId;
                          return (
                            <TableHead
                              key={c.property_id}
                              className={`text-center min-w-[200px] ${isWinner ? 'bg-emerald-500/8' : ''}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-semibold text-foreground truncate max-w-[180px]">{c.title || c.property_id.slice(0, 8)}</span>
                                <span className="text-xs text-muted-foreground">{c.city} · {c.property_type}</span>
                                {isWinner && (
                                  <Badge className="bg-gradient-to-r from-emerald-500/20 to-amber-400/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-0.5">
                                    <Trophy className="h-2.5 w-2.5" /> Winner
                                  </Badge>
                                )}
                              </div>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Price */}
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10">Price</TableCell>
                        {result.comparison.map(c => (
                          <TableCell key={c.property_id} className={`text-center ${c.property_id === winnerId ? 'bg-emerald-500/5' : ''}`}>
                            <span className="font-semibold"><Price amount={c.price} short /></span>
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* ROI % */}
                      {renderMetricRow('ROI %', result.comparison, winnerId, c => c.roi_percent, v => `${v.toFixed(2)}%`, true)}

                      {/* Annualized Return */}
                      {renderMetricRow('Annualized Return', result.comparison, winnerId, c => c.annualized_return, v => `${v.toFixed(2)}%`, true)}

                      {/* Investment Score */}
                      {renderMetricRow('Investment Score', result.comparison, winnerId, c => c.investment_score, v => (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-bold">{v}</span>
                          <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                      ), true)}

                      {/* Market Heat */}
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10">
                          <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-orange-500" />Market Heat</span>
                        </TableCell>
                        {result.comparison.map(c => {
                          const heat = getHeatLabel(c.heat_score);
                          const bestHeat = Math.max(...result.comparison.map(x => x.heat_score));
                          const isBest = c.heat_score === bestHeat && result.comparison.length > 1;
                          return (
                            <TableCell key={c.property_id} className={`text-center ${c.property_id === winnerId ? 'bg-emerald-500/5' : ''}`}>
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-bold ${isBest ? 'text-emerald-600 dark:text-emerald-400' : heat.color}`}>{c.heat_score}</span>
                                <Badge variant="outline" className={`text-[10px] ${heat.color} border-current/20`}>{heat.label}</Badge>
                                {isBest && <WinnerBadge />}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      {/* Days to Sell */}
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10">
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-500" />Est. Days to Sell</span>
                        </TableCell>
                        {result.comparison.map(c => {
                          const bestDays = Math.min(...result.comparison.map(x => x.days_to_sell));
                          const isBest = c.days_to_sell === bestDays && result.comparison.length > 1;
                          return (
                            <TableCell key={c.property_id} className={`text-center ${c.property_id === winnerId ? 'bg-emerald-500/5' : ''}`}>
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-bold ${isBest ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{c.days_to_sell} days</span>
                                <Badge variant="outline" className="text-[10px]">{getSpeedLabel(c.days_to_sell)}</Badge>
                                {isBest && <WinnerBadge />}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      {/* Composite Score */}
                      <TableRow className="bg-gradient-to-r from-amber-500/5 to-transparent border-t-2 border-amber-500/20">
                        <TableCell className="font-bold text-foreground sticky left-0 bg-card z-10">
                          <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-500" />Composite Score</span>
                        </TableCell>
                        {result.comparison.map(c => (
                          <TableCell key={c.property_id} className={`text-center ${c.property_id === winnerId ? 'bg-emerald-500/5' : ''}`}>
                            <span className={`text-lg font-black ${c.property_id === winnerId ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                              {c.comparison_score}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Decision Reasoning */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  AI Decision Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.decision_reasoning.map((reason, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{i + 1}</span>
                      </div>
                      <span className="text-muted-foreground">{reason}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* View Detailed ROI Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.comparison.map(c => (
                <Button
                  key={c.property_id}
                  variant="outline"
                  className="border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 justify-start gap-2"
                  onClick={() => navigate(`/property/${c.property_id}`)}
                >
                  <Eye className="h-4 w-4 text-amber-500" />
                  <span className="truncate">View Detailed ROI — {c.title || c.property_id.slice(0, 8)}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Helper: Winner Badge ────────────────────────────────────────────
const WinnerBadge = () => (
  <Badge className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-emerald-500/20 to-amber-400/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-0.5">
    <Trophy className="h-2.5 w-2.5" /> Best
  </Badge>
);

// ─── Helper: Render metric row with best highlight ───────────────────
function renderMetricRow(
  label: string,
  comparison: ComparisonResult[],
  winnerId: string | undefined,
  getValue: (c: ComparisonResult) => number,
  formatValue: (v: number) => React.ReactNode,
  higherIsBetter = true,
) {
  const values = comparison.map(getValue);
  const best = higherIsBetter ? Math.max(...values) : Math.min(...values);

  return (
    <TableRow>
      <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10">{label}</TableCell>
      {comparison.map(c => {
        const v = getValue(c);
        const isBest = v === best && comparison.length > 1;
        const formatted = formatValue(v);
        return (
          <TableCell key={c.property_id} className={`text-center ${c.property_id === winnerId ? 'bg-emerald-500/5' : ''}`}>
            <div className="flex flex-col items-center gap-0.5">
              <span className={`font-bold ${isBest ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                {typeof formatted === 'string' ? formatted : formatted}
              </span>
              {isBest && <WinnerBadge />}
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export default InvestmentComparePanel;

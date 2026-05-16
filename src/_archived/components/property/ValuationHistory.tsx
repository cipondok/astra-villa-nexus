import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, History, DollarSign } from "lucide-react";
import { useMemo } from "react";

interface PriceRecord {
  id: string;
  old_price: number;
  new_price: number;
  change_percentage: number;
  changed_at: string;
}

interface ValuationHistoryProps {
  propertyId: string;
  currentPrice?: number;
}

export default function ValuationHistory({ propertyId, currentPrice }: ValuationHistoryProps) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["valuation-history", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_price_history")
        .select("id, old_price, new_price, change_percentage, changed_at")
        .eq("property_id", propertyId)
        .order("changed_at", { ascending: true });
      if (error) throw error;
      return (data || []) as PriceRecord[];
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });

  const chartData = useMemo(() => {
    if (!history.length) return [];
    const points = [
      {
        date: history[0].changed_at,
        price: Number(history[0].old_price),
        label: new Date(history[0].changed_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      },
    ];
    history.forEach((h) => {
      points.push({
        date: h.changed_at,
        price: Number(h.new_price),
        label: new Date(h.changed_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      });
    });
    return points;
  }, [history]);

  const totalChange = useMemo(() => {
    if (!history.length) return null;
    const first = Number(history[0].old_price);
    const last = Number(history[history.length - 1].new_price);
    const pct = first > 0 ? ((last - first) / first) * 100 : 0;
    return { first, last, diff: last - first, pct };
  }, [history]);

  const formatPrice = (val: number) => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(0)}Jt`;
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardContent className="py-8">
          <div className="h-[200px] bg-muted/30 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!history.length) return null;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Riwayat Valuasi
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {history.length} perubahan harga tercatat
            </CardDescription>
          </div>
          {totalChange && (
            <Badge
              variant="outline"
              className={
                totalChange.pct > 0
                  ? "border-chart-1 text-chart-1 bg-chart-1/10"
                  : totalChange.pct < 0
                  ? "border-destructive text-destructive bg-destructive/10"
                  : "border-muted-foreground text-muted-foreground"
              }
            >
              {totalChange.pct > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : totalChange.pct < 0 ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : (
                <Minus className="h-3 w-3 mr-1" />
              )}
              {totalChange.pct > 0 ? "+" : ""}
              {totalChange.pct.toFixed(1)}% total
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="label"
              fontSize={10}
              className="fill-muted-foreground"
              tickLine={false}
            />
            <YAxis
              fontSize={10}
              className="fill-muted-foreground"
              tickFormatter={(v) => formatPrice(v)}
              width={80}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontSize: "12px" }}
              formatter={(val: number) => [formatPrice(val), "Harga"]}
            />
            {currentPrice && (
              <ReferenceLine
                y={currentPrice}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              fill="url(#priceGradient)"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Timeline list */}
        <div className="space-y-2 max-h-[240px] overflow-y-auto">
          {[...history].reverse().map((h) => {
            const pct = Number(h.change_percentage);
            const isUp = pct > 0;
            const isDown = pct < 0;
            return (
              <div
                key={h.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center ${
                      isUp
                        ? "bg-chart-1/10"
                        : isDown
                        ? "bg-destructive/10"
                        : "bg-muted"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
                    ) : isDown ? (
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatPrice(Number(h.new_price))}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      dari {formatPrice(Number(h.old_price))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-medium ${
                      isUp ? "text-chart-1" : isDown ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {pct > 0 ? "+" : ""}{pct.toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(h.changed_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

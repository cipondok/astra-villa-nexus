import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpDown, TrendingDown, TrendingUp, Shield, Droplets } from 'lucide-react';
import { usePropertyOrderBook, useTradeHistory, usePlaceBuyOrder } from '@/hooks/useLiquidityExchange';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Props {
  propertyId?: string;
  propertyTitle?: string;
}

export default function InvestorLiquidityExchange({ propertyId, propertyTitle }: Props) {
  const { data: orderBook } = usePropertyOrderBook(propertyId);
  const { data: trades } = useTradeHistory(propertyId);
  const placeBuy = usePlaceBuyOrder();
  const [buyPct, setBuyPct] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const sellOrders = orderBook?.sellOrders || [];
  const buyOrders = orderBook?.buyOrders || [];

  const handlePlaceBuyOrder = () => {
    if (!propertyId || !buyPct || !buyPrice) return;
    placeBuy.mutate(
      { target_property_id: propertyId, desired_percentage: Number(buyPct), max_price_per_percent: Number(buyPrice) },
      {
        onSuccess: () => { toast.success('Buy order placed'); setBuyPct(''); setBuyPrice(''); },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-primary" />
          Secondary Market Exchange
          <Badge variant="outline" className="text-[10px] ml-auto bg-primary/10 text-primary border-0">LIVE</Badge>
        </CardTitle>
        {propertyTitle && <p className="text-[10px] text-muted-foreground">{propertyTitle}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="book" className="space-y-3">
          <TabsList className="h-7">
            <TabsTrigger value="book" className="text-[10px] h-5">Order Book</TabsTrigger>
            <TabsTrigger value="trades" className="text-[10px] h-5">Trades</TabsTrigger>
            <TabsTrigger value="buy" className="text-[10px] h-5">Place Order</TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <div className="grid grid-cols-2 gap-3">
              {/* Sell side */}
              <div>
                <p className="text-[10px] font-semibold text-destructive mb-1 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Asks (Sell)
                </p>
                {sellOrders.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">No sell orders</p>
                ) : (
                  <div className="space-y-1">
                    {sellOrders.slice(0, 5).map((o: any) => (
                      <div key={o.id} className="flex justify-between text-[10px] p-1.5 bg-destructive/5 rounded">
                        <span>{Number(o.percentage_for_sale).toFixed(1)}%</span>
                        <span className="text-destructive font-medium">${Number(o.price_per_percent).toFixed(0)}/pct</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buy side */}
              <div>
                <p className="text-[10px] font-semibold text-chart-1 mb-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Bids (Buy)
                </p>
                {buyOrders.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">No buy orders</p>
                ) : (
                  <div className="space-y-1">
                    {buyOrders.slice(0, 5).map((o: any) => (
                      <div key={o.id} className="flex justify-between text-[10px] p-1.5 bg-chart-1/5 rounded">
                        <span>{Number(o.desired_percentage).toFixed(1)}%</span>
                        <span className="text-chart-1 font-medium">${Number(o.max_price_per_percent).toFixed(0)}/pct</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trades">
            {(trades || []).length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No trades yet</p>
            ) : (
              <div className="space-y-1">
                {(trades || []).slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex justify-between text-[10px] p-1.5 bg-muted/30 rounded">
                    <span>{Number(t.executed_percentage).toFixed(2)}% @ ${Number(t.execution_price).toLocaleString()}</span>
                    <Badge variant="outline" className="text-[8px] h-4">{t.settlement_status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="buy">
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Desired % stake"
                value={buyPct}
                onChange={(e) => setBuyPct(e.target.value)}
                className="h-8 text-xs"
              />
              <Input
                type="number"
                placeholder="Max price per %"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                onClick={handlePlaceBuyOrder}
                disabled={!buyPct || !buyPrice || placeBuy.isPending}
              >
                Place Buy Order
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Trust banner */}
        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <p className="text-[9px] text-muted-foreground">
            Secondary market trading protected by ASTRA escrow security.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

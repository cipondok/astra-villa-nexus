import { useState } from 'react';
import { ArrowUpRight, Wallet, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCreateExitListing } from '@/hooks/useSecondaryMarket';

interface ExitListingFormProps {
  position: {
    id: string;
    property_id: string;
    ownership_percentage: number;
    acquisition_price_idr: number;
    current_estimated_value_idr: number;
  };
  onSuccess?: () => void;
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export default function ExitListingForm({ position, onSuccess }: ExitListingFormProps) {
  const createExitListing = useCreateExitListing();
  const [askingPrice, setAskingPrice] = useState(position.current_estimated_value_idr);
  const [minPrice, setMinPrice] = useState(position.acquisition_price_idr);

  const premiumPct = position.current_estimated_value_idr > 0
    ? ((askingPrice - position.current_estimated_value_idr) / position.current_estimated_value_idr * 100).toFixed(1)
    : '0';
  const isPremium = parseFloat(premiumPct) >= 0;
  const profitLoss = askingPrice - position.acquisition_price_idr;

  const handleSubmit = () => {
    createExitListing.mutate({
      position_id: position.id,
      property_id: position.property_id,
      asking_price_idr: askingPrice,
      ownership_percentage: position.ownership_percentage,
      min_acceptable_price_idr: minPrice,
    }, { onSuccess });
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-primary" />
          Create Exit Listing
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Position Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-[10px] text-muted-foreground">Acquired At</p>
            <p className="text-sm font-semibold">{formatIDR(position.acquisition_price_idr)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-[10px] text-muted-foreground">Current Value</p>
            <p className="text-sm font-semibold">{formatIDR(position.current_estimated_value_idr)}</p>
          </div>
        </div>

        {/* Pricing Guidance */}
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
          <p className="text-xs font-medium text-foreground">Pricing Guidance</p>
          <div className="flex items-center gap-2">
            {isPremium ? (
              <TrendingUp className="h-4 w-4 text-chart-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className="text-xs text-muted-foreground">
              Your price is <span className={isPremium ? 'text-chart-1 font-semibold' : 'text-destructive font-semibold'}>
                {premiumPct}%
              </span> vs market value
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isPremium
              ? 'Premium pricing — may take longer to sell but higher return'
              : 'Discount pricing — faster exit, improves liquidity speed'}
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Asking Price (IDR)</label>
            <Input
              type="number"
              value={askingPrice}
              onChange={(e) => setAskingPrice(Number(e.target.value))}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Minimum Acceptable (IDR)</label>
            <Input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="text-sm"
            />
          </div>
        </div>

        {/* P&L Preview */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <span className="text-xs text-muted-foreground">Estimated P&L</span>
          <span className={`text-sm font-bold ${profitLoss >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
            {profitLoss >= 0 ? '+' : ''}{formatIDR(profitLoss)}
          </span>
        </div>

        {/* Disclaimers */}
        <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
          <span>A 2% platform fee applies to completed transfers. Exit listing subject to compliance review.</span>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createExitListing.isPending || askingPrice <= 0}
          className="w-full gap-2"
          size="sm"
        >
          <Wallet className="h-3 w-3" />
          {createExitListing.isPending ? 'Creating...' : 'List for Exit'}
        </Button>
      </CardContent>
    </Card>
  );
}

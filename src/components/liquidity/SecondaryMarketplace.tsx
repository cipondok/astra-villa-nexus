import { useState } from 'react';
import { TrendingUp, ArrowUpDown, Shield, Clock, DollarSign, Eye, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useExitListings, useAcquirePosition } from '@/hooks/useSecondaryMarket';
import { useAuth } from '@/contexts/AuthContext';

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export default function SecondaryMarketplace() {
  const { user } = useAuth();
  const { data: listings = [], isLoading } = useExitListings();
  const acquirePosition = useAcquirePosition();
  const [selectedListing, setSelectedListing] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Secondary Investment Market
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Acquire verified investment positions from existing investors
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-chart-1 border-chart-1/30">
          <Shield className="h-3 w-3" /> Escrow Protected
        </Badge>
      </div>

      {/* Trust Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
        <CardContent className="p-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            All secondary transfers are secured through escrow. Ownership is only transferred after full payment verification and compliance checks.
          </p>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse h-48" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ArrowUpDown className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No Exit Listings Available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back later for investment positions available for acquisition
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((listing: any) => (
            <Card
              key={listing.id}
              className="hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => setSelectedListing(listing)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {listing.ownership_percentage}% ownership
                  </Badge>
                  {listing.premium_discount_pct > 0 ? (
                    <Badge className="bg-chart-1/10 text-chart-1 text-[10px]">
                      +{listing.premium_discount_pct}% premium
                    </Badge>
                  ) : listing.premium_discount_pct < 0 ? (
                    <Badge className="bg-chart-4/10 text-chart-4 text-[10px]">
                      {listing.premium_discount_pct}% discount
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <p className="text-lg font-bold text-foreground">{formatIDR(listing.asking_price_idr)}</p>
                  <p className="text-[10px] text-muted-foreground">Asking Price</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded bg-muted/50">
                    <Eye className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-xs font-semibold">{listing.views_count || 0}</p>
                    <p className="text-[9px] text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <Clock className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-xs font-semibold">{listing.estimated_exit_days || '—'}</p>
                    <p className="text-[9px] text-muted-foreground">Est. Days</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <TrendingUp className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-xs font-semibold">{listing.liquidity_priority_score || 50}</p>
                    <p className="text-[9px] text-muted-foreground">Priority</p>
                  </div>
                </div>

                <Button size="sm" className="w-full gap-1 text-xs" variant="outline">
                  Acquire Position <ChevronRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

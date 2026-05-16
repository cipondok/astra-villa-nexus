import { useState, useMemo } from 'react';
import { useMyOffers, OFFER_STATUS_CONFIG, type OfferStatus } from '@/hooks/usePropertyOffers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText, DollarSign, TrendingUp, Clock, CheckCircle2, XCircle, BarChart3,
} from 'lucide-react';

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'closed', label: 'Closed' },
] as const;

export default function MyOffersPage() {
  const { data: offers = [], isLoading } = useMyOffers();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');

  const filtered = useMemo(() => {
    if (tab === 'all') return offers;
    if (tab === 'active') return offers.filter(o => ['submitted', 'seller_reviewing', 'counter_offer', 'accepted', 'in_progress'].includes(o.status));
    if (tab === 'completed') return offers.filter(o => o.status === 'completed');
    return offers.filter(o => ['rejected', 'withdrawn', 'expired'].includes(o.status));
  }, [offers, tab]);

  const stats = useMemo(() => ({
    total: offers.length,
    active: offers.filter(o => ['submitted', 'seller_reviewing', 'counter_offer', 'accepted', 'in_progress'].includes(o.status)).length,
    completed: offers.filter(o => o.status === 'completed').length,
    totalValue: offers.filter(o => o.status === 'completed').reduce((s, o) => s + (o.counter_price || o.offer_price), 0),
  }), [offers]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          My Offers & Transactions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track all your property offers and deal progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Offers', value: stats.total, icon: FileText, color: 'text-primary' },
          { label: 'Active Deals', value: stats.active, icon: Clock, color: 'text-amber-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Deal Value', value: formatPrice(stats.totalValue), icon: DollarSign, color: 'text-chart-4' },
        ].map(s => (
          <Card key={s.label} className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className={cn('h-4 w-4 shrink-0', s.color)} />
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {statusTabs.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : filtered.length === 0 ? (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="py-12 text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No offers found</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map(offer => {
              const config = OFFER_STATUS_CONFIG[offer.status];
              const isBuyer = user?.id === offer.buyer_id;
              return (
                <Card
                  key={offer.id}
                  onClick={() => navigate(`/offers/${offer.id}`)}
                  className={cn(
                    'bg-card/80 backdrop-blur border cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]',
                    config.bg
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {offer.property_image && (
                          <img src={offer.property_image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {offer.property_title || 'Property Offer'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-foreground">{formatPrice(offer.offer_price)}</span>
                            {offer.counter_price && (
                              <span className="text-xs text-purple-500">→ {formatPrice(offer.counter_price)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[9px] h-4">{offer.financing_method}</Badge>
                            <Badge variant="secondary" className="text-[9px] h-4">{isBuyer ? 'You: Buyer' : 'You: Seller'}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                          {config.icon} {config.label}
                        </Badge>
                        <p className="text-[9px] text-muted-foreground mt-1">
                          {new Date(offer.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </Tabs>
    </div>
  );
}

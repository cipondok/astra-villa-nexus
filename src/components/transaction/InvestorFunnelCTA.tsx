import { useState, lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Target, TrendingUp, TrendingDown, Zap, DollarSign, 
  MessageCircle, Clock, ChevronRight, Sparkles, Shield 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MakeOfferDialog = lazy(() => import('@/components/offers/MakeOfferDialog'));

interface InvestorFunnelCTAProps {
  propertyId: string;
  propertyTitle?: string;
  propertyImage?: string;
  propertyPrice?: number;
  sellerId?: string | null;
  agentId?: string | null;
  opportunityScore?: number | null;
  rentalYield?: number;
  priceDropPct?: number;
  growthForecast?: number;
  onWhatsAppClick?: () => void;
  onScheduleClick?: () => void;
}

export default function InvestorFunnelCTA({
  propertyId,
  propertyTitle,
  propertyImage,
  propertyPrice,
  sellerId,
  agentId,
  opportunityScore,
  rentalYield = 6.5,
  priceDropPct,
  growthForecast = 8.2,
  onWhatsAppClick,
  onScheduleClick,
}: InvestorFunnelCTAProps) {
  const [showOffer, setShowOffer] = useState(false);

  const scoreColor = !opportunityScore ? 'text-muted-foreground'
    : opportunityScore >= 80 ? 'text-chart-2'
    : opportunityScore >= 60 ? 'text-primary'
    : opportunityScore >= 40 ? 'text-amber-500'
    : 'text-destructive';

  const scoreLabel = !opportunityScore ? 'Analyzing...'
    : opportunityScore >= 80 ? 'Strong Buy'
    : opportunityScore >= 60 ? 'Good Value'
    : opportunityScore >= 40 ? 'Fair'
    : 'Caution';

  return (
    <>
      <Card className="border border-primary/15 bg-card backdrop-blur-xl rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {/* Opportunity Score Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">AI Investment Score</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-lg font-black leading-none', scoreColor)}>
                      {opportunityScore ?? '—'}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn('text-[9px] px-1.5 py-0 h-4 border-current', scoreColor)}
                    >
                      {scoreLabel}
                    </Badge>
                  </div>
                </div>
              </div>
              {opportunityScore && opportunityScore >= 75 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1 bg-chart-2/10 border border-chart-2/20 rounded-full px-2 py-0.5"
                >
                  <Zap className="h-3 w-3 text-chart-2" />
                  <span className="text-[9px] font-bold text-chart-2">Hot</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Quick Investment Metrics */}
          <div className="grid grid-cols-3 gap-px bg-border/30">
            <div className="bg-card p-2.5 text-center">
              <TrendingUp className="h-3 w-3 text-chart-2 mx-auto mb-0.5" />
              <p className="text-xs font-bold text-foreground">+{growthForecast}%</p>
              <p className="text-[8px] text-muted-foreground">Growth</p>
            </div>
            <div className="bg-card p-2.5 text-center">
              <DollarSign className="h-3 w-3 text-primary mx-auto mb-0.5" />
              <p className="text-xs font-bold text-foreground">{rentalYield}%</p>
              <p className="text-[8px] text-muted-foreground">Yield</p>
            </div>
            <div className="bg-card p-2.5 text-center">
              {priceDropPct && priceDropPct > 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-chart-2 mx-auto mb-0.5" />
                  <p className="text-xs font-bold text-chart-2">-{priceDropPct}%</p>
                  <p className="text-[8px] text-muted-foreground">Dropped</p>
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                  <p className="text-xs font-bold text-foreground">Stable</p>
                  <p className="text-[8px] text-muted-foreground">Price</p>
                </>
              )}
            </div>
          </div>

          {/* Price Drop Urgency Alert */}
          {priceDropPct && priceDropPct >= 5 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-chart-2/5 border-y border-chart-2/15 px-3 py-2 flex items-center gap-2"
            >
              <Zap className="h-3.5 w-3.5 text-chart-2 flex-shrink-0" />
              <p className="text-[10px] text-chart-2 font-medium">
                Price dropped {priceDropPct}% — {priceDropPct >= 10 ? 'Elite deal opportunity' : 'Below market value'}
              </p>
            </motion.div>
          )}

          {/* Funnel CTAs */}
          <div className="p-3 space-y-2">
            {/* Primary: Make Offer */}
            <Button
              onClick={() => setShowOffer(true)}
              className="w-full h-9 text-xs font-semibold gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Make an Offer
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Button>

            {/* Secondary: Quick WhatsApp */}
            <Button
              variant="outline"
              onClick={onWhatsAppClick}
              className="w-full h-8 text-[10px] font-medium gap-1.5 border-chart-2/30 text-chart-2 hover:bg-chart-2/5 hover:text-chart-2"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Quick WhatsApp Connect
            </Button>

            {/* Tertiary: Schedule */}
            <Button
              variant="ghost"
              onClick={onScheduleClick}
              className="w-full h-7 text-[10px] font-medium text-muted-foreground hover:text-foreground gap-1"
            >
              <Clock className="h-3 w-3" />
              Schedule Consultation
            </Button>

            {/* Agent Response Time */}
            <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-border/30">
              <div className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
              <span className="text-[9px] text-muted-foreground">
                Agent typically replies within <strong className="text-foreground">2 hours</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <MakeOfferDialog
          open={showOffer}
          onOpenChange={setShowOffer}
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          propertyImage={propertyImage}
          propertyPrice={propertyPrice}
          sellerId={sellerId}
          agentId={agentId}
          opportunityScore={opportunityScore}
        />
      </Suspense>
    </>
  );
}

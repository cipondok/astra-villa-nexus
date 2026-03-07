import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNegotiationAssistant } from '@/hooks/useNegotiationAssistant';
import { useSecureProperties } from '@/hooks/useSecureProperties';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, Handshake, Building2, Flame, Target, BarChart3, Clock, ShieldCheck, MessageSquare, ArrowDown } from 'lucide-react';

const formatPrice = (price: number) => {
  if (price >= 1e9) return `Rp ${(price / 1e9).toFixed(2)}B`;
  if (price >= 1e6) return `Rp ${(price / 1e6).toFixed(0)}M`;
  return `Rp ${price.toLocaleString()}`;
};

const NegotiationAssistantPage = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  const { data: properties, isLoading: propertiesLoading } = useSecureProperties({ limit: 50 });
  const { data, isLoading, error } = useNegotiationAssistant(selectedPropertyId || undefined);

  const ctx = data?.context;
  const savings = ctx ? ctx.listing_price - data.suggested_offer_price : 0;
  const pricePosition = ctx ? ((ctx.listing_price / ctx.fair_market_value - 1) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Handshake className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">ASTRA AI Negotiation Assistant</h1>
              <p className="text-sm text-muted-foreground">AI-powered offer price recommendation engine</p>
            </div>
          </div>
        </motion.div>

        {/* Property Selector */}
        <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={propertiesLoading ? 'Loading properties...' : 'Select a property to negotiate'} />
              </SelectTrigger>
              <SelectContent>
                {(properties || []).map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} — {p.city || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing negotiation strategy...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Analysis failed</p>
              <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
            </CardContent>
          </Card>
        )}

        {/* No selection */}
        {!selectedPropertyId && !isLoading && (
          <Card className="border-border/50">
            <CardContent className="p-16 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">Select a Property</p>
              <p className="text-sm text-muted-foreground">Choose a property above to get AI negotiation advice</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {data && ctx && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Main Offer Card */}
            <Card className="border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">AI Recommended Offer</p>
                  <p className="text-4xl md:text-5xl font-bold text-primary">{formatPrice(data.suggested_offer_price)}</p>
                  {savings > 0 && (
                    <p className="text-sm text-green-500 mt-2 flex items-center justify-center gap-1">
                      <ArrowDown className="w-3.5 h-3.5" />
                      Save {formatPrice(savings)} ({data.negotiation_margin_percent.toFixed(1)}% below listing)
                    </p>
                  )}
                  {savings <= 0 && (
                    <p className="text-sm text-muted-foreground mt-2">Offer at or near listing price recommended</p>
                  )}
                </div>

                {/* Price Comparison Bar */}
                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Suggested Offer</span>
                    <span>Market Value</span>
                    <span>Listing Price</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary/60 rounded-full"
                      style={{ width: `${Math.min(100, (data.suggested_offer_price / ctx.listing_price) * 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-amber-500"
                      style={{ left: `${Math.min(100, (ctx.fair_market_value / ctx.listing_price) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className="text-primary font-medium">{formatPrice(data.suggested_offer_price)}</span>
                    <span className="text-amber-500 font-medium">{formatPrice(ctx.fair_market_value)}</span>
                    <span className="text-foreground font-medium">{formatPrice(ctx.listing_price)}</span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Negotiation Confidence</span>
                      <span className="text-foreground font-medium">{data.negotiation_confidence}%</span>
                    </div>
                    <Progress value={data.negotiation_confidence} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Context Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  icon: <Clock className="w-4 h-4" />,
                  label: 'Days on Market',
                  value: `${ctx.days_on_market}`,
                  sub: ctx.days_on_market > 90 ? 'Seller motivated' : ctx.days_on_market < 14 ? 'Fresh listing' : 'Moderate',
                  color: ctx.days_on_market > 90 ? 'text-green-500' : 'text-foreground',
                },
                {
                  icon: <Flame className="w-4 h-4" />,
                  label: 'Demand Heat',
                  value: `${ctx.demand_heat_score}/100`,
                  sub: ctx.demand_heat_score >= 70 ? 'Hot market' : ctx.demand_heat_score < 40 ? 'Cool market' : 'Moderate',
                  color: ctx.demand_heat_score >= 70 ? 'text-orange-500' : 'text-foreground',
                },
                {
                  icon: <BarChart3 className="w-4 h-4" />,
                  label: 'Price Position',
                  value: `${pricePosition > 0 ? '+' : ''}${pricePosition.toFixed(1)}%`,
                  sub: pricePosition > 10 ? 'Overpriced' : pricePosition < -5 ? 'Underpriced' : 'Fair',
                  color: pricePosition > 10 ? 'text-red-400' : pricePosition < -5 ? 'text-green-500' : 'text-foreground',
                },
                {
                  icon: <Target className="w-4 h-4" />,
                  label: 'Comparables',
                  value: `${ctx.comparable_count}`,
                  sub: ctx.comparable_count >= 10 ? 'Strong data' : ctx.comparable_count >= 2 ? 'Adequate' : 'Limited',
                  color: 'text-foreground',
                },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        {card.icon}
                        <span className="text-xs">{card.label}</span>
                      </div>
                      <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* AI Explanation */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">AI Analysis</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{data.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Tips */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-primary" />
                  Negotiation Strategy
                </h3>
                <div className="space-y-2.5">
                  {[
                    data.negotiation_margin_percent > 5
                      ? `Start your offer at ${formatPrice(Math.round(data.suggested_offer_price * 0.97))} and be prepared to negotiate up to ${formatPrice(data.suggested_offer_price)}.`
                      : `Offer close to listing price (${formatPrice(data.suggested_offer_price)}) to secure the deal quickly.`,
                    ctx.days_on_market > 60
                      ? 'The property has been on market for a while — use this as leverage in discussions.'
                      : 'Fresh listing — act quickly if interested, as other buyers may also be evaluating.',
                    ctx.demand_heat_score >= 70
                      ? 'High demand area — consider adding favorable terms (quick closing, flexible timeline) to strengthen your offer.'
                      : 'Moderate/low demand — you have time to negotiate without pressure.',
                    ctx.comparable_count >= 5
                      ? `Reference the ${ctx.comparable_count} comparable properties to justify your offer price.`
                      : 'Limited market data — consider an independent appraisal to support your position.',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
    </div>
  );
};

export default NegotiationAssistantPage;

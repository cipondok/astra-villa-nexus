import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePricePrediction } from '@/hooks/usePricePrediction';
import { useSecureProperties } from '@/hooks/useSecureProperties';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, Calendar, Flame, BarChart3, Sparkles, ArrowUpRight, Target, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts';

const formatPrice = (price: number) => {
  if (price >= 1e9) return `Rp ${(price / 1e9).toFixed(2)}B`;
  if (price >= 1e6) return `Rp ${(price / 1e6).toFixed(0)}M`;
  return `Rp ${price.toLocaleString()}`;
};

const PricePredictionPage = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [forecastYears, setForecastYears] = useState(5);
  const { language, setLanguage } = useLanguage();
  const toggleLanguage = () => setLanguage(language === 'en' ? 'id' : 'en');

  const { data: properties, isLoading: propertiesLoading } = useSecureProperties({ limit: 50 });
  const { data: prediction, isLoading: predictionLoading, error } = usePricePrediction(
    selectedPropertyId || undefined,
    forecastYears
  );

  const selectedProperty = properties?.find(p => p.id === selectedPropertyId);

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation language={language} onLanguageToggle={toggleLanguage} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">ASTRA AI Price Prediction</h1>
              <p className="text-sm text-muted-foreground">AI-powered future property price forecasting engine</p>
            </div>
          </div>
        </motion.div>

        {/* Property Selector */}
        <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="flex-1 bg-background">
                  <SelectValue placeholder={propertiesLoading ? 'Loading properties...' : 'Select a property to analyze'} />
                </SelectTrigger>
                <SelectContent>
                  {(properties || []).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="truncate">{p.title} — {p.city || 'Unknown'}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(forecastYears)} onValueChange={v => setForecastYears(Number(v))}>
                <SelectTrigger className="w-full sm:w-40 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Years</SelectItem>
                  <SelectItem value="5">5 Years</SelectItem>
                  <SelectItem value="10">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {predictionLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Calculating price predictions...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Prediction failed</p>
              <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
            </CardContent>
          </Card>
        )}

        {/* No selection */}
        {!selectedPropertyId && !predictionLoading && (
          <Card className="border-border/50">
            <CardContent className="p-16 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">Select a Property</p>
              <p className="text-sm text-muted-foreground">Choose a property above to generate AI price predictions</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {prediction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Current Price', value: formatPrice(prediction.current_price), icon: <BarChart3 className="w-4 h-4" />, color: 'text-foreground' },
                { label: '1-Year Forecast', value: formatPrice(prediction.price_1y), icon: <Calendar className="w-4 h-4" />, color: 'text-blue-500' },
                { label: '3-Year Forecast', value: formatPrice(prediction.price_3y), icon: <TrendingUp className="w-4 h-4" />, color: 'text-amber-500' },
                { label: '5-Year Forecast', value: formatPrice(prediction.price_5y), icon: <ArrowUpRight className="w-4 h-4" />, color: 'text-green-500' },
              ].map((kpi, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        {kpi.icon}
                        <span className="text-xs">{kpi.label}</span>
                      </div>
                      <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Growth Rate & Signals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Annual Growth Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-primary mb-2">{prediction.growth_rate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Compound annual growth rate</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-foreground">Demand Heat</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-2">{prediction.demand_heat_score}</p>
                  <Progress value={prediction.demand_heat_score} className="h-2" />
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground">AI Confidence</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-2">{prediction.confidence}%</p>
                  <Progress value={prediction.confidence} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Price Projection Chart */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Price Projection Timeline
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{ year: 0, price: prediction.current_price, appreciation: 0 }, ...prediction.yearly_projection]}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v === 0 ? 'Now' : `Y${v}`} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatPrice(v)} width={90} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [formatPrice(value), 'Price']}
                        labelFormatter={v => v === 0 ? 'Current' : `Year ${v}`}
                      />
                      <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="url(#priceGrad)" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(var(--primary))' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Year-by-year table */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">Year-by-Year Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 text-muted-foreground font-medium">Year</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Predicted Price</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Appreciation</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prediction.yearly_projection.map(row => (
                        <tr key={row.year} className="border-b border-border/30">
                          <td className="py-2.5 text-foreground font-medium">Year {row.year}</td>
                          <td className="py-2.5 text-right text-foreground">{formatPrice(row.price)}</td>
                          <td className="py-2.5 text-right text-green-500">+{formatPrice(row.appreciation)}</td>
                          <td className="py-2.5 text-right text-primary">+{((row.price / prediction.current_price - 1) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      <ProfessionalFooter language={language} />
    </div>
  );
};

export default PricePredictionPage;

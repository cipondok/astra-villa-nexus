import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calculator,
  Home,
  MapPin,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
  BarChart3,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { usePropertyValuation, PropertyValuationInput, ValuationResult } from '@/hooks/usePropertyValuation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyValuationCardProps {
  propertyId?: string;
  propertyType: string;
  location: {
    city: string;
    district?: string;
  };
  specifications: {
    landArea: number;
    buildingArea: number;
    bedrooms: number;
    bathrooms: number;
    floors?: number;
    yearBuilt?: number;
  };
  features?: string[];
  currentPrice?: number;
  className?: string;
}

export function PropertyValuationCard({
  propertyId,
  propertyType,
  location,
  specifications,
  features,
  currentPrice,
  className
}: PropertyValuationCardProps) {
  const { isLoading, getValuation, formatCurrency } = usePropertyValuation();
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleGetValuation = async () => {
    const input: PropertyValuationInput = {
      propertyId,
      propertyType,
      location,
      specifications,
      features,
      currentPrice
    };

    const result = await getValuation(input);
    if (result) {
      setValuation(result);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'declining':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
      case 'negative':
        return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Property Valuation</CardTitle>
          </div>
          {valuation && (
            <Badge className={cn("text-xs", getTrendColor(valuation.marketTrend))}>
              {getTrendIcon(valuation.marketTrend)}
              <span className="ml-1 capitalize">{valuation.marketTrend} Market</span>
            </Badge>
          )}
        </div>
        <CardDescription>
          Get an instant automated property value estimate
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Property Summary */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Home className="h-4 w-4" />
            <span className="capitalize">{propertyType}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location.city}</span>
          </div>
        </div>

        {!valuation ? (
          <Button 
            onClick={handleGetValuation} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Get Valuation
              </>
            )}
          </Button>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Main Valuation */}
              <div className="text-center py-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Estimated Value</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {formatCurrency(valuation.estimatedValue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Range: {formatCurrency(valuation.priceRangeLow)} - {formatCurrency(valuation.priceRangeHigh)}
                </p>
              </div>

              {/* Confidence Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence Score</span>
                  <span className="font-medium">{valuation.confidenceScore}%</span>
                </div>
                <Progress value={valuation.confidenceScore} className="h-2" />
              </div>

              {/* Current vs Estimated */}
              {currentPrice && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                  <span className="text-muted-foreground">Current Listing Price</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(currentPrice)}</span>
                    {currentPrice > valuation.estimatedValue ? (
                      <span className="ml-2 text-xs text-red-500">
                        ({Math.round((currentPrice - valuation.estimatedValue) / valuation.estimatedValue * 100)}% above)
                      </span>
                    ) : currentPrice < valuation.estimatedValue ? (
                      <span className="ml-2 text-xs text-green-500">
                        ({Math.round((valuation.estimatedValue - currentPrice) / valuation.estimatedValue * 100)}% below)
                      </span>
                    ) : (
                      <span className="ml-2 text-xs text-muted-foreground">(at market value)</span>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Toggle Details */}
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setShowDetails(!showDetails)}
              >
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Valuation Details
                </span>
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Valuation Factors */}
                    {valuation.valuationFactors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Value Factors</h4>
                        <div className="space-y-1">
                          {valuation.valuationFactors.map((factor, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                            >
                              <div className="flex items-center gap-2">
                                {getImpactIcon(factor.impact)}
                                <span>{factor.name}</span>
                              </div>
                              <span className={cn(
                                "font-medium",
                                factor.impact === 'positive' && "text-green-600",
                                factor.impact === 'negative' && "text-red-600"
                              )}>
                                {factor.impact === 'positive' ? '+' : ''}{Math.round(factor.weight * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comparable Properties */}
                    {valuation.comparableProperties.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Comparable Properties</h4>
                        <div className="space-y-1">
                          {valuation.comparableProperties.slice(0, 3).map((comp, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                            >
                              <div className="flex-1 truncate">
                                <span className="font-medium">{comp.title}</span>
                                {comp.distance && (
                                  <span className="ml-2 text-muted-foreground">
                                    ({comp.distance} km away)
                                  </span>
                                )}
                              </div>
                              <div className="text-right ml-2">
                                <span className="font-medium">{formatCurrency(comp.price)}</span>
                                <span className="ml-1 text-muted-foreground">
                                  ({Math.round(comp.similarity * 100)}% similar)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Methodology */}
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Methodology:</strong> {valuation.methodology}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Valid until {new Date(valuation.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleGetValuation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="mr-2 h-4 w-4" />
                )}
                Refresh Valuation
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";

interface PredictivePricingCardProps {
  loading: boolean;
  prediction: {
    trend: 'up' | 'down' | 'stable';
    next12Months: string;
    confidence: number;
  } | null;
}

const PredictivePricingCard = ({ loading, prediction }: PredictivePricingCardProps) => {
  const getTrendColor = () => {
    if (!prediction) return 'text-muted-foreground';
    switch (prediction.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'stable':
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Predictive Pricing
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Analyzing market data...</p>
          </div>
        ) : prediction ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Next 12 Months Trend</p>
              <p className={`text-lg font-bold ${getTrendColor()}`}>
                {prediction.next12Months}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confidence Level</p>
              <p className="font-semibold">{prediction.confidence}%</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">Pricing prediction data is not available for this property.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictivePricingCard;

import { useState } from 'react';
import { CheckCircle, TrendingUp, Calendar, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface DealCompletionScreenProps {
  dealId: string;
  propertyTitle?: string;
  transactionAmount?: number;
  completedAt?: string;
  onReviewClick?: () => void;
  onReferralClick?: () => void;
}

export default function DealCompletionScreen({
  dealId,
  propertyTitle = 'Investment Property',
  transactionAmount = 0,
  completedAt,
  onReviewClick,
  onReferralClick,
}: DealCompletionScreenProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      {/* Success Hero */}
      <Card className="border-chart-1/30 bg-gradient-to-br from-chart-1/5 via-background to-chart-4/5">
        <CardContent className="p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-chart-1/10 border-2 border-chart-1/30 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-chart-1" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Investment Complete!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your secure investment transaction has been successfully completed.
            </p>
          </div>
          <Badge variant="outline" className="border-chart-1/30 text-chart-1">
            Deal #{dealId.slice(0, 8).toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Transaction Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">Property</p>
              <p className="text-sm font-semibold truncate">{propertyTitle}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">Amount</p>
              <p className="text-sm font-semibold">{formatIDR(transactionAmount)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">Status</p>
              <p className="text-sm font-semibold text-chart-1">Completed</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">Date</p>
              <p className="text-sm font-semibold">
                {completedAt ? new Date(completedAt).toLocaleDateString() : 'Today'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="cursor-pointer hover:border-chart-4/50 transition-colors" onClick={onReviewClick}>
          <CardContent className="p-4 text-center space-y-2">
            <Star className="h-5 w-5 mx-auto text-chart-4" />
            <p className="text-xs font-semibold">Rate Experience</p>
            <p className="text-[10px] text-muted-foreground">Share your transaction review</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={onReferralClick}>
          <CardContent className="p-4 text-center space-y-2">
            <ArrowRight className="h-5 w-5 mx-auto text-primary" />
            <p className="text-xs font-semibold">Invite & Earn</p>
            <p className="text-[10px] text-muted-foreground">Refer investors, earn rewards</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-chart-1/50 transition-colors"
          onClick={() => navigate('/properties')}
        >
          <CardContent className="p-4 text-center space-y-2">
            <TrendingUp className="h-5 w-5 mx-auto text-chart-1" />
            <p className="text-xs font-semibold">Next Investment</p>
            <p className="text-[10px] text-muted-foreground">Explore more opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Reassurance Footer */}
      <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/30">
        <p className="text-[11px] text-muted-foreground">
          All transaction records are securely stored. Access your portfolio anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}

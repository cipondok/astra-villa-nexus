import { useState } from 'react';
import { Star, Shield, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface InvestorReviewFormProps {
  dealId: string;
  agentUserId?: string;
  propertyId?: string;
  onSubmitted?: () => void;
}

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5">
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= value ? 'text-chart-4 fill-chart-4' : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InvestorReviewForm({ dealId, agentUserId, propertyId, onSubmitted }: InvestorReviewFormProps) {
  const { user } = useAuth();
  const [ratingTransaction, setRatingTransaction] = useState(0);
  const [ratingAgent, setRatingAgent] = useState(0);
  const [ratingPlatform, setRatingPlatform] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const overallScore = ratingTransaction && ratingAgent && ratingPlatform
    ? ((ratingTransaction + ratingAgent + ratingPlatform) / 3).toFixed(1)
    : null;

  const handleSubmit = async () => {
    if (!user?.id || !ratingTransaction || !ratingAgent || !ratingPlatform) {
      toast.error('Please complete all ratings');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('investor_reviews' as any).insert({
        deal_id: dealId,
        investor_user_id: user.id,
        agent_user_id: agentUserId || null,
        property_id: propertyId || null,
        rating_transaction: ratingTransaction,
        rating_agent: ratingAgent,
        rating_platform: ratingPlatform,
        overall_score: parseFloat(overallScore || '0'),
        review_text: reviewText || null,
        verification_status: 'pending',
      });
      if (error) throw error;
      toast.success('Review submitted! It will be verified before publishing.');
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Star className="h-4 w-4 text-chart-4" />
          Rate Your Investment Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="grid gap-4">
          <StarRating value={ratingTransaction} onChange={setRatingTransaction} label="Transaction Process" />
          <StarRating value={ratingAgent} onChange={setRatingAgent} label="Agent Professionalism" />
          <StarRating value={ratingPlatform} onChange={setRatingPlatform} label="Platform Trust & Safety" />
        </div>

        {overallScore && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-chart-4/30 text-chart-4">
              Overall: {overallScore}/5.0
            </Badge>
          </div>
        )}

        <Textarea
          placeholder="Share your experience (optional)..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={3}
          className="text-sm"
        />

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Reviews are verified before publishing to ensure authenticity.</span>
        </div>

        <Button onClick={handleSubmit} disabled={submitting || !ratingTransaction} className="w-full gap-2" size="sm">
          <Send className="h-3 w-3" />
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
}

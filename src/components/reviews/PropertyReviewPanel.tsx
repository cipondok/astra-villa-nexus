import React, { useState, useMemo } from 'react';
import { usePropertyReviews, PropertyReview } from '@/hooks/usePropertyReviews';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star, MessageSquare, ThumbsUp, ChevronDown, ChevronUp,
  ShieldCheck, MapPin, TrendingUp, Home, Hammer, Send, Loader2,
  Filter, X
} from 'lucide-react';

const TAG_CATEGORIES = [
  { key: 'location_quality', label: 'Location Quality', icon: MapPin, color: 'bg-chart-1/15 text-chart-1 border-chart-1/30' },
  { key: 'investment_potential', label: 'Investment Potential', icon: TrendingUp, color: 'bg-chart-2/15 text-chart-2 border-chart-2/30' },
  { key: 'rental_demand', label: 'Rental Demand', icon: Home, color: 'bg-chart-4/15 text-chart-4 border-chart-4/30' },
  { key: 'build_quality', label: 'Build Quality', icon: Hammer, color: 'bg-primary/15 text-primary border-primary/30' },
] as const;

const SUB_CRITERIA = [
  { key: 'rating_condition', label: 'Property Condition' },
  { key: 'rating_agent', label: 'Agent Quality' },
  { key: 'rating_investment', label: 'Investment Alignment' },
] as const;

interface PropertyReviewPanelProps {
  propertyId: string;
  className?: string;
}

// ── Star Rating Input ──
function StarInput({ value, onChange, size = 'md' }: { value: number; onChange: (v: number) => void; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5 hover:scale-110 transition-transform">
          <Star className={cn(s, star <= value ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground/30')} />
        </button>
      ))}
    </div>
  );
}

// ── Star Display ──
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn(s, i <= rating ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground/30')} />
      ))}
    </div>
  );
}

// ── Rating Breakdown Bar ──
function RatingBreakdown({ reviews }: { reviews: PropertyReview[] }) {
  const total = reviews.length;
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: total > 0 ? (reviews.filter(r => r.rating === star).length / total) * 100 : 0,
  }));

  return (
    <div className="space-y-1.5">
      {dist.map(d => (
        <div key={d.star} className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground w-3">{d.star}</span>
          <Star className="h-3 w-3 fill-chart-3 text-chart-3" />
          <Progress value={d.pct} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground w-6 text-right">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Single Review Card ──
function ReviewCard({ review, onVote }: { review: PropertyReview; onVote: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const text = review.review_text || '';
  const isLong = text.length > 200;
  const tags: string[] = (review as any).tag_categories || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/40 rounded-xl p-4 space-y-3 bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.profiles?.avatar_url} />
            <AvatarFallback className="text-xs bg-muted">
              {(review.profiles?.full_name || 'A').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {review.profiles?.full_name || 'Anonymous'}
              </span>
              {review.is_verified_visit && (
                <Badge variant="outline" className="text-[9px] h-4 px-1 gap-0.5 bg-chart-2/10 text-chart-2 border-chart-2/30">
                  <ShieldCheck className="h-2.5 w-2.5" /> Verified
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>

      {review.title && (
        <h4 className="text-sm font-bold text-foreground">{review.title}</h4>
      )}

      {text && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isLong && !expanded ? text.slice(0, 200) + '...' : text}
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="ml-1 text-primary font-medium hover:underline">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => {
            const cat = TAG_CATEGORIES.find(c => c.key === tag);
            if (!cat) return null;
            const Icon = cat.icon;
            return (
              <Badge key={tag} variant="outline" className={cn('text-[9px] gap-0.5 border', cat.color)}>
                <Icon className="h-2.5 w-2.5" /> {cat.label}
              </Badge>
            );
          })}
        </div>
      )}

      {review.owner_response && (
        <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Owner Response</p>
          <p className="text-xs text-foreground">{review.owner_response}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => onVote(review.id)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
          <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpful_count})
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Panel ──
export default function PropertyReviewPanel({ propertyId, className }: PropertyReviewPanelProps) {
  const { user } = useAuth();
  const {
    reviews, myReview, isLoading, averageRating, totalReviews,
    createReview, voteOnReview, isSubmitting,
  } = usePropertyReviews(propertyId);

  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rating: 0, title: '', review_text: '', tag_categories: [] as string[],
    rating_condition: 0, rating_agent: 0, rating_investment: 0,
  });

  const filteredReviews = useMemo(() => {
    if (!filterTag) return reviews;
    return reviews.filter(r => ((r as any).tag_categories || []).includes(filterTag));
  }, [reviews, filterTag]);

  const displayedReviews = expanded ? filteredReviews : filteredReviews.slice(0, 3);

  const toggleTag = (key: string) => {
    setFormData(prev => ({
      ...prev,
      tag_categories: prev.tag_categories.includes(key)
        ? prev.tag_categories.filter(t => t !== key)
        : [...prev.tag_categories, key],
    }));
  };

  const handleSubmit = () => {
    if (formData.rating === 0) return;
    createReview({
      property_id: propertyId,
      rating: formData.rating,
      title: formData.title.trim() || undefined,
      review_text: formData.review_text.trim() || undefined,
      pros: formData.tag_categories as any,
    } as any);
    setFormData({ rating: 0, title: '', review_text: '', tag_categories: [], rating_condition: 0, rating_agent: 0, rating_investment: 0 });
    setShowForm(false);
  };

  if (isLoading) {
    return <div className={cn('animate-pulse space-y-3', className)}>
      <div className="h-32 bg-muted rounded-xl" />
      <div className="h-24 bg-muted rounded-xl" />
    </div>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* ── Summary Header ── */}
      <Card className="border-border/40">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Score */}
            <div className="text-center">
              <p className="text-4xl font-black text-foreground">{averageRating.toFixed(1)}</p>
              <StarDisplay rating={Math.round(averageRating)} size="md" />
              <p className="text-xs text-muted-foreground mt-1">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
            </div>

            {/* Breakdown */}
            <div className="flex-1 w-full">
              <RatingBreakdown reviews={reviews} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tag Filters ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
        <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        {TAG_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = filterTag === cat.key;
          return (
            <Button
              key={cat.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={cn('text-[10px] h-7 gap-1 shrink-0 rounded-full', isActive && 'shadow-sm')}
              onClick={() => setFilterTag(isActive ? null : cat.key)}
            >
              <Icon className="h-3 w-3" /> {cat.label}
              {isActive && <X className="h-2.5 w-2.5 ml-0.5" />}
            </Button>
          );
        })}
      </div>

      {/* ── Write Review CTA ── */}
      {user && !myReview && !showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full gap-2 rounded-xl"
          variant="outline"
        >
          <MessageSquare className="h-4 w-4" /> Write a Review
        </Button>
      )}

      {/* ── Review Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-chart-3" /> Write Your Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Overall Rating *</label>
                  <StarInput value={formData.rating} onChange={v => setFormData(p => ({ ...p, rating: v }))} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">What stood out? (select tags)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const selected = formData.tag_categories.includes(cat.key);
                      return (
                        <Button
                          key={cat.key}
                          type="button"
                          variant={selected ? 'default' : 'outline'}
                          size="sm"
                          className={cn('text-[10px] h-7 gap-1 rounded-full', selected && 'shadow-sm')}
                          onClick={() => toggleTag(cat.key)}
                        >
                          <Icon className="h-3 w-3" /> {cat.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Title</label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    className="h-9 rounded-xl"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Your Review</label>
                  <Textarea
                    value={formData.review_text}
                    onChange={e => setFormData(p => ({ ...p, review_text: e.target.value }))}
                    placeholder="Share your experience with this property..."
                    rows={4}
                    className="rounded-xl resize-none"
                    maxLength={2000}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={formData.rating === 0 || isSubmitting}
                    className="flex-1 rounded-xl gap-1.5"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reviews List ── */}
      {filteredReviews.length === 0 ? (
        <Card className="border-border/30">
          <CardContent className="py-10 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No reviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to share your experience</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onVote={(id) => voteOnReview({ reviewId: id, voteType: 'helpful' })}
            />
          ))}

          {filteredReviews.length > 3 && (
            <Button
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="w-full gap-1.5 text-xs"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? 'Show less' : `Show all ${filteredReviews.length} reviews`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

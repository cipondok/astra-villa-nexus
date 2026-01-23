import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, ThumbsUp, Shield, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { usePropertyReviews, PropertyReview } from '@/hooks/usePropertyReviews';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PropertyReviewsProps {
  propertyId: string;
}

function StarRating({ 
  rating, 
  onChange, 
  readonly = false,
  size = 'md'
}: { 
  rating: number; 
  onChange?: (rating: number) => void; 
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={cn(
            "transition-colors",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onVote, onEdit, onDelete, isOwner }: { 
  review: PropertyReview; 
  onVote: (type: 'helpful' | 'not_helpful') => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
}) {
  return (
    <div className="border-b last:border-0 py-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.profiles?.avatar_url || ''} />
          <AvatarFallback>
            {review.profiles?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {review.profiles?.full_name || 'Anonymous'}
            </span>
            {review.is_verified_visit && (
              <Badge variant="secondary" className="text-[10px] gap-1 py-0">
                <Shield className="h-2.5 w-2.5" />
                Verified Visit
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} readonly size="sm" />
            {review.title && (
              <span className="text-sm font-medium">{review.title}</span>
            )}
          </div>
          
          {review.review_text && (
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
              {review.review_text}
            </p>
          )}

          {(review.pros?.length || review.cons?.length) && (
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              {review.pros?.length ? (
                <div>
                  <span className="font-medium text-green-600">Pros:</span>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {review.pros.map((pro, i) => (
                      <li key={i}>+ {pro}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {review.cons?.length ? (
                <div>
                  <span className="font-medium text-red-600">Cons:</span>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {review.cons.map((con, i) => (
                      <li key={i}>- {con}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}

          {review.owner_response && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1 text-xs font-medium mb-1">
                <MessageSquare className="h-3 w-3" />
                Owner Response
              </div>
              <p className="text-xs text-muted-foreground">{review.owner_response}</p>
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onVote('helpful')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Helpful ({review.helpful_count})
            </button>
            
            {isOwner && (
              <>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const { user } = useAuth();
  const {
    reviews,
    myReview,
    isLoading,
    averageRating,
    ratingDistribution,
    totalReviews,
    createReview,
    updateReview,
    deleteReview,
    voteOnReview,
    isSubmitting,
  } = usePropertyReviews(propertyId);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<PropertyReview | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');

  const handleSubmitReview = () => {
    if (editingReview) {
      updateReview({
        reviewId: editingReview.id,
        rating: newRating,
        title: newTitle || undefined,
        review_text: newText || undefined,
      }, {
        onSuccess: () => {
          setShowReviewForm(false);
          setEditingReview(null);
          resetForm();
        },
      });
    } else {
      createReview({
        property_id: propertyId,
        rating: newRating,
        title: newTitle || undefined,
        review_text: newText || undefined,
      }, {
        onSuccess: () => {
          setShowReviewForm(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setNewRating(5);
    setNewTitle('');
    setNewText('');
  };

  const startEdit = (review: PropertyReview) => {
    setEditingReview(review);
    setNewRating(review.rating);
    setNewTitle(review.title || '');
    setNewText(review.review_text || '');
    setShowReviewForm(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            Reviews & Ratings
          </CardTitle>
          {user && !myReview && (
            <Button size="sm" onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Rating Summary */}
        {totalReviews > 0 && (
          <div className="flex items-start gap-6 pb-4 border-b mb-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <StarRating rating={Math.round(averageRating)} readonly />
              <div className="text-xs text-muted-foreground mt-1">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs w-3">{star}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Form Dialog */}
        <Dialog open={showReviewForm} onOpenChange={(open) => {
          setShowReviewForm(open);
          if (!open) {
            setEditingReview(null);
            resetForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingReview ? 'Edit Your Review' : 'Write a Review'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Your Rating</Label>
                <StarRating rating={newRating} onChange={setNewRating} size="lg" />
              </div>
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                />
              </div>
              <div className="space-y-2">
                <Label>Your Review</Label>
                <Textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Share your experience with this property..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReviewForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="divide-y">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onVote={(type) => voteOnReview({ reviewId: review.id, voteType: type })}
                onEdit={() => startEdit(review)}
                onDelete={() => deleteReview(review.id)}
                isOwner={review.user_id === user?.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

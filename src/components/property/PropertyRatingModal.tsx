import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, User } from 'lucide-react';
import { usePropertyRatings } from '@/hooks/usePropertyRatings';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PropertyRatingDisplay from './PropertyRatingDisplay';

interface PropertyRatingModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyRatingModal: React.FC<PropertyRatingModalProps> = ({
  propertyId,
  isOpen,
  onClose
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { ratings, aggregate, loading, submitRating } = usePropertyRatings(propertyId);
  const { toast } = useToast();

  const handleSubmitRating = async () => {
    if (selectedRating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must select at least 1 star to submit a review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRating(selectedRating, reviewText || undefined, isAnonymous);
      toast({
        title: "Rating submitted successfully",
        description: "Thank you for your feedback!",
      });
      setSelectedRating(0);
      setReviewText('');
      setIsAnonymous(false);
      onClose();
    } catch (error) {
      toast({
        title: "Failed to submit rating",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Property Reviews & Ratings</DialogTitle>
          <DialogDescription>
            Share your experience and read what others have to say about this property.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Rating Display */}
          {aggregate && (
            <div className="text-center py-4 border-b">
              <div className="mb-2">
                <span className="text-3xl font-bold">{aggregate.average_rating.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">out of 5</span>
              </div>
              <PropertyRatingDisplay
                averageRating={aggregate.average_rating}
                totalRatings={aggregate.total_ratings}
                size="lg"
                className="justify-center"
              />
              
              {/* Rating Distribution */}
              <div className="mt-4 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${aggregate.total_ratings > 0 
                            ? (aggregate.rating_distribution[star.toString() as keyof typeof aggregate.rating_distribution] / aggregate.total_ratings) * 100 
                            : 0}%`
                        }}
                      />
                    </div>
                    <span className="w-8 text-right">
                      {aggregate.rating_distribution[star.toString() as keyof typeof aggregate.rating_distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write a Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Write a Review</h3>
            
            {/* Star Rating Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 hover:scale-110 transition-transform"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setSelectedRating(star)}
                  >
                    <Star
                      className={cn(
                        'w-6 h-6 transition-colors',
                        (hoveredRating >= star || selectedRating >= star)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Review (Optional)</label>
              <Textarea
                placeholder="Share your experience with this property..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <label htmlFor="anonymous" className="text-sm">
                Submit anonymously
              </label>
            </div>

            <Button
              onClick={handleSubmitRating}
              disabled={isSubmitting || selectedRating === 0}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>

          {/* Existing Reviews */}
          {ratings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reviews ({ratings.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {ratings.map((rating) => (
                  <div key={rating.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={rating.user_profile?.avatar_url} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {rating.is_anonymous ? 'Anonymous User' : rating.user_profile?.full_name || 'User'}
                            </span>
                            {rating.is_verified_buyer && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(rating.created_at)}
                          </span>
                        </div>
                        
                        <PropertyRatingDisplay
                          averageRating={rating.rating}
                          totalRatings={0}
                          size="sm"
                          showCount={false}
                        />
                        
                        {rating.review_text && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {rating.review_text}
                          </p>
                        )}
                        
                        {rating.helpful_votes > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {rating.helpful_votes} people found this helpful
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-4">
              <span className="text-muted-foreground">Loading reviews...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyRatingModal;

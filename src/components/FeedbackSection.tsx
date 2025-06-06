
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

interface FeedbackSectionProps {
  propertyId: number;
}

const mockReviews = [
  {
    id: 1,
    author: "John Smith",
    rating: 5,
    date: "2024-01-15",
    comment: "Amazing property with stunning ocean views. The virtual tour was incredibly helpful in making our decision."
  },
  {
    id: 2,
    author: "Maria Garcia",
    rating: 4,
    date: "2024-01-10",
    comment: "Beautiful villa, great location. The agent was very professional and responsive to all our questions."
  },
  {
    id: 3,
    author: "David Chen",
    rating: 5,
    date: "2024-01-05",
    comment: "Perfect for our family vacation. The 3D tour feature really helped us understand the layout before visiting."
  }
];

const FeedbackSection = ({ propertyId }: FeedbackSectionProps) => {
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleSubmitReview = () => {
    console.log('Submitting review:', { rating: newRating, comment: newReview, propertyId });
    setNewReview('');
    setNewRating(5);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Property Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockReviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.author}</span>
                  <Badge variant="outline">{review.date}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              <Button variant="ghost" size="sm" className="mt-2">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer ${
                    star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setNewRating(star)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <Textarea
              placeholder="Share your experience with this property..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button onClick={handleSubmitReview} disabled={!newReview.trim()}>
            Submit Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackSection;

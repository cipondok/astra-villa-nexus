
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  response_text: string;
  response_date: string;
  is_verified: boolean;
  created_at: string;
  service: {
    service_name: string;
  };
  customer: {
    full_name: string;
  };
}

const VendorReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_reviews')
        .select(`
          *,
          service:vendor_services(service_name),
          customer:profiles(full_name)
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (reviewId: string) => {
    if (!responseText.trim()) return;

    try {
      const { error } = await supabase
        .from('vendor_reviews')
        .update({
          response_text: responseText,
          response_date: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response added successfully"
      });
      
      setRespondingTo(null);
      setResponseText('');
      fetchReviews();
    } catch (error: any) {
      console.error('Error adding response:', error);
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage customer feedback</p>
        </div>
        
        {reviews.length > 0 && (
          <Card className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600">{reviews.length} reviews</p>
            </div>
          </Card>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Reviews from customers will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{review.customer?.full_name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-600">{review.service?.service_name}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {review.review_text && (
                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300">{review.review_text}</p>
                  </div>
                )}
                
                {review.response_text ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Your Response
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.response_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {review.response_text}
                    </p>
                  </div>
                ) : (
                  <div>
                    {respondingTo === review.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write your response..."
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleResponse(review.id)}
                            disabled={!responseText.trim()}
                          >
                            Post Response
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRespondingTo(null);
                              setResponseText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRespondingTo(review.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorReviews;

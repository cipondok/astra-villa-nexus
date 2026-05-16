import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  response_text: string;
  response_date: string;
  created_at: string;
  is_verified: boolean;
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
  const [responseText, setResponseText] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

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

      // Type-safe data handling
      const typedReviews: Review[] = (data || []).map(review => {
        // Safe customer handling
        const customerData = review.customer as any;
        
        return {
          id: review.id,
          rating: review.rating,
          review_text: review.review_text,
          response_text: review.response_text,
          response_date: review.response_date,
          created_at: review.created_at,
          is_verified: review.is_verified,
          service: review.service && typeof review.service === 'object' && 'service_name' in review.service
            ? { service_name: review.service.service_name }
            : { service_name: 'Unknown Service' },
          customer: {
            full_name: customerData?.full_name || 'Anonymous'
          }
        };
      });

      setReviews(typedReviews);
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
        description: "Response posted successfully"
      });
      
      setResponseText('');
      setRespondingTo(null);
      fetchReviews();
    } catch (error: any) {
      console.error('Error posting response:', error);
      toast({
        title: "Error",
        description: "Failed to post response",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-chart-3 fill-current' : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
        <p className="text-muted-foreground">Manage and respond to customer reviews</p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No reviews yet
            </h3>
            <p className="text-muted-foreground">
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
                  <CardTitle className="text-lg">
                    {review.service.service_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {review.is_verified && (
                      <Badge variant="secondary">Verified</Badge>
                    )}
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{review.customer.full_name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-foreground">
                      {review.review_text}
                    </p>
                  </div>
                  
                  {review.response_text ? (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Your Response:</h4>
                      <p className="text-sm text-muted-foreground">
                        {review.response_text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Responded on {new Date(review.response_date).toLocaleDateString()}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorReviews;

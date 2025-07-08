import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, ThumbsUp, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';

interface FeedbackFlowProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
  serviceId?: string;
  vendorId?: string;
  onComplete?: () => void;
}

interface ServiceAspect {
  id: string;
  label: string;
  checked: boolean;
}

const FeedbackFlow = ({ 
  isOpen, 
  onClose, 
  transactionId, 
  serviceId, 
  vendorId,
  onComplete 
}: FeedbackFlowProps) => {
  const { profile } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Initial feedback state
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [showDetailed, setShowDetailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detailed feedback state
  const [serviceAspects, setServiceAspects] = useState<ServiceAspect[]>([
    { id: 'service_quality', label: 'Service quality', checked: false },
    { id: 'contactless_delivery', label: 'Contactless delivery', checked: false },
    { id: 'hygiene_standards', label: 'Hygiene standards', checked: false },
    { id: 'friendly_attitude', label: 'Friendly attitude', checked: false },
    { id: 'professional_appearance', label: 'Professional appearance', checked: false },
    { id: 'punctuality', label: 'Punctuality', checked: false },
    { id: 'instruction_following', label: 'Instruction following', checked: false },
  ]);
  const [additionalComments, setAdditionalComments] = useState('');

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const { error } = await supabase
        .from('feedback_monitoring')
        .insert({
          user_id: profile?.id,
          feedback_type: 'service_completion',
          content: feedbackData.content,
          rating: feedbackData.rating,
          priority: feedbackData.rating <= 2 ? 'high' : feedbackData.rating <= 3 ? 'medium' : 'low',
          metadata: {
            transaction_id: transactionId,
            service_id: serviceId,
            vendor_id: vendorId,
            service_aspects: feedbackData.service_aspects,
            additional_comments: feedbackData.additional_comments,
            feedback_type: 'completion_feedback'
          }
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Thank you!', 'Your feedback has been submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['feedback-monitoring'] });
      resetForm();
      onComplete?.();
      onClose();
    },
    onError: (error: any) => {
      showError('Error', 'Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    },
  });

  const resetForm = () => {
    setRating(0);
    setComment('');
    setShowDetailed(false);
    setServiceAspects(prev => prev.map(aspect => ({ ...aspect, checked: false })));
    setAdditionalComments('');
    setIsSubmitting(false);
  };

  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
  };

  const handleAspectChange = (aspectId: string, checked: boolean) => {
    setServiceAspects(prev => 
      prev.map(aspect => 
        aspect.id === aspectId ? { ...aspect, checked } : aspect
      )
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showError('Rating Required', 'Please provide a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    const selectedAspects = serviceAspects.filter(aspect => aspect.checked);
    const feedbackContent = showDetailed 
      ? `Rating: ${rating}/5\nInitial Comment: ${comment}\nLiked aspects: ${selectedAspects.map(a => a.label).join(', ')}\nAdditional comments: ${additionalComments}`
      : `Rating: ${rating}/5\nComment: ${comment}`;

    const feedbackData = {
      content: feedbackContent,
      rating,
      service_aspects: selectedAspects.map(a => a.id),
      additional_comments: additionalComments
    };

    await submitFeedbackMutation.mutateAsync(feedbackData);
  };

  const handleDismiss = () => {
    // Track dismissal for analytics
    console.log('Feedback dismissed - track for completion rate analytics');
    onClose();
  };

  const handleCompleteLater = () => {
    // Track "complete later" for analytics
    console.log('Feedback postponed - track for completion rate analytics');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-gray-900 dark:text-white">
              How was your service?
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <CardContent className="space-y-6 p-0">
          {/* Initial Rating Section */}
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Please rate your overall experience
            </p>
            
            {/* Star Rating */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="transition-colors duration-200 hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Optional Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Tell us about your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Detailed Feedback Toggle */}
          {rating > 0 && !isSubmitting && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowDetailed(!showDetailed)}
                className="w-full justify-between text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  What did you like about the service?
                </span>
                {showDetailed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {/* Detailed Feedback Section */}
              {showDetailed && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 gap-3">
                    {serviceAspects.map((aspect) => (
                      <div key={aspect.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={aspect.id}
                          checked={aspect.checked}
                          onCheckedChange={(checked) => 
                            handleAspectChange(aspect.id, checked as boolean)
                          }
                          className="border-gray-300 dark:border-gray-500"
                        />
                        <label
                          htmlFor={aspect.id}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          {aspect.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <Textarea
                    placeholder="Any additional comments?"
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    className="bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500"
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCompleteLater}
              className="flex-1"
              disabled={isSubmitting}
            >
              Complete Later
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackFlow;
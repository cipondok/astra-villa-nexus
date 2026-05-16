import React, { useState, useEffect } from 'react';
import FeedbackFlow from './FeedbackFlow';

interface FeedbackTriggerProps {
  transactionId?: string;
  serviceId?: string;
  vendorId?: string;
  isTransactionComplete?: boolean;
  onFeedbackComplete?: () => void;
}

const FeedbackTrigger = ({ 
  transactionId, 
  serviceId, 
  vendorId,
  isTransactionComplete = false,
  onFeedbackComplete 
}: FeedbackTriggerProps) => {
  const [showFeedbackFlow, setShowFeedbackFlow] = useState(false);
  const [hasShownFeedback, setHasShownFeedback] = useState(false);

  // Trigger feedback flow when transaction is completed
  useEffect(() => {
    if (isTransactionComplete && !hasShownFeedback && transactionId) {
      // Add a small delay to ensure transaction completion UI has settled
      const timer = setTimeout(() => {
        setShowFeedbackFlow(true);
        setHasShownFeedback(true);
        
        // Track feedback prompt display for analytics
        console.log('Feedback prompt displayed for transaction:', transactionId);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isTransactionComplete, hasShownFeedback, transactionId]);

  const handleFeedbackComplete = () => {
    setShowFeedbackFlow(false);
    onFeedbackComplete?.();
    
    // Track feedback completion for analytics
    console.log('Feedback completed for transaction:', transactionId);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackFlow(false);
    
    // Track feedback dismissal for analytics
    console.log('Feedback dismissed for transaction:', transactionId);
  };

  return (
    <FeedbackFlow
      isOpen={showFeedbackFlow}
      onClose={handleFeedbackClose}
      onComplete={handleFeedbackComplete}
      transactionId={transactionId}
      serviceId={serviceId}
      vendorId={vendorId}
    />
  );
};

export default FeedbackTrigger;
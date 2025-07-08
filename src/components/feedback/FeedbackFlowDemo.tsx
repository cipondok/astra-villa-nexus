import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Star, PlayCircle } from 'lucide-react';
import FeedbackFlow from './FeedbackFlow';
import FeedbackTrigger from './FeedbackTrigger';

const FeedbackFlowDemo = () => {
  const [showFeedbackFlow, setShowFeedbackFlow] = useState(false);
  const [demoTransactionComplete, setDemoTransactionComplete] = useState(false);
  const [feedbackCompleted, setFeedbackCompleted] = useState(false);

  const handleCompleteTransaction = () => {
    setDemoTransactionComplete(true);
    setFeedbackCompleted(false);
  };

  const handleManualFeedback = () => {
    setShowFeedbackFlow(true);
  };

  const handleFeedbackComplete = () => {
    setFeedbackCompleted(true);
    setDemoTransactionComplete(false);
  };

  const resetDemo = () => {
    setDemoTransactionComplete(false);
    setFeedbackCompleted(false);
    setShowFeedbackFlow(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Feedback Flow Demo
          </CardTitle>
          <CardDescription>
            Test the feedback system with automatic triggers and manual activation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Transaction Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Transaction Status</h3>
            <div className="flex items-center gap-4">
              <Badge 
                variant={demoTransactionComplete ? "default" : "secondary"}
                className="flex items-center gap-2"
              >
                {demoTransactionComplete ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                {demoTransactionComplete ? 'Completed' : 'In Progress'}
              </Badge>
              
              {feedbackCompleted && (
                <Badge variant="outline" className="flex items-center gap-2 text-green-600 border-green-600">
                  <Star className="h-4 w-4" />
                  Feedback Submitted
                </Badge>
              )}
            </div>
          </div>

          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleCompleteTransaction}
              disabled={demoTransactionComplete}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {demoTransactionComplete ? 'Transaction Completed' : 'Complete Transaction'}
            </Button>
            
            <Button 
              onClick={handleManualFeedback}
              variant="outline"
            >
              Manual Feedback
            </Button>
            
            <Button 
              onClick={resetDemo}
              variant="outline"
            >
              Reset Demo
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✓ Implemented Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Auto-trigger on transaction completion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  1-5 star rating system
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Optional detailed feedback
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Service aspect checkboxes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Non-blocking design (dismissible)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Analytics tracking ready
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">📊 Analytics Tracked</h4>
              <ul className="space-y-2 text-sm">
                <li>• Feedback completion rates</li>
                <li>• Rating distribution</li>
                <li>• Most appreciated service aspects</li>
                <li>• Average rating trends</li>
                <li>• Feedback prompt dismissal rates</li>
                <li>• Time to feedback completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Feedback Trigger */}
      <FeedbackTrigger
        transactionId="demo-transaction-123"
        serviceId="demo-service-456"
        vendorId="demo-vendor-789"
        isTransactionComplete={demoTransactionComplete}
        onFeedbackComplete={handleFeedbackComplete}
      />

      {/* Manual Feedback Flow */}
      <FeedbackFlow
        isOpen={showFeedbackFlow}
        onClose={() => setShowFeedbackFlow(false)}
        onComplete={() => {
          setShowFeedbackFlow(false);
          setFeedbackCompleted(true);
        }}
        transactionId="manual-demo-123"
        serviceId="manual-service-456"
        vendorId="manual-vendor-789"
      />
    </div>
  );
};

export default FeedbackFlowDemo;
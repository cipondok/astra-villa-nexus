import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  TrendingDown, 
  Home, 
  MessageSquare, 
  Calendar,
  BarChart3,
  Gift,
  Shield,
  Star,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (subscribed: boolean) => void;
  trigger?: 'signup' | 'search' | 'favorite' | 'manual';
}

const NOTIFICATION_BENEFITS = [
  {
    icon: TrendingDown,
    title: 'Price Drop Alerts',
    description: 'Get notified when properties you like drop in price',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10'
  },
  {
    icon: Home,
    title: 'New Property Matches',
    description: 'Be first to know about properties matching your criteria',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10'
  },
  {
    icon: MessageSquare,
    title: 'Message Alerts',
    description: 'Never miss a message from agents or property owners',
    color: 'text-accent-foreground',
    bgColor: 'bg-accent/10'
  },
  {
    icon: Calendar,
    title: 'Viewing Reminders',
    description: 'Automatic reminders for scheduled property viewings',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10'
  },
  {
    icon: BarChart3,
    title: 'Market Insights',
    description: 'Weekly market updates and investment opportunities',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  }
];

const INCENTIVE_REWARD = {
  astraTokens: 50,
  badge: 'Early Adopter',
  benefit: 'Priority support for 30 days'
};

export const NotificationPermissionDialog: React.FC<NotificationPermissionDialogProps> = ({
  open,
  onOpenChange,
  onComplete,
  trigger = 'manual'
}) => {
  const { user } = useAuth();
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    subscribe, 
    isLoading,
    updatePreferences
  } = usePushNotifications();
  
  const [step, setStep] = useState<'benefits' | 'preferences' | 'success'>('benefits');
  const [selectedTypes, setSelectedTypes] = useState({
    priceDrops: true,
    newMatches: true,
    messages: true,
    viewings: true,
    marketUpdates: false
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);

  // Track dialog impression
  useEffect(() => {
    if (open && user) {
      trackAnalytics('permission_dialog_shown', { trigger });
    }
  }, [open, user, trigger]);

  const handleEnable = async () => {
    if (!gdprConsent) return;
    
    trackAnalytics('permission_requested', { trigger });
    
    const success = await subscribe();
    
    if (success) {
      // Save preferences
      await updatePreferences({
        priceDrops: selectedTypes.priceDrops,
        newMatches: selectedTypes.newMatches,
        messageAlerts: selectedTypes.messages,
        marketUpdates: selectedTypes.marketUpdates,
        push_enabled: true
      });
      
      // Award incentive
      await awardIncentive();
      
      trackAnalytics('permission_granted', { trigger, selectedTypes });
      setStep('success');
    } else {
      trackAnalytics('permission_denied', { trigger });
    }
  };

  const handleDecline = () => {
    setShowDeclineReason(true);
  };

  const handleConfirmDecline = async (reason: string) => {
    trackAnalytics('permission_declined', { trigger, reason });
    onOpenChange(false);
    onComplete?.(false);
  };

  const handleComplete = () => {
    onOpenChange(false);
    onComplete?.(true);
  };

  const awardIncentive = async () => {
    if (!user) return;
    
    try {
      // Award ASTRA tokens
      const { error } = await supabase.from('astra_token_transactions').insert({
        user_id: user.id,
        amount: INCENTIVE_REWARD.astraTokens,
        transaction_type: 'reward',
        description: 'Push notification opt-in reward',
        reference_type: 'notification_optin',
        status: 'completed'
      });
      
      if (error) {
        console.error('Failed to insert token transaction:', error);
      }
      
    } catch (error) {
      console.error('Failed to award incentive:', error);
    }
  };

  const trackAnalytics = async (event: string, data: any) => {
    try {
      // Log analytics event - table may not exist yet
      console.log('Notification analytics:', event, data);
      
      // Try to save to activity_logs as fallback
      if (user?.id) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          activity_type: 'notification_' + event,
          activity_description: `Notification ${event}: ${JSON.stringify(data)}`,
          metadata: data
        });
      }
    } catch (error) {
      console.log('Analytics tracking:', event, data);
    }
  };

  const toggleType = (type: keyof typeof selectedTypes) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications Not Supported</DialogTitle>
            <DialogDescription>
              Your browser doesn't support push notifications. Try using Chrome, Firefox, or Edge for the best experience.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'benefits' && !showDeclineReason && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Gift className="h-3 w-3 mr-1" />
                    +{INCENTIVE_REWARD.astraTokens} ASTRA Tokens
                  </Badge>
                </div>
                <DialogTitle className="text-xl">Stay Updated on Properties</DialogTitle>
                <DialogDescription>
                  Enable notifications to never miss out on your dream property
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 my-4">
                {NOTIFICATION_BENEFITS.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${benefit.bgColor}`}>
                      <benefit.icon className={`h-4 w-4 ${benefit.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedTypes[
                            benefit.title === 'Price Drop Alerts' ? 'priceDrops' :
                            benefit.title === 'New Property Matches' ? 'newMatches' :
                            benefit.title === 'Message Alerts' ? 'messages' :
                            benefit.title === 'Viewing Reminders' ? 'viewings' :
                            'marketUpdates'
                          ]}
                          onCheckedChange={() => toggleType(
                            benefit.title === 'Price Drop Alerts' ? 'priceDrops' :
                            benefit.title === 'New Property Matches' ? 'newMatches' :
                            benefit.title === 'Message Alerts' ? 'messages' :
                            benefit.title === 'Viewing Reminders' ? 'viewings' :
                            'marketUpdates'
                          )}
                        />
                        <span className="font-medium text-sm">{benefit.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Incentive Banner */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-chart-3 fill-chart-3" />
                  <span className="font-medium text-sm">Enable Now & Get Rewards!</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">
                    <Gift className="h-3 w-3 mr-1" />
                    {INCENTIVE_REWARD.astraTokens} ASTRA Tokens
                  </Badge>
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    {INCENTIVE_REWARD.badge} Badge
                  </Badge>
                </div>
              </div>

              {/* GDPR Consent */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs">
                <Checkbox
                  id="gdpr-consent"
                  checked={gdprConsent}
                  onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
                />
                <label htmlFor="gdpr-consent" className="text-muted-foreground cursor-pointer">
                  I consent to receive push notifications. I understand I can customize or 
                  disable notifications anytime in settings. View our{' '}
                  <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
                </label>
              </div>

              <DialogFooter className="mt-4 gap-2">
                <Button variant="ghost" onClick={handleDecline}>
                  Maybe Later
                </Button>
                <Button 
                  onClick={handleEnable} 
                  disabled={!gdprConsent || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Enabling...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      Enable Notifications
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {showDeclineReason && (
            <motion.div
              key="decline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle>Help Us Improve</DialogTitle>
                <DialogDescription>
                  We'd love to know why you're not interested in notifications
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 my-4">
                {[
                  'I get too many notifications already',
                  'Not interested in real estate alerts',
                  'Privacy concerns',
                  'I\'ll enable them later',
                  'Other reason'
                ].map((reason) => (
                  <Button
                    key={reason}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleConfirmDecline(reason)}
                  >
                    {reason}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowDeclineReason(false)}
              >
                Go Back
              </Button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-chart-1/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-chart-1" />
              </div>
              
              <DialogTitle className="text-xl mb-2">You're All Set! 🎉</DialogTitle>
              <DialogDescription className="mb-4">
                Notifications enabled successfully. You'll now receive alerts for properties that matter to you.
              </DialogDescription>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border mb-4">
                <p className="text-sm font-medium mb-2">Rewards Earned:</p>
                <div className="flex justify-center gap-3">
                  <Badge className="gap-1">
                    <Gift className="h-3 w-3" />
                    +{INCENTIVE_REWARD.astraTokens} ASTRA
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {INCENTIVE_REWARD.badge}
                  </Badge>
                </div>
              </div>

              <Button onClick={handleComplete} className="w-full">
                Start Exploring
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionDialog;

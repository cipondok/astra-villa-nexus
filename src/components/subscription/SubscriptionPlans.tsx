import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Building2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { useMidtransPayment } from '@/hooks/useMidtransPayment';
import { formatIDR } from '@/utils/currency';

const PLAN_ICONS: Record<string, React.ElementType> = {
  free: Zap,
  pro: Crown,
  enterprise: Building2
};

const PLAN_COLORS: Record<string, string> = {
  free: 'from-muted-foreground to-muted-foreground/80',
  pro: 'from-primary to-accent',
  enterprise: 'from-accent to-chart-5'
};

export const SubscriptionPlans: React.FC = () => {
  const { plans, subscription, subscribe, isLoading, currentPlan } = useSubscription();
  const { createPayment } = useMidtransPayment();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planSlug: string) => {
    setProcessingPlan(planSlug);
    
    try {
      const result = await subscribe(planSlug);
      
      if (result.success && result.token) {
        // Open Midtrans Snap
        await createPayment({
          orderId: `SUB-${Date.now()}`,
          amount: plans.find(p => p.slug === planSlug)?.price_monthly || 0,
          customerDetails: {}
        });
      }
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Select the perfect plan for your property business</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = PLAN_ICONS[plan.slug] || Zap;
          const isCurrentPlan = currentPlan?.slug === plan.slug;
          const isPro = plan.slug === 'pro';

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col ${isPro ? 'border-primary shadow-lg scale-105' : ''}`}>
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-br ${PLAN_COLORS[plan.slug]} flex items-center justify-center mb-3`}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold">
                      {plan.price_monthly === 0 ? (
                        'Free'
                      ) : (
                        formatIDR(plan.price_monthly)
                      )}
                    </div>
                    {plan.price_monthly > 0 && (
                      <p className="text-sm text-muted-foreground">/month</p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.listing_limit && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-center">
                        <span className="font-semibold">{plan.listing_limit}</span> listings/month
                      </p>
                    </div>
                  )}
                  {!plan.listing_limit && plan.price_monthly > 0 && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-center font-medium text-primary">
                        Unlimited listings
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : isPro ? 'default' : 'secondary'}
                    disabled={isCurrentPlan || isLoading || !!processingPlan}
                    onClick={() => handleSubscribe(plan.slug)}
                  >
                    {processingPlan === plan.slug ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : subscription && plan.price_monthly > (currentPlan?.price_monthly || 0) ? (
                      'Upgrade'
                    ) : subscription && plan.price_monthly < (currentPlan?.price_monthly || 0) ? (
                      'Downgrade'
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>All prices include 11% PPN (VAT). Cancel anytime.</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

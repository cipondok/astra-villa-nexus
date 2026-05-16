import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useSubscriptionType, SubscriptionType } from '@/hooks/useSubscriptionType';
import { useNavigate } from 'react-router-dom';

const PLAN_RANK: Record<SubscriptionType, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

const PLAN_LABEL: Record<string, string> = {
  pro: 'Pro',
  enterprise: 'Enterprise',
};

interface FeatureGateProps {
  requiredPlan: 'pro' | 'enterprise';
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ requiredPlan, children }) => {
  const { subscriptionType, isLoading } = useSubscriptionType();
  const navigate = useNavigate();

  if (isLoading) return null;

  const hasAccess = PLAN_RANK[subscriptionType] >= PLAN_RANK[requiredPlan];

  if (hasAccess) return <>{children}</>;

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">
            Upgrade to {PLAN_LABEL[requiredPlan]} to unlock this feature
          </h3>
          <p className="text-sm text-muted-foreground">
            This feature requires a {PLAN_LABEL[requiredPlan]} plan or higher.
          </p>
        </div>
        <Button onClick={() => navigate('/subscription')}>
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureGate;

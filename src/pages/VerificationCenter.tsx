import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  ShieldCheck, 
  Crown, 
  Gem,
  ArrowLeft,
  Award,
  TrendingUp,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { VerificationProgress } from '@/components/verification/VerificationProgress';
import { VerificationBadge, type BadgeTier } from '@/components/verification/VerificationBadge';

const VerificationCenter: React.FC = () => {
  const navigate = useNavigate();

  const badgeTiers: { tier: BadgeTier; points: string; benefits: string[] }[] = [
    {
      tier: 'bronze',
      points: '0-24 points',
      benefits: ['Basic listing access', 'Standard messaging', 'Property saves']
    },
    {
      tier: 'silver',
      points: '25-49 points',
      benefits: ['Priority listing visibility', 'Direct WhatsApp contact', 'Enhanced profile badge']
    },
    {
      tier: 'gold',
      points: '50-74 points',
      benefits: ['Featured listings', 'Analytics dashboard', 'API access', 'Priority support']
    },
    {
      tier: 'platinum',
      points: '75-89 points',
      benefits: ['Exclusive deals access', 'VIP networking', 'Advanced analytics', 'Dedicated account manager']
    },
    {
      tier: 'diamond',
      points: '90-100 points',
      benefits: ['All platinum benefits', 'Early feature access', 'Custom branding', 'Partner program eligibility']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  Verification Center
                </h1>
                <p className="text-sm text-muted-foreground">
                  Build trust and unlock premium features
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              My Progress
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Award className="h-4 w-4" />
              Badge Tiers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Complete verification steps to increase your trust score and unlock premium features. 
                Higher trust scores lead to more visibility and buyer confidence.
              </AlertDescription>
            </Alert>

            <VerificationProgress />
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold mb-2">Verified Member Badge System</h2>
              <p className="text-muted-foreground">
                Earn badges by completing verification levels. Higher tiers unlock more benefits.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {badgeTiers.map((badge, index) => (
                <motion.div
                  key={badge.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center pb-2">
                      <div className="flex justify-center mb-4">
                        <VerificationBadge tier={badge.tier} size="lg" showTooltip={false} />
                      </div>
                      <CardTitle className="capitalize">{badge.tier} Member</CardTitle>
                      <p className="text-sm text-muted-foreground">{badge.points}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {badge.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Time Investment Guide */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Time Investment Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">~3 min</div>
                    <div className="text-sm text-muted-foreground">Level 1: Basic</div>
                    <div className="text-xs mt-1">Email & Phone verification</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">~7 min</div>
                    <div className="text-sm text-muted-foreground">Level 2: Enhanced</div>
                    <div className="text-xs mt-1">Social + Document upload</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">~8 min</div>
                    <div className="text-sm text-muted-foreground">Level 3: Professional</div>
                    <div className="text-xs mt-1">License + Bank details</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">~15 min</div>
                    <div className="text-sm text-muted-foreground">Level 4: Premium</div>
                    <div className="text-xs mt-1">Video call + References</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default VerificationCenter;

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  ShieldCheck,
  Crown,
  Gem,
  Star,
  TrendingUp,
  Award,
  ChevronRight,
  Mail,
  Phone,
  Share2,
  FileText,
  Building2,
  CreditCard,
  Video,
  Users,
  CheckCircle2,
  Clock,
  Upload,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { VerificationBadge, type BadgeTier } from './VerificationBadge';
import { VerificationLevelCard, verificationLevels, type LevelConfig } from './VerificationLevelCard';

interface UserVerification {
  current_level: string;
  badge_tier: BadgeTier;
  trust_score: number;
  email_verified: boolean;
  phone_verified: boolean;
  social_media_linked: string[];
  id_document_uploaded: boolean;
  id_document_verified: boolean;
  license_verified: boolean;
  bank_details_verified: boolean;
  video_verification_completed: boolean;
  references_verified: number;
}

interface VerificationProgressProps {
  userId?: string;
  className?: string;
}

export const VerificationProgress: React.FC<VerificationProgressProps> = ({
  userId,
  className
}) => {
  const { toast } = useToast();
  const [verification, setVerification] = useState<UserVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVerification();
  }, [userId]);

  const fetchVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching verification:', error);
      }

      if (data) {
        setVerification({
          ...data,
          social_media_linked: data.social_media_linked as string[] || []
        });
      } else {
        // Create initial verification record
        const { data: newData, error: insertError } = await supabase
          .from('user_verifications')
          .insert({ user_id: targetUserId })
          .select()
          .single();
          
        if (!insertError && newData) {
          setVerification({
            ...newData,
            social_media_linked: newData.social_media_linked as string[] || []
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Simulating email verification (in production, this would send an email)
      const { error } = await supabase
        .from('user_verifications')
        .update({ email_verified: true })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Email Verified!',
        description: 'Your email has been successfully verified.',
      });

      setActiveDialog(null);
      fetchVerification();
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_verifications')
        .update({ phone_verified: true })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Phone Verified!',
        description: 'Your phone number has been successfully verified.',
      });

      setActiveDialog(null);
      setPhoneNumber('');
      fetchVerification();
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkSocial = async (platform: string) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentLinked = verification?.social_media_linked || [];
      if (!currentLinked.includes(platform)) {
        const { error } = await supabase
          .from('user_verifications')
          .update({ social_media_linked: [...currentLinked, platform] })
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: `${platform} Linked!`,
          description: `Your ${platform} account has been linked.`,
        });

        fetchVerification();
      }
    } catch (error: any) {
      toast({
        title: 'Link Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLevelIndex = () => {
    if (!verification) return 0;
    if (verification.video_verification_completed && verification.references_verified >= 2) return 3;
    if (verification.license_verified || verification.bank_details_verified) return 2;
    if (verification.id_document_verified || (verification.social_media_linked?.length || 0) > 0) return 1;
    return 0;
  };

  const getLevelsWithStatus = (): LevelConfig[] => {
    if (!verification) return verificationLevels;

    return verificationLevels.map((level, index) => ({
      ...level,
      steps: level.steps.map(step => ({
        ...step,
        completed: getStepCompleted(step.id)
      }))
    }));
  };

  const getStepCompleted = (stepId: string): boolean => {
    if (!verification) return false;
    
    switch (stepId) {
      case 'email': return verification.email_verified;
      case 'phone': return verification.phone_verified;
      case 'social': return (verification.social_media_linked?.length || 0) > 0;
      case 'document': return verification.id_document_verified;
      case 'license': return verification.license_verified;
      case 'bank': return verification.bank_details_verified;
      case 'video': return verification.video_verification_completed;
      case 'references': return verification.references_verified >= 2;
      default: return false;
    }
  };

  const handleStartVerification = (stepId: string) => {
    setActiveDialog(stepId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentLevelIndex = getCurrentLevelIndex();
  const levelsWithStatus = getLevelsWithStatus();
  const trustScore = verification?.trust_score || 0;
  const badgeTier = verification?.badge_tier || 'bronze';

  return (
    <div className={cn('space-y-6', className)}>
      {/* Trust Score Overview */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <VerificationBadge tier={badgeTier} size="lg" showLabel />
                <div>
                  <h3 className="text-lg font-semibold">Trust Score</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete verification to increase your trust score
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{trustScore}</div>
              <div className="text-sm text-muted-foreground">/100 points</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{trustScore}%</span>
            </div>
            <Progress value={trustScore} className="h-3" />
          </div>

          {/* Badge Tiers Preview */}
          <div className="mt-6 flex items-center justify-between">
            {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[]).map((tier, index) => (
              <div 
                key={tier} 
                className={cn(
                  'flex flex-col items-center gap-1 transition-opacity',
                  tier === badgeTier ? 'opacity-100' : 'opacity-40'
                )}
              >
                <VerificationBadge tier={tier} size="sm" showTooltip />
                <span className="text-xs capitalize">{tier}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Levels */}
      <div className="grid gap-4 md:grid-cols-2">
        {levelsWithStatus.map((level, index) => (
          <VerificationLevelCard
            key={level.level}
            config={level}
            isCurrentLevel={index === currentLevelIndex}
            isUnlocked={index <= currentLevelIndex}
            onStartVerification={handleStartVerification}
          />
        ))}
      </div>

      {/* Verification Dialogs */}
      <Dialog open={activeDialog === 'email'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Verify Email Address
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Click below to verify your email address. In production, you would receive a verification link.
            </p>
            <Button onClick={handleVerifyEmail} disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'phone'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Verify Phone Number
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+62 812 3456 7890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button onClick={handleVerifyPhone} disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Phone
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'social'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Link Social Media
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Connect your social media accounts for enhanced verification.
            </p>
            <div className="grid gap-2">
              {['Instagram', 'LinkedIn', 'Facebook'].map((platform) => (
                <Button
                  key={platform}
                  variant={verification?.social_media_linked?.includes(platform) ? 'secondary' : 'outline'}
                  onClick={() => handleLinkSocial(platform)}
                  disabled={isSubmitting || verification?.social_media_linked?.includes(platform)}
                  className="justify-between"
                >
                  <span>{platform}</span>
                  {verification?.social_media_linked?.includes(platform) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'document'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload ID Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Upload a clear photo of your ID card (KTP), driver's license (SIM), or passport.
            </p>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload
              </p>
            </div>
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationProgress;

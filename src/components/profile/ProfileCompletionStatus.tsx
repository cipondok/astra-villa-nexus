import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, Circle, Sparkles, Gift, Trophy, 
  Target, ArrowRight, Star, Shield, Crown, Gem
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MembershipLevel, MEMBERSHIP_LEVELS } from '@/types/membership';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionStatusProps {
  profile: {
    full_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    company_name?: string | null;
    business_address?: string | null;
  } | null;
  membershipLevel: MembershipLevel;
  verificationStatus: string;
  language: 'en' | 'id' | 'zh' | 'ja' | 'ko';
}

interface CompletionStep {
  key: string;
  label: { en: string; id: string };
  isComplete: boolean;
  points: number;
}

const NEXT_LEVEL_MAP: Record<MembershipLevel, MembershipLevel | null> = {
  basic: 'verified',
  verified: 'vip',
  vip: 'gold',
  gold: 'platinum',
  platinum: 'diamond',
  diamond: null
};

export const ProfileCompletionStatus: React.FC<ProfileCompletionStatusProps> = ({
  profile,
  membershipLevel,
  verificationStatus,
  language
}) => {
  const navigate = useNavigate();
  const levelConfig = MEMBERSHIP_LEVELS[membershipLevel];
  const nextLevel = NEXT_LEVEL_MAP[membershipLevel];
  const nextLevelConfig = nextLevel ? MEMBERSHIP_LEVELS[nextLevel] : null;

  const text = {
    en: {
      profileCompletion: 'Profile Completion',
      complete: 'Complete',
      nextTarget: 'Next Target',
      benefits: 'Your Benefits',
      congratulations: '🎉 Congratulations!',
      profileComplete: 'Your profile is complete!',
      almostThere: 'Almost there!',
      completeSteps: 'Complete these steps to unlock more features',
      upgradeTo: 'Upgrade to',
      currentLevel: 'Current Level',
      maxLevel: 'You\'ve reached the highest level!'
    },
    id: {
      profileCompletion: 'Kelengkapan Profil',
      complete: 'Selesai',
      nextTarget: 'Target Selanjutnya',
      benefits: 'Keuntungan Anda',
      congratulations: '🎉 Selamat!',
      profileComplete: 'Profil Anda sudah lengkap!',
      almostThere: 'Hampir selesai!',
      completeSteps: 'Selesaikan langkah ini untuk membuka fitur lebih banyak',
      upgradeTo: 'Upgrade ke',
      currentLevel: 'Level Saat Ini',
      maxLevel: 'Anda sudah mencapai level tertinggi!'
    }
  };

  const t = text[language] || text.en;

  // Calculate completion steps
  const steps: CompletionStep[] = [
    {
      key: 'name',
      label: { en: 'Add your name', id: 'Tambahkan nama' },
      isComplete: !!profile?.full_name,
      points: 20
    },
    {
      key: 'phone',
      label: { en: 'Add phone number', id: 'Tambahkan nomor telepon' },
      isComplete: !!profile?.phone,
      points: 20
    },
    {
      key: 'avatar',
      label: { en: 'Upload profile photo', id: 'Upload foto profil' },
      isComplete: !!profile?.avatar_url,
      points: 25
    },
    {
      key: 'bio',
      label: { en: 'Write a short bio', id: 'Tulis bio singkat' },
      isComplete: !!profile?.bio,
      points: 15
    },
    {
      key: 'address',
      label: { en: 'Add your address', id: 'Tambahkan alamat' },
      isComplete: !!profile?.business_address,
      points: 20
    }
  ];

  const completedSteps = steps.filter(s => s.isComplete).length;
  const totalSteps = steps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  const isProfileComplete = completionPercentage === 100;

  return (
    <div className="space-y-4">
      {/* Completion Progress Card */}
      <Card className="border-border overflow-hidden">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">{t.profileCompletion}</span>
            </div>
            <Badge 
              variant={isProfileComplete ? "default" : "outline"}
              className={cn(
                "text-xs",
                isProfileComplete && "bg-chart-1 hover:bg-chart-1/90"
              )}
            >
              {completionPercentage}% {t.complete}
            </Badge>
          </div>

          {/* Progress Bar */}
          <Progress 
            value={completionPercentage} 
            className="h-2 mb-4"
            multiColor
          />

          {/* Congratulations or Steps */}
          {isProfileComplete ? (
            <div className="bg-chart-1/10 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-chart-1 mb-1">
                {t.congratulations}
              </p>
              <p className="text-sm text-chart-1/80">
                {t.profileComplete}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">{t.completeSteps}</p>
              {steps.map((step) => (
                <div 
                  key={step.key}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-colors",
                    step.isComplete 
                      ? "bg-chart-1/10" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  {step.isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-chart-1 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm flex-1",
                    step.isComplete && "line-through text-muted-foreground"
                  )}>
                    {step.label[language]}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    +{step.points} XP
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Target Card */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-gold-primary" />
            <span className="font-semibold text-sm">{t.nextTarget}</span>
          </div>

          {/* Current Level */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                levelConfig.bgColor
              )}>
                <span className="text-sm">{levelConfig.icon}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.currentLevel}</p>
                <p className={cn("font-semibold text-sm", levelConfig.color)}>
                  {levelConfig.label}
                </p>
              </div>
            </div>
            {verificationStatus === 'verified' && (
              <Badge className="bg-chart-4 text-primary-foreground text-[10px]">
                <Shield className="h-3 w-3 mr-0.5" />
                Verified
              </Badge>
            )}
          </div>

          {/* Next Level */}
          {nextLevelConfig ? (
            <button
              onClick={() => navigate('/membership')}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.02]",
                nextLevelConfig.bgColor,
                "border",
                nextLevelConfig.borderColor
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center bg-background/50"
                )}>
                  <span className="text-sm">{nextLevelConfig.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">{t.upgradeTo}</p>
                  <p className={cn("font-semibold text-sm", nextLevelConfig.color)}>
                    {nextLevelConfig.label}
                  </p>
                </div>
              </div>
              <ArrowRight className={cn("h-5 w-5", nextLevelConfig.color)} />
            </button>
          ) : (
            <div className="p-3 rounded-lg bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 text-center">
              <Gem className="h-6 w-6 mx-auto mb-1 text-accent" />
              <p className="text-sm font-medium text-accent">
                {t.maxLevel}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{t.benefits}</span>
            <Badge variant="outline" className={cn("text-[10px]", levelConfig.color)}>
              {levelConfig.shortLabel}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {levelConfig.benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
              >
                <Star className="h-3 w-3 text-chart-3 shrink-0" />
                <span className="text-xs truncate">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletionStatus;

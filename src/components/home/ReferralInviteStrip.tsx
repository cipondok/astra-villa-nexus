import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Gift, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';

export default function ReferralInviteStrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="w-full bg-gradient-to-r from-primary/[0.06] via-chart-4/[0.04] to-primary/[0.06] border-y border-border/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-chart-4/10 border border-chart-4/15 shrink-0">
              <Gift className="h-4 w-4 text-chart-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user ? t('homeComponents.inviteEarnRewards') : t('homeComponents.joinExplorers')}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user ? t('homeComponents.shareReferral') : t('homeComponents.getPersonalized')}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{t('homeComponents.earnPerReferral')}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5 touch-press"
                  onClick={() => navigate('/referral')}
                >
                  {t('homeComponents.inviteFriends')}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="h-8 text-xs font-semibold touch-press"
                onClick={() => navigate('/auth')}
              >
                {t('homeComponents.getStarted')}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

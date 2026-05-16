import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/i18n/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Building2, Sparkles, TrendingUp, Crown } from 'lucide-react';

interface PropertyLimitModalProps {
  open: boolean;
  onClose: () => void;
  currentCount: number;
  limit: number;
}

const PropertyLimitModal = ({ open, onClose, currentCount, limit }: PropertyLimitModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const usagePercent = limit > 0 ? (currentCount / limit) * 100 : 100;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
              {t('upgradeTriggers.propertyLimit.limitedOffer')}
            </Badge>
          </div>
          <DialogTitle className="text-xl mt-3">{t('upgradeTriggers.propertyLimit.title')}</DialogTitle>
          <DialogDescription className="text-base">{t('upgradeTriggers.propertyLimit.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('upgradeTriggers.propertyLimit.currentUsage')}</span>
              <span className="font-medium">{currentCount}/{limit} {t('upgradeTriggers.propertyLimit.properties')}</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>

          <p className="text-sm text-muted-foreground">{t('upgradeTriggers.propertyLimit.description')}</p>

          <div className="space-y-2 bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-chart-3" />
              {t('upgradeTriggers.propertyLimit.benefits')}
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t('upgradeTriggers.propertyLimit.benefit1')}
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                {t('upgradeTriggers.propertyLimit.benefit2')}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t('upgradeTriggers.propertyLimit.benefit3')}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t('upgradeTriggers.propertyLimit.benefit4')}
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('upgradeTriggers.propertyLimit.maybeLater')}
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto gap-2">
            <Crown className="h-4 w-4" />
            {t('upgradeTriggers.propertyLimit.upgradeNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyLimitModal;

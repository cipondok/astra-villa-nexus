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
import { useTranslation } from '@/i18n/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Eye, Flame, Users, Lock, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ViewMilestoneModalProps {
  open: boolean;
  onClose: () => void;
  viewCount: number;
}

const ViewMilestoneModal = ({ open, onClose, viewCount }: ViewMilestoneModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <motion.div 
               className="p-2 rounded-full bg-chart-5/10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Flame className="h-5 w-5 text-chart-5" />
            </motion.div>
            <Badge variant="destructive" className="animate-pulse">
              {t('upgradeTriggers.viewMilestone.urgency')}
            </Badge>
          </div>
          <DialogTitle className="text-xl mt-3">{t('upgradeTriggers.viewMilestone.title')}</DialogTitle>
          <DialogDescription className="text-base">
            <span className="text-2xl font-bold text-primary">{viewCount}</span> {t('upgradeTriggers.viewMilestone.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <div className="space-y-2 blur-sm select-none pointer-events-none">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/20" />
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-primary/20 rounded" />
                    <div className="h-2 w-16 bg-muted-foreground/20 rounded mt-1" />
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
              <div className="text-center">
                <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{t('upgradeTriggers.viewMilestone.hiddenViewers')}</p>
                <p className="text-xs text-muted-foreground">{viewCount} {t('upgradeTriggers.viewMilestone.viewerInfo')}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{t('upgradeTriggers.viewMilestone.description')}</p>

          <div className="space-y-2 bg-primary/5 rounded-lg p-3 border border-primary/10">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              {t('upgradeTriggers.viewMilestone.unlockWith')}
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-primary" />
                {t('upgradeTriggers.viewMilestone.benefit1')}
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                {t('upgradeTriggers.viewMilestone.benefit2')}
              </li>
              <li className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-primary" />
                {t('upgradeTriggers.viewMilestone.benefit3')}
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto text-muted-foreground">
            {t('upgradeTriggers.viewMilestone.maybeLater')}
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-chart-5 to-destructive hover:from-chart-5/90 hover:to-destructive/90">
            <Eye className="h-4 w-4" />
            {t('upgradeTriggers.viewMilestone.upgradeNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMilestoneModal;

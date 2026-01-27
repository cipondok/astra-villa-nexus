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
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Eye, Flame, Users, Lock, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const text = {
  en: {
    title: "Your Listing is HOT! 🔥",
    subtitle: "views and counting",
    description: "People are interested in your property! Upgrade to Pro to see exactly who's viewing and get their contact details.",
    hiddenViewers: "Hidden Viewer Details",
    viewerInfo: "potential buyers browsing your listing",
    unlockWith: "Unlock with Pro",
    benefit1: "See visitor demographics & behavior",
    benefit2: "Get contact details of interested buyers",
    benefit3: "Real-time notification when someone views",
    upgradeNow: "See Who's Interested",
    maybeLater: "Continue with Limited View",
    urgency: "2 hours left at this price"
  },
  id: {
    title: "Listing Anda Sedang RAMAI! 🔥",
    subtitle: "kunjungan dan terus bertambah",
    description: "Orang-orang tertarik dengan properti Anda! Upgrade ke Pro untuk melihat siapa yang mengunjungi.",
    hiddenViewers: "Detail Pengunjung Tersembunyi",
    viewerInfo: "calon pembeli melihat listing Anda",
    unlockWith: "Buka dengan Pro",
    benefit1: "Lihat demografi & perilaku pengunjung",
    benefit2: "Dapatkan kontak pembeli yang tertarik",
    benefit3: "Notifikasi real-time saat ada yang melihat",
    upgradeNow: "Lihat Siapa yang Tertarik",
    maybeLater: "Lanjutkan dengan Tampilan Terbatas",
    urgency: "2 jam tersisa untuk harga ini"
  }
};

interface ViewMilestoneModalProps {
  open: boolean;
  onClose: () => void;
  viewCount: number;
}

const ViewMilestoneModal = ({ open, onClose, viewCount }: ViewMilestoneModalProps) => {
  const { language } = useLanguage();
  const t = text[language];
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
              className="p-2 rounded-full bg-orange-500/10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Flame className="h-5 w-5 text-orange-500" />
            </motion.div>
            <Badge variant="destructive" className="animate-pulse">
              {t.urgency}
            </Badge>
          </div>
          <DialogTitle className="text-xl mt-3">{t.title}</DialogTitle>
          <DialogDescription className="text-base">
            <span className="text-2xl font-bold text-primary">{viewCount}</span> {t.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Blurred viewer cards */}
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
            
            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
              <div className="text-center">
                <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{t.hiddenViewers}</p>
                <p className="text-xs text-muted-foreground">{viewCount} {t.viewerInfo}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{t.description}</p>

          {/* Benefits */}
          <div className="space-y-2 bg-primary/5 rounded-lg p-3 border border-primary/10">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              {t.unlockWith}
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-primary" />
                {t.benefit1}
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                {t.benefit2}
              </li>
              <li className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-primary" />
                {t.benefit3}
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto text-muted-foreground">
            {t.maybeLater}
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            <Eye className="h-4 w-4" />
            {t.upgradeNow}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMilestoneModal;

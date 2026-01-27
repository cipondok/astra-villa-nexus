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
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Sparkles, TrendingUp, Crown } from 'lucide-react';

const text = {
  en: {
    title: "Unlock Unlimited Listings",
    subtitle: "Your portfolio is growing! 🎉",
    description: "You've reached your free tier limit. Upgrade to Pro to list unlimited properties and grow your real estate business.",
    currentUsage: "Current Usage",
    properties: "properties",
    benefits: "Pro Benefits",
    benefit1: "Unlimited property listings",
    benefit2: "Featured placement & priority visibility",
    benefit3: "Advanced analytics & lead tracking",
    benefit4: "Priority customer support",
    upgradeNow: "Upgrade to Pro",
    maybeLater: "Maybe Later",
    limitedOffer: "50% OFF First Month"
  },
  id: {
    title: "Buka Listing Tanpa Batas",
    subtitle: "Portofolio Anda berkembang! 🎉",
    description: "Anda telah mencapai batas tier gratis. Upgrade ke Pro untuk mendaftarkan properti tanpa batas.",
    currentUsage: "Penggunaan Saat Ini",
    properties: "properti",
    benefits: "Keuntungan Pro",
    benefit1: "Listing properti tanpa batas",
    benefit2: "Penempatan unggulan & visibilitas prioritas",
    benefit3: "Analitik lanjutan & pelacakan lead",
    benefit4: "Dukungan pelanggan prioritas",
    upgradeNow: "Upgrade ke Pro",
    maybeLater: "Nanti Saja",
    limitedOffer: "DISKON 50% Bulan Pertama"
  }
};

interface PropertyLimitModalProps {
  open: boolean;
  onClose: () => void;
  currentCount: number;
  limit: number;
}

const PropertyLimitModal = ({ open, onClose, currentCount, limit }: PropertyLimitModalProps) => {
  const { language } = useLanguage();
  const t = text[language];
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
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              {t.limitedOffer}
            </Badge>
          </div>
          <DialogTitle className="text-xl mt-3">{t.title}</DialogTitle>
          <DialogDescription className="text-base">{t.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.currentUsage}</span>
              <span className="font-medium">{currentCount}/{limit} {t.properties}</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>

          <p className="text-sm text-muted-foreground">{t.description}</p>

          {/* Benefits */}
          <div className="space-y-2 bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              {t.benefits}
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t.benefit1}
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                {t.benefit2}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t.benefit3}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t.benefit4}
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t.maybeLater}
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto gap-2">
            <Crown className="h-4 w-4" />
            {t.upgradeNow}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyLimitModal;

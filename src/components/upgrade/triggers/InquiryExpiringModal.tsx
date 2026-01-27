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
import { Clock, MessageSquare, AlertTriangle, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const text = {
  en: {
    title: "Don't Miss These Buyers!",
    subtitle: "potential buyers waiting",
    description: "Your free tier limits you to 3 responses per month. Upgrade now to respond to all inquiries instantly.",
    timeLeft: "Time remaining to respond",
    hours: "hours",
    warning: "Inquiries expire in",
    hoursLabel: "hrs",
    missedOpportunity: "Missed opportunities = Lost sales",
    benefit1: "Unlimited inquiry responses",
    benefit2: "Instant notifications (no 6hr delay)",
    benefit3: "Priority inbox placement",
    upgradeNow: "Respond to All Buyers",
    maybeLater: "Let Them Wait",
    urgency: "⚠️ Expiring Soon"
  },
  id: {
    title: "Jangan Lewatkan Pembeli Ini!",
    subtitle: "calon pembeli menunggu",
    description: "Tier gratis Anda membatasi 3 respons per bulan. Upgrade sekarang untuk merespons semua pertanyaan.",
    timeLeft: "Waktu tersisa untuk merespons",
    hours: "jam",
    warning: "Pertanyaan kedaluwarsa dalam",
    hoursLabel: "jam",
    missedOpportunity: "Kesempatan terlewat = Penjualan hilang",
    benefit1: "Respons pertanyaan tanpa batas",
    benefit2: "Notifikasi instan (tanpa delay 6 jam)",
    benefit3: "Penempatan inbox prioritas",
    upgradeNow: "Respons Semua Pembeli",
    maybeLater: "Biarkan Mereka Menunggu",
    urgency: "⚠️ Segera Kedaluwarsa"
  }
};

interface InquiryExpiringModalProps {
  open: boolean;
  onClose: () => void;
  inquiryCount: number;
  hoursLeft: number;
}

const InquiryExpiringModal = ({ open, onClose, inquiryCount, hoursLeft }: InquiryExpiringModalProps) => {
  const { language } = useLanguage();
  const t = text[language];
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  const urgencyColor = hoursLeft <= 6 ? 'text-red-500' : hoursLeft <= 12 ? 'text-orange-500' : 'text-yellow-500';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <motion.div 
              className="p-2 rounded-full bg-red-500/10"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
            >
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </motion.div>
            <Badge variant="destructive" className="animate-pulse">
              {t.urgency}
            </Badge>
          </div>
          <DialogTitle className="text-xl mt-3">{t.title}</DialogTitle>
          <DialogDescription className="text-base">
            <span className="text-2xl font-bold text-primary">{inquiryCount}</span> {t.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Countdown Timer */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.warning}</p>
            <div className="flex items-center justify-center gap-2">
              <Clock className={`h-6 w-6 ${urgencyColor}`} />
              <span className={`text-3xl font-bold ${urgencyColor}`}>{hoursLeft}</span>
              <span className={`text-lg ${urgencyColor}`}>{t.hoursLabel}</span>
            </div>
          </div>

          {/* Inquiry preview cards */}
          <div className="space-y-2">
            {[1, 2, 3].slice(0, Math.min(inquiryCount, 3)).map((i) => (
              <motion.div 
                key={i}
                className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border border-border"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Buyer #{i}</div>
                  <div className="text-xs text-muted-foreground">Interested in your property</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.floor(hoursLeft / inquiryCount * i)}h
                </Badge>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-red-500 font-medium text-center">
            💸 {t.missedOpportunity}
          </p>

          {/* Benefits */}
          <div className="space-y-2 bg-primary/5 rounded-lg p-3 border border-primary/10">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Pro Features
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-primary" />
                {t.benefit1}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {t.benefit2}
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                {t.benefit3}
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto text-muted-foreground text-xs">
            {t.maybeLater}
          </Button>
          <Button 
            onClick={handleUpgrade} 
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            <MessageSquare className="h-4 w-4" />
            {t.upgradeNow}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryExpiringModal;

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const WNAProcessingTime: React.FC = () => {
  const { language } = useLanguage();

  const copy = {
    en: {
      title: "Processing Timeline",
      subtitle: "Estimated timeframes for property investment process",
      
      phases: [
        {
          name: "Initial Consultation",
          standard: "1-3 days",
          express: "Same day",
          progress: 5,
          color: "blue"
        },
        {
          name: "Property Search & Selection",
          standard: "3-14 days",
          express: "1-5 days",
          progress: 20,
          color: "purple"
        },
        {
          name: "Due Diligence & Legal Check",
          standard: "7-14 days",
          express: "3-7 days",
          progress: 40,
          color: "amber"
        },
        {
          name: "Agreement & Down Payment",
          standard: "3-7 days",
          express: "1-3 days",
          progress: 55,
          color: "green"
        },
        {
          name: "Certificate Transfer (BPN)",
          standard: "14-21 days",
          express: "7-14 days",
          progress: 85,
          color: "rose"
        },
        {
          name: "Handover & Setup",
          standard: "1-7 days",
          express: "1-3 days",
          progress: 100,
          color: "cyan"
        }
      ],

      totalTime: {
        standard: "Total Standard: 30-60 days",
        express: "Total Express: 14-30 days"
      },

      serviceTypes: {
        standard: "Standard Service",
        express: "Express Service (VIP)",
        standardDesc: "Regular processing with full support",
        expressDesc: "Priority processing with dedicated team"
      },

      factors: {
        title: "Factors Affecting Timeline",
        items: [
          { factor: "Property type", impact: "Apartments faster than houses" },
          { factor: "Location", impact: "Major cities process faster" },
          { factor: "Document readiness", impact: "Complete docs save 5-10 days" },
          { factor: "Seller cooperation", impact: "Responsive sellers expedite" },
          { factor: "Bank holidays", impact: "May add 2-5 days" },
          { factor: "Payment method", impact: "Wire transfer fastest" }
        ]
      },

      tips: {
        title: "Speed Up Tips",
        items: [
          "Have all documents ready before starting",
          "Choose properties with clear titles",
          "Use express service for time-sensitive purchases",
          "Work with experienced local notary",
          "Complete visa requirements in advance"
        ]
      }
    },
    id: {
      title: "Timeline Pemrosesan",
      subtitle: "Perkiraan waktu untuk proses investasi properti",
      
      phases: [
        {
          name: "Konsultasi Awal",
          standard: "1-3 hari",
          express: "Hari yang sama",
          progress: 5,
          color: "blue"
        },
        {
          name: "Pencarian & Pemilihan Properti",
          standard: "3-14 hari",
          express: "1-5 hari",
          progress: 20,
          color: "purple"
        },
        {
          name: "Due Diligence & Cek Legal",
          standard: "7-14 hari",
          express: "3-7 hari",
          progress: 40,
          color: "amber"
        },
        {
          name: "Perjanjian & Uang Muka",
          standard: "3-7 hari",
          express: "1-3 hari",
          progress: 55,
          color: "green"
        },
        {
          name: "Transfer Sertifikat (BPN)",
          standard: "14-21 hari",
          express: "7-14 hari",
          progress: 85,
          color: "rose"
        },
        {
          name: "Serah Terima & Setup",
          standard: "1-7 hari",
          express: "1-3 hari",
          progress: 100,
          color: "cyan"
        }
      ],

      totalTime: {
        standard: "Total Standar: 30-60 hari",
        express: "Total Ekspres: 14-30 hari"
      },

      serviceTypes: {
        standard: "Layanan Standar",
        express: "Layanan Ekspres (VIP)",
        standardDesc: "Pemrosesan reguler dengan dukungan penuh",
        expressDesc: "Pemrosesan prioritas dengan tim khusus"
      },

      factors: {
        title: "Faktor yang Mempengaruhi Timeline",
        items: [
          { factor: "Jenis properti", impact: "Apartemen lebih cepat dari rumah" },
          { factor: "Lokasi", impact: "Kota besar proses lebih cepat" },
          { factor: "Kesiapan dokumen", impact: "Dokumen lengkap hemat 5-10 hari" },
          { factor: "Kerja sama penjual", impact: "Penjual responsif mempercepat" },
          { factor: "Hari libur bank", impact: "Dapat menambah 2-5 hari" },
          { factor: "Metode pembayaran", impact: "Transfer wire tercepat" }
        ]
      },

      tips: {
        title: "Tips Mempercepat",
        items: [
          "Siapkan semua dokumen sebelum memulai",
          "Pilih properti dengan sertifikat jelas",
          "Gunakan layanan ekspres untuk pembelian mendesak",
          "Bekerja dengan notaris lokal berpengalaman",
          "Selesaikan persyaratan visa terlebih dahulu"
        ]
      }
    }
  };

  const t = copy[language];

  const colorClasses = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-500' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
    green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', bar: 'bg-green-500' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-600 dark:text-cyan-400', bar: 'bg-cyan-500' }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Clock className="h-4 w-4 text-accent" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Service Type Legend */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
          <Badge variant="outline" className="text-[8px] mb-1">
            <Calendar className="h-2.5 w-2.5 mr-1" />
            {t.serviceTypes.standard}
          </Badge>
          <p className="text-[7px] text-muted-foreground">{t.serviceTypes.standardDesc}</p>
        </div>
        <div className="p-2 rounded-lg bg-accent/5 border border-accent/30 text-center">
          <Badge className="text-[8px] mb-1 bg-accent">
            <Zap className="h-2.5 w-2.5 mr-1" />
            {t.serviceTypes.express}
          </Badge>
          <p className="text-[7px] text-muted-foreground">{t.serviceTypes.expressDesc}</p>
        </div>
      </div>

      {/* Timeline Phases */}
      <div className="space-y-2">
        {t.phases.map((phase, idx) => {
          const colors = colorClasses[phase.color as keyof typeof colorClasses];
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "p-2.5 rounded-lg",
                "bg-transparent dark:bg-white/5",
                "border border-border/30"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold", colors.bg, colors.text)}>
                    {idx + 1}
                  </div>
                  <h4 className="text-[9px] sm:text-[10px] font-semibold text-foreground">{phase.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[7px] px-1.5 py-0">
                    <Calendar className="h-2 w-2 mr-0.5" />
                    {phase.standard}
                  </Badge>
                  <Badge className={cn("text-[7px] px-1.5 py-0", colors.bg, colors.text)}>
                    <Zap className="h-2 w-2 mr-0.5" />
                    {phase.express}
                  </Badge>
                </div>
              </div>
              <Progress value={phase.progress} className={cn("h-1", `[&>div]:${colors.bar}`)} />
            </motion.div>
          );
        })}
      </div>

      {/* Total Time */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="p-2.5 rounded-lg bg-muted/50 border border-border/30 text-center">
          <p className="text-[9px] sm:text-[10px] font-semibold text-foreground">{t.totalTime.standard}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/30 text-center">
          <p className="text-[9px] sm:text-[10px] font-semibold text-accent">{t.totalTime.express}</p>
        </div>
      </div>

      {/* Factors & Tips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* Factors */}
        <div className={cn(
          "p-2.5 rounded-lg",
          "bg-transparent dark:bg-white/5",
          "border border-amber-200 dark:border-amber-800"
        )}>
          <h4 className="text-[9px] sm:text-[10px] font-semibold text-foreground mb-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-500" />
            {t.factors.title}
          </h4>
          <div className="space-y-1">
            {t.factors.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-[8px]">
                <span className="text-muted-foreground">{item.factor}</span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  <TrendingUp className="h-2 w-2" />
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className={cn(
          "p-2.5 rounded-lg",
          "bg-transparent dark:bg-white/5",
          "border border-green-200 dark:border-green-800"
        )}>
          <h4 className="text-[9px] sm:text-[10px] font-semibold text-foreground mb-2 flex items-center gap-1">
            <Zap className="h-3 w-3 text-green-500" />
            {t.tips.title}
          </h4>
          <div className="space-y-1">
            {t.tips.items.map((tip, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle className="h-2.5 w-2.5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[8px] text-foreground/80">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WNAProcessingTime;

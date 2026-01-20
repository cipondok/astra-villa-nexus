import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  ClipboardList, 
  Search, 
  FileCheck, 
  CreditCard, 
  Key, 
  Home,
  CheckCircle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const WNAProcessProcedure: React.FC = () => {
  const { language } = useLanguage();
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const copy = {
    en: {
      title: "Investment Process & Procedure",
      subtitle: "Step-by-step guide to property investment in Indonesia",
      totalTime: "Total estimated time: 30-60 days",
      steps: [
        {
          step: 1,
          title: "Initial Consultation",
          duration: "1-3 days",
          icon: ClipboardList,
          color: "blue",
          description: "Free consultation with our investment advisors",
          details: [
            "Complete investor profile questionnaire",
            "Discuss investment goals and budget",
            "Explain ownership structures (Hak Pakai, PT PMA)",
            "Provide market overview and opportunities",
            "Schedule property viewing (virtual or physical)"
          ]
        },
        {
          step: 2,
          title: "Property Selection",
          duration: "3-14 days",
          icon: Search,
          color: "purple",
          description: "Find and verify your ideal property",
          details: [
            "Property shortlist based on criteria",
            "Virtual or on-site property tours",
            "Neighborhood and infrastructure analysis",
            "Price comparison and market valuation",
            "Preliminary due diligence check"
          ]
        },
        {
          step: 3,
          title: "Legal Due Diligence",
          duration: "7-14 days",
          icon: FileCheck,
          color: "amber",
          description: "Complete property verification and legal check",
          details: [
            "Certificate verification (SHM/SHGB)",
            "Ownership history check",
            "Tax clearance verification (PBB)",
            "Building permit verification (IMB)",
            "Zone and land use compliance check",
            "Encumbrance and lien check"
          ]
        },
        {
          step: 4,
          title: "Agreement & Payment",
          duration: "3-7 days",
          icon: CreditCard,
          color: "green",
          description: "Finalize agreement and secure payment",
          details: [
            "Draft Sale & Purchase Agreement (PPJB)",
            "Negotiate terms and conditions",
            "Set up escrow account",
            "Down payment processing (typically 10-30%)",
            "Payment schedule arrangement",
            "Notary appointment scheduling"
          ]
        },
        {
          step: 5,
          title: "Ownership Transfer",
          duration: "14-21 days",
          icon: Key,
          color: "rose",
          description: "Legal transfer of property rights",
          details: [
            "AJB (Deed of Sale) execution at notary",
            "Tax payment (BPHTB for buyer, PPH for seller)",
            "Certificate transfer at BPN (Land Office)",
            "Utility transfer (electricity, water)",
            "Final payment release from escrow"
          ]
        },
        {
          step: 6,
          title: "Handover & Support",
          duration: "1-7 days",
          icon: Home,
          color: "cyan",
          description: "Property handover and ongoing support",
          details: [
            "Physical property inspection",
            "Key handover ceremony",
            "Property management setup (optional)",
            "Rental management (if investment property)",
            "Ongoing legal and tax support",
            "Welcome to your Indonesian home!"
          ]
        }
      ]
    },
    id: {
      title: "Proses & Prosedur Investasi",
      subtitle: "Panduan langkah demi langkah investasi properti di Indonesia",
      totalTime: "Total estimasi waktu: 30-60 hari",
      steps: [
        {
          step: 1,
          title: "Konsultasi Awal",
          duration: "1-3 hari",
          icon: ClipboardList,
          color: "blue",
          description: "Konsultasi gratis dengan penasihat investasi kami",
          details: [
            "Lengkapi kuesioner profil investor",
            "Diskusi tujuan investasi dan anggaran",
            "Jelaskan struktur kepemilikan (Hak Pakai, PT PMA)",
            "Berikan tinjauan pasar dan peluang",
            "Jadwalkan kunjungan properti (virtual atau fisik)"
          ]
        },
        {
          step: 2,
          title: "Pemilihan Properti",
          duration: "3-14 hari",
          icon: Search,
          color: "purple",
          description: "Temukan dan verifikasi properti ideal Anda",
          details: [
            "Daftar pendek properti berdasarkan kriteria",
            "Tur properti virtual atau langsung",
            "Analisis lingkungan dan infrastruktur",
            "Perbandingan harga dan penilaian pasar",
            "Pemeriksaan due diligence awal"
          ]
        },
        {
          step: 3,
          title: "Due Diligence Legal",
          duration: "7-14 hari",
          icon: FileCheck,
          color: "amber",
          description: "Verifikasi properti lengkap dan pemeriksaan legal",
          details: [
            "Verifikasi sertifikat (SHM/SHGB)",
            "Pemeriksaan riwayat kepemilikan",
            "Verifikasi pelunasan pajak (PBB)",
            "Verifikasi izin bangunan (IMB)",
            "Pemeriksaan kepatuhan zona dan penggunaan lahan",
            "Pemeriksaan beban dan hak tanggungan"
          ]
        },
        {
          step: 4,
          title: "Perjanjian & Pembayaran",
          duration: "3-7 hari",
          icon: CreditCard,
          color: "green",
          description: "Finalisasi perjanjian dan pengamanan pembayaran",
          details: [
            "Draft Perjanjian Pengikatan Jual Beli (PPJB)",
            "Negosiasi syarat dan ketentuan",
            "Setup rekening escrow",
            "Pemrosesan uang muka (biasanya 10-30%)",
            "Pengaturan jadwal pembayaran",
            "Penjadwalan pertemuan notaris"
          ]
        },
        {
          step: 5,
          title: "Transfer Kepemilikan",
          duration: "14-21 hari",
          icon: Key,
          color: "rose",
          description: "Transfer legal hak properti",
          details: [
            "Eksekusi AJB (Akta Jual Beli) di notaris",
            "Pembayaran pajak (BPHTB untuk pembeli, PPH untuk penjual)",
            "Transfer sertifikat di BPN (Kantor Pertanahan)",
            "Transfer utilitas (listrik, air)",
            "Pelepasan pembayaran akhir dari escrow"
          ]
        },
        {
          step: 6,
          title: "Serah Terima & Dukungan",
          duration: "1-7 hari",
          icon: Home,
          color: "cyan",
          description: "Serah terima properti dan dukungan berkelanjutan",
          details: [
            "Inspeksi properti fisik",
            "Seremoni serah terima kunci",
            "Setup manajemen properti (opsional)",
            "Manajemen sewa (jika properti investasi)",
            "Dukungan legal dan pajak berkelanjutan",
            "Selamat datang di rumah Indonesia Anda!"
          ]
        }
      ]
    }
  };

  const t = copy[language];

  const colorClasses = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', line: 'bg-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', line: 'bg-purple-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', line: 'bg-amber-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', line: 'bg-green-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400', line: 'bg-rose-400' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-600 dark:text-cyan-400', line: 'bg-cyan-400' }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <ClipboardList className="h-4 w-4 text-accent" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
        <Badge variant="outline" className="mt-2 text-[8px] px-2 py-0.5">
          <Clock className="h-2.5 w-2.5 mr-1" />
          {t.totalTime}
        </Badge>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-2">
        {t.steps.map((step, idx) => {
          const Icon = step.icon;
          const colors = colorClasses[step.color as keyof typeof colorClasses];
          const isExpanded = expandedStep === idx;
          const isLast = idx === t.steps.length - 1;

          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative"
            >
              {/* Connecting Line */}
              {!isLast && (
                <div className={cn(
                  "absolute left-[15px] top-[36px] w-0.5 h-[calc(100%-20px)]",
                  colors.line,
                  "opacity-30"
                )} />
              )}

              <div
                onClick={() => setExpandedStep(isExpanded ? null : idx)}
                className={cn(
                  "relative p-2.5 rounded-lg cursor-pointer transition-all duration-200",
                  "bg-white/80 dark:bg-white/5",
                  "border",
                  isExpanded ? "border-accent shadow-md" : "border-border/30 hover:border-accent/40",
                  "active:scale-[0.99]"
                )}
              >
                <div className="flex items-start gap-2.5">
                  {/* Step Number & Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    colors.bg
                  )}>
                    <Icon className={cn("h-4 w-4", colors.text)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[7px] px-1.5 py-0">
                          Step {step.step}
                        </Badge>
                        <h4 className="text-[10px] sm:text-xs font-semibold text-foreground">{step.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={cn("text-[7px] px-1.5 py-0", colors.bg, colors.text)}>
                          {step.duration}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5 ml-10"
                    >
                      <div className="space-y-1">
                        {step.details.map((detail, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <CheckCircle className={cn("h-3 w-3 mt-0.5 flex-shrink-0", colors.text)} />
                            <span className="text-[8px] sm:text-[9px] text-foreground/80">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Process Flow Summary */}
      <div className="mt-4 p-2.5 rounded-lg bg-gradient-to-r from-accent/5 via-transparent to-accent/5 border border-accent/20">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {t.steps.map((step, idx) => {
            const Icon = step.icon;
            const colors = colorClasses[step.color as keyof typeof colorClasses];
            const isLast = idx === t.steps.length - 1;
            
            return (
              <React.Fragment key={step.step}>
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full",
                  colors.bg
                )}>
                  <Icon className={cn("h-3 w-3", colors.text)} />
                </div>
                {!isLast && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WNAProcessProcedure;

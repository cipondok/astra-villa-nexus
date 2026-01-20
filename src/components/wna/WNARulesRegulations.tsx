import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const WNARulesRegulations: React.FC = () => {
  const { language } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>('ownership');

  const copy = {
    en: {
      title: "Rules & Regulations",
      subtitle: "Legal framework for foreign property investment in Indonesia",
      
      sections: [
        {
          id: 'ownership',
          title: "Ownership Rights",
          icon: Building2,
          color: "blue",
          rules: [
            { type: 'allowed', text: "Hak Pakai (Right to Use) for residential property" },
            { type: 'allowed', text: "Strata title ownership for apartments" },
            { type: 'allowed', text: "PT PMA (foreign company) can own Hak Guna Bangunan" },
            { type: 'allowed', text: "Leasehold agreements up to 25+20+20 years" },
            { type: 'prohibited', text: "Hak Milik (Freehold) ownership by foreigners" },
            { type: 'prohibited', text: "Agricultural land ownership by foreigners" },
            { type: 'info', text: "Nominee arrangements carry significant legal risks" }
          ]
        },
        {
          id: 'minimum',
          title: "Minimum Investment",
          icon: DollarSign,
          color: "green",
          rules: [
            { type: 'allowed', text: "House minimum: IDR 5 billion (varies by region)" },
            { type: 'allowed', text: "Apartment minimum: IDR 1 billion (varies by region)" },
            { type: 'allowed', text: "Bali premium zones: Higher minimum thresholds" },
            { type: 'allowed', text: "Jakarta/Surabaya: Region-specific pricing" },
            { type: 'info', text: "Prices subject to Government Regulation updates" },
            { type: 'info', text: "Currency fluctuations may affect USD equivalents" }
          ]
        },
        {
          id: 'duration',
          title: "Ownership Duration",
          icon: Clock,
          color: "amber",
          rules: [
            { type: 'allowed', text: "Hak Pakai: Initial 30 years + 20 years extension" },
            { type: 'allowed', text: "Additional 30 years renewal possible (total 80 years)" },
            { type: 'allowed', text: "Strata title: Same as Hak Pakai duration" },
            { type: 'allowed', text: "PT PMA HGB: 30 + 20 + 20 years" },
            { type: 'info', text: "Must maintain valid KITAS/visa for Hak Pakai" },
            { type: 'info', text: "Extensions require timely application" }
          ]
        },
        {
          id: 'location',
          title: "Location Restrictions",
          icon: MapPin,
          color: "purple",
          rules: [
            { type: 'prohibited', text: "Border areas and military zones" },
            { type: 'prohibited', text: "Conservation and protected forests" },
            { type: 'prohibited', text: "Coastal areas (within certain limits)" },
            { type: 'allowed', text: "Major cities and urban areas" },
            { type: 'allowed', text: "Designated tourist and investment zones" },
            { type: 'allowed', text: "Special Economic Zones (KEK)" },
            { type: 'info', text: "Zone verification required before purchase" }
          ]
        },
        {
          id: 'taxes',
          title: "Taxes & Fees",
          icon: FileText,
          color: "rose",
          rules: [
            { type: 'info', text: "BPHTB (Acquisition Tax): 5% of transaction value" },
            { type: 'info', text: "PPH (Income Tax for seller): 2.5% of transaction" },
            { type: 'info', text: "PBB (Annual Property Tax): ~0.1-0.3% of NJOP" },
            { type: 'info', text: "Notary fees: 0.5-1% of transaction value" },
            { type: 'info', text: "VAT on new properties: 11%" },
            { type: 'allowed', text: "Double tax treaties may reduce obligations" }
          ]
        }
      ],

      legend: {
        allowed: "Permitted",
        prohibited: "Not Allowed",
        info: "Important Info"
      },

      disclaimer: "Regulations may change. Always consult with a licensed legal professional for the most current requirements."
    },
    id: {
      title: "Aturan & Regulasi",
      subtitle: "Kerangka hukum untuk investasi properti asing di Indonesia",
      
      sections: [
        {
          id: 'ownership',
          title: "Hak Kepemilikan",
          icon: Building2,
          color: "blue",
          rules: [
            { type: 'allowed', text: "Hak Pakai untuk properti residensial" },
            { type: 'allowed', text: "Kepemilikan strata title untuk apartemen" },
            { type: 'allowed', text: "PT PMA (perusahaan asing) dapat memiliki Hak Guna Bangunan" },
            { type: 'allowed', text: "Perjanjian sewa hingga 25+20+20 tahun" },
            { type: 'prohibited', text: "Kepemilikan Hak Milik oleh orang asing" },
            { type: 'prohibited', text: "Kepemilikan tanah pertanian oleh orang asing" },
            { type: 'info', text: "Pengaturan nominee memiliki risiko hukum signifikan" }
          ]
        },
        {
          id: 'minimum',
          title: "Investasi Minimum",
          icon: DollarSign,
          color: "green",
          rules: [
            { type: 'allowed', text: "Rumah minimum: IDR 5 miliar (bervariasi per wilayah)" },
            { type: 'allowed', text: "Apartemen minimum: IDR 1 miliar (bervariasi per wilayah)" },
            { type: 'allowed', text: "Zona premium Bali: Batas minimum lebih tinggi" },
            { type: 'allowed', text: "Jakarta/Surabaya: Harga spesifik wilayah" },
            { type: 'info', text: "Harga tergantung pembaruan Peraturan Pemerintah" },
            { type: 'info', text: "Fluktuasi mata uang dapat mempengaruhi nilai USD" }
          ]
        },
        {
          id: 'duration',
          title: "Durasi Kepemilikan",
          icon: Clock,
          color: "amber",
          rules: [
            { type: 'allowed', text: "Hak Pakai: Awal 30 tahun + perpanjangan 20 tahun" },
            { type: 'allowed', text: "Perpanjangan tambahan 30 tahun mungkin (total 80 tahun)" },
            { type: 'allowed', text: "Strata title: Sama dengan durasi Hak Pakai" },
            { type: 'allowed', text: "PT PMA HGB: 30 + 20 + 20 tahun" },
            { type: 'info', text: "Harus memiliki KITAS/visa valid untuk Hak Pakai" },
            { type: 'info', text: "Perpanjangan memerlukan pengajuan tepat waktu" }
          ]
        },
        {
          id: 'location',
          title: "Pembatasan Lokasi",
          icon: MapPin,
          color: "purple",
          rules: [
            { type: 'prohibited', text: "Area perbatasan dan zona militer" },
            { type: 'prohibited', text: "Hutan konservasi dan dilindungi" },
            { type: 'prohibited', text: "Area pesisir (dalam batas tertentu)" },
            { type: 'allowed', text: "Kota-kota besar dan area urban" },
            { type: 'allowed', text: "Zona wisata dan investasi yang ditetapkan" },
            { type: 'allowed', text: "Kawasan Ekonomi Khusus (KEK)" },
            { type: 'info', text: "Verifikasi zona diperlukan sebelum pembelian" }
          ]
        },
        {
          id: 'taxes',
          title: "Pajak & Biaya",
          icon: FileText,
          color: "rose",
          rules: [
            { type: 'info', text: "BPHTB (Pajak Perolehan): 5% dari nilai transaksi" },
            { type: 'info', text: "PPH (Pajak Penghasilan penjual): 2.5% dari transaksi" },
            { type: 'info', text: "PBB (Pajak Properti Tahunan): ~0.1-0.3% dari NJOP" },
            { type: 'info', text: "Biaya notaris: 0.5-1% dari nilai transaksi" },
            { type: 'info', text: "PPN pada properti baru: 11%" },
            { type: 'allowed', text: "Perjanjian pajak ganda dapat mengurangi kewajiban" }
          ]
        }
      ],

      legend: {
        allowed: "Diizinkan",
        prohibited: "Tidak Diizinkan",
        info: "Info Penting"
      },

      disclaimer: "Regulasi dapat berubah. Selalu konsultasikan dengan profesional hukum berlisensi untuk persyaratan terkini."
    }
  };

  const t = copy[language];

  const colorClasses = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400' }
  };

  const ruleIcons = {
    allowed: { icon: CheckCircle, color: 'text-green-500' },
    prohibited: { icon: XCircle, color: 'text-red-500' },
    info: { icon: Info, color: 'text-blue-500' }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Scale className="h-4 w-4 text-accent" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mb-2">
        {Object.entries(t.legend).map(([key, label]) => {
          const { icon: Icon, color } = ruleIcons[key as keyof typeof ruleIcons];
          return (
            <div key={key} className="flex items-center gap-1">
              <Icon className={cn("h-3 w-3", color)} />
              <span className="text-[8px] text-muted-foreground">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {t.sections.map((section) => {
          const Icon = section.icon;
          const colors = colorClasses[section.color as keyof typeof colorClasses];
          const isExpanded = expandedSection === section.id;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-lg overflow-hidden transition-all duration-200",
                "bg-transparent dark:bg-white/5",
                "border",
                isExpanded ? "border-accent shadow-md" : "border-border/30"
              )}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="flex items-center gap-2.5 p-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <div className={cn("p-1.5 rounded-lg", colors.bg)}>
                  <Icon className={cn("h-4 w-4", colors.text)} />
                </div>
                <h4 className="flex-1 text-[10px] sm:text-xs font-semibold text-foreground">
                  {section.title}
                </h4>
                <Badge variant="outline" className="text-[7px] px-1.5 py-0 mr-1">
                  {section.rules.length} rules
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-2.5 pb-2.5"
                  >
                    <div className="space-y-1.5 ml-8">
                      {section.rules.map((rule, idx) => {
                        const { icon: RuleIcon, color } = ruleIcons[rule.type as keyof typeof ruleIcons];
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-start gap-2 p-1.5 rounded-md",
                              rule.type === 'prohibited' && "bg-red-50 dark:bg-red-950/20",
                              rule.type === 'allowed' && "bg-green-50 dark:bg-green-950/20",
                              rule.type === 'info' && "bg-blue-50 dark:bg-blue-950/20"
                            )}
                          >
                            <RuleIcon className={cn("h-3 w-3 flex-shrink-0 mt-0.5", color)} />
                            <span className="text-[8px] sm:text-[9px] text-foreground/80">{rule.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[8px] sm:text-[9px] text-amber-700 dark:text-amber-300">{t.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

export default WNARulesRegulations;

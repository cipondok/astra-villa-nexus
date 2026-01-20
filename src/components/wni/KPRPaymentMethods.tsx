import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Building2, 
  Wallet, 
  Globe,
  CheckCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentMethod {
  id: string;
  icon: React.ElementType;
  color: string;
  recommended?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bank_transfer', icon: Building2, color: 'blue', recommended: true },
  { id: 'swift', icon: Globe, color: 'purple' },
  { id: 'local_bank', icon: CreditCard, color: 'green' },
  { id: 'escrow', icon: Wallet, color: 'amber', recommended: true },
];

interface KPRPaymentMethodsProps {
  className?: string;
}

export const KPRPaymentMethods: React.FC<KPRPaymentMethodsProps> = ({ className }) => {
  const { language } = useLanguage();

  const copy = {
    en: {
      title: "Payment Methods for WNI Overseas",
      subtitle: "Secure and compliant payment options for your property investment",
      recommended: "Recommended",
      methods: {
        bank_transfer: {
          title: "International Bank Transfer (TT)",
          desc: "Direct transfer from your overseas bank to Indonesian developer/seller account",
          pros: ["Widely accepted", "Clear paper trail", "Bank-verified"],
          cons: ["Exchange rate fluctuation", "Transfer fees apply"],
          time: "2-5 business days"
        },
        swift: {
          title: "SWIFT Transfer",
          desc: "International wire transfer using SWIFT network to Indonesian banks",
          pros: ["Secure & traceable", "Large amounts supported", "Official documentation"],
          cons: ["Higher fees", "Multiple intermediary banks"],
          time: "3-7 business days"
        },
        local_bank: {
          title: "Indonesian Bank Account",
          desc: "Payment from your existing Indonesian bank account",
          pros: ["Fastest processing", "No forex fees", "Easier documentation"],
          cons: ["Requires Indonesian account", "Fund source verification needed"],
          time: "Same day - 1 day"
        },
        escrow: {
          title: "Escrow Account",
          desc: "Secure third-party escrow through bank or notary (PPAT)",
          pros: ["Maximum security", "Buyer protection", "Legal compliance"],
          cons: ["Additional escrow fees", "Longer setup"],
          time: "As per agreement"
        }
      },
      importantNotes: "Important Payment Guidelines",
      notes: [
        "All payments must be documented for tax reporting (PPh & BPHTB)",
        "Source of funds must be clearly traceable",
        "Use official bank channels only - avoid informal transfers",
        "Keep all transaction receipts and bank statements",
        "For amounts over IDR 1 billion, additional documentation required"
      ],
      dpPayment: "Down Payment (DP)",
      dpDesc: "Minimum 20% for WNI overseas KPR. Higher DP = better interest rates.",
      monthlyPayment: "Monthly Installments",
      monthlyDesc: "Auto-debit from Indonesian account or scheduled transfers."
    },
    id: {
      title: "Metode Pembayaran untuk WNI di Luar Negeri",
      subtitle: "Opsi pembayaran yang aman dan sesuai regulasi untuk investasi properti Anda",
      recommended: "Direkomendasikan",
      methods: {
        bank_transfer: {
          title: "Transfer Bank Internasional (TT)",
          desc: "Transfer langsung dari bank luar negeri ke rekening developer/penjual Indonesia",
          pros: ["Diterima secara luas", "Jejak dokumen jelas", "Terverifikasi bank"],
          cons: ["Fluktuasi kurs", "Ada biaya transfer"],
          time: "2-5 hari kerja"
        },
        swift: {
          title: "Transfer SWIFT",
          desc: "Transfer kawat internasional menggunakan jaringan SWIFT ke bank Indonesia",
          pros: ["Aman & terlacak", "Mendukung jumlah besar", "Dokumentasi resmi"],
          cons: ["Biaya lebih tinggi", "Beberapa bank perantara"],
          time: "3-7 hari kerja"
        },
        local_bank: {
          title: "Rekening Bank Indonesia",
          desc: "Pembayaran dari rekening bank Indonesia yang sudah ada",
          pros: ["Proses tercepat", "Tanpa biaya forex", "Dokumentasi lebih mudah"],
          cons: ["Perlu rekening Indonesia", "Perlu verifikasi sumber dana"],
          time: "Hari yang sama - 1 hari"
        },
        escrow: {
          title: "Rekening Escrow",
          desc: "Escrow pihak ketiga yang aman melalui bank atau notaris (PPAT)",
          pros: ["Keamanan maksimal", "Perlindungan pembeli", "Kepatuhan hukum"],
          cons: ["Biaya escrow tambahan", "Pengaturan lebih lama"],
          time: "Sesuai perjanjian"
        }
      },
      importantNotes: "Panduan Pembayaran Penting",
      notes: [
        "Semua pembayaran harus didokumentasikan untuk pelaporan pajak (PPh & BPHTB)",
        "Sumber dana harus dapat dilacak dengan jelas",
        "Gunakan saluran bank resmi - hindari transfer informal",
        "Simpan semua bukti transaksi dan rekening koran",
        "Untuk jumlah di atas Rp 1 miliar, dokumentasi tambahan diperlukan"
      ],
      dpPayment: "Uang Muka (DP)",
      dpDesc: "Minimal 20% untuk KPR WNI luar negeri. DP lebih tinggi = suku bunga lebih baik.",
      monthlyPayment: "Cicilan Bulanan",
      monthlyDesc: "Auto-debit dari rekening Indonesia atau transfer terjadwal."
    }
  };

  const t = copy[language];

  const getMethodColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'purple': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'green': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'amber': return 'from-amber-500/20 to-amber-600/20 border-amber-500/30';
      default: return 'from-muted to-muted border-border';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      case 'green': return 'text-green-600';
      case 'amber': return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn("border border-primary/10 bg-transparent dark:bg-white/5 backdrop-blur-xl shadow-sm", className)}>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
            <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
          </div>
          {t.title}
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3">
        {/* Payment Methods */}
        <div className="space-y-2">
          {PAYMENT_METHODS.map((method, idx) => {
            const methodData = t.methods[method.id as keyof typeof t.methods];
            const Icon = method.icon;
            
            return (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-2.5 sm:p-3 rounded-lg border bg-gradient-to-br",
                  getMethodColor(method.color)
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-background/80 flex-shrink-0",
                    getIconColor(method.color)
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-[10px] sm:text-xs font-semibold truncate">{methodData.title}</h3>
                      {method.recommended && (
                        <Badge className="text-[7px] sm:text-[9px] px-1 py-0 bg-green-500 text-white">
                          ★
                        </Badge>
                      )}
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{methodData.desc}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-medium text-green-600 mb-0.5">✓ Pros</p>
                        {methodData.pros.slice(0, 2).map((pro, i) => (
                          <p key={i} className="text-[8px] sm:text-[9px] text-muted-foreground truncate">• {pro}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-medium text-amber-600 mb-0.5">○ Cons</p>
                        {methodData.cons.map((con, i) => (
                          <p key={i} className="text-[8px] sm:text-[9px] text-muted-foreground truncate">• {con}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-0.5 mt-1.5 text-[9px] sm:text-[10px] text-primary">
                      <ArrowRight className="h-2.5 w-2.5" />
                      <span>{methodData.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Structure */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="text-[10px] sm:text-xs font-semibold text-primary">{t.dpPayment}</h4>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{t.dpDesc}</p>
          </div>
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-[10px] sm:text-xs font-semibold text-blue-600">{t.monthlyPayment}</h4>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{t.monthlyDesc}</p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-amber-600">{t.importantNotes}</p>
              <ul className="mt-1 space-y-0.5">
                {t.notes.slice(0, 3).map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-[9px] sm:text-[10px] text-muted-foreground">
                    <CheckCircle className="h-2.5 w-2.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPRPaymentMethods;

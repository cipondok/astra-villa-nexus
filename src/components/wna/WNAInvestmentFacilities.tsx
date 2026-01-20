import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Scale, 
  CreditCard, 
  Plane, 
  Home, 
  Briefcase, 
  Shield, 
  Users,
  Wallet,
  FileCheck,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'framer-motion';

const WNAInvestmentFacilities: React.FC = () => {
  const { language } = useLanguage();

  const copy = {
    en: {
      title: "Investment Facilities for Foreign Nationals",
      subtitle: "Comprehensive support system for international investors",
      categories: [
        {
          title: "Property & Ownership",
          icon: Building2,
          color: "blue",
          facilities: [
            { name: "Hak Pakai (Right to Use)", desc: "Up to 80 years for residential property" },
            { name: "Strata Title Apartments", desc: "Full ownership of apartment units" },
            { name: "PT PMA Ownership", desc: "Company structure for property investment" },
            { name: "Leasehold Agreements", desc: "Long-term lease with renewal options" }
          ]
        },
        {
          title: "Legal & Compliance",
          icon: Scale,
          color: "purple",
          facilities: [
            { name: "Notary Services", desc: "Certified notary for all transactions" },
            { name: "Due Diligence", desc: "Complete property verification" },
            { name: "Contract Review", desc: "Legal contract in English & Indonesian" },
            { name: "Escrow Services", desc: "Secure payment handling" }
          ]
        },
        {
          title: "Banking & Finance",
          icon: Wallet,
          color: "green",
          facilities: [
            { name: "Foreign Currency Account", desc: "USD, SGD, AUD, EUR accounts" },
            { name: "Investment Account", desc: "Special investor banking services" },
            { name: "Wire Transfer", desc: "International fund transfers" },
            { name: "Tax Advisory", desc: "Double taxation treaty guidance" }
          ]
        },
        {
          title: "Visa & Residency",
          icon: Plane,
          color: "amber",
          facilities: [
            { name: "Investor KITAS", desc: "1-2 year stay permit for investors" },
            { name: "Second Home Visa", desc: "5-10 year visa for property owners" },
            { name: "Retirement Visa", desc: "For investors 55+ years" },
            { name: "Business Visa", desc: "Multiple entry for business activities" }
          ]
        },
        {
          title: "Relocation Services",
          icon: Home,
          color: "cyan",
          facilities: [
            { name: "VIP Airport Pickup", desc: "Premium arrival assistance" },
            { name: "Housing Setup", desc: "Utilities, internet, furnishing" },
            { name: "School Enrollment", desc: "International school assistance" },
            { name: "Healthcare Setup", desc: "Hospital & insurance registration" }
          ]
        },
        {
          title: "Business Support",
          icon: Briefcase,
          color: "rose",
          facilities: [
            { name: "PT PMA Formation", desc: "Foreign company registration" },
            { name: "Business Licensing", desc: "NIB, SIUP, TDP processing" },
            { name: "Tax Registration", desc: "NPWP & PKP setup" },
            { name: "Virtual Office", desc: "Business address & mail handling" }
          ]
        }
      ]
    },
    id: {
      title: "Fasilitas Investasi untuk WNA",
      subtitle: "Sistem dukungan komprehensif untuk investor internasional",
      categories: [
        {
          title: "Properti & Kepemilikan",
          icon: Building2,
          color: "blue",
          facilities: [
            { name: "Hak Pakai", desc: "Hingga 80 tahun untuk properti residensial" },
            { name: "Strata Title Apartemen", desc: "Kepemilikan penuh unit apartemen" },
            { name: "Kepemilikan PT PMA", desc: "Struktur perusahaan untuk investasi properti" },
            { name: "Perjanjian Sewa", desc: "Sewa jangka panjang dengan opsi perpanjangan" }
          ]
        },
        {
          title: "Legal & Kepatuhan",
          icon: Scale,
          color: "purple",
          facilities: [
            { name: "Layanan Notaris", desc: "Notaris bersertifikat untuk semua transaksi" },
            { name: "Due Diligence", desc: "Verifikasi properti lengkap" },
            { name: "Review Kontrak", desc: "Kontrak legal dalam Bahasa Inggris & Indonesia" },
            { name: "Layanan Escrow", desc: "Penanganan pembayaran aman" }
          ]
        },
        {
          title: "Perbankan & Keuangan",
          icon: Wallet,
          color: "green",
          facilities: [
            { name: "Rekening Mata Uang Asing", desc: "Rekening USD, SGD, AUD, EUR" },
            { name: "Rekening Investasi", desc: "Layanan perbankan khusus investor" },
            { name: "Transfer Wire", desc: "Transfer dana internasional" },
            { name: "Konsultasi Pajak", desc: "Panduan perjanjian pajak ganda" }
          ]
        },
        {
          title: "Visa & Residensi",
          icon: Plane,
          color: "amber",
          facilities: [
            { name: "KITAS Investor", desc: "Izin tinggal 1-2 tahun untuk investor" },
            { name: "Visa Second Home", desc: "Visa 5-10 tahun untuk pemilik properti" },
            { name: "Visa Pensiun", desc: "Untuk investor 55+ tahun" },
            { name: "Visa Bisnis", desc: "Multiple entry untuk aktivitas bisnis" }
          ]
        },
        {
          title: "Layanan Relokasi",
          icon: Home,
          color: "cyan",
          facilities: [
            { name: "Penjemputan VIP Bandara", desc: "Bantuan kedatangan premium" },
            { name: "Setup Rumah", desc: "Utilitas, internet, furnitur" },
            { name: "Pendaftaran Sekolah", desc: "Bantuan sekolah internasional" },
            { name: "Setup Kesehatan", desc: "Registrasi rumah sakit & asuransi" }
          ]
        },
        {
          title: "Dukungan Bisnis",
          icon: Briefcase,
          color: "rose",
          facilities: [
            { name: "Pembentukan PT PMA", desc: "Registrasi perusahaan asing" },
            { name: "Perizinan Bisnis", desc: "Pemrosesan NIB, SIUP, TDP" },
            { name: "Registrasi Pajak", desc: "Setup NPWP & PKP" },
            { name: "Virtual Office", desc: "Alamat bisnis & penanganan surat" }
          ]
        }
      ]
    }
  };

  const t = copy[language];

  const colorClasses = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <HeartHandshake className="h-4 w-4 text-accent" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {t.categories.map((category, idx) => {
          const Icon = category.icon;
          const colors = colorClasses[category.color as keyof typeof colorClasses];
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "rounded-lg p-3",
                "bg-white/80 dark:bg-white/5",
                "border border-border/30",
                "hover:shadow-md transition-all duration-200"
              )}
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className={cn("p-1.5 rounded-lg", colors.bg)}>
                  <Icon className={cn("h-4 w-4", colors.text)} />
                </div>
                <h4 className="text-[10px] sm:text-xs font-semibold text-foreground">{category.title}</h4>
              </div>

              {/* Facilities List */}
              <div className="space-y-1.5">
                {category.facilities.map((facility, i) => (
                  <div key={i} className={cn(
                    "p-1.5 rounded-md",
                    "bg-muted/30",
                    "border-l-2",
                    colors.border
                  )}>
                    <p className="text-[9px] sm:text-[10px] font-medium text-foreground">{facility.name}</p>
                    <p className="text-[8px] sm:text-[9px] text-muted-foreground">{facility.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Note */}
      <div className="mt-3 p-2.5 rounded-lg bg-accent/5 border border-accent/20">
        <div className="flex items-start gap-2">
          <Shield className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-[8px] sm:text-[9px] text-muted-foreground">
            {language === 'en' 
              ? "All facilities are provided in compliance with Indonesian law. ASTRA Villa partners with certified professionals to ensure secure and transparent investment processes."
              : "Semua fasilitas disediakan sesuai dengan hukum Indonesia. ASTRA Villa bermitra dengan profesional bersertifikat untuk memastikan proses investasi yang aman dan transparan."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WNAInvestmentFacilities;

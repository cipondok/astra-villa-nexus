import { motion } from "framer-motion";
import { Globe, Building2, Users, FileText, Briefcase, ArrowRight, CheckCircle, Phone, Shield, Scale, Crown, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const WNAInvestorPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    en: {
      back: "Back",
      hero: {
        badge: "Foreign Investor Program",
        title: "Your Gateway to Indonesia's Property Market",
        subtitle: "Legal, secure investment pathways for international investors",
        cta: "Explore Opportunities"
      },
      stats: [
        { value: "6.5%", label: "Avg ROI" },
        { value: "100+", label: "Projects" },
        { value: "500+", label: "Investors" },
        { value: "24/7", label: "Support" }
      ],
      ownership: {
        title: "Legal Ownership Options",
        subtitle: "Investment pathways under Indonesian law",
        options: [
          { 
            title: "Hak Pakai", 
            desc: "80-year leasehold, renewable",
            details: ["Direct ownership", "Renewable 30+20+30 years", "Full rental rights", "Inheritable"]
          },
          { 
            title: "PT PMA", 
            desc: "Full ownership via company",
            details: ["100% foreign ownership", "Commercial & residential", "Full property rights", "Business rights"]
          },
          { 
            title: "Nominee", 
            desc: "Structured ownership",
            details: ["Indonesian nominee holds title", "Legally binding", "Full control retained", "Notarized docs"]
          }
        ]
      },
      benefits: {
        title: "Why Invest with ASTRA Villa?",
        items: [
          { icon: Building2, title: "Premium Developments", desc: "Smart-city & luxury developments" },
          { icon: Scale, title: "Legal Expertise", desc: "Full legal support & compliance" },
          { icon: Users, title: "Residency Pathways", desc: "Long-term visa guidance" },
          { icon: Briefcase, title: "Business Support", desc: "PT PMA setup & banking" },
          { icon: Shield, title: "Investment Protection", desc: "Escrow & transparent transactions" },
          { icon: Crown, title: "VIP Services", desc: "Concierge & relocation support" }
        ]
      },
      process: {
        title: "Investment Process",
        steps: [
          { num: "01", title: "Consultation", desc: "Free goal assessment" },
          { num: "02", title: "Legal Assessment", desc: "Best ownership structure" },
          { num: "03", title: "Selection", desc: "Virtual & in-person tours" },
          { num: "04", title: "Due Diligence", desc: "Complete legal checks" },
          { num: "05", title: "Transaction", desc: "Secure escrow payment" },
          { num: "06", title: "Post-Purchase", desc: "Ongoing management" }
        ]
      },
      cta: {
        title: "Start Your Investment Journey",
        subtitle: "Join global investors who trust ASTRA Villa",
        button: "Schedule Consultation",
        download: "Investment Guide"
      }
    },
    id: {
      back: "Kembali",
      hero: {
        badge: "Program Investor Asing",
        title: "Gerbang ke Pasar Properti Indonesia",
        subtitle: "Jalur investasi legal & aman untuk investor internasional",
        cta: "Jelajahi Peluang"
      },
      stats: [
        { value: "6.5%", label: "ROI Rata-rata" },
        { value: "100+", label: "Proyek" },
        { value: "500+", label: "Investor" },
        { value: "24/7", label: "Dukungan" }
      ],
      ownership: {
        title: "Opsi Kepemilikan Legal",
        subtitle: "Jalur investasi di bawah hukum Indonesia",
        options: [
          { 
            title: "Hak Pakai", 
            desc: "Hak sewa 80 tahun, dapat diperpanjang",
            details: ["Kepemilikan langsung", "Perpanjang 30+20+30 tahun", "Hak sewa penuh", "Dapat diwariskan"]
          },
          { 
            title: "PT PMA", 
            desc: "Kepemilikan penuh via perusahaan",
            details: ["100% kepemilikan asing", "Komersial & residensial", "Hak properti penuh", "Hak operasi bisnis"]
          },
          { 
            title: "Nominee", 
            desc: "Kepemilikan terstruktur",
            details: ["Nominee Indonesia pegang hak", "Mengikat secara hukum", "Kontrol penuh", "Dokumen notaris"]
          }
        ]
      },
      benefits: {
        title: "Mengapa Investasi dengan ASTRA Villa?",
        items: [
          { icon: Building2, title: "Pengembangan Premium", desc: "Smart-city & properti mewah" },
          { icon: Scale, title: "Keahlian Legal", desc: "Dukungan legal & kepatuhan penuh" },
          { icon: Users, title: "Jalur Residensi", desc: "Panduan visa jangka panjang" },
          { icon: Briefcase, title: "Dukungan Bisnis", desc: "Setup PT PMA & perbankan" },
          { icon: Shield, title: "Perlindungan Investasi", desc: "Escrow & transaksi transparan" },
          { icon: Crown, title: "Layanan VIP", desc: "Concierge & dukungan relokasi" }
        ]
      },
      process: {
        title: "Proses Investasi",
        steps: [
          { num: "01", title: "Konsultasi", desc: "Penilaian tujuan gratis" },
          { num: "02", title: "Penilaian Legal", desc: "Struktur kepemilikan terbaik" },
          { num: "03", title: "Pemilihan", desc: "Tur virtual & langsung" },
          { num: "04", title: "Due Diligence", desc: "Pemeriksaan legal lengkap" },
          { num: "05", title: "Transaksi", desc: "Pembayaran escrow aman" },
          { num: "06", title: "Pasca-Pembelian", desc: "Manajemen berkelanjutan" }
        ]
      },
      cta: {
        title: "Mulai Perjalanan Investasi",
        subtitle: "Bergabung dengan investor global yang percaya ASTRA Villa",
        button: "Jadwalkan Konsultasi",
        download: "Panduan Investasi"
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/5 to-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-accent/10">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-7 px-2 text-xs gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {t.back}
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-medium text-accent">{t.hero.badge}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-4 pb-6 sm:pt-8 sm:pb-10 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="absolute top-10 left-5 w-32 h-32 sm:w-48 sm:h-48 bg-accent/15 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-5 right-5 w-40 h-40 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
        
        {/* Global Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-accent to-purple-500" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 bg-accent/10 backdrop-blur-sm rounded-full border border-accent/20">
              <Globe className="h-3 w-3 text-accent" />
              <span className="text-[10px] sm:text-xs font-medium text-accent">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 px-2">
              <span className="bg-gradient-to-r from-accent via-foreground to-blue-500 bg-clip-text text-transparent">
                {t.hero.title}
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mb-4 px-2">
              {t.hero.subtitle}
            </p>
            
            <Button
              size="sm"
              onClick={() => navigate('/properties')}
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground rounded-lg px-4 py-2 text-xs sm:text-sm shadow-lg shadow-accent/20"
            >
              {t.hero.cta}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-4 gap-2 mt-6 max-w-md mx-auto"
          >
            {t.stats.map((stat, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-background/70 backdrop-blur-sm border border-border/30">
                <div className="text-sm sm:text-base font-bold text-accent">{stat.value}</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ownership Options */}
      <section className="py-4 sm:py-8 bg-gradient-to-br from-accent/5 via-transparent to-primary/5">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-4 sm:mb-6"
          >
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1">
              {t.ownership.title}
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {t.ownership.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {t.ownership.options.map((option, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-2.5 sm:p-3 rounded-xl",
                  "bg-background/80 backdrop-blur-sm",
                  "border border-accent/15 hover:border-accent/30",
                  "transition-all duration-300 hover:shadow-md hover:shadow-accent/10"
                )}
              >
                <div className="p-1.5 w-fit rounded-lg bg-accent/10 mb-1.5">
                  <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold mb-0.5">{option.title}</h3>
                <p className="text-[10px] text-muted-foreground mb-2">{option.desc}</p>
                <ul className="space-y-0.5">
                  {option.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-1 text-[10px] sm:text-[11px]">
                      <CheckCircle className="h-2.5 w-2.5 text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-tight">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-4 sm:py-8">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-4 sm:mb-6"
          >
            <h2 className="text-base sm:text-lg md:text-xl font-bold">
              {t.benefits.title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {t.benefits.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-2.5 sm:p-3 rounded-xl",
                  "bg-background/70 backdrop-blur-sm",
                  "border border-accent/15 hover:border-accent/30",
                  "transition-all duration-300 hover:shadow-md hover:shadow-accent/10"
                )}
              >
                <div className="p-1.5 w-fit rounded-lg bg-accent/10 mb-1.5">
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold mb-0.5 text-foreground">{item.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-4 sm:py-8 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-4 sm:mb-6"
          >
            <h2 className="text-base sm:text-lg md:text-xl font-bold">
              {t.process.title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {t.process.steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-2.5 sm:p-3 rounded-xl",
                  "bg-background/80 backdrop-blur-sm",
                  "border border-border/30 hover:border-accent/30",
                  "transition-all duration-300"
                )}
              >
                <div className="text-lg sm:text-xl font-bold text-accent/25 mb-1">{step.num}</div>
                <h3 className="text-xs sm:text-sm font-semibold mb-0.5">{step.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4 sm:py-8">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "relative rounded-xl sm:rounded-2xl overflow-hidden p-4 sm:p-6 text-center",
              "bg-gradient-to-br from-accent/15 via-accent/10 to-blue-500/10",
              "backdrop-blur-sm border border-accent/20"
            )}
          >
            <h2 className="text-sm sm:text-base md:text-lg font-bold mb-1.5">
              {t.cta.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {t.cta.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                size="sm"
                className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-lg px-4 text-xs"
              >
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                {t.cta.button}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground rounded-lg px-4 text-xs"
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                {t.cta.download}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WNAInvestorPage;
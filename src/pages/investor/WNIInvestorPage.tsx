import { motion } from "framer-motion";
import { Home, BadgeCheck, Calculator, Shield, Plane, ArrowRight, Phone, Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const WNIInvestorPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    en: {
      back: "Back",
      hero: {
        badge: "WNI Overseas Program",
        title: "Smart Homecoming Investment Plan",
        subtitle: "Buy your dream property in Indonesia while working abroad. Your home is ready when you return.",
        cta: "Start Your Journey"
      },
      benefits: {
        title: "Why Choose ASTRA Villa?",
        items: [
          { icon: BadgeCheck, title: "Exclusive WNI Discounts", desc: "Special pricing for Indonesians working overseas" },
          { icon: Calculator, title: "Flexible Payment", desc: "Payment aligned with your overseas income" },
          { icon: Shield, title: "Legal Guarantee", desc: "Guaranteed ownership under Indonesian law" },
          { icon: Plane, title: "Ready When You Return", desc: "Property managed until you come home" },
          { icon: Home, title: "Premium Properties", desc: "Access to exclusive developments" },
          { icon: Star, title: "VIP Treatment", desc: "Dedicated consultant for your journey" }
        ]
      },
      process: {
        title: "How It Works",
        steps: [
          { num: "01", title: "Consultation", desc: "Free video call from anywhere" },
          { num: "02", title: "Selection", desc: "Virtual tours & AI matching" },
          { num: "03", title: "Payment", desc: "International payment options" },
          { num: "04", title: "Legal", desc: "Expert team handles everything" },
          { num: "05", title: "Management", desc: "Optional rental while abroad" },
          { num: "06", title: "Welcome", desc: "VIP pickup & keys handover" }
        ]
      },
      cta: {
        title: "Ready to Invest?",
        subtitle: "Join thousands of WNI who secured their dream home",
        button: "Free Consultation",
        whatsapp: "WhatsApp"
      }
    },
    id: {
      back: "Kembali",
      hero: {
        badge: "Program WNI Luar Negeri",
        title: "Rencana Investasi Pulang Cerdas",
        subtitle: "Beli properti impian di Indonesia saat bekerja di luar negeri. Rumah siap saat Anda kembali.",
        cta: "Mulai Perjalanan"
      },
      benefits: {
        title: "Mengapa ASTRA Villa?",
        items: [
          { icon: BadgeCheck, title: "Diskon Eksklusif WNI", desc: "Harga khusus untuk WNI luar negeri" },
          { icon: Calculator, title: "Pembayaran Fleksibel", desc: "Sesuai siklus penghasilan Anda" },
          { icon: Shield, title: "Jaminan Legal", desc: "Kepemilikan terjamin hukum Indonesia" },
          { icon: Plane, title: "Siap Saat Pulang", desc: "Properti dikelola sampai pulang" },
          { icon: Home, title: "Properti Premium", desc: "Akses pengembangan eksklusif" },
          { icon: Star, title: "Perlakuan VIP", desc: "Konsultan khusus untuk Anda" }
        ]
      },
      process: {
        title: "Cara Kerjanya",
        steps: [
          { num: "01", title: "Konsultasi", desc: "Video call gratis dari mana saja" },
          { num: "02", title: "Pilih Properti", desc: "Tur virtual & AI matching" },
          { num: "03", title: "Pembayaran", desc: "Opsi pembayaran internasional" },
          { num: "04", title: "Legal", desc: "Tim ahli tangani semuanya" },
          { num: "05", title: "Manajemen", desc: "Sewa opsional saat di luar negeri" },
          { num: "06", title: "Selamat Datang", desc: "Penjemputan VIP & serah terima" }
        ]
      },
      cta: {
        title: "Siap Investasi?",
        subtitle: "Bergabung dengan ribuan WNI yang sudah amankan rumah impian",
        button: "Konsultasi Gratis",
        whatsapp: "WhatsApp"
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-primary/10">
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
          <span className="text-xs font-medium text-primary">{t.hero.badge}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-4 pb-6 sm:pt-8 sm:pb-10 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-red-500/5 pointer-events-none" />
        <div className="absolute top-10 left-5 w-32 h-32 sm:w-48 sm:h-48 bg-primary/15 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-5 right-5 w-40 h-40 sm:w-64 sm:h-64 bg-red-500/10 rounded-full blur-3xl opacity-50" />
        
        {/* Indonesia Flag Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-500 to-white" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
              <Home className="h-3 w-3 text-primary" />
              <span className="text-[10px] sm:text-xs font-medium text-primary">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 px-2">
              <span className="bg-gradient-to-r from-primary via-foreground to-red-500 bg-clip-text text-transparent">
                {t.hero.title}
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mb-4 px-2">
              {t.hero.subtitle}
            </p>
            
            <Button
              size="sm"
              onClick={() => navigate('/properties')}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-lg px-4 py-2 text-xs sm:text-sm shadow-lg shadow-primary/20"
            >
              {t.hero.cta}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </motion.div>
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
                  "border border-primary/15 hover:border-primary/30",
                  "transition-all duration-300 hover:shadow-md hover:shadow-primary/10"
                )}
              >
                <div className="p-1.5 w-fit rounded-lg bg-primary/10 mb-1.5">
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
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
                  "border border-border/30 hover:border-primary/30",
                  "transition-all duration-300"
                )}
              >
                <div className="text-lg sm:text-xl font-bold text-primary/25 mb-1">{step.num}</div>
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
              "bg-gradient-to-br from-primary/15 via-primary/10 to-accent/10",
              "backdrop-blur-sm border border-primary/20"
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
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg px-4 text-xs"
              >
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                {t.cta.button}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg px-4 text-xs"
              >
                {t.cta.whatsapp}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WNIInvestorPage;
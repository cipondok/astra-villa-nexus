import { useState } from "react";
import { motion } from "framer-motion";
import { Home, BadgeCheck, Calculator, Shield, Plane, ArrowRight, CheckCircle, Phone, Mail, Building2, DollarSign, FileText, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";

const WNIInvestorPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    en: {
      hero: {
        badge: "WNI Overseas Program",
        title: "Smart Homecoming Investment Plan",
        subtitle: "Buy your dream property in Indonesia while working abroad. Your home is ready and secured when you return.",
        cta: "Start Your Journey"
      },
      benefits: {
        title: "Why Choose ASTRA Villa for WNI?",
        items: [
          { icon: BadgeCheck, title: "Exclusive WNI Discounts", desc: "Special priority pricing only for Indonesians working overseas" },
          { icon: Calculator, title: "Flexible Payment Plans", desc: "Payment schedules aligned with your overseas income cycle" },
          { icon: Shield, title: "100% Legal Guarantee", desc: "Guaranteed legal ownership under Indonesian law (Hak Milik)" },
          { icon: Plane, title: "Ready When You Return", desc: "Your property is professionally managed until you come home" },
          { icon: Home, title: "Premium Properties", desc: "Access to exclusive developments and pre-launch projects" },
          { icon: Star, title: "VIP Treatment", desc: "Dedicated consultant for your entire investment journey" }
        ]
      },
      process: {
        title: "How It Works",
        steps: [
          { num: "01", title: "Consultation", desc: "Free video call consultation from anywhere in the world" },
          { num: "02", title: "Property Selection", desc: "Virtual tours and AI-powered property matching" },
          { num: "03", title: "Secure Payment", desc: "International payment options with competitive exchange rates" },
          { num: "04", title: "Legal Processing", desc: "All legal work handled by our expert team" },
          { num: "05", title: "Property Management", desc: "Optional rental management while you're abroad" },
          { num: "06", title: "Welcome Home", desc: "VIP airport pickup and keys handover when you return" }
        ]
      },
      calculator: {
        title: "Investment Planner",
        subtitle: "Calculate your investment potential based on your overseas income"
      },
      cta: {
        title: "Ready to Invest in Your Future?",
        subtitle: "Join thousands of WNI who have secured their dream home in Indonesia",
        button: "Schedule Free Consultation",
        phone: "+62 21 1234 5678",
        whatsapp: "Chat on WhatsApp"
      }
    },
    id: {
      hero: {
        badge: "Program WNI Luar Negeri",
        title: "Rencana Investasi Pulang Cerdas",
        subtitle: "Beli properti impian Anda di Indonesia saat bekerja di luar negeri. Rumah Anda siap saat Anda kembali.",
        cta: "Mulai Perjalanan Anda"
      },
      benefits: {
        title: "Mengapa Pilih ASTRA Villa untuk WNI?",
        items: [
          { icon: BadgeCheck, title: "Diskon Eksklusif WNI", desc: "Harga prioritas khusus untuk WNI yang bekerja di luar negeri" },
          { icon: Calculator, title: "Rencana Pembayaran Fleksibel", desc: "Jadwal pembayaran sesuai siklus penghasilan luar negeri" },
          { icon: Shield, title: "Jaminan Legal 100%", desc: "Kepemilikan legal terjamin di bawah hukum Indonesia (Hak Milik)" },
          { icon: Plane, title: "Siap Saat Anda Pulang", desc: "Properti dikelola profesional sampai Anda pulang" },
          { icon: Home, title: "Properti Premium", desc: "Akses ke pengembangan eksklusif dan proyek pre-launch" },
          { icon: Star, title: "Perlakuan VIP", desc: "Konsultan khusus untuk seluruh perjalanan investasi Anda" }
        ]
      },
      process: {
        title: "Cara Kerjanya",
        steps: [
          { num: "01", title: "Konsultasi", desc: "Konsultasi video call gratis dari mana saja di dunia" },
          { num: "02", title: "Pilih Properti", desc: "Tur virtual dan pencocokan properti berbasis AI" },
          { num: "03", title: "Pembayaran Aman", desc: "Opsi pembayaran internasional dengan kurs kompetitif" },
          { num: "04", title: "Proses Legal", desc: "Semua pekerjaan legal ditangani tim ahli kami" },
          { num: "05", title: "Manajemen Properti", desc: "Manajemen sewa opsional saat Anda di luar negeri" },
          { num: "06", title: "Selamat Datang", desc: "Penjemputan VIP bandara dan serah terima kunci saat pulang" }
        ]
      },
      calculator: {
        title: "Perencana Investasi",
        subtitle: "Hitung potensi investasi berdasarkan penghasilan luar negeri Anda"
      },
      cta: {
        title: "Siap Investasi untuk Masa Depan?",
        subtitle: "Bergabung dengan ribuan WNI yang telah mengamankan rumah impian di Indonesia",
        button: "Jadwalkan Konsultasi Gratis",
        phone: "+62 21 1234 5678",
        whatsapp: "Chat di WhatsApp"
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-red-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl opacity-50" />
        
        {/* Indonesia Flag Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-red-500 to-white" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
              <Home className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-foreground to-red-500 bg-clip-text text-transparent">
                {t.hero.title}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t.hero.subtitle}
            </p>
            
            <Button
              size="lg"
              onClick={() => navigate('/properties')}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl px-8 py-6 text-lg shadow-xl shadow-primary/25"
            >
              {t.hero.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t.benefits.title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.benefits.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full bg-background/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="p-3 w-fit rounded-xl bg-primary/10 mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t.process.title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.process.steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="p-6 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-all duration-300">
                  <div className="text-4xl font-bold text-primary/20 mb-4">{step.num}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center",
              "bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10",
              "border border-primary/30"
            )}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t.cta.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t.cta.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl px-8"
              >
                <Phone className="mr-2 h-5 w-5" />
                {t.cta.button}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-xl px-8"
              >
                {t.cta.whatsapp}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <ProfessionalFooter language={language} />
    </div>
  );
};

export default WNIInvestorPage;

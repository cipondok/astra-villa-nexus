import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Building2, Users, FileText, Briefcase, ArrowRight, CheckCircle, Phone, Shield, Scale, Landmark, MapPin, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";

const WNAInvestorPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    en: {
      hero: {
        badge: "Foreign Investor Program",
        title: "Your Gateway to Indonesia's Property Market",
        subtitle: "Legal, secure, and professionally managed investment pathways for international investors",
        cta: "Explore Opportunities"
      },
      stats: [
        { value: "6.5%", label: "Average Annual ROI" },
        { value: "100+", label: "Premium Projects" },
        { value: "500+", label: "Happy Investors" },
        { value: "24/7", label: "Support Available" }
      ],
      ownership: {
        title: "Legal Ownership Options for Foreign Investors",
        subtitle: "Understanding your investment pathways under Indonesian law",
        options: [
          { 
            title: "Hak Pakai (Right to Use)", 
            desc: "80-year leasehold on properties, renewable",
            details: ["Direct ownership for foreigners", "Renewable every 30+20+30 years", "Full usage and rental rights", "Can be inherited"]
          },
          { 
            title: "PT PMA (Foreign Investment Company)", 
            desc: "Full ownership through Indonesian company",
            details: ["100% foreign ownership possible", "Commercial & residential properties", "Full property rights", "Business operation rights"]
          },
          { 
            title: "Nominee Agreement", 
            desc: "Structured ownership with legal protection",
            details: ["Indonesian nominee holds title", "Legally binding agreements", "Full control retained", "Notarized documentation"]
          }
        ]
      },
      benefits: {
        title: "Why Invest in Indonesia with ASTRA Villa?",
        items: [
          { icon: Building2, title: "Premium Developments", desc: "Access to exclusive smart-city and luxury developments across Indonesia" },
          { icon: Scale, title: "Legal Expertise", desc: "Full legal support for ownership structures, permits, and compliance" },
          { icon: Users, title: "Residency Pathways", desc: "Guidance on long-term stay visas and residency options" },
          { icon: Briefcase, title: "Business Support", desc: "PT PMA setup, banking, and business establishment assistance" },
          { icon: Shield, title: "Investment Protection", desc: "Escrow services and guaranteed transparent transactions" },
          { icon: Crown, title: "VIP Services", desc: "Personal concierge, airport pickup, and relocation support" }
        ]
      },
      process: {
        title: "Investment Process",
        steps: [
          { num: "01", title: "Initial Consultation", desc: "Free consultation to understand your investment goals" },
          { num: "02", title: "Legal Assessment", desc: "Determine the best ownership structure for your needs" },
          { num: "03", title: "Property Selection", desc: "Virtual tours and in-person viewings of premium properties" },
          { num: "04", title: "Due Diligence", desc: "Complete legal checks and verification" },
          { num: "05", title: "Transaction", desc: "Secure payment processing with escrow protection" },
          { num: "06", title: "Post-Purchase", desc: "Property management, rental, and ongoing support" }
        ]
      },
      locations: {
        title: "Top Investment Locations",
        areas: ["Bali", "Jakarta", "Lombok", "Yogyakarta", "Bandung", "Surabaya"]
      },
      cta: {
        title: "Start Your Indonesia Investment Journey",
        subtitle: "Join global investors who trust ASTRA Villa for secure property investments",
        button: "Schedule Consultation",
        download: "Download Investment Guide"
      }
    },
    id: {
      hero: {
        badge: "Program Investor Asing",
        title: "Gerbang Anda ke Pasar Properti Indonesia",
        subtitle: "Jalur investasi yang legal, aman, dan dikelola secara profesional untuk investor internasional",
        cta: "Jelajahi Peluang"
      },
      stats: [
        { value: "6.5%", label: "ROI Tahunan Rata-rata" },
        { value: "100+", label: "Proyek Premium" },
        { value: "500+", label: "Investor Puas" },
        { value: "24/7", label: "Dukungan Tersedia" }
      ],
      ownership: {
        title: "Opsi Kepemilikan Legal untuk Investor Asing",
        subtitle: "Memahami jalur investasi Anda di bawah hukum Indonesia",
        options: [
          { 
            title: "Hak Pakai", 
            desc: "Hak sewa 80 tahun atas properti, dapat diperpanjang",
            details: ["Kepemilikan langsung untuk WNA", "Dapat diperpanjang setiap 30+20+30 tahun", "Hak penggunaan dan sewa penuh", "Dapat diwariskan"]
          },
          { 
            title: "PT PMA (Perusahaan Investasi Asing)", 
            desc: "Kepemilikan penuh melalui perusahaan Indonesia",
            details: ["Kepemilikan asing 100% dimungkinkan", "Properti komersial & residensial", "Hak properti penuh", "Hak operasi bisnis"]
          },
          { 
            title: "Perjanjian Nominee", 
            desc: "Kepemilikan terstruktur dengan perlindungan hukum",
            details: ["Nominee Indonesia memegang hak milik", "Perjanjian mengikat secara hukum", "Kontrol penuh dipertahankan", "Dokumentasi notaris"]
          }
        ]
      },
      benefits: {
        title: "Mengapa Investasi di Indonesia dengan ASTRA Villa?",
        items: [
          { icon: Building2, title: "Pengembangan Premium", desc: "Akses ke pengembangan smart-city dan mewah eksklusif di seluruh Indonesia" },
          { icon: Scale, title: "Keahlian Legal", desc: "Dukungan legal penuh untuk struktur kepemilikan, izin, dan kepatuhan" },
          { icon: Users, title: "Jalur Residensi", desc: "Panduan tentang visa tinggal jangka panjang dan opsi residensi" },
          { icon: Briefcase, title: "Dukungan Bisnis", desc: "Setup PT PMA, perbankan, dan bantuan pendirian bisnis" },
          { icon: Shield, title: "Perlindungan Investasi", desc: "Layanan escrow dan transaksi transparan terjamin" },
          { icon: Crown, title: "Layanan VIP", desc: "Concierge pribadi, penjemputan bandara, dan dukungan relokasi" }
        ]
      },
      process: {
        title: "Proses Investasi",
        steps: [
          { num: "01", title: "Konsultasi Awal", desc: "Konsultasi gratis untuk memahami tujuan investasi Anda" },
          { num: "02", title: "Penilaian Legal", desc: "Tentukan struktur kepemilikan terbaik untuk kebutuhan Anda" },
          { num: "03", title: "Pemilihan Properti", desc: "Tur virtual dan kunjungan langsung ke properti premium" },
          { num: "04", title: "Due Diligence", desc: "Pemeriksaan dan verifikasi legal lengkap" },
          { num: "05", title: "Transaksi", desc: "Pemrosesan pembayaran aman dengan perlindungan escrow" },
          { num: "06", title: "Pasca-Pembelian", desc: "Manajemen properti, sewa, dan dukungan berkelanjutan" }
        ]
      },
      locations: {
        title: "Lokasi Investasi Teratas",
        areas: ["Bali", "Jakarta", "Lombok", "Yogyakarta", "Bandung", "Surabaya"]
      },
      cta: {
        title: "Mulai Perjalanan Investasi Indonesia Anda",
        subtitle: "Bergabung dengan investor global yang mempercayai ASTRA Villa untuk investasi properti yang aman",
        button: "Jadwalkan Konsultasi",
        download: "Unduh Panduan Investasi"
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
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-blue-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
        
        {/* Global Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-accent to-purple-500" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-accent/10 backdrop-blur-sm rounded-full border border-accent/20">
              <Globe className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-accent via-foreground to-blue-500 bg-clip-text text-transparent">
                {t.hero.title}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t.hero.subtitle}
            </p>
            
            <Button
              size="lg"
              onClick={() => navigate('/properties')}
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground rounded-xl px-8 py-6 text-lg shadow-xl shadow-accent/25"
            >
              {t.hero.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
          >
            {t.stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/40">
                <div className="text-2xl sm:text-3xl font-bold text-accent">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ownership Options */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-accent/5 via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t.ownership.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.ownership.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.ownership.options.map((option, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full bg-background/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="p-3 w-fit rounded-xl bg-accent/10 mb-4">
                      <Scale className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {option.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
                <Card className="h-full bg-background/60 backdrop-blur-sm border-accent/20 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="p-3 w-fit rounded-xl bg-accent/10 mb-4">
                      <item.icon className="h-6 w-6 text-accent" />
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
                <div className="p-6 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/40 hover:border-accent/40 transition-all duration-300">
                  <div className="text-4xl font-bold text-accent/20 mb-4">{step.num}</div>
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
              "bg-gradient-to-br from-accent/20 via-accent/10 to-blue-500/10",
              "border border-accent/30"
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
                className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl px-8"
              >
                <Phone className="mr-2 h-5 w-5" />
                {t.cta.button}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground rounded-xl px-8"
              >
                <FileText className="mr-2 h-5 w-5" />
                {t.cta.download}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <ProfessionalFooter language={language} />
    </div>
  );
};

export default WNAInvestorPage;

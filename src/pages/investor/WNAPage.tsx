import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Globe, 
  Shield, 
  CheckCircle, 
  Building2, 
  Scale, 
  Briefcase, 
  Users, 
  Award,
  Phone,
  MessageSquare,
  TrendingUp,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import InvestorAuthSection from '@/components/auth/InvestorAuthSection';

const WNAPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const copy = {
    en: {
      back: "Back",
      badge: "Foreign Investment Program",
      title: "Invest Legally in Premium Indonesian Property",
      subtitle: "Indonesia is one of the fastest-growing smart city and property markets in Southeast Asia. ASTRA Villa opens the door for international investors.",
      
      benefits: [
        { icon: Scale, title: "Legal Investment", desc: "Invest legally in premium houses and apartments with proper structures" },
        { icon: Building2, title: "Smart-City Access", desc: "Access top smart-city development projects across Indonesia" },
        { icon: Shield, title: "Expert Legal Guidance", desc: "Receive expert legal guidance for ownership structures (Hak Pakai, PT PMA)" },
        { icon: TrendingUp, title: "Residency Pathways", desc: "Explore long-term stay pathways and residency options" },
        { icon: Briefcase, title: "Business & Investment", desc: "Open businesses and invest with family support systems" },
        { icon: Users, title: "Fully Managed", desc: "Enjoy a trusted, fully managed investment process" }
      ],

      disclaimer: "All investments are handled strictly under Indonesian law, supported by our expert legal and development team.",
      
      vipTitle: "VIP End-to-End Experience",
      vipFeatures: [
        "Dedicated expert consultants",
        "Legal & compliance guarantee",
        "Fast-track processing",
        "VIP airport pickup & relocation assistance",
        "Banking, tax, business, and residency support",
        "Seamless move-in experience"
      ],

      ownershipTitle: "Ownership Structures for WNA",
      ownershipTypes: [
        { name: "Hak Pakai", desc: "Right to Use - Up to 80 years for residential property" },
        { name: "PT PMA", desc: "Foreign-owned company structure for property investment" },
        { name: "Nominee", desc: "Partnership structures with Indonesian entities (with legal safeguards)" }
      ],

      ctaTitle: "Start Your Indonesian Investment Journey",
      ctaSubtitle: "Connect with our international investment team today",
      ctaButton: "Contact Investment Team",
      ctaChat: "Chat With AI Assistant"
    },
    id: {
      back: "Kembali",
      badge: "Program Investasi Asing",
      title: "Investasi Legal di Properti Premium Indonesia",
      subtitle: "Indonesia adalah salah satu pasar properti dan kota pintar dengan pertumbuhan tercepat di Asia Tenggara. ASTRA Villa membuka pintu untuk investor internasional.",
      
      benefits: [
        { icon: Scale, title: "Investasi Legal", desc: "Investasi legal di rumah dan apartemen premium dengan struktur yang tepat" },
        { icon: Building2, title: "Akses Kota Pintar", desc: "Akses proyek pengembangan kota pintar terbaik di seluruh Indonesia" },
        { icon: Shield, title: "Bimbingan Legal Ahli", desc: "Terima bimbingan legal ahli untuk struktur kepemilikan (Hak Pakai, PT PMA)" },
        { icon: TrendingUp, title: "Jalur Residensi", desc: "Jelajahi jalur tinggal jangka panjang dan opsi residensi" },
        { icon: Briefcase, title: "Bisnis & Investasi", desc: "Buka bisnis dan investasi dengan dukungan sistem keluarga" },
        { icon: Users, title: "Dikelola Penuh", desc: "Nikmati proses investasi terpercaya dan dikelola sepenuhnya" }
      ],

      disclaimer: "Semua investasi ditangani secara ketat di bawah hukum Indonesia, didukung oleh tim legal dan pengembangan ahli kami.",
      
      vipTitle: "Pengalaman VIP End-to-End",
      vipFeatures: [
        "Konsultan ahli khusus",
        "Jaminan legal & kepatuhan",
        "Proses cepat",
        "Penjemputan VIP bandara & bantuan relokasi",
        "Dukungan perbankan, pajak, bisnis, dan residensi",
        "Pengalaman pindah yang mulus"
      ],

      ownershipTitle: "Struktur Kepemilikan untuk WNA",
      ownershipTypes: [
        { name: "Hak Pakai", desc: "Hak Pakai - Hingga 80 tahun untuk properti residensial" },
        { name: "PT PMA", desc: "Struktur perusahaan milik asing untuk investasi properti" },
        { name: "Nominee", desc: "Struktur kemitraan dengan entitas Indonesia (dengan perlindungan legal)" }
      ],

      ctaTitle: "Mulai Perjalanan Investasi Indonesia Anda",
      ctaSubtitle: "Hubungi tim investasi internasional kami hari ini",
      ctaButton: "Hubungi Tim Investasi",
      ctaChat: "Chat dengan Asisten AI"
    }
  };

  const t = copy[language];

  const openChat = () => {
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Back Header */}
      <div className="sticky top-10 md:top-11 lg:top-12 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-6xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-1.5 text-xs sm:text-sm h-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.back}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-blue-500/5 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-3 py-8 sm:px-4 sm:py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-accent/10 border border-accent/20 rounded-full">
              <span className="text-lg">🌍</span>
              <span className="text-[10px] sm:text-xs font-semibold text-accent">{t.badge}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {t.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {t.benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={cn(
                  "relative overflow-hidden rounded-xl p-4 sm:p-5",
                  "bg-background/80 backdrop-blur-xl",
                  "border border-border/40 hover:border-accent/40",
                  "shadow-sm hover:shadow-lg hover:shadow-accent/10",
                  "transition-all duration-300"
                )}
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent/20 to-blue-500/20 border border-accent/30 mb-3">
                  <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                  {benefit.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 sm:mt-8 p-4 rounded-xl bg-accent/5 border border-accent/20"
          >
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t.disclaimer}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ownership Types */}
      <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-4 sm:mb-6 text-center">
            {t.ownershipTitle}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {t.ownershipTypes.map((type, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-4 rounded-xl text-center",
                  "bg-background/80 backdrop-blur-xl",
                  "border border-accent/30"
                )}
              >
                <h3 className="text-sm sm:text-base font-semibold text-accent mb-1">
                  {type.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {type.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Section */}
      <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "rounded-2xl p-5 sm:p-6 md:p-8",
              "bg-gradient-to-br from-background/90 via-background/80 to-accent/10",
              "backdrop-blur-xl",
              "border border-accent/30 shadow-xl shadow-accent/10"
            )}
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-blue-500/20 border border-accent/30">
                <Award className="h-4 w-4 text-accent" />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                {t.vipTitle}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {t.vipFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auth & CTA Section */}
      <section className="px-3 py-8 sm:px-4 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Auth Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
            >
              <InvestorAuthSection investorType="wna" />
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                {t.ctaTitle}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">
                {t.ctaSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate('/contact')}
                  className="gap-2 w-full sm:w-auto bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600"
                >
                  <Phone className="h-4 w-4" />
                  {t.ctaButton}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={openChat}
                  className="gap-2 w-full sm:w-auto border-accent/50 hover:bg-accent/10"
                >
                  <MessageSquare className="h-4 w-4" />
                  {t.ctaChat}
                </Button>
              </div>
              {isAuthenticated && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/dashboard')} 
                  className="mt-3 gap-2 text-accent hover:text-accent/80"
                >
                  <UserCircle className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Tagline */}
      <section className="px-3 py-6 sm:px-4 sm:py-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
            ASTRA Villa is your trusted gateway to Indonesia.
          </p>
          <p className="text-xs sm:text-sm text-accent mt-1">
            Invest Smart. Live Secure. Grow with Indonesia.
          </p>
        </div>
      </section>
    </div>
  );
};

export default WNAPage;

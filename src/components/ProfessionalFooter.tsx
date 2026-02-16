import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Handshake, ChevronDown, Home, ShoppingCart, Key, UsersRound, Construction, Search, MessageSquare, Calculator, PiggyBank, HelpCircle, CircleHelp, PhoneCall, Shield, FileText, Cookie, MapPin, Glasses, UserCheck } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const [isPartnersOpen, setIsPartnersOpen] = useState(false);

  const { data: footerLogoUrl } = useQuery({
    queryKey: ['branding', 'footerLogo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('category', 'branding')
        .eq('key', 'footerLogo')
        .maybeSingle();
      if (error || !data?.value) return null;
      const value = typeof data.value === 'string' ? data.value : null;
      return value && value.trim() !== '' ? value : null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const text = {
    en: {
      company: "Astra Villa",
      tagline: "Your trusted real estate partner",
      quickLinks: "Quick Links",
      services: "Services",
      support: "Support",
      allRights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookies: "Cookie Policy",
      home: "Home",
      buy: "Buy",
      rent: "Rent",
      community: "Community",
      propertySearch: "Property Search",
      consultation: "Consultation",
      valuation: "Property Valuation",
      investment: "Investment Advisory",
      help: "Help Center",
      faq: "FAQ",
      contactUs: "Contact Us",
      businessPartners: "Business Partners",
      partnerNetwork: "Partner Network",
      becomePartner: "Become a Partner",
      partnerBenefits: "Partner Benefits",
      jointVentures: "Joint Ventures",
    },
    id: {
      company: "Astra Villa",
      tagline: "Mitra real estate terpercaya Anda",
      quickLinks: "Tautan Cepat",
      services: "Layanan",
      support: "Dukungan",
      allRights: "Semua hak dilindungi.",
      privacy: "Kebijakan Privasi",
      terms: "Syarat Layanan",
      cookies: "Kebijakan Cookie",
      home: "Beranda",
      buy: "Beli",
      rent: "Sewa",
      community: "Komunitas",
      propertySearch: "Pencarian Properti",
      consultation: "Konsultasi",
      valuation: "Valuasi Properti",
      investment: "Konsultan Investasi",
      help: "Pusat Bantuan",
      faq: "FAQ",
      contactUs: "Hubungi Kami",
      businessPartners: "Mitra Bisnis",
      partnerNetwork: "Jaringan Mitra",
      becomePartner: "Jadi Mitra",
      partnerBenefits: "Manfaat Mitra",
      jointVentures: "Usaha Patungan",
    },
  };

  const currentText = text[language];

  const quickLinks = [
    { to: "/", label: currentText.home, icon: Home },
    { to: "/dijual", label: currentText.buy, icon: ShoppingCart },
    { to: "/disewa", label: currentText.rent, icon: Key },
    { to: "/vr-tour", label: language === "en" ? "VR Tour" : "Tur VR", icon: Glasses },
    { to: "/location", label: language === "en" ? "Location Map" : "Peta Lokasi", icon: MapPin },
    { to: "/community", label: currentText.community, icon: UsersRound },
    { to: "/agents", label: language === "en" ? "Find Agents" : "Cari Agen", icon: UserCheck },
    { to: "/development", label: language === "en" ? "Development" : "Pengembangan", icon: Construction },
  ];

  const serviceLinks = [
    { label: currentText.propertySearch, icon: Search },
    { label: currentText.consultation, icon: MessageSquare },
    { label: currentText.valuation, icon: Calculator },
    { label: currentText.investment, icon: PiggyBank },
  ];

  const supportLinks = [
    { label: currentText.help, icon: HelpCircle },
    { label: currentText.faq, icon: CircleHelp },
    { label: currentText.contactUs, icon: PhoneCall },
  ];

  const socialIcons = [
    { icon: '𝕏', label: 'Twitter' },
    { icon: 'ⓕ', label: 'Facebook' },
    { icon: <Instagram className="w-5 h-5" />, label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, label: 'YouTube' },
  ];

  return (
    <footer className="w-full border-t border-border/50 dark:border-primary/20 backdrop-blur-xl bg-gradient-to-br from-secondary/80 via-background to-muted/60 dark:from-[hsl(210,55%,8%)] dark:via-[hsl(200,50%,10%)] dark:to-[hsl(210,45%,6%)] shadow-[0_-10px_40px_-15px_hsl(var(--glass-shadow)/0.2)] dark:shadow-[0_-10px_40px_-15px_rgba(0,10,20,0.5)] px-4 md:px-8 py-5 transition-colors duration-200">
      {/* Row 1: Brand + All Links */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
        {/* Brand */}
        <div className="flex items-center gap-3 mr-6">
          {footerLogoUrl ? (
            <img src={footerLogoUrl} alt={currentText.company} className="h-12 max-w-[160px] object-contain" loading="lazy" />
          ) : (
            <>
              <div className="p-2 rounded-lg bg-primary/15 dark:bg-primary/20">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">{currentText.company}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <span className="text-border dark:text-primary/30">|</span>

        {/* Quick links */}
        {quickLinks.map(link => (
          <Link key={link.to} to={link.to} className="relative group hover:opacity-70 inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title={link.label}>
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </Link>
        ))}

        <span className="text-border dark:text-primary/30">|</span>

        {/* Service links */}
        {serviceLinks.map(link => (
          <span key={link.label} className="relative group cursor-pointer hover:opacity-70 inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title={link.label}>
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </span>
        ))}

        <span className="text-border dark:text-primary/30">|</span>

        {/* Support links */}
        {supportLinks.map(link => (
          <span key={link.label} className="relative group cursor-pointer hover:opacity-70 inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title={link.label}>
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </span>
        ))}
      </div>

      {/* Row 2: Social + Copyright */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {/* Social icons */}
        <div className="flex items-center gap-2">
          {socialIcons.map((s, i) => (
            <a
              key={i}
              href="#"
              className="hover:opacity-80 transition-opacity inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 border border-border dark:border-primary/30 text-muted-foreground hover:text-primary shadow-sm"
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
          <span className="text-xs text-muted-foreground">@astravilla</span>
        </div>

        <span className="text-border dark:text-primary/30">|</span>

        {/* Copyright */}
        <span className="text-xs text-muted-foreground font-medium">
          © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
        </span>

        <span className="text-xs text-primary/70 dark:text-primary/60">✦ Astra Villa ✦</span>

        {/* Glass dots inline */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-primary/30 dark:bg-primary/40 shadow-[inset_0_1px_3px_hsl(var(--primary)/0.3)]" />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

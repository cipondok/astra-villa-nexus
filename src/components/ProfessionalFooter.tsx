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

  const footerContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 'none',
    margin: '0',
    borderRadius: '0',
    background: `
      radial-gradient(circle at 10% 20%, rgba(15,25,40,0.98) 0%, transparent 40%),
      radial-gradient(circle at 90% 70%, rgba(30,80,120,0.6) 5%, transparent 40%),
      linear-gradient(125deg, rgba(10,20,35,0.95) 0%, rgba(20,60,100,0.7) 18%, rgba(15,45,80,0.8) 42%, rgba(25,70,110,0.6) 68%, rgba(10,20,35,0.97) 92%)
    `,
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    border: 'none',
    borderTop: '1px solid rgba(80,160,220,0.3)',
    boxShadow: '0 -10px 40px -15px rgba(0,10,20,0.5), inset 0 1px 6px rgba(80,160,220,0.15), inset 0 0 35px rgba(30,80,130,0.2)',
    padding: '1.2rem 2rem',
    transition: 'box-shadow 0.3s ease, border-color 0.2s ease',
  };

  const colStyle: React.CSSProperties = {
    padding: '1.6rem 1.2rem',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
  };

  const socialRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.9rem 2rem',
    margin: '1.8rem 0',
    padding: '1rem 1.8rem',
    background: 'rgba(20,60,100,0.3)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '12px',
    border: '1px solid rgba(60,140,200,0.3)',
  };

  const socialIconBase: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(30,70,110,0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1.5px solid rgba(80,160,220,0.5)',
    boxShadow: '0 8px 18px -8px rgba(0,0,0,0.5), inset 0 2px 8px rgba(60,140,200,0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.7rem',
    color: '#a0d0f0',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const copyrightStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.2rem',
    padding: '1rem 1.8rem',
    fontSize: '0.95rem',
    color: '#8cbfe0',
    fontWeight: 450,
    marginTop: '1rem',
  };

  const colTitleGradient: React.CSSProperties = {
    background: 'linear-gradient(135deg, #7ec8f0, #a0d8f5, #5bb8e8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '1px',
    fontSize: '1.3rem',
    fontWeight: 600,
    marginBottom: '1rem',
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#a0d0f0',
    fontWeight: 450,
    padding: '0.2rem 0.4rem',
    transition: 'all 0.15s ease',
    display: 'inline-block',
    fontSize: '0.95rem',
  };

  const copyrightBadge: React.CSSProperties = {
    padding: '0.3rem 1.4rem',
  };

  const dotColors = [
    'rgba(40,110,170,0.7)',
    'rgba(60,140,200,0.7)',
    'rgba(50,120,180,0.8)',
    'rgba(70,150,210,0.8)',
    'rgba(45,115,175,0.7)',
    'rgba(55,130,190,0.7)',
    'rgba(35,100,160,0.75)',
  ];

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
    { icon: '𝕏', bg: 'rgba(30,80,130,0.6)', label: 'Twitter' },
    { icon: 'ⓕ', bg: 'rgba(25,70,120,0.6)', label: 'Facebook' },
    { icon: <Instagram className="w-5 h-5" />, bg: 'rgba(35,85,135,0.6)', label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, bg: 'rgba(30,75,125,0.6)', label: 'YouTube' },
  ];

  return (
    <footer style={footerContainerStyle}>
      {/* Row 1: Brand + All Links in one flowing row */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
        {/* Brand */}
        <div className="flex items-center gap-3 mr-6">
          {footerLogoUrl ? (
            <img src={footerLogoUrl} alt={currentText.company} className="h-12 max-w-[160px] object-contain" loading="lazy" />
          ) : (
            <>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(40,100,160,0.5)' }}>
                <Rocket className="w-7 h-7" style={{ color: '#a0d0f0' }} />
              </div>
              <span className="text-lg font-bold" style={{ color: '#c0e0f5' }}>{currentText.company}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <span style={{ color: 'rgba(60,140,200,0.4)' }}>|</span>

        {/* All links as icon-only with tooltip on hover */}
        {quickLinks.map(link => (
          <Link key={link.to} to={link.to} style={linkStyle} className="relative group hover:opacity-70 inline-flex items-center justify-center" title={link.label}>
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </Link>
        ))}

        <span style={{ color: 'rgba(60,140,200,0.4)' }}>|</span>

        {serviceLinks.map(link => (
          <span key={link.label} style={linkStyle} className="relative group cursor-pointer hover:opacity-70 inline-flex items-center justify-center" title={link.label}>
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </span>
        ))}

        <span style={{ color: 'rgba(60,140,200,0.4)' }}>|</span>

        {supportLinks.map(link => (
          <span key={link.label} style={linkStyle} className="relative group cursor-pointer hover:opacity-70 inline-flex items-center justify-center" title={link.label}>
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
              className="hover:opacity-80 transition-opacity inline-flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: s.bg,
                border: '1px solid rgba(60,140,200,0.4)',
                boxShadow: '0 4px 10px -4px rgba(0,0,0,0.4), inset 0 1px 4px rgba(60,140,200,0.2)',
                color: '#a0d0f0',
                fontSize: '1rem',
              }}
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
          <span className="text-xs" style={{ color: '#8cbfe0' }}>@astravilla</span>
        </div>

        <span style={{ color: 'rgba(60,140,200,0.4)' }}>|</span>

        {/* Copyright */}
        <span className="text-xs" style={{ color: '#8cbfe0', fontWeight: 450 }}>
          © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
        </span>

        <span className="text-xs" style={{ color: '#7ab5d8' }}>✦ Astra Villa ✦</span>

        {/* Glass dots inline */}
        <div className="flex items-center gap-1.5">
          {dotColors.map((bg, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: bg, boxShadow: 'inset 0 1px 3px rgba(80,160,220,0.4)' }} />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

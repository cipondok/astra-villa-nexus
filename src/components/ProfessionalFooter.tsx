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
      radial-gradient(circle at 10% 20%, rgba(255,255,255,0.95) 0%, transparent 40%),
      radial-gradient(circle at 90% 70%, rgba(255,240,150,0.6) 5%, transparent 40%),
      linear-gradient(125deg, rgba(255,255,255,0.92) 0%, rgba(255,225,100,0.4) 18%, rgba(140,210,230,0.5) 42%, rgba(255,245,190,0.7) 68%, rgba(255,255,255,0.96) 92%)
    `,
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    border: 'none',
    borderTop: '1px solid rgba(255,255,240,0.7)',
    boxShadow: '0 -10px 40px -15px rgba(0,20,30,0.3), inset 0 1px 6px rgba(255,255,255,0.9), inset 0 0 35px rgba(250,230,130,0.3)',
    padding: '2.8rem 2.2rem 2.2rem 2.2rem',
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
    background: 'rgba(10,50,60,0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '12px',
    border: '1px solid rgba(255,245,160,0.5)',
  };

  const socialIconBase: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1.5px solid rgba(255,250,180,0.8)',
    boxShadow: '0 8px 18px -8px black, inset 0 2px 8px rgba(255,255,250,0.9)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.7rem',
    color: '#0c404e',
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
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '12px',
    border: '1px solid rgba(255,245,130,0.6)',
    fontSize: '0.95rem',
    color: '#022b36',
    fontWeight: 450,
    marginTop: '1rem',
  };

  const colTitleGradient: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f8f0c6, #c1e4f0, #fdeba9)',
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
    color: '#0c4455',
    fontWeight: 450,
    background: 'rgba(255,255,200,0.15)',
    padding: '0.2rem 1rem',
    borderRadius: '40px',
    backdropFilter: 'blur(2px)',
    transition: 'all 0.15s ease',
    display: 'inline-block',
    fontSize: '0.95rem',
  };

  const copyrightBadge: React.CSSProperties = {
    background: 'rgba(255,255,240,0.2)',
    padding: '0.3rem 1.4rem',
    borderRadius: '60px',
    backdropFilter: 'blur(4px)',
  };

  const dotColors = [
    'rgba(255,215,100,0.7)',
    'rgba(190,230,250,0.7)',
    'rgba(255,240,170,0.8)',
    'rgba(210,235,220,0.8)',
    'rgba(255,210,160,0.7)',
    'rgba(220,200,245,0.7)',
    'rgba(245,195,110,0.75)',
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
    { icon: '𝕏', bg: 'rgba(255,220,120,0.5)', label: 'Twitter' },
    { icon: 'ⓕ', bg: 'rgba(190,230,250,0.6)', label: 'Facebook' },
    { icon: <Instagram className="w-5 h-5" />, bg: 'rgba(255,240,180,0.7)', label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, bg: 'rgba(210,240,230,0.6)', label: 'YouTube' },
  ];

  return (
    <footer style={footerContainerStyle} className="group">
      {/* Footer Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-3 mb-6">
        {/* Column 1 - Company */}
        <div style={colStyle} className="hover:translate-y-[-4px] hover:bg-white/20 col-span-2 md:col-span-1">
          <div className="flex items-center justify-center gap-2 mb-3">
            {footerLogoUrl ? (
              <img src={footerLogoUrl} alt={currentText.company} className="h-10 max-w-[140px] object-contain" loading="lazy" />
            ) : (
              <>
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(255,225,100,0.4)' }}>
                  <Rocket className="w-5 h-5" style={{ color: '#0c404e' }} />
                </div>
                <span className="text-lg font-bold" style={{ color: '#0a3340' }}>{currentText.company}</span>
              </>
            )}
          </div>
          <p className="text-sm mb-3" style={{ color: '#0a3340', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
            {currentText.tagline}
          </p>
          <div className="flex flex-col gap-1.5 text-sm" style={{ color: '#0c4455' }}>
            <div className="flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs">Seminyak, Bali</span>
            </div>
            <a href="tel:+622112345678" className="flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs">+62 21 1234 5678</span>
            </a>
            <a href="mailto:info@astravilla.com" className="flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs">info@astravilla.com</span>
            </a>
          </div>
        </div>

        {/* Column 2 - Quick Links */}
        <div style={colStyle} className="hover:translate-y-[-4px] hover:bg-white/20">
          <h3 style={colTitleGradient}>✦ {currentText.quickLinks} ✦</h3>
          <ul className="space-y-1.5">
            {quickLinks.map(link => (
              <li key={link.to}>
                <Link to={link.to} style={linkStyle} className="hover:bg-yellow-100/50 hover:scale-[1.03]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 - Services */}
        <div style={colStyle} className="hover:translate-y-[-4px] hover:bg-white/20">
          <h3 style={colTitleGradient}>✦ {currentText.services} ✦</h3>
          <ul className="space-y-1.5">
            {serviceLinks.map(link => (
              <li key={link.label}>
                <span style={linkStyle} className="cursor-pointer hover:bg-yellow-100/50 hover:scale-[1.03]">
                  {link.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 - Support */}
        <div style={colStyle} className="hover:translate-y-[-4px] hover:bg-white/20">
          <h3 style={colTitleGradient}>✦ {currentText.support} ✦</h3>
          <ul className="space-y-1.5">
            {supportLinks.map(link => (
              <li key={link.label}>
                <span style={linkStyle} className="cursor-pointer hover:bg-yellow-100/50 hover:scale-[1.03]">
                  {link.label}
                </span>
              </li>
            ))}
          </ul>

          {/* Partners Collapsible */}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,245,180,0.3)' }}>
            <Collapsible open={isPartnersOpen} onOpenChange={setIsPartnersOpen}>
              <CollapsibleTrigger className="flex items-center justify-center gap-1.5 text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: '#0c4455' }}>
                <Handshake className="w-4 h-4" />
                <span>{currentText.businessPartners}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPartnersOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-1.5">
                {[
                  { to: "/partners/network", label: currentText.partnerNetwork },
                  { to: "/partners/become", label: currentText.becomePartner },
                  { to: "/partners/benefits", label: currentText.partnerBenefits },
                  { to: "/partners/ventures", label: currentText.jointVentures },
                ].map(p => (
                  <Link key={p.to} to={p.to} style={linkStyle} className="hover:bg-yellow-100/50 hover:scale-[1.03]">
                    {p.label}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Social Media Row */}
      <div style={socialRowStyle}>
        {socialIcons.map((s, i) => (
          <a
            key={i}
            href="#"
            style={{ ...socialIconBase, background: s.bg }}
            className="hover:translate-y-[-6px] hover:scale-[1.08]"
            aria-label={s.label}
          >
            {s.icon}
          </a>
        ))}
        <span
          style={{
            color: '#083945',
            fontWeight: 400,
            background: 'rgba(255,240,160,0.2)',
            padding: '0.4rem 1.4rem',
            borderRadius: '40px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,230,130,0.3)',
          }}
        >
          @astravilla
        </span>
      </div>

      {/* Copyright Area */}
      <div style={copyrightStyle} className="flex-col md:flex-row text-center md:text-left">
        <span style={copyrightBadge}>© {new Date().getFullYear()} {currentText.company}. {currentText.allRights}</span>
        <span style={{
          background: 'rgba(255,230,140,0.25)',
          padding: '0.3rem 1.8rem',
          borderRadius: '60px',
          border: '1px solid #fffac2',
          backdropFilter: 'blur(4px)',
          fontWeight: 400,
          color: '#02222b',
        }}>
          ✦ Astra Villa ✦
        </span>
      </div>

      {/* Glass Dots */}
      <div className="flex justify-center gap-3 mt-5">
        {dotColors.map((bg, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ background: bg, boxShadow: 'inset 0 1px 4px white' }}
          />
        ))}
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

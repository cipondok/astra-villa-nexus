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

  // Fetch footer logo from system settings (branding category)
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
      contactInfo: "Contact Info",
      newsletter: "Newsletter",
      newsletterText: "Subscribe to get the latest property updates",
      emailPlaceholder: "Enter your email",
      subscribe: "Subscribe",
      allRights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookies: "Cookie Policy",
      home: "Home",
      properties: "Properties",
      buy: "Buy",
      rent: "Rent",
      about: "About",
      community: "Community",
      propertySearch: "Property Search",
      consultation: "Consultation",
      valuation: "Property Valuation",
      investment: "Investment Advisory",
      help: "Help Center",
      faq: "FAQ",
      contactUs: "Contact Us",
      feedback: "Feedback",
      businessPartners: "Business Partners",
      partnerNetwork: "Partner Network",
      becomePartner: "Become a Partner",
      partnerBenefits: "Partner Benefits",
      jointVentures: "Joint Ventures"
    },
    id: {
      company: "Astra Villa",
      tagline: "Mitra real estate terpercaya Anda",
      quickLinks: "Tautan Cepat",
      services: "Layanan",
      support: "Dukungan",
      contactInfo: "Info Kontak",
      newsletter: "Newsletter",
      newsletterText: "Berlangganan untuk mendapat update properti terbaru",
      emailPlaceholder: "Masukkan email Anda",
      subscribe: "Berlangganan",
      allRights: "Semua hak dilindungi.",
      privacy: "Kebijakan Privasi",
      terms: "Syarat Layanan",
      cookies: "Kebijakan Cookie",
      home: "Beranda",
      properties: "Properti",
      buy: "Beli",
      rent: "Sewa",
      about: "Tentang",
      community: "Komunitas",
      propertySearch: "Pencarian Properti",
      consultation: "Konsultasi",
      valuation: "Valuasi Properti",
      investment: "Konsultan Investasi",
      help: "Pusat Bantuan",
      faq: "FAQ",
      contactUs: "Hubungi Kami",
      feedback: "Masukan",
      businessPartners: "Mitra Bisnis",
      partnerNetwork: "Jaringan Mitra",
      becomePartner: "Jadi Mitra",
      partnerBenefits: "Manfaat Mitra",
      jointVentures: "Usaha Patungan"
    }
  };

  const currentText = text[language];

  return (
    <footer className="relative bg-gradient-to-br from-white/30 via-white/15 to-white/10 dark:from-slate-900/80 dark:via-slate-800/60 dark:to-slate-900/70 backdrop-blur-xl border-t border-white/25 dark:border-white/15 before:absolute before:inset-0 before:bg-gradient-to-tr before:from-primary/8 before:via-transparent before:to-accent/8 before:opacity-70 after:absolute after:inset-0 after:bg-gradient-to-bl after:from-rose-400/5 after:via-transparent after:to-cyan-400/6 after:opacity-60 overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Main Footer Grid - 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            {/* Logo */}
            <div className="flex items-center justify-start">
              {footerLogoUrl ? (
                <img 
                  src={footerLogoUrl} 
                  alt={currentText.company} 
                  className="h-12 md:h-14 max-w-[160px] object-contain object-left" 
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary rounded-[6px]">
                    <Rocket className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">{currentText.company}</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">{currentText.tagline}</p>
            
            {/* Location & Contact */}
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                <span>Jl. Sunset Road No. 88, Seminyak, Bali 80361</span>
              </div>
              <a href="tel:+622112345678" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />+62 21 1234 5678
              </a>
              <a href="mailto:info@astravilla.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />info@astravilla.com
              </a>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-2 pt-2">
              <a href="#" className="p-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground rounded-[6px] transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground rounded-[6px] transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground rounded-[6px] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground rounded-[6px] transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{currentText.quickLinks}</h3>
            <ul className="space-y-2">
              {[
                { to: "/", label: currentText.home, icon: Home },
                { to: "/dijual", label: currentText.buy, icon: ShoppingCart },
                { to: "/disewa", label: currentText.rent, icon: Key },
                { to: "/vr-tour", label: language === "en" ? "VR Tour" : "Tur VR", icon: Glasses },
                { to: "/location", label: language === "en" ? "Location Map" : "Peta Lokasi", icon: MapPin },
                { to: "/community", label: currentText.community, icon: UsersRound },
                { to: "/agents", label: language === "en" ? "Find Agents" : "Cari Agen", icon: UserCheck },
                { to: "/development", label: language === "en" ? "Development" : "Pengembangan", icon: Construction }
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors group">
                    <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{currentText.services}</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                {currentText.propertySearch}
              </li>
              <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                <MessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                {currentText.consultation}
              </li>
              <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                <Calculator className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                {currentText.valuation}
              </li>
              <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                <PiggyBank className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                {currentText.investment}
              </li>
            </ul>
          </div>

          {/* Support & Partners Combined */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{currentText.support}</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                {currentText.help}
              </li>
              <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                <CircleHelp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                {currentText.faq}
              </li>
              <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                <PhoneCall className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                {currentText.contactUs}
              </li>
            </ul>
            
            {/* Business Partners */}
            <div className="pt-3 border-t border-border mt-3">
              <Collapsible open={isPartnersOpen} onOpenChange={setIsPartnersOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                  <Handshake className="w-4 h-4" />
                  <span>{currentText.businessPartners}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPartnersOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link to="/partners/network" className="hover:text-primary transition-colors">{currentText.partnerNetwork}</Link></li>
                    <li><Link to="/partners/become" className="hover:text-primary transition-colors">{currentText.becomePartner}</Link></li>
                    <li><Link to="/partners/benefits" className="hover:text-primary transition-colors">{currentText.partnerBenefits}</Link></li>
                    <li><Link to="/partners/ventures" className="hover:text-primary transition-colors">{currentText.jointVentures}</Link></li>
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Shield className="w-4 h-4" />{currentText.privacy}
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <FileText className="w-4 h-4" />{currentText.terms}
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Cookie className="w-4 h-4" />{currentText.cookies}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Users, Handshake, Building2, TrendingUp, ArrowUpRight, ChevronDown, Home, ShoppingCart, Key, UsersRound, Construction, Search, MessageSquare, Calculator, PiggyBank, HelpCircle, CircleHelp, PhoneCall, Shield, FileText, Cookie, MapPin } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfessionalFooterProps {
  language: "en" | "id";
}
const ProfessionalFooter = ({
  language
}: ProfessionalFooterProps) => {
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
  return <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-white/10">
      <div className="container relative mx-auto px-4 md:px-6 py-4 md:py-5">
        {/* Main Footer Grid - Reorganized 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-4">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            {/* Logo */}
            <div className="flex items-center justify-start">
              {footerLogoUrl ? (
                <img 
                  src={footerLogoUrl} 
                  alt={currentText.company} 
                  className="h-14 md:h-16 max-w-[160px] object-left object-cover" 
                  style={{ background: 'transparent' }} 
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base font-bold text-white">{currentText.company}</span>
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-slate-400 leading-relaxed">{currentText.tagline}</p>
            
            {/* Location & Contact */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
                <MapPin className="w-3 h-3 flex-shrink-0 text-primary mt-0.5" />
                <span>Jl. Sunset Road No. 88, Seminyak, Bali 80361</span>
              </div>
              <a href="tel:+622112345678" className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-primary transition-colors">
                <Phone className="w-3 h-3 flex-shrink-0" />+62 21 1234 5678
              </a>
              <a href="mailto:info@astravilla.com" className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-primary transition-colors">
                <Mail className="w-3 h-3 flex-shrink-0" />info@astravilla.com
              </a>
            </div>
            
            {/* Social Icons - Colored like marketplace */}
            <div className="flex gap-1.5 pt-1">
              <a href="#" className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all hover:scale-105">
                <Facebook className="w-3.5 h-3.5 text-blue-500" />
              </a>
              <a href="#" className="p-1.5 bg-gradient-to-br from-sky-400/20 to-sky-500/10 border border-sky-400/30 hover:border-sky-400/50 rounded-lg transition-all hover:scale-105">
                <Twitter className="w-3.5 h-3.5 text-sky-400" />
              </a>
              <a href="#" className="p-1.5 bg-gradient-to-br from-pink-500/20 to-purple-500/10 border border-pink-500/30 hover:border-pink-500/50 rounded-lg transition-all hover:scale-105">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
              </a>
              <a href="#" className="p-1.5 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all hover:scale-105">
                <Youtube className="w-3.5 h-3.5 text-red-500" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">{currentText.quickLinks}</h3>
            <ul className="space-y-1">
              {[{
              to: "/",
              label: currentText.home,
              icon: Home
            }, {
              to: "/dijual",
              label: currentText.buy,
              icon: ShoppingCart
            }, {
              to: "/disewa",
              label: currentText.rent,
              icon: Key
            }, {
              to: "/location",
              label: language === "en" ? "Location Map" : "Peta Lokasi",
              icon: MapPin
            }, {
              to: "/community",
              label: currentText.community,
              icon: UsersRound
            }, {
              to: "/development",
              label: language === "en" ? "Development" : "Pengembangan",
              icon: Construction
            }].map(link => <li key={link.to}>
                  <Link to={link.to} className="text-[10px] text-slate-400 hover:text-primary flex items-center gap-1.5 transition-colors group">
                    <link.icon className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />{link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">{currentText.services}</h3>
            <ul className="space-y-1 text-[10px] text-slate-400">
              <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                <Search className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />{currentText.propertySearch}
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                <MessageSquare className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />{currentText.consultation}
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                <Calculator className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />{currentText.valuation}
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                <PiggyBank className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />{currentText.investment}
              </li>
            </ul>
          </div>

          {/* Support & Partners Combined */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">{currentText.support}</h3>
            <ul className="space-y-1 text-[10px] text-slate-400">
              <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />{currentText.help}
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                <CircleHelp className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />{currentText.faq}
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                <PhoneCall className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />{currentText.contactUs}
              </li>
            </ul>
            
            {/* Business Partners */}
            <div className="pt-2 border-t border-white/10 mt-2">
              <Collapsible open={isPartnersOpen} onOpenChange={setIsPartnersOpen}>
                <CollapsibleTrigger className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-primary transition-colors cursor-pointer">
                  <Handshake className="w-3 h-3" />
                  <span>{currentText.businessPartners}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isPartnersOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1">
                  <ul className="space-y-1 text-[10px] text-slate-400">
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
        <div className="border-t border-white/10 pt-3 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[9px] text-slate-500 text-center md:text-left">© {new Date().getFullYear()} {currentText.company}. {currentText.allRights}</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-3 text-[9px]">
            <a href="#" className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />{currentText.privacy}
            </a>
            <a href="#" className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
              <FileText className="w-2.5 h-2.5" />{currentText.terms}
            </a>
            <a href="#" className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
              <Cookie className="w-2.5 h-2.5" />{currentText.cookies}
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default ProfessionalFooter;
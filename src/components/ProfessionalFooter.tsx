
import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Users, Handshake, Building2, TrendingUp, ArrowUpRight, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const [isPartnersOpen, setIsPartnersOpen] = useState(false);

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
    <footer className="relative bg-muted/80 dark:bg-muted/40 border-t border-border">
      <div className="container relative mx-auto px-2 py-3">
        {/* Main Footer - Ultra Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          {/* Company Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <div className="p-1 bg-gradient-to-br from-primary to-accent rounded">
                <Rocket className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-xs font-bold text-foreground">{currentText.company}</span>
            </div>
            <p className="text-[9px] text-muted-foreground leading-tight">{currentText.tagline}</p>
            <div className="hidden md:flex flex-col gap-0.5">
              <a href="tel:+622112345678" className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-primary">
                <Phone className="w-2.5 h-2.5" />+62 21 1234 5678
              </a>
              <a href="mailto:info@astravilla.com" className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-primary">
                <Mail className="w-2.5 h-2.5" />info@astravilla.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-foreground">{currentText.quickLinks}</h3>
            <ul className="space-y-0.5 text-[9px]">
              {[
                { to: "/", label: currentText.home },
                { to: "/dijual", label: currentText.buy },
                { to: "/disewa", label: currentText.rent },
                { to: "/community", label: currentText.community },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-muted-foreground hover:text-primary flex items-center">
                    <ArrowUpRight className="w-2 h-2 mr-0.5 opacity-0 hover:opacity-100" />{link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="hidden md:block space-y-1">
            <h3 className="text-[10px] font-bold text-foreground">{currentText.services}</h3>
            <ul className="space-y-0.5 text-[9px] text-muted-foreground">
              <li>{currentText.propertySearch}</li>
              <li>{currentText.consultation}</li>
              <li>{currentText.valuation}</li>
              <li>{currentText.investment}</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-foreground">{currentText.newsletter}</h3>
            <input
              type="email"
              placeholder={currentText.emailPlaceholder}
              className="w-full px-2 py-1 bg-background border border-border rounded text-[9px] focus:ring-1 focus:ring-primary"
            />
            <button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-1 rounded text-[9px] font-medium hover:opacity-90">
              {currentText.subscribe}
            </button>
          </div>
        </div>

        {/* Business Partners - Collapsible */}
        <Collapsible open={isPartnersOpen} onOpenChange={setIsPartnersOpen}>
          <CollapsibleTrigger className="w-full border-t border-border/50 pt-2">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
              <Handshake className="w-3 h-3" />
              <span>{currentText.businessPartners}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isPartnersOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { to: "/partners/network", icon: Users, label: currentText.partnerNetwork, color: "text-blue-500" },
                { to: "/partners/become", icon: Building2, label: currentText.becomePartner, color: "text-green-500" },
                { to: "/partners/benefits", icon: TrendingUp, label: currentText.partnerBenefits, color: "text-purple-500" },
                { to: "/partners/ventures", icon: Handshake, label: currentText.jointVentures, color: "text-orange-500" },
              ].map((item) => (
                <Link 
                  key={item.to}
                  to={item.to}
                  className="p-1.5 bg-background/50 border border-border/50 rounded text-center hover:bg-background hover:border-primary/30 transition-all"
                >
                  <item.icon className={`w-4 h-4 mx-auto ${item.color}`} />
                  <span className="text-[8px] font-medium text-foreground block mt-0.5 leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-2 mt-2 flex flex-col md:flex-row justify-between items-center gap-1.5">
          {/* Social */}
          <div className="flex gap-1">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="p-1 bg-background/50 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-colors">
                <Icon className="w-3 h-3" />
              </a>
            ))}
          </div>
          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-[9px] text-muted-foreground">© {new Date().getFullYear()} {currentText.company}</p>
            <div className="flex justify-center md:justify-end gap-2 text-[8px]">
              <a href="#" className="text-muted-foreground hover:text-primary">{currentText.privacy}</a>
              <a href="#" className="text-muted-foreground hover:text-primary">{currentText.terms}</a>
              <a href="#" className="text-muted-foreground hover:text-primary">{currentText.cookies}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

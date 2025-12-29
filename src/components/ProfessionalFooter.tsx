
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
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-white/10">
      <div className="container relative mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg">
                <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold text-white">{currentText.company}</span>
            </div>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">{currentText.tagline}</p>
            <div className="flex flex-col gap-2">
              <a href="tel:+622112345678" className="flex items-center gap-2 text-sm text-slate-300 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />+62 21 1234 5678
              </a>
              <a href="mailto:info@astravilla.com" className="flex items-center gap-2 text-sm text-slate-300 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />info@astravilla.com
              </a>
            </div>
            {/* Social Icons */}
            <div className="flex gap-2 pt-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-white/10 hover:bg-primary/20 rounded-lg text-slate-300 hover:text-primary transition-all">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm md:text-base font-bold text-white">{currentText.quickLinks}</h3>
            <ul className="space-y-2">
              {[
                { to: "/", label: currentText.home },
                { to: "/dijual", label: currentText.buy },
                { to: "/disewa", label: currentText.rent },
                { to: "/community", label: currentText.community },
                { to: "/development", label: language === "en" ? "Development" : "Pengembangan" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-300 hover:text-primary flex items-center gap-1 transition-colors">
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />{link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm md:text-base font-bold text-white">{currentText.services}</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="hover:text-primary transition-colors cursor-pointer">{currentText.propertySearch}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{currentText.consultation}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{currentText.valuation}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{currentText.investment}</li>
            </ul>
            
            {/* Support */}
            <h3 className="text-sm md:text-base font-bold text-white pt-2">{currentText.support}</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="hover:text-primary transition-colors cursor-pointer">{currentText.help}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{currentText.faq}</li>
              <li className="hover:text-primary transition-colors cursor-pointer">{currentText.contactUs}</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-sm md:text-base font-bold text-white">{currentText.newsletter}</h3>
            <p className="text-sm text-slate-300">{currentText.newsletterText}</p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder={currentText.emailPlaceholder}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg">
                {currentText.subscribe}
              </button>
            </div>
          </div>
        </div>

        {/* Business Partners - Collapsible */}
        <Collapsible open={isPartnersOpen} onOpenChange={setIsPartnersOpen}>
          <CollapsibleTrigger className="w-full border-t border-white/10 pt-6">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white hover:text-primary transition-colors cursor-pointer">
              <Handshake className="w-4 h-4" />
              <span>{currentText.businessPartners}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPartnersOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { to: "/partners/network", icon: Users, label: currentText.partnerNetwork, color: "text-blue-400" },
                { to: "/partners/become", icon: Building2, label: currentText.becomePartner, color: "text-green-400" },
                { to: "/partners/benefits", icon: TrendingUp, label: currentText.partnerBenefits, color: "text-purple-400" },
                { to: "/partners/ventures", icon: Handshake, label: currentText.jointVentures, color: "text-orange-400" },
              ].map((item) => (
                <Link 
                  key={item.to}
                  to={item.to}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:bg-white/10 hover:border-primary/30 transition-all"
                >
                  <item.icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto ${item.color}`} />
                  <span className="text-xs md:text-sm font-medium text-white block mt-2">{item.label}</span>
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} {currentText.company}. {currentText.allRights}</p>
          {/* Legal Links */}
          <div className="flex gap-4 md:gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">{currentText.privacy}</a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">{currentText.terms}</a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">{currentText.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

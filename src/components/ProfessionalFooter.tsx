
import { Link } from "react-router-dom";
import { Rocket, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Users, Handshake, Building2, TrendingUp, ArrowUpRight } from "lucide-react";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {

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
      // Navigation links
      home: "Home",
      properties: "Properties",
      buy: "Buy",
      rent: "Rent",
      about: "About",
      community: "Community",
      // Services
      propertySearch: "Property Search",
      consultation: "Consultation",
      valuation: "Property Valuation",
      investment: "Investment Advisory",
      // Support
      help: "Help Center",
      faq: "FAQ",
      contactUs: "Contact Us",
      feedback: "Feedback",
      // Business Partners
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
      // Navigation links
      home: "Beranda",
      properties: "Properti",
      buy: "Beli",
      rent: "Sewa",
      about: "Tentang",
      community: "Komunitas",
      // Services
      propertySearch: "Pencarian Properti",
      consultation: "Konsultasi",
      valuation: "Valuasi Properti",
      investment: "Konsultan Investasi",
      // Support
      help: "Pusat Bantuan",
      faq: "FAQ",
      contactUs: "Hubungi Kami",
      feedback: "Masukan",
      // Business Partners
      businessPartners: "Mitra Bisnis",
      partnerNetwork: "Jaringan Mitra",
      becomePartner: "Jadi Mitra",
      partnerBenefits: "Manfaat Mitra",
      jointVentures: "Usaha Patungan"
    }
  };

  const currentText = text[language];

  return (
    <footer className="relative bg-gradient-to-b from-background via-background to-muted/30 border-t border-border/50">
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none" />
      
      <div className="container relative mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-8">
          {/* Company Info */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 md:p-1.5 bg-gradient-to-br from-primary to-accent rounded-lg shadow-md">
                <Rocket className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <span className="text-base md:text-lg font-bold gradient-text">
                {currentText.company}
              </span>
            </div>
            <p className="text-muted-foreground text-[10px] md:text-xs leading-snug">
              {currentText.tagline}
            </p>
            
            {/* Contact Info - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex flex-col space-y-2 text-xs">
              <a href="tel:+622112345678" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group">
                <div className="p-1.5 bg-muted rounded-md group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-3 h-3" />
                </div>
                <span className="truncate text-[11px]">+62 21 1234 5678</span>
              </a>
              <a href="mailto:info@astravilla.com" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group">
                <div className="p-1.5 bg-muted rounded-md group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-3 h-3" />
                </div>
                <span className="truncate text-[11px]">info@astravilla.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-xs md:text-sm font-bold text-foreground">{currentText.quickLinks}</h3>
            <ul className="space-y-1 md:space-y-2 text-[10px] md:text-xs">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.home}
                </Link>
              </li>
              <li>
                <Link to="/dijual" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.properties}
                </Link>
              </li>
              <li>
                <Link to="/dijual" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.buy}
                </Link>
              </li>
              <li>
                <Link to="/disewa" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.rent}
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.community}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services - Hidden on mobile */}
          <div className="hidden md:block space-y-2 md:space-y-3">
            <h3 className="text-xs md:text-sm font-bold text-foreground">{currentText.services}</h3>
            <ul className="space-y-1 md:space-y-2 text-[10px] md:text-xs">
              <li><span className="text-muted-foreground">{currentText.propertySearch}</span></li>
              <li><span className="text-muted-foreground">{currentText.consultation}</span></li>
              <li><span className="text-muted-foreground">{currentText.valuation}</span></li>
              <li><span className="text-muted-foreground">{currentText.investment}</span></li>
            </ul>
          </div>

          {/* Newsletter - Compact on mobile */}
          <div className="space-y-2 md:space-y-3 col-span-1 md:col-span-1">
            <h3 className="text-xs md:text-sm font-bold text-foreground">{currentText.newsletter}</h3>
            <p className="text-muted-foreground text-[10px] md:text-xs leading-snug hidden md:block">{currentText.newsletterText}</p>
            <div className="space-y-1.5 md:space-y-2">
              <input
                type="email"
                placeholder={currentText.emailPlaceholder}
                className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-background border border-border rounded-md md:rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all text-[10px] md:text-xs"
              />
              <button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-1.5 md:py-2 px-2.5 md:px-3 rounded-md md:rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-[10px] md:text-xs font-semibold">
                {currentText.subscribe}
              </button>
            </div>
          </div>
        </div>

        {/* Business Partners Section - Compact */}
        <div className="border-t border-border/50 pt-3 md:pt-6 pb-3 md:pb-6">
          <div className="text-center mb-2 md:mb-4">
            <h2 className="text-sm md:text-lg font-bold text-foreground flex items-center justify-center space-x-1.5 md:space-x-2">
              <div className="p-1 md:p-1.5 bg-gradient-to-br from-primary to-accent rounded-md">
                <Handshake className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <span className="gradient-text">{currentText.businessPartners}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {/* Partner Network */}
            <Link 
              to="/partners/network"
              className="group glass-card p-2 md:p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="p-1.5 md:p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg md:rounded-xl mb-1 md:mb-2 mx-auto w-fit group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-[10px] md:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {currentText.partnerNetwork}
              </h3>
            </Link>

            {/* Become Partner */}
            <Link 
              to="/partners/become"
              className="group glass-card p-2 md:p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="p-1.5 md:p-3 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg md:rounded-xl mb-1 md:mb-2 mx-auto w-fit group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5 md:w-8 md:h-8 text-accent" />
              </div>
              <h3 className="text-[10px] md:text-sm font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                {currentText.becomePartner}
              </h3>
            </Link>

            {/* Partner Benefits */}
            <Link 
              to="/partners/benefits"
              className="group glass-card p-2 md:p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="p-1.5 md:p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg md:rounded-xl mb-1 md:mb-2 mx-auto w-fit group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-purple-500" />
              </div>
              <h3 className="text-[10px] md:text-sm font-bold text-foreground group-hover:text-purple-500 transition-colors leading-tight">
                {currentText.partnerBenefits}
              </h3>
            </Link>

            {/* Joint Ventures */}
            <Link 
              to="/partners/ventures"
              className="group glass-card p-2 md:p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="p-1.5 md:p-3 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg md:rounded-xl mb-1 md:mb-2 mx-auto w-fit group-hover:scale-110 transition-transform">
                <Handshake className="w-5 h-5 md:w-8 md:h-8 text-orange-500" />
              </div>
              <h3 className="text-[10px] md:text-sm font-bold text-foreground group-hover:text-orange-500 transition-colors leading-tight">
                {currentText.jointVentures}
              </h3>
            </Link>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-border/50 pt-2.5 md:pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            {/* Social Media */}
            <div className="flex space-x-1.5 md:space-x-2">
              <a href="#" className="p-1.5 md:p-2 bg-muted hover:bg-primary/10 rounded-md md:rounded-lg text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                <Facebook className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
              <a href="#" className="p-1.5 md:p-2 bg-muted hover:bg-primary/10 rounded-md md:rounded-lg text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                <Twitter className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
              <a href="#" className="p-1.5 md:p-2 bg-muted hover:bg-primary/10 rounded-md md:rounded-lg text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                <Instagram className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
              <a href="#" className="p-1.5 md:p-2 bg-muted hover:bg-primary/10 rounded-md md:rounded-lg text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                <Youtube className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-muted-foreground text-[10px] md:text-xs font-medium">
                © {new Date().getFullYear()} {currentText.company}
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-1.5 md:gap-3 mt-0.5 md:mt-1 text-[9px] md:text-[10px]">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{currentText.privacy}</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{currentText.terms}</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{currentText.cookies}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

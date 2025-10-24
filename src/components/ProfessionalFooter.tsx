
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
      
      <div className="container relative mx-auto px-3 md:px-4 py-6 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Company Info */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-primary to-accent rounded-lg md:rounded-xl shadow-lg">
                <Rocket className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <span className="text-lg md:text-xl font-bold gradient-text">
                {currentText.company}
              </span>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
              {currentText.tagline}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <a href="tel:+622112345678" className="flex items-center space-x-2 md:space-x-3 text-muted-foreground hover:text-primary transition-colors group">
                <div className="p-1.5 md:p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <span className="truncate">+62 21 1234 5678</span>
              </a>
              <a href="mailto:info@astravilla.com" className="flex items-center space-x-2 md:space-x-3 text-muted-foreground hover:text-primary transition-colors group">
                <div className="p-1.5 md:p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <span className="truncate">info@astravilla.com</span>
              </a>
              <div className="flex items-center space-x-2 md:space-x-3 text-muted-foreground">
                <div className="p-1.5 md:p-2 bg-muted rounded-lg">
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-sm md:text-base font-bold text-foreground">{currentText.quickLinks}</h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-1.5 md:mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.home}
                </Link>
              </li>
              <li>
                <Link to="/dijual" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-1.5 md:mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.properties}
                </Link>
              </li>
              <li>
                <Link to="/dijual" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-1.5 md:mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.buy}
                </Link>
              </li>
              <li>
                <Link to="/disewa" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-1.5 md:mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.rent}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-1.5 md:mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {currentText.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-sm md:text-base font-bold text-foreground">{currentText.services}</h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <li><span className="text-muted-foreground">{currentText.propertySearch}</span></li>
              <li><span className="text-muted-foreground">{currentText.consultation}</span></li>
              <li><span className="text-muted-foreground">{currentText.valuation}</span></li>
              <li><span className="text-muted-foreground">{currentText.investment}</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-sm md:text-base font-bold text-foreground">{currentText.newsletter}</h3>
            <p className="text-muted-foreground text-xs md:text-sm">{currentText.newsletterText}</p>
            <div className="space-y-2 md:space-y-3">
              <input
                type="email"
                placeholder={currentText.emailPlaceholder}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-background border border-border rounded-lg md:rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs md:text-sm"
              />
              <button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-2 md:py-2.5 px-3 md:px-4 rounded-lg md:rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-xs md:text-sm font-semibold">
                {currentText.subscribe}
              </button>
            </div>
          </div>
        </div>

        {/* Business Partners Section */}
        <div className="border-t border-border/50 pt-6 md:pt-12 pb-4 md:pb-8">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 flex items-center justify-center space-x-2 md:space-x-3">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Handshake className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <span className="gradient-text">{currentText.businessPartners}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {/* Partner Network */}
            <Link 
              to="/partners/network"
              className="group glass-card p-3 md:p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="p-2 md:p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl md:rounded-2xl mb-2 md:mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 md:w-10 md:h-10 text-primary" />
              </div>
              <h3 className="text-xs md:text-base font-bold text-foreground mb-1 md:mb-2 group-hover:text-primary transition-colors">
                {currentText.partnerNetwork}
              </h3>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed hidden md:block">
                Connect with our trusted network of real estate professionals
              </p>
            </Link>

            {/* Become Partner */}
            <Link 
              to="/partners/become"
              className="group glass-card p-3 md:p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="p-2 md:p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl md:rounded-2xl mb-2 md:mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 md:w-10 md:h-10 text-accent" />
              </div>
              <h3 className="text-xs md:text-base font-bold text-foreground mb-1 md:mb-2 group-hover:text-accent transition-colors">
                {currentText.becomePartner}
              </h3>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed hidden md:block">
                Join our partner program and grow your business with us
              </p>
            </Link>

            {/* Partner Benefits */}
            <Link 
              to="/partners/benefits"
              className="group glass-card p-3 md:p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="p-2 md:p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl md:rounded-2xl mb-2 md:mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 md:w-10 md:h-10 text-purple-500" />
              </div>
              <h3 className="text-xs md:text-base font-bold text-foreground mb-1 md:mb-2 group-hover:text-purple-500 transition-colors">
                {currentText.partnerBenefits}
              </h3>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed hidden md:block">
                Exclusive benefits and rewards for our valued partners
              </p>
            </Link>

            {/* Joint Ventures */}
            <Link 
              to="/partners/ventures"
              className="group glass-card p-3 md:p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="p-2 md:p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl md:rounded-2xl mb-2 md:mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
                <Handshake className="w-6 h-6 md:w-10 md:h-10 text-orange-500" />
              </div>
              <h3 className="text-xs md:text-base font-bold text-foreground mb-1 md:mb-2 group-hover:text-orange-500 transition-colors">
                {currentText.jointVentures}
              </h3>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed hidden md:block">
                Explore joint venture opportunities in real estate
              </p>
            </Link>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-border/50 pt-4 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            {/* Social Media */}
            <div className="flex space-x-2 md:space-x-3">
              <a href="#" className="p-2 md:p-2.5 bg-muted hover:bg-primary/10 rounded-lg md:rounded-xl text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="p-2 md:p-2.5 bg-muted hover:bg-primary/10 rounded-lg md:rounded-xl text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="p-2 md:p-2.5 bg-muted hover:bg-primary/10 rounded-lg md:rounded-xl text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="p-2 md:p-2.5 bg-muted hover:bg-primary/10 rounded-lg md:rounded-xl text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                <Youtube className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-muted-foreground text-xs md:text-sm font-medium">
                © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-4 mt-1.5 md:mt-2 text-xs md:text-sm">
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

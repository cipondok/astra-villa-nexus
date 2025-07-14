
import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Users, Handshake, Building2, TrendingUp } from "lucide-react";
import PartnerNetworkModal from "./partners/PartnerNetworkModal";
import BecomePartnerModal from "./partners/BecomePartnerModal";
import PartnerBenefitsModal from "./partners/PartnerBenefitsModal";
import JointVenturesModal from "./partners/JointVenturesModal";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const [isPartnerNetworkOpen, setIsPartnerNetworkOpen] = useState(false);
  const [isBecomePartnerOpen, setIsBecomePartnerOpen] = useState(false);
  const [isPartnerBenefitsOpen, setIsPartnerBenefitsOpen] = useState(false);
  const [isJointVenturesOpen, setIsJointVenturesOpen] = useState(false);

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
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Company Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Rocket className="w-4 h-4 text-blue-400" />
              <span className="text-base font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                {currentText.company}
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              {currentText.tagline}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-3 h-3" />
                <span>+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-3 h-3" />
                <span>info@astravilla.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-3 h-3" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{currentText.quickLinks}</h3>
            <ul className="space-y-1 text-xs">
              <li><Link to="/" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.home}</Link></li>
              <li><Link to="/properties" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.properties}</Link></li>
              <li><Link to="/dijual" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.buy}</Link></li>
              <li><Link to="/disewa" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.rent}</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.about}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{currentText.services}</h3>
            <ul className="space-y-1 text-xs">
              <li><span className="text-gray-300">{currentText.propertySearch}</span></li>
              <li><span className="text-gray-300">{currentText.consultation}</span></li>
              <li><span className="text-gray-300">{currentText.valuation}</span></li>
              <li><span className="text-gray-300">{currentText.investment}</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{currentText.newsletter}</h3>
            <p className="text-gray-300 text-xs">{currentText.newsletterText}</p>
            <div className="space-y-1">
              <input
                type="email"
                placeholder={currentText.emailPlaceholder}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-xs"
              />
              <button className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-1 px-2 rounded hover:from-blue-700 hover:to-orange-600 transition-all duration-300 text-xs font-medium">
                {currentText.subscribe}
              </button>
            </div>
          </div>
        </div>

        {/* Business Partners Section */}
        <div className="border-t border-gray-800 pt-4 pb-4">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center space-x-2">
              <Handshake className="w-5 h-5 text-blue-400" />
              <span>{currentText.businessPartners}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Partner Network */}
            <div 
              className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => setIsPartnerNetworkOpen(true)}
            >
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">{currentText.partnerNetwork}</h3>
              <p className="text-xs text-gray-300">Connect with our trusted network of real estate professionals</p>
            </div>

            {/* Become Partner */}
            <div 
              className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => setIsBecomePartnerOpen(true)}
            >
              <Building2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">{currentText.becomePartner}</h3>
              <p className="text-xs text-gray-300">Join our partner program and grow your business with us</p>
            </div>

            {/* Partner Benefits */}
            <div 
              className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => setIsPartnerBenefitsOpen(true)}
            >
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">{currentText.partnerBenefits}</h3>
              <p className="text-xs text-gray-300">Exclusive benefits and rewards for our valued partners</p>
            </div>

            {/* Joint Ventures */}
            <div 
              className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => setIsJointVenturesOpen(true)}
            >
              <Handshake className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">{currentText.jointVentures}</h3>
              <p className="text-xs text-gray-300">Explore joint venture opportunities in real estate</p>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-gray-800 pt-2">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-1 md:space-y-0">
            {/* Social Media */}
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-xs">
                © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
              </p>
              <div className="flex flex-wrap justify-center md:justify-end space-x-3 mt-1 text-xs">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">{currentText.privacy}</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">{currentText.terms}</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">{currentText.cookies}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PartnerNetworkModal 
        isOpen={isPartnerNetworkOpen} 
        onClose={() => setIsPartnerNetworkOpen(false)} 
      />
      <BecomePartnerModal 
        isOpen={isBecomePartnerOpen} 
        onClose={() => setIsBecomePartnerOpen(false)} 
      />
      <PartnerBenefitsModal 
        isOpen={isPartnerBenefitsOpen} 
        onClose={() => setIsPartnerBenefitsOpen(false)} 
      />
      <JointVenturesModal 
        isOpen={isJointVenturesOpen} 
        onClose={() => setIsJointVenturesOpen(false)} 
      />
    </footer>
  );
};

export default ProfessionalFooter;

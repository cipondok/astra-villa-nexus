
import { Link } from "react-router-dom";
import { Rocket, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

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
      contact: "Contact Info",
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
      contact: "Contact Us",
      feedback: "Feedback"
    },
    id: {
      company: "Astra Villa",
      tagline: "Mitra real estate terpercaya Anda",
      quickLinks: "Tautan Cepat",
      services: "Layanan",
      support: "Dukungan",
      contact: "Info Kontak",
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
      contact: "Hubungi Kami",
      feedback: "Masukan"
    }
  };

  const currentText = text[language];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Rocket className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                {currentText.company}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {currentText.tagline}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>info@astravilla.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{currentText.quickLinks}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.home}</Link></li>
              <li><Link to="/properties" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.properties}</Link></li>
              <li><Link to="/buy" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.buy}</Link></li>
              <li><Link to="/rent" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.rent}</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-blue-400 transition-colors">{currentText.about}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{currentText.services}</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-300">{currentText.propertySearch}</span></li>
              <li><span className="text-gray-300">{currentText.consultation}</span></li>
              <li><span className="text-gray-300">{currentText.valuation}</span></li>
              <li><span className="text-gray-300">{currentText.investment}</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{currentText.newsletter}</h3>
            <p className="text-gray-300 text-sm">{currentText.newsletterText}</p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder={currentText.emailPlaceholder}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-sm"
              />
              <button className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-orange-600 transition-all duration-300 text-sm font-medium">
                {currentText.subscribe}
              </button>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
              </p>
              <div className="flex flex-wrap justify-center md:justify-end space-x-4 mt-1 text-xs">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">{currentText.privacy}</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">{currentText.terms}</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">{currentText.cookies}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

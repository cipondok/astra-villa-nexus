
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const [email, setEmail] = useState("");

  const text = {
    en: {
      company: "Astra Villa",
      tagline: "Your dream property awaits",
      quickLinks: "Quick Links",
      home: "Home",
      buy: "Buy Properties",
      rent: "Rent Properties", 
      newProjects: "New Projects",
      vendors: "Our Vendors",
      aboutUs: "About Us",
      contact: "Contact Info",
      address: "123 Property Street, Jakarta, Indonesia",
      phone: "+62 21 1234 5678",
      email: "info@astravilla.com",
      newsletter: "Property Updates",
      newsletterText: "Subscribe to get the latest property listings and market updates",
      emailPlaceholder: "Enter your email",
      subscribe: "Subscribe",
      followUs: "Follow Us",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    },
    id: {
      company: "Astra Villa",
      tagline: "Properti impian Anda menanti",
      quickLinks: "Tautan Cepat",
      home: "Beranda",
      buy: "Beli Properti",
      rent: "Sewa Properti",
      newProjects: "Proyek Baru", 
      vendors: "Vendor Kami",
      aboutUs: "Tentang Kami",
      contact: "Info Kontak",
      address: "Jl. Properti No. 123, Jakarta, Indonesia",
      phone: "+62 21 1234 5678",
      email: "info@astravilla.com",
      newsletter: "Update Properti",
      newsletterText: "Berlangganan untuk mendapatkan listing properti dan update pasar terbaru",
      emailPlaceholder: "Masukkan email Anda",
      subscribe: "Berlangganan",
      followUs: "Ikuti Kami",
      rights: "Semua hak dilindungi.",
      privacy: "Kebijakan Privasi",
      terms: "Syarat Layanan"
    }
  };

  const currentText = text[language];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    // Handle newsletter subscription
    setEmail("");
  };

  return (
    <footer className="glass-ios border-t border-border/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-ios-blue to-ios-blue/80 bg-clip-text text-transparent">
                {currentText.company}
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                {currentText.tagline}
              </p>
            </div>
            
            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">
                {currentText.followUs}
              </h4>
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon-sm" className="hover:bg-ios-blue/10 hover:text-ios-blue">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="hover:bg-ios-blue/10 hover:text-ios-blue">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="hover:bg-ios-blue/10 hover:text-ios-blue">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="hover:bg-ios-blue/10 hover:text-ios-blue">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm">
              {currentText.quickLinks}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-muted-foreground hover:text-ios-blue transition-colors text-sm">
                  {currentText.home}
                </a>
              </li>
              <li>
                <a href="/properties?type=sale" className="text-muted-foreground hover:text-ios-blue transition-colors text-sm">
                  {currentText.buy}
                </a>
              </li>
              <li>
                <a href="/properties?type=rent" className="text-muted-foreground hover:text-ios-blue transition-colors text-sm">
                  {currentText.rent}
                </a>
              </li>
              <li>
                <a href="/projects" className="text-muted-foreground hover:text-ios-blue transition-colors text-sm">
                  {currentText.newProjects}
                </a>
              </li>
              <li>
                <a href="/vendors" className="text-muted-foreground hover:text-ios-blue transition-colors text-sm">
                  {currentText.vendors}
                </a>
              </li>
              <li>
                <a href="/about" className="text-muted-foreground hover:text-ios-blue transition-colors text-sm">
                  {currentText.aboutUs}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm">
              {currentText.contact}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-ios-blue mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">
                  {currentText.address}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-ios-blue flex-shrink-0" />
                <span className="text-muted-foreground text-sm">
                  {currentText.phone}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-ios-blue flex-shrink-0" />
                <span className="text-muted-foreground text-sm">
                  {currentText.email}
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm">
              {currentText.newsletter}
            </h4>
            <p className="text-muted-foreground text-sm">
              {currentText.newsletterText}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                type="email"
                placeholder={currentText.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-ios border-border/30 text-sm"
                required
              />
              <Button 
                type="submit" 
                variant="ios"
                size="sm"
                className="w-full"
              >
                <Send className="h-3 w-3 mr-2" />
                {currentText.subscribe}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/30 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-xs">
              © 2024 {currentText.company}. {currentText.rights}
            </p>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-muted-foreground hover:text-ios-blue transition-colors text-xs">
                {currentText.privacy}
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-ios-blue transition-colors text-xs">
                {currentText.terms}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

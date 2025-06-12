
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send, Home, Building, TreePine, Building2, Gavel, Video, Calculator, TrendingUp, Star, Award, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const text = {
    en: {
      company: "Astra Villa",
      tagline: "Your dream property awaits",
      
      // Main sections
      buyingGuide: "Buying Guide",
      buyingOverview: "Buying Overview",
      whatLookingFor: "What are you looking for?",
      flats: "Flats",
      houses: "Houses", 
      land: "Land",
      commercial: "Commercial",
      
      popularPlaces: "Most Popular Places",
      jakarta: "Jakarta Properties",
      bali: "Bali Villas",
      surabaya: "Surabaya Houses",
      bandung: "Bandung Apartments",
      yogyakarta: "Yogyakarta Land",
      medan: "Medan Commercial",
      
      auctionServices: "Auction Services",
      liveAuctions: "LIVE Auction Events",
      onlineAuctions: "ONLINE Auctions", 
      freeValuation: "FREE Valuation",
      auctionGuide: "Auction Guide",
      bidRegistration: "Bid Registration",
      
      premiumServices: "Premium Services",
      aiPropertyMatch: "AI Property Matching",
      virtualTours: "Virtual Property Tours",  
      instantValuation: "Instant Valuation",
      mortgageCalculator: "Mortgage Calculator",
      investmentAnalysis: "Investment Analysis",
      conciergeService: "Property Concierge",
      
      quickLinks: "Quick Links",
      home: "Home",
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
      terms: "Terms of Service",
      certifications: "Certifications & Awards",
      trustedBy: "Trusted by 50,000+ property seekers"
    },
    id: {
      company: "Astra Villa",
      tagline: "Properti impian Anda menanti",
      
      // Main sections
      buyingGuide: "Panduan Beli",
      buyingOverview: "Ringkasan Pembelian",
      whatLookingFor: "Apa yang Anda cari?",
      flats: "Apartemen",
      houses: "Rumah",
      land: "Tanah", 
      commercial: "Komersial",
      
      popularPlaces: "Lokasi Terpopuler",
      jakarta: "Properti Jakarta",
      bali: "Villa Bali",
      surabaya: "Rumah Surabaya", 
      bandung: "Apartemen Bandung",
      yogyakarta: "Tanah Yogyakarta",
      medan: "Komersial Medan",
      
      auctionServices: "Layanan Lelang",
      liveAuctions: "Acara Lelang LANGSUNG",
      onlineAuctions: "Lelang ONLINE",
      freeValuation: "Valuasi GRATIS", 
      auctionGuide: "Panduan Lelang",
      bidRegistration: "Registrasi Penawaran",
      
      premiumServices: "Layanan Premium",
      aiPropertyMatch: "AI Pencocokan Properti",
      virtualTours: "Tur Virtual Properti",
      instantValuation: "Valuasi Instan", 
      mortgageCalculator: "Kalkulator KPR",
      investmentAnalysis: "Analisis Investasi",
      conciergeService: "Concierge Properti",
      
      quickLinks: "Tautan Cepat",
      home: "Beranda",
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
      terms: "Syarat Layanan",
      certifications: "Sertifikasi & Penghargaan",
      trustedBy: "Dipercaya oleh 50,000+ pencari properti"
    }
  };

  const currentText = text[language];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    // Handle newsletter subscription
    setEmail("");
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="glass-ios border-t border-border/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
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
            
            {/* Trust Indicators */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">{currentText.trustedBy}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-muted-foreground ml-1">4.9/5</span>
              </div>
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

          {/* Buying Guide */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Home className="h-4 w-4 text-ios-blue" />
              {currentText.buyingGuide}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/buying-overview')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm text-left"
                >
                  {currentText.buyingOverview}
                </button>
              </li>
              <li className="pt-2">
                <div className="text-xs font-medium text-foreground mb-2">{currentText.whatLookingFor}</div>
                <ul className="space-y-1 ml-2">
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/properties?type=flat')}
                      className="text-muted-foreground hover:text-ios-blue transition-colors text-sm flex items-center gap-1"
                    >
                      <Building className="h-3 w-3" />
                      {currentText.flats}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/properties?type=house')}
                      className="text-muted-foreground hover:text-ios-blue transition-colors text-sm flex items-center gap-1"
                    >
                      <Home className="h-3 w-3" />
                      {currentText.houses}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/properties?type=land')}
                      className="text-muted-foreground hover:text-ios-blue transition-colors text-sm flex items-center gap-1"
                    >
                      <TreePine className="h-3 w-3" />
                      {currentText.land}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/properties?type=commercial')}
                      className="text-muted-foreground hover:text-ios-blue transition-colors text-sm flex items-center gap-1"
                    >
                      <Building2 className="h-3 w-3" />
                      {currentText.commercial}
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Popular Places */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              {currentText.popularPlaces}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/properties?location=jakarta')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                >
                  {currentText.jakarta}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/properties?location=bali')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                >
                  {currentText.bali}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/properties?location=surabaya')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                >
                  {currentText.surabaya}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/properties?location=bandung')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                >
                  {currentText.bandung}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/properties?location=yogyakarta')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                >
                  {currentText.yogyakarta}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/properties?location=medan')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                >
                  {currentText.medan}
                </button>
              </li>
            </ul>
          </div>

          {/* Auction Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Gavel className="h-4 w-4 text-red-500" />
              {currentText.auctionServices}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/live-auctions')}
                  className="text-muted-foreground hover:text-red-500 transition-colors text-sm flex items-center gap-1"
                >
                  <Zap className="h-3 w-3 text-red-500" />
                  {currentText.liveAuctions}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/online-auctions')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm flex items-center gap-1"
                >
                  <Video className="h-3 w-3" />
                  {currentText.onlineAuctions}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/free-valuation')}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm flex items-center gap-1"
                >
                  <Calculator className="h-3 w-3 text-green-500" />
                  {currentText.freeValuation}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/auction-guide')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                >
                  {currentText.auctionGuide}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/bid-registration')}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                >
                  {currentText.bidRegistration}
                </button>
              </li>
            </ul>
          </div>

          {/* Premium Services & Newsletter */}
          <div className="space-y-6">
            {/* Premium Services */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                {currentText.premiumServices}
              </h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => handleLinkClick('/ai-matching')}
                    className="text-muted-foreground hover:text-purple-500 transition-colors text-sm"
                  >
                    {currentText.aiPropertyMatch}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleLinkClick('/virtual-tours')}
                    className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                  >
                    {currentText.virtualTours}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleLinkClick('/instant-valuation')}
                    className="text-muted-foreground hover:text-green-500 transition-colors text-sm"
                  >
                    {currentText.instantValuation}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleLinkClick('/mortgage-calculator')}
                    className="text-muted-foreground hover:text-ios-blue transition-colors text-sm"
                  >
                    {currentText.mortgageCalculator}
                  </button>
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
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/30 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-xs">
              © 2024 {currentText.company}. {currentText.rights}
            </p>
            <div className="flex space-x-6">
              <button 
                onClick={() => handleLinkClick('/privacy')}
                className="text-muted-foreground hover:text-ios-blue transition-colors text-xs"
              >
                {currentText.privacy}
              </button>
              <button 
                onClick={() => handleLinkClick('/terms')}
                className="text-muted-foreground hover:text-ios-blue transition-colors text-xs"
              >
                {currentText.terms}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

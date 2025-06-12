import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send, Home, Building, TreePine, Building2, Gavel, Video, Calculator, TrendingUp, Star, Award, Shield, Zap, FileText, AlertCircle, DollarSign, Scale, HelpCircle, Handshake, Users, Camera, BarChart3, Clock, Target, PiggyBank, Bell, Eye, Smartphone, Brain, HeadphonesIcon, MessageSquare, Gift, Trophy, Banknote, MapPinIcon, Building2Icon, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      guideAndFaq: "Guide & FAQ",
      registerForAlerts: "Register for Alerts",
      termsOfSale: "Terms of Sale",
      whyBuyAtAstraVilla: "Why Buy at Astra Villa",
      astraVillaFinance: "Astra Villa Finance",
      solicitors: "Solicitors",
      
      // New Selling Guide section
      sellingGuide: "Selling Guide",
      sellingOverview: "Selling Overview",
      whySellWithFuture: "Why Sell with Astra Villa",
      sellingGuideAndFaq: "Selling Guide & FAQ",
      freeValuation: "FREE Property Valuation",
      partnerAgents: "Partner Agents & Referral Fees",
      homeReports: "Home Reports & Surveys",
      sellingSolicitors: "Selling Solicitors",
      instantPricing: "AI Instant Pricing",
      marketingPackages: "Premium Marketing Packages",
      sellersInsights: "Seller's Market Insights",
      fastTrackSale: "Fast-Track Sale Program",
      
      // New Company Info sections
      aboutUs: "About Us",
      ourStory: "Our Story",
      leadership: "Leadership Team",
      careers: "Careers",
      pressMedia: "Press & Media",
      investorRelations: "Investor Relations",
      corporateSocial: "Corporate Social Responsibility",
      
      // Office Information
      ourOffices: "Our Offices",
      jakartaOffice: "Jakarta Head Office",
      baliOffice: "Bali Regional Office",
      surabayaOffice: "Surabaya Branch",
      bandungOffice: "Bandung Branch",
      medanOffice: "Medan Branch",
      
      // Services & Tools
      servicesTools: "Services & Tools",
      freeAstraValuation: "FREE AstraVilla Valuation",
      astraAlerts: "AstraVilla Property Alerts",
      mortgageCalculator: "Mortgage Calculator",
      propertyComparison: "Property Comparison Tool",
      neighborhoodGuide: "Neighborhood Guide",
      investmentCalculator: "Investment ROI Calculator",
      
      // Innovation Features
      innovationHub: "Innovation Hub",
      aiPropertyMatch: "AI Property Matching",
      virtualTours: "360° Virtual Tours",
      blockchainVerification: "Blockchain Property Verification",
      smartContracts: "Smart Contract Integration",
      cryptoPayments: "Cryptocurrency Payments",
      voiceSearch: "Voice-Activated Search",
      arVisualization: "AR Property Visualization",
      predictiveAnalytics: "Predictive Market Analytics",
      
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
      auctionFreeValuation: "FREE Auction Valuation",
      auctionGuide: "Auction Guide",
      bidRegistration: "Bid Registration",
      
      premiumServices: "Premium Services",
      virtualToursService: "Virtual Property Tours",  
      instantValuation: "Instant Valuation",
      conciergeService: "Property Concierge",
      
      quickLinks: "Quick Links",
      home: "Home",
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
      trustedBy: "Trusted by 50,000+ property seekers",
      comingSoon: "Coming Soon!",
      featureNotAvailable: "This feature is coming soon. Stay tuned!",
      
      // Office addresses
      jakartaAddress: "Menara Astra, Jl. Jend. Sudirman Kav. 5-6, Jakarta 10220",
      baliAddress: "Jl. Raya Sanur No. 88, Denpasar, Bali 80228",
      surabayaAddress: "Jl. Pemuda No. 118, Surabaya, East Java 60271",
      bandungAddress: "Jl. Asia Afrika No. 8, Bandung, West Java 40111",
      medanAddress: "Jl. Jend. Gatot Subroto No. 456, Medan, North Sumatra 20234"
    },
    id: {
      company: "Astra Villa",
      tagline: "Properti impian Anda menanti",
      
      // Main sections
      buyingGuide: "Panduan Beli",
      buyingOverview: "Ringkasan Pembelian",
      guideAndFaq: "Panduan & FAQ",
      registerForAlerts: "Daftar untuk Peringatan",
      termsOfSale: "Syarat Penjualan",
      whyBuyAtAstraVilla: "Mengapa Beli di Astra Villa",
      astraVillaFinance: "Pembiayaan Astra Villa",
      solicitors: "Pengacara",
      
      // New Selling Guide section
      sellingGuide: "Panduan Jual",
      sellingOverview: "Ringkasan Penjualan",
      whySellWithFuture: "Mengapa Jual dengan Astra Villa",
      sellingGuideAndFaq: "Panduan Jual & FAQ",
      freeValuation: "Valuasi Properti GRATIS",
      partnerAgents: "Agen Mitra & Biaya Rujukan",
      homeReports: "Laporan Rumah & Survei",
      sellingSolicitors: "Pengacara Penjualan",
      instantPricing: "Harga Instan AI",
      marketingPackages: "Paket Pemasaran Premium",
      sellersInsights: "Wawasan Pasar Penjual",
      fastTrackSale: "Program Penjualan Cepat",
      
      // New Company Info sections
      aboutUs: "Tentang Kami",
      ourStory: "Cerita Kami",
      leadership: "Tim Kepemimpinan",
      careers: "Karir",
      pressMedia: "Pers & Media",
      investorRelations: "Hubungan Investor",
      corporateSocial: "Tanggung Jawab Sosial Perusahaan",
      
      // Office Information
      ourOffices: "Kantor Kami",
      jakartaOffice: "Kantor Pusat Jakarta",
      baliOffice: "Kantor Regional Bali",
      surabayaOffice: "Cabang Surabaya",
      bandungOffice: "Cabang Bandung",
      medanOffice: "Cabang Medan",
      
      // Services & Tools
      servicesTools: "Layanan & Alat",
      freeAstraValuation: "Valuasi GRATIS AstraVilla",
      astraAlerts: "Peringatan Properti AstraVilla",
      mortgageCalculator: "Kalkulator KPR",
      propertyComparison: "Alat Perbandingan Properti",
      neighborhoodGuide: "Panduan Lingkungan",
      investmentCalculator: "Kalkulator ROI Investasi",
      
      // Innovation Features
      innovationHub: "Hub Inovasi",
      aiPropertyMatch: "AI Pencocokan Properti",
      virtualTours: "Tur Virtual 360°",
      blockchainVerification: "Verifikasi Properti Blockchain",
      smartContracts: "Integrasi Smart Contract",
      cryptoPayments: "Pembayaran Mata Uang Kripto",
      voiceSearch: "Pencarian Suara",
      arVisualization: "Visualisasi AR Properti",
      predictiveAnalytics: "Analitik Prediktif Pasar",
      
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
      auctionFreeValuation: "Valuasi Lelang GRATIS", 
      auctionGuide: "Panduan Lelang",
      bidRegistration: "Registrasi Penawaran",
      
      premiumServices: "Layanan Premium",
      virtualToursService: "Tur Virtual Properti",
      instantValuation: "Valuasi Instan", 
      conciergeService: "Concierge Properti",
      
      quickLinks: "Tautan Cepat",
      home: "Beranda",
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
      trustedBy: "Dipercaya oleh 50,000+ pencari properti",
      comingSoon: "Segera Hadir!",
      featureNotAvailable: "Fitur ini akan segera hadir. Nantikan!",
      
      // Office addresses
      jakartaAddress: "Menara Astra, Jl. Jend. Sudirman Kav. 5-6, Jakarta 10220",
      baliAddress: "Jl. Raya Sanur No. 88, Denpasar, Bali 80228",
      surabayaAddress: "Jl. Pemuda No. 118, Surabaya, Jawa Timur 60271",
      bandungAddress: "Jl. Asia Afrika No. 8, Bandung, Jawa Barat 40111",
      medanAddress: "Jl. Jend. Gatot Subroto No. 456, Medan, Sumatra Utara 20234"
    }
  };

  const currentText = text[language];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    toast.success("Successfully subscribed to property updates!");
    setEmail("");
  };

  const handleLinkClick = (path: string, label?: string) => {
    // Handle existing routes
    if (path === '/' || path === '/properties' || path === '/about') {
      navigate(path);
      return;
    }
    
    // For unimplemented routes, show a coming soon message
    toast.info(`${label || 'Feature'} - ${currentText.featureNotAvailable}`);
  };

  return (
    <footer className="glass-ios border-t border-border/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 mb-8">
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

          {/* Buying Guide - Expanded */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Home className="h-4 w-4 text-ios-blue" />
              {currentText.buyingGuide}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/buying-overview', currentText.buyingOverview)}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm text-left flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  {currentText.buyingOverview}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/guide-faq', currentText.guideAndFaq)}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm text-left flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3" />
                  {currentText.guideAndFaq}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/register-alerts', currentText.registerForAlerts)}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm text-left flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {currentText.registerForAlerts}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/terms-of-sale', currentText.termsOfSale)}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Scale className="h-3 w-3" />
                  {currentText.termsOfSale}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/why-buy-astra-villa', currentText.whyBuyAtAstraVilla)}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Award className="h-3 w-3 text-purple-500" />
                  {currentText.whyBuyAtAstraVilla}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/astra-villa-finance', currentText.astraVillaFinance)}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm text-left flex items-center gap-1"
                >
                  <DollarSign className="h-3 w-3 text-green-500" />
                  {currentText.astraVillaFinance}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/solicitors', currentText.solicitors)}
                  className="text-muted-foreground hover:text-ios-blue transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Scale className="h-3 w-3 text-blue-500" />
                  {currentText.solicitors}
                </button>
              </li>
              
              <li className="pt-2">
                <div className="text-xs font-medium text-foreground mb-2">{currentText.whatLookingFor}</div>
                <ul className="space-y-1 ml-2">
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/properties', currentText.flats)}
                      className="text-muted-foreground hover:text-ios-blue transition-colors text-sm flex items-center gap-1"
                    >
                      <Building className="h-3 w-3" />
                      {currentText.flats}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/properties', currentText.houses)}
                      className="text-muted-foreground hover:text-ios-blue transition-colors text-sm flex items-center gap-1"
                    >
                      <Home className="h-3 w-3" />
                      {currentText.houses}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/properties', currentText.land)}
                      className="text-muted-foreground hover:text-ios-blue transition-colors text-sm flex items-center gap-1"
                    >
                      <TreePine className="h-3 w-3" />
                      {currentText.land}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/properties', currentText.commercial)}
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

          {/* NEW: Selling Guide - Comprehensive */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Handshake className="h-4 w-4 text-green-500" />
              {currentText.sellingGuide}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/selling-overview', currentText.sellingOverview)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  {currentText.sellingOverview}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/why-sell-astra-villa', currentText.whySellWithFuture)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Award className="h-3 w-3 text-green-500" />
                  {currentText.whySellWithFuture}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/selling-guide-faq', currentText.sellingGuideAndFaq)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3" />
                  {currentText.sellingGuideAndFaq}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/free-property-valuation', currentText.freeValuation)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Calculator className="h-3 w-3 text-green-500" />
                  {currentText.freeValuation}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/partner-agents', currentText.partnerAgents)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Users className="h-3 w-3 text-blue-500" />
                  {currentText.partnerAgents}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/home-reports', currentText.homeReports)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <FileText className="h-3 w-3 text-purple-500" />
                  {currentText.homeReports}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/selling-solicitors', currentText.sellingSolicitors)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Scale className="h-3 w-3 text-blue-500" />
                  {currentText.sellingSolicitors}
                </button>
              </li>
              
              {/* Innovative Selling Features */}
              <li className="pt-2">
                <div className="text-xs font-medium text-foreground mb-2">Premium Selling Tools</div>
                <ul className="space-y-1 ml-2">
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/ai-instant-pricing', currentText.instantPricing)}
                      className="text-muted-foreground hover:text-green-500 transition-colors text-sm flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3 text-yellow-500" />
                      {currentText.instantPricing}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/marketing-packages', currentText.marketingPackages)}
                      className="text-muted-foreground hover:text-green-500 transition-colors text-sm flex items-center gap-1"
                    >
                      <Camera className="h-3 w-3 text-pink-500" />
                      {currentText.marketingPackages}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/sellers-insights', currentText.sellersInsights)}
                      className="text-muted-foreground hover:text-green-500 transition-colors text-sm flex items-center gap-1"
                    >
                      <BarChart3 className="h-3 w-3 text-blue-500" />
                      {currentText.sellersInsights}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLinkClick('/fast-track-sale', currentText.fastTrackSale)}
                      className="text-muted-foreground hover:text-green-500 transition-colors text-sm flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3 text-red-500" />
                      {currentText.fastTrackSale}
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          {/* About Us & Company Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-500" />
              {currentText.aboutUs}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/about', currentText.ourStory)}
                  className="text-muted-foreground hover:text-purple-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Heart className="h-3 w-3" />
                  {currentText.ourStory}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/leadership', currentText.leadership)}
                  className="text-muted-foreground hover:text-purple-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  {currentText.leadership}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/careers', currentText.careers)}
                  className="text-muted-foreground hover:text-purple-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Target className="h-3 w-3 text-blue-500" />
                  {currentText.careers}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/press-media', currentText.pressMedia)}
                  className="text-muted-foreground hover:text-purple-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <MessageSquare className="h-3 w-3 text-green-500" />
                  {currentText.pressMedia}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/investor-relations', currentText.investorRelations)}
                  className="text-muted-foreground hover:text-purple-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {currentText.investorRelations}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/corporate-social', currentText.corporateSocial)}
                  className="text-muted-foreground hover:text-purple-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Award className="h-3 w-3 text-purple-500" />
                  {currentText.corporateSocial}
                </button>
              </li>
            </ul>
          </div>

          {/* Our Offices */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              {currentText.ourOffices}
            </h4>
            <ul className="space-y-2">
              <li>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleLinkClick('/offices/jakarta', currentText.jakartaOffice)}
                    className="text-muted-foreground hover:text-blue-500 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <MapPinIcon className="h-3 w-3 text-red-500" />
                    {currentText.jakartaOffice}
                  </button>
                  <p className="text-xs text-muted-foreground ml-4">{currentText.jakartaAddress}</p>
                </div>
              </li>
              <li>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleLinkClick('/offices/bali', currentText.baliOffice)}
                    className="text-muted-foreground hover:text-blue-500 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <MapPinIcon className="h-3 w-3 text-red-500" />
                    {currentText.baliOffice}
                  </button>
                  <p className="text-xs text-muted-foreground ml-4">{currentText.baliAddress}</p>
                </div>
              </li>
              <li>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleLinkClick('/offices/surabaya', currentText.surabayaOffice)}
                    className="text-muted-foreground hover:text-blue-500 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <MapPinIcon className="h-3 w-3 text-red-500" />
                    {currentText.surabayaOffice}
                  </button>
                  <p className="text-xs text-muted-foreground ml-4">{currentText.surabayaAddress}</p>
                </div>
              </li>
              <li>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleLinkClick('/offices/bandung', currentText.bandungOffice)}
                    className="text-muted-foreground hover:text-blue-500 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <MapPinIcon className="h-3 w-3 text-red-500" />
                    {currentText.bandungOffice}
                  </button>
                  <p className="text-xs text-muted-foreground ml-4">{currentText.bandungAddress}</p>
                </div>
              </li>
              <li>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleLinkClick('/offices/medan', currentText.medanOffice)}
                    className="text-muted-foreground hover:text-blue-500 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <MapPinIcon className="h-3 w-3 text-red-500" />
                    {currentText.medanOffice}
                  </button>
                  <p className="text-xs text-muted-foreground ml-4">{currentText.medanAddress}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Services & Tools */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-500" />
              {currentText.servicesTools}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/free-valuation', currentText.freeAstraValuation)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Calculator className="h-3 w-3 text-green-500" />
                  {currentText.freeAstraValuation}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/property-alerts', currentText.astraAlerts)}
                  className="text-muted-foreground hover:text-yellow-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Bell className="h-3 w-3 text-yellow-500" />
                  {currentText.astraAlerts}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/mortgage-calculator', currentText.mortgageCalculator)}
                  className="text-muted-foreground hover:text-blue-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <PiggyBank className="h-3 w-3 text-blue-500" />
                  {currentText.mortgageCalculator}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/property-comparison', currentText.propertyComparison)}
                  className="text-muted-foreground hover:text-purple-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <BarChart3 className="h-3 w-3 text-purple-500" />
                  {currentText.propertyComparison}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/neighborhood-guide', currentText.neighborhoodGuide)}
                  className="text-muted-foreground hover:text-indigo-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3 text-indigo-500" />
                  {currentText.neighborhoodGuide}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/investment-calculator', currentText.investmentCalculator)}
                  className="text-muted-foreground hover:text-emerald-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  {currentText.investmentCalculator}
                </button>
              </li>
            </ul>
          </div>

          {/* Innovation Hub */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-pink-500" />
              {currentText.innovationHub}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/ai-property-match', currentText.aiPropertyMatch)}
                  className="text-muted-foreground hover:text-pink-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Brain className="h-3 w-3 text-pink-500" />
                  {currentText.aiPropertyMatch}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/virtual-tours', currentText.virtualTours)}
                  className="text-muted-foreground hover:text-blue-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Eye className="h-3 w-3 text-blue-500" />
                  {currentText.virtualTours}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/blockchain-verification', currentText.blockchainVerification)}
                  className="text-muted-foreground hover:text-orange-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Shield className="h-3 w-3 text-orange-500" />
                  {currentText.blockchainVerification}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/smart-contracts', currentText.smartContracts)}
                  className="text-muted-foreground hover:text-purple-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <FileText className="h-3 w-3 text-purple-500" />
                  {currentText.smartContracts}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/crypto-payments', currentText.cryptoPayments)}
                  className="text-muted-foreground hover:text-yellow-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Banknote className="h-3 w-3 text-yellow-500" />
                  {currentText.cryptoPayments}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/voice-search', currentText.voiceSearch)}
                  className="text-muted-foreground hover:text-green-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Smartphone className="h-3 w-3 text-green-500" />
                  {currentText.voiceSearch}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/ar-visualization', currentText.arVisualization)}
                  className="text-muted-foreground hover:text-red-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <Camera className="h-3 w-3 text-red-500" />
                  {currentText.arVisualization}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/predictive-analytics', currentText.predictiveAnalytics)}
                  className="text-muted-foreground hover:text-cyan-500 transition-colors text-sm text-left flex items-center gap-1"
                >
                  <BarChart3 className="h-3 w-3 text-cyan-500" />
                  {currentText.predictiveAnalytics}
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact Info - Combined */}
          <div className="space-y-6">
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
                onClick={() => handleLinkClick('/privacy', currentText.privacy)}
                className="text-muted-foreground hover:text-ios-blue transition-colors text-xs"
              >
                {currentText.privacy}
              </button>
              <button 
                onClick={() => handleLinkClick('/terms', currentText.terms)}
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

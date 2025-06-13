
import { Home, FileText, Bell, Scale, DollarSign, Building2, Search } from "lucide-react";

interface FooterBuyingGuideProps {
  language: "en" | "id";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterBuyingGuide = ({ language, onLinkClick }: FooterBuyingGuideProps) => {
  const text = {
    en: {
      buyingGuide: "Buying Guide",
      buyingOverview: "Buying Overview",
      guideFaq: "Guide & FAQ",
      registerAlerts: "Register for Alerts",
      termsOfSale: "Terms of Sale",
      whyBuy: "Why Buy at Astra Villa",
      finance: "Astra Villa Finance",
      solicitors: "Solicitors",
      lookingFor: "What are you looking for?",
      flats: "Flats",
      houses: "Houses",
      land: "Land",
      commercial: "Commercial",
    },
    id: {
      buyingGuide: "Panduan Membeli",
      buyingOverview: "Ikhtisar Pembelian",
      guideFaq: "Panduan & FAQ",
      registerAlerts: "Daftar untuk Peringatan",
      termsOfSale: "Syarat Penjualan",
      whyBuy: "Mengapa Beli di Astra Villa",
      finance: "Astra Villa Finance",
      solicitors: "Pengacara",
      lookingFor: "Apa yang Anda cari?",
      flats: "Apartemen",
      houses: "Rumah",
      land: "Tanah",
      commercial: "Komersial",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        {currentText.buyingGuide}
      </h4>
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => onLinkClick('/buying-overview', currentText.buyingOverview)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Home className="h-3 w-3" />
            {currentText.buyingOverview}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/buying-guide-faq', currentText.guideFaq)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <FileText className="h-3 w-3" />
            {currentText.guideFaq}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/register-alerts', currentText.registerAlerts)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Bell className="h-3 w-3" />
            {currentText.registerAlerts}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/terms-of-sale', currentText.termsOfSale)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Scale className="h-3 w-3" />
            {currentText.termsOfSale}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/why-buy-astra-villa', currentText.whyBuy)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <DollarSign className="h-3 w-3" />
            {currentText.whyBuy}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/finance', currentText.finance)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <DollarSign className="h-3 w-3" />
            {currentText.finance}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/solicitors', currentText.solicitors)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Scale className="h-3 w-3" />
            {currentText.solicitors}
          </button>
        </li>
      </ul>
      
      <div className="pt-2 border-t border-border/30">
        <h5 className="font-medium text-foreground text-xs mb-2 flex items-center gap-2">
          <Search className="h-3 w-3 text-primary" />
          {currentText.lookingFor}
        </h5>
        <ul className="space-y-1">
          <li>
            <button 
              onClick={() => onLinkClick('/flats', currentText.flats)}
              className="text-muted-foreground hover:text-primary transition-colors text-xs text-left w-full"
            >
              {currentText.flats}
            </button>
          </li>
          <li>
            <button 
              onClick={() => onLinkClick('/houses', currentText.houses)}
              className="text-muted-foreground hover:text-primary transition-colors text-xs text-left w-full"
            >
              {currentText.houses}
            </button>
          </li>
          <li>
            <button 
              onClick={() => onLinkClick('/land', currentText.land)}
              className="text-muted-foreground hover:text-primary transition-colors text-xs text-left w-full"
            >
              {currentText.land}
            </button>
          </li>
          <li>
            <button 
              onClick={() => onLinkClick('/commercial', currentText.commercial)}
              className="text-muted-foreground hover:text-primary transition-colors text-xs text-left w-full"
            >
              {currentText.commercial}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FooterBuyingGuide;


import { TrendingUp, FileCheck, HelpCircle, Calculator, Users, FileSearch, Zap, BarChart3, DollarSign } from "lucide-react";

interface FooterSellingGuideProps {
  language: "en" | "id";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterSellingGuide = ({ language, onLinkClick }: FooterSellingGuideProps) => {
  const text = {
    en: {
      sellingGuide: "Selling Guide",
      sellingOverview: "Selling Overview",
      whySell: "Why Sell with Astra Villa",
      sellingFaq: "Selling Guide & FAQ",
      freeValuation: "FREE Property Valuation",
      partnerAgents: "Partner Agents & Referral Fees",
      homeReports: "Home Reports & Surveys",
      sellingSolicitors: "Selling Solicitors",
      premiumTools: "Premium Selling Tools",
      aiPricing: "AI Instant Pricing",
      premiumMarketing: "Premium Marketing Packages",
      marketInsights: "Seller's Market Insights",
      fastTrack: "Fast-Track Sale Program",
    },
    id: {
      sellingGuide: "Panduan Menjual",
      sellingOverview: "Ikhtisar Penjualan",
      whySell: "Mengapa Jual dengan Astra Villa",
      sellingFaq: "Panduan Menjual & FAQ",
      freeValuation: "Valuasi Properti GRATIS",
      partnerAgents: "Agen Mitra & Biaya Rujukan",
      homeReports: "Laporan & Survei Rumah",
      sellingSolicitors: "Pengacara Penjualan",
      premiumTools: "Alat Penjualan Premium",
      aiPricing: "Harga Instan AI",
      premiumMarketing: "Paket Pemasaran Premium",
      marketInsights: "Wawasan Pasar Penjual",
      fastTrack: "Program Penjualan Cepat",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        {currentText.sellingGuide}
      </h4>
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => onLinkClick('/selling-overview', currentText.sellingOverview)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <FileCheck className="h-3 w-3" />
            {currentText.sellingOverview}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/why-sell-astra-villa', currentText.whySell)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <TrendingUp className="h-3 w-3" />
            {currentText.whySell}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/selling-faq', currentText.sellingFaq)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <HelpCircle className="h-3 w-3" />
            {currentText.sellingFaq}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/free-valuation', currentText.freeValuation)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Calculator className="h-3 w-3" />
            {currentText.freeValuation}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/partner-agents', currentText.partnerAgents)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Users className="h-3 w-3" />
            {currentText.partnerAgents}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/home-reports', currentText.homeReports)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <FileSearch className="h-3 w-3" />
            {currentText.homeReports}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/selling-solicitors', currentText.sellingSolicitors)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <FileCheck className="h-3 w-3" />
            {currentText.sellingSolicitors}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/ai-pricing', currentText.aiPricing)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Zap className="h-3 w-3" />
            {currentText.aiPricing}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/premium-marketing', currentText.premiumMarketing)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <BarChart3 className="h-3 w-3" />
            {currentText.premiumMarketing}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/market-insights', currentText.marketInsights)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <BarChart3 className="h-3 w-3" />
            {currentText.marketInsights}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/fast-track-sale', currentText.fastTrack)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <DollarSign className="h-3 w-3" />
            {currentText.fastTrack}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default FooterSellingGuide;


import { Calculator, Bell, BarChart3, Search, TrendingUp, Zap } from "lucide-react";

interface FooterServicesToolsProps {
  language: "en" | "id";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterServicesTools = ({ language, onLinkClick }: FooterServicesToolsProps) => {
  const text = {
    en: {
      servicesTools: "Services & Tools",
      freeValuation: "FREE AstraVilla Valuation",
      propertyAlerts: "AstraVilla Property Alerts",
      mortgageCalculator: "Mortgage Calculator",
      comparisonTool: "Property Comparison Tool",
      neighborhoodGuide: "Neighborhood Guide",
      roiCalculator: "Investment ROI Calculator",
    },
    id: {
      servicesTools: "Layanan & Alat",
      freeValuation: "Valuasi AstraVilla GRATIS",
      propertyAlerts: "Peringatan Properti AstraVilla",
      mortgageCalculator: "Kalkulator Hipotek",
      comparisonTool: "Alat Perbandingan Properti",
      neighborhoodGuide: "Panduan Lingkungan",
      roiCalculator: "Kalkulator ROI Investasi",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        {currentText.servicesTools}
      </h4>
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => onLinkClick('/free-astravilla-valuation', currentText.freeValuation)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Calculator className="h-3 w-3" />
            {currentText.freeValuation}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/property-alerts', currentText.propertyAlerts)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Bell className="h-3 w-3" />
            {currentText.propertyAlerts}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/mortgage-calculator', currentText.mortgageCalculator)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Calculator className="h-3 w-3" />
            {currentText.mortgageCalculator}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/property-comparison', currentText.comparisonTool)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <BarChart3 className="h-3 w-3" />
            {currentText.comparisonTool}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/neighborhood-guide', currentText.neighborhoodGuide)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Search className="h-3 w-3" />
            {currentText.neighborhoodGuide}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/roi-calculator', currentText.roiCalculator)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <TrendingUp className="h-3 w-3" />
            {currentText.roiCalculator}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default FooterServicesTools;

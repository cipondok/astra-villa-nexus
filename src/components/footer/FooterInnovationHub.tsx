
import { Zap, Eye, Shield, FileCheck, Bitcoin, Mic, Smartphone, BarChart3 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FooterInnovationHubProps {
  language: "en" | "id";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterInnovationHub = ({ language, onLinkClick }: FooterInnovationHubProps) => {
  const text = {
    en: {
      innovationHub: "Innovation Hub",
      aiMatching: "AI Property Matching",
      virtualTours: "360° Virtual Tours",
      blockchainVerification: "Blockchain Property Verification",
      smartContracts: "Smart Contract Integration",
      cryptoPayments: "Cryptocurrency Payments",
      voiceSearch: "Voice-Activated Search",
      arVisualization: "AR Property Visualization",
      predictiveAnalytics: "Predictive Market Analytics",
    },
    id: {
      innovationHub: "Hub Inovasi",
      aiMatching: "Pencocokan Properti AI",
      virtualTours: "Tur Virtual 360°",
      blockchainVerification: "Verifikasi Properti Blockchain",
      smartContracts: "Integrasi Kontrak Pintar",
      cryptoPayments: "Pembayaran Cryptocurrency",
      voiceSearch: "Pencarian Suara",
      arVisualization: "Visualisasi Properti AR",
      predictiveAnalytics: "Analitik Pasar Prediktif",
    }
  };

  const currentText = text[language];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="innovation-hub" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {currentText.innovationHub}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <ul className="space-y-2 pl-1">
            <li>
              <button 
                onClick={() => onLinkClick('/ai-property-matching', currentText.aiMatching)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
              >
                <Zap className="h-3 w-3" />
                {currentText.aiMatching}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onLinkClick('/virtual-tours', currentText.virtualTours)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
              >
                <Eye className="h-3 w-3" />
                {currentText.virtualTours}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onLinkClick('/blockchain-verification', currentText.blockchainVerification)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
              >
                <Shield className="h-3 w-3" />
                {currentText.blockchainVerification}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onLinkClick('/smart-contracts', currentText.smartContracts)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
              >
                <FileCheck className="h-3 w-3" />
                {currentText.smartContracts}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onLinkClick('/crypto-payments', currentText.cryptoPayments)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
              >
                <Bitcoin className="h-3 w-3" />
                {currentText.cryptoPayments}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onLinkClick('/voice-search', currentText.voiceSearch)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
              >
                <Mic className="h-3 w-3" />
                {currentText.voiceSearch}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onLinkClick('/ar-visualization', currentText.arVisualization)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
              >
                <Smartphone className="h-3 w-3" />
                {currentText.arVisualization}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onLinkClick('/predictive-analytics', currentText.predictiveAnalytics)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
              >
                <BarChart3 className="h-3 w-3" />
                {currentText.predictiveAnalytics}
              </button>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FooterInnovationHub;

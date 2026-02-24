
import { Zap, Eye, Shield, FileCheck, Bitcoin, Mic, Smartphone, BarChart3 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterInnovationHubProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterInnovationHub = ({ onLinkClick }: FooterInnovationHubProps) => {
  const { t } = useTranslation();

  const links = [
    { path: '/ai-property-matching', key: 'aiMatching', Icon: Zap },
    { path: '/virtual-tours', key: 'virtualTours', Icon: Eye },
    { path: '/blockchain-verification', key: 'blockchainVerification', Icon: Shield },
    { path: '/smart-contracts', key: 'smartContracts', Icon: FileCheck },
    { path: '/crypto-payments', key: 'cryptoPayments', Icon: Bitcoin },
    { path: '/voice-search', key: 'voiceSearch', Icon: Mic },
    { path: '/ar-visualization', key: 'arVisualization', Icon: Smartphone },
    { path: '/predictive-analytics', key: 'predictiveAnalytics', Icon: BarChart3 },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="innovation-hub" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {t('footerInnovationHub.innovationHub')}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <ul className="space-y-2 pl-1">
            {links.map((link) => (
              <li key={link.path}>
                <button
                  onClick={() => onLinkClick(link.path, t(`footerInnovationHub.${link.key}`))}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
                >
                  <link.Icon className="h-3 w-3" />
                  {t(`footerInnovationHub.${link.key}`)}
                </button>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FooterInnovationHub;

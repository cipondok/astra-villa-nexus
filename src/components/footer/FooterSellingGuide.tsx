
import { TrendingUp, FileCheck, HelpCircle, Calculator, Users, FileSearch, Zap, BarChart3, DollarSign } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterSellingGuideProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterSellingGuide = ({ onLinkClick }: FooterSellingGuideProps) => {
  const { t } = useTranslation();

  const links = [
    { path: '/selling-overview', key: 'sellingOverview', Icon: FileCheck },
    { path: '/why-sell-astra-villa', key: 'whySell', Icon: TrendingUp },
    { path: '/selling-faq', key: 'sellingFaq', Icon: HelpCircle },
    { path: '/free-valuation', key: 'freeValuation', Icon: Calculator },
    { path: '/partner-agents', key: 'partnerAgents', Icon: Users },
    { path: '/home-reports', key: 'homeReports', Icon: FileSearch },
    { path: '/selling-solicitors', key: 'sellingSolicitors', Icon: FileCheck },
    { path: '/ai-pricing', key: 'aiPricing', Icon: Zap },
    { path: '/premium-marketing', key: 'premiumMarketing', Icon: BarChart3 },
    { path: '/market-insights', key: 'marketInsights', Icon: BarChart3 },
    { path: '/fast-track-sale', key: 'fastTrack', Icon: DollarSign },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="selling-guide" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold-primary" />
            {t('footerSelling.sellingGuide')}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <ul className="space-y-2 pl-1">
            {links.map((link) => (
              <li key={link.path}>
                <button
                  onClick={() => onLinkClick(link.path, t(`footerSelling.${link.key}`))}
                  className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
                >
                  <link.Icon className="h-3 w-3" />
                  {t(`footerSelling.${link.key}`)}
                </button>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FooterSellingGuide;

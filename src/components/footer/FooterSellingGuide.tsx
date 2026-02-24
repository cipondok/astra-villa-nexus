
import { TrendingUp, FileCheck, HelpCircle, Calculator, Users, FileSearch, Zap, BarChart3, DollarSign } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterSellingGuideProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterSellingGuide = ({ onLinkClick }: FooterSellingGuideProps) => {
  const { t } = useTranslation();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="selling-guide" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t('footerSelling.sellingGuide')}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <ul className="space-y-2 pl-1">
            <li>
              <button onClick={() => onLinkClick('/selling-overview', t('footerSelling.sellingOverview'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <FileCheck className="h-3 w-3" />
                {t('footerSelling.sellingOverview')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/why-sell-astra-villa', t('footerSelling.whySell'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <TrendingUp className="h-3 w-3" />
                {t('footerSelling.whySell')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/selling-faq', t('footerSelling.sellingFaq'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <HelpCircle className="h-3 w-3" />
                {t('footerSelling.sellingFaq')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/free-valuation', t('footerSelling.freeValuation'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Calculator className="h-3 w-3" />
                {t('footerSelling.freeValuation')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/partner-agents', t('footerSelling.partnerAgents'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Users className="h-3 w-3" />
                {t('footerSelling.partnerAgents')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/home-reports', t('footerSelling.homeReports'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <FileSearch className="h-3 w-3" />
                {t('footerSelling.homeReports')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/selling-solicitors', t('footerSelling.sellingSolicitors'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <FileCheck className="h-3 w-3" />
                {t('footerSelling.sellingSolicitors')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/ai-pricing', t('footerSelling.aiPricing'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Zap className="h-3 w-3" />
                {t('footerSelling.aiPricing')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/premium-marketing', t('footerSelling.premiumMarketing'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <BarChart3 className="h-3 w-3" />
                {t('footerSelling.premiumMarketing')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/market-insights', t('footerSelling.marketInsights'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <BarChart3 className="h-3 w-3" />
                {t('footerSelling.marketInsights')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/fast-track-sale', t('footerSelling.fastTrack'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <DollarSign className="h-3 w-3" />
                {t('footerSelling.fastTrack')}
              </button>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FooterSellingGuide;


import { Calculator, Bell, BarChart3, Search, TrendingUp, Zap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterServicesToolsProps {
  language: "en" | "id";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterServicesTools = ({ language, onLinkClick }: FooterServicesToolsProps) => {
  const { t } = useTranslation();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="services-tools" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {t('footer.servicesTools')}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <ul className="space-y-2 pl-1">
            <li>
              <button onClick={() => onLinkClick('/free-astravilla-valuation', t('footer.freeValuation'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Calculator className="h-3 w-3" />
                {t('footer.freeValuation')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/property-alerts', t('footer.propertyAlerts'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Bell className="h-3 w-3" />
                {t('footer.propertyAlerts')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/mortgage-calculator', t('footer.mortgageCalculator'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Calculator className="h-3 w-3" />
                {t('footer.mortgageCalculator')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/property-comparison', t('footer.comparisonTool'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <BarChart3 className="h-3 w-3" />
                {t('footer.comparisonTool')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/neighborhood-guide', t('footer.neighborhoodGuide'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Search className="h-3 w-3" />
                {t('footer.neighborhoodGuide')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/roi-calculator', t('footer.roiCalculator'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <TrendingUp className="h-3 w-3" />
                {t('footer.roiCalculator')}
              </button>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FooterServicesTools;

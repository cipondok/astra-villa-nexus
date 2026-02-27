
import { Home, FileText, Bell, Scale, DollarSign, Building2, Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterBuyingGuideProps {
  language: "en" | "id" | "zh" | "ja" | "ko";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterBuyingGuide = ({ language, onLinkClick }: FooterBuyingGuideProps) => {
  const { t } = useTranslation();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="buying-guide" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gold-primary" />
            {t('footer.buyingGuide')}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <div className="space-y-4 pl-1">
            <ul className="space-y-2">
              <li>
                <button onClick={() => onLinkClick('/buying-overview', t('footer.buyingOverview'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <Home className="h-3 w-3" />
                  {t('footer.buyingOverview')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/buying-guide-faq', t('footer.guideFaq'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <FileText className="h-3 w-3" />
                  {t('footer.guideFaq')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/register-alerts', t('footer.registerAlerts'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <Bell className="h-3 w-3" />
                  {t('footer.registerAlerts')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/terms-of-sale', t('footer.termsOfSale'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <Scale className="h-3 w-3" />
                  {t('footer.termsOfSale')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/why-buy-astra-villa', t('footer.whyBuy'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <DollarSign className="h-3 w-3" />
                  {t('footer.whyBuy')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/finance', t('footer.finance'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <DollarSign className="h-3 w-3" />
                  {t('footer.finance')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/solicitors', t('footer.solicitors'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <Scale className="h-3 w-3" />
                  {t('footer.solicitors')}
                </button>
              </li>
            </ul>
            
            <div className="pt-2 border-t border-border/30">
              <h5 className="font-medium text-foreground text-xs mb-2 flex items-center gap-2">
                 <Search className="h-3 w-3 text-gold-primary" />
                {t('footer.lookingFor')}
              </h5>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => onLinkClick('/flats', t('footer.flats'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-xs text-left w-full">
                    {t('footer.flats')}
                  </button>
                </li>
                <li>
                  <button onClick={() => onLinkClick('/houses', t('footer.houses'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-xs text-left w-full">
                    {t('footer.houses')}
                  </button>
                </li>
                <li>
                  <button onClick={() => onLinkClick('/land', t('footer.land'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-xs text-left w-full">
                    {t('footer.land')}
                  </button>
                </li>
                <li>
                  <button onClick={() => onLinkClick('/commercial', t('footer.commercial'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-xs text-left w-full">
                    {t('footer.commercial')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FooterBuyingGuide;

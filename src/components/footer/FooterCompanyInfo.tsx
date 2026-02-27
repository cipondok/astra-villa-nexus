
import { Building, Heart, Users, Target, MessageSquare, TrendingUp, Award } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterCompanyInfoProps {
  language: "en" | "id" | "zh" | "ja" | "ko";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterCompanyInfo = ({ language, onLinkClick }: FooterCompanyInfoProps) => {
  const { t } = useTranslation();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="company-info" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gold-primary" />
            {t('footer.aboutUs')}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <ul className="space-y-2 pl-1">
            <li>
              <button onClick={() => onLinkClick('/about', t('footer.ourStory'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Heart className="h-3 w-3" />
                {t('footer.ourStory')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/leadership', t('footer.leadership'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Users className="h-3 w-3" />
                {t('footer.leadership')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/careers', t('footer.careers'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Target className="h-3 w-3" />
                {t('footer.careers')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/press-media', t('footer.pressMedia'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <MessageSquare className="h-3 w-3" />
                {t('footer.pressMedia')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/investor-relations', t('footer.investorRelations'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <TrendingUp className="h-3 w-3" />
                {t('footer.investorRelations')}
              </button>
            </li>
            <li>
              <button onClick={() => onLinkClick('/corporate-social', t('footer.corporateSocial'))} className="text-muted-foreground hover:text-gold-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                <Award className="h-3 w-3" />
                {t('footer.corporateSocial')}
              </button>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FooterCompanyInfo;

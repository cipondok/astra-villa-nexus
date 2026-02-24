
import { HelpCircle, Phone, MessageCircle, CreditCard, AlertTriangle, FileText, Zap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterVendorHelpProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterVendorHelp = ({ onLinkClick }: FooterVendorHelpProps) => {
  const { t } = useTranslation();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="vendor-help" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            {t('footerVendor.vendorHelp')}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <div className="space-y-4 pl-1">
            <ul className="space-y-2">
              <li>
                <button onClick={() => onLinkClick('/technical-support', t('footerVendor.technicalSupport'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <Zap className="h-3 w-3" />
                  {t('footerVendor.technicalSupport')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/account-help', t('footerVendor.accountHelp'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <HelpCircle className="h-3 w-3" />
                  {t('footerVendor.accountHelp')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/billing-support', t('footerVendor.billingSupport'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <CreditCard className="h-3 w-3" />
                  {t('footerVendor.billingSupport')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/service-issues', t('footerVendor.serviceIssues'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <AlertTriangle className="h-3 w-3" />
                  {t('footerVendor.serviceIssues')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/customer-disputes', t('footerVendor.customerDisputes'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <AlertTriangle className="h-3 w-3" />
                  {t('footerVendor.customerDisputes')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/vendor-policies', t('footerVendor.vendorPolicies'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <FileText className="h-3 w-3" />
                  {t('footerVendor.vendorPolicies')}
                </button>
              </li>
              <li>
                <button onClick={() => onLinkClick('/compliance-help', t('footerVendor.complianceHelp'))} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full">
                  <FileText className="h-3 w-3" />
                  {t('footerVendor.complianceHelp')}
                </button>
              </li>
            </ul>
            
            <div className="pt-2 border-t border-border/30">
              <h5 className="font-medium text-foreground text-xs mb-2">
                {t('footerVendor.getHelpNow')}
              </h5>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => onLinkClick('/phone-support', t('footerVendor.phoneSupport'))} className="text-muted-foreground hover:text-primary transition-colors text-xs text-left flex items-center gap-2 w-full">
                    <Phone className="h-3 w-3" />
                    {t('footerVendor.phoneSupport')}
                  </button>
                </li>
                <li>
                  <button onClick={() => onLinkClick('/live-chat', t('footerVendor.liveChat'))} className="text-muted-foreground hover:text-primary transition-colors text-xs text-left flex items-center gap-2 w-full">
                    <MessageCircle className="h-3 w-3" />
                    {t('footerVendor.liveChat')}
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

export default FooterVendorHelp;

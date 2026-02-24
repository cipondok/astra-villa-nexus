
import { Wrench, UserPlus, HelpCircle, Settings, Shield, CreditCard, Zap, Award, BarChart3 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterVendorServicesProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterVendorServices = ({ onLinkClick }: FooterVendorServicesProps) => {
  const { t } = useTranslation();

  const links = [
    { path: '/vendor-overview', key: 'vendorOverview', Icon: Wrench },
    { path: '/vendor-registration', key: 'vendorRegistration', Icon: UserPlus },
    { path: '/vendor-faq', key: 'vendorFaq', Icon: HelpCircle },
    { path: '/service-management', key: 'serviceManagement', Icon: Settings },
    { path: '/vendor-verification', key: 'vendorVerification', Icon: Shield },
    { path: '/vendor-payments', key: 'vendorPayments', Icon: CreditCard },
    { path: '/advanced-tools', key: 'advancedTools', Icon: Zap },
    { path: '/vendor-training', key: 'vendorTraining', Icon: Award },
    { path: '/vendor-certification', key: 'vendorCertification', Icon: Award },
    { path: '/vendor-analytics', key: 'vendorAnalytics', Icon: BarChart3 },
    { path: '/vendor-tools', key: 'vendorTools', Icon: Settings },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="vendor-services" className="border-b-0">
        <AccordionTrigger className="py-2 font-semibold text-foreground text-sm hover:no-underline">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            {t('footerVendorServices.vendorServices')}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <ul className="space-y-2 pl-1">
            {links.map((link) => (
              <li key={link.path}>
                <button
                  onClick={() => onLinkClick(link.path, t(`footerVendorServices.${link.key}`))}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
                >
                  <link.Icon className="h-3 w-3" />
                  {t(`footerVendorServices.${link.key}`)}
                </button>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FooterVendorServices;

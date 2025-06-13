
import { HelpCircle, Phone, MessageCircle, CreditCard, AlertTriangle, FileText, Zap } from "lucide-react";

interface FooterVendorHelpProps {
  language: "en" | "id";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterVendorHelp = ({ language, onLinkClick }: FooterVendorHelpProps) => {
  const text = {
    en: {
      vendorHelp: "Vendor Help Center",
      technicalSupport: "Technical Support",
      accountHelp: "Account Help",
      billingSupport: "Billing Support",
      serviceIssues: "Service Issues",
      customerDisputes: "Customer Disputes",
      vendorPolicies: "Vendor Policies",
      complianceHelp: "Compliance Help",
      getHelpNow: "Get Help Now",
      phoneSupport: "24/7 Phone Support",
      liveChat: "Live Chat Support",
    },
    id: {
      vendorHelp: "Pusat Bantuan Vendor",
      technicalSupport: "Dukungan Teknis",
      accountHelp: "Bantuan Akun",
      billingSupport: "Dukungan Penagihan",
      serviceIssues: "Masalah Layanan",
      customerDisputes: "Sengketa Pelanggan",
      vendorPolicies: "Kebijakan Vendor",
      complianceHelp: "Bantuan Kepatuhan",
      getHelpNow: "Dapatkan Bantuan Sekarang",
      phoneSupport: "Dukungan Telepon 24/7",
      liveChat: "Dukungan Live Chat",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-primary" />
        {currentText.vendorHelp}
      </h4>
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => onLinkClick('/technical-support', currentText.technicalSupport)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Zap className="h-3 w-3" />
            {currentText.technicalSupport}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/account-help', currentText.accountHelp)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <HelpCircle className="h-3 w-3" />
            {currentText.accountHelp}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/billing-support', currentText.billingSupport)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <CreditCard className="h-3 w-3" />
            {currentText.billingSupport}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/service-issues', currentText.serviceIssues)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <AlertTriangle className="h-3 w-3" />
            {currentText.serviceIssues}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/customer-disputes', currentText.customerDisputes)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <AlertTriangle className="h-3 w-3" />
            {currentText.customerDisputes}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-policies', currentText.vendorPolicies)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <FileText className="h-3 w-3" />
            {currentText.vendorPolicies}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/compliance-help', currentText.complianceHelp)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <FileText className="h-3 w-3" />
            {currentText.complianceHelp}
          </button>
        </li>
      </ul>
      
      <div className="pt-2 border-t border-border/30">
        <h5 className="font-medium text-foreground text-xs mb-2">
          {currentText.getHelpNow}
        </h5>
        <ul className="space-y-1">
          <li>
            <button 
              onClick={() => onLinkClick('/phone-support', currentText.phoneSupport)}
              className="text-muted-foreground hover:text-primary transition-colors text-xs text-left flex items-center gap-2 w-full"
            >
              <Phone className="h-3 w-3" />
              {currentText.phoneSupport}
            </button>
          </li>
          <li>
            <button 
              onClick={() => onLinkClick('/live-chat', currentText.liveChat)}
              className="text-muted-foreground hover:text-primary transition-colors text-xs text-left flex items-center gap-2 w-full"
            >
              <MessageCircle className="h-3 w-3" />
              {currentText.liveChat}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FooterVendorHelp;

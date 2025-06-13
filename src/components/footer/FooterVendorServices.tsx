
import { Wrench, UserPlus, HelpCircle, Settings, Shield, CreditCard, Zap, Award, BarChart3 } from "lucide-react";

interface FooterVendorServicesProps {
  language: "en" | "id";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterVendorServices = ({ language, onLinkClick }: FooterVendorServicesProps) => {
  const text = {
    en: {
      vendorServices: "Vendor Services Guide",
      vendorOverview: "Vendor Overview",
      vendorRegistration: "Vendor Registration",
      vendorFaq: "Vendor Guide & FAQ",
      serviceManagement: "Service Management",
      vendorVerification: "Vendor Verification",
      vendorPayments: "Vendor Payments",
      advancedTools: "Advanced Tools",
      vendorTraining: "Vendor Training",
      vendorCertification: "Vendor Certification",
      vendorAnalytics: "Vendor Analytics",
      vendorTools: "Vendor Tools",
    },
    id: {
      vendorServices: "Panduan Layanan Vendor",
      vendorOverview: "Ikhtisar Vendor",
      vendorRegistration: "Registrasi Vendor",
      vendorFaq: "Panduan Vendor & FAQ",
      serviceManagement: "Manajemen Layanan",
      vendorVerification: "Verifikasi Vendor",
      vendorPayments: "Pembayaran Vendor",
      advancedTools: "Alat Lanjutan",
      vendorTraining: "Pelatihan Vendor",
      vendorCertification: "Sertifikasi Vendor",
      vendorAnalytics: "Analitik Vendor",
      vendorTools: "Alat Vendor",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" />
        {currentText.vendorServices}
      </h4>
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-overview', currentText.vendorOverview)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Wrench className="h-3 w-3" />
            {currentText.vendorOverview}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-registration', currentText.vendorRegistration)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <UserPlus className="h-3 w-3" />
            {currentText.vendorRegistration}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-faq', currentText.vendorFaq)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <HelpCircle className="h-3 w-3" />
            {currentText.vendorFaq}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/service-management', currentText.serviceManagement)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Settings className="h-3 w-3" />
            {currentText.serviceManagement}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-verification', currentText.vendorVerification)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Shield className="h-3 w-3" />
            {currentText.vendorVerification}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-payments', currentText.vendorPayments)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <CreditCard className="h-3 w-3" />
            {currentText.vendorPayments}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/advanced-tools', currentText.advancedTools)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Zap className="h-3 w-3" />
            {currentText.advancedTools}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-training', currentText.vendorTraining)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Award className="h-3 w-3" />
            {currentText.vendorTraining}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-certification', currentText.vendorCertification)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Award className="h-3 w-3" />
            {currentText.vendorCertification}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-analytics', currentText.vendorAnalytics)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <BarChart3 className="h-3 w-3" />
            {currentText.vendorAnalytics}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/vendor-tools', currentText.vendorTools)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Settings className="h-3 w-3" />
            {currentText.vendorTools}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default FooterVendorServices;

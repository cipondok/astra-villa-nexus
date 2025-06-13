
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FooterBrand from "./footer/FooterBrand";
import FooterCompanyInfo from "./footer/FooterCompanyInfo";
import FooterNewsletter from "./footer/FooterNewsletter";
import FooterContact from "./footer/FooterContact";
import FooterBuyingGuide from "./footer/FooterBuyingGuide";
import FooterSellingGuide from "./footer/FooterSellingGuide";
import FooterVendorServices from "./footer/FooterVendorServices";
import FooterOffices from "./footer/FooterOffices";
import FooterServicesTools from "./footer/FooterServicesTools";
import FooterInnovationHub from "./footer/FooterInnovationHub";
import FooterVendorHelp from "./footer/FooterVendorHelp";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const navigate = useNavigate();

  const text = {
    en: {
      company: "Astra Villa",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      featureNotAvailable: "This feature is coming soon. Stay tuned!",
    },
    id: {
      company: "Astra Villa",
      rights: "Semua hak dilindungi.",
      privacy: "Kebijakan Privasi",
      terms: "Syarat Layanan",
      featureNotAvailable: "Fitur ini akan segera hadir. Nantikan!",
    }
  };

  const currentText = text[language];

  const handleLinkClick = (path: string, label?: string) => {
    console.log("Footer link clicked:", path, label);
    
    // Handle existing routes
    if (path === '/' || path === '/properties' || path === '/about' || path === '/vendor-registration') {
      navigate(path);
      return;
    }
    
    // For unimplemented routes, show a coming soon message
    toast.info(`${label || 'Feature'} - ${currentText.featureNotAvailable}`);
  };

  return (
    <footer className="relative bg-gradient-to-br from-background via-background/98 to-muted/30 border-t border-border/40 mt-20">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-12 mb-12">
          {/* Brand Column - Wider on larger screens */}
          <div className="lg:col-span-1 xl:col-span-1">
            <FooterBrand language={language} />
          </div>
          
          {/* Services Columns */}
          <div className="lg:col-span-3 xl:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Property Guides */}
              <div className="space-y-8">
                <FooterBuyingGuide language={language} onLinkClick={handleLinkClick} />
                <FooterSellingGuide language={language} onLinkClick={handleLinkClick} />
              </div>

              {/* Vendor Services */}
              <div className="space-y-8">
                <FooterVendorServices language={language} onLinkClick={handleLinkClick} />
                <FooterVendorHelp language={language} onLinkClick={handleLinkClick} />
              </div>

              {/* Company & Tools */}
              <div className="space-y-8">
                <FooterCompanyInfo language={language} onLinkClick={handleLinkClick} />
                <FooterServicesTools language={language} onLinkClick={handleLinkClick} />
              </div>

              {/* Innovation & Contact */}
              <div className="space-y-8">
                <FooterInnovationHub language={language} onLinkClick={handleLinkClick} />
                <FooterNewsletter language={language} />
              </div>
            </div>
          </div>
        </div>

        {/* Offices Section - Full Width */}
        <div className="border-t border-border/30 pt-12 mb-12">
          <FooterOffices language={language} />
        </div>

        {/* Contact Section */}
        <div className="border-t border-border/30 pt-8 mb-8">
          <FooterContact language={language} />
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2024 {currentText.company}. {currentText.rights}
            </p>
            <div className="flex space-x-8">
              <button 
                onClick={() => handleLinkClick('/privacy', currentText.privacy)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm hover:underline underline-offset-4"
              >
                {currentText.privacy}
              </button>
              <button 
                onClick={() => handleLinkClick('/terms', currentText.terms)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm hover:underline underline-offset-4"
              >
                {currentText.terms}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

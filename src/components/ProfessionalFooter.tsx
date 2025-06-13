
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
    <footer className="relative bg-background/95 backdrop-blur-sm border-t border-border/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content - Comprehensive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 mb-8">
          {/* Company Brand */}
          <div className="xl:col-span-1">
            <FooterBrand language={language} />
          </div>
          
          {/* Buying Guide */}
          <div>
            <FooterBuyingGuide language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Selling Guide */}
          <div>
            <FooterSellingGuide language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Vendor Services */}
          <div>
            <FooterVendorServices language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Company Info & About Us */}
          <div>
            <FooterCompanyInfo language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Vendor Help Center */}
          <div>
            <FooterVendorHelp language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Our Offices */}
          <div>
            <FooterOffices language={language} />
          </div>

          {/* Services & Tools */}
          <div>
            <FooterServicesTools language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Innovation Hub */}
          <div>
            <FooterInnovationHub language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Newsletter Subscription */}
          <div>
            <FooterNewsletter language={language} />
          </div>

          {/* Contact Information */}
          <div>
            <FooterContact language={language} />
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/30 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2024 {currentText.company}. {currentText.rights}
            </p>
            <div className="flex space-x-6">
              <button 
                onClick={() => handleLinkClick('/privacy', currentText.privacy)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                {currentText.privacy}
              </button>
              <button 
                onClick={() => handleLinkClick('/terms', currentText.terms)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
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

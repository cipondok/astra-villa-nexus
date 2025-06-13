
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FooterBrand from "./footer/FooterBrand";
import FooterCompanyInfo from "./footer/FooterCompanyInfo";
import FooterNewsletter from "./footer/FooterNewsletter";
import FooterContact from "./footer/FooterContact";

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
    // Handle existing routes
    if (path === '/' || path === '/properties' || path === '/about') {
      navigate(path);
      return;
    }
    
    // For unimplemented routes, show a coming soon message
    toast.info(`${label || 'Feature'} - ${currentText.featureNotAvailable}`);
  };

  return (
    <footer className="glass-ios border-t border-border/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <FooterBrand language={language} />
          
          {/* About Us & Company Info */}
          <FooterCompanyInfo language={language} onLinkClick={handleLinkClick} />

          {/* Newsletter & Contact Info - Combined */}
          <div className="space-y-6">
            <FooterNewsletter language={language} />
            <FooterContact language={language} />
          </div>

          {/* Additional space for future sections */}
          <div className="space-y-4">
            {/* This column can be used for additional footer sections in the future */}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/30 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-xs">
              © 2024 {currentText.company}. {currentText.rights}
            </p>
            <div className="flex space-x-6">
              <button 
                onClick={() => handleLinkClick('/privacy', currentText.privacy)}
                className="text-muted-foreground hover:text-ios-blue transition-colors text-xs"
              >
                {currentText.privacy}
              </button>
              <button 
                onClick={() => handleLinkClick('/terms', currentText.terms)}
                className="text-muted-foreground hover:text-ios-blue transition-colors text-xs"
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

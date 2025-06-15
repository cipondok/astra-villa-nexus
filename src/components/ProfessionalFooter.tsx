import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FooterBrand from "./footer/FooterBrand";
import FooterCompanyInfo from "./footer/FooterCompanyInfo";
import FooterNewsletter from "./footer/FooterNewsletter";
import FooterBuyingGuide from "./footer/FooterBuyingGuide";
import FooterSellingGuide from "./footer/FooterSellingGuide";
import FooterVendorServices from "./footer/FooterVendorServices";
import FooterOffices from "./footer/FooterOffices";
import FooterServicesTools from "./footer/FooterServicesTools";
import FooterInnovationHub from "./footer/FooterInnovationHub";
import FooterVendorHelp from "./footer/FooterVendorHelp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
      legal: "Legal",
    },
    id: {
      company: "Astra Villa",
      rights: "Semua hak dilindungi.",
      privacy: "Kebijakan Privasi",
      terms: "Syarat Layanan",
      featureNotAvailable: "Fitur ini akan segera hadir. Nantikan!",
      legal: "Hukum",
    }
  };

  const currentText = text[language];

  const handleLinkClick = (path: string, label?: string) => {
    console.log("Footer link clicked:", path, label);

    const propertyTypePaths = ['/flats', '/houses', '/land', '/commercial'];
    if (propertyTypePaths.includes(path)) {
      const type = path.substring(1);
      navigate(`/properties?type=${type}`);
      return;
    }
    
    // Handle existing routes
    if (path === '/' || path === '/properties' || path === '/about' || path === '/vendor-registration') {
      navigate(path);
      return;
    }
    
    // For unimplemented routes, show a coming soon message
    toast.info(`${label || 'Feature'} - ${currentText.featureNotAvailable}`);
  };

  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 space-y-8">
            <FooterBrand language={language} />
            <FooterNewsletter language={language} />
          </div>
          
          {/* Property Guides */}
          <div className="space-y-4">
            <FooterBuyingGuide language={language} onLinkClick={handleLinkClick} />
            <FooterSellingGuide language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Vendor & Company */}
          <div className="space-y-4">
            <FooterVendorServices language={language} onLinkClick={handleLinkClick} />
            <FooterVendorHelp language={language} onLinkClick={handleLinkClick} />
            <FooterCompanyInfo language={language} onLinkClick={handleLinkClick} />
          </div>

          {/* Services & Innovation */}
          <div className="space-y-4">
            <FooterServicesTools language={language} onLinkClick={handleLinkClick} />
            <FooterInnovationHub language={language} onLinkClick={handleLinkClick} />
          </div>
        </div>

        {/* Offices Section - Full Width */}
        <div className="border-t border-border/20 pt-12 mb-12">
          <FooterOffices language={language} />
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2024 {currentText.company}. {currentText.rights}
            </p>
            <div className="flex space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                    {currentText.legal}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => handleLinkClick('/privacy', currentText.privacy)}>
                    {currentText.privacy}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleLinkClick('/terms', currentText.terms)}>
                    {currentText.terms}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;

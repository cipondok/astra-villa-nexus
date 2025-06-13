
import { MapPin, Phone, Mail, Clock, Globe } from "lucide-react";

interface FooterContactProps {
  language: "en" | "id";
}

const FooterContact = ({ language }: FooterContactProps) => {
  const text = {
    en: {
      contact: "Contact Information",
      address: "123 Property Street, Jakarta, Indonesia",
      phone: "+62 21 1234 5678",
      email: "info@astravilla.com",
      website: "www.astravilla.com",
      businessHours: "Business Hours: Mon-Fri 9:00 AM - 6:00 PM",
      emergencyLine: "24/7 Emergency Line",
      emergencyPhone: "+62 21 9999 8888",
    },
    id: {
      contact: "Informasi Kontak",
      address: "Jl. Properti No. 123, Jakarta, Indonesia",
      phone: "+62 21 1234 5678",
      email: "info@astravilla.com",
      website: "www.astravilla.com",
      businessHours: "Jam Kerja: Sen-Jum 09:00 - 18:00",
      emergencyLine: "Jalur Darurat 24/7",
      emergencyPhone: "+62 21 9999 8888",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Phone className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-bold text-foreground text-lg">
          {currentText.contact}
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Main Contact */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/30">
          <h5 className="font-semibold text-foreground text-sm mb-3">Main Contact</h5>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground text-sm leading-relaxed">
                {currentText.address}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground text-sm font-medium">
                {currentText.phone}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground text-sm font-medium">
                {currentText.email}
              </span>
            </div>
          </div>
        </div>

        {/* Website & Hours */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/30">
          <h5 className="font-semibold text-foreground text-sm mb-3">Online & Hours</h5>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground text-sm font-medium">
                {currentText.website}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground text-sm leading-relaxed">
                {currentText.businessHours}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4 p-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200/30 dark:border-red-800/30">
          <h5 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            {currentText.emergencyLine}
          </h5>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300 text-sm font-bold">
              {currentText.emergencyPhone}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h5 className="font-semibold text-foreground text-sm mb-3">Quick Actions</h5>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-primary hover:text-primary/80 transition-colors font-medium">
              → Schedule a Call
            </button>
            <button className="w-full text-left text-sm text-primary hover:text-primary/80 transition-colors font-medium">
              → Send Message
            </button>
            <button className="w-full text-left text-sm text-primary hover:text-primary/80 transition-colors font-medium">
              → Find Nearest Office
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterContact;

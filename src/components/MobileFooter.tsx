import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const MobileFooter = () => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();

  const text = {
    en: {
      contact: "Contact Us",
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      address: "Jakarta, Indonesia",
      phone: "+62 812-3456-789",
      email: "info@astravilla.com",
      whatsapp: "WhatsApp",
      copyright: "© 2024 ASTRA Villa. All rights reserved."
    },
    id: {
      contact: "Hubungi Kami", 
      quickLinks: "Tautan Cepat",
      followUs: "Ikuti Kami",
      address: "Jakarta, Indonesia",
      phone: "+62 812-3456-789", 
      email: "info@astravilla.com",
      whatsapp: "WhatsApp",
      copyright: "© 2024 ASTRA Villa. Hak cipta dilindungi."
    }
  };

  const currentText = text[language] || text.en;

  if (!isMobile) {
    return null;
  }

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-4">
      {/* Quick Contact Actions - Compact */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-gray-900 dark:text-white mb-2">
            {currentText.contact}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center space-y-0.5 h-auto p-2"
              onClick={() => window.open('tel:+62812345678')}
            >
              <Phone className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs">Call</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center space-y-0.5 h-auto p-2"
              onClick={() => window.open('https://wa.me/62812345678')}
            >
              <MessageCircle className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs">{currentText.whatsapp}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center space-y-0.5 h-auto p-2"
              onClick={() => window.open('mailto:info@astravilla.com')}
            >
              <Mail className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Compact */}
      <div className="px-3 py-4">
        {/* Company Info - Compact */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-1.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Home className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ASTRA Villa
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Premium Real Estate Platform
          </p>
        </div>

        {/* Contact Info - Compact */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="h-3 w-3" />
            <span>{currentText.address}</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-600 dark:text-gray-400">
            <Phone className="h-3 w-3" />
            <span>{currentText.phone}</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-600 dark:text-gray-400">
            <Mail className="h-3 w-3" />
            <span>{currentText.email}</span>
          </div>
        </div>

        {/* Social Media - Compact */}
        <div className="text-center mb-4">
          <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">
            {currentText.followUs}
          </h4>
          <div className="flex justify-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
              onClick={() => window.open('https://facebook.com')}
            >
              <Facebook className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
              onClick={() => window.open('https://instagram.com')}
            >
              <Instagram className="h-4 w-4 text-pink-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
              onClick={() => window.open('https://twitter.com')}
            >
              <Twitter className="h-4 w-4 text-blue-400" />
            </Button>
          </div>
        </div>

        {/* Copyright - Compact */}
        <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentText.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;
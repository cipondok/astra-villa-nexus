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
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8">
      {/* Quick Contact Actions */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {currentText.contact}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center space-y-1 h-auto p-3"
              onClick={() => window.open('tel:+62812345678')}
            >
              <Phone className="h-4 w-4 text-green-600" />
              <span className="text-xs">Call</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center space-y-1 h-auto p-3"
              onClick={() => window.open('https://wa.me/62812345678')}
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs">{currentText.whatsapp}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center space-y-1 h-auto p-3"
              onClick={() => window.open('mailto:info@astravilla.com')}
            >
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-4 py-6">
        {/* Company Info */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ASTRA Villa
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Premium Real Estate Platform
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{currentText.address}</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <span>{currentText.phone}</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <span>{currentText.email}</span>
          </div>
        </div>

        {/* Social Media */}
        <div className="text-center mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {currentText.followUs}
          </h4>
          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-full"
              onClick={() => window.open('https://facebook.com')}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-full"
              onClick={() => window.open('https://instagram.com')}
            >
              <Instagram className="h-5 w-5 text-pink-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-full"
              onClick={() => window.open('https://twitter.com')}
            >
              <Twitter className="h-5 w-5 text-blue-400" />
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentText.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;
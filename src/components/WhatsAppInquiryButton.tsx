import React, { useState } from 'react';
import { MessageCircle, Send, X, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { openWhatsAppChat, InquiryType } from '@/utils/whatsappUtils';

interface WhatsAppInquiryButtonProps {
  defaultType?: InquiryType;
  propertyTitle?: string;
  propertyId?: string;
  variant?: 'default' | 'floating' | 'inline' | 'compact';
  className?: string;
  showForm?: boolean;
}

const WhatsAppInquiryButton: React.FC<WhatsAppInquiryButtonProps> = ({
  defaultType = 'general',
  propertyTitle,
  propertyId,
  variant = 'default',
  className = '',
  showForm = true
}) => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryType>(defaultType);
  const [userName, setUserName] = useState(profile?.full_name || '');
  const [customMessage, setCustomMessage] = useState('');

  const text = {
    en: {
      title: "WhatsApp Inquiry",
      description: "Send us a message on WhatsApp for quick assistance",
      inquiryType: "Inquiry Type",
      yourName: "Your Name",
      additionalMessage: "Additional Message (Optional)",
      messagePlaceholder: "Any specific questions or details...",
      sendMessage: "Send via WhatsApp",
      quickInquiry: "Quick Inquiry",
      types: {
        'general': 'General Inquiry',
        'wna-investment': 'WNA Investment',
        'wni-investment': 'WNI Investment',
        'property': 'Property Inquiry',
        'legal': 'Legal Consultation',
        'visa': 'Visa Information',
        'family-benefits': 'Family Benefits',
        'citizenship': 'Citizenship & Residency',
        'taxation': 'Taxation'
      }
    },
    id: {
      title: "Pertanyaan WhatsApp",
      description: "Kirim pesan ke WhatsApp kami untuk bantuan cepat",
      inquiryType: "Jenis Pertanyaan",
      yourName: "Nama Anda",
      additionalMessage: "Pesan Tambahan (Opsional)",
      messagePlaceholder: "Pertanyaan atau detail spesifik...",
      sendMessage: "Kirim via WhatsApp",
      quickInquiry: "Pertanyaan Cepat",
      types: {
        'general': 'Pertanyaan Umum',
        'wna-investment': 'Investasi WNA',
        'wni-investment': 'Investasi WNI',
        'property': 'Pertanyaan Properti',
        'legal': 'Konsultasi Hukum',
        'visa': 'Informasi Visa',
        'family-benefits': 'Manfaat Keluarga',
        'citizenship': 'Kewarganegaraan & Residensi',
        'taxation': 'Perpajakan'
      }
    }
  };

  const t = text[language] || text.en;

  const handleSendMessage = () => {
    openWhatsAppChat({
      type: inquiryType,
      propertyTitle,
      propertyId,
      userName: userName || undefined,
      language,
      customMessage: customMessage || undefined
    });
    setIsOpen(false);
    setCustomMessage('');
  };

  const handleQuickSend = () => {
    openWhatsAppChat({
      type: defaultType,
      propertyTitle,
      propertyId,
      userName: profile?.full_name || undefined,
      language
    });
  };

  // Floating button variant
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 ${className}`}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                {t.title}
              </DialogTitle>
              <DialogDescription>{t.description}</DialogDescription>
            </DialogHeader>
            <InquiryForm
              inquiryType={inquiryType}
              setInquiryType={setInquiryType}
              userName={userName}
              setUserName={setUserName}
              customMessage={customMessage}
              setCustomMessage={setCustomMessage}
              onSubmit={handleSendMessage}
              t={t}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Compact button variant (icon only)
  if (variant === 'compact') {
    return (
      <Button
        onClick={handleQuickSend}
        size="sm"
        className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    );
  }

  // Inline variant (simple button)
  if (variant === 'inline' || !showForm) {
    return (
      <Button
        onClick={handleQuickSend}
        className={`bg-green-500 hover:bg-green-600 text-white gap-2 ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{t.quickInquiry}</span>
      </Button>
    );
  }

  // Default variant with dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`bg-green-500 hover:bg-green-600 text-white gap-2 ${className}`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{t.quickInquiry}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <InquiryForm
          inquiryType={inquiryType}
          setInquiryType={setInquiryType}
          userName={userName}
          setUserName={setUserName}
          customMessage={customMessage}
          setCustomMessage={setCustomMessage}
          onSubmit={handleSendMessage}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
};

// Separated form component for reusability
interface InquiryFormProps {
  inquiryType: InquiryType;
  setInquiryType: (type: InquiryType) => void;
  userName: string;
  setUserName: (name: string) => void;
  customMessage: string;
  setCustomMessage: (msg: string) => void;
  onSubmit: () => void;
  t: any;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  inquiryType,
  setInquiryType,
  userName,
  setUserName,
  customMessage,
  setCustomMessage,
  onSubmit,
  t
}) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="inquiry-type" className="text-sm font-medium">
          {t.inquiryType}
        </Label>
        <Select value={inquiryType} onValueChange={(v) => setInquiryType(v as InquiryType)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(t.types).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-name" className="text-sm font-medium flex items-center gap-2">
          <User className="h-3.5 w-3.5" />
          {t.yourName}
        </Label>
        <Input
          id="user-name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="John Doe"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-message" className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" />
          {t.additionalMessage}
        </Label>
        <Textarea
          id="custom-message"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder={t.messagePlaceholder}
          rows={3}
          className="w-full resize-none"
        />
      </div>

      <Button
        onClick={onSubmit}
        className="w-full bg-green-500 hover:bg-green-600 text-white gap-2"
      >
        <Send className="h-4 w-4" />
        {t.sendMessage}
      </Button>
    </div>
  );
};

export default WhatsAppInquiryButton;

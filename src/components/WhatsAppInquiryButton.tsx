import React, { useState, useEffect, useMemo } from 'react';
import { MessageCircle, Send, User, FileText, MapPin, DollarSign, Calendar, Check, Mail, Phone, AlertCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { validatePhoneNumber, validateEmail, validateName, PhoneValidationResult } from '@/utils/phoneValidation';

interface WhatsAppInquiryButtonProps {
  defaultType?: InquiryType;
  propertyTitle?: string;
  propertyId?: string;
  propertyLocation?: string;
  propertyPrice?: string;
  variant?: 'default' | 'floating' | 'inline' | 'compact';
  className?: string;
  showForm?: boolean;
}

const WhatsAppInquiryButton: React.FC<WhatsAppInquiryButtonProps> = ({
  defaultType = 'general',
  propertyTitle,
  propertyId,
  propertyLocation,
  propertyPrice,
  variant = 'default',
  className = '',
  showForm = true
}) => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryType | 'other'>(defaultType);
  const [customInquiryType, setCustomInquiryType] = useState('');
  
  // User info - auto-pickup from profile if logged in
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  
  // Inquiry preferences
  const [preferredArea, setPreferredArea] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [customTimeline, setCustomTimeline] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Auto-fill user data when profile loads or modal opens
  useEffect(() => {
    if (profile) {
      setUserName(profile.full_name || '');
      setUserEmail(profile.email || user?.email || '');
      setUserPhone(profile.phone || '');
    } else if (user) {
      setUserEmail(user.email || '');
    }
  }, [profile, user, isOpen]);

  const text = {
    en: {
      title: "WhatsApp Inquiry",
      description: "Send us a smart inquiry - we'll respond quickly!",
      loggedInBadge: "Auto-filled from your profile",
      guestBadge: "Quick inquiry - no login required",
      inquiryType: "What do you need help with?",
      yourName: "Your Name",
      yourEmail: "Email (Optional)",
      yourPhone: "Phone/WhatsApp Number",
      preferredArea: "Preferred Area/Location",
      areaPlaceholder: "e.g., Bali, Jakarta, Bandung",
      budgetRange: "Budget Range",
      timeline: "When do you plan to invest?",
      additionalMessage: "Additional Details",
      messagePlaceholder: "Any specific requirements or questions...",
      sendMessage: "Send via WhatsApp",
      quickInquiry: "WhatsApp Inquiry",
      types: {
        'general': '💬 General Inquiry',
        'wna-investment': '🌍 WNA Investment',
        'wni-investment': '🇮🇩 WNI Investment',
        'property': '🏠 Property Inquiry',
        'legal': '⚖️ Legal Consultation',
        'visa': '🛂 Visa Information',
        'family-benefits': '👨‍👩‍👧‍👦 Family Benefits',
        'citizenship': '🇮🇩 Citizenship & Residency',
        'taxation': '💰 Taxation',
        'other': '✏️ Other (Specify)'
      },
      budgetOptions: {
        'under-1b': 'Under IDR 1 Billion',
        '1b-3b': 'IDR 1-3 Billion',
        '3b-5b': 'IDR 3-5 Billion',
        '5b-10b': 'IDR 5-10 Billion',
        'above-10b': 'Above IDR 10 Billion',
        'flexible': 'Flexible / Discuss',
        'other': '✏️ Other (Specify)'
      },
      timelineOptions: {
        'immediate': 'Immediately (1-3 months)',
        'soon': 'Soon (3-6 months)',
        'planning': 'Planning (6-12 months)',
        'exploring': 'Just Exploring',
        'flexible': 'Flexible Timeline',
        'other': '✏️ Other (Specify)'
      },
      otherPlaceholder: 'Please specify...'
    },
    id: {
      title: "Pertanyaan WhatsApp",
      description: "Kirim pertanyaan cerdas - kami akan merespons cepat!",
      loggedInBadge: "Terisi otomatis dari profil Anda",
      guestBadge: "Pertanyaan cepat - tidak perlu login",
      inquiryType: "Apa yang Anda butuhkan?",
      yourName: "Nama Anda",
      yourEmail: "Email (Opsional)",
      yourPhone: "Nomor Telepon/WhatsApp",
      preferredArea: "Area/Lokasi Pilihan",
      areaPlaceholder: "contoh: Bali, Jakarta, Bandung",
      budgetRange: "Kisaran Anggaran",
      timeline: "Kapan rencana investasi?",
      additionalMessage: "Detail Tambahan",
      messagePlaceholder: "Persyaratan atau pertanyaan spesifik...",
      sendMessage: "Kirim via WhatsApp",
      quickInquiry: "Pertanyaan WhatsApp",
      types: {
        'general': '💬 Pertanyaan Umum',
        'wna-investment': '🌍 Investasi WNA',
        'wni-investment': '🇮🇩 Investasi WNI',
        'property': '🏠 Pertanyaan Properti',
        'legal': '⚖️ Konsultasi Hukum',
        'visa': '🛂 Informasi Visa',
        'family-benefits': '👨‍👩‍👧‍👦 Manfaat Keluarga',
        'citizenship': '🇮🇩 Kewarganegaraan',
        'taxation': '💰 Perpajakan',
        'other': '✏️ Lainnya (Sebutkan)'
      },
      budgetOptions: {
        'under-1b': 'Di bawah IDR 1 Miliar',
        '1b-3b': 'IDR 1-3 Miliar',
        '3b-5b': 'IDR 3-5 Miliar',
        '5b-10b': 'IDR 5-10 Miliar',
        'above-10b': 'Di atas IDR 10 Miliar',
        'flexible': 'Fleksibel / Diskusi',
        'other': '✏️ Lainnya (Sebutkan)'
      },
      timelineOptions: {
        'immediate': 'Segera (1-3 bulan)',
        'soon': 'Segera (3-6 bulan)',
        'planning': 'Perencanaan (6-12 bulan)',
        'exploring': 'Hanya Menjelajahi',
        'flexible': 'Timeline Fleksibel',
        'other': '✏️ Lainnya (Sebutkan)'
      },
      otherPlaceholder: 'Silakan sebutkan...'
    }
  };

  const t = text[language] || text.en;

  const generateSmartMessage = (): string => {
    const lang = language;
    const isLoggedIn = !!user;
    const inquiryLabel = inquiryType === 'other' 
      ? `✏️ ${customInquiryType || (lang === 'en' ? 'Custom Inquiry' : 'Pertanyaan Khusus')}`
      : (t.types[inquiryType] || t.types.general);
    
    let message = lang === 'en' 
      ? `Hello ASTRA Villa! 👋\n\n`
      : `Halo ASTRA Villa! 👋\n\n`;

    // Header with inquiry type
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📋 *${inquiryLabel}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // User Info Section
    message += lang === 'en' ? `👤 *CONTACT INFO*\n` : `👤 *INFO KONTAK*\n`;
    if (userName) message += `• Name: ${userName}\n`;
    if (userEmail) message += `• Email: ${userEmail}\n`;
    if (userPhone) message += `• Phone: ${userPhone}\n`;
    if (isLoggedIn) {
      message += lang === 'en' ? `• Status: ✅ Registered User\n` : `• Status: ✅ Pengguna Terdaftar\n`;
    }
    message += `\n`;

    // Property Info (if provided)
    if (propertyTitle || propertyId || propertyLocation || propertyPrice) {
      message += lang === 'en' ? `🏠 *PROPERTY INTEREST*\n` : `🏠 *PROPERTI DIMINATI*\n`;
      if (propertyTitle) message += `• Property: ${propertyTitle}\n`;
      if (propertyId) message += `• ID: ${propertyId}\n`;
      if (propertyLocation) message += `• Location: ${propertyLocation}\n`;
      if (propertyPrice) message += `• Price: ${propertyPrice}\n`;
      message += `\n`;
    }

    // Investment Preferences
    if (preferredArea || budgetRange || timeline) {
      message += lang === 'en' ? `📊 *INVESTMENT PREFERENCES*\n` : `📊 *PREFERENSI INVESTASI*\n`;
      if (preferredArea) {
        message += lang === 'en' ? `• Preferred Area: ${preferredArea}\n` : `• Area Pilihan: ${preferredArea}\n`;
      }
      if (budgetRange) {
        const budgetLabel = budgetRange === 'other' 
          ? customBudget || (lang === 'en' ? 'Custom Budget' : 'Anggaran Khusus')
          : (t.budgetOptions[budgetRange as keyof typeof t.budgetOptions] || budgetRange);
        message += lang === 'en' ? `• Budget: ${budgetLabel}\n` : `• Anggaran: ${budgetLabel}\n`;
      }
      if (timeline) {
        const timelineLabel = timeline === 'other'
          ? customTimeline || (lang === 'en' ? 'Custom Timeline' : 'Timeline Khusus')
          : (t.timelineOptions[timeline as keyof typeof t.timelineOptions] || timeline);
        message += lang === 'en' ? `• Timeline: ${timelineLabel}\n` : `• Timeline: ${timelineLabel}\n`;
      }
      message += `\n`;
    }

    // Custom Message
    if (customMessage) {
      message += lang === 'en' ? `📝 *ADDITIONAL DETAILS*\n` : `📝 *DETAIL TAMBAHAN*\n`;
      message += `${customMessage}\n\n`;
    }

    // Footer
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += lang === 'en' 
      ? `📱 Sent via ASTRA Villa App\n⏰ ${new Date().toLocaleString('en-ID')}`
      : `📱 Dikirim via Aplikasi ASTRA Villa\n⏰ ${new Date().toLocaleString('id-ID')}`;

    return message;
  };

  const handleSendMessage = () => {
    const message = generateSmartMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/6285716008080?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
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

  // Floating button variant - positioned on left side
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-24 left-4 z-40 md:bottom-24 md:left-6 ${className}`}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 group border-2 border-white/30"
            >
              <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                {t.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                {t.description}
                <Badge variant={user ? "default" : "secondary"} className="text-[10px]">
                  {user ? t.loggedInBadge : t.guestBadge}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <SmartInquiryForm
              inquiryType={inquiryType}
              setInquiryType={setInquiryType}
              customInquiryType={customInquiryType}
              setCustomInquiryType={setCustomInquiryType}
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              userPhone={userPhone}
              setUserPhone={setUserPhone}
              preferredArea={preferredArea}
              setPreferredArea={setPreferredArea}
              budgetRange={budgetRange}
              setBudgetRange={setBudgetRange}
              customBudget={customBudget}
              setCustomBudget={setCustomBudget}
              timeline={timeline}
              setTimeline={setTimeline}
              customTimeline={customTimeline}
              setCustomTimeline={setCustomTimeline}
              customMessage={customMessage}
              setCustomMessage={setCustomMessage}
              onSubmit={handleSendMessage}
              t={t}
              isLoggedIn={!!user}
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            {t.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            {t.description}
            <Badge variant={user ? "default" : "secondary"} className="text-[10px]">
              {user ? t.loggedInBadge : t.guestBadge}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        <SmartInquiryForm
          inquiryType={inquiryType}
          setInquiryType={setInquiryType}
          customInquiryType={customInquiryType}
          setCustomInquiryType={setCustomInquiryType}
          userName={userName}
          setUserName={setUserName}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          userPhone={userPhone}
          setUserPhone={setUserPhone}
          preferredArea={preferredArea}
          setPreferredArea={setPreferredArea}
          budgetRange={budgetRange}
          setBudgetRange={setBudgetRange}
          customBudget={customBudget}
          setCustomBudget={setCustomBudget}
          timeline={timeline}
          setTimeline={setTimeline}
          customTimeline={customTimeline}
          setCustomTimeline={setCustomTimeline}
          customMessage={customMessage}
          setCustomMessage={setCustomMessage}
          onSubmit={handleSendMessage}
          t={t}
          isLoggedIn={!!user}
        />
      </DialogContent>
    </Dialog>
  );
};

// Smart Inquiry Form Component
interface SmartInquiryFormProps {
  inquiryType: InquiryType | 'other';
  setInquiryType: (type: InquiryType | 'other') => void;
  customInquiryType: string;
  setCustomInquiryType: (type: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  preferredArea: string;
  setPreferredArea: (area: string) => void;
  budgetRange: string;
  setBudgetRange: (budget: string) => void;
  customBudget: string;
  setCustomBudget: (budget: string) => void;
  timeline: string;
  setTimeline: (timeline: string) => void;
  customTimeline: string;
  setCustomTimeline: (timeline: string) => void;
  customMessage: string;
  setCustomMessage: (msg: string) => void;
  onSubmit: () => void;
  t: any;
  isLoggedIn: boolean;
}

const SmartInquiryForm: React.FC<SmartInquiryFormProps> = ({
  inquiryType,
  setInquiryType,
  customInquiryType,
  setCustomInquiryType,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  userPhone,
  setUserPhone,
  preferredArea,
  setPreferredArea,
  budgetRange,
  setBudgetRange,
  customBudget,
  setCustomBudget,
  timeline,
  setTimeline,
  customTimeline,
  setCustomTimeline,
  customMessage,
  setCustomMessage,
  onSubmit,
  t,
  isLoggedIn
}) => {
  return (
    <div className="space-y-3 pt-2">
      {/* Inquiry Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t.inquiryType}</Label>
        <Select value={inquiryType} onValueChange={(v) => setInquiryType(v as InquiryType | 'other')}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(t.types).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-sm">
                {label as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {inquiryType === 'other' && (
          <Input
            value={customInquiryType}
            onChange={(e) => setCustomInquiryType(e.target.value)}
            placeholder={t.otherPlaceholder}
            className="h-9 text-sm mt-2"
          />
        )}
      </div>

      {/* Contact Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <User className="h-3 w-3" />
            {t.yourName} *
            {validateName(userName) && (
              <Check className="h-3.5 w-3.5 text-green-500" />
            )}
          </Label>
          <div className="relative">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="John Doe"
              className={`h-9 text-sm pr-8 ${validateName(userName) ? 'border-green-500 focus:border-green-500' : ''}`}
              disabled={isLoggedIn && !!userName}
            />
            {validateName(userName) && (
              <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            {t.yourPhone} *
          </Label>
          <PhoneInputWithValidation
            value={userPhone}
            onChange={setUserPhone}
            placeholder="+62 812-3456-7890"
            disabled={false}
          />
        </div>
      </div>

      {/* Email (optional) */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Mail className="h-3 w-3" />
          {t.yourEmail}
          {userEmail && validateEmail(userEmail) && (
            <Check className="h-3.5 w-3.5 text-green-500" />
          )}
        </Label>
        <div className="relative">
          <Input
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="email@example.com"
            className={`h-9 text-sm pr-8 ${userEmail && validateEmail(userEmail) ? 'border-green-500 focus:border-green-500' : userEmail && !validateEmail(userEmail) ? 'border-destructive' : ''}`}
            disabled={isLoggedIn && !!userEmail}
          />
          {userEmail && (
            validateEmail(userEmail) ? (
              <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
            )
          )}
        </div>
        {userEmail && !validateEmail(userEmail) && (
          <p className="text-[10px] text-destructive">{t.invalidEmail || 'Invalid email format'}</p>
        )}
      </div>

      {/* Investment Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {t.preferredArea}
          </Label>
          <Input
            value={preferredArea}
            onChange={(e) => setPreferredArea(e.target.value)}
            placeholder={t.areaPlaceholder}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <DollarSign className="h-3 w-3" />
            {t.budgetRange}
          </Label>
          <Select value={budgetRange} onValueChange={setBudgetRange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(t.budgetOptions).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-sm">
                  {label as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {budgetRange === 'other' && (
            <Input
              value={customBudget}
              onChange={(e) => setCustomBudget(e.target.value)}
              placeholder={t.otherPlaceholder}
              className="h-9 text-sm mt-2"
            />
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {t.timeline}
        </Label>
        <Select value={timeline} onValueChange={setTimeline}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(t.timelineOptions).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-sm">
                {label as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {timeline === 'other' && (
          <Input
            value={customTimeline}
            onChange={(e) => setCustomTimeline(e.target.value)}
            placeholder={t.otherPlaceholder}
            className="h-9 text-sm mt-2"
          />
        )}
      </div>

      {/* Additional Message */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          {t.additionalMessage}
        </Label>
        <Textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder={t.messagePlaceholder}
          rows={2}
          className="text-sm resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={!validateName(userName) || !validatePhoneNumber(userPhone).isValid}
        className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 h-10"
      >
        <Send className="h-4 w-4" />
        {t.sendMessage}
      </Button>
    </div>
  );
};

// Phone Input with Validation Component
interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const PhoneInputWithValidation: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "+62 812-3456-7890",
  disabled = false
}) => {
  const validation = useMemo(() => validatePhoneNumber(value), [value]);
  
  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-9 text-sm pr-20 ${validation.isValid ? 'border-green-500 focus:border-green-500' : value.length > 3 ? 'border-destructive' : ''}`}
          disabled={disabled}
          type="tel"
        />
        {value && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {validation.isValid && validation.country && (
              <>
                <span className="text-sm">{validation.country.flag}</span>
                <Check className="h-4 w-4 text-green-500" />
              </>
            )}
            {!validation.isValid && value.length > 3 && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      {validation.isValid && validation.country && (
        <p className="text-[10px] text-green-600 flex items-center gap-1">
          <Check className="h-3 w-3" />
          {validation.country.flag} {validation.country.name} {validation.country.dialCode && `(${validation.country.dialCode})`}
        </p>
      )}
      {!validation.isValid && value.length > 5 && (
        <p className="text-[10px] text-destructive">Please enter a valid phone number</p>
      )}
    </div>
  );
};

export default WhatsAppInquiryButton;

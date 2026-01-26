import React, { useState, useEffect, useMemo } from 'react';
import { MessageCircle, Send, User, FileText, MapPin, DollarSign, Calendar, Check, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { useToast } from '@/hooks/use-toast';

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
      formProgress: "Form Progress",
      requiredFields: "Required",
      readyToSend: "Ready to send!",
      sending: "Opening WhatsApp...",
      invalidEmail: "Invalid email format",
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
      formProgress: "Progres Form",
      requiredFields: "Diperlukan",
      readyToSend: "Siap kirim!",
      sending: "Membuka WhatsApp...",
      invalidEmail: "Format email tidak valid",
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

  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = () => {
    // Validate required fields
    if (!validateName(userName)) {
      toast({
        title: language === 'en' ? "Name Required" : "Nama Diperlukan",
        description: language === 'en' ? "Please enter your name (minimum 2 characters)" : "Silakan masukkan nama Anda (minimal 2 karakter)",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePhoneNumber(userPhone).isValid) {
      toast({
        title: language === 'en' ? "Valid Phone Required" : "Nomor Telepon Valid Diperlukan",
        description: language === 'en' ? "Please enter a valid phone number with country code" : "Silakan masukkan nomor telepon yang valid dengan kode negara",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      const message = generateSmartMessage();
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/6285716008080?text=${encodedMessage}`;
      
      // Open WhatsApp
      const newWindow = window.open(whatsappUrl, '_blank');
      
      if (newWindow) {
        toast({
          title: language === 'en' ? "WhatsApp Opened!" : "WhatsApp Terbuka!",
          description: language === 'en' ? "Your inquiry has been prepared. Send it in WhatsApp!" : "Pertanyaan Anda telah disiapkan. Kirim di WhatsApp!",
        });
        setIsOpen(false);
      } else {
        toast({
          title: language === 'en' ? "Popup Blocked" : "Popup Diblokir",
          description: language === 'en' ? "Please allow popups to open WhatsApp" : "Izinkan popup untuk membuka WhatsApp",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: language === 'en' ? "Error" : "Kesalahan",
        description: language === 'en' ? "Failed to open WhatsApp. Please try again." : "Gagal membuka WhatsApp. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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
              isSending={isSending}
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
          isSending={isSending}
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
  isSending?: boolean;
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
  isLoggedIn,
  isSending = false
}) => {
  // Calculate form completion progress
  const isNameValid = validateName(userName);
  const isPhoneValid = validatePhoneNumber(userPhone).isValid;
  
  const requiredFields = [
    { name: t.yourName || 'Name', filled: isNameValid, required: true },
    { name: t.yourPhone || 'Phone', filled: isPhoneValid, required: true },
  ];
  
  const optionalFields = [
    { name: t.yourEmail || 'Email', filled: !!userEmail && validateEmail(userEmail) },
    { name: t.preferredArea || 'Area', filled: !!preferredArea },
    { name: t.budgetRange || 'Budget', filled: !!budgetRange },
    { name: t.timeline || 'Timeline', filled: !!timeline },
    { name: t.additionalMessage || 'Message', filled: !!customMessage },
  ];
  
  const requiredFilled = requiredFields.filter(f => f.filled).length;
  const optionalFilled = optionalFields.filter(f => f.filled).length;
  const totalRequired = requiredFields.length;
  const totalOptional = optionalFields.length;
  
  // Progress: required fields = 60%, optional fields = 40%
  const requiredProgress = (requiredFilled / totalRequired) * 60;
  const optionalProgress = (optionalFilled / totalOptional) * 40;
  const totalProgress = Math.round(requiredProgress + optionalProgress);
  
  const missingRequired = requiredFields.filter(f => !f.filled);
  const isFormValid = missingRequired.length === 0;

  return (
    <div className="space-y-2 pt-1">
      {/* Progress Bar - Slim */}
      <div className="space-y-1 p-2 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-muted-foreground font-medium">
            {t.formProgress || 'Form Progress'}
          </span>
          <span className={`font-bold ${totalProgress >= 60 ? 'text-green-600' : totalProgress >= 30 ? 'text-amber-600' : 'text-destructive'}`}>
            {totalProgress}%
          </span>
        </div>
        <Progress value={totalProgress} className="h-1.5" />
        
        {/* Status indicator - compact */}
        {!isFormValid ? (
          <div className="flex items-center gap-1 text-[8px] text-amber-600">
            <AlertCircle className="h-2.5 w-2.5 shrink-0" />
            <span>{t.requiredFields || 'Required'}: {missingRequired.map(f => f.name).join(', ')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[8px] text-green-600">
            <Check className="h-2.5 w-2.5 shrink-0" />
            <span>{t.readyToSend || 'Ready to send!'}</span>
          </div>
        )}
      </div>

      {/* Inquiry Type - Slim */}
      <div className="space-y-1">
        <Label className="text-[10px] font-medium text-muted-foreground">{t.inquiryType}</Label>
        <Select value={inquiryType} onValueChange={(v) => setInquiryType(v as InquiryType | 'other')}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(t.types).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs py-1.5">
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
            className="h-7 text-xs mt-1"
          />
        )}
      </div>

      {/* Contact Info Section - Slim 2-column grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Name */}
        <div className="space-y-0.5">
          <Label className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
            <User className="h-2.5 w-2.5" />
            {t.yourName} *
            {validateName(userName) && <Check className="h-2.5 w-2.5 text-green-500" />}
          </Label>
          <div className="relative">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="John Doe"
              className={`h-7 text-xs pr-6 ${validateName(userName) ? 'border-green-500/50' : ''}`}
              disabled={isLoggedIn && !!userName}
            />
            {validateName(userName) && (
              <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-green-500" />
            )}
          </div>
        </div>
        
        {/* Email */}
        <div className="space-y-0.5">
          <Label className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
            <Mail className="h-2.5 w-2.5" />
            {t.yourEmail}
            {userEmail && validateEmail(userEmail) && <Check className="h-2.5 w-2.5 text-green-500" />}
          </Label>
          <div className="relative">
            <Input
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="email@example.com"
              className={`h-7 text-xs pr-6 ${userEmail && validateEmail(userEmail) ? 'border-green-500/50' : userEmail && !validateEmail(userEmail) ? 'border-destructive/50' : ''}`}
              disabled={isLoggedIn && !!userEmail}
            />
            {userEmail && (
              validateEmail(userEmail) ? (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-green-500" />
              ) : (
                <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-destructive" />
              )
            )}
          </div>
        </div>
      </div>

      {/* Phone - Full width with country selector */}
      <div className="space-y-0.5">
        <Label className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
          <Phone className="h-2.5 w-2.5" />
          {t.yourPhone} *
        </Label>
        <PhoneInputWithValidation
          value={userPhone}
          onChange={setUserPhone}
          placeholder="812 3456 7890"
          disabled={false}
        />
      </div>

      {/* Investment Preferences - Slim 2-column */}
      <div className="grid grid-cols-2 gap-2">
        {/* Area */}
        <div className="space-y-0.5">
          <Label className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" />
            {t.preferredArea}
          </Label>
          <Input
            value={preferredArea}
            onChange={(e) => setPreferredArea(e.target.value)}
            placeholder={t.areaPlaceholder}
            className="h-7 text-xs"
          />
        </div>
        
        {/* Budget */}
        <div className="space-y-0.5">
          <Label className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-2.5 w-2.5" />
            {t.budgetRange}
          </Label>
          <Select value={budgetRange} onValueChange={setBudgetRange}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(t.budgetOptions).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs py-1">
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
              className="h-7 text-xs mt-1"
            />
          )}
        </div>
      </div>

      {/* Timeline - Slim */}
      <div className="space-y-0.5">
        <Label className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
          <Calendar className="h-2.5 w-2.5" />
          {t.timeline}
        </Label>
        <Select value={timeline} onValueChange={setTimeline}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(t.timelineOptions).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs py-1">
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
            className="h-7 text-xs mt-1"
          />
        )}
      </div>

      {/* Additional Message - Slim */}
      <div className="space-y-0.5">
        <Label className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
          <FileText className="h-2.5 w-2.5" />
          {t.additionalMessage}
        </Label>
        <Textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder={t.messagePlaceholder}
          rows={2}
          className="text-xs resize-none min-h-[48px]"
        />
      </div>

      {/* Submit Button - Compact */}
      <Button
        onClick={onSubmit}
        disabled={!validateName(userName) || !validatePhoneNumber(userPhone).isValid || isSending}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-muted text-white gap-1.5 h-8 text-xs font-semibold active:scale-[0.98] transition-transform"
      >
        {isSending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t.sending || 'Opening...'}
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            {t.sendMessage}
          </>
        )}
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
  placeholder = "812 3456 7890",
  disabled = false
}) => {
  const validation = useMemo(() => validatePhoneNumber(value), [value]);
  const [selectedCountry, setSelectedCountry] = useState<string>('ID');
  
  const countryList = [
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪', dialCode: '+971' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
    { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '+886' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '+852' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
    { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
    { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
    { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64' },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
    { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '+965' },
    { code: 'BN', name: 'Brunei', flag: '🇧🇳', dialCode: '+673' },
  ];
  
  const currentCountry = countryList.find(c => c.code === selectedCountry) || countryList[0];
  
  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    const country = countryList.find(c => c.code === code);
    if (country) {
      // Replace existing dial code or add new one
      const cleanValue = value.replace(/^\+\d+\s*/, '');
      onChange(`${country.dialCode} ${cleanValue}`);
    }
  };
  
  return (
    <div className="space-y-1">
      {/* Country Selector + Phone Input - compact inline row */}
      <div className="flex items-center gap-1.5">
        <Select value={selectedCountry} onValueChange={handleCountrySelect}>
          <SelectTrigger className="w-[90px] h-7 px-1.5 text-xs shrink-0">
            <SelectValue>
              <span className="flex items-center gap-1">
                <span className="text-sm">{currentCountry.flag}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{currentCountry.dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[240px]">
            {countryList.map((country) => (
              <SelectItem key={country.code} value={country.code} className="text-xs py-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">{country.flag}</span>
                  <span className="font-medium truncate max-w-[100px]">{country.name}</span>
                  <span className="text-muted-foreground text-[10px] font-mono">{country.dialCode}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Phone Input */}
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`h-7 text-xs pr-7 ${validation.isValid ? 'border-green-500/50' : value.length > 3 ? 'border-destructive/50' : ''}`}
            disabled={disabled}
            type="tel"
          />
          {value && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              {validation.isValid ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : value.length > 3 ? (
                <AlertCircle className="h-3 w-3 text-destructive" />
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      {/* Validation feedback - compact */}
      {validation.isValid && validation.country ? (
        <div className="flex items-center gap-1 text-[8px] text-green-600">
          <Check className="h-2.5 w-2.5 shrink-0" />
          <span>{validation.country.flag} {validation.country.name} ({validation.country.dialCode})</span>
        </div>
      ) : value.length > 5 && !validation.isValid ? (
        <p className="text-[8px] text-destructive flex items-center gap-1">
          <AlertCircle className="h-2.5 w-2.5" />
          Invalid format
        </p>
      ) : null}
    </div>
  );
};

export default WhatsAppInquiryButton;

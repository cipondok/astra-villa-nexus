import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Send, 
  Save,
  Settings2,
  Palette,
  FileText,
  Clock,
  Image,
  Link,
  Users,
  Bell,
  Calendar,
  Sparkles,
  TestTube,
  Upload,
  RefreshCw,
  Eye,
  Globe,
  UserCheck,
  UserX,
  Megaphone,
  Gift
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface EmailSettings {
  // SMTP/Resend Config
  provider: 'resend' | 'smtp';
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  isEnabled: boolean;
  // SMTP specific
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: 'none' | 'tls' | 'ssl';
  // Site Config
  siteUrl: string;
  verificationBaseUrl: string;
  passwordResetUrl: string;
  loginUrl: string;
  unsubscribeUrl: string;
}

interface EmailBranding {
  companyName: string;
  companyLogoUrl: string;
  companyWebsite: string;
  companyAddress: string;
  companyPhone: string;
  supportEmail: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialLinkedin: string;
  footerText: string;
  copyrightText: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  headerText: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  showSocialLinks: boolean;
  showUnsubscribe: boolean;
  isActive: boolean;
  category: 'auth' | 'notification' | 'marketing' | 'reminder';
}

interface EmailSchedule {
  id: string;
  name: string;
  templateId: string;
  targetAudience: 'new_users' | 'inactive_users' | 'all_users' | 'verified_users' | 'unverified_users';
  triggerType: 'immediate' | 'scheduled' | 'event_based';
  triggerEvent?: string;
  scheduleDay?: number;
  scheduleTime?: string;
  inactiveDays?: number;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
}

const defaultSettings: EmailSettings = {
  provider: 'resend',
  fromEmail: 'noreply@astravilla.com',
  fromName: 'ASTRA Villa',
  replyToEmail: 'support@astravilla.com',
  isEnabled: true,
  smtpHost: '',
  smtpPort: '587',
  smtpUsername: '',
  smtpPassword: '',
  smtpEncryption: 'tls',
  siteUrl: 'https://astravilla.com',
  verificationBaseUrl: 'https://astravilla.com/verify',
  passwordResetUrl: 'https://astravilla.com/reset-password',
  loginUrl: 'https://astravilla.com/auth',
  unsubscribeUrl: 'https://astravilla.com/unsubscribe'
};

const defaultBranding: EmailBranding = {
  companyName: 'ASTRA Villa',
  companyLogoUrl: '',
  companyWebsite: 'https://astravilla.com',
  companyAddress: 'Jakarta, Indonesia',
  companyPhone: '+62 857 1600 8080',
  supportEmail: 'support@astravilla.com',
  primaryColor: '#B8860B',
  secondaryColor: '#0066FF',
  accentColor: '#D4AF37',
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  socialLinkedin: '',
  footerText: 'Thank you for choosing ASTRA Villa - Your trusted partner in luxury real estate.',
  copyrightText: '© 2024 ASTRA Villa. All rights reserved.'
};

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'email_verification',
    name: 'Email Verification',
    subject: 'Verify your email - {{company_name}}',
    preheader: 'Complete your registration by verifying your email address',
    headerText: 'Verify Your Email Address',
    body: 'Hello {{user_name}},\n\nThank you for registering with {{company_name}}. Please verify your email address by clicking the button below.\n\nThis verification link will expire in 24 hours.',
    buttonText: 'Verify Email',
    buttonUrl: '{{verification_url}}',
    showSocialLinks: true,
    showUnsubscribe: false,
    isActive: true,
    category: 'auth'
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset your password - {{company_name}}',
    preheader: 'You requested a password reset',
    headerText: 'Reset Your Password',
    body: 'Hello {{user_name}},\n\nWe received a request to reset your password. Click the button below to create a new password.\n\nIf you didn\'t request this, please ignore this email.',
    buttonText: 'Reset Password',
    buttonUrl: '{{reset_url}}',
    showSocialLinks: false,
    showUnsubscribe: false,
    isActive: true,
    category: 'auth'
  },
  {
    id: 'welcome_new_user',
    name: 'Welcome New User',
    subject: 'Welcome to {{company_name}}! 🏠',
    preheader: 'Your journey to luxury living starts here',
    headerText: 'Welcome to ASTRA Villa!',
    body: 'Hello {{user_name}},\n\nWelcome to {{company_name}}! We\'re thrilled to have you join our community of discerning property enthusiasts.\n\n🏠 Browse exclusive properties\n💰 Get personalized recommendations\n🌟 Access premium features\n\nStart exploring our curated collection of luxury properties today.',
    buttonText: 'Explore Properties',
    buttonUrl: '{{site_url}}/properties',
    showSocialLinks: true,
    showUnsubscribe: true,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    subject: 'Booking Confirmed – {{property_title}}',
    preheader: 'Your viewing has been scheduled',
    headerText: 'Booking Confirmed ✅',
    body: 'Dear {{user_name}},\n\nYour booking request for {{property_title}} has been submitted successfully.\n\n📅 Date: {{booking_date}}\n🕐 Time: {{booking_time}}\n📍 Address: {{property_address}}\n\nOur team will confirm your appointment shortly. Please keep this email for your records.',
    buttonText: 'View My Bookings',
    buttonUrl: '{{site_url}}/profile?tab=bookings',
    showSocialLinks: true,
    showUnsubscribe: false,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'booking_cancelled',
    name: 'Booking Cancellation',
    subject: 'Booking Cancelled – {{property_title}}',
    preheader: 'Your booking has been cancelled',
    headerText: 'Booking Cancelled',
    body: 'Dear {{user_name}},\n\nYour booking for {{property_title}} on {{booking_date}} has been cancelled.\n\n📝 Reason: {{cancellation_reason}}\n\nIf you have questions, please contact our support team.',
    buttonText: 'Browse Properties',
    buttonUrl: '{{site_url}}/properties',
    showSocialLinks: true,
    showUnsubscribe: false,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'foreign_investment_inquiry',
    name: 'Foreign Investment Inquiry',
    subject: 'Foreign Investment Inquiry Received',
    preheader: 'We received your property investment inquiry',
    headerText: 'Investment Inquiry Received 🌏',
    body: 'Dear {{user_name}},\n\nThank you for your interest in investing in Indonesian real estate through ASTRA Villa.\n\n🏠 Property: {{property_title}}\n💰 Investment Type: {{investment_type}}\n🌏 Country: {{investor_country}}\n\nOur foreign investment specialists will contact you within 1-2 business days to discuss the opportunities and legal framework.',
    buttonText: 'View Investment Guide',
    buttonUrl: '{{site_url}}/foreign-investment',
    showSocialLinks: true,
    showUnsubscribe: true,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'new_review',
    name: 'New Review Notification',
    subject: 'New Review on {{property_title}}',
    preheader: '{{reviewer_name}} left a {{rating}}-star review',
    headerText: 'New Review Received ⭐',
    body: 'Dear {{owner_name}},\n\n{{reviewer_name}} has left a {{rating}}-star review on your property {{property_title}}.\n\n💬 "{{review_text}}"\n\nLog in to respond to this review.',
    buttonText: 'View Review',
    buttonUrl: '{{site_url}}/dashboard',
    showSocialLinks: false,
    showUnsubscribe: false,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'verification_approved',
    name: 'Verification Approved',
    subject: 'Verification Approved – {{verification_type}}',
    preheader: 'Your account has been verified',
    headerText: 'Verification Approved ✅',
    body: 'Dear {{user_name}},\n\nCongratulations! Your {{verification_type}} verification has been approved.\n\nYou now have full access to all verified member features on ASTRA Villa.',
    buttonText: 'Explore Benefits',
    buttonUrl: '{{site_url}}/dashboard',
    showSocialLinks: true,
    showUnsubscribe: false,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'vip_upgrade',
    name: 'VIP Upgrade Confirmation',
    subject: 'Welcome to {{membership_level}} – ASTRA Villa',
    preheader: 'Your VIP membership is now active',
    headerText: '🌟 VIP Membership Activated',
    body: 'Dear {{user_name}},\n\nWelcome to {{membership_level}}! Your exclusive membership is now active.\n\n{{benefits_list}}\n\nThank you for choosing the premium ASTRA Villa experience.',
    buttonText: 'Access VIP Portal',
    buttonUrl: '{{site_url}}/dashboard/vip',
    showSocialLinks: true,
    showUnsubscribe: false,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'admin_new_property',
    name: '[Admin] New Property Listing',
    subject: '[Admin] New Property Listing: {{property_title}}',
    preheader: 'A new property requires review',
    headerText: 'New Property Listing 🏠',
    body: 'A new property has been submitted for review.\n\n📌 Title: {{property_title}}\n👤 Owner: {{owner_name}}\n📍 Location: {{property_location}}\n📅 Submitted: {{submission_date}}\n\nPlease review and approve or reject this listing.',
    buttonText: 'Review Listing',
    buttonUrl: '{{site_url}}/admin/properties',
    showSocialLinks: false,
    showUnsubscribe: false,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'admin_review_notification',
    name: '[Admin] Review Moderation',
    subject: '[Admin] New Review Requires Moderation',
    preheader: 'A review is pending moderation',
    headerText: 'Review Pending Moderation',
    body: 'A new review has been submitted and requires moderation.\n\n📌 Property: {{property_title}}\n👤 Reviewer: {{reviewer_name}}\n⭐ Rating: {{rating}}\n💬 Review: {{review_text}}\n\nPlease review and approve or reject.',
    buttonText: 'Moderate Review',
    buttonUrl: '{{site_url}}/admin/reviews',
    showSocialLinks: false,
    showUnsubscribe: false,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'inactive_reminder',
    name: 'Inactive User Reminder',
    subject: 'We miss you! {{user_name}} 💫',
    preheader: 'New properties are waiting for you',
    headerText: 'We Miss You!',
    body: 'Hello {{user_name}},\n\nIt\'s been a while since your last visit to {{company_name}}. We\'ve added exciting new properties that match your preferences!\n\n{{new_properties_count}} new listings since your last visit\n\nDon\'t miss out on your dream property.',
    buttonText: 'See What\'s New',
    buttonUrl: '{{site_url}}/properties?sort=newest',
    showSocialLinks: true,
    showUnsubscribe: true,
    isActive: true,
    category: 'reminder'
  },
  {
    id: 'otp_code',
    name: 'OTP Verification Code',
    subject: 'Your verification code: {{otp_code}}',
    preheader: 'Use this code to verify your identity',
    headerText: 'Verification Code',
    body: 'Hello {{user_name}},\n\nYour verification code is:\n\n{{otp_code}}\n\nThis code will expire in {{otp_expiry}} minutes. Do not share this code with anyone.',
    buttonText: '',
    buttonUrl: '',
    showSocialLinks: false,
    showUnsubscribe: false,
    isActive: true,
    category: 'auth'
  },
  {
    id: 'update_notice',
    name: 'Platform Update Notice',
    subject: 'What\'s New at {{company_name}} ✨',
    preheader: 'New features and improvements',
    headerText: 'Platform Updates',
    body: 'Hello {{user_name}},\n\n{{update_message}}\n\nWe\'re constantly improving to serve you better.',
    buttonText: 'Learn More',
    buttonUrl: '{{site_url}}/updates',
    showSocialLinks: true,
    showUnsubscribe: true,
    isActive: true,
    category: 'notification'
  },
  {
    id: 'promotional',
    name: 'Promotional Email',
    subject: '{{promo_title}} - {{company_name}}',
    preheader: '{{promo_preheader}}',
    headerText: '{{promo_header}}',
    body: '{{promo_body}}',
    buttonText: '{{promo_button_text}}',
    buttonUrl: '{{promo_button_url}}',
    showSocialLinks: true,
    showUnsubscribe: true,
    isActive: false,
    category: 'marketing'
  }
];

const defaultSchedules: EmailSchedule[] = [
  {
    id: 'welcome_immediate',
    name: 'Welcome Email (Immediate)',
    templateId: 'welcome_new_user',
    targetAudience: 'new_users',
    triggerType: 'event_based',
    triggerEvent: 'user_registered',
    isActive: true
  },
  {
    id: 'inactive_7_days',
    name: '7 Day Inactive Reminder',
    templateId: 'inactive_reminder',
    targetAudience: 'inactive_users',
    triggerType: 'scheduled',
    inactiveDays: 7,
    scheduleTime: '10:00',
    isActive: true
  },
  {
    id: 'inactive_30_days',
    name: '30 Day Inactive Reminder',
    templateId: 'inactive_reminder',
    targetAudience: 'inactive_users',
    triggerType: 'scheduled',
    inactiveDays: 30,
    scheduleTime: '10:00',
    isActive: true
  },
  {
    id: 'verification_reminder',
    name: 'Verification Reminder',
    templateId: 'email_verification',
    targetAudience: 'unverified_users',
    triggerType: 'scheduled',
    inactiveDays: 3,
    scheduleTime: '09:00',
    isActive: true
  }
];

const EmailManagementSettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('email_verification');
  
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [branding, setBranding] = useState<EmailBranding>(defaultBranding);
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [schedules, setSchedules] = useState<EmailSchedule[]>(defaultSchedules);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      // Load email config
      const { data: configData } = await supabase
        .from('system_settings')
        .select('key, value')
        .eq('category', 'email')
        .in('key', ['config', 'branding', 'templates', 'schedules']);

      if (configData) {
        configData.forEach((item) => {
          if (item.key === 'config' && item.value) {
            setSettings({ ...defaultSettings, ...(item.value as Partial<EmailSettings>) });
          }
          if (item.key === 'branding' && item.value) {
            setBranding({ ...defaultBranding, ...(item.value as Partial<EmailBranding>) });
          }
          if (item.key === 'templates' && item.value && Array.isArray(item.value)) {
            setTemplates(item.value as unknown as EmailTemplate[]);
          }
          if (item.key === 'schedules' && item.value && Array.isArray(item.value)) {
            setSchedules(item.value as unknown as EmailSchedule[]);
          }
        });
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          category: 'email',
          key,
          value,
          description: `Email ${key} configuration`,
          is_public: false
        }, { onConflict: 'key' });

      if (error) throw error;
      toast({ title: "Saved", description: `Email ${key} updated successfully` });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailConnection = async () => {
    setIsTesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          template: 'welcome_new_user',
          variables: {
            user_name: user.user_metadata?.full_name || 'User',
            site_url: settings.siteUrl
          }
        }
      });

      if (error) throw error;
      setIsConnected(true);
      toast({ title: "Test Successful", description: `Test email sent to ${user.email}` });
    } catch (error: any) {
      console.error('Test failed:', error);
      toast({ title: "Test Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `email-logo_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('system-assets')
        .upload(`branding/${fileName}`, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('system-assets')
        .getPublicUrl(`branding/${fileName}`);

      setBranding({ ...branding, companyLogoUrl: publicUrl });
      toast({ title: "Logo Uploaded", description: "Email logo updated successfully" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload Failed", description: "Failed to upload logo", variant: "destructive" });
    }
  };

  const updateTemplate = (templateId: string, updates: Partial<EmailTemplate>) => {
    setTemplates(templates.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    ));
  };

  const updateSchedule = (scheduleId: string, updates: Partial<EmailSchedule>) => {
    setSchedules(schedules.map(s => 
      s.id === scheduleId ? { ...s, ...updates } : s
    ));
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        <span className="text-xs text-muted-foreground">Loading email settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Email Management System
          </h2>
          <p className="text-[10px] text-muted-foreground">
            Configure SMTP, branding, templates, and automated email schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"} className="text-[9px] px-1.5 py-0">
            {isConnected ? (
              <><CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Connected</>
            ) : (
              <><AlertCircle className="h-2.5 w-2.5 mr-0.5" /> Not Tested</>
            )}
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={testEmailConnection}
            disabled={isTesting}
            className="h-7 text-xs px-3"
          >
            <TestTube className="h-3 w-3 mr-1" />
            {isTesting ? 'Testing...' : 'Test Email'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-8">
          <TabsTrigger value="config" className="text-[10px] h-7 gap-1">
            <Settings2 className="h-3 w-3" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-[10px] h-7 gap-1">
            <Palette className="h-3 w-3" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-[10px] h-7 gap-1">
            <FileText className="h-3 w-3" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="schedules" className="text-[10px] h-7 gap-1">
            <Clock className="h-3 w-3" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-[10px] h-7 gap-1">
            <Eye className="h-3 w-3" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-3 mt-3">
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Email Provider Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Enable Email System</Label>
                    <p className="text-[8px] text-muted-foreground">Turn on/off all email sending</p>
                  </div>
                  <Switch
                    checked={settings.isEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, isEnabled: checked })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Provider</Label>
                  <Select 
                    value={settings.provider} 
                    onValueChange={(v: 'resend' | 'smtp') => setSettings({ ...settings, provider: v })}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend (Recommended)</SelectItem>
                      <SelectItem value="smtp">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">From Name</Label>
                  <Input
                    value={settings.fromName}
                    onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                    placeholder="ASTRA Villa"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">From Email</Label>
                  <Input
                    value={settings.fromEmail}
                    onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                    placeholder="noreply@astravilla.com"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Reply-To Email</Label>
                  <Input
                    value={settings.replyToEmail}
                    onChange={(e) => setSettings({ ...settings, replyToEmail: e.target.value })}
                    placeholder="support@astravilla.com"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              {settings.provider === 'smtp' && (
                <>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium">SMTP Host</Label>
                      <Input
                        value={settings.smtpHost}
                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium">Port</Label>
                      <Input
                        value={settings.smtpPort}
                        onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                        placeholder="587"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium">Encryption</Label>
                      <Select 
                        value={settings.smtpEncryption} 
                        onValueChange={(v: 'none' | 'tls' | 'ssl') => setSettings({ ...settings, smtpEncryption: v })}
                      >
                        <SelectTrigger className="h-7 text-xs bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium">Username</Label>
                      <Input
                        value={settings.smtpUsername}
                        onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
                        placeholder="your-email@gmail.com"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium">Password</Label>
                      <Input
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                        placeholder="••••••••"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Link className="h-3.5 w-3.5" />
                URL Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Site URL
                  </Label>
                  <Input
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                    placeholder="https://astravilla.com"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Verification URL
                  </Label>
                  <Input
                    value={settings.verificationBaseUrl}
                    onChange={(e) => setSettings({ ...settings, verificationBaseUrl: e.target.value })}
                    placeholder="https://astravilla.com/verify"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Password Reset URL</Label>
                  <Input
                    value={settings.passwordResetUrl}
                    onChange={(e) => setSettings({ ...settings, passwordResetUrl: e.target.value })}
                    placeholder="https://astravilla.com/reset-password"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Login URL</Label>
                  <Input
                    value={settings.loginUrl}
                    onChange={(e) => setSettings({ ...settings, loginUrl: e.target.value })}
                    placeholder="https://astravilla.com/auth"
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => saveSettings('config', settings)} disabled={isSaving} className="w-full h-8 text-xs">
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-3 mt-3">
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-gold-primary">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Image className="h-3.5 w-3.5" />
                Logo & Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                  {branding.companyLogoUrl ? (
                    <img src={branding.companyLogoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Image className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-medium">Email Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      value={branding.companyLogoUrl}
                      onChange={(e) => setBranding({ ...branding, companyLogoUrl: e.target.value })}
                      placeholder="https://..."
                      className="h-7 text-xs flex-1"
                    />
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <span><Upload className="h-3 w-3 mr-1" /> Upload</span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-[8px] text-muted-foreground">Recommended: 200x60px transparent PNG</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Company Name</Label>
                  <Input
                    value={branding.companyName}
                    onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Website</Label>
                  <Input
                    value={branding.companyWebsite}
                    onChange={(e) => setBranding({ ...branding, companyWebsite: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Address</Label>
                  <Input
                    value={branding.companyAddress}
                    onChange={(e) => setBranding({ ...branding, companyAddress: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Phone</Label>
                  <Input
                    value={branding.companyPhone}
                    onChange={(e) => setBranding({ ...branding, companyPhone: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-[10px] font-medium">Support Email</Label>
                  <Input
                    value={branding.supportEmail}
                    onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-destructive">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Palette className="h-3.5 w-3.5" />
                Colors & Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Primary Color</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Secondary Color</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Accent Color</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-chart-4">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Social & Footer
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Facebook</Label>
                  <Input
                    value={branding.socialFacebook}
                    onChange={(e) => setBranding({ ...branding, socialFacebook: e.target.value })}
                    placeholder="URL"
                    className="h-6 text-[9px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Instagram</Label>
                  <Input
                    value={branding.socialInstagram}
                    onChange={(e) => setBranding({ ...branding, socialInstagram: e.target.value })}
                    placeholder="URL"
                    className="h-6 text-[9px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Twitter/X</Label>
                  <Input
                    value={branding.socialTwitter}
                    onChange={(e) => setBranding({ ...branding, socialTwitter: e.target.value })}
                    placeholder="URL"
                    className="h-6 text-[9px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">LinkedIn</Label>
                  <Input
                    value={branding.socialLinkedin}
                    onChange={(e) => setBranding({ ...branding, socialLinkedin: e.target.value })}
                    placeholder="URL"
                    className="h-6 text-[9px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Footer Text</Label>
                  <Textarea
                    value={branding.footerText}
                    onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                    className="h-14 text-xs resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Copyright Text</Label>
                  <Input
                    value={branding.copyrightText}
                    onChange={(e) => setBranding({ ...branding, copyrightText: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => saveSettings('branding', branding)} disabled={isSaving} className="w-full h-8 text-xs">
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save Branding'}
          </Button>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-3 mt-3">
          <div className="grid grid-cols-12 gap-3">
            {/* Template List */}
            <Card className="col-span-4 bg-card/50 border-border/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs text-foreground">Email Templates</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          "w-full text-left p-2 rounded-md transition-colors flex items-center gap-2",
                          selectedTemplate === template.id 
                            ? "bg-primary/10 border border-primary/30" 
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          template.isActive ? "bg-chart-1" : "bg-muted-foreground"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium truncate">{template.name}</p>
                          <p className="text-[8px] text-muted-foreground capitalize">{template.category}</p>
                        </div>
                        {template.category === 'auth' && <Shield className="h-3 w-3 text-primary" />}
                        {template.category === 'reminder' && <Bell className="h-3 w-3 text-chart-4" />}
                        {template.category === 'marketing' && <Megaphone className="h-3 w-3 text-chart-2" />}
                        {template.category === 'notification' && <Gift className="h-3 w-3 text-chart-3" />}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Template Editor */}
            <Card className="col-span-8 bg-card/50 border-border/50">
              <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs text-foreground flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  {currentTemplate.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentTemplate.isActive}
                    onCheckedChange={(checked) => updateTemplate(currentTemplate.id, { isActive: checked })}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {currentTemplate.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium">Subject Line</Label>
                    <Input
                      value={currentTemplate.subject}
                      onChange={(e) => updateTemplate(currentTemplate.id, { subject: e.target.value })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium">Preheader</Label>
                    <Input
                      value={currentTemplate.preheader}
                      onChange={(e) => updateTemplate(currentTemplate.id, { preheader: e.target.value })}
                      className="h-7 text-xs"
                      placeholder="Preview text shown in inbox"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Header Text</Label>
                  <Input
                    value={currentTemplate.headerText}
                    onChange={(e) => updateTemplate(currentTemplate.id, { headerText: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-medium">Body Content</Label>
                  <Textarea
                    value={currentTemplate.body}
                    onChange={(e) => updateTemplate(currentTemplate.id, { body: e.target.value })}
                    className="h-32 text-xs resize-none font-mono"
                    placeholder="Use {{variable}} for dynamic content"
                  />
                  <p className="text-[8px] text-muted-foreground">
                    Variables: {'{{user_name}}, {{company_name}}, {{site_url}}, {{verification_url}}, {{reset_url}}'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium">Button Text</Label>
                    <Input
                      value={currentTemplate.buttonText}
                      onChange={(e) => updateTemplate(currentTemplate.id, { buttonText: e.target.value })}
                      className="h-7 text-xs"
                      placeholder="Leave empty for no button"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium">Button URL</Label>
                    <Input
                      value={currentTemplate.buttonUrl}
                      onChange={(e) => updateTemplate(currentTemplate.id, { buttonUrl: e.target.value })}
                      className="h-7 text-xs"
                      placeholder="{{site_url}}/..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={currentTemplate.showSocialLinks}
                      onCheckedChange={(checked) => updateTemplate(currentTemplate.id, { showSocialLinks: checked })}
                    />
                    <span className="text-[10px]">Show Social Links</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={currentTemplate.showUnsubscribe}
                      onCheckedChange={(checked) => updateTemplate(currentTemplate.id, { showUnsubscribe: checked })}
                    />
                    <span className="text-[10px]">Show Unsubscribe</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => saveSettings('templates', templates)} disabled={isSaving} className="w-full h-8 text-xs">
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save Templates'}
          </Button>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-3 mt-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Automated Email Schedules
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div 
                    key={schedule.id}
                    className="p-3 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          schedule.isActive ? "bg-chart-1" : "bg-muted-foreground"
                        )} />
                        <span className="text-xs font-medium">{schedule.name}</span>
                        <Badge variant="outline" className="text-[8px] px-1.5 py-0">
                          {schedule.triggerType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Switch
                        checked={schedule.isActive}
                        onCheckedChange={(checked) => updateSchedule(schedule.id, { isActive: checked })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 text-[9px]">
                      <div>
                        <p className="text-muted-foreground">Template</p>
                        <p className="font-medium">{templates.find(t => t.id === schedule.templateId)?.name || schedule.templateId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-medium capitalize">{schedule.targetAudience.replace(/_/g, ' ')}</p>
                      </div>
                      {schedule.triggerType === 'scheduled' && (
                        <>
                          <div>
                            <p className="text-muted-foreground">After Inactive</p>
                            <p className="font-medium">{schedule.inactiveDays} days</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Send Time</p>
                            <p className="font-medium">{schedule.scheduleTime || 'Not set'}</p>
                          </div>
                        </>
                      )}
                      {schedule.triggerType === 'event_based' && (
                        <div>
                          <p className="text-muted-foreground">Trigger Event</p>
                          <p className="font-medium capitalize">{schedule.triggerEvent?.replace(/_/g, ' ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-chart-1">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Audience Segments
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="p-2 bg-muted/30 rounded-md">
                  <UserCheck className="h-4 w-4 mx-auto mb-1 text-chart-1" />
                  <p className="text-[9px] font-medium">New Users</p>
                  <p className="text-[8px] text-muted-foreground">Registered &lt;7 days</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <UserX className="h-4 w-4 mx-auto mb-1 text-chart-4" />
                  <p className="text-[9px] font-medium">Inactive</p>
                  <p className="text-[8px] text-muted-foreground">No login 7+ days</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-[9px] font-medium">Verified</p>
                  <p className="text-[8px] text-muted-foreground">Email confirmed</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <AlertCircle className="h-4 w-4 mx-auto mb-1 text-destructive" />
                  <p className="text-[9px] font-medium">Unverified</p>
                  <p className="text-[8px] text-muted-foreground">Pending email</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <Users className="h-4 w-4 mx-auto mb-1 text-chart-2" />
                  <p className="text-[9px] font-medium">All Users</p>
                  <p className="text-[8px] text-muted-foreground">Everyone</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => saveSettings('schedules', schedules)} disabled={isSaving} className="w-full h-8 text-xs">
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save Schedules'}
          </Button>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-3 mt-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" />
                Email Preview - {currentTemplate.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div 
                className="bg-gradient-to-br from-gold-primary/10 to-gold-primary/5 rounded-lg p-4 max-h-[500px] overflow-auto"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <div className="max-w-xl mx-auto bg-background rounded-xl shadow-lg overflow-hidden">
                  {/* Gold accent bar */}
                  <div 
                    className="h-1"
                    style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.accentColor}, ${branding.primaryColor})` }}
                  />
                  
                  {/* Logo */}
                  <div className="text-center py-6 bg-gradient-to-b from-gold-primary/5 to-background">
                    {branding.companyLogoUrl ? (
                      <img src={branding.companyLogoUrl} alt={branding.companyName} className="h-12 mx-auto" />
                    ) : (
                      <div>
                        <span style={{ color: branding.primaryColor }} className="text-2xl font-bold">ASTRA</span>
                        <span className="text-2xl font-light text-foreground ml-1">Villa</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-8 py-6">
                    <h1 className="text-xl font-semibold text-foreground text-center mb-4">
                      {currentTemplate.headerText || 'Email Header'}
                    </h1>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {currentTemplate.body.replace(/\{\{[^}]+\}\}/g, '[Variable]') || 'Email body content...'}
                    </p>
                    
                    {currentTemplate.buttonText && (
                      <div className="text-center mt-6">
                        <button 
                          className="px-6 py-3 rounded-lg text-primary-foreground text-sm font-medium shadow-md"
                          style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}
                        >
                          {currentTemplate.buttonText}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="bg-muted/50 px-8 py-6 text-center">
                    <p className="text-xs text-muted-foreground italic">{branding.footerText}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">{branding.companyAddress}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      <span style={{ color: branding.primaryColor }}>{branding.companyPhone}</span>
                      {' • '}
                      <span style={{ color: branding.primaryColor }}>{branding.supportEmail}</span>
                    </p>
                    
                    {currentTemplate.showSocialLinks && (branding.socialFacebook || branding.socialInstagram) && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-center gap-4">
                        {branding.socialFacebook && <span style={{ color: branding.primaryColor }} className="text-xs">Facebook</span>}
                        {branding.socialInstagram && <span style={{ color: branding.primaryColor }} className="text-xs">Instagram</span>}
                        {branding.socialTwitter && <span style={{ color: branding.primaryColor }} className="text-xs">Twitter</span>}
                      </div>
                    )}
                    
                    <p className="text-[10px] text-muted-foreground/70 mt-4">{branding.copyrightText}</p>
                    {currentTemplate.showUnsubscribe && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1 underline cursor-pointer">Unsubscribe from emails</p>
                    )}
                  </div>

                  {/* Bottom accent */}
                  <div 
                    className="h-1"
                    style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.accentColor}, ${branding.primaryColor})` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={testEmailConnection}
              disabled={isTesting}
              className="flex-1 h-8 text-xs"
            >
              <Send className="h-3 w-3 mr-1" />
              {isTesting ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManagementSettings;

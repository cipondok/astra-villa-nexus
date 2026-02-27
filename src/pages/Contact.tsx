import { useState } from "react";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Phone, Mail, MapPin, Clock, Send, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { t, tArray, language, setLanguage } = useTranslation();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: ""
  });

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const categories = tArray('contact.categories');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-inquiry-email', {
        body: {
          customer_email: formData.email,
          customer_name: formData.name,
          inquiry_type: formData.category || formData.subject || 'inquiry',
          message: formData.message,
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: t('contact.successTitle'),
        description: t('contact.successDescription'),
      });

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", phone: "", subject: "", category: "", message: "" });
      }, 3000);
    } catch (err: any) {
      console.error('Contact form error:', err);
      toast({
        title: t('contact.sendFailed'),
        description: t('contact.sendFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t('seo.contact.title')}
        description={t('seo.contact.description')}
        keywords="kontak ASTRA Villa, hubungi agen properti, customer service properti Indonesia"
      />
      <EnhancedNavigation
        language={language}
        onLanguageToggle={toggleLanguage}
      />
      
      <div className="pt-16 sm:pt-20 pb-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button + Header */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {t('contact.title')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('contact.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-gold-primary/20 hover:border-gold-primary/30 transition-all duration-300">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 text-gold-primary" />
                    {t('contact.sendUsMessage')}
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs md:text-sm">
                    {t('contact.fillForm')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gold-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t('contact.successTitle')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('contact.successDescription')}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-xs sm:text-sm">{t('contact.formName')}</Label>
                          <Input 
                            id="name" 
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs sm:text-sm">{t('contact.formEmail')}</Label>
                          <Input 
                            id="email" 
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-xs sm:text-sm">{t('contact.formPhone')}</Label>
                          <Input 
                            id="phone" 
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="category" className="text-xs sm:text-sm">{t('contact.formCategory')}</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                              <SelectValue placeholder={t('contact.selectCategory')} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat, idx) => (
                                <SelectItem key={idx} value={cat} className="text-xs sm:text-sm">{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-xs sm:text-sm">{t('contact.formSubject')}</Label>
                        <Input 
                          id="subject" 
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          required
                          className="h-9 sm:h-10 text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-xs sm:text-sm">{t('contact.formMessage')}</Label>
                        <Textarea 
                          id="message" 
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          required
                          rows={4}
                          className="text-xs sm:text-sm resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-9 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-background"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                            {t('contact.formSubmitting')}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t('contact.formSubmit')}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 sm:space-y-4">
              <Card className="border-gold-primary/20 hover:border-gold-primary/30 transition-all duration-300">
                <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gold-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gold-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">{t('contact.office')}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{t('contact.officeAddress')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gold-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gold-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">{t('contact.phone')}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{t('contact.phoneNumber')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gold-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gold-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">{t('contact.email')}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{t('contact.emailAddress')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gold-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gold-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">{t('contact.hours')}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{t('contact.hoursDetail')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-gold-primary/20 hover:border-gold-primary/30 transition-all duration-300">
                <CardContent className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground mb-2">
                    {t('contact.quickActions')}
                  </h3>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-9 sm:h-10 text-xs sm:text-sm border-gold-primary/20 hover:bg-gold-primary/5 hover:text-gold-primary"
                    onClick={() => {
                      toast({
                        title: 'Live Chat',
                        description: t('contact.liveChatSoon'),
                      });
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 text-gold-primary" />
                    {t('contact.startLiveChat')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-9 sm:h-10 text-xs sm:text-sm border-gold-primary/20 hover:bg-gold-primary/5 hover:text-gold-primary"
                    onClick={() => {
                      window.location.href = 'tel:+622112345678';
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2 text-gold-primary" />
                    {t('contact.callSupport')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();
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

  const text = {
    en: {
      title: "Contact Us",
      subtitle: "We're here to help. Get in touch with our team.",
      form: {
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        subject: "Subject",
        category: "Category",
        message: "Your Message",
        submit: "Send Message",
        submitting: "Sending...",
        categories: ["General Inquiry", "Property Listing", "Technical Support", "Partnership", "Feedback", "Other"]
      },
      contact: {
        office: "Office Address",
        officeAddress: "Jl. Sudirman No. 123, Jakarta Selatan, Indonesia 12190",
        phone: "Phone",
        phoneNumber: "+62 21 1234 5678",
        email: "Email",
        emailAddress: "support@astravilladev.com",
        hours: "Business Hours",
        hoursDetail: "Mon - Fri: 9:00 AM - 6:00 PM (WIB)"
      },
      success: {
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours."
      }
    },
    id: {
      title: "Hubungi Kami",
      subtitle: "Kami siap membantu. Hubungi tim kami.",
      form: {
        name: "Nama Lengkap",
        email: "Alamat Email",
        phone: "Nomor Telepon",
        subject: "Subjek",
        category: "Kategori",
        message: "Pesan Anda",
        submit: "Kirim Pesan",
        submitting: "Mengirim...",
        categories: ["Pertanyaan Umum", "Listing Properti", "Dukungan Teknis", "Kemitraan", "Masukan", "Lainnya"]
      },
      contact: {
        office: "Alamat Kantor",
        officeAddress: "Jl. Sudirman No. 123, Jakarta Selatan, Indonesia 12190",
        phone: "Telepon",
        phoneNumber: "+62 21 1234 5678",
        email: "Email",
        emailAddress: "support@astravilladev.com",
        hours: "Jam Operasional",
        hoursDetail: "Sen - Jum: 09:00 - 18:00 (WIB)"
      },
      success: {
        title: "Pesan Terkirim!",
        description: "Terima kasih telah menghubungi kami. Kami akan merespons dalam 24 jam."
      }
    }
  };

  const currentText = text[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: currentText.success.title,
      description: currentText.success.description,
    });

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", category: "", message: "" });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation
        language={language}
        onLanguageToggle={toggleLanguage}
      />
      
      <div className="pt-16 sm:pt-20 pb-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              {currentText.title}
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground">
              {currentText.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    {language === 'en' ? 'Send us a Message' : 'Kirim Pesan'}
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs md:text-sm">
                    {language === 'en' ? 'Fill out the form below and we\'ll respond promptly.' : 'Isi formulir di bawah dan kami akan segera merespons.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{currentText.success.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{currentText.success.description}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-xs sm:text-sm">{currentText.form.name}</Label>
                          <Input 
                            id="name" 
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs sm:text-sm">{currentText.form.email}</Label>
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
                          <Label htmlFor="phone" className="text-xs sm:text-sm">{currentText.form.phone}</Label>
                          <Input 
                            id="phone" 
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="category" className="text-xs sm:text-sm">{currentText.form.category}</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                              <SelectValue placeholder={language === 'en' ? 'Select category' : 'Pilih kategori'} />
                            </SelectTrigger>
                            <SelectContent>
                              {currentText.form.categories.map((cat, idx) => (
                                <SelectItem key={idx} value={cat} className="text-xs sm:text-sm">{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-xs sm:text-sm">{currentText.form.subject}</Label>
                        <Input 
                          id="subject" 
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          required
                          className="h-9 sm:h-10 text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-xs sm:text-sm">{currentText.form.message}</Label>
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
                        className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            {currentText.form.submitting}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {currentText.form.submit}
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
              <Card className="border-border/50">
                <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">{currentText.contact.office}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{currentText.contact.officeAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">{currentText.contact.phone}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{currentText.contact.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">{currentText.contact.email}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{currentText.contact.emailAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">{currentText.contact.hours}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{currentText.contact.hoursDetail}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/50">
                <CardContent className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground mb-2">
                    {language === 'en' ? 'Quick Actions' : 'Aksi Cepat'}
                  </h3>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => {
                      toast({
                        title: language === 'en' ? 'Live Chat' : 'Live Chat',
                        description: language === 'en' ? 'Live chat feature coming soon!' : 'Fitur live chat segera hadir!',
                      });
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Start Live Chat' : 'Mulai Live Chat'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => {
                      window.location.href = 'tel:+622112345678';
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Call Support' : 'Hubungi Support'}
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

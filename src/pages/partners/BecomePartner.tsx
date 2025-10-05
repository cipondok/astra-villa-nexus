import { Building2, TrendingUp, Award, Target, CheckCircle, Mail, Phone, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SimpleCaptcha, useCaptcha } from "@/components/captcha/SimpleCaptcha";
import { validateCaptcha } from "@/utils/captchaGenerator";
import { validateIndonesianPhone, formatIndonesianPhone } from "@/utils/phoneValidation";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const BecomePartner = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { captchaCode, refreshCaptcha } = useCaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    businessType: "",
    experience: "",
    message: "",
    captchaInput: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate captcha first
      if (!validateCaptcha(formData.captchaInput, captchaCode)) {
        toast({
          title: language === "en" ? "Invalid Captcha" : "Captcha Tidak Valid",
          description: language === "en" ? "Please enter the correct captcha code." : "Silakan masukkan kode captcha yang benar.",
          variant: "destructive",
        });
        refreshCaptcha();
        setFormData({ ...formData, captchaInput: "" });
        setIsSubmitting(false);
      }

      const schema = z.object({
        name: z.string().trim().min(2, { message: language === "en" ? "Name must be at least 2 characters" : "Nama minimal 2 karakter" }),
        email: z.string().trim().email({ message: language === "en" ? "Invalid email address" : "Alamat email tidak valid" }),
        phone: z.string().trim().refine(v => validateIndonesianPhone(v).isValid, {
          message: language === "en" ? "Please enter a valid Indonesian phone number" : "Silakan masukkan nomor telepon Indonesia yang valid",
        }),
        company: z.string().trim().min(2, { message: language === "en" ? "Company name must be at least 2 characters" : "Nama perusahaan minimal 2 karakter" }),
        businessType: z.string().trim().min(2, { message: language === "en" ? "Select a business type" : "Pilih jenis bisnis" }),
        experience: z.string().trim().min(1, { message: language === "en" ? "Select your experience" : "Pilih pengalaman Anda" }),
        message: z.string().trim().refine(v => v.split(/\s+/).filter(Boolean).length >= 10, {
          message: language === "en" ? "Please write at least 10 words" : "Harap tulis minimal 10 kata",
        }),
      });

      const parsed = schema.safeParse(formData);
      if (!parsed.success) {
        const msg = parsed.error.errors[0]?.message || (language === "en" ? "Please check your inputs" : "Periksa input Anda");
        toast({ title: language === "en" ? "Invalid Input" : "Input Tidak Valid", description: msg, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('inquiries')
        .insert([
          {
            inquiry_type: 'become_partner',
            subject: `Partner Application - ${formData.name}${formData.company ? ` (${formData.company})` : ''}`,
            message: formData.message,
            contact_email: formData.email,
            contact_phone: formData.phone,
            status: 'new',
          },
        ])
        .select('id')
        .single();

      if (insertError) throw insertError;

      await supabase.functions.invoke('send-inquiry-email', {
        body: {
          inquiry_id: inserted.id,
          customer_email: formData.email,
          customer_name: formData.name,
          inquiry_type: 'become_partner',
          message: formData.message,
        },
      });

      const formatted = formatIndonesianPhone(formData.phone);
      toast({
        title: language === "en" ? "Application Submitted!" : "Aplikasi Terkirim!",
        description: language === "en" ? `We'll review your application and contact you at ${formatted}.` : `Kami akan meninjau aplikasi Anda dan menghubungi Anda di ${formatted}.`,
      });

      setFormData({ name: "", email: "", phone: "", company: "", businessType: "", experience: "", message: "", captchaInput: "" });
      refreshCaptcha();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ title: language === "en" ? "Error" : "Kesalahan", description: language === "en" ? "Something went wrong. Please try again." : "Terjadi kesalahan. Silakan coba lagi.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const text = {
    en: {
      title: "Become a Partner",
      subtitle: "Join our partner program and grow your business with us",
      description: "Become a valued partner and unlock exclusive opportunities to expand your real estate business.",
      benefits: [
        "Exclusive lead generation",
        "Marketing support and resources",
        "Advanced analytics dashboard",
        "Dedicated partner manager",
        "Training and development programs",
        "Priority technical support"
      ],
      requirements: [
        {
          icon: Building2,
          title: "Licensed Business",
          description: "Valid real estate business license"
        },
        {
          icon: TrendingUp,
          title: "Track Record",
          description: "Proven track record in real estate"
        },
        {
          icon: Award,
          title: "Professional Standards",
          description: "Commitment to professional excellence"
        },
        {
          icon: Target,
          title: "Business Goals",
          description: "Clear growth objectives and targets"
        }
      ],
      applyButton: "Apply Now",
      contactUs: "Contact Us",
      formTitle: "Partner Application",
      formSubtitle: "Complete the application form to become our partner",
      namePlaceholder: "Full Name",
      emailPlaceholder: "Email Address",
      phonePlaceholder: "Phone Number",
      companyPlaceholder: "Company Name",
      businessType: "Business Type",
      selectBusinessType: "Select business type",
      agent: "Real Estate Agent",
      developer: "Developer",
      investor: "Investor",
      other: "Other",
      experience: "Years of Experience",
      selectExperience: "Select experience",
      years1_3: "1-3 years",
      years3_5: "3-5 years",
      years5_10: "5-10 years",
      years10plus: "10+ years",
      messagePlaceholder: "Tell us about your business...",
      submitButton: "Submit Application",
      submitting: "Submitting..."
    },
    id: {
      title: "Jadi Mitra",
      subtitle: "Bergabunglah dengan program mitra kami dan kembangkan bisnis Anda bersama kami",
      description: "Menjadi mitra yang berharga dan buka peluang eksklusif untuk memperluas bisnis real estat Anda.",
      benefits: [
        "Generasi prospek eksklusif",
        "Dukungan dan sumber daya pemasaran",
        "Dashboard analitik canggih",
        "Manajer mitra khusus",
        "Program pelatihan dan pengembangan",
        "Dukungan teknis prioritas"
      ],
      requirements: [
        {
          icon: Building2,
          title: "Bisnis Berlisensi",
          description: "Lisensi bisnis real estat yang valid"
        },
        {
          icon: TrendingUp,
          title: "Rekam Jejak",
          description: "Rekam jejak terbukti di real estat"
        },
        {
          icon: Award,
          title: "Standar Profesional",
          description: "Komitmen terhadap keunggulan profesional"
        },
        {
          icon: Target,
          title: "Tujuan Bisnis",
          description: "Tujuan dan target pertumbuhan yang jelas"
        }
      ],
      applyButton: "Daftar Sekarang",
      contactUs: "Hubungi Kami",
      formTitle: "Aplikasi Mitra",
      formSubtitle: "Lengkapi formulir aplikasi untuk menjadi mitra kami",
      namePlaceholder: "Nama Lengkap",
      emailPlaceholder: "Alamat Email",
      phonePlaceholder: "Nomor Telepon",
      companyPlaceholder: "Nama Perusahaan",
      businessType: "Jenis Bisnis",
      selectBusinessType: "Pilih jenis bisnis",
      agent: "Agen Real Estat",
      developer: "Pengembang",
      investor: "Investor",
      other: "Lainnya",
      experience: "Tahun Pengalaman",
      selectExperience: "Pilih pengalaman",
      years1_3: "1-3 tahun",
      years3_5: "3-5 tahun",
      years5_10: "5-10 tahun",
      years10plus: "10+ tahun",
      messagePlaceholder: "Ceritakan tentang bisnis Anda...",
      submitButton: "Kirim Aplikasi",
      submitting: "Mengirim..."
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl mb-6">
            <Building2 className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            {currentText.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {currentText.subtitle}
          </p>
        </div>

        {/* Description */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="glass-card p-8 rounded-2xl">
            <p className="text-lg text-foreground leading-relaxed mb-8">
              {currentText.description}
            </p>
            
            {/* Benefits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentText.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Partner Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentText.requirements.map((req, index) => {
              const Icon = req.icon;
              return (
                <div key={index} className="glass-card p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{req.title}</h3>
                  <p className="text-muted-foreground text-sm">{req.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Form Section */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-12 rounded-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                {currentText.formTitle}
              </h2>
              <p className="text-muted-foreground text-lg">
                {currentText.formSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {currentText.namePlaceholder}
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={currentText.namePlaceholder}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {currentText.emailPlaceholder}
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={currentText.emailPlaceholder}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {currentText.phonePlaceholder}
                  </label>
                  <Input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={currentText.phonePlaceholder}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {currentText.companyPlaceholder}
                  </label>
                  <Input
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={currentText.companyPlaceholder}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {currentText.businessType}
                  </label>
                  <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={currentText.selectBusinessType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">{currentText.agent}</SelectItem>
                      <SelectItem value="developer">{currentText.developer}</SelectItem>
                      <SelectItem value="investor">{currentText.investor}</SelectItem>
                      <SelectItem value="other">{currentText.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {currentText.experience}
                  </label>
                  <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={currentText.selectExperience} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">{currentText.years1_3}</SelectItem>
                      <SelectItem value="3-5">{currentText.years3_5}</SelectItem>
                      <SelectItem value="5-10">{currentText.years5_10}</SelectItem>
                      <SelectItem value="10+">{currentText.years10plus}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {currentText.messagePlaceholder}
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={currentText.messagePlaceholder}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {language === "en" ? "Security Check" : "Pemeriksaan Keamanan"}
                </label>
                <SimpleCaptcha code={captchaCode} onRefresh={refreshCaptcha} />
                <Input
                  required
                  value={formData.captchaInput}
                  onChange={(e) => setFormData({ ...formData, captchaInput: e.target.value })}
                  placeholder={language === "en" ? "Enter the code above" : "Masukkan kode di atas"}
                  className="h-12"
                  maxLength={6}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full text-lg h-14"
              >
                {isSubmitting ? currentText.submitting : currentText.submitButton}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomePartner;

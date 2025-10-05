import { Users, CheckCircle, Network, Building, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SimpleCaptcha, useCaptcha } from "@/components/captcha/SimpleCaptcha";
import { validateCaptcha } from "@/utils/captchaGenerator";
import { validateIndonesianPhone, formatIndonesianPhone } from "@/utils/phoneValidation";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const PartnerNetwork = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { captchaCode, refreshCaptcha } = useCaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
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
        return;
      }

      // Validate inputs with zod (email, phone, min words)
      const schema = z.object({
        name: z.string().trim().min(2, { message: language === "en" ? "Name must be at least 2 characters" : "Nama minimal 2 karakter" }),
        email: z.string().trim().email({ message: language === "en" ? "Invalid email address" : "Alamat email tidak valid" }),
        phone: z.string().trim().refine(v => validateIndonesianPhone(v).isValid, {
          message: language === "en" ? "Please enter a valid Indonesian phone number" : "Silakan masukkan nomor telepon Indonesia yang valid",
        }),
        company: z.string().trim().min(2, { message: language === "en" ? "Company name must be at least 2 characters" : "Nama perusahaan minimal 2 karakter" }),
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

      // Store inquiry for admin visibility
      const { data: inserted, error: insertError } = await supabase
        .from('inquiries')
        .insert([
          {
            inquiry_type: 'partner_network',
            subject: `Partner Network Application - ${formData.name}${formData.company ? ` (${formData.company})` : ''}`,
            message: formData.message,
            contact_email: formData.email,
            contact_phone: formData.phone,
            status: 'new',
          },
        ])
        .select('id')
        .single();

      if (insertError) throw insertError;

      const formatted = formatIndonesianPhone(formData.phone);
      toast({
        title: language === "en" ? "Application Submitted!" : "Aplikasi Terkirim!",
        description: language === "en" ? `We'll contact you soon at ${formatted}.` : `Kami akan segera menghubungi Anda di ${formatted}.`,
      });

      setFormData({ name: "", email: "", phone: "", company: "", message: "", captchaInput: "" });
      refreshCaptcha();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: language === "en" ? "Error" : "Kesalahan",
        description: language === "en" ? "Something went wrong. Please try again." : "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const text = {
    en: {
      title: "Partner Network",
      subtitle: "Connect with our trusted network of real estate professionals",
      description: "Join our extensive network of verified real estate partners including agents, developers, and service providers.",
      features: [
        {
          icon: Users,
          title: "Verified Professionals",
          description: "Access to thousands of verified real estate professionals"
        },
        {
          icon: Network,
          title: "Collaborative Opportunities",
          description: "Work together on projects and share expertise"
        },
        {
          icon: Building,
          title: "Shared Resources",
          description: "Access to shared tools, resources, and industry insights"
        },
        {
          icon: CheckCircle,
          title: "Networking Events",
          description: "Regular events to connect and grow your network"
        }
      ],
      joinButton: "Join Our Network",
      learnMore: "Learn More",
      formTitle: "Join Our Network",
      formSubtitle: "Fill out the form below and we'll get back to you soon",
      namePlaceholder: "Full Name",
      emailPlaceholder: "Email Address",
      phonePlaceholder: "Phone Number",
      companyPlaceholder: "Company Name",
      messagePlaceholder: "Tell us about your interest...",
      submitButton: "Submit Application",
      submitting: "Submitting..."
    },
    id: {
      title: "Jaringan Mitra",
      subtitle: "Terhubung dengan jaringan profesional real estat terpercaya kami",
      description: "Bergabunglah dengan jaringan luas mitra real estat terverifikasi kami termasuk agen, pengembang, dan penyedia layanan.",
      features: [
        {
          icon: Users,
          title: "Profesional Terverifikasi",
          description: "Akses ke ribuan profesional real estat terverifikasi"
        },
        {
          icon: Network,
          title: "Peluang Kolaboratif",
          description: "Bekerja bersama dalam proyek dan berbagi keahlian"
        },
        {
          icon: Building,
          title: "Sumber Daya Bersama",
          description: "Akses ke alat, sumber daya, dan wawasan industri bersama"
        },
        {
          icon: CheckCircle,
          title: "Acara Networking",
          description: "Acara rutin untuk terhubung dan mengembangkan jaringan Anda"
        }
      ],
      joinButton: "Bergabung dengan Jaringan Kami",
      learnMore: "Pelajari Lebih Lanjut",
      formTitle: "Bergabung dengan Jaringan Kami",
      formSubtitle: "Isi formulir di bawah ini dan kami akan segera menghubungi Anda",
      namePlaceholder: "Nama Lengkap",
      emailPlaceholder: "Alamat Email",
      phonePlaceholder: "Nomor Telepon",
      companyPlaceholder: "Nama Perusahaan",
      messagePlaceholder: "Ceritakan tentang minat Anda...",
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
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-6">
            <Users className="w-12 h-12 text-primary" />
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
            <p className="text-lg text-foreground leading-relaxed">
              {currentText.description}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {currentText.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
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
                    <Building className="w-4 h-4" />
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

export default PartnerNetwork;

import { Handshake, Building, Users2, PieChart, Shield, Rocket, Mail, Phone, User, DollarSign, Check, X } from "lucide-react";
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

const JointVentures = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { captchaCode, refreshCaptcha } = useCaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    investmentRange: "",
    projectType: "",
    message: "",
    captchaInput: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);

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
      const schema = z.object({
        name: z.string().trim().min(2, { message: language === "en" ? "Name must be at least 2 characters" : "Nama minimal 2 karakter" }),
        email: z.string().trim().email({ message: language === "en" ? "Invalid email address" : "Alamat email tidak valid" }),
        phone: z.string().trim().refine(v => validateIndonesianPhone(v).isValid, {
          message: language === "en" ? "Please enter a valid Indonesian phone number" : "Silakan masukkan nomor telepon Indonesia yang valid",
        }),
        company: z.string().trim().min(2, { message: language === "en" ? "Company name must be at least 2 characters" : "Nama perusahaan minimal 2 karakter" }),
        investmentRange: z.string().trim().min(1, { message: language === "en" ? "Select an investment range" : "Pilih rentang investasi" }),
        projectType: z.string().trim().min(1, { message: language === "en" ? "Select a project type" : "Pilih jenis proyek" }),
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
            inquiry_type: 'joint_ventures',
            subject: `Joint Venture Inquiry - ${formData.name}${formData.company ? ` (${formData.company})` : ''}`,
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
          inquiry_type: 'joint_ventures',
          message: formData.message,
        },
      });

      const formatted = formatIndonesianPhone(formData.phone);
      toast({
        title: language === "en" ? "Inquiry Submitted!" : "Pertanyaan Terkirim!",
        description: language === "en" ? `Our team will contact you at ${formatted}.` : `Tim kami akan menghubungi Anda di ${formatted}.`,
      });

      setFormData({ name: "", email: "", phone: "", company: "", investmentRange: "", projectType: "", message: "", captchaInput: "" });
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
      title: "Joint Ventures",
      subtitle: "Explore joint venture opportunities in real estate",
      description: "Partner with us on strategic real estate development projects and investment opportunities.",
      opportunities: [
        {
          icon: Building,
          title: "Co-Development",
          description: "Partner on residential and commercial development projects",
          details: "Collaborate on large-scale development projects with shared investment and expertise"
        },
        {
          icon: PieChart,
          title: "Investment Partnerships",
          description: "Joint investment in high-potential real estate assets",
          details: "Pool resources for strategic property investments with attractive returns"
        },
        {
          icon: Shield,
          title: "Risk Sharing",
          description: "Mitigate risks through strategic partnerships",
          details: "Share financial and operational risks while maximizing opportunities"
        },
        {
          icon: Users2,
          title: "Expertise Sharing",
          description: "Leverage combined knowledge and experience",
          details: "Benefit from shared market insights and professional expertise"
        },
        {
          icon: Rocket,
          title: "Long-term Partnerships",
          description: "Build lasting strategic relationships",
          details: "Develop sustainable partnerships for continuous growth"
        }
      ],
      advantages: [
        "Shared capital investment",
        "Reduced financial risk",
        "Combined market expertise",
        "Expanded market reach",
        "Accelerated project delivery",
        "Enhanced competitive advantage"
      ],
      exploreButton: "Explore Opportunities",
      contactUs: "Contact Us",
      formTitle: "Joint Venture Inquiry",
      formSubtitle: "Tell us about your venture interests and investment capacity",
      namePlaceholder: "Full Name",
      emailPlaceholder: "Email Address",
      phonePlaceholder: "Phone Number",
      companyPlaceholder: "Company Name",
      investmentRange: "Investment Range",
      selectInvestment: "Select investment range",
      range1: "Under $500K",
      range2: "$500K - $1M",
      range3: "$1M - $5M",
      range4: "Above $5M",
      projectType: "Project Interest",
      selectProject: "Select project type",
      residential: "Residential Development",
      commercial: "Commercial Development",
      mixed: "Mixed-Use Development",
      landInvestment: "Land Investment",
      messagePlaceholder: "Describe your venture goals and expectations...",
      submitButton: "Submit Inquiry",
      submitting: "Submitting..."
    },
    id: {
      title: "Usaha Patungan",
      subtitle: "Jelajahi peluang usaha patungan di real estat",
      description: "Bermitra dengan kami dalam proyek pengembangan real estat strategis dan peluang investasi.",
      opportunities: [
        {
          icon: Building,
          title: "Co-Development",
          description: "Bermitra dalam proyek pengembangan residensial dan komersial",
          details: "Berkolaborasi dalam proyek pengembangan skala besar dengan investasi dan keahlian bersama"
        },
        {
          icon: PieChart,
          title: "Kemitraan Investasi",
          description: "Investasi bersama dalam aset real estat berpotensi tinggi",
          details: "Menggabungkan sumber daya untuk investasi properti strategis dengan pengembalian menarik"
        },
        {
          icon: Shield,
          title: "Berbagi Risiko",
          description: "Mitigasi risiko melalui kemitraan strategis",
          details: "Berbagi risiko finansial dan operasional sambil memaksimalkan peluang"
        },
        {
          icon: Users2,
          title: "Berbagi Keahlian",
          description: "Manfaatkan pengetahuan dan pengalaman gabungan",
          details: "Manfaatkan wawasan pasar bersama dan keahlian profesional"
        },
        {
          icon: Rocket,
          title: "Kemitraan Jangka Panjang",
          description: "Bangun hubungan strategis yang langgeng",
          details: "Kembangkan kemitraan berkelanjutan untuk pertumbuhan berkelanjutan"
        }
      ],
      advantages: [
        "Investasi modal bersama",
        "Risiko finansial berkurang",
        "Keahlian pasar gabungan",
        "Jangkauan pasar diperluas",
        "Pengiriman proyek dipercepat",
        "Keunggulan kompetitif ditingkatkan"
      ],
      exploreButton: "Jelajahi Peluang",
      contactUs: "Hubungi Kami",
      formTitle: "Pertanyaan Usaha Patungan",
      formSubtitle: "Ceritakan minat dan kapasitas investasi Anda",
      namePlaceholder: "Nama Lengkap",
      emailPlaceholder: "Alamat Email",
      phonePlaceholder: "Nomor Telepon",
      companyPlaceholder: "Nama Perusahaan",
      investmentRange: "Rentang Investasi",
      selectInvestment: "Pilih rentang investasi",
      range1: "Di bawah $500K",
      range2: "$500K - $1M",
      range3: "$1M - $5M",
      range4: "Di atas $5M",
      projectType: "Minat Proyek",
      selectProject: "Pilih jenis proyek",
      residential: "Pengembangan Residensial",
      commercial: "Pengembangan Komersial",
      mixed: "Pengembangan Campuran",
      landInvestment: "Investasi Tanah",
      messagePlaceholder: "Jelaskan tujuan dan harapan usaha Anda...",
      submitButton: "Kirim Pertanyaan",
      submitting: "Mengirim..."
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-macos-gradient rounded-2xl mb-6 shadow-macos">
            <Handshake className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-macos-gradient bg-clip-text text-transparent">
            {currentText.title}
          </h1>
          <p className="text-xl text-macos-gray max-w-2xl mx-auto">
            {currentText.subtitle}
          </p>
        </div>

        {/* Description */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-macos border border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {currentText.description}
            </p>
          </div>
        </div>

        {/* Opportunities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-macos-gradient bg-clip-text text-transparent">
            Partnership Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentText.opportunities.map((opportunity, index) => {
              const Icon = opportunity.icon;
              return (
                <div key={index} className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-macos hover:shadow-macos-hover transition-all duration-300 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 bg-macos-gradient rounded-2xl shadow-macos">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{opportunity.title}</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">{opportunity.description}</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 pl-16">{opportunity.details}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advantages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-macos-gradient bg-clip-text text-transparent">
            Joint Venture Advantages
          </h2>
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-macos border border-neutral-200 dark:border-neutral-800 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentText.advantages.map((advantage, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-macos-gradient rounded-full shadow-macos" />
                  <span className="text-neutral-700 dark:text-neutral-300">{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inquiry Form Section */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-neutral-900 p-12 rounded-2xl shadow-macos-hover border border-neutral-200 dark:border-neutral-800 animate-macos-window-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-macos-gradient bg-clip-text text-transparent">
                {currentText.formTitle}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                {currentText.formSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-macos-blue" />
                    {currentText.namePlaceholder}
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={currentText.namePlaceholder}
                    className="h-12 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-macos-blue focus:ring-macos-blue"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-macos-blue" />
                    {currentText.emailPlaceholder}
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        const email = e.target.value;
                        setFormData({ ...formData, email });
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        setEmailValid(email.length > 0 ? emailRegex.test(email) : null);
                      }}
                      placeholder={currentText.emailPlaceholder}
                      className="h-12 pr-10 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-macos-blue focus:ring-macos-blue"
                    />
                    {emailValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {emailValid ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-macos-blue" />
                    {currentText.phonePlaceholder}
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const phone = e.target.value;
                        setFormData({ ...formData, phone });
                        if (phone.length > 0) {
                          const validation = validateIndonesianPhone(phone);
                          setPhoneValid(validation.isValid);
                        } else {
                          setPhoneValid(null);
                        }
                      }}
                      placeholder={currentText.phonePlaceholder}
                      className="h-12 pr-10 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-macos-blue focus:ring-macos-blue"
                    />
                    {phoneValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {phoneValid ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Building className="w-4 h-4 text-macos-blue" />
                    {currentText.companyPlaceholder}
                  </label>
                  <Input
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={currentText.companyPlaceholder}
                    className="h-12 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-macos-blue focus:ring-macos-blue"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-macos-blue" />
                    {currentText.investmentRange}
                  </label>
                  <Select value={formData.investmentRange} onValueChange={(value) => setFormData({ ...formData, investmentRange: value })}>
                    <SelectTrigger className="h-12 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-macos-blue focus:ring-macos-blue">
                      <SelectValue placeholder={currentText.selectInvestment} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-500k">{currentText.range1}</SelectItem>
                      <SelectItem value="500k-1m">{currentText.range2}</SelectItem>
                      <SelectItem value="1m-5m">{currentText.range3}</SelectItem>
                      <SelectItem value="above-5m">{currentText.range4}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Building className="w-4 h-4 text-macos-blue" />
                    {currentText.projectType}
                  </label>
                  <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value })}>
                    <SelectTrigger className="h-12 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-macos-blue focus:ring-macos-blue">
                      <SelectValue placeholder={currentText.selectProject} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">{currentText.residential}</SelectItem>
                      <SelectItem value="commercial">{currentText.commercial}</SelectItem>
                      <SelectItem value="mixed">{currentText.mixed}</SelectItem>
                      <SelectItem value="land">{currentText.landInvestment}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {currentText.messagePlaceholder}
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={currentText.messagePlaceholder}
                  rows={5}
                  className="resize-none bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-macos-blue focus:ring-macos-blue"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === "en" ? "Security Check" : "Pemeriksaan Keamanan"}
                </label>
                <SimpleCaptcha code={captchaCode} onRefresh={refreshCaptcha} />
                <Input
                  required
                  value={formData.captchaInput}
                  onChange={(e) => setFormData({ ...formData, captchaInput: e.target.value })}
                  placeholder={language === "en" ? "Enter the code above" : "Masukkan kode di atas"}
                  className="h-12 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-macos-blue focus:ring-macos-blue"
                  maxLength={6}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full text-lg h-14 bg-macos-gradient hover:shadow-macos-hover transition-all duration-300 text-white font-semibold border-0"
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

export default JointVentures;

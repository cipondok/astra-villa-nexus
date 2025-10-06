import { TrendingUp, DollarSign, Headphones, GraduationCap, Trophy, Megaphone, Mail, Phone, User, Check, X } from "lucide-react";
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

const PartnerBenefits = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { captchaCode, refreshCaptcha } = useCaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
            inquiry_type: 'partner_benefits',
            subject: `Benefits Info Request - ${formData.name}`,
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
          inquiry_type: 'partner_benefits',
          message: formData.message,
        },
      });

      const formatted = formatIndonesianPhone(formData.phone);
      toast({
        title: language === "en" ? "Request Submitted!" : "Permintaan Terkirim!",
        description: language === "en" ? `We'll send details and contact you at ${formatted}.` : `Kami akan mengirimkan detail dan menghubungi Anda di ${formatted}.`,
      });

      setFormData({ name: "", email: "", phone: "", message: "", captchaInput: "" });
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
      title: "Partner Benefits",
      subtitle: "Exclusive benefits and rewards for our valued partners",
      description: "Enjoy a comprehensive suite of benefits designed to help you succeed and grow.",
      benefits: [
        {
          icon: DollarSign,
          title: "Competitive Commission",
          description: "Industry-leading commission structure with performance bonuses",
          features: ["Base commission up to 3%", "Performance bonuses", "Quarterly incentives"]
        },
        {
          icon: Headphones,
          title: "Priority Support",
          description: "Dedicated support team available 24/7 for all your needs",
          features: ["24/7 customer support", "Dedicated account manager", "Priority response times"]
        },
        {
          icon: GraduationCap,
          title: "Training & Development",
          description: "Comprehensive training programs to enhance your skills",
          features: ["Free certification courses", "Monthly workshops", "Industry expert sessions"]
        },
        {
          icon: Trophy,
          title: "Performance Rewards",
          description: "Recognition and rewards for outstanding performance",
          features: ["Monthly awards", "Annual recognition events", "Exclusive perks"]
        },
        {
          icon: Megaphone,
          title: "Co-Marketing",
          description: "Joint marketing campaigns to boost your visibility",
          features: ["Social media promotion", "Featured listings", "Marketing materials"]
        },
        {
          icon: TrendingUp,
          title: "Business Growth",
          description: "Tools and resources to scale your business",
          features: ["Lead generation tools", "CRM access", "Analytics dashboard"]
        }
      ],
      joinButton: "Join Now",
      learnMore: "Learn More",
      formTitle: "Get Detailed Benefits Information",
      formSubtitle: "Leave your contact details and we'll send you the complete benefits package",
      namePlaceholder: "Full Name",
      emailPlaceholder: "Email Address",
      phonePlaceholder: "Phone Number",
      messagePlaceholder: "Any specific questions about benefits?",
      submitButton: "Request Information",
      submitting: "Sending..."
    },
    id: {
      title: "Manfaat Mitra",
      subtitle: "Manfaat dan penghargaan eksklusif untuk mitra berharga kami",
      description: "Nikmati rangkaian manfaat lengkap yang dirancang untuk membantu Anda sukses dan berkembang.",
      benefits: [
        {
          icon: DollarSign,
          title: "Komisi Kompetitif",
          description: "Struktur komisi terdepan di industri dengan bonus kinerja",
          features: ["Komisi dasar hingga 3%", "Bonus kinerja", "Insentif kuartalan"]
        },
        {
          icon: Headphones,
          title: "Dukungan Prioritas",
          description: "Tim dukungan khusus tersedia 24/7 untuk semua kebutuhan Anda",
          features: ["Dukungan pelanggan 24/7", "Manajer akun khusus", "Waktu respons prioritas"]
        },
        {
          icon: GraduationCap,
          title: "Pelatihan & Pengembangan",
          description: "Program pelatihan komprehensif untuk meningkatkan keterampilan Anda",
          features: ["Kursus sertifikasi gratis", "Lokakarya bulanan", "Sesi ahli industri"]
        },
        {
          icon: Trophy,
          title: "Penghargaan Kinerja",
          description: "Pengakuan dan penghargaan untuk kinerja luar biasa",
          features: ["Penghargaan bulanan", "Acara pengakuan tahunan", "Fasilitas eksklusif"]
        },
        {
          icon: Megaphone,
          title: "Co-Marketing",
          description: "Kampanye pemasaran bersama untuk meningkatkan visibilitas Anda",
          features: ["Promosi media sosial", "Listing unggulan", "Material pemasaran"]
        },
        {
          icon: TrendingUp,
          title: "Pertumbuhan Bisnis",
          description: "Alat dan sumber daya untuk menskalakan bisnis Anda",
          features: ["Alat generasi prospek", "Akses CRM", "Dashboard analitik"]
        }
      ],
      joinButton: "Bergabung Sekarang",
      learnMore: "Pelajari Lebih Lanjut",
      formTitle: "Dapatkan Informasi Manfaat Detail",
      formSubtitle: "Tinggalkan detail kontak Anda dan kami akan mengirimkan paket manfaat lengkap",
      namePlaceholder: "Nama Lengkap",
      emailPlaceholder: "Alamat Email",
      phonePlaceholder: "Nomor Telepon",
      messagePlaceholder: "Pertanyaan spesifik tentang manfaat?",
      submitButton: "Minta Informasi",
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
            <TrendingUp className="w-12 h-12 text-white" />
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

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {currentText.benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-macos hover:shadow-macos-hover transition-all duration-300 border border-neutral-200 dark:border-neutral-800">
                <div className="inline-flex p-4 bg-macos-gradient rounded-2xl mb-4 shadow-macos">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">{benefit.description}</p>
                <ul className="space-y-2">
                  {benefit.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                      <span className="text-macos-blue mt-1 font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto">
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
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {currentText.messagePlaceholder}
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={currentText.messagePlaceholder}
                  rows={4}
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

export default PartnerBenefits;

import { Handshake, Building, Users2, PieChart, Shield, Rocket, Mail, Phone, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCaptcha } from "@/hooks/useCaptcha";
import { verifyCaptchaToken } from "@/utils/captchaVerification";
import { validateIndonesianPhone } from "@/utils/phoneValidation";
import { supabase } from "@/integrations/supabase/client";

const JointVentures = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { executeRecaptcha, isAvailable } = useCaptcha();
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    investmentRange: "",
    projectType: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkCaptchaSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'captcha_enabled')
        .single();
      
      if (data) {
        setCaptchaEnabled(data.value === true || data.value === 'true');
      }
    };
    checkCaptchaSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate Indonesian phone number
      const phoneValidation = validateIndonesianPhone(formData.phone);
      if (!phoneValidation.isValid) {
        toast({
          title: language === "en" ? "Invalid Phone Number" : "Nomor Telepon Tidak Valid",
          description: phoneValidation.message || (language === "en" 
            ? "Please enter a valid Indonesian phone number" 
            : "Silakan masukkan nomor telepon Indonesia yang valid"),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (captchaEnabled && isAvailable) {
        const token = await executeRecaptcha('joint_ventures_form');
        
        if (!token) {
          toast({
            title: language === "en" ? "Error" : "Kesalahan",
            description: language === "en" 
              ? "Captcha verification failed. Please try again." 
              : "Verifikasi captcha gagal. Silakan coba lagi.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const verification = await verifyCaptchaToken(token, 'joint_ventures_form');
        
        if (!verification.success) {
          toast({
            title: language === "en" ? "Security Check Failed" : "Pemeriksaan Keamanan Gagal",
            description: verification.error || (language === "en" ? "Please try again later." : "Silakan coba lagi nanti."),
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: language === "en" ? "Inquiry Submitted!" : "Pertanyaan Terkirim!",
        description: language === "en" 
          ? "Our partnership team will contact you shortly." 
          : "Tim kemitraan kami akan segera menghubungi Anda.",
      });
      
      setFormData({ name: "", email: "", phone: "", company: "", investmentRange: "", projectType: "", message: "" });
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
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl mb-6">
            <Handshake className="w-12 h-12 text-orange-500" />
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
          <div className="glass-card p-8 rounded-2xl text-center">
            <p className="text-lg text-foreground leading-relaxed">
              {currentText.description}
            </p>
          </div>
        </div>

        {/* Opportunities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Partnership Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentText.opportunities.map((opportunity, index) => {
              const Icon = opportunity.icon;
              return (
                <div key={index} className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl">
                      <Icon className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{opportunity.title}</h3>
                      <p className="text-muted-foreground">{opportunity.description}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground pl-16">{opportunity.details}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advantages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Joint Venture Advantages
          </h2>
          <div className="glass-card p-8 rounded-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentText.advantages.map((advantage, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" />
                  <span className="text-foreground">{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inquiry Form Section */}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {currentText.investmentRange}
                  </label>
                  <Select value={formData.investmentRange} onValueChange={(value) => setFormData({ ...formData, investmentRange: value })}>
                    <SelectTrigger className="h-12">
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
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {currentText.projectType}
                  </label>
                  <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value })}>
                    <SelectTrigger className="h-12">
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

export default JointVentures;

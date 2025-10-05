import { Users, CheckCircle, Network, Building, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PartnerNetwork = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: language === "en" ? "Application Submitted!" : "Aplikasi Terkirim!",
      description: language === "en" 
        ? "We'll contact you within 24 hours." 
        : "Kami akan menghubungi Anda dalam 24 jam.",
    });
    
    setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    setIsSubmitting(false);
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

import { Building2, TrendingUp, Award, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const BecomePartner = () => {
  const { language } = useLanguage();

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
      contactUs: "Contact Us"
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
      contactUs: "Hubungi Kami"
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

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass-card p-12 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Ready to Partner?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Start your journey with us today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                {currentText.applyButton}
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                {currentText.contactUs}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomePartner;

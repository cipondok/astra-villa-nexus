import { TrendingUp, DollarSign, Headphones, GraduationCap, Trophy, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const PartnerBenefits = () => {
  const { language } = useLanguage();

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
      learnMore: "Learn More"
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
      learnMore: "Pelajari Lebih Lanjut"
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl mb-6">
            <TrendingUp className="w-12 h-12 text-purple-500" />
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

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {currentText.benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                <div className="inline-flex p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground mb-4">{benefit.description}</p>
                <ul className="space-y-2">
                  {benefit.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass-card p-12 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join today and start enjoying these exclusive benefits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                {currentText.joinButton}
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                {currentText.learnMore}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerBenefits;

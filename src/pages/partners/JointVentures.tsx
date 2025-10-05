import { Handshake, Building, Users2, PieChart, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const JointVentures = () => {
  const { language } = useLanguage();

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
      contactUs: "Contact Us"
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
      contactUs: "Hubungi Kami"
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

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass-card p-12 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Let's Build Together
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Start exploring partnership opportunities today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                {currentText.exploreButton}
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

export default JointVentures;

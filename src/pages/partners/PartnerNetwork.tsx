import { Users, CheckCircle, Network, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const PartnerNetwork = () => {
  const { language } = useLanguage();

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
      learnMore: "Learn More"
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
      learnMore: "Pelajari Lebih Lanjut"
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

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass-card p-12 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Ready to Join?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Become part of the most trusted real estate network in Indonesia
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

export default PartnerNetwork;

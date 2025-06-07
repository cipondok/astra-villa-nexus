
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Award, Globe, Heart, Shield } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";

const About = () => {
  const { isAuthenticated } = useAuth();
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const text = {
    en: {
      title: "About Astra Villa",
      subtitle: "Your Trusted Partner in Real Estate",
      mission: "Our Mission",
      missionText: "To revolutionize the real estate industry by providing innovative, transparent, and customer-centric solutions that make property transactions seamless and enjoyable.",
      vision: "Our Vision",
      visionText: "To become the leading real estate platform in Southeast Asia, connecting people with their dream properties while building lasting relationships.",
      values: "Our Values",
      valuesItems: [
        { icon: Heart, title: "Customer First", description: "We prioritize our customers' needs and satisfaction above all else." },
        { icon: Shield, title: "Trust & Transparency", description: "We maintain the highest standards of integrity in all our dealings." },
        { icon: Award, title: "Excellence", description: "We strive for excellence in every service we provide." },
        { icon: Globe, title: "Innovation", description: "We embrace technology to create better experiences." }
      ],
      stats: "Company Statistics",
      statsItems: [
        { number: "10,000+", label: "Properties Listed" },
        { number: "5,000+", label: "Happy Customers" },
        { number: "50+", label: "Expert Agents" },
        { number: "15+", label: "Cities Covered" }
      ],
      team: "Our Team",
      teamText: "Our dedicated team of real estate professionals brings years of experience and local market knowledge to help you make informed decisions."
    },
    id: {
      title: "Tentang Astra Villa",
      subtitle: "Mitra Terpercaya Anda di Bidang Real Estate",
      mission: "Misi Kami",
      missionText: "Merevolusi industri real estate dengan menyediakan solusi inovatif, transparan, dan berpusat pada pelanggan yang membuat transaksi properti menjadi mudah dan menyenangkan.",
      vision: "Visi Kami",
      visionText: "Menjadi platform real estate terdepan di Asia Tenggara, menghubungkan orang dengan properti impian mereka sambil membangun hubungan yang langgeng.",
      values: "Nilai-nilai Kami",
      valuesItems: [
        { icon: Heart, title: "Pelanggan Utama", description: "Kami mengutamakan kebutuhan dan kepuasan pelanggan di atas segalanya." },
        { icon: Shield, title: "Kepercayaan & Transparansi", description: "Kami menjaga standar integritas tertinggi dalam semua urusan kami." },
        { icon: Award, title: "Keunggulan", description: "Kami berusaha untuk keunggulan dalam setiap layanan yang kami berikan." },
        { icon: Globe, title: "Inovasi", description: "Kami merangkul teknologi untuk menciptakan pengalaman yang lebih baik." }
      ],
      stats: "Statistik Perusahaan",
      statsItems: [
        { number: "10,000+", label: "Properti Terdaftar" },
        { number: "5,000+", label: "Pelanggan Puas" },
        { number: "50+", label: "Agen Ahli" },
        { number: "15+", label: "Kota Terjangkau" }
      ],
      team: "Tim Kami",
      teamText: "Tim profesional real estate kami yang berdedikasi membawa pengalaman bertahun-tahun dan pengetahuan pasar lokal untuk membantu Anda membuat keputusan yang tepat."
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated && (
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={toggleLanguage}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}
      
      <div className={`${isAuthenticated ? 'pt-16' : 'pt-8'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentText.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {currentText.subtitle}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-blue-600" />
                  {currentText.mission}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentText.missionText}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  {currentText.vision}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentText.visionText}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {currentText.stats}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {currentText.statsItems.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stat.number}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {currentText.values}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentText.valuesItems.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
                {currentText.team}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {currentText.teamText}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;

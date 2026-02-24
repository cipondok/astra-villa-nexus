
import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Award, Globe, Heart, Shield } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";

const About = () => {
  const { isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const valuesItems = [
    { icon: Heart, title: t('about.customerFirst'), description: t('about.customerFirstDesc') },
    { icon: Shield, title: t('about.trustTransparency'), description: t('about.trustTransparencyDesc') },
    { icon: Award, title: t('about.excellence'), description: t('about.excellenceDesc') },
    { icon: Globe, title: t('about.innovation'), description: t('about.innovationDesc') },
  ];

  const statsItems = [
    { number: "10,000+", label: t('about.statsPropertiesListed') },
    { number: "5,000+", label: t('about.statsHappyCustomers') },
    { number: "50+", label: t('about.statsExpertAgents') },
    { number: "15+", label: t('about.statsCitiesCovered') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Tentang Astra Villa"
        description="ASTRA Villa Realty adalah platform properti premium Indonesia. Kenali misi, visi, dan tim profesional kami yang berdedikasi."
        keywords="tentang astra villa, platform properti indonesia, real estate premium"
      />
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
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('about.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-primary" />
                  {t('about.mission')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('about.missionText')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  {t('about.vision')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('about.visionText')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              {t('about.stats')}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {statsItems.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <p className="text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              {t('about.values')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {valuesItems.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
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
                <Users className="h-6 w-6 text-primary" />
                {t('about.team')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t('about.teamText')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;

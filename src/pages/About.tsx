import { useState } from "react";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Award,
  Globe,
  Heart,
  Shield,
  Sparkles,
  Cpu,
  Landmark,
  Briefcase,
  TrendingUp,
  Layers,
  MapPin,
  Rocket,
  Zap,
  Wallet,
  BarChart3,
  Home,
  Handshake,
  ShoppingBag,
} from "lucide-react";
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

  const ecosystemPillars = [
    {
      icon: Building2,
      title: t('about.ecosystemMarketplace'),
      description: t('about.ecosystemMarketplaceDesc'),
    },
    {
      icon: Wallet,
      title: t('about.ecosystemInvestment'),
      description: t('about.ecosystemInvestmentDesc'),
    },
    {
      icon: Cpu,
      title: t('about.ecosystemAI'),
      description: t('about.ecosystemAIDesc'),
    },
    {
      icon: Briefcase,
      title: t('about.ecosystemManagement'),
      description: t('about.ecosystemManagementDesc'),
    },
    {
      icon: Landmark,
      title: t('about.ecosystemLegal'),
      description: t('about.ecosystemLegalDesc'),
    },
    {
      icon: ShoppingBag,
      title: t('about.ecosystemVendor'),
      description: t('about.ecosystemVendorDesc'),
    },
  ];

  const investmentSteps = [
    { step: "1", title: t('about.stepConsultation'), desc: t('about.stepConsultationDesc') },
    { step: "2", title: t('about.stepLegal'), desc: t('about.stepLegalDesc') },
    { step: "3", title: t('about.stepSelection'), desc: t('about.stepSelectionDesc') },
    { step: "4", title: t('about.stepExecution'), desc: t('about.stepExecutionDesc') },
    { step: "5", title: t('about.stepManagement'), desc: t('about.stepManagementDesc') },
  ];

  const techLayers = [
    {
      title: t('about.techFrontEnd'),
      desc: t('about.techFrontEndDesc'),
      icon: Zap,
    },
    {
      title: t('about.techAI'),
      desc: t('about.techAIDesc'),
      icon: Cpu,
    },
    {
      title: t('about.techFuture'),
      desc: t('about.techFutureDesc'),
      icon: Rocket,
    },
  ];

  const roadmapPhases = [
    {
      phase: t('about.roadmapPhase1'),
      status: t('about.roadmapCurrent'),
      items: [
        t('about.roadmap1a'),
        t('about.roadmap1b'),
        t('about.roadmap1c'),
        t('about.roadmap1d'),
      ],
    },
    {
      phase: t('about.roadmapPhase2'),
      status: t('about.roadmapNext'),
      items: [
        t('about.roadmap2a'),
        t('about.roadmap2b'),
        t('about.roadmap2c'),
        t('about.roadmap2d'),
      ],
    },
    {
      phase: t('about.roadmapPhase3'),
      status: t('about.roadmapFuture'),
      items: [
        t('about.roadmap3a'),
        t('about.roadmap3b'),
        t('about.roadmap3c'),
        t('about.roadmap3d'),
      ],
    },
  ];

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
        title={t('seo.about.title')}
        description={t('seo.about.description')}
        keywords="tentang astra villa, platform properti indonesia, real estate premium, ai property ecosystem"
      />
      {isAuthenticated && (
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={toggleLanguage}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}

      <div className={`${isAuthenticated ? 'pt-16' : 'pt-8'} px-3 sm:px-4 md:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto py-6 sm:py-8 md:py-12">
          {/* Hero */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-primary/10 border border-gold-primary/20 mb-4">
              <Sparkles className="h-4 w-4 text-gold-primary" />
              <span className="text-sm font-medium text-gold-primary">{t('about.badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              {t('about.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Vision */}
          <Card className="border-gold-primary/20 hover:border-gold-primary/40 transition-all duration-300 mb-8 sm:mb-12 md:mb-16 bg-gradient-to-br from-card to-card/50">
            <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 text-center">
              <Globe className="h-8 w-8 text-gold-primary mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t('about.vision')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-base sm:text-lg">
                {t('about.visionText')}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6">
                {[
                  t('about.visionTag1'),
                  t('about.visionTag2'),
                  t('about.visionTag3'),
                  t('about.visionTag4'),
                  t('about.visionTag5'),
                  t('about.visionTag6'),
                  t('about.visionTag7'),
                ].map((tag, i) => (
                  <Badge key={i} variant="outline" className="border-gold-primary/30 text-gold-primary/80 bg-gold-primary/5">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ecosystem Pillars */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 text-center">
              {t('about.ecosystemTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {ecosystemPillars.map((pillar, index) => {
                const IconComponent = pillar.icon;
                return (
                  <Card key={index} className="border-gold-primary/10 hover:border-gold-primary/30 hover:-translate-y-1 transition-all duration-300">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-gold-primary/20 to-gold-primary/5 rounded-full flex items-center justify-center mb-4 border border-gold-primary/20">
                        <IconComponent className="h-6 w-6 text-gold-primary" />
                      </div>
                      <CardTitle className="text-lg text-center">{pillar.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center">
                        {pillar.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* A-Z Investment Support */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 text-center">
              {t('about.investmentSupportTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {investmentSteps.map((item, index) => (
                <Card key={index} className="border-gold-primary/10 hover:border-gold-primary/30 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-primary/60 to-gold-primary/20" />
                  <CardContent className="pt-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-gold-primary font-bold text-sm">{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Platform */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 text-center">
              {t('about.techTitle')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {techLayers.map((layer, index) => {
                const IconComponent = layer.icon;
                return (
                  <Card key={index} className="border-gold-primary/10 hover:border-gold-primary/30 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gold-primary" />
                        </div>
                        <CardTitle className="text-base">{layer.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{layer.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Technology Roadmap */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 text-center">
              {t('about.roadmapTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {roadmapPhases.map((phase, index) => (
                <Card key={index} className="border-gold-primary/10 hover:border-gold-primary/30 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{phase.phase}</CardTitle>
                      <Badge variant="outline" className={`text-xs ${
                        index === 0 ? 'border-green-500/30 text-green-600 bg-green-500/5' :
                        index === 1 ? 'border-gold-primary/30 text-gold-primary bg-gold-primary/5' :
                        'border-muted text-muted-foreground bg-muted/5'
                      }`}>
                        {phase.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold-primary/60 mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 text-center">
              {t('about.stats')}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {statsItems.map((stat, index) => (
                <Card key={index} className="text-center border-gold-primary/10 hover:border-gold-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold bg-gradient-to-r from-gold-primary to-gold-primary/70 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 text-center">
              {t('about.values')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {valuesItems.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center border-gold-primary/10 hover:border-gold-primary/30 hover:-translate-y-1 transition-all duration-300">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-gold-primary/20 to-gold-primary/5 rounded-full flex items-center justify-center mb-4 border border-gold-primary/20">
                        <IconComponent className="h-6 w-6 text-gold-primary" />
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

          {/* Expansion */}
          <Card className="border-gold-primary/20 hover:border-gold-primary/40 transition-all duration-300 mb-8 sm:mb-12 md:mb-16">
            <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 text-center">
              <MapPin className="h-8 w-8 text-gold-primary mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t('about.expansionTitle')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-base sm:text-lg">
                {t('about.expansionText')}
              </p>
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="border-gold-primary/20 hover:border-gold-primary/40 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <div className="p-2 bg-gold-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-gold-primary" />
                </div>
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

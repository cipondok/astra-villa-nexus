import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { 
  TrendingUp, Users, Award, Headphones, Zap,
  DollarSign, Shield, Rocket, Target, BookOpen
} from "lucide-react";

interface PartnerBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PartnerBenefitsModal = ({ isOpen, onClose }: PartnerBenefitsModalProps) => {
  const { t } = useTranslation();

  const benefits = [
    { icon: DollarSign, titleKey: 'revenueSharing', descKey: 'revenueSharingDesc', categoryKey: 'financial', color: "text-chart-1" },
    { icon: Users, titleKey: 'leadGeneration', descKey: 'leadGenerationDesc', categoryKey: 'businessGrowth', color: "text-primary" },
    { icon: BookOpen, titleKey: 'trainingEducation', descKey: 'trainingEducationDesc', categoryKey: 'professionalDev', color: "text-accent" },
    { icon: Zap, titleKey: 'technologyAccess', descKey: 'technologyAccessDesc', categoryKey: 'technology', color: "text-gold-primary" },
    { icon: Shield, titleKey: 'legalSupport', descKey: 'legalSupportDesc', categoryKey: 'support', color: "text-destructive" },
    { icon: Target, titleKey: 'marketingSupport', descKey: 'marketingSupportDesc', categoryKey: 'marketing', color: "text-chart-3" },
    { icon: Award, titleKey: 'recognitionProgram', descKey: 'recognitionProgramDesc', categoryKey: 'recognition', color: "text-chart-4" },
    { icon: Headphones, titleKey: 'support247', descKey: 'support247Desc', categoryKey: 'support', color: "text-chart-5" },
  ];

  const tiers = [
    { nameKey: 'bronzePartner', requirements: "5+ successful referrals", benefits: ["Basic commission rates", "Access to training materials", "Monthly newsletter"], color: "bg-chart-5/10 text-chart-5" },
    { nameKey: 'silverPartner', requirements: "15+ successful referrals", benefits: ["Higher commission rates", "Priority lead assignment", "Quarterly business reviews"], color: "bg-muted text-muted-foreground" },
    { nameKey: 'goldPartner', requirements: "30+ successful referrals", benefits: ["Premium commission rates", "Dedicated account manager", "Exclusive events access"], color: "bg-chart-3/10 text-chart-3" },
    { nameKey: 'platinumPartner', requirements: "50+ successful referrals", benefits: ["Maximum commission rates", "Strategic partnership opportunities", "Board advisory positions"], color: "bg-accent/10 text-accent" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>{t('partnerBenefits.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('partnerBenefits.partnershipBenefits')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-5 w-5 ${benefit.color}`} />
                        <Badge variant="secondary" className="text-xs">
                          {t(`partnerBenefits.${benefit.categoryKey}`)}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm">{t(`partnerBenefits.${benefit.titleKey}`)}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs">
                        {t(`partnerBenefits.${benefit.descKey}`)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('partnerBenefits.partnershipTiers')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <Badge className={`w-fit ${tier.color} mb-2`}>
                      {t(`partnerBenefits.${tier.nameKey}`)}
                    </Badge>
                    <CardTitle className="text-sm">{tier.requirements}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-xs text-muted-foreground flex items-center">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">{t('partnerBenefits.partnerSuccessStats')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">{t('partnerBenefits.activePartners')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-1">$2.5M+</div>
                <div className="text-sm text-muted-foreground">{t('partnerBenefits.partnerEarnings')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">95%</div>
                <div className="text-sm text-muted-foreground">{t('partnerBenefits.satisfactionRate')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">24/7</div>
                <div className="text-sm text-muted-foreground">{t('partnerBenefits.supportAvailable')}</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('partnerBenefits.close')}
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Rocket className="h-4 w-4 mr-2" />
              {t('partnerBenefits.startPartnership')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerBenefitsModal;

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Award, 
  Percent, 
  Handshake, 
  BookOpen, 
  Headphones, 
  Zap,
  DollarSign,
  Shield,
  Rocket,
  Target
} from "lucide-react";

interface PartnerBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PartnerBenefitsModal = ({ isOpen, onClose }: PartnerBenefitsModalProps) => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Revenue Sharing",
      description: "Earn up to 40% commission on successful referrals and closed deals",
      category: "Financial",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Lead Generation",
      description: "Access to our extensive client database and marketing channels",
      category: "Business Growth",
      color: "text-blue-500"
    },
    {
      icon: BookOpen,
      title: "Training & Education",
      description: "Free access to industry training programs and certification courses",
      category: "Professional Development",
      color: "text-purple-500"
    },
    {
      icon: Zap,
      title: "Technology Access",
      description: "Use our advanced CRM, marketing tools, and property management software",
      category: "Technology",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Legal Support",
      description: "Access to legal consultation and document templates",
      category: "Support",
      color: "text-red-500"
    },
    {
      icon: Target,
      title: "Marketing Support",
      description: "Co-branded marketing materials and digital marketing campaigns",
      category: "Marketing",
      color: "text-orange-500"
    },
    {
      icon: Award,
      title: "Recognition Program",
      description: "Performance-based awards and public recognition opportunities",
      category: "Recognition",
      color: "text-indigo-500"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock technical and business support",
      category: "Support",
      color: "text-pink-500"
    }
  ];

  const tiers = [
    {
      name: "Bronze Partner",
      requirements: "5+ successful referrals",
      benefits: ["Basic commission rates", "Access to training materials", "Monthly newsletter"],
      color: "bg-orange-100 text-orange-800"
    },
    {
      name: "Silver Partner",
      requirements: "15+ successful referrals",
      benefits: ["Higher commission rates", "Priority lead assignment", "Quarterly business reviews"],
      color: "bg-gray-100 text-gray-800"
    },
    {
      name: "Gold Partner",
      requirements: "30+ successful referrals",
      benefits: ["Premium commission rates", "Dedicated account manager", "Exclusive events access"],
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      name: "Platinum Partner",
      requirements: "50+ successful referrals",
      benefits: ["Maximum commission rates", "Strategic partnership opportunities", "Board advisory positions"],
      color: "bg-purple-100 text-purple-800"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Partner Benefits & Rewards</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Partnership Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-5 w-5 ${benefit.color}`} />
                        <Badge variant="secondary" className="text-xs">
                          {benefit.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs">
                        {benefit.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Partnership Tiers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Partnership Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <Badge className={`w-fit ${tier.color} mb-2`}>
                      {tier.name}
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

          {/* Success Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Partner Success Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-muted-foreground">Active Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$2.5M+</div>
                <div className="text-sm text-muted-foreground">Partner Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-muted-foreground">Support Available</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Rocket className="h-4 w-4 mr-2" />
              Start Partnership Journey
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerBenefitsModal;
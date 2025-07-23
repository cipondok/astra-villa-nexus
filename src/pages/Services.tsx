import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Users, Star, Clock, Shield } from 'lucide-react';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import { useAuth } from '@/contexts/AuthContext';
import AgentTools from '@/components/agent/AgentTools';

const Services = () => {
  const { profile } = useAuth();

  // If user is an agent, show agent tools instead of general services
  if (profile?.role === 'agent') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Agent Tools & Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access your professional real estate tools and manage your property listings, clients, and business operations.
            </p>
          </div>
          <AgentTools />
        </div>
        <ProfessionalFooter language="en" />
      </div>
    );
  }
  const serviceCategories = [
    {
      title: "Property Management",
      description: "Comprehensive property management solutions",
      services: [
        { name: "Property Maintenance", price: "Starting from IDR 500,000", popular: true },
        { name: "Tenant Screening", price: "IDR 300,000 per screening", popular: false },
        { name: "Rent Collection", price: "2% of monthly rent", popular: true },
        { name: "Property Inspections", price: "IDR 250,000 per inspection", popular: false }
      ],
      icon: Shield,
      color: "bg-emerald-500"
    },
    {
      title: "Cleaning Services",
      description: "Professional cleaning for all property types",
      services: [
        { name: "Deep Cleaning", price: "IDR 150,000 per room", popular: true },
        { name: "Regular Maintenance", price: "IDR 1,200,000 monthly", popular: true },
        { name: "Post-Construction Cleanup", price: "IDR 25,000 per sqm", popular: false },
        { name: "Move-in/Move-out Cleaning", price: "IDR 800,000 per unit", popular: false }
      ],
      icon: CheckCircle,
      color: "bg-blue-500"
    },
    {
      title: "Renovation & Repairs",
      description: "Expert renovation and maintenance services",
      services: [
        { name: "Kitchen Renovation", price: "IDR 50,000,000+", popular: true },
        { name: "Bathroom Renovation", price: "IDR 25,000,000+", popular: true },
        { name: "Electrical Work", price: "IDR 500,000 per hour", popular: false },
        { name: "Plumbing Services", price: "IDR 400,000 per hour", popular: false }
      ],
      icon: Users,
      color: "bg-orange-500"
    },
    {
      title: "Security Services",
      description: "24/7 security and monitoring solutions",
      services: [
        { name: "Security Guards", price: "IDR 3,500,000 monthly", popular: true },
        { name: "CCTV Installation", price: "IDR 2,000,000 per camera", popular: false },
        { name: "Access Control Systems", price: "IDR 15,000,000+", popular: false },
        { name: "Security Consultation", price: "IDR 1,000,000 per visit", popular: false }
      ],
      icon: Clock,
      color: "bg-purple-500"
    }
  ];

  const features = [
    { icon: CheckCircle, title: "Verified Vendors", description: "All service providers are thoroughly vetted and verified" },
    { icon: Star, title: "Quality Guarantee", description: "100% satisfaction guarantee on all services" },
    { icon: Shield, title: "Insured Services", description: "All services covered by comprehensive insurance" },
    { icon: Clock, title: "24/7 Support", description: "Round-the-clock customer support available" }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Professional Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with verified professionals for all your property needs. From maintenance to renovations, we have trusted experts ready to help.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {serviceCategories.map((category, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{service.name}</h4>
                            {service.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{service.price}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Need a Custom Service?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Contact us and we'll connect you with the right professional for your specific needs.
            </p>
            <Button size="lg" className="mr-4">
              Request Custom Service
            </Button>
            <Button variant="outline" size="lg">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter language="en" />
    </div>
  );
};

export default Services;
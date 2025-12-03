import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Palette, Wrench, Globe, Users, CheckCircle2, 
  ArrowRight, Sparkles, Home, Lightbulb, TreePine, Cpu,
  Eye, Headphones, Award, Handshake, Mail, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import DeveloperPartnerModal from '@/components/development/DeveloperPartnerModal';

const AstraDevelopment = () => {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  const buildServices = [
    {
      icon: Building2,
      title: "Architectural & Structural Development",
      color: "from-blue-500 to-cyan-500",
      items: [
        "Full villa planning & blueprint creation",
        "Structural engineering following international standards",
        "Modern façade and luxury layout concepts",
        "3D modeling & structural simulation"
      ]
    },
    {
      icon: Palette,
      title: "Interior & Landscape Design",
      color: "from-purple-500 to-pink-500",
      items: [
        "Premium interior styling",
        "Custom material selection",
        "Furniture layout & space optimization",
        "Luxury lighting concepts",
        "Tropical garden & pool landscape design"
      ]
    },
    {
      icon: Wrench,
      title: "Smart & Technical Integration",
      color: "from-amber-500 to-orange-500",
      items: [
        "Smart home systems (IoT, voice AI, automation)",
        "High-performance materials and eco-friendly solutions",
        "Electrical, plumbing & safety system planning"
      ]
    },
    {
      icon: Globe,
      title: "Virtual Experience & Technology",
      color: "from-emerald-500 to-teal-500",
      items: [
        "Interactive 3D villa viewer",
        "Three.js virtual tours",
        "VR / AR walk-through support",
        "AI voice assistant for guided tours"
      ]
    }
  ];

  const partnerTypes = [
    "Architects",
    "Civil engineers", 
    "Interior designers",
    "3D artists & render specialists",
    "Construction contractors",
    "Landscape designers",
    "Smart-home technicians",
    "Material suppliers"
  ];

  const benefits = [
    { icon: Users, text: "Access to premium clients and high-end villa projects" },
    { icon: Eye, text: "Exposure on our official website" },
    { icon: Handshake, text: "Collaboration with top-tier designers & engineers" },
    { icon: Cpu, text: "Opportunity to work with advanced AI & 3D visualization systems" },
    { icon: Award, text: "Long-term partnership and project growth" }
  ];

  const focusAreas = [
    { icon: Home, text: "High-end architectural design" },
    { icon: Cpu, text: "Smart home integration & eco-friendly engineering" },
    { icon: Eye, text: "3D visualization & interactive virtual tours" },
    { icon: Palette, text: "Interior design curation (minimalist, luxury, modern tropical)" },
    { icon: Building2, text: "End-to-end villa development & project management" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-3 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-3 px-3 py-1 text-xs bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Developer & Partner Program
            </Badge>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              ✨ ASTRA Villa Development
            </h1>
            
            <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto">
              Crafting premium living spaces designed with precision, innovation, and world-class design standards.
              From architectural planning to full-scale construction, we build properties that combine luxury, smart technology, and modern aesthetics.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                onClick={() => setIsPartnerModalOpen(true)}
              >
                <Handshake className="h-4 w-4 mr-1.5" />
                Become a Partner
              </Button>
              <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/5">
                <Eye className="h-4 w-4 mr-1.5" />
                View Projects
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-6">
              <h2 className="text-lg md:text-2xl font-bold mb-2">About Our Development Excellence</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Our mission: To create elegant homes that redefine modern living in Indonesia and beyond.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {focusAreas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full bg-background/50 backdrop-blur-sm border-border/40 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-3 flex items-start gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                        <area.icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{area.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Build Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-3">
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-2xl font-bold mb-2">What We Build</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Comprehensive development services for luxury properties</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto">
            {buildServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-gradient-to-br from-background to-muted/30 border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${service.color} shadow-lg`}>
                        <service.icon className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-sm font-semibold">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <ul className="space-y-1.5">
                      {service.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Program Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-3">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <Badge className="mb-2 px-3 py-1 text-xs bg-accent/10 text-accent-foreground border-accent/20">
                <Users className="h-3 w-3 mr-1" />
                Partnership Opportunity
              </Badge>
              <h2 className="text-lg md:text-2xl font-bold mb-2">Become an ASTRA Villa Developer Partner</h2>
              <p className="text-xs md:text-sm text-muted-foreground">We welcome skilled professionals and companies to join our development ecosystem</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Who Can Join */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-background/60 backdrop-blur-sm border-border/40">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Handshake className="h-4 w-4 text-primary" />
                      Who Can Join
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-2 gap-1.5">
                      {partnerTypes.map((type, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="text-xs">{type}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-background/60 backdrop-blur-sm border-border/40">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      Benefits of Partnering
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <ul className="space-y-2">
                      {benefits.map((benefit, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="p-1 rounded bg-primary/10 shrink-0">
                            <benefit.icon className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground">{benefit.text}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 text-center"
            >
              <Card className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/20 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="text-center sm:text-left">
                    <h3 className="text-sm md:text-base font-semibold mb-1">📩 Become a Partner Today</h3>
                    <p className="text-xs text-muted-foreground">Let's build the next generation of luxury living — together.</p>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                    onClick={() => setIsPartnerModalOpen(true)}
                  >
                    <Mail className="h-4 w-4 mr-1.5" />
                    Apply Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <ProfessionalFooter language="en" />
      
      <DeveloperPartnerModal
        isOpen={isPartnerModalOpen} 
        onClose={() => setIsPartnerModalOpen(false)} 
      />
    </div>
  );
};

export default AstraDevelopment;

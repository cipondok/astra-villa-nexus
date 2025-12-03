import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Palette, Wrench, Globe, Users, CheckCircle2, 
  ArrowRight, Sparkles, Home, Lightbulb, TreePine, Cpu,
  Eye, Headphones, Award, Handshake, Mail, ChevronRight,
  MapPin, Calendar, TrendingUp, Play, ExternalLink, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import DeveloperPartnerModal from '@/components/development/DeveloperPartnerModal';

// Import project images
import baliVillaImg from '@/assets/development/bali-villa-project.jpg';
import jakartaPenthouseImg from '@/assets/development/jakarta-penthouse-project.jpg';
import lombokBeachImg from '@/assets/development/lombok-beach-villa.jpg';
import ubudEcoImg from '@/assets/development/ubud-eco-villa.jpg';

const AstraDevelopment = () => {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Demo Projects in Indonesia
  const demoProjects = [
    {
      id: 1,
      title: "Canggu Sunset Villa",
      location: "Canggu, Bali",
      image: baliVillaImg,
      status: "Completed",
      progress: 100,
      price: "IDR 12.5 B",
      area: "850 m²",
      completion: "Dec 2024",
      features: ["Infinity Pool", "Rice Field View", "Smart Home", "4 Bedrooms"],
      description: "Luxury tropical villa with traditional Balinese elements and modern smart home integration.",
      category: "Luxury Villa"
    },
    {
      id: 2,
      title: "Sudirman Sky Penthouse",
      location: "SCBD, Jakarta",
      image: jakartaPenthouseImg,
      status: "In Progress",
      progress: 75,
      price: "IDR 28 B",
      area: "420 m²",
      completion: "Mar 2025",
      features: ["City View", "Private Elevator", "Rooftop Terrace", "Smart Security"],
      description: "Premium penthouse with panoramic Jakarta skyline views and contemporary luxury design.",
      category: "Penthouse"
    },
    {
      id: 3,
      title: "Senggigi Beach Resort",
      location: "Senggigi, Lombok",
      image: lombokBeachImg,
      status: "New Project",
      progress: 25,
      price: "IDR 8.5 B",
      area: "650 m²",
      completion: "Sep 2025",
      features: ["Beachfront", "Private Beach", "Ocean View", "3 Bedrooms"],
      description: "Beachfront villa with direct beach access and stunning ocean panorama.",
      category: "Beach Villa"
    },
    {
      id: 4,
      title: "Ubud Rainforest Retreat",
      location: "Ubud, Bali",
      image: ubudEcoImg,
      status: "In Progress",
      progress: 60,
      price: "IDR 9.8 B",
      area: "720 m²",
      completion: "Jun 2025",
      features: ["Eco-Friendly", "Jungle View", "Bamboo Design", "Yoga Pavilion"],
      description: "Sustainable eco-villa surrounded by pristine rainforest with bamboo architecture.",
      category: "Eco Villa"
    }
  ];

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

      {/* Demo Projects Showcase Section */}
      <section className="py-8 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
        
        <div className="container mx-auto px-3 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <Badge className="mb-2 px-3 py-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              <TrendingUp className="h-3 w-3 mr-1" />
              Featured Projects
            </Badge>
            <h2 className="text-lg md:text-2xl font-bold mb-2">Our Projects in Indonesia</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Discover our latest premium developments across Indonesia's most prestigious locations</p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {demoProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full overflow-hidden bg-background/60 backdrop-blur-sm border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500">
                  {/* Image Container */}
                  <div className="relative h-40 md:h-48 overflow-hidden">
                    <motion.img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 ${
                        project.status === 'Completed' 
                          ? 'bg-emerald-500/90 text-white' 
                          : project.status === 'New Project'
                          ? 'bg-blue-500/90 text-white animate-pulse'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      {project.status}
                    </Badge>

                    {/* Category Badge */}
                    <Badge className="absolute top-2 right-2 text-[10px] px-2 py-0.5 bg-black/50 text-white backdrop-blur-sm">
                      {project.category}
                    </Badge>

                    {/* Price & Location */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-bold text-sm mb-0.5 drop-shadow-lg">{project.title}</h3>
                      <div className="flex items-center gap-1 text-white/90 text-[10px]">
                        <MapPin className="h-3 w-3" />
                        <span>{project.location}</span>
                      </div>
                    </div>

                    {/* Play Button for Virtual Tour */}
                    <motion.button
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="h-5 w-5 text-white fill-white" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-muted-foreground">Project Progress</span>
                        <span className="text-[10px] font-semibold text-primary">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} multiColor className="h-1.5" />
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.features.slice(0, 4).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] px-1.5 py-0.5 bg-muted/50">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Price</p>
                        <p className="text-xs font-bold text-primary">{project.price}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Area</p>
                        <p className="text-xs font-semibold">{project.area}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Completion</p>
                        <p className="text-xs font-semibold">{project.completion}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 h-7 text-[10px] bg-gradient-to-r from-primary to-primary/80">
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule Visit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View All Projects CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-6"
          >
            <Button variant="outline" className="border-primary/30 hover:bg-primary/5">
              View All Projects
              <ExternalLink className="h-4 w-4 ml-1.5" />
            </Button>
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Wrench, Paintbrush, Hammer, Zap, Droplets, Shield, TreePine } from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  vendorCount: number;
  bgColor: string;
  iconColor: string;
}

const services: Service[] = [
  {
    icon: <Hammer className="w-6 h-6" />,
    title: 'Construction Services',
    description: 'Professional builders & contractors',
    category: 'construction',
    vendorCount: 45,
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    icon: <Paintbrush className="w-6 h-6" />,
    title: 'Interior Design',
    description: 'Expert interior designers',
    category: 'interior',
    vendorCount: 32,
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: 'Renovation & Repair',
    description: 'Home renovation specialists',
    category: 'renovation',
    vendorCount: 38,
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Electrical Services',
    description: 'Licensed electricians',
    category: 'electrical',
    vendorCount: 28,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    icon: <Droplets className="w-6 h-6" />,
    title: 'Plumbing Services',
    description: 'Professional plumbers',
    category: 'plumbing',
    vendorCount: 25,
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    icon: <TreePine className="w-6 h-6" />,
    title: 'Landscaping',
    description: 'Garden & landscape experts',
    category: 'landscaping',
    vendorCount: 22,
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Security Systems',
    description: 'Home security installation',
    category: 'security',
    vendorCount: 18,
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  {
    icon: <Store className="w-6 h-6" />,
    title: 'Furniture & Fixtures',
    description: 'Quality furniture suppliers',
    category: 'furniture',
    vendorCount: 35,
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
];

const MarketplaceServices = () => {
  const navigate = useNavigate();

  const handleServiceClick = (category: string) => {
    // Navigate to marketplace with category filter
    navigate(`/marketplace?category=${category}`);
  };

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              Marketplace Services
            </h2>
            <p className="text-sm text-muted-foreground">
              Connect with trusted vendors for all your property needs
            </p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All →
          </button>
        </div>
      </div>

      {/* Services Grid - 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            service={service}
            onClick={() => handleServiceClick(service.category)}
          />
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 border border-primary/20 dark:border-primary/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground mb-1">
              Are you a service provider?
            </h3>
            <p className="text-sm text-muted-foreground">
              Join our marketplace and grow your business
            </p>
          </div>
          <button
            onClick={() => navigate('/vendor-registration')}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            Become a Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl bg-card border border-border p-5 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/30">
        {/* Icon Container */}
        <div className={`w-14 h-14 rounded-xl ${service.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <div className={service.iconColor}>
            {service.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {service.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {service.description}
          </p>
          
          {/* Vendor Count Badge */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 dark:bg-primary/20">
            <Store className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              {service.vendorCount}+ vendors
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceServices;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Wrench, Paintbrush, Hammer, Zap, Droplets, Shield, TreePine, Sparkles, LucideIcon } from 'lucide-react';

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  vendorCount: number;
  color: string;
  iconBg: string;
}

const services: Service[] = [
  {
    icon: Hammer,
    title: 'Construction',
    description: 'Professional builders & contractors',
    category: 'construction',
    vendorCount: 45,
    color: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50'
  },
  {
    icon: Paintbrush,
    title: 'Interior',
    description: 'Expert interior designers',
    category: 'interior',
    vendorCount: 32,
    color: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-pink-100 dark:bg-pink-900/50'
  },
  {
    icon: Wrench,
    title: 'Renovation',
    description: 'Home renovation specialists',
    category: 'renovation',
    vendorCount: 38,
    color: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50'
  },
  {
    icon: Zap,
    title: 'Electrical',
    description: 'Licensed electricians',
    category: 'electrical',
    vendorCount: 28,
    color: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/50'
  },
  {
    icon: Droplets,
    title: 'Plumbing',
    description: 'Professional plumbers',
    category: 'plumbing',
    vendorCount: 25,
    color: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/50'
  },
  {
    icon: TreePine,
    title: 'Landscape',
    description: 'Garden & landscape experts',
    category: 'landscaping',
    vendorCount: 22,
    color: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/50'
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Home security installation',
    category: 'security',
    vendorCount: 18,
    color: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/50'
  },
  {
    icon: Store,
    title: 'Furniture',
    description: 'Quality furniture suppliers',
    category: 'furniture',
    vendorCount: 35,
    color: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50'
  }
];

const MarketplaceServices = () => {
  const navigate = useNavigate();

  const handleServiceClick = (category: string) => {
    navigate(`/marketplace?category=${category}&from=home`);
  };

  return (
    <div className="rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3">
      {/* Section Header - Compact */}
      <div className="mb-2 sm:mb-2.5 md:mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
          <h2 className="text-[9px] sm:text-xs md:text-sm font-bold text-foreground">
            Marketplace Services
          </h2>
        </div>
        <button 
          onClick={() => navigate('/marketplace?from=home')} 
          className="text-[8px] sm:text-[10px] md:text-xs font-medium text-primary hover:text-primary/80 active:scale-95"
        >
          View All →
        </button>
      </div>

      {/* Services Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {services.map((service, index) => (
          <ServiceCard 
            key={index} 
            service={service} 
            onClick={() => handleServiceClick(service.category)} 
          />
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-2 md:mt-4 p-2 md:p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-[10px] md:text-base font-medium text-foreground">
              Service provider?
            </h3>
            <p className="text-[9px] md:text-xs text-muted-foreground">
              Join marketplace
            </p>
          </div>
          <button 
            onClick={() => navigate('/vendor-registration?from=home')} 
            className="px-2 py-1 md:px-4 md:py-2 text-[10px] md:text-sm bg-primary text-primary-foreground rounded active:scale-95 whitespace-nowrap font-medium"
          >
            Join
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
  const IconComponent = service.icon;
  
  return (
    <div onClick={onClick} className="group cursor-pointer relative">
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-transparent dark:bg-white/5 border border-border/20 dark:border-white/10 p-2 sm:p-2.5 md:p-3 h-full flex flex-col items-center text-center transition-all duration-300 hover:border-primary/40 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10">
        {/* Icon Container */}
        <div className="relative">
          <div className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl ${service.iconBg} shadow-sm`}>
            <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${service.color}`} strokeWidth={1.5} />
          </div>
          {/* Vendor Count Badge */}
          <div className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-md border-2 border-background">
            <span className="text-[6px] sm:text-[7px] md:text-[8px] font-bold text-primary-foreground">
              {service.vendorCount > 9 ? '9+' : service.vendorCount}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-1.5 sm:mt-2 text-[7px] sm:text-[9px] md:text-[11px] font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {service.title}
        </h3>
      </div>
    </div>
  );
};

export default MarketplaceServices;
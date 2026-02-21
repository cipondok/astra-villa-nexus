import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Wrench, Paintbrush, Hammer, Zap, Droplets, Shield, TreePine, Sparkles, LucideIcon } from 'lucide-react';

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  vendorCount: number;
}

const services: Service[] = [
  { icon: Hammer, title: 'Construction', description: 'Professional builders & contractors', category: 'construction', vendorCount: 45 },
  { icon: Paintbrush, title: 'Interior', description: 'Expert interior designers', category: 'interior', vendorCount: 32 },
  { icon: Wrench, title: 'Renovation', description: 'Home renovation specialists', category: 'renovation', vendorCount: 38 },
  { icon: Zap, title: 'Electrical', description: 'Licensed electricians', category: 'electrical', vendorCount: 28 },
  { icon: Droplets, title: 'Plumbing', description: 'Professional plumbers', category: 'plumbing', vendorCount: 25 },
  { icon: TreePine, title: 'Landscape', description: 'Garden & landscape experts', category: 'landscaping', vendorCount: 22 },
  { icon: Shield, title: 'Security', description: 'Home security installation', category: 'security', vendorCount: 18 },
  { icon: Store, title: 'Furniture', description: 'Quality furniture suppliers', category: 'furniture', vendorCount: 35 },
];

const MarketplaceServices = () => {
  const navigate = useNavigate();

  const handleServiceClick = (category: string) => {
    navigate(`/marketplace?category=${category}&from=home`);
  };

  return (
    <div className="rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3">
      {/* Section Header */}
      <div className="mb-2.5 sm:mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-px w-4 sm:w-6 bg-gradient-to-r from-transparent to-gold-primary/30" />
          <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gold-primary" />
          <h2 className="text-[9px] sm:text-xs md:text-sm font-bold text-foreground uppercase tracking-wider">
            Marketplace
          </h2>
          <div className="h-px w-4 sm:w-6 bg-gradient-to-l from-transparent to-gold-primary/30" />
        </div>
        <button 
          onClick={() => navigate('/marketplace?from=home')} 
          className="text-[8px] sm:text-[10px] md:text-xs font-medium text-gold-primary hover:text-gold-primary/80 active:scale-95 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 md:gap-2.5">
        {services.map((service, index) => (
          <ServiceCard 
            key={index} 
            service={service} 
            onClick={() => handleServiceClick(service.category)} 
          />
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-2.5 md:mt-4 p-2.5 md:p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 hover:border-gold-primary/20 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-[10px] md:text-sm font-semibold text-foreground">
              Service provider?
            </h3>
            <p className="text-[9px] md:text-xs text-muted-foreground">
              Join our marketplace
            </p>
          </div>
          <button 
            onClick={() => navigate('/vendor-registration?from=home')} 
            className="px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background rounded-lg active:scale-95 whitespace-nowrap font-semibold shadow-sm hover:shadow-md hover:shadow-gold-primary/20 transition-all"
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
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 hover:border-gold-primary/30 p-2 md:p-3 h-full flex flex-col items-center text-center transition-all duration-300 active:scale-95 md:hover:scale-[1.04] md:hover:shadow-lg md:hover:shadow-gold-primary/10">
        {/* Icon Container */}
        <div className="relative">
          <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl bg-primary-foreground/8">
            <IconComponent className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-primary-foreground/80 group-hover:text-gold-primary transition-colors duration-300" strokeWidth={1.5} />
          </div>
          {/* Vendor Count Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center bg-gradient-to-br from-gold-primary to-gold-primary/70 shadow-sm border-2 border-background">
            <span className="text-[6px] md:text-[7px] font-bold text-background">
              {service.vendorCount > 9 ? '9+' : service.vendorCount}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="hidden md:block mt-1.5 text-[9px] lg:text-[11px] font-semibold text-primary-foreground/60 leading-tight line-clamp-2 group-hover:text-gold-primary transition-colors duration-200">
          {service.title}
        </h3>
      </div>
    </div>
  );
};

export default MarketplaceServices;

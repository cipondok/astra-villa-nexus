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
const services: Service[] = [{
  icon: <Hammer className="w-6 h-6" />,
  title: 'Construction',
  description: 'Professional builders & contractors',
  category: 'construction',
  vendorCount: 45,
  bgColor: 'bg-orange-100/80 dark:bg-orange-950/40',
  iconColor: 'text-orange-600 dark:text-orange-400'
}, {
  icon: <Paintbrush className="w-6 h-6" />,
  title: 'Interior',
  description: 'Expert interior designers',
  category: 'interior',
  vendorCount: 32,
  bgColor: 'bg-pink-100/80 dark:bg-pink-950/40',
  iconColor: 'text-pink-600 dark:text-pink-400'
}, {
  icon: <Wrench className="w-6 h-6" />,
  title: 'Renovation',
  description: 'Home renovation specialists',
  category: 'renovation',
  vendorCount: 38,
  bgColor: 'bg-blue-100/80 dark:bg-blue-950/40',
  iconColor: 'text-blue-600 dark:text-blue-400'
}, {
  icon: <Zap className="w-6 h-6" />,
  title: 'Electrical',
  description: 'Licensed electricians',
  category: 'electrical',
  vendorCount: 28,
  bgColor: 'bg-yellow-100/80 dark:bg-yellow-950/40',
  iconColor: 'text-yellow-600 dark:text-yellow-400'
}, {
  icon: <Droplets className="w-6 h-6" />,
  title: 'Plumbing',
  description: 'Professional plumbers',
  category: 'plumbing',
  vendorCount: 25,
  bgColor: 'bg-cyan-100/80 dark:bg-cyan-950/40',
  iconColor: 'text-cyan-600 dark:text-cyan-400'
}, {
  icon: <TreePine className="w-6 h-6" />,
  title: 'Landscape',
  description: 'Garden & landscape experts',
  category: 'landscaping',
  vendorCount: 22,
  bgColor: 'bg-green-100/80 dark:bg-green-950/40',
  iconColor: 'text-green-600 dark:text-green-400'
}, {
  icon: <Shield className="w-6 h-6" />,
  title: 'Security',
  description: 'Home security installation',
  category: 'security',
  vendorCount: 18,
  bgColor: 'bg-red-100/80 dark:bg-red-950/40',
  iconColor: 'text-red-600 dark:text-red-400'
}, {
  icon: <Store className="w-6 h-6" />,
  title: 'Furniture',
  description: 'Quality furniture suppliers',
  category: 'furniture',
  vendorCount: 35,
  bgColor: 'bg-purple-100/80 dark:bg-purple-950/40',
  iconColor: 'text-purple-600 dark:text-purple-400'
}];
const MarketplaceServices = () => {
  const navigate = useNavigate();
  const handleServiceClick = (category: string) => {
    navigate(`/marketplace?category=${category}`);
  };
  return <div className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-1 md:mb-4">
        <h2 className="text-[9px] md:text-base font-semibold text-foreground">
          Marketplace Services
        </h2>
        <button onClick={() => navigate('/marketplace')} className="text-[7px] md:text-xs font-medium text-primary hover:text-primary/80 active:scale-95">
          View All →
        </button>
      </div>

      {/* Services Grid - 4 columns mobile, 4 on desktop */}
      <div className="grid grid-cols-4 gap-1 md:gap-3">
        {services.map((service, index) => <ServiceCard key={index} service={service} onClick={() => handleServiceClick(service.category)} />)}
      </div>

      {/* CTA Banner */}
      <div className="mt-1.5 md:mt-4 p-1.5 md:p-4 rounded bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center justify-between gap-1">
          <div>
            <h3 className="text-[7px] md:text-base font-medium text-foreground">
              Service provider?
            </h3>
            <p className="text-[6px] md:text-xs text-muted-foreground">
              Join marketplace
            </p>
          </div>
          <button onClick={() => navigate('/vendor-registration')} className="px-1.5 py-0.5 md:px-4 md:py-2 text-[6px] md:text-sm bg-primary text-primary-foreground rounded font-medium active:scale-95 whitespace-nowrap">
            Join
          </button>
        </div>
      </div>
    </div>;
};
interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}
const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onClick
}) => {
  return <div onClick={onClick} className="group cursor-pointer active:scale-95 transition-transform">
      <div className="relative overflow-hidden rounded bg-card border border-border/40 p-1 md:p-3 h-full flex flex-col items-center text-center hover:border-primary/30">
        {/* Icon - Big */}
        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg ${service.bgColor} flex items-center justify-center mb-0.5 md:mb-2`}>
          <div className={service.iconColor}>
            {React.cloneElement(service.icon as React.ReactElement, {
            className: 'w-4 h-4 md:w-6 md:h-6'
          })}
          </div>
        </div>

        {/* Title - Small */}
        <h3 className="md:text-xs font-medium text-foreground leading-none text-center text-xs">
          {service.title}
        </h3>
        
        {/* Vendor Count - Desktop only */}
        <div className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 mt-1">
          <Store className="w-2.5 h-2.5 text-primary" />
          <span className="text-[10px] font-medium text-primary">
            {service.vendorCount}+
          </span>
        </div>
      </div>
    </div>;
};
export default MarketplaceServices;
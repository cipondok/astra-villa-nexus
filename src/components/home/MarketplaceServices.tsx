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
    navigate(`/marketplace?category=${category}&from=home`);
  };
  
  return <div id="marketplace-services-section" className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-1.5 md:mb-4">
        <h2 className="text-xs md:text-base font-semibold text-foreground">
          Marketplace Services
        </h2>
        <button onClick={() => navigate('/marketplace?from=home')} className="text-[10px] md:text-xs font-medium text-primary hover:text-primary/80 active:scale-95">
          View All →
        </button>
      </div>

      {/* Services Grid - 4 columns mobile, 4 on desktop */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-3">
        {services.map((service, index) => <ServiceCard key={index} service={service} onClick={() => handleServiceClick(service.category)} />)}
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
          <button onClick={() => navigate('/vendor-registration?from=home')} className="px-2 py-1 md:px-4 md:py-2 text-[10px] md:text-sm bg-primary text-primary-foreground rounded active:scale-95 whitespace-nowrap font-medium">
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
  return (
    <div onClick={onClick} className="group cursor-pointer relative active:scale-95 transition-transform">
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 border border-primary/20 dark:border-primary/30 p-2 sm:p-2 md:p-2.5 h-full flex flex-col items-center text-center transition-all duration-300 hover:from-primary/10 hover:via-primary/15 hover:to-primary/10 dark:hover:from-primary/15 dark:hover:via-primary/20 dark:hover:to-primary/15 hover:scale-[1.03] hover:shadow-md hover:shadow-primary/10">
        {/* Icon Container - Clean white background */}
        <div className="relative">
          <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl bg-white dark:bg-white shadow-sm border border-primary/10 flex items-center justify-center">
            <div className="text-primary">
              {React.cloneElement(service.icon as React.ReactElement, {
                className: 'w-7 h-7 sm:w-6 sm:h-6 md:w-6 md:h-6'
              })}
            </div>
          </div>
          {/* Vendor Count Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-sm border-2 border-white dark:border-white">
            <span className="text-[6px] sm:text-[5px] md:text-[6px] font-bold text-white">{service.vendorCount > 9 ? '9+' : service.vendorCount}</span>
          </div>
        </div>

        {/* Title - Hidden on mobile, visible on tablet+ */}
        <h3 className="hidden sm:block mt-1 text-[8px] md:text-[10px] font-semibold text-primary/80 dark:text-primary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {service.title}
        </h3>
      </div>
      
      {/* Mobile Tooltip - Shows on hover/touch */}
      <div className="sm:hidden absolute left-1/2 -translate-x-1/2 -bottom-8 z-50 opacity-0 group-hover:opacity-100 group-active:opacity-100 pointer-events-none transition-opacity duration-200">
        <div className="bg-primary text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
          {service.title}
        </div>
      </div>
    </div>
  );
};
export default MarketplaceServices;
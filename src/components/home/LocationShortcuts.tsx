import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationShortcutsProps {
  language?: 'en' | 'id';
}

const LocationShortcuts = ({ language = 'id' }: LocationShortcutsProps) => {
  const navigate = useNavigate();

  const locations = [
    { name: 'Jakarta', query: 'Jakarta', properties: '15K+' },
    { name: 'Bandung', query: 'Bandung', properties: '8K+' },
    { name: 'Surabaya', query: 'Surabaya', properties: '6K+' },
    { name: 'Bali', query: 'Bali', properties: '5K+' },
    { name: 'Tangerang', query: 'Tangerang', properties: '10K+' },
    { name: 'Bekasi', query: 'Bekasi', properties: '7K+' },
    { name: 'Depok', query: 'Depok', properties: '4K+' },
    { name: 'Bogor', query: 'Bogor', properties: '5K+' },
  ];

  const handleLocationClick = (query: string) => {
    navigate(`/search?location=${query}`);
  };

  return (
    <section className="w-full py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
            {language === 'id' ? 'Cari Berdasarkan Lokasi' : 'Search by Location'}
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {locations.map((location) => (
            <button
              key={location.query}
              onClick={() => handleLocationClick(location.query)}
              className={cn(
                "inline-flex items-center gap-1.5 sm:gap-2",
                "px-3 py-1.5 sm:px-4 sm:py-2",
                "bg-card border border-border/60 rounded-full",
                "text-xs sm:text-sm font-medium text-foreground/80",
                "transition-all duration-200",
                "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                "hover:shadow-md hover:scale-105",
                "active:scale-95"
              )}
            >
              <span>{location.name}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-primary-foreground/70">
                {location.properties}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationShortcuts;

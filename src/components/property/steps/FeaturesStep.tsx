import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePropertyFeatures, getDefaultFeaturesForPropertyType } from "@/hooks/usePropertyFeatures";
import { Loader2 } from "lucide-react";
import {
  Wifi,
  Car,
  Dumbbell,
  Trees,
  Wind,
  ShieldCheck,
  Camera,
  Home,
  Waves,
  School,
  Building,
  ShoppingBag,
  Bus,
  Plane,
  UtensilsCrossed,
  PawPrint,
  Armchair,
  Zap,
  Sun,
  Hammer,
  Hospital,
  Globe
} from "lucide-react";

interface FeaturesStepProps {
  features: any;
  listingType: 'sale' | 'rent' | 'lease';
  propertyType: string;
  onUpdate: (feature: string, value: boolean) => void;
}

const FeaturesStep = ({ features, listingType, propertyType, onUpdate }: FeaturesStepProps) => {
  const { language } = useLanguage();
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Fetch features from database
  const { data, isLoading, error } = usePropertyFeatures(listingType);

  // Auto-select features when property type is first selected
  useEffect(() => {
    if (propertyType && !hasAutoSelected && data?.features) {
      const defaultFeatures = getDefaultFeaturesForPropertyType(propertyType, listingType, data.features);
      defaultFeatures.forEach(featureKey => {
        // Only auto-select if not already set
        if (features[featureKey] === undefined || features[featureKey] === false) {
          onUpdate(featureKey, true);
        }
      });
      setHasAutoSelected(true);
    }
  }, [propertyType, listingType, data?.features, hasAutoSelected]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const t = {
    en: {
      title: "Property Features",
      subtitle: "Select features that apply to your property",
      basic: "Basic Features",
      amenity: "Amenities",
      security: "Security",
      environment: "Location & Environment",
      accessibility: "Accessibility",
      forType: "Available for",
      loading: "Loading features...",
      error: "Failed to load features"
    },
    id: {
      title: "Fitur Properti",
      subtitle: "Pilih fitur yang sesuai dengan properti Anda",
      basic: "Fitur Dasar",
      amenity: "Fasilitas",
      security: "Keamanan",
      environment: "Lokasi & Lingkungan",
      accessibility: "Aksesibilitas",
      forType: "Tersedia untuk",
      loading: "Memuat fitur...",
      error: "Gagal memuat fitur"
    }
  }[language];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t.loading}</span>
      </div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>{t.error}</p>
      </div>
    );
  }

  const groupedFeatures = data.grouped;

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      '❄️': Wind,
      '📶': Wifi,
      '🚗': Car,
      '🏊': Waves,
      '💪': Dumbbell,
      '🌳': Trees,
      '🏠': Home,
      '🛡️': ShieldCheck,
      '📹': Camera,
      '🛗': Building,
      '🐕': PawPrint,
      '🛋️': Armchair,
      '🪑': Armchair,
      '💡': Zap,
      '🌐': Globe,
      '🧹': UtensilsCrossed,
      '🏗️': Building,
      '🔨': Hammer,
      '☀️': Sun,
      '🏫': School,
      '🏥': Hospital,
      '🛍️': ShoppingBag,
      '🚇': Bus,
      '✈️': Plane,
      '🏖️': Waves,
      '🏙️': Building
    };
    return iconMap[iconName] || Home;
  };

  const categoryOrder: Array<keyof typeof groupedFeatures> = [
    'basic',
    'amenity',
    'security',
    'environment',
    'accessibility'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        <Badge variant="outline" className="mt-2">
          {t.forType}: {listingType === 'sale' ? (language === 'en' ? 'For Sale' : 'Dijual') : 
                         listingType === 'rent' ? (language === 'en' ? 'For Rent' : 'Disewakan') :
                         (language === 'en' ? 'For Lease' : 'Disewa Jangka Panjang')}
        </Badge>
      </div>

      {categoryOrder.map((category) => {
        const categoryFeatures = groupedFeatures[category];
        if (!categoryFeatures || categoryFeatures.length === 0) return null;
        
        const isExpanded = expandedCategories[category];
        const selectedCount = categoryFeatures.filter(f => features[f.key]).length;

        return (
          <div key={category} className="space-y-2 border rounded-lg p-3 bg-card">
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between text-left hover:opacity-70 transition-opacity"
            >
              <h4 className="text-sm font-semibold text-primary">
                {t[category as keyof typeof t] as string}
              </h4>
              <div className="flex items-center gap-2">
                {selectedCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {selectedCount}
                  </span>
                )}
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {isExpanded && (
              <div className="flex flex-wrap gap-1.5 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {categoryFeatures.map((feature) => {
                  const Icon = getIcon(feature.icon);
                  const label = language === 'en' ? feature.labelEn : feature.labelId;
                  const isChecked = features[feature.key] || false;

                  return (
                    <button
                      key={feature.key}
                      type="button"
                      onClick={() => onUpdate(feature.key, !isChecked)}
                      className={`flex items-center gap-1.5 px-2.5 h-7 rounded-md border text-xs font-medium transition-all active:scale-95 ${
                        isChecked
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-background hover:bg-accent hover:border-primary'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeaturesStep;

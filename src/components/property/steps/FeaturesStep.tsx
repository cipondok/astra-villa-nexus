import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeaturesByListingType } from "@/config/propertyFilters";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  Wifi,
  Car,
  Dumbbell,
  Trees,
  Wind,
  ShieldCheck,
  Camera,
  DoorOpen,
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

// Auto-select features based on property type
const getDefaultFeaturesByPropertyType = (propertyType: string, listingType: 'sale' | 'rent' | 'lease'): string[] => {
  const defaults: Record<string, string[]> = {
    apartment: ['airconditioner', 'elevator', 'security', 'cctv', 'parking', 'nearpublictransport'],
    condo: ['airconditioner', 'elevator', 'security', 'cctv', 'parking', 'swimmingpool', 'gym'],
    villa: ['airconditioner', 'parking', 'garden', 'swimmingpool', 'security'],
    house: ['airconditioner', 'parking', 'garden'],
    townhouse: ['airconditioner', 'parking', 'security'],
    penthouse: ['airconditioner', 'elevator', 'balcony', 'security', 'cctv', 'parking'],
    studio: ['airconditioner', 'wifi'],
    duplex: ['airconditioner', 'parking'],
    hotel: ['airconditioner', 'wifi', 'elevator', 'security', 'cctv', 'swimmingpool', 'gym'],
    resort: ['airconditioner', 'wifi', 'swimmingpool', 'gym', 'security', 'beachaccess'],
    office: ['airconditioner', 'elevator', 'security', 'cctv', 'parking', 'wifi'],
    virtual_office: ['wifi', 'security'],
    warehouse: ['security', 'cctv', 'parking'],
    retail: ['airconditioner', 'security', 'cctv', 'nearmall', 'parking'],
    shophouse: ['airconditioner', 'parking', 'security'],
    commercial: ['airconditioner', 'parking', 'security', 'cctv'],
    land: []
  };

  // Add rental-specific features
  if (listingType === 'rent' || listingType === 'lease') {
    const rentalExtras = ['wifi', 'furnished'];
    return [...(defaults[propertyType] || []), ...rentalExtras];
  }

  return defaults[propertyType] || [];
};

const FeaturesStep = ({ features, listingType, propertyType, onUpdate }: FeaturesStepProps) => {
  const { language } = useLanguage();
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Auto-select features when property type is first selected
  useEffect(() => {
    if (propertyType && !hasAutoSelected) {
      const defaultFeatures = getDefaultFeaturesByPropertyType(propertyType, listingType);
      defaultFeatures.forEach(featureKey => {
        // Only auto-select if not already set
        if (features[featureKey] === undefined || features[featureKey] === false) {
          onUpdate(featureKey, true);
        }
      });
      setHasAutoSelected(true);
    }
  }, [propertyType, listingType]);

  const t = {
    en: {
      title: "Property Features",
      subtitle: "Select features that apply to your property",
      basic: "Basic Features",
      amenity: "Amenities",
      security: "Security",
      environment: "Location & Environment",
      accessibility: "Accessibility",
      forType: "Available for"
    },
    id: {
      title: "Fitur Properti",
      subtitle: "Pilih fitur yang sesuai dengan properti Anda",
      basic: "Fitur Dasar",
      amenity: "Fasilitas",
      security: "Keamanan",
      environment: "Lokasi & Lingkungan",
      accessibility: "Aksesibilitas",
      forType: "Tersedia untuk"
    }
  }[language];

  // Get features based on listing type
  const availableFeatures = getFeaturesByListingType(listingType);

  // Group features by category
  const groupedFeatures = availableFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof availableFeatures>);

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

        return (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">
              {t[category as keyof typeof t] as string}
            </h4>
            <div className="flex flex-wrap gap-1.5">
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
          </div>
        );
      })}
    </div>
  );
};

export default FeaturesStep;

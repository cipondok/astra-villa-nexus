import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeaturesByListingType } from "@/config/propertyFilters";
import { Badge } from "@/components/ui/badge";
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
  onUpdate: (feature: string, value: boolean) => void;
}

const FeaturesStep = ({ features, listingType, onUpdate }: FeaturesStepProps) => {
  const { language } = useLanguage();

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
          <div key={category} className="space-y-4">
            <h4 className="text-md font-semibold text-primary">
              {t[category as keyof typeof t] as string}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryFeatures.map((feature) => {
                const Icon = getIcon(feature.icon);
                const label = language === 'en' ? feature.labelEn : feature.labelId;

                return (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <Label htmlFor={feature.key} className="cursor-pointer">
                        {label}
                      </Label>
                    </div>
                    <Switch
                      id={feature.key}
                      checked={features[feature.key] || false}
                      onCheckedChange={(checked) => onUpdate(feature.key, checked)}
                    />
                  </div>
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

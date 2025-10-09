import LocationSelector from "../LocationSelector";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocationStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const LocationStep = ({ formData, onUpdate }: LocationStepProps) => {
  const { language } = useLanguage();

  const t = {
    en: {
      title: "Property Location",
      subtitle: "Select the location where your property is situated. This helps buyers find your property easily.",
    },
    id: {
      title: "Lokasi Properti",
      subtitle: "Pilih lokasi di mana properti Anda berada. Ini membantu pembeli menemukan properti Anda dengan mudah.",
    }
  }[language];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t.title}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {t.subtitle}
        </p>
      </div>

      <LocationSelector
        selectedState={formData.state}
        selectedCity={formData.city}
        selectedDistrict={formData.district || ''}
        selectedSubdistrict={formData.subdistrict || ''}
        onStateChange={(value) => onUpdate('state', value)}
        onCityChange={(value) => onUpdate('city', value)}
        onDistrictChange={(value) => onUpdate('district', value)}
        onSubdistrictChange={(value) => onUpdate('subdistrict', value)}
        onLocationChange={(value) => onUpdate('location', value)}
      />
    </div>
  );
};

export default LocationStep;

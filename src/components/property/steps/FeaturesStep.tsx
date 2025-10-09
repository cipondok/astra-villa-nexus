import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Car, Waves, Trees, LayoutGrid, Sofa, Wind, Shield, Building, 
  Wifi, Video, Dumbbell, Baby, Sparkles, Utensils, Zap, Store,
  GraduationCap, Hospital, ShoppingBag, Bus, Home
} from "lucide-react";

interface FeaturesStepProps {
  features: any;
  onUpdate: (feature: string, value: boolean) => void;
}

const FeaturesStep = ({ features, onUpdate }: FeaturesStepProps) => {
  const { language } = useLanguage();

  const t = {
    en: {
      title: "Property Features",
      subtitle: "Select all the features that apply to your property",
      parking: "Parking",
      swimmingPool: "Swimming Pool",
      garden: "Garden",
      balcony: "Balcony/Terrace",
      furnished: "Furnished",
      airConditioning: "Air Conditioning",
      security: "24/7 Security",
      elevator: "Elevator/Lift",
      internet: "Internet/WiFi",
      cctv: "CCTV",
      gym: "Gym/Fitness Center",
      playground: "Children's Playground",
      petFriendly: "Pet Friendly",
      kitchen: "Modern Kitchen",
      waterHeater: "Water Heater",
      powerBackup: "Power Backup/Generator",
      maidRoom: "Maid's Room",
      laundry: "Laundry Room",
      storage: "Storage Room",
      nearSchool: "Near School",
      nearHospital: "Near Hospital",
      nearMall: "Near Shopping Mall",
      nearPublicTransport: "Near Public Transport",
    },
    id: {
      title: "Fitur Properti",
      subtitle: "Pilih semua fitur yang berlaku untuk properti Anda",
      parking: "Parkir",
      swimmingPool: "Kolam Renang",
      garden: "Taman",
      balcony: "Balkon/Teras",
      furnished: "Berperabotan",
      airConditioning: "AC",
      security: "Keamanan 24/7",
      elevator: "Lift",
      internet: "Internet/WiFi",
      cctv: "CCTV",
      gym: "Gym/Pusat Kebugaran",
      playground: "Taman Bermain Anak",
      petFriendly: "Ramah Hewan Peliharaan",
      kitchen: "Dapur Modern",
      waterHeater: "Pemanas Air",
      powerBackup: "Cadangan Listrik/Generator",
      maidRoom: "Kamar Pembantu",
      laundry: "Ruang Cuci",
      storage: "Ruang Penyimpanan",
      nearSchool: "Dekat Sekolah",
      nearHospital: "Dekat Rumah Sakit",
      nearMall: "Dekat Mall",
      nearPublicTransport: "Dekat Transportasi Umum",
    }
  }[language];

  const featuresList = [
    { key: 'parking', label: t.parking, icon: Car },
    { key: 'swimming_pool', label: t.swimmingPool, icon: Waves },
    { key: 'garden', label: t.garden, icon: Trees },
    { key: 'balcony', label: t.balcony, icon: LayoutGrid },
    { key: 'furnished', label: t.furnished, icon: Sofa },
    { key: 'air_conditioning', label: t.airConditioning, icon: Wind },
    { key: 'security', label: t.security, icon: Shield },
    { key: 'elevator', label: t.elevator, icon: Building },
    { key: 'internet', label: t.internet, icon: Wifi },
    { key: 'cctv', label: t.cctv, icon: Video },
    { key: 'gym', label: t.gym, icon: Dumbbell },
    { key: 'playground', label: t.playground, icon: Baby },
    { key: 'pet_friendly', label: t.petFriendly, icon: Sparkles },
    { key: 'modern_kitchen', label: t.kitchen, icon: Utensils },
    { key: 'water_heater', label: t.waterHeater, icon: Zap },
    { key: 'power_backup', label: t.powerBackup, icon: Zap },
    { key: 'maid_room', label: t.maidRoom, icon: Home },
    { key: 'laundry', label: t.laundry, icon: Home },
    { key: 'storage', label: t.storage, icon: Store },
    { key: 'near_school', label: t.nearSchool, icon: GraduationCap },
    { key: 'near_hospital', label: t.nearHospital, icon: Hospital },
    { key: 'near_mall', label: t.nearMall, icon: ShoppingBag },
    { key: 'near_public_transport', label: t.nearPublicTransport, icon: Bus },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t.title}</h3>
        <p className="text-sm text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featuresList.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <Label htmlFor={key} className="text-base font-medium cursor-pointer">
                {label}
              </Label>
            </div>
            <Switch
              id={key}
              checked={features[key] || false}
              onCheckedChange={(checked) => onUpdate(key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesStep;

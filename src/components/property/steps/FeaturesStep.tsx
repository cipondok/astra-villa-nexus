import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Car, Waves, Trees, LayoutGrid, Sofa, Wind, Shield, Building } from "lucide-react";

interface FeaturesStepProps {
  features: any;
  onUpdate: (feature: string, value: boolean) => void;
}

const FeaturesStep = ({ features, onUpdate }: FeaturesStepProps) => {
  const featuresList = [
    { key: 'parking', label: 'Parking', icon: Car },
    { key: 'swimming_pool', label: 'Swimming Pool', icon: Waves },
    { key: 'garden', label: 'Garden', icon: Trees },
    { key: 'balcony', label: 'Balcony', icon: LayoutGrid },
    { key: 'furnished', label: 'Furnished', icon: Sofa },
    { key: 'air_conditioning', label: 'Air Conditioning', icon: Wind },
    { key: 'security', label: '24/7 Security', icon: Shield },
    { key: 'elevator', label: 'Elevator', icon: Building },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Property Features</h3>
        <p className="text-sm text-muted-foreground">
          Select all the features that apply to your property
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

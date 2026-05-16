import LocationSelector from "../LocationSelector";
import { useTranslation } from '@/i18n/useTranslation';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Home } from "lucide-react";

interface LocationStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const LocationStep = ({ formData, onUpdate }: LocationStepProps) => {
  const { language } = useTranslation();

  const t = {
    en: {
      title: "Location",
      subtitle: "Select your property location",
      streetAddress: "Street Address",
      streetAddressPlaceholder: "e.g., Jl. Sudirman No. 123",
      rtRw: "RT/RW",
      rtRwPlaceholder: "RT 05/RW 03",
      postalCode: "Postal Code",
      postalCodePlaceholder: "12930",
      buildingName: "Building/Complex (Optional)",
      buildingNamePlaceholder: "e.g., Apartemen Sudirman Park",
    },
    id: {
      title: "Lokasi",
      subtitle: "Pilih lokasi properti Anda",
      streetAddress: "Alamat Jalan",
      streetAddressPlaceholder: "Contoh: Jl. Sudirman No. 123",
      rtRw: "RT/RW",
      rtRwPlaceholder: "RT 05/RW 03",
      postalCode: "Kode Pos",
      postalCodePlaceholder: "12930",
      buildingName: "Gedung/Komplek (Opsional)",
      buildingNamePlaceholder: "Contoh: Apartemen Sudirman Park",
    }
  }[language];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-tight">{t.title}</h3>
          <p className="text-[10px] text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {/* Administrative Location */}
      <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
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

      {/* Address Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Home className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{language === 'id' ? 'Detail Alamat' : 'Address Details'}</span>
        </div>

        <div>
          <Label htmlFor="street_address" className="text-xs font-medium">{t.streetAddress} *</Label>
          <Input
            id="street_address"
            value={formData.street_address || ''}
            onChange={(e) => onUpdate('street_address', e.target.value)}
            placeholder={t.streetAddressPlaceholder}
            className="mt-1 h-9 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="rt_rw" className="text-xs font-medium">{t.rtRw}</Label>
            <Input
              id="rt_rw"
              value={formData.rt_rw || ''}
              onChange={(e) => onUpdate('rt_rw', e.target.value)}
              placeholder={t.rtRwPlaceholder}
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="postal_code" className="text-xs font-medium">{t.postalCode}</Label>
            <Input
              id="postal_code"
              value={formData.postal_code || ''}
              onChange={(e) => onUpdate('postal_code', e.target.value)}
              placeholder={t.postalCodePlaceholder}
              maxLength={5}
              className="mt-1 h-9 text-sm"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="building_name" className="text-xs font-medium">{t.buildingName}</Label>
          <Input
            id="building_name"
            value={formData.building_name || ''}
            onChange={(e) => onUpdate('building_name', e.target.value)}
            placeholder={t.buildingNamePlaceholder}
            className="mt-1 h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationStep;

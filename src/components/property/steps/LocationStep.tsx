import LocationSelector from "../LocationSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Home, Navigation } from "lucide-react";

interface LocationStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const LocationStep = ({ formData, onUpdate }: LocationStepProps) => {
  const { language } = useLanguage();

  const t = {
    en: {
      title: "Property Location",
      subtitle: "Select the administrative location of your property in Indonesia",
      addressDetails: "Address Details",
      streetAddress: "Street Address",
      streetAddressPlaceholder: "e.g., Jl. Sudirman No. 123",
      rtRw: "RT/RW",
      rtRwPlaceholder: "e.g., RT 05/RW 03",
      postalCode: "Postal Code",
      postalCodePlaceholder: "e.g., 12930",
      buildingName: "Building/Complex Name (Optional)",
      buildingNamePlaceholder: "e.g., Apartemen Sudirman Park",
    },
    id: {
      title: "Lokasi Properti",
      subtitle: "Pilih lokasi administratif properti Anda di Indonesia",
      addressDetails: "Detail Alamat",
      streetAddress: "Alamat Jalan",
      streetAddressPlaceholder: "Contoh: Jl. Sudirman No. 123",
      rtRw: "RT/RW",
      rtRwPlaceholder: "Contoh: RT 05/RW 03",
      postalCode: "Kode Pos",
      postalCodePlaceholder: "Contoh: 12930",
      buildingName: "Nama Gedung/Komplek (Opsional)",
      buildingNamePlaceholder: "Contoh: Apartemen Sudirman Park",
    }
  }[language];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{t.title}</h3>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {/* Administrative Location Selector */}
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {language === 'id' ? 'Wilayah Administratif' : 'Administrative Region'}
          </span>
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

      {/* Essential Address Details */}
      <div className="p-4 rounded-lg border bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.addressDetails}</span>
        </div>

        {/* Street Address - Required */}
        <div>
          <Label htmlFor="street_address" className="text-sm font-medium">
            {t.streetAddress} *
          </Label>
          <Input
            id="street_address"
            value={formData.street_address || ''}
            onChange={(e) => onUpdate('street_address', e.target.value)}
            placeholder={t.streetAddressPlaceholder}
            className="mt-1.5"
          />
        </div>

        {/* RT/RW and Postal Code */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="rt_rw" className="text-sm font-medium">
              {t.rtRw}
            </Label>
            <Input
              id="rt_rw"
              value={formData.rt_rw || ''}
              onChange={(e) => onUpdate('rt_rw', e.target.value)}
              placeholder={t.rtRwPlaceholder}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="postal_code" className="text-sm font-medium">
              {t.postalCode}
            </Label>
            <Input
              id="postal_code"
              value={formData.postal_code || ''}
              onChange={(e) => onUpdate('postal_code', e.target.value)}
              placeholder={t.postalCodePlaceholder}
              maxLength={5}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Building/Complex Name - Optional */}
        <div>
          <Label htmlFor="building_name" className="text-sm font-medium">
            {t.buildingName}
          </Label>
          <Input
            id="building_name"
            value={formData.building_name || ''}
            onChange={(e) => onUpdate('building_name', e.target.value)}
            placeholder={t.buildingNamePlaceholder}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationStep;

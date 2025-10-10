import LocationSelector from "../LocationSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      addressDetails: "Address Details",
      streetAddress: "Street Address",
      streetAddressPlaceholder: "e.g., Jl. Raya Seminyak No. 123",
      buildingName: "Building/Complex Name",
      buildingNamePlaceholder: "e.g., Grand Bali Complex",
      floorUnit: "Floor/Unit",
      floorUnitPlaceholder: "e.g., Floor 5, Unit 12A",
      postalCode: "Postal Code",
      postalCodePlaceholder: "e.g., 80361",
      landmark: "Landmark/Notes",
      landmarkPlaceholder: "e.g., Near Seminyak Beach, opposite ABC Mall",
      gpsCoordinates: "GPS Coordinates (Optional)",
      gpsPlaceholder: "e.g., -8.6705, 115.1679",
    },
    id: {
      title: "Lokasi Properti",
      subtitle: "Pilih lokasi di mana properti Anda berada. Ini membantu pembeli menemukan properti Anda dengan mudah.",
      addressDetails: "Detail Alamat",
      streetAddress: "Alamat Jalan",
      streetAddressPlaceholder: "mis., Jl. Raya Seminyak No. 123",
      buildingName: "Nama Gedung/Komplek",
      buildingNamePlaceholder: "mis., Komplek Grand Bali",
      floorUnit: "Lantai/Unit",
      floorUnitPlaceholder: "mis., Lantai 5, Unit 12A",
      postalCode: "Kode Pos",
      postalCodePlaceholder: "mis., 80361",
      landmark: "Patokan/Catatan",
      landmarkPlaceholder: "mis., Dekat Pantai Seminyak, seberang Mall ABC",
      gpsCoordinates: "Koordinat GPS (Opsional)",
      gpsPlaceholder: "mis., -8.6705, 115.1679",
    }
  }[language];

  return (
    <div className="space-y-8">
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

      {/* Manual Address Details */}
      <div className="space-y-4 pt-6 border-t">
        <h4 className="font-semibold text-base">{t.addressDetails}</h4>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="street_address">{t.streetAddress} *</Label>
            <Input
              id="street_address"
              value={formData.street_address || ''}
              onChange={(e) => onUpdate('street_address', e.target.value)}
              placeholder={t.streetAddressPlaceholder}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="building_name">{t.buildingName}</Label>
              <Input
                id="building_name"
                value={formData.building_name || ''}
                onChange={(e) => onUpdate('building_name', e.target.value)}
                placeholder={t.buildingNamePlaceholder}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="floor_unit">{t.floorUnit}</Label>
              <Input
                id="floor_unit"
                value={formData.floor_unit || ''}
                onChange={(e) => onUpdate('floor_unit', e.target.value)}
                placeholder={t.floorUnitPlaceholder}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="postal_code">{t.postalCode}</Label>
            <Input
              id="postal_code"
              value={formData.postal_code || ''}
              onChange={(e) => onUpdate('postal_code', e.target.value)}
              placeholder={t.postalCodePlaceholder}
              maxLength={6}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="landmark">{t.landmark}</Label>
            <Textarea
              id="landmark"
              value={formData.landmark || ''}
              onChange={(e) => onUpdate('landmark', e.target.value)}
              placeholder={t.landmarkPlaceholder}
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="gps_coordinates">{t.gpsCoordinates}</Label>
            <Input
              id="gps_coordinates"
              value={formData.gps_coordinates || ''}
              onChange={(e) => onUpdate('gps_coordinates', e.target.value)}
              placeholder={t.gpsPlaceholder}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;

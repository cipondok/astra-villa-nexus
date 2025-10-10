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

      {/* Complete Indonesian Address Entry */}
      <div className="space-y-6 pt-6 border-t">
        <h4 className="font-semibold text-base">{t.addressDetails}</h4>

        {/* Street Address */}
        <div className="space-y-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="block_number" className="text-sm font-medium">
                {language === 'id' ? 'Nomor Blok' : 'Block Number'}
              </Label>
              <Input
                id="block_number"
                value={formData.block_number || ''}
                onChange={(e) => onUpdate('block_number', e.target.value)}
                placeholder={language === 'id' ? 'Contoh: A, B1, C-12' : 'e.g., A, B1, C-12'}
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
                maxLength={6}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Building Details */}
        <div className="space-y-3">
          <h5 className="text-sm font-semibold">
            {language === 'id' ? 'Detail Bangunan' : 'Building Details'}
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            <div>
              <Label htmlFor="apartment_name" className="text-sm font-medium">
                {language === 'id' ? 'Nama Apartemen/Perumahan' : 'Apartment/Housing Name'}
              </Label>
              <Input
                id="apartment_name"
                value={formData.apartment_name || ''}
                onChange={(e) => onUpdate('apartment_name', e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Apartemen Taman Anggrek' : 'e.g., Taman Anggrek Apartment'}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="floor_number" className="text-sm font-medium">
                {language === 'id' ? 'Nomor Lantai' : 'Floor Number'}
              </Label>
              <Input
                id="floor_number"
                value={formData.floor_number || ''}
                onChange={(e) => onUpdate('floor_number', e.target.value)}
                placeholder={language === 'id' ? 'Contoh: 5, LG, Mezzanine' : 'e.g., 5, LG, Mezzanine'}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="unit_number" className="text-sm font-medium">
                {language === 'id' ? 'Nomor Unit/Kamar' : 'Unit/Room Number'}
              </Label>
              <Input
                id="unit_number"
                value={formData.unit_number || ''}
                onChange={(e) => onUpdate('unit_number', e.target.value)}
                placeholder={language === 'id' ? 'Contoh: 501, A12, Studio-5' : 'e.g., 501, A12, Studio-5'}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-3">
          <h5 className="text-sm font-semibold">
            {language === 'id' ? 'Informasi Tambahan' : 'Additional Information'}
          </h5>

          <div>
            <Label htmlFor="landmark" className="text-sm font-medium">
              {t.landmark}
            </Label>
            <Input
              id="landmark"
              value={formData.landmark || ''}
              onChange={(e) => onUpdate('landmark', e.target.value)}
              placeholder={t.landmarkPlaceholder}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="additional_notes" className="text-sm font-medium">
              {language === 'id' ? 'Catatan Alamat Tambahan' : 'Additional Address Notes'}
            </Label>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes || ''}
              onChange={(e) => onUpdate('additional_notes', e.target.value)}
              placeholder={language === 'id' ? 'Informasi tambahan untuk memudahkan pencarian lokasi...' : 'Additional information to help locate the property...'}
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="gps_coordinates" className="text-sm font-medium">
              {t.gpsCoordinates}
            </Label>
            <Input
              id="gps_coordinates"
              value={formData.gps_coordinates || ''}
              onChange={(e) => onUpdate('gps_coordinates', e.target.value)}
              placeholder={t.gpsPlaceholder}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;

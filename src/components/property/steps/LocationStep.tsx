import LocationSelector from "../LocationSelector";

interface LocationStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const LocationStep = ({ formData, onUpdate }: LocationStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Property Location</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select the location where your property is situated. This helps buyers find your property easily.
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

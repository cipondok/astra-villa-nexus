import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PropertyDetailsStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const PropertyDetailsStep = ({ formData, onUpdate }: PropertyDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            value={formData.bedrooms}
            onChange={(e) => onUpdate('bedrooms', e.target.value)}
            placeholder="e.g., 3"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            step="0.5"
            value={formData.bathrooms}
            onChange={(e) => onUpdate('bathrooms', e.target.value)}
            placeholder="e.g., 2"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="area_sqm">Area (m²) *</Label>
          <Input
            id="area_sqm"
            type="number"
            min="0"
            value={formData.area_sqm}
            onChange={(e) => onUpdate('area_sqm', e.target.value)}
            placeholder="e.g., 150"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="development_status">Development Status</Label>
          <Select 
            value={formData.development_status} 
            onValueChange={(value) => onUpdate('development_status', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="under_construction">Under Construction</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="owner_type">Owner Type</Label>
          <Select 
            value={formData.owner_type} 
            onValueChange={(value) => onUpdate('owner_type', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select owner type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.listing_type === 'rent' && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-semibold">Rental Information</h4>
          
          <div>
            <Label>Rental Periods Available</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ].map((period) => (
                <div key={period.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={period.value}
                    checked={formData.rental_periods?.includes(period.value)}
                    onChange={(e) => {
                      const current = formData.rental_periods || [];
                      const updated = e.target.checked
                        ? [...current, period.value]
                        : current.filter((p: string) => p !== period.value);
                      onUpdate('rental_periods', updated);
                    }}
                    className="rounded border-input"
                  />
                  <Label htmlFor={period.value} className="text-sm font-normal cursor-pointer">
                    {period.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="minimum_rental_days">Minimum Rental Days</Label>
            <Input
              id="minimum_rental_days"
              type="number"
              min="1"
              value={formData.minimum_rental_days}
              onChange={(e) => onUpdate('minimum_rental_days', e.target.value)}
              placeholder="e.g., 30"
              className="mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsStep;

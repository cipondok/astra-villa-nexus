import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicInfoStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const BasicInfoStep = ({ formData, onUpdate }: BasicInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Property Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="e.g., Modern 3BR Villa in Seminyak"
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="property_type">Property Type *</Label>
          <Select 
            value={formData.property_type} 
            onValueChange={(value) => onUpdate('property_type', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="office">Office Space</SelectItem>
              <SelectItem value="virtual_office">Virtual Office</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="retail">Retail Space</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="listing_type">Listing Type *</Label>
          <Select 
            value={formData.listing_type} 
            onValueChange={(value) => onUpdate('listing_type', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select listing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
              <SelectItem value="lease">For Lease</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="price">Price (IDR) *</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => onUpdate('price', e.target.value)}
          placeholder="e.g., 5000000000"
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {formData.listing_type === 'rent' ? 'Monthly rental price' : 'Sale price'}
        </p>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Describe your property in detail..."
          rows={6}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Include key features, nearby amenities, and what makes this property special
        </p>
      </div>
    </div>
  );
};

export default BasicInfoStep;

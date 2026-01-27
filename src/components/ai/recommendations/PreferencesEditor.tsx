import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  MapPin, 
  Home, 
  Bed, 
  Star,
  X,
  Plus,
  Sparkles,
  Save
} from 'lucide-react';
import { useUserProfile, usePreferencesUpdate } from '@/hooks/useSmartRecommendations';
import { toast } from 'sonner';

interface PreferencesEditorProps {
  onSave?: () => void;
}

const PROPERTY_TYPES = ['House', 'Apartment', 'Villa', 'Condo', 'Townhouse', 'Land', 'Commercial'];
const POPULAR_LOCATIONS = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta', 'Medan'];
const COMMON_FEATURES = ['Pool', 'Garden', 'Garage', 'Security', 'Furnished', 'Sea View', 'Mountain View', 'Gym'];
const DEAL_BREAKERS = ['No Parking', 'Flood Zone', 'Near Highway', 'Under Construction', 'Shared Facilities'];

const PreferencesEditor = ({ onSave }: PreferencesEditorProps) => {
  const { data } = useUserProfile();
  const updatePrefs = usePreferencesUpdate();
  
  const profile = data?.profile;
  
  const [minBudget, setMinBudget] = useState(profile?.explicit.minBudget || '');
  const [maxBudget, setMaxBudget] = useState(profile?.explicit.maxBudget || '');
  const [locations, setLocations] = useState<string[]>(profile?.explicit.preferredLocations || []);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(profile?.explicit.preferredPropertyTypes || []);
  const [minBedrooms, setMinBedrooms] = useState(profile?.explicit.minBedrooms || 1);
  const [maxBedrooms, setMaxBedrooms] = useState(profile?.explicit.maxBedrooms || 5);
  const [mustHaveFeatures, setMustHaveFeatures] = useState<string[]>(profile?.explicit.mustHaveFeatures || []);
  const [dealBreakers, setDealBreakers] = useState<string[]>(profile?.explicit.dealBreakers || []);
  const [discoveryOpenness, setDiscoveryOpenness] = useState([profile?.discoveryOpenness * 100 || 20]);
  const [customLocation, setCustomLocation] = useState('');

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const addCustomLocation = () => {
    if (customLocation && !locations.includes(customLocation)) {
      setLocations([...locations, customLocation]);
      setCustomLocation('');
    }
  };

  const handleSave = async () => {
    try {
      await updatePrefs.mutateAsync({
        minBudget: minBudget ? Number(minBudget) : undefined,
        maxBudget: maxBudget ? Number(maxBudget) : undefined,
        preferredLocations: locations,
        preferredPropertyTypes: propertyTypes,
        minBedrooms,
        maxBedrooms,
        mustHaveFeatures,
        dealBreakers,
        discoveryOpenness: discoveryOpenness[0] / 100,
      });
      toast.success('Preferences saved! Recommendations will update.');
      onSave?.();
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4" />
          Budget Range
        </Label>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Min budget"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Max budget"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Locations */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4" />
          Preferred Locations
        </Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {POPULAR_LOCATIONS.map((loc) => (
            <Badge
              key={loc}
              variant={locations.includes(loc) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleItem(locations, setLocations, loc)}
            >
              {loc}
              {locations.includes(loc) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add custom location"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomLocation()}
          />
          <Button variant="outline" size="icon" onClick={addCustomLocation}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {locations.filter(l => !POPULAR_LOCATIONS.includes(l)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {locations.filter(l => !POPULAR_LOCATIONS.includes(l)).map((loc) => (
              <Badge key={loc} variant="secondary">
                {loc}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setLocations(locations.filter(l => l !== loc))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Property Types */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Home className="h-4 w-4" />
          Property Types
        </Label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <Badge
              key={type}
              variant={propertyTypes.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleItem(propertyTypes, setPropertyTypes, type)}
            >
              {type}
              {propertyTypes.includes(type) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Bedrooms */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Bed className="h-4 w-4" />
          Bedrooms: {minBedrooms} - {maxBedrooms}+
        </Label>
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">Min</span>
            <Slider
              value={[minBedrooms]}
              onValueChange={(v) => setMinBedrooms(v[0])}
              max={6}
              min={1}
              step={1}
            />
          </div>
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">Max</span>
            <Slider
              value={[maxBedrooms]}
              onValueChange={(v) => setMaxBedrooms(v[0])}
              max={10}
              min={1}
              step={1}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Must-Have Features */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4" />
          Must-Have Features
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${feature}`}
                checked={mustHaveFeatures.includes(feature)}
                onCheckedChange={() => toggleItem(mustHaveFeatures, setMustHaveFeatures, feature)}
              />
              <label htmlFor={`feature-${feature}`} className="text-sm cursor-pointer">
                {feature}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Deal Breakers */}
      <div>
        <Label className="flex items-center gap-2 mb-3 text-red-600">
          <X className="h-4 w-4" />
          Deal Breakers (avoid these)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {DEAL_BREAKERS.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`deal-${item}`}
                checked={dealBreakers.includes(item)}
                onCheckedChange={() => toggleItem(dealBreakers, setDealBreakers, item)}
              />
              <label htmlFor={`deal-${item}`} className="text-sm cursor-pointer">
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Discovery Openness */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4" />
          Discovery Mode: {discoveryOpenness[0]}%
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Higher values mean more unexpected "discovery" suggestions in your recommendations
        </p>
        <Slider
          value={discoveryOpenness}
          onValueChange={setDiscoveryOpenness}
          max={50}
          min={0}
          step={5}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Focused (match my criteria)</span>
          <span>Adventurous (surprise me)</span>
        </div>
      </div>

      <Separator />

      {/* Save Button */}
      <Button 
        className="w-full" 
        onClick={handleSave}
        disabled={updatePrefs.isPending}
      >
        <Save className="h-4 w-4 mr-2" />
        {updatePrefs.isPending ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
};

export default PreferencesEditor;

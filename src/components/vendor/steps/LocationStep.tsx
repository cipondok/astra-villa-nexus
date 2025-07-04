import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { MapPin, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

interface Location {
  id: string;
  area_name: string;
  city_name: string;
  province_name: string;
  city_type: string;
}

const LocationStep: React.FC<LocationStepProps> = ({ formData, updateFormData }) => {
  const [newArea, setNewArea] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, area_name, city_name, province_name, city_type')
          .eq('is_active', true)
          .order('province_name, city_name, area_name')
          .limit(200);

        if (error) {
          console.error('Locations query error:', error);
          throw error;
        }
        
        console.log('Loaded locations:', data?.length || 0);
        setLocations(data || []);
      } catch (error: any) {
        console.error('Error fetching locations:', error);
        toast.error('Failed to load locations: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Filter locations based on search term
  const filteredLocations = locations.filter(location => 
    location.area_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.province_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addServiceArea = (area: string) => {
    if (area && !formData.serviceAreas.includes(area)) {
      updateFormData({ 
        serviceAreas: [...formData.serviceAreas, area] 
      });
    }
    setNewArea('');
  };

  const removeServiceArea = (area: string) => {
    updateFormData({ 
      serviceAreas: formData.serviceAreas.filter((a: string) => a !== area) 
    });
  };

  return (
    <div className="space-y-6">
      {/* Service Type */}
      <div>
        <Label className="text-base font-medium mb-4 block">Service Location Type</Label>
        <RadioGroup 
          value={formData.locationType} 
          onValueChange={(value) => updateFormData({ locationType: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="on_site" id="on_site" />
            <Label htmlFor="on_site">On-site (I go to customer location)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="remote" id="remote" />
            <Label htmlFor="remote">Remote (Customer comes to me or online)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both">Both on-site and remote</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Service Areas */}
      <div>
        <Label className="text-base font-medium mb-4 block">Service Areas</Label>
        
        {/* Search and Select from Database */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Search Locations</Label>
          <Input
            type="text"
            placeholder="Search for cities, areas, or provinces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />
          
           {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading locations...</span>
            </div>
          ) : locations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No locations available. Please check your connection.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto border rounded-md">
              {filteredLocations.slice(0, 20).map((location) => {
                const locationDisplay = `${location.area_name}, ${location.city_name}, ${location.province_name}`;
                const isSelected = formData.serviceAreas.includes(locationDisplay);
                
                return (
                  <div
                    key={location.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted ${
                      isSelected ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => isSelected ? removeServiceArea(locationDisplay) : addServiceArea(locationDisplay)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{location.area_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {location.city_name}, {location.province_name}
                        </p>
                      </div>
                      {isSelected ? (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredLocations.length === 0 && searchTerm && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No locations found matching "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Area Input */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="Enter custom area (e.g., Kelapa Gading, North Jakarta)"
            onKeyPress={(e) => e.key === 'Enter' && addServiceArea(newArea)}
          />
          <Button onClick={() => addServiceArea(newArea)} disabled={!newArea.trim()}>
            Add
          </Button>
        </div>

        {/* Selected Areas */}
        {formData.serviceAreas.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Selected Service Areas</Label>
            <div className="flex flex-wrap gap-2">
              {formData.serviceAreas.map((area: string) => (
                <Badge key={area} variant="default" className="pr-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {area}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeServiceArea(area)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Travel Radius for On-site Services */}
      {(formData.locationType === 'on_site' || formData.locationType === 'both') && (
        <div>
          <Label className="text-base font-medium mb-4 block">
            Maximum Travel Distance: {formData.travelRadius} km
          </Label>
          <Slider
            value={[formData.travelRadius]}
            onValueChange={(value) => updateFormData({ travelRadius: value[0] })}
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>1 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>
      )}

      {/* Location Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-green-900 mb-2">📍 Location Summary</h4>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>Service Type:</strong> {
              formData.locationType === 'on_site' ? 'On-site service' :
              formData.locationType === 'remote' ? 'Remote service' :
              'Both on-site and remote'
            }</p>
            <p><strong>Service Areas:</strong> {
              formData.serviceAreas.length > 0 
                ? formData.serviceAreas.join(', ')
                : 'No areas selected'
            }</p>
            {(formData.locationType === 'on_site' || formData.locationType === 'both') && (
              <p><strong>Travel Distance:</strong> Up to {formData.travelRadius} km</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Location Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add specific neighborhoods or districts you serve</li>
          <li>• Consider travel time and costs when setting your radius</li>
          <li>• More service areas = more potential customers</li>
          <li>• You can always update your service areas later</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationStep;
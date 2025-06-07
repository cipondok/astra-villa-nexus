
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface LocationSelectorProps {
  selectedState: string;
  selectedCity: string;
  selectedArea: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
  onLocationChange?: (location: string) => void;
}

const LocationSelector = ({
  selectedState,
  selectedCity,
  selectedArea,
  onStateChange,
  onCityChange,
  onAreaChange,
  onLocationChange
}: LocationSelectorProps) => {
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Fetch all locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('state, city, area');
      if (error) throw error;
      return data;
    }
  });

  // Get unique states
  const states = locations ? [...new Set(locations.map(loc => loc.state))] : [];

  // Update cities when state changes
  useEffect(() => {
    if (selectedState && locations) {
      const cities = [...new Set(
        locations
          .filter(loc => loc.state === selectedState)
          .map(loc => loc.city)
      )];
      setAvailableCities(cities);
      
      // Reset city and area if current selections are not available
      if (!cities.includes(selectedCity)) {
        onCityChange("");
        onAreaChange("");
      }
    } else {
      setAvailableCities([]);
      onCityChange("");
      onAreaChange("");
    }
  }, [selectedState, locations]);

  // Update areas when city changes
  useEffect(() => {
    if (selectedState && selectedCity && locations) {
      const areas = locations
        .filter(loc => loc.state === selectedState && loc.city === selectedCity)
        .map(loc => loc.area);
      setAvailableAreas(areas);
      
      // Reset area if current selection is not available
      if (!areas.includes(selectedArea)) {
        onAreaChange("");
      }
    } else {
      setAvailableAreas([]);
      onAreaChange("");
    }
  }, [selectedState, selectedCity, locations]);

  // Update location string when selections change
  useEffect(() => {
    if (selectedArea && selectedCity && selectedState && onLocationChange) {
      onLocationChange(`${selectedArea}, ${selectedCity}, ${selectedState}`);
    }
  }, [selectedState, selectedCity, selectedArea, onLocationChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium">Location Selection</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State Selection */}
        <div>
          <Label htmlFor="state">State/Province *</Label>
          <Select value={selectedState} onValueChange={onStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selection */}
        <div>
          <Label htmlFor="city">City *</Label>
          <Select 
            value={selectedCity} 
            onValueChange={onCityChange}
            disabled={!selectedState}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Selection */}
        <div>
          <Label htmlFor="area">Area *</Label>
          <Select 
            value={selectedArea} 
            onValueChange={onAreaChange}
            disabled={!selectedCity}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {availableAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;

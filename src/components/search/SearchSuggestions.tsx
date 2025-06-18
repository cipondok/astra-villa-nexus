
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Home, Search } from "lucide-react";

interface Suggestion {
  type: 'location' | 'property' | 'amenity';
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: Suggestion) => void;
  isVisible: boolean;
  language: string;
}

const SearchSuggestions = ({ query, onSelect, isVisible, language }: SearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Predefined keyword dictionary
  const keywordDictionary = {
    locations: [
      "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", "North Sumatra",
      "South Sumatra", "West Sumatra", "Riau", "South Kalimantan", "East Kalimantan",
      "Bandung", "Surabaya", "Medan", "Makassar", "Denpasar", "Yogyakarta",
      "Semarang", "Palembang", "Balikpapan", "Manado", "Pontianak"
    ],
    properties: [
      "Luxury Villa", "Modern Apartment", "Penthouse", "Townhouse", 
      "Studio Apartment", "Family House", "Beach Villa", "Mountain Villa",
      "City Apartment", "Suburban House", "Condo", "Loft"
    ],
    amenities: [
      "Swimming Pool", "Gym", "Parking", "Security", "Garden", "Balcony",
      "Air Conditioning", "WiFi", "Furnished", "Pet Friendly", "Ocean View",
      "City View", "Private Pool", "Rooftop Terrace"
    ]
  };

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const newSuggestions: Suggestion[] = [];

    // Search locations
    keywordDictionary.locations.forEach(location => {
      if (location.toLowerCase().includes(searchTerm)) {
        newSuggestions.push({
          type: 'location',
          value: location,
          label: location,
          icon: <MapPin className="h-4 w-4" />
        });
      }
    });

    // Search property types
    keywordDictionary.properties.forEach(property => {
      if (property.toLowerCase().includes(searchTerm)) {
        newSuggestions.push({
          type: 'property',
          value: property,
          label: property,
          icon: <Home className="h-4 w-4" />
        });
      }
    });

    // Search amenities
    keywordDictionary.amenities.forEach(amenity => {
      if (amenity.toLowerCase().includes(searchTerm)) {
        newSuggestions.push({
          type: 'amenity',
          value: amenity,
          label: amenity,
          icon: <Search className="h-4 w-4" />
        });
      }
    });

    // Limit to 8 suggestions and sort by relevance
    setSuggestions(newSuggestions.slice(0, 8));
  }, [query]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 shadow-lg">
      <CardContent className="p-2">
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
              onClick={() => onSelect(suggestion)}
            >
              {suggestion.icon}
              <div className="flex-1">
                <div className="text-sm font-medium">{suggestion.label}</div>
                <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchSuggestions;

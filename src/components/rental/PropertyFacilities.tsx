import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wifi, 
  Car, 
  Tv, 
  Coffee, 
  Utensils, 
  Bath, 
  Dumbbell, 
  Shield, 
  Trees, 
  Waves,
  AirVent,
  Refrigerator,
  WashingMachine
} from "lucide-react";

interface Facility {
  id: string;
  category: string;
  name: string;
  description?: string;
  is_available: boolean;
  additional_cost?: number;
}

interface PropertyFacilitiesProps {
  facilities: Facility[];
  compact?: boolean;
}

const PropertyFacilities: React.FC<PropertyFacilitiesProps> = ({ 
  facilities, 
  compact = false 
}) => {
  const getFacilityIcon = (name: string, category: string) => {
    const iconName = name.toLowerCase();
    
    if (iconName.includes('wifi') || iconName.includes('internet')) return Wifi;
    if (iconName.includes('parkir') || iconName.includes('parking')) return Car;
    if (iconName.includes('tv') || iconName.includes('televisi')) return Tv;
    if (iconName.includes('coffee') || iconName.includes('kopi')) return Coffee;
    if (iconName.includes('dapur') || iconName.includes('kitchen')) return Utensils;
    if (iconName.includes('ac') || iconName.includes('air con')) return AirVent;
    if (iconName.includes('kulkas') || iconName.includes('refrigerator')) return Refrigerator;
    if (iconName.includes('mesin cuci') || iconName.includes('washing machine')) return WashingMachine;
    if (iconName.includes('gym') || iconName.includes('fitness')) return Dumbbell;
    if (iconName.includes('security') || iconName.includes('keamanan')) return Shield;
    if (iconName.includes('taman') || iconName.includes('garden')) return Trees;
    if (iconName.includes('kolam') || iconName.includes('pool')) return Waves;
    
    // Category-based fallback
    if (category === 'security') return Shield;
    if (category === 'entertainment') return Tv;
    if (category === 'kitchen') return Utensils;
    if (category === 'outdoor') return Trees;
    
    return Bath; // Default icon
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'basic': 'Fasilitas Dasar',
      'kitchen': 'Dapur & Makan', 
      'entertainment': 'Hiburan',
      'outdoor': 'Outdoor',
      'security': 'Keamanan'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'basic': 'bg-blue-100 text-blue-800',
      'kitchen': 'bg-green-100 text-green-800',
      'entertainment': 'bg-purple-100 text-purple-800',
      'outdoor': 'bg-emerald-100 text-emerald-800',
      'security': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const availableFacilities = facilities.filter(f => f.is_available);
  const groupedFacilities = availableFacilities.reduce((acc, facility) => {
    if (!acc[facility.category]) {
      acc[facility.category] = [];
    }
    acc[facility.category].push(facility);
    return acc;
  }, {} as Record<string, Facility[]>);

  if (compact) {
    // Compact view for property cards
    return (
      <div className="flex flex-wrap gap-1">
        {availableFacilities.slice(0, 6).map((facility) => {
          const IconComponent = getFacilityIcon(facility.name, facility.category);
          return (
            <Badge
              key={facility.id}
              variant="secondary"
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
              title={facility.description || facility.name}
            >
              <IconComponent className="h-3 w-3 mr-1" />
              {facility.name}
            </Badge>
          );
        })}
        {availableFacilities.length > 6 && (
          <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
            +{availableFacilities.length - 6} lainnya
          </Badge>
        )}
      </div>
    );
  }

  // Full view for property details
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Fasilitas Properti
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedFacilities).length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Informasi fasilitas belum tersedia
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFacilities).map(([category, categoryFacilities]) => (
              <div key={category}>
                <div className="flex items-center mb-3">
                  <Badge className={getCategoryColor(category)}>
                    {getCategoryLabel(category)}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryFacilities.map((facility) => {
                    const IconComponent = getFacilityIcon(facility.name, facility.category);
                    return (
                      <div
                        key={facility.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <IconComponent className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {facility.name}
                          </p>
                          {facility.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {facility.description}
                            </p>
                          )}
                          {facility.additional_cost && facility.additional_cost > 0 && (
                            <p className="text-sm text-orange-600 font-medium">
                              +Rp {facility.additional_cost.toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyFacilities;
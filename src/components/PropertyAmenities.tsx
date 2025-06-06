
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from 'lucide-react';

interface PropertyAmenitiesProps {
  amenities: string[];
}

const PropertyAmenities = ({ amenities }: PropertyAmenitiesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{amenity}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyAmenities;


import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield } from "lucide-react";

interface Vendor {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  verified: boolean;
}

interface VendorCardProps {
  vendor: Vendor;
}

const VendorCard = ({ vendor }: VendorCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <div className="relative">
        <img
          src={vendor.image}
          alt={vendor.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {vendor.verified && (
          <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full">
            <Shield className="h-4 w-4" />
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors">
              {vendor.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {vendor.category}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{vendor.rating}</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({vendor.reviews} reviews)
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            View Profile
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
            Book Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;

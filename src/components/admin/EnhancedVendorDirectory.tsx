
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  serviceType: string;
  location: string;
  rating: number;
  responseTime: string;
  availability: 'available' | 'busy' | 'offline';
  phone: string;
  email: string;
  whatsapp: string;
  specializations: string[];
  coverageAreas: string[];
  lastActive: string;
  completedJobs: number;
}

const EnhancedVendorDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const vendors: Vendor[] = [
    {
      id: "1",
      name: "CleanPro Services",
      serviceType: "Cleaning",
      location: "Downtown",
      rating: 4.8,
      responseTime: "15 min",
      availability: "available",
      phone: "+1234567890",
      email: "contact@cleanpro.com",
      whatsapp: "+1234567890",
      specializations: ["Pool Cleaning", "Deep Cleaning", "Maintenance"],
      coverageAreas: ["Downtown", "Beach Area", "Marina District"],
      lastActive: "5 min ago",
      completedJobs: 247
    },
    {
      id: "2",
      name: "Tech Solutions",
      serviceType: "Repairs",
      location: "Beach Area",
      rating: 4.6,
      responseTime: "30 min",
      availability: "busy",
      phone: "+1234567891",
      email: "support@techsolutions.com",
      whatsapp: "+1234567891",
      specializations: ["AC Repair", "Electrical", "Plumbing"],
      coverageAreas: ["Beach Area", "Uptown", "City Center"],
      lastActive: "2 hours ago",
      completedJobs: 156
    },
    {
      id: "3",
      name: "Green Thumb Co.",
      serviceType: "Landscaping",
      location: "Uptown",
      rating: 4.9,
      responseTime: "45 min",
      availability: "available",
      phone: "+1234567892",
      email: "hello@greenthumb.com",
      whatsapp: "+1234567892",
      specializations: ["Garden Maintenance", "Pool Landscaping", "Tree Care"],
      coverageAreas: ["Uptown", "Suburban", "Villa Districts"],
      lastActive: "1 hour ago",
      completedJobs: 189
    },
    {
      id: "4",
      name: "Emergency Fix",
      serviceType: "Emergency",
      location: "Citywide",
      rating: 4.7,
      responseTime: "10 min",
      availability: "available",
      phone: "+1234567893",
      email: "urgent@emergencyfix.com",
      whatsapp: "+1234567893",
      specializations: ["24/7 Emergency", "Urgent Repairs", "Security"],
      coverageAreas: ["Citywide"],
      lastActive: "Just now",
      completedJobs: 89
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'busy': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'offline': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === "all" || vendor.serviceType.toLowerCase() === serviceFilter.toLowerCase();
    const matchesLocation = locationFilter === "all" || vendor.coverageAreas.some(area => 
      area.toLowerCase().includes(locationFilter.toLowerCase())
    );
    const matchesAvailability = availabilityFilter === "all" || vendor.availability === availabilityFilter;
    
    return matchesSearch && matchesService && matchesLocation && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Directory</h1>
          <p className="text-muted-foreground">
            Organized vendor contacts with direct communication tools
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="repairs">Repairs</SelectItem>
            <SelectItem value="landscaping">Landscaping</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="downtown">Downtown</SelectItem>
            <SelectItem value="beach">Beach Area</SelectItem>
            <SelectItem value="uptown">Uptown</SelectItem>
            <SelectItem value="citywide">Citywide</SelectItem>
          </SelectContent>
        </Select>

        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {vendors.filter(v => v.availability === 'available').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">22 min</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">4.7</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{vendor.serviceType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(vendor.availability)}`}></div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {vendor.availability}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Rating and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{vendor.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({vendor.completedJobs} jobs)
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {vendor.responseTime} response
                </div>
              </div>

              {/* Location and Coverage */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{vendor.location}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {vendor.coverageAreas.slice(0, 2).map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {vendor.coverageAreas.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{vendor.coverageAreas.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.specializations.slice(0, 2).map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {vendor.specializations.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{vendor.specializations.length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
              </div>

              {/* Last Active */}
              <div className="text-xs text-muted-foreground text-center">
                Last active: {vendor.lastActive}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vendors found matching your criteria.</p>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedVendorDirectory;

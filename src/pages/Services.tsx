
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign,
  Users,
  Home,
  Wrench,
  Paintbrush,
  Zap,
  Car,
  Shield
} from 'lucide-react';

const Services = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Mock services data
  const services = [
    {
      id: 1,
      name: "Home Cleaning Service",
      provider: "CleanPro Jakarta",
      category: "Cleaning",
      price: "Rp 150,000 - Rp 400,000",
      rating: 4.8,
      reviews: 245,
      location: "Jakarta Selatan",
      duration: "2-4 hours",
      icon: Home,
      featured: true
    },
    {
      id: 2,
      name: "Plumbing & Repairs",
      provider: "FixIt Masters",
      category: "Maintenance", 
      price: "Rp 200,000 - Rp 800,000",
      rating: 4.6,
      reviews: 189,
      location: "Jakarta Pusat",
      duration: "1-3 hours",
      icon: Wrench,
      featured: false
    },
    {
      id: 3,
      name: "House Painting",
      provider: "Paint Perfect",
      category: "Renovation",
      price: "Rp 500,000 - Rp 2,000,000",
      rating: 4.9,
      reviews: 156,
      location: "Jakarta Barat",
      duration: "1-3 days",
      icon: Paintbrush,
      featured: true
    },
    {
      id: 4,
      name: "Electrical Services",
      provider: "ElectroFix",
      category: "Maintenance",
      price: "Rp 180,000 - Rp 600,000",
      rating: 4.7,
      reviews: 203,
      location: "Jakarta Timur",
      duration: "1-2 hours",
      icon: Zap,
      featured: false
    },
    {
      id: 5,
      name: "AC Installation & Repair",
      provider: "CoolAir Solutions",
      category: "HVAC",
      price: "Rp 300,000 - Rp 1,500,000",
      rating: 4.5,
      reviews: 167,
      location: "Jakarta Utara",
      duration: "2-4 hours",
      icon: Car,
      featured: false
    },
    {
      id: 6,
      name: "Security System Setup",
      provider: "SecureHome",
      category: "Security",
      price: "Rp 800,000 - Rp 3,000,000",
      rating: 4.8,
      reviews: 134,
      location: "Jakarta Selatan",
      duration: "3-6 hours",
      icon: Shield,
      featured: true
    }
  ];

  const categories = [
    "All Services", "Cleaning", "Maintenance", "Renovation", "HVAC", "Security", "Gardening"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-samsung-gradient shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Professional Services</h1>
                <p className="text-white/80 mt-1">
                  Find trusted service providers for your property needs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-samsung-blue focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              className={index === 0 ? "bg-samsung-blue hover:bg-samsung-blue-dark" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                {service.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white z-10">
                    Featured
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-samsung-blue/10 rounded-lg">
                        <Icon className="h-6 w-6 text-samsung-blue" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <p className="text-sm text-gray-600">{service.provider}</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {service.category}
                  </Badge>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{service.rating}</span>
                        <span className="text-gray-500">({service.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{service.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{service.price}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 flex gap-2">
                      <Button className="flex-1 bg-samsung-blue hover:bg-samsung-blue-dark">
                        Book Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Services
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Services;

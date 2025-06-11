
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Calendar,
  Eye,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  service_name: string;
  service_description: string;
  service_category: string;
  category_id: string;
  price_range: any;
  duration_value: number;
  duration_unit: string;
  location_type: string;
  service_location_types: string[];
  is_active: boolean;
  featured: boolean;
  rating: number;
  total_bookings: number;
  category: {
    name: string;
    icon: string;
  };
}

interface VendorServicesListProps {
  onAddService: () => void;
  onEditService: (service: Service) => void;
}

const VendorServicesList = ({ onAddService, onEditService }: VendorServicesListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for demo vendor
  const mockServices: Service[] = [
    {
      id: '1',
      service_name: 'Premium Home Cleaning',
      service_description: 'Complete residential cleaning service including deep cleaning, regular maintenance, kitchen and bathroom sanitization.',
      service_category: 'Cleaning',
      category_id: '1',
      price_range: { min: 50, max: 200 },
      duration_value: 2,
      duration_unit: 'hours',
      location_type: 'on_site',
      service_location_types: ['on_site'],
      is_active: true,
      featured: true,
      rating: 4.8,
      total_bookings: 45,
      category: { name: 'Cleaning', icon: '🧹' }
    },
    {
      id: '2',
      service_name: 'Property Maintenance & Repairs',
      service_description: 'Professional maintenance services including plumbing fixes, electrical work, and general property repairs.',
      service_category: 'Maintenance',
      category_id: '2',
      price_range: { min: 75, max: 300 },
      duration_value: 3,
      duration_unit: 'hours',
      location_type: 'on_site',
      service_location_types: ['on_site'],
      is_active: true,
      featured: false,
      rating: 4.6,
      total_bookings: 32,
      category: { name: 'Maintenance', icon: '🔧' }
    }
  ];

  useEffect(() => {
    if (user) {
      if (user.id === 'demo-vendor-789') {
        setServices(mockServices);
      } else {
        fetchServices();
      }
    }
  }, [user]);

  const fetchServices = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_services')
        .select(`
          *,
          category:vendor_service_categories(name, icon)
        `)
        .eq('vendor_id', user.id);

      if (error) throw error;

      const transformedServices: Service[] = (data || []).map(service => ({
        id: service.id,
        service_name: service.service_name,
        service_description: service.service_description || '',
        service_category: service.service_category || '',
        category_id: service.category_id || '',
        price_range: service.price_range,
        duration_value: service.duration_value || 1,
        duration_unit: service.duration_unit || 'hours',
        location_type: service.location_type || 'on_site',
        service_location_types: service.service_location_types || ['on_site'],
        is_active: service.is_active || false,
        featured: service.featured || false,
        rating: service.rating || 0,
        total_bookings: service.total_bookings || 0,
        category: service.category || { name: service.service_category || 'General', icon: '⚙️' }
      }));

      setServices(transformedServices);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('vendor_services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      
      fetchServices();
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive"
      });
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="relative group hover:shadow-md transition-shadow">
      {service.featured && (
        <Badge className="absolute top-3 right-3 bg-yellow-500 text-white z-10">
          Featured
        </Badge>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{service.service_name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {service.category?.icon} {service.category?.name || service.service_category}
              </Badge>
              <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs">
                {service.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {service.service_description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{service.duration_value} {service.duration_unit}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{service.rating || 0} ({service.total_bookings || 0})</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="capitalize">{service.location_type?.replace('_', ' ')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span>{service.total_bookings || 0} bookings</span>
          </div>
        </div>

        {service.price_range && (
          <div className="pt-2 border-t">
            <span className="text-sm font-medium">
              Rp {service.price_range.min?.toLocaleString()} - Rp {service.price_range.max?.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditService(service)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant={service.is_active ? "secondary" : "default"}
            size="sm"
            onClick={() => handleToggleActive(service.id, service.is_active)}
            className="flex-1"
          >
            {service.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-2xl font-bold">{services.filter(s => s.is_active).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{services.reduce((sum, s) => sum + (s.total_bookings || 0), 0)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {services.length > 0 
                    ? (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services management header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
          <p className="text-gray-600">Manage your service offerings and track performance</p>
        </div>
        <Button onClick={onAddService}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
      </div>

      {/* Services list */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No services yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first service offering
              </p>
              <Button onClick={onAddService}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorServicesList;

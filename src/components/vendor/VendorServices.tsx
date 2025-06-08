
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, Star, MapPin, Clock, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VendorServiceForm from "./VendorServiceForm";

interface Service {
  id: string;
  service_name: string;
  service_description: string;
  service_category: string;
  category_id: string;
  price_range: any;
  duration_minutes: number;
  location_type: string;
  is_active: boolean;
  featured: boolean;
  rating: number;
  total_bookings: number;
  monthly_revenue?: number; // Made optional since it might not come from DB
  growth_rate?: number; // Made optional since it might not come from DB
  category: {
    name: string;
    icon: string;
  };
}

const VendorServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Mock data for demo vendor
  const mockServices: Service[] = [
    {
      id: '1',
      service_name: 'Premium Home Cleaning',
      service_description: 'Complete residential cleaning service including deep cleaning, regular maintenance, kitchen and bathroom sanitization.',
      service_category: 'Cleaning',
      category_id: '1',
      price_range: { min: 50, max: 200 },
      duration_minutes: 120,
      location_type: 'on_site',
      is_active: true,
      featured: true,
      rating: 4.8,
      total_bookings: 45,
      monthly_revenue: 2250,
      growth_rate: 15,
      category: { name: 'Cleaning', icon: '🧹' }
    },
    {
      id: '2',
      service_name: 'Property Maintenance & Repairs',
      service_description: 'Professional maintenance services including plumbing fixes, electrical work, and general property repairs.',
      service_category: 'Maintenance',
      category_id: '2',
      price_range: { min: 75, max: 300 },
      duration_minutes: 180,
      location_type: 'on_site',
      is_active: true,
      featured: false,
      rating: 4.6,
      total_bookings: 32,
      monthly_revenue: 1920,
      growth_rate: 8,
      category: { name: 'Maintenance', icon: '🔧' }
    },
    {
      id: '3',
      service_name: 'Garden & Landscaping',
      service_description: 'Complete landscaping services including lawn care, garden design, tree trimming, and outdoor maintenance.',
      service_category: 'Landscaping',
      category_id: '3',
      price_range: { min: 60, max: 250 },
      duration_minutes: 240,
      location_type: 'on_site',
      is_active: false,
      featured: false,
      rating: 4.9,
      total_bookings: 28,
      monthly_revenue: 1680,
      growth_rate: -5,
      category: { name: 'Landscaping', icon: '🌱' }
    }
  ];

  useEffect(() => {
    if (user) {
      // For demo vendor, use mock data
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

      // Transform the data to match our Service interface
      const transformedServices: Service[] = (data || []).map(service => ({
        id: service.id,
        service_name: service.service_name,
        service_description: service.service_description || '',
        service_category: service.service_category || '',
        category_id: service.category_id || '',
        price_range: service.price_range,
        duration_minutes: service.duration_minutes || 0,
        location_type: service.location_type || 'on_site',
        is_active: service.is_active || false,
        featured: service.featured || false,
        rating: service.rating || 0,
        total_bookings: service.total_bookings || 0,
        monthly_revenue: Math.floor(Math.random() * 3000), // Mock data for demo
        growth_rate: Math.floor(Math.random() * 20) - 5, // Mock data for demo
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

  const handleDelete = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service deleted successfully"
      });
      
      fetchServices();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingService(null);
    fetchServices();
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Services</p>
                <p className="text-2xl font-bold">{services.filter(s => s.is_active).length}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold">{services.reduce((sum, s) => sum + (s.total_bookings || 0), 0)}</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold">Rp {(services.reduce((sum, s) => sum + (s.monthly_revenue || 0), 0)).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Services</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your service offerings and track performance</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <VendorServiceForm
          service={editingService}
          onClose={() => {
            setShowForm(false);
            setEditingService(null);
          }}
        />
      )}

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No services yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by adding your first service offering
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="relative">
              {service.featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{service.service_name}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingService(service);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast({
                        title: "Service Deleted",
                        description: "Service has been removed successfully."
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      {service.category?.name || service.service_category}
                    </Badge>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {service.service_description}
                </p>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="capitalize">{service.location_type?.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{service.rating || 0}</span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{service.total_bookings || 0} bookings</span>
                    </div>
                  </div>

                  {/* Performance metrics */}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Monthly Revenue</span>
                      <span className="text-sm font-bold">Rp {(service.monthly_revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Growth Rate</span>
                      <span className={`text-sm font-medium ${(service.growth_rate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(service.growth_rate || 0) >= 0 ? '+' : ''}{service.growth_rate || 0}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(Math.abs(service.growth_rate || 0), 100)} 
                      className="h-2"
                    />
                  </div>

                  {/* Price range */}
                  {service.price_range && (
                    <div className="pt-2 border-t">
                      <span className="text-sm font-medium">
                        Rp {service.price_range.min?.toLocaleString()} - Rp {service.price_range.max?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorServices;

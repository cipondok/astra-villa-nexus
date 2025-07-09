import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
  Shield,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

// Service booking component
const ServiceBookingModal = ({ service, isOpen, onClose }: { service: any, isOpen: boolean, onClose: () => void }) => {
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: '',
    phone: '',
    address: ''
  });

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book a service');
      return;
    }

    try {
      const { error } = await supabase.from('vendor_bookings').insert({
        vendor_id: service.vendor_id,
        service_id: service.id,
        customer_id: user.id,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        customer_notes: bookingData.notes,
        contact_phone: bookingData.phone,
        location_address: bookingData.address,
        status: 'pending',
        total_amount: 0 // Will be calculated by vendor
      });

      if (error) throw error;

      toast.success('Booking request sent successfully!');
      onClose();
      setBookingData({ date: '', time: '', notes: '', phone: '', address: '' });
    } catch (error: any) {
      toast.error('Failed to book service: ' + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {service?.service_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Preferred Date</label>
            <Input
              type="date"
              value={bookingData.date}
              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Preferred Time</label>
            <Input
              type="time"
              value={bookingData.time}
              onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              value={bookingData.phone}
              onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
              placeholder="Your phone number"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Service Address</label>
            <Input
              value={bookingData.address}
              onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
              placeholder="Where should we provide the service?"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Additional Notes</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              placeholder="Any special requirements or notes..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              className="flex-1"
              disabled={!bookingData.date || !bookingData.phone || !bookingData.address}
            >
              Send Booking Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Services = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Services');

  const isVendor = profile?.role === 'vendor';
  const isCustomer = !isVendor;

  // Fetch services from database
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('vendor_services')
        .select(`
          *,
          vendor:profiles!vendor_id(full_name, company_name),
          vendor_service_items(*)
        `)
        .eq('is_active', true)
        .eq('admin_approval_status', 'approved');

      if (searchTerm) {
        query = query.or(`service_name.ilike.%${searchTerm}%,service_description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'All Services') {
        query = query.eq('service_category', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get unique categories
  const categories = ['All Services', ...new Set(services.map(s => s.service_category).filter(Boolean))];

  const handleBookService = (service: any) => {
    if (!user) {
      toast.error('Please login to book a service');
      navigate('/auth');
      return;
    }
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const formatPrice = (service: any) => {
    if (service.vendor_service_items && service.vendor_service_items.length > 0) {
      const prices = service.vendor_service_items.map((item: any) => item.price).filter(Boolean);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `Rp ${min.toLocaleString()}` : `Rp ${min.toLocaleString()} - Rp ${max.toLocaleString()}`;
      }
    }
    return 'Contact for pricing';
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'cleaning': return Home;
      case 'maintenance': return Wrench;
      case 'renovation': return Paintbrush;
      case 'electrical': return Zap;
      case 'hvac': return Car;
      case 'security': return Shield;
      default: return Wrench;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground shadow-sm border-b">
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
                <h1 className="text-3xl font-bold text-white">
                  {isVendor ? 'Manage Your Services' : 'Professional Services'}
                </h1>
                <p className="text-white/80 mt-1">
                  {isVendor 
                    ? 'Manage and monitor your service offerings' 
                    : 'Find trusted service providers for your property needs'
                  }
                </p>
              </div>
            </div>
            {isVendor && (
              <Button
                onClick={() => navigate('/vendor-dashboard')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">No services found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'No services available at the moment'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = getCategoryIcon(service.service_category);
              const vendorName = service.vendor?.company_name || service.vendor?.full_name || 'Unknown Vendor';
              const isOwnService = isVendor && service.vendor_id === user?.id;
              
              return (
                <Card key={service.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/50 relative backdrop-blur-sm">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {service.featured && (
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg animate-pulse border-0 px-3 py-1">
                        ✨ Featured
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="p-4 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-bounce" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300 leading-tight">
                          {service.service_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-semibold mt-1">{vendorName}</p>
                        
                        {service.service_category && (
                          <Badge variant="secondary" className="mt-3 bg-gradient-to-r from-primary/15 to-primary/10 text-primary border-primary/30 hover:from-primary/20 hover:to-primary/15 transition-all">
                            {service.service_category}
                          </Badge>
                        )}
                      </div>
                      
                      {isOwnService && (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md">
                          Your Service
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-5 relative z-10">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {service.service_description}
                    </p>
                    
                    {/* Rating and Location */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full border border-yellow-200 dark:border-yellow-700">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{service.rating || 'New'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({service.total_bookings || 0} bookings)
                        </span>
                      </div>
                      {service.service_location_state && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-3 py-2 rounded-full border">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{service.service_location_state}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Duration and Price Card */}
                    <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 p-4 rounded-xl border-2 border-gray-200/50 dark:border-gray-600/50 group-hover:border-primary/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{service.duration_value} {service.duration_unit}</span>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-lg">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              {formatPrice(service)}
                            </span>
                            <p className="text-xs text-muted-foreground">Price</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      {isOwnService ? (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={() => navigate('/vendor-dashboard')}
                            className="flex-1 group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300 font-semibold"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Service
                          </Button>
                          <Button variant="outline" size="sm" className="px-4 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            className="flex-1 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-white border-0"
                            onClick={() => handleBookService(service)}
                          >
                            Book Now
                          </Button>
                          <Button variant="outline" size="sm" className="px-4 hover:bg-primary/5 hover:border-primary transition-all">
                            <Users className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>

                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/5 to-transparent rounded-full translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-700" />
                </Card>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {services.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Services
            </Button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <ServiceBookingModal
        service={selectedService}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
};

export default Services;
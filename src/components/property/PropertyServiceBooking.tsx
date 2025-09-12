import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyServiceBookingProps {
  serviceId: string;
  vendorId: string;
  onClose: () => void;
}

const PropertyServiceBooking: React.FC<PropertyServiceBookingProps> = ({
  serviceId,
  vendorId,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    duration_hours: 2,
    service_address: '',
    special_instructions: '',
    property_id: ''
  });

  const [priceCalculation, setPriceCalculation] = useState<any>(null);

  // Fetch service details
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service-details', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select(`
          *,
          vendor_business_profiles(
            business_name,
            rating,
            total_reviews,
            business_phone,
            business_email
          )
        `)
        .eq('id', serviceId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch vendor permissions
  const { data: permissions } = useQuery({
    queryKey: ['vendor-permissions', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('property-services', {
        body: { action: 'get_vendor_permissions', vendor_id: vendorId }
      });
      
      if (error) throw error;
      return data.permissions;
    }
  });

  // Calculate price
  const calculatePrice = async () => {
    if (!serviceId || !formData.duration_hours) return;

    try {
      const { data, error } = await supabase.functions.invoke('property-services', {
        body: {
          action: 'calculate_service_price',
          service_id: serviceId,
          duration_hours: formData.duration_hours,
          property_area: 100 // Default area, could be dynamic
        }
      });

      if (error) throw error;
      setPriceCalculation(data);
    } catch (error) {
      console.error('Price calculation error:', error);
    }
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const { data, error } = await supabase.functions.invoke('property-services', {
        body: {
          action: 'create_booking',
          ...bookingData
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Booking Created",
        description: "Your property service booking has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['property-bookings'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book services.",
        variant: "destructive",
      });
      return;
    }

    await createBookingMutation.mutateAsync({
      vendor_id: vendorId,
      service_id: serviceId,
      ...formData
    });
  };

  React.useEffect(() => {
    calculatePrice();
  }, [formData.duration_hours, serviceId]);

  if (serviceLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!service) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Service not found</p>
        </CardContent>
      </Card>
    );
  }

  const vendorPermission = permissions?.find((p: any) => 
    p.vendor_id === vendorId && p.background_check_status === 'approved'
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{service.service_name}</CardTitle>
            <CardDescription className="mt-1">
              Book this property service with {service.vendor_business_profiles?.business_name}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        {/* Vendor Info */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{service.vendor_business_profiles?.business_name}</p>
              <p className="text-sm text-muted-foreground">
                ⭐ {service.vendor_business_profiles?.rating || '0.0'} 
                ({service.vendor_business_profiles?.total_reviews || 0} reviews)
              </p>
            </div>
          </div>
          
          {vendorPermission && (
            <div className="flex gap-2">
              {vendorPermission.insurance_verified && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Insured
                </Badge>
              )}
              {vendorPermission.background_check_status === 'approved' && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="booking_date">
                <Calendar className="h-4 w-4 inline mr-2" />
                Service Date
              </Label>
              <Input
                id="booking_date"
                type="date"
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="booking_time">
                <Clock className="h-4 w-4 inline mr-2" />
                Preferred Time
              </Label>
              <Input
                id="booking_time"
                type="time"
                value={formData.booking_time}
                onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration_hours">Expected Duration (hours)</Label>
            <Input
              id="duration_hours"
              type="number"
              min="1"
              max="24"
              value={formData.duration_hours}
              onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
              className="mt-1"
            />
          </div>

          {/* Service Address */}
          <div>
            <Label htmlFor="service_address">
              <MapPin className="h-4 w-4 inline mr-2" />
              Service Address
            </Label>
            <Textarea
              id="service_address"
              value={formData.service_address}
              onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
              placeholder="Enter the full address where the service will be performed"
              required
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="special_instructions">Special Instructions (Optional)</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder="Any specific requirements or instructions for the vendor"
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Price Calculation */}
          {priceCalculation && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Estimated Total</p>
                    <p className="text-sm text-muted-foreground">
                      {priceCalculation.pricing_model === 'hourly' ? 
                        `${formData.duration_hours} hours × IDR ${priceCalculation.breakdown.base_rate.hourly?.toLocaleString()}` :
                        'Fixed rate service'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      IDR {priceCalculation.total_price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="flex-1"
            >
              {createBookingMutation.isPending ? 'Creating Booking...' : 'Book Service'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyServiceBooking;
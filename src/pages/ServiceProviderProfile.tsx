import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft, Star, MapPin, Phone, Mail, Clock, Shield, CheckCircle,
  Calendar, MessageSquare, Users, Briefcase, Award, ExternalLink,
} from 'lucide-react';
import PropertyServiceBooking from '@/components/property/PropertyServiceBooking';
import QuotationRequestForm from '@/components/marketplace/QuotationRequestForm';
import ServiceReviewForm from '@/components/marketplace/ServiceReviewForm';
import { formatCurrency } from '@/lib/utils';

const ServiceProviderProfile = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch vendor business profile
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor-profile-public', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select(`
          *,
          vendor_main_categories (id, name, icon)
        `)
        .eq('vendor_id', vendorId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });

  // Fetch vendor services
  const { data: services = [] } = useQuery({
    queryKey: ['vendor-services-public', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_active', true)
        .eq('admin_approval_status', 'approved')
        .order('featured', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!vendorId,
  });

  // Fetch vendor reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['vendor-reviews-public', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_reviews')
        .select(`
          *,
          profiles:customer_id (full_name, avatar_url)
        `)
        .eq('vendor_id', vendorId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!vendorId,
  });

  const formatPrice = (priceRange: any) => {
    if (!priceRange) return 'Hubungi untuk harga';
    if (priceRange.min && priceRange.max) return `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`;
    if (priceRange.fixed) return formatCurrency(priceRange.fixed);
    return 'Hubungi untuk harga';
  };

  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
          <div className="container mx-auto px-4 py-3">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Vendor Tidak Ditemukan</h2>
          <Button onClick={() => navigate('/marketplace')} className="rounded-xl mt-3">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const avgRating = vendor.rating || 0;
  const totalReviews = vendor.total_reviews || reviews.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold text-foreground truncate">
            {vendor.business_name}
          </h1>
          {vendor.is_verified && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-chart-2/30 text-chart-2 bg-chart-2/10 gap-0.5 flex-shrink-0">
              <CheckCircle className="h-2.5 w-2.5" /> Terverifikasi
            </Badge>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 max-w-4xl space-y-5">
        {/* Vendor Hero Card */}
        <Card className="rounded-2xl border-border/30 overflow-hidden">
          {vendor.banner_url && (
            <div className="h-32 sm:h-40 bg-muted overflow-hidden">
              <img src={vendor.banner_url} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}
          <CardContent className={`p-4 sm:p-6 ${vendor.banner_url ? '-mt-10 relative' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-muted border-4 border-background overflow-hidden flex-shrink-0">
                {vendor.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.business_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                    {vendor.business_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{vendor.business_name}</h2>
                {vendor.business_type && (
                  <p className="text-xs text-muted-foreground mt-0.5">{vendor.business_type}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-gold-primary text-gold-primary" />
                    <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({totalReviews} ulasan)</span>
                  </div>
                  {vendor.vendor_main_categories && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0">
                      {vendor.vendor_main_categories.icon} {vendor.vendor_main_categories.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {vendor.business_description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{vendor.business_description}</p>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-2 mt-4">
              {vendor.business_phone && (
                <a href={`tel:${vendor.business_phone}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Phone className="h-3 w-3" /> {vendor.business_phone}
                </a>
              )}
              {vendor.business_email && (
                <a href={`mailto:${vendor.business_email}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Mail className="h-3 w-3" /> {vendor.business_email}
                </a>
              )}
              {vendor.service_areas && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                  <MapPin className="h-3 w-3" /> {Array.isArray(vendor.service_areas) ? vendor.service_areas.join(', ') : vendor.service_areas}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="rounded-xl h-9 text-xs flex-1" onClick={() => setShowQuoteForm(true)} disabled={!user}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Minta Penawaran
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs" onClick={() => setShowReviewForm(true)} disabled={!user}>
                <Star className="h-3.5 w-3.5 mr-1.5" /> Beri Ulasan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" /> Layanan ({services.length})
          </h3>
          {services.length === 0 ? (
            <Card className="rounded-2xl border-border/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">Belum ada layanan aktif.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(service => (
                <Card key={service.id} className="rounded-2xl border-border/30 hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2">{service.service_name}</h4>
                      {service.featured && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-primary text-primary-foreground flex-shrink-0">
                          <Award className="h-2.5 w-2.5 mr-0.5" /> Unggulan
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{service.service_description}</p>
                    <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                      {service.duration_value && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {service.duration_value} {service.duration_unit || 'jam'}</span>
                      )}
                      {service.rating && (
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-gold-primary text-gold-primary" /> {service.rating.toFixed(1)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{formatPrice(service.price_range)}</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="h-8 rounded-xl text-xs" onClick={() => setSelectedServiceId(service.id)}>
                            <Calendar className="h-3 w-3 mr-1" /> Pesan
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          {selectedServiceId && vendorId && (
                            <PropertyServiceBooking
                              serviceId={selectedServiceId}
                              vendorId={vendorId}
                              onClose={() => setSelectedServiceId(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-gold-primary" /> Ulasan ({reviews.length})
          </h3>
          {reviews.length === 0 ? (
            <Card className="rounded-2xl border-border/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">Belum ada ulasan.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <Card key={review.id} className="rounded-2xl border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {(review as any).profiles?.avatar_url ? (
                          <img src={(review as any).profiles.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{(review as any).profiles?.full_name || 'Pengguna'}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(review.created_at!).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-gold-primary text-gold-primary' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                        {review.title && <p className="text-sm font-medium mt-1">{review.title}</p>}
                        {review.review_text && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{review.review_text}</p>}
                        {review.response_text && (
                          <div className="mt-2 p-2.5 rounded-lg bg-muted/50 border-l-2 border-primary/30">
                            <p className="text-[10px] font-medium text-primary mb-0.5">Balasan Vendor</p>
                            <p className="text-xs text-muted-foreground">{review.response_text}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quotation Request Dialog */}
      <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <QuotationRequestForm
            vendorId={vendorId!}
            vendorName={vendor.business_name || ''}
            services={services}
            onClose={() => setShowQuoteForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <ServiceReviewForm
            vendorId={vendorId!}
            vendorName={vendor.business_name || ''}
            services={services}
            onClose={() => setShowReviewForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviderProfile;

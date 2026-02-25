import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RentalDetail } from "@/components/rental/RentalPropertyCard";

interface SpecialRequest {
  id: string;
  tenantName: string;
  propertyTitle: string;
  request: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  date: string;
  priority: 'low' | 'medium' | 'high';
}

interface ReviewItem {
  id: string;
  tenantName: string;
  propertyTitle: string;
  rating: number;
  comment: string;
  date: string;
}

function mapBookingStatus(status: string): RentalDetail['status'] {
  switch (status) {
    case 'active': return 'active';
    case 'confirmed': return 'upcoming';
    case 'pending': return 'upcoming';
    case 'completed': return 'completed';
    case 'cancelled': return 'completed';
    default: return 'active';
  }
}

export const useOwnerRentalData = () => {
  const bookingsQuery = useQuery({
    queryKey: ['owner-rental-bookings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('rental_bookings')
        .select(`
          id, check_in_date, check_out_date, total_amount, base_price,
          booking_status, payment_status, special_requests, customer_id, property_id, created_at,
          properties!inner(id, title, thumbnail_url, city, state, owner_id),
          profiles!rental_bookings_customer_id_fkey(full_name, avatar_url)
        `)
        .eq('properties.owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ['owner-rental-payments'],
    enabled: !!bookingsQuery.data && bookingsQuery.data.length > 0,
    queryFn: async () => {
      const bookingIds = bookingsQuery.data!.map(b => b.id);
      if (bookingIds.length === 0) return [];

      const { data, error } = await supabase
        .from('booking_payments')
        .select('id, amount, payment_status, booking_id')
        .in('booking_id', bookingIds)
        .limit(500);

      if (error) throw error;
      return data || [];
    },
  });

  const reviewsQuery = useQuery({
    queryKey: ['owner-rental-reviews'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get owner's property IDs first
      const { data: props } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id)
        .limit(100);

      if (!props || props.length === 0) return [];

      const { data, error } = await supabase
        .from('property_reviews')
        .select(`
          id, rating, review_text, created_at, property_id,
          profiles!property_reviews_user_id_fkey(full_name),
          properties!property_reviews_property_id_fkey(title)
        `)
        .in('property_id', props.map(p => p.id))
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  // Map to RentalDetail
  const rentals: RentalDetail[] = (bookingsQuery.data || []).map(b => {
    const prop = b.properties as any;
    const profile = b.profiles as any;
    const totalDays = Math.max(1, Math.ceil(
      (new Date(b.check_out_date).getTime() - new Date(b.check_in_date).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const monthlyRent = Math.round((b.total_amount / totalDays) * 30);

    // Calculate payments
    const bookingPayments = (paymentsQuery.data || []).filter(p => p.booking_id === b.id);
    const paidAmount = bookingPayments
      .filter(p => p.payment_status === 'completed')
      .reduce((s, p) => s + (p.amount || 0), 0);
    const totalRent = b.total_amount || 0;
    const dueAmount = Math.max(0, totalRent - paidAmount);
    const tax = Math.round(totalRent * 0.1);
    const serviceCharges = Math.round(totalRent * 0.03);
    const totalRevenue = paidAmount - tax - serviceCharges;

    return {
      id: b.id,
      propertyTitle: prop?.title || 'Properti',
      location: [prop?.city, prop?.state].filter(Boolean).join(', ') || '-',
      tenantName: profile?.full_name || 'Penyewa',
      tenantAvatar: profile?.avatar_url || undefined,
      status: mapBookingStatus(b.booking_status || 'active'),
      startDate: b.check_in_date,
      endDate: b.check_out_date,
      monthlyRent,
      totalRent,
      paidAmount,
      dueAmount,
      serviceCharges,
      tax,
      totalRevenue: Math.max(0, totalRevenue),
      specialRequests: b.special_requests || undefined,
      complianceScore: b.payment_status === 'paid' ? 100 : paidAmount > 0 ? 75 : 50,
      rating: undefined,
      thumbnailUrl: prop?.thumbnail_url || '',
    };
  });

  // Build special requests from bookings that have them
  const specialRequests: SpecialRequest[] = (bookingsQuery.data || [])
    .filter(b => b.special_requests)
    .map(b => {
      const prop = b.properties as any;
      const profile = b.profiles as any;
      return {
        id: `sr-${b.id}`,
        tenantName: profile?.full_name || 'Penyewa',
        propertyTitle: prop?.title || 'Properti',
        request: b.special_requests!,
        status: 'pending' as const,
        date: b.created_at || new Date().toISOString(),
        priority: 'medium' as const,
      };
    });

  // Build reviews
  const recentReviews: ReviewItem[] = (reviewsQuery.data || []).map(r => {
    const profile = r.profiles as any;
    const prop = r.properties as any;
    return {
      id: r.id,
      tenantName: profile?.full_name || 'Penyewa',
      propertyTitle: prop?.title || 'Properti',
      rating: r.rating || 0,
      comment: r.review_text || '',
      date: r.created_at,
    };
  });

  // Compute aggregates
  const activeCount = rentals.filter(r => r.status === 'active').length;
  const upcomingCount = rentals.filter(r => r.status === 'upcoming').length;
  const totalRevenue = rentals.reduce((s, r) => s + r.totalRevenue, 0);
  const totalDues = rentals.reduce((s, r) => s + r.dueAmount, 0);
  const totalRentCollected = rentals.reduce((s, r) => s + r.paidAmount, 0);
  const totalServiceCharges = rentals.reduce((s, r) => s + r.serviceCharges, 0);
  const totalTax = rentals.reduce((s, r) => s + r.tax, 0);
  const occupancyRate = rentals.length > 0 ? Math.round((activeCount / rentals.length) * 100) : 0;

  const averageRating = recentReviews.length > 0
    ? recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: recentReviews.filter(r => r.rating === stars).length,
  }));

  return {
    rentals,
    specialRequests,
    recentReviews,
    isLoading: bookingsQuery.isLoading,
    stats: { activeCount, upcomingCount, totalRevenue, totalDues },
    financials: { totalRentCollected, totalServiceCharges, totalTax, totalDues, totalRevenue, occupancyRate },
    reviewStats: { averageRating, totalReviews: recentReviews.length, ratingBreakdown },
  };
};

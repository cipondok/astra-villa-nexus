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
    case 'confirmed': case 'pending': return 'upcoming';
    case 'completed': case 'cancelled': return 'completed';
    default: return 'active';
  }
}

export const useAgentRentalData = () => {
  const bookingsQuery = useQuery({
    queryKey: ['agent-rental-bookings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('rental_bookings')
        .select(`
          id, check_in_date, check_out_date, total_amount, base_price,
          booking_status, payment_status, special_requests, customer_id, agent_id, property_id, created_at,
          properties(id, title, thumbnail_url, city, state),
          profiles!rental_bookings_customer_id_fkey(full_name, avatar_url)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ['agent-rental-payments'],
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

  const rentals: RentalDetail[] = (bookingsQuery.data || []).map(b => {
    const prop = b.properties as any;
    const profile = b.profiles as any;
    const totalDays = Math.max(1, Math.ceil(
      (new Date(b.check_out_date).getTime() - new Date(b.check_in_date).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const monthlyRent = Math.round((b.total_amount / totalDays) * 30);
    const bookingPayments = (paymentsQuery.data || []).filter(p => p.booking_id === b.id);
    const paidAmount = bookingPayments.filter(p => p.payment_status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
    const totalRent = b.total_amount || 0;
    const dueAmount = Math.max(0, totalRent - paidAmount);
    const tax = Math.round(totalRent * 0.1);
    const serviceCharges = Math.round(totalRent * 0.03);
    const totalRevenue = Math.max(0, paidAmount - tax - serviceCharges);

    return {
      id: b.id,
      propertyTitle: prop?.title || 'Properti',
      location: [prop?.city, prop?.state].filter(Boolean).join(', ') || '-',
      tenantName: profile?.full_name || 'Penyewa',
      tenantAvatar: profile?.avatar_url || undefined,
      status: mapBookingStatus(b.booking_status || 'active'),
      startDate: b.check_in_date,
      endDate: b.check_out_date,
      monthlyRent, totalRent, paidAmount, dueAmount, serviceCharges, tax, totalRevenue,
      specialRequests: b.special_requests || undefined,
      complianceScore: b.payment_status === 'paid' ? 100 : paidAmount > 0 ? 75 : 50,
      thumbnailUrl: prop?.thumbnail_url || '',
    };
  });

  const specialRequests: SpecialRequest[] = (bookingsQuery.data || [])
    .filter(b => b.special_requests)
    .map(b => ({
      id: `sr-${b.id}`,
      tenantName: (b.profiles as any)?.full_name || 'Penyewa',
      propertyTitle: (b.properties as any)?.title || 'Properti',
      request: b.special_requests!,
      status: 'pending' as const,
      date: b.created_at || new Date().toISOString(),
      priority: 'medium' as const,
    }));

  const activeCount = rentals.filter(r => r.status === 'active').length;
  const upcomingCount = rentals.filter(r => r.status === 'upcoming').length;
  const totalRevenue = rentals.reduce((s, r) => s + r.totalRevenue, 0);
  const totalDues = rentals.reduce((s, r) => s + r.dueAmount, 0);

  return {
    rentals,
    specialRequests,
    isLoading: bookingsQuery.isLoading,
    stats: { activeCount, upcomingCount, totalRevenue, totalDues },
    financials: {
      totalRentCollected: rentals.reduce((s, r) => s + r.paidAmount, 0),
      totalServiceCharges: rentals.reduce((s, r) => s + r.serviceCharges, 0),
      totalTax: rentals.reduce((s, r) => s + r.tax, 0),
      totalDues,
      totalRevenue,
      occupancyRate: rentals.length > 0 ? Math.round((activeCount / rentals.length) * 100) : 0,
    },
  };
};

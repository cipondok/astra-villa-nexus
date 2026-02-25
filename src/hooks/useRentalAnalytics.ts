import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays, format, startOfMonth, subMonths } from "date-fns";

export interface RentalAnalytics {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  occupancyRate: number;
  avgBookingDuration: number;
  avgBookingValue: number;
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
  statusBreakdown: { name: string; value: number }[];
  paymentBreakdown: { name: string; value: number }[];
  recentBookings: any[];
}

const emptyAnalytics: RentalAnalytics = {
  totalBookings: 0, activeBookings: 0, completedBookings: 0, cancelledBookings: 0,
  totalRevenue: 0, paidRevenue: 0, unpaidRevenue: 0,
  occupancyRate: 0, avgBookingDuration: 0, avgBookingValue: 0,
  monthlyRevenue: [], statusBreakdown: [], paymentBreakdown: [], recentBookings: [],
};

export const useRentalAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["rental-analytics", user?.id],
    queryFn: async (): Promise<RentalAnalytics> => {
      if (!user) return emptyAnalytics;

      // Get owner's properties
      const { data: properties } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id);

      if (!properties || properties.length === 0) return emptyAnalytics;
      const propertyIds = properties.map(p => p.id);

      // Fetch all bookings for owner's properties
      const { data: bookings, error } = await supabase
        .from("rental_bookings")
        .select("id, check_in_date, check_out_date, total_amount, total_days, booking_status, payment_status, created_at, property_id, properties(title)")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      if (!bookings || bookings.length === 0) return emptyAnalytics;

      const now = new Date();
      const totalBookings = bookings.length;
      const active = bookings.filter(b => ["confirmed", "pending"].includes(b.booking_status || ""));
      const completed = bookings.filter(b => b.booking_status === "completed");
      const cancelled = bookings.filter(b => b.booking_status === "cancelled");

      const totalRevenue = bookings.reduce((s, b) => s + (b.total_amount || 0), 0);
      const paidRevenue = bookings.filter(b => b.payment_status === "paid").reduce((s, b) => s + (b.total_amount || 0), 0);
      const unpaidRevenue = totalRevenue - paidRevenue;

      const totalDays = bookings.reduce((s, b) => s + (b.total_days || 0), 0);
      const avgBookingDuration = totalBookings > 0 ? Math.round(totalDays / totalBookings) : 0;
      const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

      // Occupancy: ratio of booked days to total possible days (properties * 365) 
      const totalPossibleDays = propertyIds.length * 365;
      const bookedDays = bookings
        .filter(b => !["cancelled"].includes(b.booking_status || ""))
        .reduce((s, b) => s + (b.total_days || 0), 0);
      const occupancyRate = totalPossibleDays > 0 ? Math.round((bookedDays / totalPossibleDays) * 100) : 0;

      // Monthly revenue (last 6 months)
      const monthlyRevenue: { month: string; revenue: number; bookings: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthLabel = format(monthStart, "MMM yy");
        const monthBookings = bookings.filter(b => {
          const d = new Date(b.created_at);
          return d.getFullYear() === monthStart.getFullYear() && d.getMonth() === monthStart.getMonth();
        });
        monthlyRevenue.push({
          month: monthLabel,
          revenue: monthBookings.reduce((s, b) => s + (b.total_amount || 0), 0),
          bookings: monthBookings.length,
        });
      }

      // Status breakdown
      const statusBreakdown = [
        { name: "Aktif", value: active.length },
        { name: "Selesai", value: completed.length },
        { name: "Dibatalkan", value: cancelled.length },
      ].filter(s => s.value > 0);

      // Payment breakdown
      const paidCount = bookings.filter(b => b.payment_status === "paid").length;
      const partialCount = bookings.filter(b => b.payment_status === "partial").length;
      const unpaidCount = bookings.filter(b => b.payment_status === "unpaid" || !b.payment_status).length;
      const paymentBreakdown = [
        { name: "Lunas", value: paidCount },
        { name: "Sebagian", value: partialCount },
        { name: "Belum Bayar", value: unpaidCount },
      ].filter(s => s.value > 0);

      return {
        totalBookings,
        activeBookings: active.length,
        completedBookings: completed.length,
        cancelledBookings: cancelled.length,
        totalRevenue,
        paidRevenue,
        unpaidRevenue,
        occupancyRate,
        avgBookingDuration,
        avgBookingValue,
        monthlyRevenue,
        statusBreakdown,
        paymentBreakdown,
        recentBookings: bookings.slice(0, 5),
      };
    },
    enabled: !!user,
  });
};

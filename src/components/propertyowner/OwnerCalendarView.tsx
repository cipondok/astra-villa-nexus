
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/utils/currency";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isSameDay, addMonths, subMonths, getDay, isToday
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, CalendarDays, Home, Wrench,
  DollarSign, ClipboardCheck, Loader2
} from "lucide-react";

interface CalendarEvent {
  id: string;
  date: Date;
  endDate?: Date;
  title: string;
  type: "booking" | "maintenance" | "payment" | "inspection";
  status: string;
  propertyName: string;
  detail?: string;
}

const EVENT_STYLES: Record<string, { color: string; bg: string; icon: any }> = {
  booking: { color: "text-chart-1", bg: "bg-chart-1/15", icon: Home },
  maintenance: { color: "text-chart-3", bg: "bg-chart-3/15", icon: Wrench },
  payment: { color: "text-destructive", bg: "bg-destructive/15", icon: DollarSign },
  inspection: { color: "text-chart-5", bg: "bg-chart-5/15", icon: ClipboardCheck },
};

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const OwnerCalendarView = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["owner-calendar", user?.id],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user) return [];

      const { data: properties } = await supabase
        .from("properties")
        .select("id, title")
        .eq("owner_id", user.id);

      if (!properties?.length) return [];
      const propertyIds = properties.map(p => p.id);
      const pMap = Object.fromEntries(properties.map(p => [p.id, p.title || "Tanpa Judul"]));

      const [bookingsRes, maintenanceRes, invoicesRes, inspectionsRes] = await Promise.all([
        supabase
          .from("rental_bookings")
          .select("id, check_in_date, check_out_date, booking_status, property_id, total_amount")
          .in("property_id", propertyIds)
          .not("booking_status", "eq", "cancelled")
          .limit(500),
        supabase
          .from("maintenance_requests")
          .select("id, created_at, title, status, priority, property_id")
          .in("property_id", propertyIds)
          .not("status", "eq", "resolved")
          .limit(200),
        supabase
          .from("rental_invoices")
          .select("id, due_date, status, total_amount, property_id, invoice_number, invoice_type")
          .in("property_id", propertyIds)
          .in("status", ["unpaid", "overdue", "partial"])
          .limit(200),
        supabase
          .from("property_inspections")
          .select("id, inspection_date, inspection_type, status, property_id")
          .in("property_id", propertyIds)
          .not("status", "eq", "completed")
          .limit(100),
      ]);

      const result: CalendarEvent[] = [];

      // Bookings → check-in & check-out events
      (bookingsRes.data || []).forEach(b => {
        result.push({
          id: `b-in-${b.id}`,
          date: new Date(b.check_in_date),
          endDate: new Date(b.check_out_date),
          title: "Check-in",
          type: "booking",
          status: b.booking_status || "confirmed",
          propertyName: pMap[b.property_id || ""] || "",
          detail: formatIDR(b.total_amount),
        });
        result.push({
          id: `b-out-${b.id}`,
          date: new Date(b.check_out_date),
          title: "Check-out",
          type: "booking",
          status: b.booking_status || "confirmed",
          propertyName: pMap[b.property_id || ""] || "",
        });
      });

      // Maintenance
      (maintenanceRes.data || []).forEach(m => {
        result.push({
          id: `m-${m.id}`,
          date: new Date(m.created_at),
          title: m.title,
          type: "maintenance",
          status: m.status,
          propertyName: pMap[m.property_id] || "",
          detail: m.priority,
        });
      });

      // Unpaid invoices (due date)
      (invoicesRes.data || []).forEach(inv => {
        result.push({
          id: `p-${inv.id}`,
          date: new Date(inv.due_date),
          title: `${inv.invoice_type} - ${inv.invoice_number}`,
          type: "payment",
          status: inv.status,
          propertyName: pMap[inv.property_id] || "",
          detail: formatIDR(inv.total_amount),
        });
      });

      // Inspections
      (inspectionsRes.data || []).forEach(ins => {
        if (ins.inspection_date) {
          result.push({
            id: `i-${ins.id}`,
            date: new Date(ins.inspection_date),
            title: `Inspeksi ${ins.inspection_type}`,
            type: "inspection",
            status: ins.status,
            propertyName: pMap[ins.property_id] || "",
          });
        }
      });

      return result;
    },
    enabled: !!user,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0=Sunday

  const eventsForDay = (day: Date) => events.filter(e => isSameDay(e.date, day));

  const selectedEvents = selectedDate ? eventsForDay(selectedDate) : [];

  // Count events by type for the month
  const monthEvents = useMemo(() => {
    return events.filter(e => isSameMonth(e.date, currentMonth));
  }, [events, currentMonth]);

  const typeCounts = useMemo(() => {
    const counts = { booking: 0, maintenance: 0, payment: 0, inspection: 0 };
    monthEvents.forEach(e => { counts[e.type]++; });
    return counts;
  }, [monthEvents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Month Summary */}
      <div className="grid grid-cols-4 gap-1.5">
        {([
          { type: "booking", label: "Booking" },
          { type: "maintenance", label: "Maint." },
          { type: "payment", label: "Bayar" },
          { type: "inspection", label: "Inspeksi" },
        ] as const).map(({ type, label }) => {
          const style = EVENT_STYLES[type];
          const Icon = style.icon;
          return (
            <Card key={type} className="p-1.5">
              <div className="flex items-center gap-1">
                <div className={`h-5 w-5 rounded flex items-center justify-center ${style.bg}`}>
                  <Icon className={`h-2.5 w-2.5 ${style.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">{typeCounts[type]}</p>
                  <p className="text-[7px] text-muted-foreground">{label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="p-2 pb-1">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <CardTitle className="text-xs">
              {format(currentMonth, "MMMM yyyy", { locale: idLocale })}
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[8px] font-medium text-muted-foreground py-0.5">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty padding cells */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const dayEvents = eventsForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors relative
                    ${isSelected ? "bg-primary text-primary-foreground" : today ? "bg-accent font-bold" : "hover:bg-muted"}
                  `}
                >
                  <span>{format(day, "d")}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-[1px]">
                      {Array.from(new Set(dayEvents.map(e => e.type))).slice(0, 3).map(type => (
                        <div
                          key={type}
                          className={`h-1 w-1 rounded-full ${
                            isSelected ? "bg-primary-foreground" :
                            type === "booking" ? "bg-chart-1" :
                            type === "maintenance" ? "bg-chart-3" :
                            type === "payment" ? "bg-destructive" :
                            "bg-chart-5"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-2 justify-center">
            {[
              { label: "Booking", cls: "bg-chart-1" },
              { label: "Maint.", cls: "bg-chart-3" },
              { label: "Bayar", cls: "bg-destructive" },
              { label: "Inspeksi", cls: "bg-chart-5" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-0.5">
                <div className={`h-1.5 w-1.5 rounded-full ${l.cls}`} />
                <span className="text-[7px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Events */}
      {selectedDate && (
        <Card>
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(selectedDate, "d MMMM yyyy", { locale: idLocale })}
              <Badge variant="secondary" className="text-[7px] px-1 py-0 h-3.5 ml-1">{selectedEvents.length} event</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-1.5">
            {selectedEvents.length === 0 ? (
              <p className="text-[9px] text-muted-foreground text-center py-4">Tidak ada event</p>
            ) : (
              selectedEvents.map(ev => {
                const style = EVENT_STYLES[ev.type];
                const Icon = style.icon;
                return (
                  <div key={ev.id} className={`flex items-start gap-2 p-1.5 rounded-md ${style.bg}`}>
                    <div className={`h-5 w-5 rounded flex items-center justify-center flex-shrink-0 bg-background`}>
                      <Icon className={`h-3 w-3 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-medium truncate">{ev.title}</p>
                      <p className="text-[8px] text-muted-foreground truncate">{ev.propertyName}</p>
                      {ev.detail && <p className="text-[8px] font-medium">{ev.detail}</p>}
                    </div>
                    <Badge
                      variant={ev.status === "overdue" ? "destructive" : "outline"}
                      className="text-[7px] px-1 py-0 h-3.5 flex-shrink-0"
                    >
                      {ev.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events List */}
      <Card>
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-xs">Mendatang</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0 space-y-1">
          {events
            .filter(e => e.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 8)
            .map(ev => {
              const style = EVENT_STYLES[ev.type];
              const Icon = style.icon;
              return (
                <div key={ev.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted/50">
                  <div className={`h-5 w-5 rounded flex items-center justify-center ${style.bg}`}>
                    <Icon className={`h-2.5 w-2.5 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-medium truncate">{ev.title}</p>
                    <p className="text-[7px] text-muted-foreground truncate">{ev.propertyName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[8px] font-medium">{format(ev.date, "d MMM", { locale: idLocale })}</p>
                    {ev.detail && <p className="text-[7px] text-muted-foreground">{ev.detail}</p>}
                  </div>
                </div>
              );
            })}
          {events.filter(e => e.date >= new Date()).length === 0 && (
            <p className="text-[9px] text-muted-foreground text-center py-4">Belum ada event mendatang</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerCalendarView;

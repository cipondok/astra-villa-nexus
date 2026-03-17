import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Key, Eye, Clock, Home, MapPin, CheckCircle, XCircle, AlertCircle,
  Calendar, Lock, ChevronRight,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';

interface BookingItem {
  id: string;
  type: 'booking' | 'viewing';
  status: string;
  date: string;
  created_at: string;
  property_title: string;
  property_location: string;
  property_image: string;
  total_amount?: number;
  duration_days?: number;
  notes?: string;
}

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Menunggu', icon: <Clock className="h-3 w-3" />, color: 'bg-chart-4/20 text-chart-4' },
  confirmed: { label: 'Dikonfirmasi', icon: <CheckCircle className="h-3 w-3" />, color: 'bg-chart-2/20 text-chart-2' },
  rejected: { label: 'Ditolak', icon: <XCircle className="h-3 w-3" />, color: 'bg-destructive/20 text-destructive' },
  cancelled: { label: 'Dibatalkan', icon: <XCircle className="h-3 w-3" />, color: 'bg-muted text-muted-foreground' },
  completed: { label: 'Selesai', icon: <CheckCircle className="h-3 w-3" />, color: 'bg-chart-2/20 text-chart-2' },
};

const MyRentalInquiries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('all');
  const formatPrice = getCurrencyFormatterShort();

  // Fetch rental bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-rental-inquiries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('rental_bookings')
        .select('id, booking_type, booking_status, check_in_date, total_amount, total_days, special_requests, created_at, properties(title, location, images, image_urls)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((b: any) => ({
        id: b.id,
        type: 'booking' as const,
        status: b.booking_status || 'pending',
        date: b.check_in_date,
        created_at: b.created_at,
        property_title: b.properties?.title || 'Properti',
        property_location: b.properties?.location || '',
        property_image: b.properties?.image_urls?.[0] || b.properties?.images?.[0] || '',
        total_amount: b.total_amount,
        duration_days: b.total_days,
        notes: b.special_requests,
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch viewing requests
  const { data: viewings = [], isLoading: viewingsLoading } = useQuery({
    queryKey: ['my-viewing-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('property_bookings')
        .select('id, booking_type, status, scheduled_date, notes, created_at, properties(title, location, images, image_urls)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((v: any) => ({
        id: v.id,
        type: 'viewing' as const,
        status: v.status || 'pending',
        date: v.scheduled_date,
        created_at: v.created_at,
        property_title: v.properties?.title || 'Properti',
        property_location: v.properties?.location || '',
        property_image: v.properties?.image_urls?.[0] || v.properties?.images?.[0] || '',
        notes: v.notes,
      }));
    },
    enabled: !!user?.id,
  });

  const isLoading = bookingsLoading || viewingsLoading;
  const allItems: BookingItem[] = [...bookings, ...viewings].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const filteredItems = tab === 'all' ? allItems
    : tab === 'bookings' ? allItems.filter(i => i.type === 'booking')
    : tab === 'viewings' ? allItems.filter(i => i.type === 'viewing')
    : tab === 'pending' ? allItems.filter(i => i.status === 'pending')
    : allItems;

  const pendingCount = allItems.filter(i => i.status === 'pending').length;
  const confirmedCount = allItems.filter(i => i.status === 'confirmed' || i.status === 'completed').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="rounded-2xl border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <Lock className="w-10 h-10 text-primary mx-auto" />
              <h2 className="text-lg font-bold">Login Diperlukan</h2>
              <Button onClick={() => navigate('/auth?mode=login')} className="rounded-xl h-10 w-full">Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> Permintaan Sewa
            </h1>
            <p className="text-[10px] text-muted-foreground">Kelola booking dan viewing Anda</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 max-w-3xl space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="rounded-2xl border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{allItems.length}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-chart-4">{pendingCount}</p>
              <p className="text-[10px] text-muted-foreground">Menunggu</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-chart-2">{confirmedCount}</p>
              <p className="text-[10px] text-muted-foreground">Dikonfirmasi</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full bg-muted rounded-xl h-9">
            <TabsTrigger value="all" className="flex-1 text-xs rounded-lg">Semua</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 text-xs rounded-lg">Booking</TabsTrigger>
            <TabsTrigger value="viewings" className="flex-1 text-xs rounded-lg">Viewing</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 text-xs rounded-lg">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-3">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
              </div>
            ) : filteredItems.length === 0 ? (
              <Card className="rounded-2xl border-border/30">
                <CardContent className="p-8 text-center">
                  <Home className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Belum ada permintaan</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Jelajahi properti disewa untuk mulai</p>
                  <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={() => navigate('/disewa')}>
                    Cari Properti Sewa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea style={{ maxHeight: '500px' }}>
                <div className="space-y-2">
                  {filteredItems.map(item => {
                    const sts = STATUS_MAP[item.status] || STATUS_MAP.pending;
                    return (
                      <Card
                        key={`${item.type}-${item.id}`}
                        className="rounded-2xl border-border/30 hover:border-primary/20 transition-colors cursor-pointer active:scale-[0.98]"
                        onClick={() => navigate(`/properties/${item.id}`)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          {/* Image */}
                          <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {item.property_image ? (
                              <img src={item.property_image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Home className="h-6 w-6 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-0.5">
                                {item.type === 'viewing' ? <Eye className="h-2.5 w-2.5" /> : <Key className="h-2.5 w-2.5" />}
                                {item.type === 'viewing' ? 'Viewing' : 'Booking'}
                              </Badge>
                              <Badge className={`text-[9px] px-1.5 py-0 gap-0.5 ${sts.color}`}>
                                {sts.icon} {sts.label}
                              </Badge>
                            </div>
                            <p className="text-xs font-semibold text-foreground truncate">{item.property_title}</p>
                            {item.property_location && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                                <MapPin className="h-2.5 w-2.5 flex-shrink-0" /> {item.property_location}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {item.date ? format(new Date(item.date), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                              </span>
                              {item.total_amount && item.total_amount > 0 && (
                                <span className="font-medium text-primary">{formatPrice(item.total_amount)}</span>
                              )}
                              <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: idLocale })}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyRentalInquiries;

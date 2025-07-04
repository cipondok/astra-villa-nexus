import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DollarSign, 
  Calendar, 
  Star, 
  Shield,
  TrendingUp,
  TrendingDown,
  Home,
  Building2
} from 'lucide-react';

interface VendorStats {
  totalEarnings: number;
  monthlyEarnings: number;
  earningsTrend: number;
  totalBookings: number;
  avgRating: number;
  bpjsStatus: 'active' | 'verification_needed' | 'expired';
  propertyType: 'residential' | 'commercial';
}

const VendorSmartSummary = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VendorStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    earningsTrend: 0,
    totalBookings: 0,
    avgRating: 0,
    bpjsStatus: 'verification_needed',
    propertyType: 'residential'
  });

  useEffect(() => {
    if (user) {
      loadVendorStats();
    }
  }, [user]);

  const loadVendorStats = async () => {
    try {
      // Load business profile with error handling
      const { data: profile, error: profileError } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('vendor_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        // Use default values if profile doesn't exist
        setStats({
          totalEarnings: 0,
          monthlyEarnings: 0,
          earningsTrend: 0,
          totalBookings: 0,
          avgRating: 0,
          bpjsStatus: 'verification_needed',
          propertyType: 'residential'
        });
        return;
      }

      // Load services with error handling
      const { data: services, error: servicesError } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', user?.id);

      if (servicesError) {
        console.error('Services error:', servicesError);
      }

      // Calculate BPJS status
      const bpjsStatus = profile?.bpjs_ketenagakerjaan_verified 
        ? 'active' 
        : 'verification_needed';

      // Determine property type from services or profile
      const hasCommercialServices = services?.some(s => 
        s.service_category?.includes('commercial') || 
        s.admin_approval_notes?.includes('commercial')
      );

      setStats({
        totalEarnings: 15420000, // Mock data - replace with real calculation
        monthlyEarnings: 2340000,
        earningsTrend: 12.5,
        totalBookings: services?.length || 0,
        avgRating: Number(profile?.rating) || 4.5,
        bpjsStatus: profile ? bpjsStatus : 'verification_needed',
        propertyType: hasCommercialServices ? 'commercial' : 'residential'
      });
    } catch (error) {
      console.error('Error loading vendor stats:', error);
      // Always provide fallback data
      setStats({
        totalEarnings: 0,
        monthlyEarnings: 0,
        earningsTrend: 0,
        totalBookings: 0,
        avgRating: 0,
        bpjsStatus: 'verification_needed',
        propertyType: 'residential'
      });
    }
  };

  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBPJSBadge = () => {
    switch (stats.bpjsStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">✅ BPJS Aktif</Badge>;
      case 'expired':
        return <Badge variant="destructive">⏰ BPJS Kedaluwarsa</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-800">⚠️ Butuh Verifikasi</Badge>;
    }
  };

  const getPropertyTypeIcon = () => {
    return stats.propertyType === 'commercial' 
      ? <Building2 className="h-5 w-5" />
      : <Home className="h-5 w-5" />;
  };

  const summaryCards = [
    {
      title: "Total Pendapatan",
      value: formatRupiah(stats.totalEarnings),
      trend: stats.earningsTrend,
      icon: <DollarSign className="h-6 w-6" />,
      bgColor: "from-green-500 to-green-600"
    },
    {
      title: "Bulan Ini",
      value: formatRupiah(stats.monthlyEarnings),
      trend: stats.earningsTrend,
      icon: <Calendar className="h-6 w-6" />,
      bgColor: "from-blue-500 to-blue-600"
    },
    {
      title: "Rating Rata-rata",
      value: stats.avgRating.toFixed(1),
      icon: <Star className="h-6 w-6" />,
      bgColor: "from-yellow-500 to-orange-500"
    },
    {
      title: "Status BPJS",
      value: getBPJSBadge(),
      icon: <Shield className="h-6 w-6" />,
      bgColor: stats.bpjsStatus === 'active' 
        ? "from-green-500 to-green-600" 
        : "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Property Type Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getPropertyTypeIcon()}
          <div>
            <h2 className="text-2xl font-bold">
              Dashboard {stats.propertyType === 'commercial' ? 'Komersial' : 'Perumahan'}
            </h2>
            <p className="text-muted-foreground">
              {stats.propertyType === 'commercial' 
                ? 'Layanan untuk kantor dan toko' 
                : 'Layanan untuk rumah dan properti pribadi'
              }
            </p>
          </div>
        </div>
        <Badge variant={stats.propertyType === 'commercial' ? 'destructive' : 'secondary'}>
          {stats.propertyType === 'commercial' ? 'Commercial' : 'Residential'}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index} className={`bg-gradient-to-br ${card.bgColor} text-white border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/80">{card.title}</p>
                  {typeof card.value === 'string' ? (
                    <p className="text-2xl font-bold">{card.value}</p>
                  ) : (
                    <div>{card.value}</div>
                  )}
                  {card.trend && (
                    <div className="flex items-center gap-1 text-sm">
                      {card.trend > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{Math.abs(card.trend)}%</span>
                    </div>
                  )}
                </div>
                <div className="text-white/80">
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorSmartSummary;
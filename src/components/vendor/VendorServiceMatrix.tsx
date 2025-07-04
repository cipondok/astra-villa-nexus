import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Building2, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Edit,
  Plus
} from 'lucide-react';

interface ServiceData {
  id: string;
  name: string;
  category: string;
  residential_price: number;
  commercial_price: number;
  approval_time_residential: string;
  approval_time_commercial: string;
  requirements_residential: string[];
  requirements_commercial: string[];
  status: 'active' | 'pending' | 'inactive';
}

const VendorServiceMatrix = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      const { data: vendorServices } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', user?.id);

      if (vendorServices) {
        const formattedServices: ServiceData[] = vendorServices.map(service => ({
          id: service.id,
          name: service.service_name,
          category: service.service_category || 'General',
          residential_price: 100000, // Mock data - calculate from pricing rules
          commercial_price: 150000, // Mock data - calculate with multiplier
          approval_time_residential: '1-2 Hari Kerja',
          approval_time_commercial: '3-5 Hari Kerja',
          requirements_residential: ['KTP', 'Sertifikat Keahlian'],
          requirements_commercial: ['SIUP', 'NPWP', 'BPJS Ketenagakerjaan'],
          status: service.admin_approval_status === 'approved' ? 'active' : 'pending'
        }));

        setServices(formattedServices);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      default:
        return <Badge variant="secondary">Tidak Aktif</Badge>;
    }
  };

  const ServiceTable = ({ type }: { type: 'residential' | 'commercial' }) => {
    const isCommercial = type === 'commercial';
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCommercial ? (
              <Building2 className="h-5 w-5 text-orange-600" />
            ) : (
              <Home className="h-5 w-5 text-green-600" />
            )}
            <h3 className="text-lg font-semibold">
              Layanan {isCommercial ? 'Komersial' : 'Perumahan'}
            </h3>
          </div>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Layanan
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Layanan</th>
                <th className="text-left p-3 font-medium">Harga</th>
                <th className="text-left p-3 font-medium">Waktu Persetujuan</th>
                <th className="text-left p-3 font-medium">Persyaratan</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.category}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">
                        {formatCurrency(
                          isCommercial ? service.commercial_price : service.residential_price
                        )}
                      </span>
                      {isCommercial && (
                        <Badge variant="outline" className="text-xs">
                          +50%
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        {isCommercial 
                          ? service.approval_time_commercial 
                          : service.approval_time_residential
                        }
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {(isCommercial 
                        ? service.requirements_commercial 
                        : service.requirements_residential
                      ).map((req, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs">{req}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    {getStatusBadge(service.status)}
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {services.length === 0 && (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-4">
              {isCommercial ? (
                <Building2 className="h-12 w-12 text-muted-foreground" />
              ) : (
                <Home className="h-12 w-12 text-muted-foreground" />
              )}
              <div>
                <h4 className="font-semibold mb-2">
                  Belum ada layanan {isCommercial ? 'komersial' : 'perumahan'}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Tambahkan layanan untuk mulai menerima pesanan
                </p>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Layanan Pertama
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <Building2 className="h-5 w-5" />
          </div>
          Manajemen Layanan
        </CardTitle>
        <CardDescription>
          Kelola layanan berdasarkan jenis properti dengan persyaratan dan tarif yang berbeda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="residential" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="residential" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Perumahan
            </TabsTrigger>
            <TabsTrigger value="commercial" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Komersial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="residential">
            <ServiceTable type="residential" />
          </TabsContent>

          <TabsContent value="commercial">
            <ServiceTable type="commercial" />
          </TabsContent>
        </Tabs>

        {/* Summary Footer */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Total Layanan: {services.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span>Menunggu Persetujuan: {services.filter(s => s.status === 'pending').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>Rata-rata Tarif: {formatCurrency(125000)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorServiceMatrix;
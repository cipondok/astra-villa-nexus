import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { 
  Home, 
  Building2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface PropertyTypeData {
  currentType: 'residential' | 'commercial';
  canChange: boolean;
  lastChangeDate?: string;
  changeRestriction?: string;
}

const VendorPropertyTypeToggle = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [propertyData, setPropertyData] = useState<PropertyTypeData>({
    currentType: 'residential',
    canChange: true
  });
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (user) {
      loadPropertyTypeData();
    }
  }, [user]);

  const loadPropertyTypeData = async () => {
    try {
      // Load current property type from vendor profile or services
      const { data: profile } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('vendor_id', user?.id)
        .single();

      const { data: services } = await supabase
        .from('vendor_services')
        .select('service_category, admin_approval_status')
        .eq('vendor_id', user?.id);

      // Determine current property type
      const hasCommercialServices = services?.some(s => 
        s.service_category?.includes('commercial') ||
        s.admin_approval_status?.includes('commercial')
      );

      // Check if user can change (simplified logic - in real app, check last change date)
      const canChange = !profile?.business_finalized_at || 
        (profile?.can_change_nature !== false);

      setPropertyData({
        currentType: hasCommercialServices ? 'commercial' : 'residential',
        canChange,
        lastChangeDate: profile?.last_nature_change_at,
        changeRestriction: canChange ? undefined : 'Perubahan dibatasi oleh admin atau waktu tunggu'
      });
    } catch (error) {
      console.error('Error loading property type data:', error);
    }
  };

  const handlePropertyTypeChange = async () => {
    if (!propertyData.canChange) {
      showError('Perubahan Dibatasi', 'Anda tidak dapat mengubah jenis properti saat ini.');
      return;
    }

    setIsChanging(true);
    try {
      const newType = propertyData.currentType === 'residential' ? 'commercial' : 'residential';
      
      // Update vendor business profile
      const { error: profileError } = await supabase
        .from('vendor_business_profiles')
        .update({
          last_nature_change_at: new Date().toISOString(),
          // Add other property type specific updates
        })
        .eq('vendor_id', user?.id);

      if (profileError) throw profileError;

      // Create change request for admin approval
      const { error: requestError } = await supabase
        .from('vendor_change_requests')
        .insert({
          vendor_id: user?.id,
          request_type: 'property_type_change',
          reason: `Perubahan dari ${propertyData.currentType} ke ${newType}`,
          current_data: { property_type: propertyData.currentType },
          requested_data: { property_type: newType },
          status: 'pending'
        });

      if (requestError) throw requestError;

      showSuccess(
        'Permintaan Perubahan Diajukan', 
        `Permintaan perubahan ke ${newType === 'commercial' ? 'Komersial' : 'Perumahan'} sedang ditinjau admin.`
      );

      // Reload data
      loadPropertyTypeData();
    } catch (error: any) {
      console.error('Error changing property type:', error);
      showError('Gagal Mengubah', error.message || 'Terjadi kesalahan saat mengubah jenis properti.');
    } finally {
      setIsChanging(false);
    }
  };

  const getTypeInfo = (type: 'residential' | 'commercial') => {
    if (type === 'commercial') {
      return {
        title: 'Komersial',
        description: 'Layanan untuk kantor, toko, dan bisnis',
        icon: <Building2 className="h-5 w-5" />,
        requirements: [
          'BPJS Ketenagakerjaan (Wajib)',
          'SIUP/NIB',
          'NPWP',
          'Tarif +50% dari residential'
        ],
        badge: <Badge variant="destructive">Commercial</Badge>
      };
    } else {
      return {
        title: 'Perumahan',
        description: 'Layanan untuk rumah dan properti pribadi',
        icon: <Home className="h-5 w-5" />,
        requirements: [
          'KTP dan dokumen identitas',
          'Sertifikat keahlian (opsional)',
          'BPJS (opsional, untuk kredibilitas)',
          'Tarif standar'
        ],
        badge: <Badge variant="secondary">Residential</Badge>
      };
    }
  };

  const currentInfo = getTypeInfo(propertyData.currentType);
  const targetInfo = getTypeInfo(propertyData.currentType === 'residential' ? 'commercial' : 'residential');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Jenis Properti Layanan
        </CardTitle>
        <CardDescription>
          Kelola jenis properti untuk layanan Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Type */}
        <div>
          <h4 className="font-semibold mb-3">Jenis Saat Ini</h4>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {currentInfo.icon}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentInfo.title}</span>
                  {currentInfo.badge}
                </div>
                <p className="text-sm text-muted-foreground">{currentInfo.description}</p>
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>

        {/* Requirements Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              {currentInfo.icon}
              Persyaratan {currentInfo.title}
            </h5>
            <ul className="space-y-2">
              {currentInfo.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              {targetInfo.icon}
              Persyaratan {targetInfo.title}
            </h5>
            <ul className="space-y-2">
              {targetInfo.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Change Restrictions */}
        {!propertyData.canChange && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {propertyData.changeRestriction}
            </AlertDescription>
          </Alert>
        )}

        {/* Change Action */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="font-medium">
              Beralih ke {targetInfo.title}?
            </p>
            <p className="text-sm text-muted-foreground">
              Perubahan memerlukan persetujuan admin
            </p>
          </div>
          <Button
            onClick={handlePropertyTypeChange}
            disabled={!propertyData.canChange || isChanging}
            className="flex items-center gap-2"
          >
            {isChanging ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              targetInfo.icon
            )}
            {isChanging ? 'Memproses...' : `Ganti ke ${targetInfo.title}`}
          </Button>
        </div>

        {/* Information Footer */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          💡 <strong>Info:</strong> Perubahan jenis properti akan mempengaruhi tarif, persyaratan dokumen, dan proses persetujuan layanan Anda.
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorPropertyTypeToggle;
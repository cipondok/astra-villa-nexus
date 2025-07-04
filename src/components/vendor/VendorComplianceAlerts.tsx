import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield,
  FileText,
  Calendar
} from 'lucide-react';

interface ComplianceAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  action?: string;
  daysLeft?: number;
}

const VendorComplianceAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');

  useEffect(() => {
    if (user) {
      loadComplianceData();
    }
  }, [user]);

  const loadComplianceData = async () => {
    try {
      // Load vendor business profile with error handling
      const { data: profile, error: profileError } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('vendor_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        // Set default residential if no profile
        setPropertyType('residential');
        return;
      }

      // Load services with error handling
      const { data: services, error: servicesError } = await supabase
        .from('vendor_services')
        .select('service_category, admin_approval_status')
        .eq('vendor_id', user?.id);

      if (servicesError) {
        console.error('Services error:', servicesError);
      }

      const isCommercial = services?.some(s => 
        s.service_category?.includes('commercial') ||
        s.admin_approval_status?.includes('commercial')
      ) || false;

      setPropertyType(isCommercial ? 'commercial' : 'residential');

      // Generate alerts based on compliance status
      const newAlerts: ComplianceAlert[] = [];

      // Only generate alerts if we have profile data
      if (profile) {
        // BPJS Ketenagakerjaan check
        if (isCommercial && !profile.bpjs_ketenagakerjaan_verified) {
          newAlerts.push({
            id: 'bpjs-ketenagakerjaan',
            level: 'critical',
            message: 'BPJS Ketenagakerjaan wajib untuk layanan komersial!',
            action: 'Verifikasi Sekarang'
          });
        }

        // Profile completion check
        if ((profile.profile_completion_percentage || 0) < 100) {
          newAlerts.push({
            id: 'profile-incomplete',
            level: 'info',
            message: `Profil ${profile.profile_completion_percentage || 0}% lengkap. Lengkapi untuk meningkatkan kredibilitas.`,
            action: 'Lengkapi Profil'
          });
        }
      } else {
        // No profile exists - create default alert
        newAlerts.push({
          id: 'profile-missing',
          level: 'warning',
          message: 'Profil vendor belum dibuat. Lengkapi profil untuk mulai menerima pesanan.',
          action: 'Buat Profil'
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error loading compliance data:', error);
      // Set default state on error
      setPropertyType('residential');
      setAlerts([]);
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleAlertAction = (alertId: string) => {
    switch (alertId) {
      case 'bpjs-ketenagakerjaan':
      case 'bpjs-expiry':
      case 'bpjs-expired':
        // Navigate to BPJS verification
        window.location.hash = '#bpjs-verification';
        break;
      case 'siup-missing':
        // Navigate to business license upload
        window.location.hash = '#business-documents';
        break;
      case 'profile-incomplete':
        // Navigate to profile completion
        window.location.hash = '#profile-completion';
        break;
    }
  };

  if (alerts.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          ✅ Semua persyaratan compliance terpenuhi untuk layanan {propertyType === 'commercial' ? 'komersial' : 'perumahan'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Status Compliance</h3>
        <Badge variant={propertyType === 'commercial' ? 'destructive' : 'secondary'}>
          {propertyType === 'commercial' ? 'Komersial' : 'Perumahan'}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={getAlertVariant(alert.level)}>
            {getAlertIcon(alert.level)}
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{alert.message}</span>
                {alert.daysLeft && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {alert.daysLeft} hari
                  </Badge>
                )}
              </div>
              {alert.action && (
                <Button
                  size="sm"
                  variant={alert.level === 'critical' ? 'destructive' : 'outline'}
                  onClick={() => handleAlertAction(alert.id)}
                >
                  {alert.action}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Property Type Context */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {propertyType === 'commercial' ? (
            <FileText className="h-4 w-4 text-orange-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <span className="font-medium">
            Persyaratan {propertyType === 'commercial' ? 'Komersial' : 'Perumahan'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {propertyType === 'commercial' 
            ? 'Layanan komersial memerlukan BPJS Ketenagakerjaan, SIUP, dan dokumen bisnis tambahan.'
            : 'Layanan perumahan memerlukan dokumen standar dan BPJS opsional untuk meningkatkan kredibilitas.'
          }
        </p>
      </div>
    </div>
  );
};

export default VendorComplianceAlerts;
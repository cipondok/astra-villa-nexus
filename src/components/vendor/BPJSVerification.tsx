import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, X, Clock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BPJSVerificationProps {
  propertyType: 'residential' | 'commercial';
  vendorId?: string;
  onVerificationChange: (data: {
    bpjs_ketenagakerjaan_status: string;
    bpjs_kesehatan_status: string;
    bpjs_ketenagakerjaan_number?: string;
    bpjs_kesehatan_number?: string;
  }) => void;
  showKetenagakerjaan?: boolean;
  showKesehatan?: boolean;
}

const BPJSVerification = ({ 
  propertyType, 
  vendorId,
  onVerificationChange,
  showKetenagakerjaan = true,
  showKesehatan = false
}: BPJSVerificationProps) => {
  const [verificationStatus, setVerificationStatus] = useState({
    ketenagakerjaan: 'unregistered',
    kesehatan: 'unregistered'
  });
  const [verifying, setVerifying] = useState({
    ketenagakerjaan: false,
    kesehatan: false
  });
  const [bpjsNumbers, setBpjsNumbers] = useState({
    ketenagakerjaan: '',
    kesehatan: ''
  });

  const verifyBPJS = async (type: 'ketenagakerjaan' | 'kesehatan', number: string) => {
    if (!number.trim()) return;

    setVerifying(prev => ({ ...prev, [type]: true }));

    try {
      // For now, we'll use a simple validation and manual verification
      // Later this can be replaced with actual BPJS API integration
      const isValid = validateBPJSNumber(number, type);
      
      if (isValid) {
        // Use secure function to log verification attempt
        if (vendorId) {
          try {
            const { data, error } = await supabase.rpc('create_bpjs_verification_log_secure', {
              p_vendor_id: vendorId,
              p_bpjs_number: number,
              p_verification_type: type,
              p_verification_status: 'verified'
            });
            
            if (error) {
              console.warn('BPJS verification logging requires admin privileges:', error.message);
              // Continue with verification even if logging fails
            }
          } catch (error) {
            console.warn('Secure BPJS logging not available:', error);
            // Continue with verification process
          }
        }

        setVerificationStatus(prev => ({ ...prev, [type]: 'verified' }));
        
        onVerificationChange({
          bpjs_ketenagakerjaan_status: type === 'ketenagakerjaan' ? 'verified' : verificationStatus.ketenagakerjaan,
          bpjs_kesehatan_status: type === 'kesehatan' ? 'verified' : verificationStatus.kesehatan,
          [`bpjs_${type}_number`]: number
        });
      } else {
        setVerificationStatus(prev => ({ ...prev, [type]: 'failed' }));
        
        onVerificationChange({
          bpjs_ketenagakerjaan_status: type === 'ketenagakerjaan' ? 'failed' : verificationStatus.ketenagakerjaan,
          bpjs_kesehatan_status: type === 'kesehatan' ? 'failed' : verificationStatus.kesehatan
        });
      }
    } catch (error) {
      console.error('BPJS verification error:', error);
      setVerificationStatus(prev => ({ ...prev, [type]: 'failed' }));
    } finally {
      setVerifying(prev => ({ ...prev, [type]: false }));
    }
  };

  const validateBPJSNumber = (number: string, type: 'ketenagakerjaan' | 'kesehatan'): boolean => {
    // Basic validation rules for Indonesian BPJS numbers
    const cleanNumber = number.replace(/\D/g, '');
    
    if (type === 'ketenagakerjaan') {
      // BPJS Ketenagakerjaan: 11 digits
      return cleanNumber.length === 11;
    } else {
      // BPJS Kesehatan: 13 digits
      return cleanNumber.length === 13;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">Not Verified</Badge>;
    }
  };

  const isCommercialRequired = propertyType === 'commercial';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          BPJS Verification
          {isCommercialRequired && (
            <Badge variant="destructive" className="text-xs">Required for Commercial</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Type Context */}
        <Alert>
          <AlertDescription>
            {isCommercialRequired ? (
              <div className="space-y-2">
                <p className="font-semibold text-orange-700">
                  🏢 Komersial - BPJS Ketenagakerjaan Wajib
                </p>
                <p className="text-sm">
                  Untuk layanan komersial, vendor harus terdaftar BPJS Ketenagakerjaan 
                  sesuai peraturan ketenagakerjaan Indonesia.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-green-700">
                  🏠 Perumahan - BPJS Opsional
                </p>
                <p className="text-sm">
                  BPJS dapat meningkatkan kredibilitas vendor namun tidak wajib 
                  untuk layanan perumahan.
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* BPJS Ketenagakerjaan */}
        {showKetenagakerjaan && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                BPJS Ketenagakerjaan {isCommercialRequired && <span className="text-red-500">*</span>}
              </Label>
              {getStatusBadge(verificationStatus.ketenagakerjaan)}
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Masukkan nomor BPJS Ketenagakerjaan (11 digit)"
                  value={bpjsNumbers.ketenagakerjaan}
                  onChange={(e) => setBpjsNumbers(prev => ({ 
                    ...prev, 
                    ketenagakerjaan: e.target.value 
                  }))}
                  maxLength={15}
                />
              </div>
              <Button
                onClick={() => verifyBPJS('ketenagakerjaan', bpjsNumbers.ketenagakerjaan)}
                disabled={verifying.ketenagakerjaan || !bpjsNumbers.ketenagakerjaan.trim()}
                size="sm"
              >
                {verifying.ketenagakerjaan ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStatusIcon(verificationStatus.ketenagakerjaan)}
              {verificationStatus.ketenagakerjaan === 'verified' && 'BPJS Ketenagakerjaan verified successfully'}
              {verificationStatus.ketenagakerjaan === 'failed' && 'Verification failed. Please check your number.'}
              {verificationStatus.ketenagakerjaan === 'unregistered' && 'Enter your BPJS Ketenagakerjaan number'}
            </div>
          </div>
        )}

        {/* BPJS Kesehatan */}
        {showKesehatan && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">BPJS Kesehatan</Label>
              {getStatusBadge(verificationStatus.kesehatan)}
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Masukkan nomor BPJS Kesehatan (13 digit)"
                  value={bpjsNumbers.kesehatan}
                  onChange={(e) => setBpjsNumbers(prev => ({ 
                    ...prev, 
                    kesehatan: e.target.value 
                  }))}
                  maxLength={15}
                />
              </div>
              <Button
                onClick={() => verifyBPJS('kesehatan', bpjsNumbers.kesehatan)}
                disabled={verifying.kesehatan || !bpjsNumbers.kesehatan.trim()}
                size="sm"
              >
                {verifying.kesehatan ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStatusIcon(verificationStatus.kesehatan)}
              {verificationStatus.kesehatan === 'verified' && 'BPJS Kesehatan verified successfully'}
              {verificationStatus.kesehatan === 'failed' && 'Verification failed. Please check your number.'}
              {verificationStatus.kesehatan === 'unregistered' && 'Enter your BPJS Kesehatan number (optional)'}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> BPJS verification meningkatkan kepercayaan pelanggan</p>
          <p>📞 Bantuan BPJS: 175 (Ketenagakerjaan) | 165 (Kesehatan)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BPJSVerification;
import React, { useEffect, useState } from 'react';
import { ExternalLink, Building2, CheckCircle, AlertCircle, HelpCircle, Clock, Loader2, RefreshCw, Search, X, ThumbsUp, ThumbsDown, MapPin, Phone, Mail, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AHUCompanyData {
  companyAddress: string;
  skNumber: string;
  npwp: string;
  notaryName: string;
  companyPhone: string;
  companyEmail: string;
}

interface CompanyVerificationFieldProps {
  companyName: string;
  registrationNumber: string;
  isVerified?: boolean;
  onRegistrationChange: (value: string) => void;
  onAHUDataChange?: (data: AHUCompanyData) => void;
  disabled?: boolean;
  className?: string;
}

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface VerificationState {
  status: VerificationStatus;
  verifiedAt: string | null;
  loading: boolean;
  submitting: boolean;
  message: string | null;
}

const CompanyVerificationField: React.FC<CompanyVerificationFieldProps> = ({
  companyName,
  registrationNumber,
  isVerified = false,
  onRegistrationChange,
  onAHUDataChange,
  disabled = false,
  className,
}) => {
  const [verification, setVerification] = useState<VerificationState>({
    status: isVerified ? 'verified' : 'unverified',
    verifiedAt: null,
    loading: true,
    submitting: false,
    message: null,
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [ahuWindowOpened, setAhuWindowOpened] = useState(false);
  const [ahuData, setAhuData] = useState<AHUCompanyData>({
    companyAddress: '',
    skNumber: '',
    npwp: '',
    notaryName: '',
    companyPhone: '',
    companyEmail: '',
  });

  // Fetch current verification status from database
  const fetchVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('company_verified, company_verified_at, company_registration_number')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching verification status:', error);
        return;
      }

      let status: VerificationStatus = 'unverified';
      
      if (data?.company_verified === true) {
        status = 'verified';
      } else if (data?.company_registration_number && data?.company_registration_number.trim() !== '') {
        status = 'pending';
      }

      setVerification(prev => ({
        ...prev,
        status,
        verifiedAt: data?.company_verified_at || null,
        loading: false,
      }));
    } catch (error) {
      console.error('Error checking verification:', error);
      setVerification(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  useEffect(() => {
    if (isVerified) {
      setVerification(prev => ({ ...prev, status: 'verified' }));
    }
  }, [isVerified]);

  // Open AHU directly in browser - server-side auto-check is not possible due to CAPTCHA
  const handleCheckAHU = async () => {
    if (!companyName.trim()) {
      toast.error('Masukkan nama perusahaan terlebih dahulu');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    setVerification(prev => ({ ...prev, submitting: true, message: 'Membuka AHU...' }));

    // Copy company name to clipboard for easy pasting in AHU
    try {
      await navigator.clipboard.writeText(companyName.trim());
      toast.success(`"${companyName.trim()}" disalin ke clipboard! Paste di AHU untuk mencari.`, { duration: 5000 });
    } catch {
      // Clipboard API may fail in some contexts
      toast.info('Buka AHU dan cari nama perusahaan Anda.', { duration: 4000 });
    }

    // Log the attempt via edge function (background, non-blocking)
    supabase.functions.invoke('verify-ahu-company', {
      body: { company_name: companyName.trim(), user_id: user.id },
    }).catch(() => {});

    // Open AHU directly
    openAHUPopup();
    setVerification(prev => ({ ...prev, submitting: false }));
  };

  const openAHUPopup = () => {
    // Open as a regular new tab — AHU blocks popup/iframe access
    const newTab = window.open('https://ahu.go.id/pencarian/profil-pt', '_blank', 'noopener,noreferrer');
    
    if (newTab) {
      setAhuWindowOpened(true);
      setTimeout(() => setConfirmDialogOpen(true), 1000);
    } else {
      // Fallback: direct link click
      toast.info('Silakan buka link AHU secara manual.', { duration: 5000 });
      const a = document.createElement('a');
      a.href = 'https://ahu.go.id/pencarian/profil-pt';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      setAhuWindowOpened(true);
      setTimeout(() => setConfirmDialogOpen(true), 1500);
    }
  };

  const handleAhuDataField = (field: keyof AHUCompanyData, value: string) => {
    setAhuData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  // Submit for verification with AHU data
  const handleSubmitVerification = async (userFoundCompany: boolean) => {
    if (!companyName.trim()) {
      toast.error('Please enter your company name first');
      return;
    }

    setVerification(prev => ({ ...prev, submitting: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit for verification');
        setVerification(prev => ({ ...prev, submitting: false }));
        return;
      }

      // Build profile update with AHU data
      const profileUpdate: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (registrationNumber.trim()) {
        profileUpdate.company_registration_number = registrationNumber.trim();
      }

      // If user found company and provided AHU data, auto-fill SK number
      if (userFoundCompany && ahuData.skNumber.trim()) {
        profileUpdate.company_registration_number = ahuData.skNumber.trim();
        onRegistrationChange(ahuData.skNumber.trim());
      }

      // Update business_address from AHU if provided
      if (userFoundCompany && ahuData.companyAddress.trim()) {
        profileUpdate.business_address = ahuData.companyAddress.trim();
      }

      if (Object.keys(profileUpdate).length > 1) {
        await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', user.id);
      }

      // Notify parent of AHU data
      if (userFoundCompany && onAHUDataChange) {
        onAHUDataChange(ahuData);
      }

      // Create admin alert with AHU data included
      await supabase.from('admin_alerts').insert({
        type: 'verification_request',
        title: userFoundCompany 
          ? '✅ Company Verification - User Found in AHU' 
          : 'Company Verification Request',
        message: userFoundCompany
          ? `User ${user.email} confirmed finding "${companyName}" in AHU database. Please verify and approve.`
          : `User ${user.email} could not find "${companyName}" in AHU. Please investigate.`,
        priority: userFoundCompany ? 'high' : 'medium',
        action_required: true,
        reference_type: 'company_verification',
        reference_id: user.id,
        metadata: {
          user_id: user.id,
          company_name: companyName,
          registration_number: ahuData.skNumber || registrationNumber || 'Not provided',
          user_found_in_ahu: userFoundCompany,
          ahu_search_url: 'https://ahu.go.id/pencarian/profil-pt',
          ahu_data: userFoundCompany ? {
            company_address: ahuData.companyAddress || null,
            sk_number: ahuData.skNumber || null,
            npwp: ahuData.npwp || null,
            notary_name: ahuData.notaryName || null,
            company_phone: ahuData.companyPhone || null,
            company_email: ahuData.companyEmail || null,
          } : null,
        }
      });

      setVerification(prev => ({ 
        ...prev, 
        status: 'pending', 
        submitting: false,
        message: userFoundCompany 
          ? 'Company confirmed! Admin will verify shortly.'
          : 'Request submitted. Admin will investigate.'
      }));
      
      setConfirmDialogOpen(false);
      setAhuWindowOpened(false);
      
      toast.success(userFoundCompany 
        ? 'Verification submitted with AHU data! Admin will approve shortly.'
        : 'Request submitted for admin review.'
      );
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('An error occurred');
      setVerification(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleRefreshStatus = async () => {
    setVerification(prev => ({ ...prev, loading: true }));
    await fetchVerificationStatus();
    toast.success('Status refreshed');
  };

  const getStatusBadge = () => {
    if (verification.loading) {
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground gap-1">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Checking...
        </Badge>
      );
    }

    switch (verification.status) {
      case 'verified':
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary gap-1">
            <CheckCircle className="h-2.5 w-2.5" />
            AHU Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-warning/30 text-warning-foreground gap-1">
            <Clock className="h-2.5 w-2.5" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-destructive/30 text-destructive gap-1">
            <AlertCircle className="h-2.5 w-2.5" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground gap-1">
            Not Verified
          </Badge>
        );
    }
  };

  const hasAnyAhuData = Object.values(ahuData).some(v => v.trim() !== '');

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Registration Number Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="company_registration" className="text-xs flex items-center gap-1.5">
              NIB / Company Registration Number
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs">
                      Enter your company's NIB (Nomor Induk Berusaha) or SK number 
                      from AHU for verification purposes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            
            <div className="flex items-center gap-1.5">
              {getStatusBadge()}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={handleRefreshStatus}
                      disabled={verification.loading}
                    >
                      <RefreshCw className={cn("h-3 w-3", verification.loading && "animate-spin")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Refresh status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              id="company_registration"
              placeholder="e.g., AHU-0000000.AH.01.01.TAHUN 2024"
              value={registrationNumber}
              onChange={(e) => onRegistrationChange(e.target.value)}
              disabled={disabled || verification.status === 'verified'}
              className="h-9 flex-1 font-mono text-xs"
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleCheckAHU}
              className="h-9 gap-1.5 shrink-0"
              disabled={verification.status === 'verified' || verification.submitting}
            >
              {verification.submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              Check AHU
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Cara verifikasi:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Klik <strong>Check AHU</strong> — nama perusahaan otomatis disalin</li>
              <li>Di halaman AHU, <strong>paste</strong> nama dan klik cari</li>
              <li>Klik <strong>Profil Lengkap</strong> pada hasil pencarian</li>
              <li>Salin data (SK, NPWP, Alamat) ke form konfirmasi</li>
            </ol>
          </div>
        </div>

        {/* Status Sections */}
        {verification.status === 'pending' && (
          <div className="flex items-center gap-2 text-xs text-warning-foreground p-2.5 rounded-lg bg-warning/10 border border-warning/30">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {verification.message || 'Your company is pending verification. Usually takes 1-2 business days.'}
            </span>
          </div>
        )}

        {verification.status === 'verified' && (
          <div className="flex items-center gap-2 text-xs text-primary p-2.5 rounded-lg bg-primary/10 border border-primary/30">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>
              Your company is verified on AHU
              {verification.verifiedAt && (
                <span className="text-muted-foreground ml-1">
                  (since {new Date(verification.verifiedAt).toLocaleDateString()})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Show confirmation prompt if AHU was opened */}
        {ahuWindowOpened && !confirmDialogOpen && verification.status === 'unverified' && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-xs text-primary">
              Did you find your company on AHU?
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setConfirmDialogOpen(true)}
              >
                Confirm Result
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog with Data Capture */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-lg bg-background border border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              AHU Verification Result
            </DialogTitle>
            <DialogDescription className="text-sm">
              Did you find <strong className="text-foreground">"{companyName}"</strong> on AHU?
              If yes, please copy the company details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
              <p className="text-[11px] text-muted-foreground">
                💡 Buka <strong className="text-foreground">Profil Lengkap</strong> perusahaan di AHU, lalu salin data berikut ke form ini.
              </p>
            </div>

            {/* SK Number / Nomor SK */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-muted-foreground" />
                Nomor SK / SK Number
              </Label>
              <Input
                placeholder="e.g., AHU-0012345.AH.01.01.TAHUN 2024"
                value={ahuData.skNumber}
                onChange={(e) => handleAhuDataField('skNumber', e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            {/* Company Address */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                Alamat Perusahaan / Company Address
              </Label>
              <Textarea
                placeholder="Salin alamat lengkap dari AHU..."
                value={ahuData.companyAddress}
                onChange={(e) => handleAhuDataField('companyAddress', e.target.value)}
                className="text-xs min-h-[60px] resize-none"
                rows={2}
              />
            </div>

            {/* NPWP */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-muted-foreground" />
                NPWP Perusahaan
              </Label>
              <Input
                placeholder="e.g., 01.234.567.8-012.345"
                value={ahuData.npwp}
                onChange={(e) => handleAhuDataField('npwp', e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            {/* Notary Name */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                Nama Notaris
              </Label>
              <Input
                placeholder="Nama notaris dari akta pendirian..."
                value={ahuData.notaryName}
                onChange={(e) => handleAhuDataField('notaryName', e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* Contact Info Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  Telepon
                </Label>
                <Input
                  placeholder="021-xxx / 08xx"
                  value={ahuData.companyPhone}
                  onChange={(e) => handleAhuDataField('companyPhone', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  placeholder="company@email.com"
                  value={ahuData.companyEmail}
                  onChange={(e) => handleAhuDataField('companyEmail', e.target.value)}
                  className="h-8 text-xs"
                  type="email"
                />
              </div>
            </div>

            {hasAnyAhuData && (
              <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-[11px] text-primary flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Data akan disimpan ke profil dan dikirim ke admin untuk verifikasi.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => handleSubmitVerification(false)}
              disabled={verification.submitting}
            >
              <ThumbsDown className="h-4 w-4" />
              Not Found
            </Button>
            <Button
              type="button"
              variant="default"
              className="flex-1 gap-1.5"
              onClick={() => handleSubmitVerification(true)}
              disabled={verification.submitting}
            >
              {verification.submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
              )}
              Yes, Found It!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyVerificationField;

import React, { useEffect, useState } from 'react';
import { ExternalLink, Building2, CheckCircle, AlertCircle, HelpCircle, Clock, Loader2, RefreshCw, Search, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyVerificationFieldProps {
  companyName: string;
  registrationNumber: string;
  isVerified?: boolean;
  onRegistrationChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'not_found' | 'checking';

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
  const [ahuPopupOpen, setAhuPopupOpen] = useState(false);
  const [ahuLoading, setAhuLoading] = useState(true);

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

  // Dynamic AHU verification
  const handleDynamicVerification = async () => {
    if (!companyName.trim()) {
      toast.error('Please enter your company name first');
      return;
    }

    setVerification(prev => ({ ...prev, status: 'checking', submitting: true, message: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to verify your company');
        setVerification(prev => ({ ...prev, status: 'unverified', submitting: false }));
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-ahu-company', {
        body: {
          company_name: companyName.trim(),
          user_id: user.id,
        }
      });

      if (error) {
        console.error('Error calling verification function:', error);
        toast.error('Verification service unavailable');
        setVerification(prev => ({ 
          ...prev, 
          status: 'pending', 
          submitting: false,
          message: 'Auto-verification unavailable, submitted for manual review'
        }));
        return;
      }

      console.log('Verification result:', data);

      if (data.status === 'verified') {
        setVerification(prev => ({ 
          ...prev, 
          status: 'verified', 
          submitting: false,
          verifiedAt: new Date().toISOString(),
          message: data.message
        }));
        toast.success('Company verified successfully from AHU!');
      } else if (data.status === 'not_found') {
        setVerification(prev => ({ 
          ...prev, 
          status: 'not_found', 
          submitting: false,
          message: data.message
        }));
        toast.warning('Company not found in AHU database');
      } else {
        setVerification(prev => ({ 
          ...prev, 
          status: 'pending', 
          submitting: false,
          message: data.message
        }));
        toast.info('Submitted for manual admin review');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      toast.error('An error occurred during verification');
      setVerification(prev => ({ ...prev, status: 'pending', submitting: false }));
    }
  };

  // Submit for manual verification
  const handleSubmitForManualReview = async () => {
    if (!companyName.trim()) {
      toast.error('Please enter your company name first');
      return;
    }

    setVerification(prev => ({ ...prev, submitting: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit for verification');
        return;
      }

      if (registrationNumber.trim()) {
        await supabase
          .from('profiles')
          .update({
            company_registration_number: registrationNumber.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      await supabase.from('admin_alerts').insert({
        type: 'verification_request',
        title: 'Company Verification Request - Manual Review',
        message: `User ${user.email} submitted company "${companyName}" for manual verification`,
        priority: 'medium',
        action_required: true,
        metadata: {
          user_id: user.id,
          company_name: companyName,
          registration_number: registrationNumber || 'Not provided',
          ahu_search_url: `https://ahu.go.id/pencarian/nama-pt?q=${encodeURIComponent(companyName)}`
        }
      });

      setVerification(prev => ({ ...prev, status: 'pending', submitting: false }));
      toast.success('Submitted for manual verification!');
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

  // Build AHU lookup URL with company name
  const getAHULookupUrl = () => {
    if (companyName.trim()) {
      return `https://ahu.go.id/pencarian/nama-pt?q=${encodeURIComponent(companyName.trim())}`;
    }
    return 'https://ahu.go.id/pencarian/nama-pt';
  };

  const handleOpenAHUPopup = () => {
    setAhuLoading(true);
    setAhuPopupOpen(true);
  };

  const handleOpenAHUNewTab = () => {
    window.open(getAHULookupUrl(), '_blank', 'noopener,noreferrer');
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
      case 'checking':
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary gap-1">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Checking AHU...
          </Badge>
        );
      case 'not_found':
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-destructive/30 text-destructive gap-1">
            <XCircle className="h-2.5 w-2.5" />
            Not Found
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
              variant="outline"
              size="sm"
              onClick={handleOpenAHUPopup}
              className="h-9 gap-1.5 shrink-0"
            >
              <Search className="h-3.5 w-3.5" />
              Check AHU
            </Button>
          </div>
        </div>

        {/* Dynamic Verification Button */}
        {verification.status !== 'verified' && verification.status !== 'checking' && companyName.trim() && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleDynamicVerification}
              disabled={verification.submitting}
            >
              {verification.submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Auto-Verify "{companyName}"
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info Banner */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0 text-xs text-muted-foreground">
            <p>
              Click <strong>Auto-Verify</strong> to check your PT name directly against{' '}
              <button
                type="button"
                onClick={handleOpenAHUPopup}
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                AHU Indonesia
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
              . If auto-check fails, we'll submit for manual admin review.
            </p>
          </div>
        </div>

        {/* Status Sections */}
        {verification.status === 'not_found' && (
          <div className="space-y-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-center gap-2 text-xs text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              <span>Company "{companyName}" not found in AHU database</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleSubmitForManualReview}
                disabled={verification.submitting}
              >
                Request Manual Review
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleOpenAHUPopup}
              >
                Check AHU Manually
              </Button>
            </div>
          </div>
        )}

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
      </div>

      {/* AHU Popup Modal */}
      <Dialog open={ahuPopupOpen} onOpenChange={setAhuPopupOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 gap-0 bg-background border border-border shadow-2xl">
          <DialogHeader className="p-3 border-b border-border flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <DialogTitle className="text-sm font-medium">
                AHU Indonesia - Company Search
              </DialogTitle>
              {companyName.trim() && (
                <Badge variant="secondary" className="text-[10px] font-normal">
                  Searching: {companyName}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleOpenAHUNewTab}
              >
                <ExternalLink className="h-3 w-3" />
                Open in New Tab
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setAhuPopupOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 relative bg-white">
            {ahuLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading AHU website...</p>
                </div>
              </div>
            )}
            <iframe
              src={getAHULookupUrl()}
              className="w-full h-full border-0"
              title="AHU Indonesia Company Search"
              onLoad={() => setAhuLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
          
          <div className="p-2 border-t border-border bg-muted/30 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Search results from ahu.go.id • Some features may be restricted in popup mode
            </p>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => {
                setAhuPopupOpen(false);
                handleDynamicVerification();
              }}
              disabled={verification.submitting || !companyName.trim()}
            >
              <CheckCircle className="h-3 w-3" />
              Verify Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyVerificationField;

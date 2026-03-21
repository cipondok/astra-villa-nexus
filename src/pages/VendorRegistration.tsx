import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import VendorRegistrationForm from "@/components/vendor/VendorRegistrationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const VendorRegistration = () => {
  const { isAuthenticated, loading, user, profile } = useAuth();
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  
  const [vendorRequest, setVendorRequest] = useState<any>(null);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
    if (user && profile?.role === 'vendor') {
      navigate('/dashboard/vendor');
    }
    if (user) {
      checkExistingRequest();
    }
  }, [isAuthenticated, loading, navigate, user, profile]);

  const checkExistingRequest = async () => {
    if (!user) return;
    
    setRequestLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_requests')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setVendorRequest(data);
    } catch (error: any) {
      console.error('Error checking vendor request:', error);
    } finally {
      setRequestLoading(false);
    }
  };


  const handleRegistrationSuccess = () => {
    checkExistingRequest();
  };

  if (loading || requestLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-chart-3" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-chart-1" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-chart-3';
      case 'approved':
        return 'bg-chart-1';
      case 'rejected':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background dark:from-primary/10">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-chart-1 dark:from-[#0a1628] dark:via-[#0d1f3c] dark:to-[#081225] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3">
            {vendorRequest ? 'Application Status' : 'Become a Vendor'}
          </h1>
          <p className="text-primary-foreground/80 text-base sm:text-lg max-w-2xl">
            {vendorRequest 
              ? 'Track the progress of your vendor application' 
              : 'Join our marketplace and start offering your services to customers across Indonesia'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {vendorRequest ? (
          <div className="max-w-3xl mx-auto">
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Application Details</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(vendorRequest.status)}
                    <Badge className={getStatusColor(vendorRequest.status)}>
                      {vendorRequest.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Submitted on {new Date(vendorRequest.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                    <p className="text-foreground">{vendorRequest.business_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
                    <p className="text-foreground">{vendorRequest.business_type}</p>
                  </div>
                </div>
                
                {vendorRequest.review_notes && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Review Notes</Label>
                    <p className="text-foreground/80 mt-1">
                      {vendorRequest.review_notes}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  {vendorRequest.status === 'pending' && (
                    <p className="text-sm text-muted-foreground">
                      Your application is being reviewed. We'll notify you once a decision is made.
                    </p>
                  )}
                  {vendorRequest.status === 'approved' && (
                    <p className="text-sm text-chart-1">
                      Congratulations! Your application has been approved. You can now access your vendor dashboard.
                    </p>
                  )}
                  {vendorRequest.status === 'rejected' && (
                    <p className="text-sm text-destructive">
                      Your application was not approved at this time. Please review the notes above and consider reapplying.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <VendorRegistrationForm onSuccess={handleRegistrationSuccess} />
        )}
      </div>
    </div>
  );
};

export default VendorRegistration;

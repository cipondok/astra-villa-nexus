
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import VendorRegistrationForm from "@/components/vendor/VendorRegistrationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const VendorRegistration = () => {
  const { isAuthenticated, loading, user, profile } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "id">("en");
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

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const handleRegistrationSuccess = () => {
    checkExistingRequest();
  };

  if (loading || requestLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loading...</h2>
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
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthenticatedNavigation
        language={language}
        onLanguageToggle={toggleLanguage}
        theme="light"
        onThemeToggle={() => {}}
      />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto py-8">
          {vendorRequest ? (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Vendor Application Status
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track the progress of your vendor application
                </p>
              </div>

              <Card className="max-w-2xl mx-auto">
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
                      <Label className="text-sm font-medium text-gray-600">Business Name</Label>
                      <p className="text-gray-900 dark:text-white">{vendorRequest.business_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Business Type</Label>
                      <p className="text-gray-900 dark:text-white">{vendorRequest.business_type}</p>
                    </div>
                  </div>
                  
                  {vendorRequest.review_notes && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Label className="text-sm font-medium text-gray-600">Review Notes</Label>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {vendorRequest.review_notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    {vendorRequest.status === 'pending' && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your application is being reviewed. We'll notify you once a decision is made.
                      </p>
                    )}
                    {vendorRequest.status === 'approved' && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Congratulations! Your application has been approved. You can now access your vendor dashboard.
                      </p>
                    )}
                    {vendorRequest.status === 'rejected' && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Your application was not approved at this time. Please review the notes above and consider reapplying.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Become a Vendor
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Join our marketplace and start offering your services
                </p>
              </div>
              
              <VendorRegistrationForm onSuccess={handleRegistrationSuccess} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;

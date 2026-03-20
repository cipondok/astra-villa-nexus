import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useNavigate, Link } from "react-router-dom";
import MultiStepPropertyForm from "@/components/property/MultiStepPropertyForm";
import PropertyImporter from "@/components/property/PropertyImporter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Lock, ArrowLeft, Building, Crown, AlertTriangle, Link2, PenTool, Plus, ArrowRight } from "lucide-react";
import { useIsAdmin, useUserRoles } from "@/hooks/useUserRoles";
import { useVIPLimits } from "@/hooks/useVIPLimits";
import VIPLimitAlert from "@/components/property/VIPLimitAlert";
import { useToast } from "@/hooks/use-toast";

const AddProperty = () => {
  const { isAuthenticated, profile, user } = useAuth();
  const { language } = useTranslation();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState<string>("manual");
  const { toast } = useToast();
  const { data: userRoles = [] } = useUserRoles();
  const navigate = useNavigate();
  const { 
    canAddProperty, 
    currentProperties, 
    maxProperties, 
    membershipLevel, 
    isLoading: limitsLoading 
  } = useVIPLimits();

  const { t: tr } = useTranslation();
  const txt = {
    loginRequired: tr('addProperty.loginRequired', 'Login Required'),
    loginDesc: tr('addProperty.loginDesc', 'Please login or register to add a property'),
    login: tr('common.login'),
    register: tr('common.register'),
    backHome: tr('addProperty.backHome', 'Back to Home'),
    upgradeRequired: tr('addProperty.upgradeRequired', 'Upgrade Required'),
    upgradeDesc: tr('addProperty.upgradeDesc', 'Upgrade to Agent, Vendor, or Property Owner to add listings'),
    upgradeAccount: tr('addProperty.upgradeAccount', 'Upgrade Account'),
    backDashboard: tr('addProperty.backDashboard', 'Back to Dashboard'),
    limitReached: tr('addProperty.limitReached', 'Property Limit Reached'),
    limitDesc: (current: number, max: number, level: string) => 
      tr('addProperty.limitDescTemplate', `You've reached ${current}/${max} properties for your ${level} tier.`),
    upgradeVIP: tr('addProperty.upgradeVIP', 'Upgrade VIP Level'),
    addProperty: tr('nav.addProperty'),
    createListing: tr('addProperty.createListing', 'Create new listing'),
    createManually: tr('addProperty.createManually', 'Create Manually'),
    importFromUrl: tr('addProperty.importFromUrl', 'Import from URL'),
    importError: tr('addProperty.importError', 'Please log in first.'),
    importSuccess: tr('addProperty.importSuccess', 'Form auto-filled. Please review and submit.'),
  };

  // Show login/register prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-3 py-6">
        <Card className="w-full max-w-sm shadow-lg border-border bg-card">
          <CardHeader className="text-center p-4 pb-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg text-foreground">{txt.loginRequired}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {txt.loginDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 p-4 pt-0">
            <Button 
              onClick={() => navigate('/auth?redirect=/add-property')}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {txt.login}
            </Button>
            <Button 
              onClick={() => navigate('/auth?mode=signup&redirect=/add-property')}
              variant="outline"
              className="w-full h-10 border-border"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {txt.register}
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full h-9 text-sm text-muted-foreground"
            >
              {txt.backHome}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has permission to add properties (role-based)
  const hasRolePermission = isAdmin || 
    userRoles.includes('agent') || 
    userRoles.includes('property_owner') || 
    userRoles.includes('vendor');

  // Show role upgrade prompt for users without permission
  if (!adminLoading && !hasRolePermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-3 py-6">
        <Card className="w-full max-w-md shadow-lg border-border bg-card">
          <CardHeader className="text-center p-5 pb-3">
            <div className="mx-auto w-14 h-14 bg-chart-3/10 rounded-xl flex items-center justify-center mb-3">
              <Building className="h-7 w-7 text-chart-3" />
            </div>
            <CardTitle className="text-xl text-foreground">{txt.upgradeRequired}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {txt.upgradeDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {/* Role Options */}
            <div className="space-y-2">
              <RoleOptionButton 
                icon={<Building className="h-5 w-5" />}
                title={language === 'en' ? 'Property Owner' : 'Pemilik Properti'}
                description={language === 'en' ? 'List your own properties' : 'Daftarkan properti Anda'}
                onClick={() => navigate('/profile?tab=roles')}
                color="text-primary bg-primary/10"
              />
              <RoleOptionButton 
                icon={<Crown className="h-5 w-5" />}
                title={language === 'en' ? 'Real Estate Agent' : 'Agen Properti'}
                description={language === 'en' ? 'Become a verified agent' : 'Jadi agen terverifikasi'}
                onClick={() => navigate('/agent-registration')}
                color="text-chart-5 bg-chart-5/10"
              />
              <RoleOptionButton 
                icon={<Building className="h-5 w-5" />}
                title={language === 'en' ? 'Service Vendor' : 'Vendor Layanan'}
                description={language === 'en' ? 'Offer property services' : 'Tawarkan layanan properti'}
                onClick={() => navigate('/profile?tab=roles')}
                color="text-chart-1 bg-chart-1/10"
              />
            </div>

            <div className="pt-2">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full h-9 border-border"
              >
                {txt.backDashboard}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show VIP limit reached message
  if (!adminLoading && !limitsLoading && !canAddProperty && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-3 py-6">
        <Card className="w-full max-w-sm shadow-lg border-border bg-card">
          <CardHeader className="text-center p-4 pb-3">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-lg text-foreground">{txt.limitReached}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {txt.limitDesc(currentProperties, maxProperties, membershipLevel)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 p-4 pt-0">
            <Button 
              onClick={() => navigate('/membership')}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Crown className="h-4 w-4 mr-2" />
              {txt.upgradeVIP}
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full h-9 border-border"
            >
              {txt.backDashboard}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0">
      {/* Compact Header with integrated mode toggle */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40 shadow-[0_1px_3px_hsl(var(--foreground)/0.04)]">
        <div className="flex items-center justify-between px-2.5 py-1.5 md:container md:mx-auto md:px-4 md:py-3">
          <div className="flex items-center gap-1.5">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full md:h-8 md:w-auto md:px-3 md:rounded-md" aria-label="Back">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden md:inline ml-1">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-1">
              <Plus className="h-3.5 w-3.5 text-primary" />
              <h1 className="text-sm font-semibold text-foreground md:text-xl">
                {txt.addProperty}
              </h1>
            </div>
          </div>
          
          {/* Mode toggle inline in header */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-medium transition-colors ${
                activeTab === 'manual' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <PenTool className="h-2.5 w-2.5 md:h-3 md:w-3" />
              {txt.createManually}
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-medium transition-colors ${
                activeTab === 'import' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Link2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
              {txt.importFromUrl}
            </button>
            
            {userRoles.length > 0 && (
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary ml-1">
                {userRoles[0].replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-2.5 md:container md:mx-auto md:px-4 py-2 md:py-6 space-y-2 md:space-y-4">
        {/* VIP Limit Warning */}
        {!isAdmin && (
          <VIPLimitAlert
            currentCount={currentProperties}
            maxCount={maxProperties}
            type="property"
            membershipLevel={membershipLevel}
          />
        )}
        
        {/* Content based on active tab - no separate TabsList */}
        {activeTab === 'manual' && (
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-2 md:p-5">
                <MultiStepPropertyForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import" className="mt-4">
            <PropertyImporter 
              onImport={(data) => {
                if (!user) {
                  toast({
                    title: "Error",
                    description: txt.importError,
                    variant: "destructive",
                  });
                  return;
                }

                // Write an auto-fill draft to the SAME draft key that MultiStepPropertyForm already restores.
                const draftKey = `property_draft_${user.id}`;

                const importedFormData: any = {
                  title: data.title || "",
                  description: data.description || "",
                  property_type: data.property_type || "",
                  listing_type: data.listing_type || "",
                  price: data.price || "",
                  bedrooms: data.specifications?.bedrooms != null ? String(data.specifications.bedrooms) : "",
                  bathrooms: data.specifications?.bathrooms != null ? String(data.specifications.bathrooms) : "",
                  area_sqm: data.specifications?.building_size_m2 != null ? String(data.specifications.building_size_m2) : "",
                  location: data.location?.full_address || "",
                  city: data.location?.city || "",
                  state: data.location?.province || "",
                  area: "",
                  district: "",
                  subdistrict: "",
                  development_status: "completed",
                  owner_type: "individual",
                  status: isAdmin ? "active" : "pending_approval",
                  rental_periods: ["monthly"],
                  minimum_rental_days: "30",
                  images: Array.isArray(data.images) ? data.images : [],
                  virtual_tour_url: "",
                  three_d_model_url: "",
                };

                // Map features array into the boolean features object used by the form.
                const importedFeatures: any = {
                  parking: false,
                  swimming_pool: false,
                  garden: false,
                  balcony: false,
                  furnished: false,
                  air_conditioning: false,
                  security: false,
                  elevator: false,
                };

                const featureText = (data.features || []).join(" ").toLowerCase();
                if (featureText.includes("park")) importedFeatures.parking = true;
                if (featureText.includes("pool") || featureText.includes("kolam")) importedFeatures.swimming_pool = true;
                if (featureText.includes("garden") || featureText.includes("taman")) importedFeatures.garden = true;
                if (featureText.includes("balcony") || featureText.includes("balkon")) importedFeatures.balcony = true;
                if (featureText.includes("furnish") || featureText.includes("furnished") || featureText.includes("fully furnished")) importedFeatures.furnished = true;
                if (featureText.includes("ac") || featureText.includes("air conditioning") || featureText.includes("air-conditioning") || featureText.includes("pendingin")) importedFeatures.air_conditioning = true;
                if (featureText.includes("security") || featureText.includes("keamanan") || featureText.includes("satpam")) importedFeatures.security = true;
                if (featureText.includes("elevator") || featureText.includes("lift")) importedFeatures.elevator = true;

                const draftData = {
                  formData: importedFormData,
                  features: importedFeatures,
                  currentTab: "basic",
                  timestamp: new Date().toISOString(),
                  userId: user.id,
                  source: {
                    url: data.source?.url || "",
                    website: data.source?.website || "",
                  },
                };

                localStorage.setItem(draftKey, JSON.stringify(draftData));
                // Notify the form (already mounted) to reload draft immediately.
                window.dispatchEvent(new Event("astra:property-imported"));

                toast({
                  title: language === "en" ? "Imported" : "Berhasil diimpor",
                  description: txt.importSuccess,
                });

                setActiveTab("manual");
              }} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper component for role option buttons
const RoleOptionButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}> = ({ icon, title, description, onClick, color }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground" />
  </button>
);

export default AddProperty;

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { language } = useLanguage();
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

  const text = {
    en: {
      loginRequired: "Login Required",
      loginDesc: "Please login or register to add a property",
      login: "Login",
      register: "Register",
      backHome: "Back to Home",
      upgradeRequired: "Upgrade Required",
      upgradeDesc: "Upgrade to Agent, Vendor, or Property Owner to add listings",
      upgradeAccount: "Upgrade Account",
      backDashboard: "Back to Dashboard",
      limitReached: "Property Limit Reached",
      limitDesc: (current: number, max: number, level: string) => 
        `You've reached ${current}/${max} properties for your ${level} tier.`,
      upgradeVIP: "Upgrade VIP Level",
      addProperty: "Add Property",
      createListing: "Create new listing",
      createManually: "Create Manually",
      importFromUrl: "Import from URL",
      importError: "Please log in first.",
      importSuccess: "Form auto-filled. Please review and submit."
    },
    id: {
      loginRequired: "Login Diperlukan",
      loginDesc: "Silakan login atau daftar untuk menambahkan properti",
      login: "Masuk",
      register: "Daftar",
      backHome: "Kembali",
      upgradeRequired: "Upgrade Diperlukan",
      upgradeDesc: "Upgrade ke Agent, Vendor, atau Property Owner untuk listing",
      upgradeAccount: "Upgrade Akun",
      backDashboard: "Kembali",
      limitReached: "Batas Properti Tercapai",
      limitDesc: (current: number, max: number, level: string) => 
        `Anda telah mencapai ${current}/${max} properti untuk level ${level}.`,
      upgradeVIP: "Upgrade Level VIP",
      addProperty: "Tambah Properti",
      createListing: "Buat listing baru",
      createManually: "Buat Manual",
      importFromUrl: "Impor dari URL",
      importError: "Silakan login dulu.",
      importSuccess: "Form terisi otomatis. Silakan cek lalu submit."
    }
  };

  const t = text[language];

  // Show login/register prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-3 py-6">
        <Card className="w-full max-w-sm shadow-lg border-border bg-card">
          <CardHeader className="text-center p-4 pb-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg text-foreground">{t.loginRequired}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t.loginDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 p-4 pt-0">
            <Button 
              onClick={() => navigate('/auth?redirect=/add-property')}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {t.login}
            </Button>
            <Button 
              onClick={() => navigate('/auth?mode=signup&redirect=/add-property')}
              variant="outline"
              className="w-full h-10 border-border"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t.register}
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full h-9 text-sm text-muted-foreground"
            >
              {t.backHome}
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
            <CardTitle className="text-xl text-foreground">{t.upgradeRequired}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {t.upgradeDesc}
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
                {t.backDashboard}
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
            <CardTitle className="text-lg text-foreground">{t.limitReached}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t.limitDesc(currentProperties, maxProperties, membershipLevel)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 p-4 pt-0">
            <Button 
              onClick={() => navigate('/membership')}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Crown className="h-4 w-4 mr-2" />
              {t.upgradeVIP}
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full h-9 border-border"
            >
              {t.backDashboard}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
              <Plus className="h-5 w-5 text-primary" />
              <span>{t.addProperty}</span>
            </h1>
          </div>
          
          {/* User Role Badges */}
          {userRoles.length > 0 && (
            <div className="flex gap-1.5">
              {userRoles.slice(0, 2).map(role => (
                <span 
                  key={role} 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6 space-y-4">
        {/* VIP Limit Warning */}
        {!isAdmin && (
          <VIPLimitAlert
            currentCount={currentProperties}
            maxCount={maxProperties}
            type="property"
            membershipLevel={membershipLevel}
          />
        )}
        
        {/* Tabs for Manual or Import */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11 bg-muted/50 border border-border rounded-xl p-1">
            <TabsTrigger 
              value="manual" 
              className="text-xs sm:text-sm gap-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t.createManually}
            </TabsTrigger>
            <TabsTrigger 
              value="import" 
              className="text-xs sm:text-sm gap-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t.importFromUrl}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-3 sm:p-5">
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
                    description: t.importError,
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
                  description: t.importSuccess,
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

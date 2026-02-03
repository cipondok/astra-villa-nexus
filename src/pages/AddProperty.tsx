import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import MultiStepPropertyForm from "@/components/property/MultiStepPropertyForm";
import PropertyImporter from "@/components/property/PropertyImporter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Lock, ArrowLeft, Building, Crown, AlertTriangle, Link2, PenTool } from "lucide-react";
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

  // Show login/register prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-2 py-4">
        <Card className="w-full max-w-sm shadow-lg border-border/50">
          <CardHeader className="text-center p-3 pb-2">
            <div className="mx-auto w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">
              {language === "en" ? "Login Required" : "Login Diperlukan"}
            </CardTitle>
            <CardDescription className="text-xs">
              {language === "en" 
                ? "Please login or register to add a property" 
                : "Silakan login atau daftar untuk menambahkan properti"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            <Button 
              onClick={() => navigate('/auth?redirect=/add-property')}
              className="w-full h-9 text-xs"
              size="sm"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              {language === "en" ? "Login" : "Masuk"}
            </Button>
            <Button 
              onClick={() => navigate('/auth?mode=signup&redirect=/add-property')}
              variant="outline"
              className="w-full h-9 text-xs"
              size="sm"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              {language === "en" ? "Register" : "Daftar"}
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full h-7 text-[10px]"
              size="sm"
            >
              {language === "en" ? "Back to Home" : "Kembali"}
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
      <div className="min-h-screen flex items-center justify-center bg-background px-2 py-4">
        <Card className="w-full max-w-sm shadow-lg border-border/50">
          <CardHeader className="text-center p-3 pb-2">
            <div className="mx-auto w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-2">
              <Building className="h-5 w-5 text-orange-500" />
            </div>
            <CardTitle className="text-base">
              {language === "en" ? "Upgrade Required" : "Upgrade Diperlukan"}
            </CardTitle>
            <CardDescription className="text-xs">
              {language === "en" 
                ? "Upgrade to Agent, Vendor, or Property Owner to add listings" 
                : "Upgrade ke Agent, Vendor, atau Property Owner untuk listing"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            <Button 
              onClick={() => navigate('/profile')}
              className="w-full h-9 text-xs"
              size="sm"
            >
              {language === "en" ? "Upgrade Account" : "Upgrade Akun"}
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full h-8 text-[10px]"
              size="sm"
            >
              {language === "en" ? "Back to Dashboard" : "Kembali"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show VIP limit reached message
  if (!adminLoading && !limitsLoading && !canAddProperty && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-2 py-4">
        <Card className="w-full max-w-sm shadow-lg border-border/50">
          <CardHeader className="text-center p-3 pb-2">
            <div className="mx-auto w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <CardTitle className="text-base">
              {language === "en" ? "Property Limit Reached" : "Batas Properti Tercapai"}
            </CardTitle>
            <CardDescription className="text-xs">
              {language === "en" 
                ? `You've reached ${currentProperties}/${maxProperties} properties for your ${membershipLevel} tier.`
                : `Anda telah mencapai ${currentProperties}/${maxProperties} properti untuk level ${membershipLevel}.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            <Button 
              onClick={() => navigate('/membership')}
              className="w-full h-9 text-xs"
              size="sm"
            >
              <Crown className="h-3.5 w-3.5 mr-1.5" />
              {language === "en" ? "Upgrade VIP Level" : "Upgrade Level VIP"}
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full h-8 text-[10px]"
              size="sm"
            >
              {language === "en" ? "Back to Dashboard" : "Kembali"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-sm font-bold">
                {language === "en" ? "Add Property" : "Tambah Properti"}
              </h1>
              <p className="text-[9px] text-muted-foreground">
                {language === "en" ? "Create new listing" : "Buat listing baru"}
              </p>
            </div>
          </div>
          {userRoles.length > 0 && (
            <div className="flex gap-1">
              {userRoles.slice(0, 2).map(role => (
                <span key={role} className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium bg-primary/10 text-primary">
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Compact */}
      <div className="p-2 space-y-2">
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
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="manual" className="text-xs gap-1.5">
              <PenTool className="h-3.5 w-3.5" />
              {language === "en" ? "Create Manually" : "Buat Manual"}
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              {language === "en" ? "Import from URL" : "Impor dari URL"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-2">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-2 sm:p-4">
                <MultiStepPropertyForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import" className="mt-2">
            <PropertyImporter 
              onImport={(data) => {
                if (!user) {
                  toast({
                    title: "Error",
                    description: language === "en" ? "Please log in first." : "Silakan login dulu.",
                    variant: "destructive",
                  });
                  return;
                }

                // Write an auto-fill draft to the SAME draft key that MultiStepPropertyForm already restores.
                // This makes the import instantly pre-fill the form without changing the form component API.
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
                // We ONLY set known feature keys; everything else stays false.
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
                  description: language === "en" ? "Form auto-filled. Please review and submit." : "Form terisi otomatis. Silakan cek lalu submit.",
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

export default AddProperty;

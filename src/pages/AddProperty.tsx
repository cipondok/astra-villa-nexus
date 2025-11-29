
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import MultiStepPropertyForm from "@/components/property/MultiStepPropertyForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Lock, ArrowLeft, Building } from "lucide-react";
import { useIsAdmin, useUserRoles } from "@/hooks/useUserRoles";

const AddProperty = () => {
  const { isAuthenticated, profile } = useAuth();
  const { language } = useLanguage();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: userRoles = [] } = useUserRoles();
  const navigate = useNavigate();

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

  // Check if user has permission to add properties
  const canAddProperty = isAdmin || 
    userRoles.includes('agent') || 
    userRoles.includes('property_owner') || 
    userRoles.includes('vendor');

  // Show role upgrade prompt for users without permission
  if (!adminLoading && !canAddProperty) {
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
      <div className="p-2">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-2 sm:p-4">
            <MultiStepPropertyForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProperty;

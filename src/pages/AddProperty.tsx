
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RoleBasedPropertyForm from "@/components/property/RoleBasedPropertyForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Lock } from "lucide-react";

const AddProperty = () => {
  const { isAuthenticated, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Show login/register prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">
              {language === "en" ? "Login Required" : "Login Diperlukan"}
            </CardTitle>
            <CardDescription className="text-base">
              {language === "en" 
                ? "Please login or register to add a property listing" 
                : "Silakan login atau daftar untuk menambahkan listing properti"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/auth?redirect=/add-property')}
              className="w-full h-12 text-base"
              size="lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              {language === "en" ? "Login" : "Masuk"}
            </Button>
            <Button 
              onClick={() => navigate('/auth?mode=signup&redirect=/add-property')}
              variant="outline"
              className="w-full h-12 text-base"
              size="lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {language === "en" ? "Register New Account" : "Daftar Akun Baru"}
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full"
            >
              {language === "en" ? "Back to Home" : "Kembali ke Beranda"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show role upgrade prompt for general users
  if (profile?.role === 'general_user') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {language === "en" ? "Upgrade Required" : "Upgrade Diperlukan"}
            </CardTitle>
            <CardDescription className="text-base">
              {language === "en" 
                ? "To add property listings, you need to upgrade to Agent, Vendor, or Property Owner role" 
                : "Untuk menambahkan listing properti, Anda perlu upgrade ke role Agent, Vendor, atau Property Owner"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/profile')}
              className="w-full h-12 text-base"
              size="lg"
            >
              {language === "en" ? "Upgrade Account" : "Upgrade Akun"}
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full"
            >
              {language === "en" ? "Back to Dashboard" : "Kembali ke Dashboard"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background with 60% transparency */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 backdrop-blur-sm -z-10"></div>

      {/* Main Content */}
      <div className="relative py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === "en" ? "Add New Property" : "Tambah Properti Baru"}
              {(profile?.role === 'vendor' || profile?.role === 'agent' || profile?.role === 'property_owner') && (
                <span className="text-sm font-normal text-blue-600 block">
                  {language === "en" ? "Create property for sale/rent" : "Buat properti untuk dijual/disewa"}
                </span>
              )}
            </h1>
            <p className="text-xl text-gray-600">
              {language === "en" 
                ? "Create a comprehensive property listing with all details" 
                : "Buat listing properti yang lengkap dengan semua detail"
              }
            </p>
            {profile?.role && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Role: {profile.role.replace('_', ' ').charAt(0).toUpperCase() + profile.role.replace('_', ' ').slice(1)}
                </span>
              </div>
            )}
          </div>

          {/* Form with enhanced styling */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <RoleBasedPropertyForm />
          </div>
        </div>
      </div>

      {/* Floating Action Helper */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">
              {language === "en" ? "Form Active" : "Form Aktif"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;

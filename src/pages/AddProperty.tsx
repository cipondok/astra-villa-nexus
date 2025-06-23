
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import RoleBasedPropertyForm from "@/components/property/RoleBasedPropertyForm";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import { useState } from "react";

const AddProperty = () => {
  const { isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background with 60% transparency */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 backdrop-blur-sm -z-10"></div>
      
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={() => setLanguage(prev => prev === "en" ? "id" : "en")}
          theme={theme}
          onThemeToggle={() => setTheme(prev => prev === "light" ? "dark" : "light")}
        />
      </div>

      {/* Main Content */}
      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === "en" ? "Add New Property" : "Tambah Properti Baru"}
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

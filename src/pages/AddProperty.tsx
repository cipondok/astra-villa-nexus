
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import RoleBasedPropertyForm from "@/components/property/RoleBasedPropertyForm";
const AddProperty = () => {
  const { isAuthenticated, profile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    // Allow vendors, agents, and property owners to create properties
    if (isAuthenticated && profile?.role === 'general_user') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Restrict access based on role
  if (profile?.role === 'general_user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            You need to be a registered agent, vendor, or property owner to create property listings.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
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

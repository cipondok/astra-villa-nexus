
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ParticleEffect from "@/components/ParticleEffect";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import RoleBasedAuthModal from "@/components/RoleBasedAuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  // Check URL parameters for auth modal and confirmation
  useEffect(() => {
    const authParam = searchParams.get('auth');
    const confirmedParam = searchParams.get('confirmed');
    
    if (authParam === 'true') {
      setAuthModalOpen(true);
    }

    if (confirmedParam === 'true') {
      // Clear the URL parameter
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('confirmed');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    // Clear auth parameter from URL
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('auth');
      newParams.delete('message');
      return newParams;
    });
  };

  // Get message from URL params
  const message = searchParams.get('message');
  const confirmed = searchParams.get('confirmed');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleEffect />
      <Navigation />
      
      {/* Email confirmation success message */}
      {confirmed === 'true' && (
        <div className="container mx-auto px-4 pt-20">
          <Alert className="max-w-md mx-auto mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Email verified successfully! You can now access your dashboard.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Error or info message */}
      {message && (
        <div className="container mx-auto px-4 pt-20">
          <Alert className="max-w-lg mx-auto mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {message}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Show email verification status for logged in users */}
      {user && !user.email_confirmed_at && (
        <div className="container mx-auto px-4 pt-20">
          <Alert className="max-w-lg mx-auto mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Please check your email and click the verification link to activate your account.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent leading-tight">
            Find Your Dream Property
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover premium real estate opportunities in Indonesia's most sought-after locations. 
            From luxury villas to modern apartments, find your perfect home today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </button>
            <button className="px-8 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition-colors">
              Browse Properties
            </button>
          </div>
        </div>
      </section>

      {/* Property Listings Section */}
      <PropertyListingsSection language={language} />

      {/* Footer */}
      <ProfessionalFooter language={language} />

      {/* Auth Modal */}
      <RoleBasedAuthModal 
        isOpen={authModalOpen} 
        onClose={handleAuthModalClose}
      />
    </div>
  );
};

export default Index;

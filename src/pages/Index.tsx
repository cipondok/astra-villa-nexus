
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { PropertyListingsSection } from "@/components/PropertyListingsSection";
import { LiveListingsSection } from "@/components/LiveListingsSection";
import { ProfessionalFooter } from "@/components/ProfessionalFooter";
import { EnhancedNavigation } from "@/components/navigation/EnhancedNavigation";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, profile } = useAuth();
  
  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  return (
    <div className="min-h-screen">
      <EnhancedNavigation />
      
      {/* Quick Admin Access for Testing */}
      {isAdmin && (
        <div className="bg-blue-600 text-white p-2 text-center">
          <Link to="/admin" className="text-white underline">
            🔧 Quick Admin Panel Access
          </Link>
        </div>
      )}
      
      <Hero />
      <Features />
      <PropertyListingsSection />
      <LiveListingsSection />
      <ProfessionalFooter />
    </div>
  );
};

export default Index;

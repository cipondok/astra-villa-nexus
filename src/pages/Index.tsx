
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";

// Create minimal Hero and Features components since they don't exist
const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your Dream Property
        </h1>
        <p className="text-xl mb-8">
          Discover the perfect home with our comprehensive real estate platform
        </p>
        <Link 
          to="/properties" 
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold">🏠</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Premium Properties</h3>
            <p className="text-gray-600">Curated selection of high-quality properties</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold">💼</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Service</h3>
            <p className="text-gray-600">Professional guidance from experienced agents</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
            <p className="text-gray-600">Advanced filters to find exactly what you need</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const LiveListingsSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Live Listings</h2>
        <div className="text-center">
          <p className="text-gray-600 mb-8">Stay updated with our latest property listings</p>
          <Link 
            to="/properties" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

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
      <PropertyListingsSection language="en" />
      <LiveListingsSection />
      <ProfessionalFooter language="en" />
    </div>
  );
};

export default Index;

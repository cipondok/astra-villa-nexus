
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import VendorDashboardNavigation from "./VendorDashboardNavigation";
import VendorProfileView from "./VendorProfileView";
import VendorBusinessProfile from "./VendorBusinessProfile";
import VendorServicesList from "./VendorServicesList";
import VendorServiceForm from "./VendorServiceForm";
import VendorCustomerManagement from "./VendorCustomerManagement";
import VendorBillingManagement from "./VendorBillingManagement";
import VendorProgressTracking from "./VendorProgressTracking";
import VendorReviews from "./VendorReviews";
import VendorBookings from "./VendorBookings";
import VendorAnalytics from "./VendorAnalytics";
import VendorHolidayManagement from "./VendorHolidayManagement";
import VendorChangeRequests from "./VendorChangeRequests";
import VendorProfileProgress from "./VendorProfileProgress";
import VendorSettings from "./VendorSettings";
import VendorSupport from "./VendorSupport";
import VendorListings from "./VendorListings";
import VendorKYCVerification from "./VendorKYCVerification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EnhancedVendorDashboard = () => {
  const { user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const handleNavigateToSection = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Business Overview</CardTitle>
                  <CardDescription>Your business performance at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-sm text-gray-600">Services</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">45</p>
                      <p className="text-sm text-gray-600">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">4.8</p>
                      <p className="text-sm text-gray-600">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">28</p>
                      <p className="text-sm text-gray-600">Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveSection('services')}
                  >
                    Manage Services
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveSection('bookings')}
                  >
                    View Bookings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveSection('business-profile')}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveSection('property-listings')}
                  >
                    Manage Listings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Progress */}
            <VendorProfileProgress onNavigateToSection={handleNavigateToSection} />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates on your business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New booking received</p>
                      <p className="text-xs text-gray-600">Premium Home Cleaning - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-gray-600">Rp 150,000 - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New review</p>
                      <p className="text-xs text-gray-600">5 stars - Property Maintenance - 1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'business-profile':
        if (editingProfile) {
          return (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => setEditingProfile(false)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile View
              </Button>
              <VendorBusinessProfile />
            </div>
          );
        }
        return (
          <VendorProfileView 
            profile={{}} 
            businessNature={{}} 
            onEdit={() => setEditingProfile(true)}
            canChangeNature={true}
          />
        );
      
      case 'services':
        if (showServiceForm) {
          return (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowServiceForm(false);
                  setEditingService(null);
                }}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
              <VendorServiceForm 
                service={editingService}
                onClose={() => {
                  setShowServiceForm(false);
                  setEditingService(null);
                }}
                onSuccess={() => {
                  setShowServiceForm(false);
                  setEditingService(null);
                }}
              />
            </div>
          );
        }
        return (
          <VendorServicesList 
            onAddService={() => setShowServiceForm(true)}
            onEditService={(service) => {
              setEditingService(service);
              setShowServiceForm(true);
            }}
          />
        );
      
      case 'bookings':
        return <VendorBookings />;
      
      case 'customers':
        return <VendorCustomerManagement />;
      
      case 'billing':
        return <VendorBillingManagement />;
      
      case 'progress':
        return <VendorProgressTracking />;
      
      case 'feedback':
        return <VendorReviews />;
      
      case 'holidays':
        return <VendorHolidayManagement />;
      
      case 'change-requests':
        return <VendorChangeRequests />;

      case 'property-listings':
        return <VendorListings />;

      case 'settings':
        return <VendorSettings />;

      case 'support':
        return <VendorSupport />;

      case 'kyc-verification':
        return <VendorKYCVerification />;
      
      case 'compliance':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Compliance Management</CardTitle>
              <CardDescription>
                Track licenses, certifications, and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compliance management features coming soon. This will include:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
                <li>License tracking and renewal reminders</li>
                <li>Insurance certificate management</li>
                <li>Certification upload and verification</li>
                <li>Compliance status dashboard</li>
              </ul>
            </CardContent>
          </Card>
        );
      
      case 'customer-service':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Customer Service</CardTitle>
              <CardDescription>
                Manage customer support tickets and communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Customer service ticketing system coming soon. This will include:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Support ticket management</li>
                <li>Customer communication history</li>
                <li>Response time tracking</li>
                <li>Issue categorization and priority management</li>
              </ul>
            </CardContent>
          </Card>
        );
      
      case 'analytics':
        return <VendorAnalytics />;
      
      default:
        return (
          <VendorProfileView 
            profile={{}} 
            businessNature={{}} 
            onEdit={() => setEditingProfile(true)}
            canChangeNature={true}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Vendor Control Panel
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {profile?.full_name || user?.email}! Manage your business operations from here.
          </p>
        </div>

        <VendorDashboardNavigation 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedVendorDashboard;

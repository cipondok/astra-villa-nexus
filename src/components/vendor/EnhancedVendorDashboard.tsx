
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import VendorDashboardNavigation from "./VendorDashboardNavigation";
import VendorBusinessProfile from "./VendorBusinessProfile";
import EnhancedVendorServiceForm from "./EnhancedVendorServiceForm";
import VendorServices from "./VendorServices";
import VendorCustomerManagement from "./VendorCustomerManagement";
import VendorBillingManagement from "./VendorBillingManagement";
import VendorProgressTracking from "./VendorProgressTracking";
import VendorReviews from "./VendorReviews";
import VendorBookings from "./VendorBookings";
import VendorAnalytics from "./VendorAnalytics";
import VendorHolidayManagement from "./VendorHolidayManagement";
import VendorChangeRequests from "./VendorChangeRequests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EnhancedVendorDashboard = () => {
  const { user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState('business-profile');
  const [showServiceForm, setShowServiceForm] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'business-profile':
        return <VendorBusinessProfile />;
      
      case 'services':
        return (
          <div className="space-y-6">
            {showServiceForm ? (
              <EnhancedVendorServiceForm 
                onClose={() => setShowServiceForm(false)}
                onSuccess={() => setShowServiceForm(false)}
              />
            ) : (
              <VendorServices />
            )}
          </div>
        );
      
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
        return <VendorBusinessProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Vendor Dashboard
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

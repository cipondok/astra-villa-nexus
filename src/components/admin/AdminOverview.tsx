
import { useState } from "react";
import AdminNavigation from "./AdminNavigation";
import UserManagement from "./UserManagement";
import PropertyManagement from "./PropertyManagement";
import VendorManagement from "./VendorManagement";
import VendorServiceCategoryManagement from "./VendorServiceCategoryManagement";
import AdminVendorServiceManagement from "./AdminVendorServiceManagement";
import WebTrafficAnalytics from "./WebTrafficAnalytics";
import ContentManagement from "./ContentManagement";
import SystemSettings from "./SystemSettings";
import BillingManagement from "./BillingManagement";
import DatabaseTableManagement from "./DatabaseTableManagement";
import SecurityMonitoring from "./SecurityMonitoring";
import SystemReports from "./SystemReports";
import SearchFiltersManagement from "./SearchFiltersManagement";
import FeedbackManagement from "./FeedbackManagement";
import AIBotManagement from "./AIBotManagement";
import AdminKYCManagement from "./AdminKYCManagement";
import AdminMembershipManagement from "./AdminMembershipManagement";
import DailyCheckInManagement from "./DailyCheckInManagement";
import ComprehensiveVendorManagement from "./ComprehensiveVendorManagement";
import CustomerServiceTicketManagement from "./CustomerServiceTicketManagement";
import ContactManagement from "./ContactManagement";

const AdminOverview = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminNavigation activeSection={activeSection} onSectionChange={setActiveSection} />;
      case 'user-management':
        return <UserManagement />;
      case 'property-management':
        return <PropertyManagement />;
      case 'ai-vendor-management':
        return <ComprehensiveVendorManagement />;
      case 'vendor-management':
        return <VendorManagement />;
      case 'vendor-service-categories':
        return <VendorServiceCategoryManagement />;
      case 'vendor-services':
        return <AdminVendorServiceManagement />;
      case 'kyc-management':
        return <AdminKYCManagement />;
      case 'membership-management':
        return <AdminMembershipManagement />;
      case 'customer-service':
        return <CustomerServiceTicketManagement />;
      case 'contact-management':
        return <ContactManagement />;
      case 'analytics':
        return <WebTrafficAnalytics />;
      case 'content-management':
        return <ContentManagement />;
      case 'search-filters':
        return <SearchFiltersManagement />;
      case 'feedback-management':
        return <FeedbackManagement />;
      case 'ai-bot-management':
        return <AIBotManagement />;
      case 'daily-checkin':
        return <DailyCheckInManagement />;
      case 'system-settings':
        return <SystemSettings />;
      case 'billing-management':
        return <BillingManagement />;
      case 'database-management':
        return <DatabaseTableManagement />;
      case 'security-monitoring':
        return <SecurityMonitoring />;
      case 'system-reports':
        return <SystemReports />;
      default:
        return <AdminNavigation activeSection={activeSection} onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {activeSection !== 'overview' && (
          <div className="mb-6">
            <button
              onClick={() => setActiveSection('overview')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
          </div>
        )}
        
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default AdminOverview;

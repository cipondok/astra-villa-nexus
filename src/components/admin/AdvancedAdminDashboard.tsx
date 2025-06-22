
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminNavigation from './AdminNavigation';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import CustomerServiceCenter from './CustomerServiceCenter';
import ContactManagement from './ContactManagement';
import ComprehensiveVendorManagement from './ComprehensiveVendorManagement';
import VendorManagement from './VendorManagement';
import VendorServiceCategoryManagement from './VendorServiceCategoryManagement';
import EnhancedVendorServiceManagement from './EnhancedVendorServiceManagement';
import AdminKYCManagement from './AdminKYCManagement';
import AdminMembershipManagement from './AdminMembershipManagement';
import WebTrafficAnalytics from './WebTrafficAnalytics';
import AIBotManagement from './AIBotManagement';
import FeedbackManagement from './FeedbackManagement';
import DailyCheckInManagement from './DailyCheckInManagement';
import EnhancedContentManagement from './EnhancedContentManagement';
import SearchFiltersManagement from './SearchFiltersManagement';
import SEOSettings from './SEOSettings';
import SystemSettings from './SystemSettings';
import BillingManagement from './BillingManagement';
import ToolsManagementDashboard from './ToolsManagementDashboard';
import DatabaseTableManagement from './DatabaseTableManagement';
import SecurityMonitoring from './SecurityMonitoring';
import SystemReports from './SystemReports';

const AdvancedAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'user-management':
        return <UserManagement />;
      case 'property-management':
        return <PropertyManagement />;
      case 'customer-service':
        return <CustomerServiceCenter />;
      case 'contact-management':
        return <ContactManagement />;
      case 'ai-vendor-management':
        return <ComprehensiveVendorManagement />;
      case 'vendor-management':
        return <VendorManagement />;
      case 'vendor-service-categories':
        return <VendorServiceCategoryManagement />;
      case 'vendor-services':
        return <EnhancedVendorServiceManagement />;
      case 'kyc-management':
        return <AdminKYCManagement />;
      case 'membership-management':
        return <AdminMembershipManagement />;
      case 'analytics':
        return <WebTrafficAnalytics />;
      case 'ai-bot-management':
        return <AIBotManagement />;
      case 'feedback-management':
        return <FeedbackManagement />;
      case 'daily-checkin':
        return <DailyCheckInManagement />;
      case 'content-management':
        return <EnhancedContentManagement />;
      case 'search-filters':
        return <SearchFiltersManagement />;
      case 'seo-settings':
        return <SEOSettings />;
      case 'system-settings':
        return <SystemSettings />;
      case 'billing-management':
        return <BillingManagement />;
      case 'astra-tokens':
        return <ToolsManagementDashboard />;
      case 'database-management':
        return <DatabaseTableManagement />;
      case 'security-monitoring':
        return <SecurityMonitoring />;
      case 'system-reports':
        return <SystemReports />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Advanced Admin Dashboard
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Admin Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminNavigation 
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;

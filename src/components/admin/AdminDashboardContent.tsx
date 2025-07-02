
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import VendorManagementHub from './VendorManagementHub';
import SystemSettings from './SystemSettings';
import AnalyticsDashboard from './AnalyticsDashboard';
import DiagnosticDashboard from './DiagnosticDashboard';
import ASTRATokenAnalytics from './ASTRATokenAnalytics';
import ASTRATokenSettings from './ASTRATokenSettings';
import ToolsManagementDashboard from './ToolsManagementDashboard';
import SEOSettings from './SEOSettings';
import CustomerServiceCenter from './CustomerServiceCenter';
import ContactManagement from './ContactManagement';
import ChatManagement from './ChatManagement';
import AIVendorMatching from './AIVendorMatching';
import VendorManagement from './VendorManagement';
import VendorServiceCategoryManagement from './VendorServiceCategoryManagement';
import EnhancedVendorServiceManagement from './EnhancedVendorServiceManagement';
import AdminKYCManagement from './AdminKYCManagement';
import AdminMembershipManagement from './AdminMembershipManagement';
import AIBotManagement from './AIBotManagement';
import FeedbackManagement from './FeedbackManagement';
import DailyCheckInManagement from './DailyCheckInManagement';
import ErrorManagement from './ErrorManagement';
import ContentManagement from './ContentManagement';
import SearchFiltersManagement from './SearchFiltersManagement';
import BillingManagement from './BillingManagement';
import DatabaseTableManagement from './DatabaseTableManagement';
import SecurityMonitoring from './SecurityMonitoring';
import SystemReports from './SystemReports';
import WebsiteDesignControl from './WebsiteDesignControl';

interface AdminDashboardContentProps {
  isAdmin: boolean;
  setActiveTab: (tab: string) => void;
}

const AdminDashboardContent = ({ isAdmin, setActiveTab }: AdminDashboardContentProps) => {
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Access Restricted
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access the admin dashboard. Please contact an administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TabsContent value="overview">
        <AdminOverview />
      </TabsContent>

      <TabsContent value="diagnostic">
        <DiagnosticDashboard />
      </TabsContent>

      <TabsContent value="astra-token">
        <ASTRATokenAnalytics />
      </TabsContent>

      <TabsContent value="astra-token-settings">
        <ASTRATokenSettings />
      </TabsContent>

      <TabsContent value="tools-management">
        <ToolsManagementDashboard />
      </TabsContent>

      <TabsContent value="seo-settings">
        <SEOSettings />
      </TabsContent>

      <TabsContent value="website-design">
        <WebsiteDesignControl />
      </TabsContent>

      <TabsContent value="user-management">
        <UserManagement />
      </TabsContent>

      <TabsContent value="property-management">
        <PropertyManagement />
      </TabsContent>

      <TabsContent value="property-management-hub">
        <PropertyManagement />
      </TabsContent>

      <TabsContent value="customer-service">
        <CustomerServiceCenter />
      </TabsContent>

      <TabsContent value="contact-management">
        <ContactManagement />
      </TabsContent>

      <TabsContent value="chat-management">
        <ChatManagement />
      </TabsContent>

      <TabsContent value="ai-vendor-management">
        <AIVendorMatching />
      </TabsContent>

      <TabsContent value="vendor-management">
        <VendorManagement />
      </TabsContent>

      <TabsContent value="vendor-service-categories">
        <VendorServiceCategoryManagement />
      </TabsContent>

      <TabsContent value="vendor-services">
        <EnhancedVendorServiceManagement />
      </TabsContent>

      <TabsContent value="kyc-management">
        <AdminKYCManagement />
      </TabsContent>

      <TabsContent value="membership-management">
        <AdminMembershipManagement />
      </TabsContent>

      <TabsContent value="analytics">
        <AnalyticsDashboard />
      </TabsContent>

      <TabsContent value="ai-bot-management">
        <AIBotManagement />
      </TabsContent>

      <TabsContent value="feedback-management">
        <FeedbackManagement />
      </TabsContent>

      <TabsContent value="daily-checkin">
        <DailyCheckInManagement />
      </TabsContent>

      <TabsContent value="error-management">
        <ErrorManagement />
      </TabsContent>

      <TabsContent value="content-management">
        <ContentManagement />
      </TabsContent>

      <TabsContent value="search-filters">
        <SearchFiltersManagement />
      </TabsContent>

      <TabsContent value="system-settings">
        <SystemSettings />
      </TabsContent>

      <TabsContent value="billing-management">
        <BillingManagement />
      </TabsContent>

      <TabsContent value="database-management">
        <DatabaseTableManagement />
      </TabsContent>

      <TabsContent value="security-monitoring">
        <SecurityMonitoring />
      </TabsContent>

      <TabsContent value="system-reports">
        <SystemReports />
      </TabsContent>
    </>
  );
};

export default AdminDashboardContent;

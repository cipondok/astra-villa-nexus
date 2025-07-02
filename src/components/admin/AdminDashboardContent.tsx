
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import VendorManagementHub from './VendorManagementHub';
import SystemSettings from './SystemSettings';
import AnalyticsDashboard from './AnalyticsDashboard';
import LoadingPageCustomization from './LoadingPageCustomization';
import APIConfiguration from './APIConfiguration';
import VendorCategoryManagement from './VendorCategoryManagement';
import VendorServiceCategoryManagement from './VendorServiceCategoryManagement';
import AdminVendorServiceManagement from './AdminVendorServiceManagement';
import AIVendorMatching from './AIVendorMatching';
import EnhancedVendorDirectory from './EnhancedVendorDirectory';
import DiagnosticDashboard from './DiagnosticDashboard';
import SEOSettings from './SEOSettings';
import WebsiteDesignSettings from './WebsiteDesignSettings';
import ContactManagement from './ContactManagement';
import ChatManagement from './ChatManagement';
import AIBotManagement from './AIBotManagement';
import FeedbackManagement from './FeedbackManagement';
import ErrorManagement from './ErrorManagement';
import ContentManagement from './ContentManagement';
import SearchFiltersManagement from './SearchFiltersManagement';
import BillingManagement from './BillingManagement';
import SecurityMonitoring from './SecurityMonitoring';
import SystemReports from './SystemReports';
import VendorCategoryDashboard from './VendorCategoryDashboard';

interface AdminDashboardContentProps {
  isAdmin: boolean;
  setActiveTab: (tab: string) => void;
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ isAdmin, setActiveTab }) => {
  return (
    <>
      <TabsContent value="overview">
        <AdminOverview />
      </TabsContent>

      <TabsContent value="diagnostic">
        <DiagnosticDashboard />
      </TabsContent>

      <TabsContent value="seo-settings">
        <SEOSettings />
      </TabsContent>

      <TabsContent value="website-design">
        <WebsiteDesignSettings />
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
        <VendorManagementHub />
      </TabsContent>

      <TabsContent value="vendor-service-categories">
        <VendorCategoryDashboard />
      </TabsContent>

      <TabsContent value="vendor-services">
        <AdminVendorServiceManagement />
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

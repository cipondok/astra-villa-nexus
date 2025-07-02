
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
import AstraTokenManagement from './AstraTokenManagement';
import AstraTokenSettings from './AstraTokenSettings';
import ToolsManagement from './ToolsManagement';
import SEOSettings from './SEOSettings';
import WebsiteDesignSettings from './WebsiteDesignSettings';
import CustomerServiceDashboard from './CustomerServiceDashboard';
import ContactManagement from './ContactManagement';
import ChatManagement from './ChatManagement';
import KYCManagement from './KYCManagement';
import MembershipManagement from './MembershipManagement';
import AIBotManagement from './AIBotManagement';
import FeedbackManagement from './FeedbackManagement';
import DailyCheckinManagement from './DailyCheckinManagement';
import ErrorManagement from './ErrorManagement';
import ContentManagement from './ContentManagement';
import SearchFiltersManagement from './SearchFiltersManagement';
import BillingManagement from './BillingManagement';
import DatabaseManagement from './DatabaseManagement';
import SecurityMonitoring from './SecurityMonitoring';
import SystemReports from './SystemReports';

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

      <TabsContent value="astra-token">
        <AstraTokenManagement />
      </TabsContent>

      <TabsContent value="astra-token-settings">
        <AstraTokenSettings />
      </TabsContent>

      <TabsContent value="tools-management">
        <ToolsManagement />
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

      <TabsContent value="customer-service">
        <CustomerServiceDashboard />
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
        <VendorCategoryManagement />
      </TabsContent>

      <TabsContent value="vendor-services">
        <AdminVendorServiceManagement />
      </TabsContent>

      <TabsContent value="kyc-management">
        <KYCManagement />
      </TabsContent>

      <TabsContent value="membership-management">
        <MembershipManagement />
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
        <DailyCheckinManagement />
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
        <DatabaseManagement />
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

import { lazy } from 'react';

// Lazy load heavy admin components to reduce initial bundle size
export const LazyAdminComponents = {
  // Core admin components
  UserManagement: lazy(() => import('@/components/admin/EnhancedUserManagement')),
  PropertyManagement: lazy(() => import('@/components/admin/PropertyManagementAdvanced')),
  VendorsHub: lazy(() => import('@/components/admin/VendorsHubContent')),
  SecurityMonitoring: lazy(() => import('@/components/admin/SecurityMonitoringDashboard')),
  
  // Analytics components
  WebTrafficAnalytics: lazy(() => import('@/components/admin/WebTrafficAnalytics')),
  AIBotManagement: lazy(() => import('@/components/admin/AIBotManagement')),
  
  // Vendor management
  KYCAnalytics: lazy(() => import('@/components/admin/KYCAnalyticsDashboard')),
  BulkKYCOperations: lazy(() => import('@/components/admin/BulkKYCOperations')),
  DocumentOCR: lazy(() => import('@/components/admin/DocumentOCR')),
  
  // System components
  DatabaseManagement: lazy(() => import('@/components/admin/DatabaseTableManagement')),
  SystemSettings: lazy(() => import('@/components/admin/SystemSettings')),
  
  // Customer service
  CustomerService: lazy(() => import('@/components/admin/CustomerServiceCenter')),
  ContactManagement: lazy(() => import('@/components/admin/ContactManagement')),
  
  // Content management
  ContentManagement: lazy(() => import('@/components/admin/ContentManagement')),
  SearchFilters: lazy(() => import('@/components/admin/SearchFiltersManagement')),
  
  // Billing and payments
  BillingManagement: lazy(() => import('@/components/admin/BillingManagement')),
  IndonesianPayment: lazy(() => import('@/components/admin/IndonesianPaymentMerchantConfig')),
  
  // Tools and utilities
  ToolsManagement: lazy(() => import('@/components/admin/ToolsManagementDashboard')),
  SEOSettings: lazy(() => import('@/components/admin/SEOSettings')),
  SMTPSettings: lazy(() => import('@/components/admin/SMTPSettings')),
  
  // Technical components
  DatabaseErrors: lazy(() => import('@/components/admin/cs-tools/DatabaseErrorManager')),
  ErrorLogs: lazy(() => import('@/components/admin/ErrorLogsTable')),
  SystemReports: lazy(() => import('@/components/admin/SystemReports')),
};

// Lazy load user-facing components (when they exist)
export const LazyUserComponents = {
  // Add user components here when they're created
  // PropertySearch: lazy(() => import('@/components/PropertySearch')),
  // PropertyDetails: lazy(() => import('@/components/PropertyDetails')),
};

// Lazy load external integrations (when they exist)
export const LazyIntegrations = {
  // Add integration components here when they're created
  // Map: lazy(() => import('@/components/Map')),
  // Chart: lazy(() => import('@/components/Chart')),
};

// Helper function to get component with error boundary
export const getLazyComponent = (componentName: string, category: 'admin' | 'user' | 'integration' = 'admin') => {
  const componentMap = {
    admin: LazyAdminComponents,
    user: LazyUserComponents,
    integration: LazyIntegrations,
  };

  const component = componentMap[category][componentName as keyof typeof componentMap[typeof category]];
  
  if (!component) {
    console.warn(`Lazy component "${componentName}" not found in category "${category}"`);
    return null;
  }

  return component;
};

// Bundle analysis helper
export const getBundleInfo = () => {
  const adminComponents = Object.keys(LazyAdminComponents).length;
  const userComponents = Object.keys(LazyUserComponents).length;
  const integrations = Object.keys(LazyIntegrations).length;
  
  return {
    totalLazyComponents: adminComponents + userComponents + integrations,
    adminComponents,
    userComponents,
    integrations,
    estimatedSavings: `~${Math.round((adminComponents + userComponents + integrations) * 0.15)}MB`, // Rough estimate
  };
};
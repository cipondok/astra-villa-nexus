
import { Tool } from '@/types/tools';

export const TOOLS_REGISTRY: Tool[] = [
  // Payment Tools
  {
    id: 'stripe-payments',
    name: 'Stripe Payments',
    description: 'Payment processing with Stripe integration',
    category: 'payment',
    version: '1.0.0',
    enabled: false,
    status: 'disabled',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    healthEndpoint: '/api/stripe/health',
    component: 'StripePayments'
  },
  {
    id: 'paypal-integration',
    name: 'PayPal Integration',
    description: 'PayPal payment gateway integration',
    category: 'payment',
    version: '1.0.0',
    enabled: false,
    status: 'disabled',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    component: 'PayPalIntegration'
  },
  
  // Token Systems
  {
    id: 'astra-tokens',
    name: 'ASTRA Token System',
    description: 'Blockchain-based token management system',
    category: 'token',
    version: '2.0.0',
    enabled: false,
    status: 'disabled',
    lastChecked: new Date().toISOString(),
    dependencies: ['wallet-connection'],
    configRequired: true,
    component: 'AstraTokenManagement'
  },
  {
    id: 'wallet-connection',
    name: 'Wallet Connection',
    description: 'Web3 wallet connection and management',
    category: 'token',
    version: '1.5.0',
    enabled: false,
    status: 'disabled',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    component: 'WalletConnection'
  },
  
  // Analytics Tools
  {
    id: 'web-analytics',
    name: 'Web Analytics',
    description: 'Traffic and user behavior analytics',
    category: 'analytics',
    version: '1.2.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    component: 'WebAnalytics'
  },
  {
    id: 'performance-monitoring',
    name: 'Performance Monitoring',
    description: 'Application performance and error tracking',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    component: 'PerformanceMonitoring'
  },
  
  // Communication Tools
  {
    id: 'ai-chat-bot',
    name: 'AI Chat Bot',
    description: 'AI-powered customer support chat bot',
    category: 'communication',
    version: '3.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    component: 'AIChatBot'
  },
  {
    id: 'live-chat',
    name: 'Live Chat Support',
    description: 'Real-time customer support chat',
    category: 'communication',
    version: '1.1.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    component: 'LiveChatSupport'
  },
  {
    id: 'email-notifications',
    name: 'Email Notifications',
    description: 'Automated email notification system',
    category: 'communication',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    component: 'EmailNotifications'
  },
  
  // Content Management
  {
    id: 'content-management',
    name: 'Content Management',
    description: 'Dynamic content management system',
    category: 'content',
    version: '2.1.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    component: 'ContentManagement'
  },
  {
    id: 'seo-optimization',
    name: 'SEO Optimization',
    description: 'Search engine optimization tools',
    category: 'content',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    component: 'SEOOptimization'
  },
  
  // Security Tools
  {
    id: 'security-monitoring',
    name: 'Security Monitoring',
    description: 'Real-time security threat monitoring',
    category: 'security',
    version: '1.3.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    component: 'SecurityMonitoring'
  },
  {
    id: 'kyc-verification',
    name: 'KYC Verification',
    description: 'Know Your Customer verification system',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    component: 'KYCVerification'
  },
  
  // Integration Tools
  {
    id: 'vendor-management',
    name: 'Vendor Management',
    description: 'Comprehensive vendor and service management',
    category: 'integration',
    version: '2.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    component: 'VendorManagement'
  },
  {
    id: 'property-sync',
    name: 'Property Sync',
    description: 'Third-party property data synchronization',
    category: 'integration',
    version: '1.0.0',
    enabled: false,
    status: 'disabled',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    component: 'PropertySync'
  }
];

export const getToolById = (id: string): Tool | undefined => {
  return TOOLS_REGISTRY.find(tool => tool.id === id);
};

export const getToolsByCategory = (category: Tool['category']): Tool[] => {
  return TOOLS_REGISTRY.filter(tool => tool.category === category);
};

export const getEnabledTools = (): Tool[] => {
  return TOOLS_REGISTRY.filter(tool => tool.enabled);
};

export const getDependentTools = (toolId: string): Tool[] => {
  return TOOLS_REGISTRY.filter(tool => 
    tool.dependencies?.includes(toolId)
  );
};

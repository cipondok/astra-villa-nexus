
import { Tool } from '@/types/tools';

export const TOOLS_REGISTRY: Tool[] = [
  // ============= AI & ML Tools =============
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Core AI assistant for property inquiries and support',
    category: 'communication',
    version: '3.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'ai-assistant',
    component: 'AIAssistant'
  },
  {
    id: 'ai-property-assistant',
    name: 'AI Property Assistant',
    description: 'AI-powered property recommendations and search',
    category: 'communication',
    version: '2.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'ai-property-assistant',
    component: 'AIPropertyAssistant'
  },
  {
    id: 'ai-image-generator',
    name: 'AI Image Generator',
    description: 'Generate property images using AI',
    category: 'content',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    healthEndpoint: 'ai-image-generator',
    component: 'AIImageGenerator'
  },
  {
    id: 'deepseek-ai',
    name: 'DeepSeek AI',
    description: 'Advanced AI diagnostics and code analysis',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    healthEndpoint: 'deepseek-ai',
    component: 'DeepSeekAI'
  },
  {
    id: 'ai-search-recommendations',
    name: 'AI Search Recommendations',
    description: 'AI-powered search suggestions based on user behavior',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'ai-search-recommendations',
    component: 'AISearchRecommendations'
  },
  {
    id: 'ai-search-suggestions',
    name: 'AI Search Suggestions',
    description: 'Smart autocomplete and search suggestions',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'ai-search-suggestions',
    component: 'AISearchSuggestions'
  },
  {
    id: 'smart-recommendations',
    name: 'Smart Recommendations',
    description: 'Personalized property recommendations engine',
    category: 'analytics',
    version: '2.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'smart-recommendations',
    component: 'SmartRecommendations'
  },
  {
    id: 'predictive-pricing',
    name: 'Predictive Pricing',
    description: 'AI-based property price predictions',
    category: 'analytics',
    version: '1.5.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'predictive-pricing',
    component: 'PredictivePricing'
  },
  {
    id: 'user-behavior-analyzer',
    name: 'User Behavior Analyzer',
    description: 'Analyze user patterns and preferences',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'user-behavior-analyzer',
    component: 'UserBehaviorAnalyzer'
  },
  {
    id: 'analyze-property-image',
    name: 'Property Image Analyzer',
    description: 'AI analysis of property images for quality and features',
    category: 'content',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'analyze-property-image',
    component: 'PropertyImageAnalyzer'
  },
  {
    id: 'search-by-image',
    name: 'Search by Image',
    description: 'Find similar properties using image search',
    category: 'content',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'search-by-image',
    component: 'SearchByImage'
  },
  {
    id: 'transcribe-audio',
    name: 'Audio Transcription',
    description: 'Voice-to-text transcription for property notes',
    category: 'content',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'transcribe-audio',
    component: 'AudioTranscription'
  },

  // ============= Payment Tools =============
  {
    id: 'midtrans-payment',
    name: 'Midtrans Payment',
    description: 'Indonesian payment gateway (GoPay, OVO, Bank Transfer)',
    category: 'payment',
    version: '2.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    healthEndpoint: 'midtrans-payment',
    component: 'MidtransPayment'
  },
  {
    id: 'midtrans-webhook',
    name: 'Midtrans Webhook',
    description: 'Payment notification handler for Midtrans',
    category: 'payment',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'midtrans-webhook',
    component: 'MidtransWebhook'
  },
  {
    id: 'create-payment-session',
    name: 'Payment Session',
    description: 'Create secure payment sessions',
    category: 'payment',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'create-payment-session',
    component: 'PaymentSession'
  },
  {
    id: 'create-booking-payment',
    name: 'Booking Payment',
    description: 'Property booking and payment processing',
    category: 'payment',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'create-booking-payment',
    component: 'BookingPayment'
  },
  {
    id: 'verify-payment',
    name: 'Payment Verification',
    description: 'Verify payment status and transactions',
    category: 'payment',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'verify-payment',
    component: 'PaymentVerification'
  },
  {
    id: 'process-refund',
    name: 'Refund Processing',
    description: 'Handle payment refunds and cancellations',
    category: 'payment',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'process-refund',
    component: 'RefundProcessing'
  },
  {
    id: 'generate-invoice',
    name: 'Invoice Generator',
    description: 'Generate PDF invoices for transactions',
    category: 'payment',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'generate-invoice',
    component: 'InvoiceGenerator'
  },

  // ============= Token & Wallet Tools =============
  {
    id: 'astra-token-hub',
    name: 'ASTRA Token Hub',
    description: 'Central management for ASTRA token operations',
    category: 'token',
    version: '2.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'astra-token-hub',
    component: 'AstraTokenHub'
  },
  {
    id: 'wallet-helpers',
    name: 'Wallet Helpers',
    description: 'Utility functions for wallet operations',
    category: 'token',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'wallet-helpers',
    component: 'WalletHelpers'
  },

  // ============= Communication Tools =============
  {
    id: 'live-chat-management',
    name: 'Live Chat Management',
    description: 'Real-time customer support chat system',
    category: 'communication',
    version: '2.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'live-chat-management',
    component: 'LiveChatManagement'
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Customer support ticket and inquiry management',
    category: 'communication',
    version: '1.5.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'customer-service',
    component: 'CustomerService'
  },
  {
    id: 'send-email',
    name: 'Email Service',
    description: 'Transactional and marketing email delivery',
    category: 'communication',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    healthEndpoint: 'send-email',
    component: 'EmailService'
  },
  {
    id: 'send-inquiry-email',
    name: 'Inquiry Email',
    description: 'Property inquiry email notifications',
    category: 'communication',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'send-inquiry-email',
    component: 'InquiryEmail'
  },
  {
    id: 'register-device',
    name: 'Device Registration',
    description: 'Push notification device registration',
    category: 'communication',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'register-device',
    component: 'DeviceRegistration'
  },
  {
    id: 'check-search-notifications',
    name: 'Search Notifications',
    description: 'Notify users about saved search matches',
    category: 'communication',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'check-search-notifications',
    component: 'SearchNotifications'
  },

  // ============= Security & Verification Tools =============
  {
    id: 'login-rate-limiter',
    name: 'Login Rate Limiter',
    description: 'Brute-force protection for authentication',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'login-rate-limiter',
    component: 'LoginRateLimiter'
  },
  {
    id: 'check-breach',
    name: 'Breach Check',
    description: 'Check if email/password has been compromised',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'check-breach',
    component: 'BreachCheck'
  },
  {
    id: 'generate-otp',
    name: 'OTP Generator',
    description: 'Generate one-time passwords for verification',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'generate-otp',
    component: 'OTPGenerator'
  },
  {
    id: 'verify-otp',
    name: 'OTP Verification',
    description: 'Verify one-time passwords',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'verify-otp',
    component: 'OTPVerification'
  },
  {
    id: 'send-2fa-sms',
    name: '2FA SMS',
    description: 'Send two-factor authentication codes via SMS',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    healthEndpoint: 'send-2fa-sms',
    component: '2FASMS'
  },
  {
    id: 'verify-2fa',
    name: '2FA Verification',
    description: 'Verify two-factor authentication codes',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'verify-2fa',
    component: '2FAVerification'
  },
  {
    id: 'verify-documents',
    name: 'Document Verification',
    description: 'AI-powered document authenticity verification',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'verify-documents',
    component: 'DocumentVerification'
  },
  {
    id: 'verify-owner',
    name: 'Owner Verification',
    description: 'Verify property ownership documents',
    category: 'security',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'verify-owner',
    component: 'OwnerVerification'
  },

  // ============= Vendor Tools =============
  {
    id: 'vendor-validation',
    name: 'Vendor Validation',
    description: 'Validate vendor credentials and business info',
    category: 'integration',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'vendor-validation',
    component: 'VendorValidation'
  },
  {
    id: 'verify-vendor',
    name: 'Vendor Verification',
    description: 'Complete vendor verification process',
    category: 'integration',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'verify-vendor',
    component: 'VendorVerification'
  },
  {
    id: 'indonesian-vendor-validation',
    name: 'Indonesian Vendor Validation',
    description: 'Validate Indonesian business documents (NIB, SIUP, TDP)',
    category: 'integration',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'indonesian-vendor-validation',
    component: 'IndonesianVendorValidation'
  },
  {
    id: 'verify-bpjs',
    name: 'BPJS Verification',
    description: 'Verify Indonesian BPJS health/employment status',
    category: 'integration',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'verify-bpjs',
    component: 'BPJSVerification'
  },
  {
    id: 'get-verification-requests',
    name: 'Verification Requests',
    description: 'Fetch pending vendor verification requests',
    category: 'integration',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'get-verification-requests',
    component: 'VerificationRequests'
  },
  {
    id: 'vendor-service-management',
    name: 'Vendor Service Management',
    description: 'Manage vendor services and offerings',
    category: 'integration',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'vendor-service-management',
    component: 'VendorServiceManagement'
  },
  {
    id: 'vendor-function-generator',
    name: 'Vendor Function Generator',
    description: 'Auto-generate vendor-specific functionality',
    category: 'integration',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'vendor-function-generator',
    component: 'VendorFunctionGenerator'
  },

  // ============= Property Tools =============
  {
    id: 'property-services',
    name: 'Property Services',
    description: 'Core property CRUD and management operations',
    category: 'integration',
    version: '2.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'property-services',
    component: 'PropertyServices'
  },
  {
    id: 'upload-property-images',
    name: 'Property Image Upload',
    description: 'Handle property image uploads with optimization',
    category: 'content',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'upload-property-images',
    component: 'PropertyImageUpload'
  },
  {
    id: 'generate-property-image',
    name: 'Property Image AI Generator',
    description: 'Generate property images using OpenAI',
    category: 'content',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    configRequired: true,
    healthEndpoint: 'generate-property-image',
    component: 'PropertyImageAIGenerator'
  },
  {
    id: 'listing-reviver',
    name: 'Listing Reviver',
    description: 'Reactivate and refresh expired listings',
    category: 'content',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'listing-reviver',
    component: 'ListingReviver'
  },
  {
    id: 'rental-negotiator',
    name: 'Rental Negotiator',
    description: 'AI-assisted rental price negotiation',
    category: 'communication',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'rental-negotiator',
    component: 'RentalNegotiator'
  },
  {
    id: 'neighborhood-simulator',
    name: 'Neighborhood Simulator',
    description: 'Simulate and explore neighborhood characteristics',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'neighborhood-simulator',
    component: 'NeighborhoodSimulator'
  },
  {
    id: 'get-collaborative-recommendations',
    name: 'Collaborative Recommendations',
    description: 'Property recommendations based on similar users',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'get-collaborative-recommendations',
    component: 'CollaborativeRecommendations'
  },

  // ============= Analytics & System Tools =============
  {
    id: 'algorithm-analytics',
    name: 'Algorithm Analytics',
    description: 'Track and analyze recommendation algorithm performance',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'algorithm-analytics',
    component: 'AlgorithmAnalytics'
  },
  {
    id: 'algorithm-controller',
    name: 'Algorithm Controller',
    description: 'Control and tune recommendation algorithms',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'algorithm-controller',
    component: 'AlgorithmController'
  },
  {
    id: 'get-filter-analytics',
    name: 'Filter Analytics',
    description: 'Analytics on search filter usage patterns',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'get-filter-analytics',
    component: 'FilterAnalytics'
  },
  {
    id: 'get-smart-filter-suggestions',
    name: 'Smart Filter Suggestions',
    description: 'AI-powered filter suggestions for better search',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'get-smart-filter-suggestions',
    component: 'SmartFilterSuggestions'
  },
  {
    id: 'get-trending-searches',
    name: 'Trending Searches',
    description: 'Track and display trending search queries',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'get-trending-searches',
    component: 'TrendingSearches'
  },
  {
    id: 'track-visitor',
    name: 'Visitor Tracking',
    description: 'Anonymous visitor analytics and tracking',
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'track-visitor',
    component: 'VisitorTracking'
  },
  {
    id: 'system-health-check',
    name: 'System Health Check',
    description: 'Comprehensive system health monitoring',
    category: 'other',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'system-health-check',
    component: 'SystemHealthCheck'
  },
  {
    id: 'database-diagnostics',
    name: 'Database Diagnostics',
    description: 'Database performance and health monitoring',
    category: 'other',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'database-diagnostics',
    component: 'DatabaseDiagnostics'
  },
  {
    id: 'database-fix',
    name: 'Database Fix',
    description: 'Automated database issue resolution',
    category: 'other',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'database-fix',
    component: 'DatabaseFix'
  },
  {
    id: 'load-test',
    name: 'Load Testing',
    description: 'Performance and load testing utilities',
    category: 'other',
    version: '1.0.0',
    enabled: false,
    status: 'disabled',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'load-test',
    component: 'LoadTesting'
  },
  {
    id: 'test-smtp',
    name: 'SMTP Tester',
    description: 'Test SMTP email configuration',
    category: 'other',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'test-smtp',
    component: 'SMTPTester'
  },
  {
    id: 'sync-indonesia-locations',
    name: 'Indonesia Locations Sync',
    description: 'Sync Indonesian province, city, and district data',
    category: 'integration',
    version: '1.0.0',
    enabled: true,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    healthEndpoint: 'sync-indonesia-locations',
    component: 'IndonesiaLocationsSync'
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

export const getToolStats = () => {
  const total = TOOLS_REGISTRY.length;
  const enabled = TOOLS_REGISTRY.filter(t => t.enabled).length;
  const byCategory = TOOLS_REGISTRY.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return { total, enabled, disabled: total - enabled, byCategory };
};

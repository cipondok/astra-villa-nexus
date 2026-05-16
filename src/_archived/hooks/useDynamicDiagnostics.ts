
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DiagnosticResult {
  id: string;
  name: string;
  category: string;
  status: 'completed' | 'in_progress' | 'pending' | 'error';
  progress: number;
  description: string;
  nextStep?: string;
  dependencies?: string[];
  lastUpdated: string;
  testResults?: any;
}

export const useDynamicDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const runDiagnosticTests = async (): Promise<DiagnosticResult[]> => {
    const results: DiagnosticResult[] = [];

    // 1. Test User Authentication System
    try {
      const authTest = await testUserAuthentication();
      results.push({
        id: 'user_auth',
        name: 'User Authentication',
        category: 'Security',
        status: authTest.working ? 'completed' : (authTest.progress > 50 ? 'in_progress' : 'error'),
        progress: authTest.progress,
        description: 'Complete user authentication system with profiles and role management',
        nextStep: authTest.nextStep,
        lastUpdated: new Date().toISOString(),
        testResults: authTest
      });
    } catch (error: any) {
      results.push({
        id: 'user_auth',
        name: 'User Authentication',
        category: 'Security',
        status: 'error',
        progress: 0,
        description: 'Authentication system has critical issues',
        nextStep: 'Fix authentication errors before proceeding',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 2. Test Property Management System
    try {
      const propertyTest = await testPropertyManagement();
      results.push({
        id: 'property_management',
        name: 'Property Management',
        category: 'Core',
        status: propertyTest.working ? 'completed' : (propertyTest.progress > 70 ? 'in_progress' : 'pending'),
        progress: propertyTest.progress,
        description: 'Property CRUD operations, listings, search, and categorization',
        nextStep: propertyTest.nextStep,
        lastUpdated: new Date().toISOString(),
        testResults: propertyTest
      });
    } catch (error: any) {
      results.push({
        id: 'property_management',
        name: 'Property Management',
        category: 'Core',
        status: 'error',
        progress: 0,
        description: 'Property management system has issues',
        nextStep: 'Fix property management errors',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 3. Test Vendor Management System
    try {
      const vendorTest = await testVendorSystem();
      results.push({
        id: 'vendor_system',
        name: 'Vendor Management',
        category: 'Business',
        status: vendorTest.working ? 'completed' : (vendorTest.progress > 60 ? 'in_progress' : 'pending'),
        progress: vendorTest.progress,
        description: 'Vendor registration, services, bookings, and business profiles',
        nextStep: vendorTest.nextStep,
        dependencies: ['user_auth'],
        lastUpdated: new Date().toISOString(),
        testResults: vendorTest
      });
    } catch (error: any) {
      results.push({
        id: 'vendor_system',
        name: 'Vendor Management',
        category: 'Business',
        status: 'error',
        progress: 0,
        description: 'Vendor system has issues',
        nextStep: 'Fix vendor system errors',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 4. Test Payment Processing System
    try {
      const paymentTest = await testPaymentSystem();
      results.push({
        id: 'payment_system',
        name: 'Payment Processing',
        category: 'Commerce',
        status: paymentTest.working ? 'completed' : (paymentTest.progress > 40 ? 'in_progress' : 'pending'),
        progress: paymentTest.progress,
        description: 'Payment gateway integration, booking payments, and transaction handling',
        nextStep: paymentTest.nextStep,
        dependencies: ['vendor_system'],
        lastUpdated: new Date().toISOString(),
        testResults: paymentTest
      });
    } catch (error: any) {
      results.push({
        id: 'payment_system',
        name: 'Payment Processing',
        category: 'Commerce',
        status: 'error',
        progress: 0,
        description: 'Payment system has issues',
        nextStep: 'Fix payment system configuration',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 5. Test Admin Management Panel
    try {
      const adminTest = await testAdminPanel();
      results.push({
        id: 'admin_panel',
        name: 'Admin Management Panel',
        category: 'Management',
        status: adminTest.working ? 'completed' : (adminTest.progress > 50 ? 'in_progress' : 'pending'),
        progress: adminTest.progress,
        description: 'Administrative controls, monitoring, user management, and system settings',
        nextStep: adminTest.nextStep,
        lastUpdated: new Date().toISOString(),
        testResults: adminTest
      });
    } catch (error: any) {
      results.push({
        id: 'admin_panel',
        name: 'Admin Management Panel',
        category: 'Management',
        status: 'error',
        progress: 0,
        description: 'Admin panel has issues',
        nextStep: 'Fix admin panel configuration',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 6. Test Communication System
    try {
      const commTest = await testCommunicationSystem();
      results.push({
        id: 'communication_system',
        name: 'Communication System',
        category: 'Communication',
        status: commTest.working ? 'completed' : (commTest.progress > 30 ? 'in_progress' : 'pending'),
        progress: commTest.progress,
        description: 'AI chat, notifications, inquiries, and customer support',
        nextStep: commTest.nextStep,
        lastUpdated: new Date().toISOString(),
        testResults: commTest
      });
    } catch (error: any) {
      results.push({
        id: 'communication_system',
        name: 'Communication System',
        category: 'Communication',
        status: 'error',
        progress: 0,
        description: 'Communication system has issues',
        nextStep: 'Set up communication features',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 7. Test Analytics & Reporting
    try {
      const analyticsTest = await testAnalyticsSystem();
      results.push({
        id: 'analytics_system',
        name: 'Analytics & Reporting',
        category: 'Intelligence',
        status: analyticsTest.working ? 'completed' : (analyticsTest.progress > 40 ? 'in_progress' : 'pending'),
        progress: analyticsTest.progress,
        description: 'Web analytics, performance tracking, and business intelligence',
        nextStep: analyticsTest.nextStep,
        lastUpdated: new Date().toISOString(),
        testResults: analyticsTest
      });
    } catch (error: any) {
      results.push({
        id: 'analytics_system',
        name: 'Analytics & Reporting',
        category: 'Intelligence',
        status: 'error',
        progress: 0,
        description: 'Analytics system has issues',
        nextStep: 'Set up analytics tracking',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    return results;
  };

  const testUserAuthentication = async () => {
    console.log('🔍 Testing User Authentication System...');
    
    const { data: session } = await supabase.auth.getSession();
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .limit(5);

    let progress = 0;
    let nextStep = '';
    
    if (session) progress += 30;
    if (!profileError) progress += 40;
    if (userRoles && userRoles.length > 0) progress += 30;
    
    if (progress < 50) {
      nextStep = 'Set up user authentication and profiles';
    } else if (progress < 80) {
      nextStep = 'Complete user role management system';
    } else {
      nextStep = 'Authentication system is functional';
    }

    return {
      working: progress >= 80,
      hasSession: !!session,
      profilesAccessible: !profileError,
      hasUserRoles: userRoles && userRoles.length > 0,
      progress,
      nextStep,
      error: profileError?.message
    };
  };

  const testPropertyManagement = async () => {
    console.log('🏠 Testing Property Management System...');
    
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('count')
      .limit(1);

    const { data: categories, error: catError } = await supabase
      .from('property_categories')
      .select('count')
      .limit(1);

    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('count')
      .limit(1);

    let progress = 0;
    let nextStep = '';
    
    if (!propError) progress += 40;
    if (!catError) progress += 30;
    if (!locError) progress += 30;
    
    if (progress < 40) {
      nextStep = 'Set up properties table and basic CRUD';
    } else if (progress < 70) {
      nextStep = 'Complete property categories and location data';
    } else if (progress < 100) {
      nextStep = 'Add advanced property features (search, filters)';
    } else {
      nextStep = 'Property management system is complete';
    }

    return {
      working: progress >= 90,
      hasProperties: !propError,
      hasCategories: !catError,
      hasLocations: !locError,
      progress,
      nextStep,
      error: propError?.message || catError?.message || locError?.message
    };
  };

  const testVendorSystem = async () => {
    console.log('👥 Testing Vendor Management System...');
    
    const { data: vendors, error: vendorError } = await supabase
      .from('vendor_business_profiles')
      .select('count')
      .limit(1);

    const { data: services, error: serviceError } = await supabase
      .from('vendor_services')
      .select('count')
      .limit(1);

    const { data: bookings, error: bookingError } = await supabase
      .from('vendor_bookings')
      .select('count')
      .limit(1);

    const { data: categories, error: catError } = await supabase
      .from('vendor_main_categories')
      .select('count')
      .limit(1);

    let progress = 0;
    let nextStep = '';
    
    if (!vendorError) progress += 25;
    if (!serviceError) progress += 25;
    if (!bookingError) progress += 25;
    if (!catError) progress += 25;
    
    if (progress < 30) {
      nextStep = 'Set up vendor profiles and registration';
    } else if (progress < 60) {
      nextStep = 'Complete vendor services and categories';
    } else if (progress < 90) {
      nextStep = 'Implement booking system and payment integration';
    } else {
      nextStep = 'Vendor system is fully functional';
    }

    return {
      working: progress >= 90,
      hasVendors: !vendorError,
      hasServices: !serviceError,
      hasBookings: !bookingError,
      hasCategories: !catError,
      progress,
      nextStep,
      error: vendorError?.message || serviceError?.message || bookingError?.message
    };
  };

  const testPaymentSystem = async () => {
    console.log('💳 Testing Payment Processing System...');
    
    const { data: bookings, error: bookingError } = await supabase
      .from('vendor_bookings')
      .select('payment_status')
      .limit(1);

    const { data: payments, error: paymentsError } = await supabase
      .from('booking_payments')
      .select('count')
      .limit(1);

    const { data: balances, error: balancesError } = await supabase
      .from('vendor_astra_balances')
      .select('count')
      .limit(1);

    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', 'payment')
      .limit(1);

    let progress = 0;
    let nextStep = '';
    
    if (!bookingError && bookings) progress += 25;
    if (!paymentsError) progress += 30;
    if (!balancesError) progress += 30;
    if (!settingsError && settings && settings.length > 0) progress += 15;
    
    if (progress < 30) {
      nextStep = 'Set up payment infrastructure tables';
    } else if (progress < 60) {
      nextStep = 'Configure payment gateway settings';
    } else if (progress < 90) {
      nextStep = 'Integrate with payment provider (Stripe/PayPal)';
    } else {
      nextStep = 'Payment system is ready for production';
    }

    return {
      working: progress >= 80,
      hasPaymentStatus: !bookingError && bookings,
      hasPaymentTables: !paymentsError,
      hasBalanceTables: !balancesError,
      hasPaymentSettings: !settingsError && settings && settings.length > 0,
      progress,
      nextStep,
      error: bookingError?.message || paymentsError?.message
    };
  };

  const testAdminPanel = async () => {
    console.log('⚙️ Testing Admin Management Panel...');
    
    const { data: alerts, error: alertError } = await supabase
      .from('admin_alerts')
      .select('count')
      .limit(1);

    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('count')
      .limit(1);

    const { data: analytics, error: analyticsError } = await supabase
      .from('daily_analytics')
      .select('count')
      .limit(1);

    let progress = 0;
    let nextStep = '';
    
    if (!alertError) progress += 30;
    if (!settingsError) progress += 35;
    if (!analyticsError) progress += 35;
    
    if (progress < 40) {
      nextStep = 'Set up admin alerts and notifications';
    } else if (progress < 70) {
      nextStep = 'Complete system settings management';
    } else if (progress < 90) {
      nextStep = 'Add analytics and reporting features';
    } else {
      nextStep = 'Admin panel is fully operational';
    }

    return {
      working: progress >= 85,
      hasAlerts: !alertError,
      hasSettings: !settingsError,
      hasAnalytics: !analyticsError,
      progress,
      nextStep,
      error: alertError?.message || settingsError?.message
    };
  };

  const testCommunicationSystem = async () => {
    console.log('💬 Testing Communication System...');
    
    const { data: chatLogs, error: chatError } = await supabase
      .from('ai_chat_logs')
      .select('count')
      .limit(1);

    const { data: notifications, error: notifError } = await supabase
      .from('user_notifications')
      .select('count')
      .limit(1);

    const { data: inquiries, error: inquiryError } = await supabase
      .from('inquiries')
      .select('count')
      .limit(1);

    let progress = 0;
    let nextStep = '';
    
    if (!chatError) progress += 40;
    if (!notifError) progress += 30;
    if (!inquiryError) progress += 30;
    
    if (progress < 30) {
      nextStep = 'Set up AI chat system';
    } else if (progress < 60) {
      nextStep = 'Implement user notifications';
    } else if (progress < 90) {
      nextStep = 'Complete inquiry and support system';
    } else {
      nextStep = 'Communication system is complete';
    }

    return {
      working: progress >= 80,
      hasChat: !chatError,
      hasNotifications: !notifError,
      hasInquiries: !inquiryError,
      progress,
      nextStep,
      error: chatError?.message || notifError?.message
    };
  };

  const testAnalyticsSystem = async () => {
    console.log('📊 Testing Analytics & Reporting System...');
    
    const { data: webAnalytics, error: webError } = await supabase
      .from('web_analytics')
      .select('count')
      .limit(1);

    const { data: dailyAnalytics, error: dailyError } = await supabase
      .from('daily_analytics')
      .select('count')
      .limit(1);

    const { data: trends, error: trendsError } = await supabase
      .from('market_trends')
      .select('count')
      .limit(1);

    let progress = 0;
    let nextStep = '';
    
    if (!webError) progress += 35;
    if (!dailyError) progress += 35;
    if (!trendsError) progress += 30;
    
    if (progress < 30) {
      nextStep = 'Set up web analytics tracking';
    } else if (progress < 60) {
      nextStep = 'Implement daily analytics aggregation';
    } else if (progress < 90) {
      nextStep = 'Add market trends and business intelligence';
    } else {
      nextStep = 'Analytics system is fully operational';
    }

    return {
      working: progress >= 80,
      hasWebAnalytics: !webError,
      hasDailyAnalytics: !dailyError,
      hasTrends: !trendsError,
      progress,
      nextStep,
      error: webError?.message || dailyError?.message
    };
  };

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Starting comprehensive diagnostic tests...');
      const results = await runDiagnosticTests();
      setDiagnostics(results);
      
      // Store results with timestamp
      localStorage.setItem('diagnostic_results', JSON.stringify(results));
      localStorage.setItem('diagnostic_last_run', new Date().toISOString());
      
      console.log('✅ Diagnostic tests completed:', results);
    } catch (error) {
      console.error('❌ Diagnostic tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Load cached results on mount
  useEffect(() => {
    const cached = localStorage.getItem('diagnostic_results');
    if (cached) {
      try {
        setDiagnostics(JSON.parse(cached));
      } catch (error) {
        console.error('Failed to load cached diagnostics:', error);
      }
    }
  }, []);

  // Auto-run diagnostics when user is authenticated
  useEffect(() => {
    if (user) {
      runFullDiagnostics();
      
      // Run diagnostics every 3 minutes for real-time updates
      const interval = setInterval(() => {
        runFullDiagnostics();
      }, 3 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    diagnostics,
    isRunning,
    runFullDiagnostics,
    lastRun: localStorage.getItem('diagnostic_last_run')
  };
};

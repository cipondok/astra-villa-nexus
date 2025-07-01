
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

    // 1. Test User Authentication
    try {
      const authTest = await testUserAuthentication();
      results.push({
        id: 'user_auth',
        name: 'User Authentication',
        category: 'Security',
        status: authTest.working ? 'completed' : 'error',
        progress: authTest.working ? 100 : 50,
        description: 'User login, registration, and profile management',
        lastUpdated: new Date().toISOString(),
        testResults: authTest
      });
    } catch (error) {
      results.push({
        id: 'user_auth',
        name: 'User Authentication',
        category: 'Security',
        status: 'error',
        progress: 0,
        description: 'Authentication system has issues',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 2. Test Property Management
    try {
      const propertyTest = await testPropertyManagement();
      results.push({
        id: 'property_management',
        name: 'Property Management',
        category: 'Core',
        status: propertyTest.working ? 'completed' : 'in_progress',
        progress: propertyTest.progress,
        description: 'Property CRUD operations, listings, and search',
        nextStep: propertyTest.nextStep,
        lastUpdated: new Date().toISOString(),
        testResults: propertyTest
      });
    } catch (error) {
      results.push({
        id: 'property_management',
        name: 'Property Management',
        category: 'Core',
        status: 'error',
        progress: 0,
        description: 'Property management system has issues',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 3. Test Vendor System
    try {
      const vendorTest = await testVendorSystem();
      results.push({
        id: 'vendor_system',
        name: 'Vendor Management',
        category: 'Business',
        status: vendorTest.working ? 'completed' : 'in_progress',
        progress: vendorTest.progress,
        description: 'Vendor registration, services, and verification',
        nextStep: vendorTest.nextStep,
        dependencies: ['user_auth'],
        lastUpdated: new Date().toISOString(),
        testResults: vendorTest
      });
    } catch (error) {
      results.push({
        id: 'vendor_system',
        name: 'Vendor Management',
        category: 'Business',
        status: 'error',
        progress: 0,
        description: 'Vendor system has issues',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 4. Test Payment System (specifically vendor bookings)
    try {
      const paymentTest = await testPaymentSystem();
      results.push({
        id: 'payment_system',
        name: 'Payment Processing',
        category: 'Commerce',
        status: paymentTest.working ? 'in_progress' : 'pending',
        progress: paymentTest.progress,
        description: 'Payment gateway integration and transaction handling',
        nextStep: paymentTest.nextStep,
        dependencies: ['vendor_system'],
        lastUpdated: new Date().toISOString(),
        testResults: paymentTest
      });
    } catch (error) {
      results.push({
        id: 'payment_system',
        name: 'Payment Processing',
        category: 'Commerce',
        status: 'error',
        progress: 0,
        description: 'Payment system has issues',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    // 5. Test Admin Panel
    try {
      const adminTest = await testAdminPanel();
      results.push({
        id: 'admin_panel',
        name: 'Admin Panel',
        category: 'Management',
        status: adminTest.working ? 'completed' : 'in_progress',
        progress: adminTest.progress,
        description: 'Administrative controls and monitoring',
        nextStep: adminTest.nextStep,
        lastUpdated: new Date().toISOString(),
        testResults: adminTest
      });
    } catch (error) {
      results.push({
        id: 'admin_panel',
        name: 'Admin Panel',
        category: 'Management',
        status: 'error',
        progress: 0,
        description: 'Admin panel has issues',
        lastUpdated: new Date().toISOString(),
        testResults: { error: error.message }
      });
    }

    return results;
  };

  const testUserAuthentication = async () => {
    // Test if user can authenticate
    const { data: session } = await supabase.auth.getSession();
    
    // Test if profiles table exists and is accessible
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    return {
      working: !profileError && session !== null,
      hasSession: !!session,
      profilesAccessible: !profileError,
      progress: (!profileError && session) ? 100 : 75,
      error: profileError?.message
    };
  };

  const testPropertyManagement = async () => {
    // Test properties table
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('count')
      .limit(1);

    // Test property categories
    const { data: categories, error: catError } = await supabase
      .from('property_categories')
      .select('count')
      .limit(1);

    const hasProperties = !propError;
    const hasCategories = !catError;
    
    let progress = 0;
    if (hasProperties) progress += 50;
    if (hasCategories) progress += 30;
    if (hasProperties && hasCategories) progress += 20;

    return {
      working: hasProperties && hasCategories,
      hasProperties,
      hasCategories,
      progress,
      nextStep: !hasProperties ? 'Set up properties table' : !hasCategories ? 'Set up property categories' : 'Add advanced filters',
      error: propError?.message || catError?.message
    };
  };

  const testVendorSystem = async () => {
    // Test vendor tables
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

    const hasVendors = !vendorError;
    const hasServices = !serviceError;
    const hasBookings = !bookingError;
    
    let progress = 0;
    if (hasVendors) progress += 30;
    if (hasServices) progress += 30;
    if (hasBookings) progress += 25;
    if (hasVendors && hasServices && hasBookings) progress += 15;

    return {
      working: hasVendors && hasServices && hasBookings,
      hasVendors,
      hasServices,
      hasBookings,
      progress,
      nextStep: !hasVendors ? 'Set up vendor profiles' : !hasServices ? 'Set up vendor services' : !hasBookings ? 'Set up booking system' : 'Complete payment integration',
      error: vendorError?.message || serviceError?.message || bookingError?.message
    };
  };

  const testPaymentSystem = async () => {
    // Test if payment_status column exists in vendor_bookings
    const { data: bookings, error: bookingError } = await supabase
      .from('vendor_bookings')
      .select('payment_status')
      .limit(1);

    // Test system settings for payment controls
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', 'payment')
      .limit(1);

    const hasPaymentStatus = !bookingError;
    const hasPaymentSettings = !settingsError;
    
    let progress = 0;
    if (hasPaymentStatus) progress += 40;
    if (hasPaymentSettings) progress += 20;
    
    return {
      working: hasPaymentStatus,
      hasPaymentStatus,
      hasPaymentSettings,
      progress,
      nextStep: !hasPaymentStatus ? 'Add payment status tracking' : 'Integrate payment gateway',
      error: bookingError?.message
    };
  };

  const testAdminPanel = async () => {
    // Test admin tables
    const { data: alerts, error: alertError } = await supabase
      .from('admin_alerts')
      .select('count')
      .limit(1);

    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('count')
      .limit(1);

    const hasAlerts = !alertError;
    const hasSettings = !settingsError;
    
    let progress = 0;
    if (hasAlerts) progress += 40;
    if (hasSettings) progress += 35;
    if (hasAlerts && hasSettings) progress += 25;

    return {
      working: hasAlerts && hasSettings,
      hasAlerts,
      hasSettings,
      progress,
      nextStep: !hasAlerts ? 'Set up admin alerts' : !hasSettings ? 'Set up system settings' : 'Add reporting dashboards',
      error: alertError?.message || settingsError?.message
    };
  };

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await runDiagnosticTests();
      setDiagnostics(results);
      
      // Store results in localStorage for persistence
      localStorage.setItem('diagnostic_results', JSON.stringify(results));
      localStorage.setItem('diagnostic_last_run', new Date().toISOString());
    } catch (error) {
      console.error('Diagnostic tests failed:', error);
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

  // Auto-run diagnostics every 5 minutes if user is authenticated
  useEffect(() => {
    if (user) {
      runFullDiagnostics();
      
      const interval = setInterval(() => {
        runFullDiagnostics();
      }, 5 * 60 * 1000); // 5 minutes

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

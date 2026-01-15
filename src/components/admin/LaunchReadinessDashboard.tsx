import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Rocket, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Users,
  Building2,
  Code,
  Server,
  Lock,
  Eye,
  TestTube,
  FileCode,
  Layers,
  Activity,
  Bug,
  ChevronRight,
  RefreshCw,
  Zap,
  Globe,
  Settings,
  HardDrive,
  Network,
  ClipboardCheck,
  Target,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LaunchReadinessProps {
  onSectionChange?: (section: string) => void;
}

// Project Modules with actual status
const projectModules = [
  {
    id: 'auth',
    name: 'Authentication System',
    status: 'complete',
    progress: 100,
    description: 'Login, register, password reset, 2FA',
    features: ['Email/Password Auth', 'OTP Verification', 'Session Management', 'Role-based Access'],
    icon: Lock
  },
  {
    id: 'users',
    name: 'User Management',
    status: 'complete',
    progress: 100,
    description: 'Profiles, roles, permissions, levels',
    features: ['User Profiles', 'Role Management', 'User Levels', 'Activity Tracking'],
    icon: Users
  },
  {
    id: 'properties',
    name: 'Property System',
    status: 'complete',
    progress: 95,
    description: 'Listings, search, filters, 3D tours',
    features: ['Property CRUD', 'Advanced Search', 'Image Gallery', '3D Virtual Tours', 'Map Integration'],
    icon: Building2
  },
  {
    id: 'vendors',
    name: 'Vendor Platform',
    status: 'complete',
    progress: 90,
    description: 'Vendor registration, services, verification',
    features: ['Vendor Registration', 'Service Categories', 'KYC Verification', 'Business Profiles'],
    icon: Layers
  },
  {
    id: 'admin',
    name: 'Admin Dashboard',
    status: 'complete',
    progress: 95,
    description: 'Full admin control panel',
    features: ['User Management', 'Content Control', 'Analytics', 'System Settings', 'Alerts'],
    icon: Settings
  },
  {
    id: 'payments',
    name: 'Payment System',
    status: 'in_progress',
    progress: 75,
    description: 'Booking payments, gateway integration',
    features: ['Payment Gateway', 'Booking Payments', 'Invoice Generation', 'Refund Processing'],
    icon: Zap
  },
  {
    id: 'ai',
    name: 'AI Features',
    status: 'complete',
    progress: 85,
    description: 'AI assistant, recommendations, search',
    features: ['AI Chat Assistant', 'Smart Recommendations', 'Image Analysis', 'Price Prediction'],
    icon: Activity
  },
  {
    id: 'analytics',
    name: 'Analytics & Monitoring',
    status: 'complete',
    progress: 90,
    description: 'Visitor tracking, performance monitoring',
    features: ['Visitor Analytics', 'Performance Metrics', 'Error Tracking', 'Activity Logs'],
    icon: TrendingUp
  }
];

// Security checklist items
const securityChecklist = [
  { id: 'rls', name: 'Row Level Security (RLS)', status: 'warning', details: 'Some tables need policy review', severity: 'medium' },
  { id: 'auth', name: 'Authentication Security', status: 'pass', details: 'JWT tokens, secure sessions', severity: 'low' },
  { id: 'input', name: 'Input Validation', status: 'warning', details: 'XSS sanitization needed in map labels', severity: 'medium' },
  { id: 'api', name: 'API Security', status: 'pass', details: 'Edge functions secured', severity: 'low' },
  { id: 'https', name: 'HTTPS Enforcement', status: 'pass', details: 'All connections encrypted', severity: 'low' },
  { id: 'password', name: 'Password Protection', status: 'warning', details: 'Enable leaked password protection', severity: 'medium' },
  { id: 'otp', name: 'OTP Expiry', status: 'warning', details: 'OTP expiry exceeds recommended threshold', severity: 'low' },
  { id: 'postgres', name: 'Database Version', status: 'warning', details: 'Security patches available', severity: 'medium' }
];

// Edge functions to test
const edgeFunctions = [
  { name: 'verify-owner', status: 'active', lastTest: 'Working' },
  { name: 'verify-vendor', status: 'active', lastTest: 'Working' },
  { name: 'ai-assistant', status: 'active', lastTest: 'Working' },
  { name: 'send-email', status: 'active', lastTest: 'Needs API Key' },
  { name: 'generate-invoice', status: 'active', lastTest: 'Working' },
  { name: 'create-payment-session', status: 'pending', lastTest: 'Needs Gateway Config' },
  { name: 'system-health-check', status: 'active', lastTest: 'Working' },
  { name: 'track-visitor', status: 'active', lastTest: 'Working' }
];

const LaunchReadinessDashboard: React.FC<LaunchReadinessProps> = ({ onSectionChange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Fetch actual database stats
  const { data: dbStats, isLoading: dbLoading, refetch: refetchDb } = useQuery({
    queryKey: ['launch-db-stats'],
    queryFn: async () => {
      // Use secure RPC function to get platform stats
      const { data: platformStats } = await supabase.rpc('get_platform_stats');
      
      const statsData = (platformStats as Array<{
        total_users: number;
        total_properties: number;
        total_bookings: number;
        total_vendors: number;
        active_sessions: number;
      }> | null)?.[0];

      const [activities, alerts, errors, admins] = await Promise.all([
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
        supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'super_admin']).eq('is_active', true)
      ]);
      
      return {
        totalUsers: Number(statsData?.total_users) || 0,
        totalProperties: Number(statsData?.total_properties) || 0,
        totalActivities: activities.count || 0,
        pendingAlerts: alerts.count || 0,
        errorCount: errors.count || 0,
        adminCount: admins.count || 0
      };
    },
    refetchInterval: 60000
  });

  // Calculate overall readiness
  const calculateOverallProgress = () => {
    const moduleProgress = projectModules.reduce((acc, m) => acc + m.progress, 0) / projectModules.length;
    const securityProgress = (securityChecklist.filter(s => s.status === 'pass').length / securityChecklist.length) * 100;
    return Math.round((moduleProgress * 0.7) + (securityProgress * 0.3));
  };

  const overallProgress = calculateOverallProgress();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'pending': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'pass': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'warning': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      case 'fail': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
      case 'pass':
      case 'active':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-3.5 w-3.5 text-blue-500" />;
      case 'warning':
      case 'pending':
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border/40 shadow-sm">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]"></div>
        <div className="relative p-3 md:p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <Rocket className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  Launch Readiness Dashboard
                </h1>
                <p className="text-muted-foreground text-[10px] md:text-xs">
                  Project status, security checks & deployment preparation
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => refetchDb()}>
                <RefreshCw className="h-3 w-3" />
                <span className="text-[10px]">Refresh</span>
              </Button>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                overallProgress >= 90 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-600' 
                  : overallProgress >= 70
                  ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-600'
                  : 'bg-red-500/10 border border-red-500/30 text-red-600'
              }`}>
                <Target className="h-3.5 w-3.5" />
                <span>{overallProgress}% Ready</span>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Overall Launch Readiness</span>
              <span className="text-xs font-semibold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <Card className="border-border/30 bg-background/50">
          <CardContent className="p-2 text-center">
            <Users className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-bold">{dbStats?.totalUsers || 0}</p>
            <p className="text-[9px] text-muted-foreground">Users</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-background/50">
          <CardContent className="p-2 text-center">
            <Building2 className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{dbStats?.totalProperties || 0}</p>
            <p className="text-[9px] text-muted-foreground">Properties</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-background/50">
          <CardContent className="p-2 text-center">
            <Activity className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-bold">{dbStats?.totalActivities || 0}</p>
            <p className="text-[9px] text-muted-foreground">Activities</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-background/50">
          <CardContent className="p-2 text-center">
            <Shield className="h-4 w-4 mx-auto text-purple-500 mb-1" />
            <p className="text-lg font-bold">{dbStats?.adminCount || 0}</p>
            <p className="text-[9px] text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-background/50">
          <CardContent className="p-2 text-center">
            <Bug className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-lg font-bold">{dbStats?.errorCount || 0}</p>
            <p className="text-[9px] text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-background/50">
          <CardContent className="p-2 text-center">
            <Server className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <p className="text-lg font-bold">{edgeFunctions.length}</p>
            <p className="text-[9px] text-muted-foreground">Functions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-9 p-1 bg-muted/50 rounded-lg grid grid-cols-4 gap-1">
          <TabsTrigger value="overview" className="h-7 text-[10px] rounded-md gap-1">
            <Layers className="h-3 w-3" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="h-7 text-[10px] rounded-md gap-1">
            <Code className="h-3 w-3" />
            <span className="hidden sm:inline">Modules</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="h-7 text-[10px] rounded-md gap-1">
            <Shield className="h-3 w-3" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="h-7 text-[10px] rounded-md gap-1">
            <ClipboardCheck className="h-3 w-3" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-3 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Module Status Summary */}
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  Project Modules Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {projectModules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <module.icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium">{module.name}</p>
                            <p className="text-[9px] text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={module.progress} className="w-16 h-1.5" />
                          <span className="text-[10px] font-medium w-8">{module.progress}%</span>
                          {getStatusIcon(module.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Security Overview */}
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {securityChecklist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <div>
                            <p className="text-xs font-medium">{item.name}</p>
                            <p className="text-[9px] text-muted-foreground">{item.details}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] ${getStatusColor(item.status)}`}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="border-border/30 border-l-4 border-l-primary">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Next Steps Before Launch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="h-5 w-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-red-500">1</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600">Critical: Security Fixes</p>
                    <p className="text-[10px] text-muted-foreground">Enable leaked password protection, update Postgres version</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <div className="h-5 w-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-orange-500">2</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-600">Important: Payment Gateway</p>
                    <p className="text-[10px] text-muted-foreground">Configure payment gateway credentials for live payments</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <div className="h-5 w-5 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-yellow-500">3</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-yellow-600">Configure: Email Service</p>
                    <p className="text-[10px] text-muted-foreground">Set up SMTP credentials for transactional emails</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-blue-500">4</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600">Testing: End-to-End</p>
                    <p className="text-[10px] text-muted-foreground">Complete user journey testing for all roles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="mt-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectModules.map((module) => (
              <Card 
                key={module.id} 
                className={`border-border/30 cursor-pointer transition-all hover:shadow-md ${
                  expandedModule === module.id ? 'ring-2 ring-primary/50' : ''
                }`}
                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        module.status === 'complete' ? 'bg-green-500/10' : 
                        module.status === 'in_progress' ? 'bg-blue-500/10' : 'bg-orange-500/10'
                      }`}>
                        <module.icon className={`h-4 w-4 ${
                          module.status === 'complete' ? 'text-green-500' : 
                          module.status === 'in_progress' ? 'text-blue-500' : 'text-orange-500'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-xs">{module.name}</CardTitle>
                        <CardDescription className="text-[10px]">{module.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${getStatusColor(module.status)}`}>
                      {module.progress}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <Progress value={module.progress} className="h-1.5 mb-2" />
                  <AnimatePresence>
                    {expandedModule === module.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="pt-2 border-t border-border/30 mt-2">
                          <p className="text-[10px] font-medium mb-1.5 text-muted-foreground">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {module.features.map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-3 space-y-3">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Security Audit Results
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {securityChecklist.filter(s => s.status === 'pass').length}/{securityChecklist.length} Passed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {securityChecklist.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.status === 'pass' ? 'bg-green-500/5 border-green-500/20' :
                      item.status === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                      'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[9px] ${getStatusColor(item.status)}`}>
                        {item.severity}
                      </Badge>
                      {item.status === 'warning' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[10px]"
                          onClick={() => onSectionChange?.('security')}
                        >
                          Fix
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edge Functions Status */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Edge Functions Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {edgeFunctions.map((fn) => (
                  <div 
                    key={fn.name} 
                    className={`p-2 rounded-lg border ${getStatusColor(fn.status)}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {getStatusIcon(fn.status)}
                      <p className="text-[10px] font-medium truncate">{fn.name}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{fn.lastTest}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="mt-3 space-y-3">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Pre-Launch Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                {/* Critical */}
                <div>
                  <p className="text-[10px] font-semibold text-red-500 mb-2 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Critical (Must Fix)
                  </p>
                  <div className="space-y-1.5 pl-4">
                    <ChecklistItem text="Enable leaked password protection in Supabase" status="pending" />
                    <ChecklistItem text="Apply Postgres security patches" status="pending" />
                    <ChecklistItem text="Review Security Definer Views" status="pending" />
                    <ChecklistItem text="Sanitize map city labels for XSS" status="pending" />
                  </div>
                </div>

                {/* Important */}
                <div>
                  <p className="text-[10px] font-semibold text-orange-500 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Important (Recommended)
                  </p>
                  <div className="space-y-1.5 pl-4">
                    <ChecklistItem text="Configure payment gateway (Stripe/Midtrans)" status="pending" />
                    <ChecklistItem text="Set up SMTP for email notifications" status="pending" />
                    <ChecklistItem text="Configure OTP expiry to recommended threshold" status="pending" />
                    <ChecklistItem text="Set function search_path for security" status="pending" />
                  </div>
                </div>

                {/* Testing */}
                <div>
                  <p className="text-[10px] font-semibold text-blue-500 mb-2 flex items-center gap-1">
                    <TestTube className="h-3 w-3" /> Testing Required
                  </p>
                  <div className="space-y-1.5 pl-4">
                    <ChecklistItem text="User registration & login flow" status="complete" />
                    <ChecklistItem text="Property listing & search" status="complete" />
                    <ChecklistItem text="Admin dashboard functions" status="complete" />
                    <ChecklistItem text="Payment processing flow" status="pending" />
                    <ChecklistItem text="Email notifications" status="pending" />
                    <ChecklistItem text="Mobile responsiveness" status="complete" />
                  </div>
                </div>

                {/* Complete */}
                <div>
                  <p className="text-[10px] font-semibold text-green-500 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </p>
                  <div className="space-y-1.5 pl-4">
                    <ChecklistItem text="Authentication system implemented" status="complete" />
                    <ChecklistItem text="Role-based access control" status="complete" />
                    <ChecklistItem text="Admin dashboard" status="complete" />
                    <ChecklistItem text="Property management system" status="complete" />
                    <ChecklistItem text="User management" status="complete" />
                    <ChecklistItem text="AI assistant integration" status="complete" />
                    <ChecklistItem text="Analytics & monitoring" status="complete" />
                    <ChecklistItem text="Error logging system" status="complete" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for checklist items
const ChecklistItem = ({ text, status }: { text: string; status: 'complete' | 'pending' | 'in_progress' }) => (
  <div className="flex items-center gap-2">
    {status === 'complete' ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
    ) : status === 'in_progress' ? (
      <Clock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
    ) : (
      <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
    )}
    <span className={`text-[11px] ${status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
      {text}
    </span>
  </div>
);

export default LaunchReadinessDashboard;

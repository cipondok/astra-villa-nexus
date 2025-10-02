import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Database,
  Shield,
  Zap,
  Users,
  Settings,
  FileText,
  BarChart3,
  ArrowRight,
  Target,
  Lightbulb,
  Award,
  Clock
} from 'lucide-react';

interface ProgressCategory {
  name: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending';
  icon: any;
  color: string;
  tasks: {
    name: string;
    completed: boolean;
    description: string;
  }[];
  nextSteps: string[];
  improvements: string[];
}

const ProjectProgressReport = () => {
  // Fetch real database stats for progress calculation
  const { data: dbStats } = useQuery({
    queryKey: ['project-db-stats'],
    queryFn: async () => {
      const [tables, users, properties, vendors, analytics] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('created_at', '2024-01-01'),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('web_analytics').select('*', { count: 'exact', head: true })
      ]);

      return {
        hasUsers: (users.count || 0) > 0,
        hasProperties: (properties.count || 0) > 0,
        hasVendors: (vendors.count || 0) > 0,
        hasAnalytics: (analytics.count || 0) > 0,
        totalUsers: users.count || 0,
        totalProperties: properties.count || 0,
        totalVendors: vendors.count || 0
      };
    }
  });

  const progressCategories: ProgressCategory[] = [
    {
      name: 'Database & Infrastructure',
      progress: 95,
      status: 'completed',
      icon: Database,
      color: 'text-green-500',
      tasks: [
        { name: 'Database schema design', completed: true, description: 'Complete relational schema with 50+ tables' },
        { name: 'RLS policies implementation', completed: true, description: 'Row-level security for all tables' },
        { name: 'Supabase integration', completed: true, description: 'Full backend integration' },
        { name: 'Data migration scripts', completed: true, description: 'Automated migration system' },
        { name: 'Backup strategy', completed: false, description: 'Needs automated backup configuration' }
      ],
      nextSteps: [
        'Set up automated database backups',
        'Implement database monitoring alerts',
        'Add database performance indexes'
      ],
      improvements: [
        'Consider implementing database sharding for scalability',
        'Add read replicas for improved performance',
        'Set up point-in-time recovery'
      ]
    },
    {
      name: 'User Management & Authentication',
      progress: 95,
      status: 'completed',
      icon: Users,
      color: 'text-blue-500',
      tasks: [
        { name: 'User authentication system', completed: true, description: 'Supabase Auth integration' },
        { name: 'Role-based access control', completed: true, description: 'Admin, vendor, user roles' },
        { name: 'Profile management', completed: true, description: 'Complete profile system' },
        { name: 'Email verification system', completed: true, description: 'Email verification with OTP' },
        { name: 'OTP verification system', completed: true, description: 'SMTP-based OTP delivery' },
        { name: 'Multi-factor authentication', completed: true, description: 'Email MFA with backup codes' }
      ],
      nextSteps: [
        'Implement multi-factor authentication',
        'Add social login providers (Google, Facebook)',
        'Create user onboarding flow'
      ],
      improvements: [
        'Add biometric authentication support',
        'Implement session management dashboard',
        'Create user activity monitoring'
      ]
    },
    {
      name: 'Property Management System',
      progress: dbStats?.hasProperties ? 85 : 65,
      status: dbStats?.hasProperties ? 'in-progress' : 'in-progress',
      icon: FileText,
      color: 'text-purple-500',
      tasks: [
        { name: 'Property listing system', completed: true, description: 'Full CRUD operations' },
        { name: 'Property approval workflow', completed: true, description: 'Admin approval system' },
        { name: 'Property search & filters', completed: true, description: 'Advanced filtering' },
        { name: 'Property analytics', completed: dbStats?.hasProperties || false, description: 'Views, inquiries tracking' },
        { name: 'Virtual tours integration', completed: false, description: '3D tour capabilities' }
      ],
      nextSteps: [
        'Complete virtual tours feature',
        'Add property comparison tool',
        'Implement property recommendations AI'
      ],
      improvements: [
        'Add augmented reality property viewing',
        'Implement AI-powered property valuation',
        'Create property investment calculator'
      ]
    },
    {
      name: 'Vendor Management System',
      progress: dbStats?.hasVendors ? 80 : 60,
      status: 'in-progress',
      icon: Shield,
      color: 'text-orange-500',
      tasks: [
        { name: 'Vendor registration', completed: true, description: 'Complete onboarding' },
        { name: 'Service management', completed: true, description: 'Service listing & pricing' },
        { name: 'Vendor verification', completed: true, description: 'Document verification system' },
        { name: 'Booking system', completed: dbStats?.hasVendors || false, description: 'Appointment scheduling' },
        { name: 'Payment processing', completed: false, description: 'Vendor payment gateway' }
      ],
      nextSteps: [
        'Complete vendor payment integration',
        'Add vendor rating & review system',
        'Implement vendor performance analytics'
      ],
      improvements: [
        'Create vendor certification programs',
        'Add AI-powered vendor matching',
        'Implement vendor loyalty rewards'
      ]
    },
    {
      name: 'Analytics & Reporting',
      progress: dbStats?.hasAnalytics ? 70 : 50,
      status: 'in-progress',
      icon: BarChart3,
      color: 'text-cyan-500',
      tasks: [
        { name: 'Web analytics tracking', completed: true, description: 'Page views, sessions' },
        { name: 'Search analytics', completed: true, description: 'Search behavior tracking' },
        { name: 'User behavior analytics', completed: dbStats?.hasAnalytics || false, description: 'User journey mapping' },
        { name: 'Business intelligence', completed: false, description: 'Advanced reporting' },
        { name: 'Real-time dashboards', completed: false, description: 'Live data visualization' }
      ],
      nextSteps: [
        'Build comprehensive BI dashboards',
        'Add predictive analytics',
        'Implement A/B testing framework'
      ],
      improvements: [
        'Add machine learning insights',
        'Create custom report builder',
        'Implement data export functionality'
      ]
    },
    {
      name: 'Security & Compliance',
      progress: 88,
      status: 'in-progress',
      icon: Shield,
      color: 'text-red-500',
      tasks: [
        { name: 'RLS policies', completed: true, description: 'Row-level security' },
        { name: 'API key management', completed: true, description: 'Secure key storage' },
        { name: 'Audit logging', completed: true, description: 'Security event tracking' },
        { name: 'GDPR compliance', completed: false, description: 'Data privacy compliance' },
        { name: 'Security scanning', completed: false, description: 'Automated vulnerability scanning' }
      ],
      nextSteps: [
        'Complete GDPR compliance implementation',
        'Set up automated security scanning',
        'Add intrusion detection system'
      ],
      improvements: [
        'Implement zero-trust architecture',
        'Add advanced threat detection',
        'Create security incident response plan'
      ]
    },
    {
      name: 'Performance Optimization',
      progress: 65,
      status: 'in-progress',
      icon: Zap,
      color: 'text-yellow-500',
      tasks: [
        { name: 'Code splitting', completed: true, description: 'Lazy loading components' },
        { name: 'Image optimization', completed: true, description: 'Compressed assets' },
        { name: 'Caching strategy', completed: false, description: 'Redis/CDN caching' },
        { name: 'Database indexing', completed: false, description: 'Query optimization' },
        { name: 'Load testing', completed: false, description: 'Performance benchmarking' }
      ],
      nextSteps: [
        'Implement comprehensive caching',
        'Add database query optimization',
        'Conduct load testing'
      ],
      improvements: [
        'Implement CDN for static assets',
        'Add service workers for offline support',
        'Optimize bundle size further'
      ]
    }
  ];

  const overallProgress = Math.round(
    progressCategories.reduce((sum, cat) => sum + cat.progress, 0) / progressCategories.length
  );

  const completedTasks = progressCategories.reduce(
    (sum, cat) => sum + cat.tasks.filter(t => t.completed).length,
    0
  );

  const totalTasks = progressCategories.reduce((sum, cat) => sum + cat.tasks.length, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-gray-500/10 text-gray-500">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <Target className="h-8 w-8" />
                Project Progress Report
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Comprehensive overview of platform development and next steps
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-primary">{overallProgress}%</div>
              <p className="text-sm text-muted-foreground mt-1">Overall Completion</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallProgress} className="h-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">{totalTasks - completedTasks}</div>
                <p className="text-sm text-muted-foreground">Remaining Tasks</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">{progressCategories.length}</div>
                <p className="text-sm text-muted-foreground">Active Categories</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Categories */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {progressCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <CardDescription>{category.progress}% Complete</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(category.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={category.progress} className="h-3" />
                
                <div className="space-y-2">
                  {category.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {task.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="next-steps" className="space-y-4">
          {progressCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                  <CardTitle>{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.nextSteps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary bg-primary/5">
                      <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{step}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Priority: {stepIndex === 0 ? 'High' : stepIndex === 1 ? 'Medium' : 'Low'}
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {stepIndex === 0 ? '1-2 weeks' : stepIndex === 1 ? '2-4 weeks' : '1-2 months'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <div>
                  <CardTitle>Advanced Improvement Recommendations</CardTitle>
                  <CardDescription>Strategic enhancements for next-level growth</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {progressCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                  <CardTitle>{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.improvements.map((improvement, impIndex) => (
                    <div key={impIndex} className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{improvement}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Impact: {impIndex === 0 ? 'High' : impIndex === 1 ? 'Medium' : 'Strategic'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Level: Advanced
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Action Summary */}
      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Recommended Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <h4 className="font-semibold text-red-500 mb-2">Immediate Priority</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Complete GDPR compliance</li>
                  <li>• Set up automated backups</li>
                  <li>• Implement MFA</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-500 mb-2">Short Term (1-2 months)</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Complete virtual tours</li>
                  <li>• Payment integration</li>
                  <li>• Performance optimization</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-500 mb-2">Long Term (3-6 months)</h4>
                <ul className="space-y-2 text-sm">
                  <li>• AI-powered features</li>
                  <li>• Advanced analytics</li>
                  <li>• Mobile app development</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectProgressReport;


import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomerServiceDashboard from '@/components/dashboard/CustomerServiceDashboard';
import { 
  User, 
  Home, 
  Settings, 
  Bell, 
  Activity,
  TrendingUp,
  Calendar,
  MessageSquare
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/?auth=true');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Render Customer Service Dashboard for CS users
  if (profile?.role === 'customer_service') {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <CustomerServiceDashboard />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.full_name || user.email}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Here's an overview of your account and activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="text-lg font-semibold">Active</p>
                <Badge className="mt-1">Verified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saved Properties</p>
                <p className="text-lg font-semibold">12</p>
                <p className="text-xs text-gray-500">Properties you've liked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Activity</p>
                <p className="text-lg font-semibold">5</p>
                <p className="text-xs text-gray-500">Actions this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Viewed property in Downtown</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Contacted agent about listing</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Home className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Saved 3 new properties</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <User className="h-5 w-5" />
                <span className="text-sm">Edit Profile</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Bell className="h-5 w-5" />
                <span className="text-sm">Notifications</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Home className="h-5 w-5" />
                <span className="text-sm">Browse Properties</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm">Contact Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardPage;

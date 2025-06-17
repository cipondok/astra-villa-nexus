
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import NotificationCenter from "@/components/ui/notification-center";
import DailyCheckIn from "@/components/ui/daily-check-in";
import { Settings, User, Home, Search, Building2, Eye, Heart, MessageSquare } from "lucide-react";

const UserDashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md p-8 space-y-4">
          <div className="flex justify-center">
            <Icons.logo className="h-10 w-10" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Loading...</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Please wait while we load your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icons.logo className="h-6 w-6" />
              <CardTitle className="text-lg font-semibold">
                AstraVilla User Dashboard
              </CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <ThemeSwitcher variant="compact" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Avatar"} />
                      <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase() || "AV"}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Icons.user className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/account/settings')}>
                    <Icons.settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <Icons.logout className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="properties" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Properties
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">Welcome to Your Dashboard</CardTitle>
                    <CardDescription>
                      Manage your account, view listings, and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Hello, {profile?.full_name || "User"}! This is your personalized
                      dashboard.
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">12</div>
                          <div className="text-sm text-muted-foreground">Views</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                          <div className="text-2xl font-bold">5</div>
                          <div className="text-sm text-muted-foreground">Favorites</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Search className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">8</div>
                          <div className="text-sm text-muted-foreground">Searches</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-2xl font-bold">3</div>
                          <div className="text-sm text-muted-foreground">Messages</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Button onClick={() => navigate('/')}>
                      Go to Homepage
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Properties</CardTitle>
                    <CardDescription>Properties you've viewed and saved</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No properties saved yet. Start browsing to save your favorite properties!</p>
                    <Button className="mt-4" onClick={() => navigate('/')}>
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent actions and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <User className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Profile Updated</p>
                          <p className="text-sm text-muted-foreground">Today at 2:30 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Search className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Property Search</p>
                          <p className="text-sm text-muted-foreground">Yesterday at 4:15 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Profile Information</h3>
                          <p className="text-sm text-muted-foreground mb-3">Update your personal details</p>
                          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                            Edit Profile
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Notifications</h3>
                          <p className="text-sm text-muted-foreground mb-3">Manage notification preferences</p>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Privacy Settings</h3>
                          <p className="text-sm text-muted-foreground mb-3">Control your data and privacy</p>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Security</h3>
                          <p className="text-sm text-muted-foreground mb-3">Password and security settings</p>
                          <Button variant="outline" size="sm">
                            Update
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            <DailyCheckIn />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboardPage;

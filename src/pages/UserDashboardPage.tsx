
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

const UserDashboardPage = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
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
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <Icons.user className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/settings')}>
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
                <Button onClick={() => router.push('/')}>
                  Go to Homepage
                </Button>
              </CardContent>
            </Card>
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

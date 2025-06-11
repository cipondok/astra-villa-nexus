
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shell } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import VendorProfileProgress from "@/components/vendor/VendorProfileProgress";
import VendorServicesList from "@/components/vendor/VendorServicesList";
import VendorListings from "@/components/vendor/VendorListings";
import VendorAnalytics from "@/components/vendor/VendorAnalytics";
import VendorPayouts from "@/components/vendor/VendorPayouts";
import VendorSupport from "@/components/vendor/VendorSupport";
import VendorSettings from "@/components/vendor/VendorSettings";
import AstraTokenDashboard from "@/components/vendor/AstraTokenDashboard";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import NotificationCenter from "@/components/ui/notification-center";
import DailyCheckIn from "@/components/ui/daily-check-in";

const VendorDashboard = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [activeView, setActiveView] = useState("profile");

  const { data: profile, isLoading } = useQuery({
    queryKey: ['vendor-profile', user?.id],
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
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const renderView = () => {
    switch (activeView) {
      case "profile":
        return <VendorProfileProgress />;
      case "services":
        return <VendorServicesList />;
      case "listings":
        return <VendorListings />;
      case "analytics":
        return <VendorAnalytics />;
      case "payouts":
        return <VendorPayouts />;
      case "support":
        return <VendorSupport />;
      case "settings":
        return <VendorSettings />;
      case "astra":
        return <AstraTokenDashboard />;
      default:
        return <VendorProfileProgress />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 space-y-4">
            <Card className="card-ios">
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
                <CardDescription>Manage your vendor profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveView("profile")}>
                  Profile Progress
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveView("services")}>
                  Services
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveView("listings")}>
                  Listings
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveView("analytics")}>
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveView("payouts")}>
                  Payouts
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveView("support")}>
                  Support
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveView("settings")}>
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveView("astra")}>
                  ASTRA Tokens
                </Button>
              </CardContent>
            </Card>

            <DailyCheckIn />
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

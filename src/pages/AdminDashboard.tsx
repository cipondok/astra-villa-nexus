
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Cog6ToothIcon, UsersIcon, HomeIcon, ListBulletIcon, PlusIcon, GiftIcon, SettingsIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AstraTokenSettings from "@/components/admin/AstraTokenSettings";
import DailyCheckInManagement from "@/components/admin/DailyCheckInManagement";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <HomeIcon className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <ListBulletIcon className="h-4 w-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="create-listing" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Create Listing
            </TabsTrigger>
            <TabsTrigger value="astra-settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              ASTRA Settings
            </TabsTrigger>
            <TabsTrigger value="daily-rewards" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Daily Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div>
              <h2 className="text-xl font-bold">Manage Users</h2>
              <p className="text-muted-foreground">View, edit, and manage user accounts</p>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div>
              <h2 className="text-xl font-bold">Manage Listings</h2>
              <p className="text-muted-foreground">View, edit, and manage property listings</p>
            </div>
          </TabsContent>

          <TabsContent value="create-listing">
            <div>
              <h2 className="text-xl font-bold">Create Listing</h2>
              <p className="text-muted-foreground">Add a new property listing to the platform</p>
            </div>
          </TabsContent>

          <TabsContent value="astra-settings">
            <AstraTokenSettings />
          </TabsContent>

          <TabsContent value="daily-rewards">
            <DailyCheckInManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

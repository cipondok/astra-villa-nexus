
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Shield, Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";

const SystemSettings = lazy(() => import("@/components/admin/SystemSettings"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading...</span>
  </div>
);

interface AdminDashboardHeaderProps {
  isAdmin: boolean;
  user: any;
  profile: any;
}

const AdminDashboardHeader = ({ isAdmin, user, profile }: AdminDashboardHeaderProps) => {
  const navigate = useNavigate();
  const [systemSettingsOpen, setSystemSettingsOpen] = useState(false);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{isAdmin ? 'Admin Dashboard' : 'Agent Dashboard'}</h1>
              <p className="text-sm text-muted-foreground">{isAdmin ? 'System Administration Panel' : 'Agent & Support Panel'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Dialog open={systemSettingsOpen} onOpenChange={setSystemSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>System Settings</DialogTitle>
                  </DialogHeader>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SystemSettings />
                  </Suspense>
                </DialogContent>
              </Dialog>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt={profile?.full_name || user?.user_metadata?.full_name} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/')}>Back to Home</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminDashboardHeader;

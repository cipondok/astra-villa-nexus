
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Building2, 
  Settings,
  Activity,
  AlertTriangle
} from "lucide-react";
import AdminAlertBadge from "./AdminAlertBadge";

interface AdminDashboardHeaderProps {
  isAdmin: boolean;
  user: any;
  profile: any;
}

const AdminDashboardHeader = ({ isAdmin, user, profile }: AdminDashboardHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8" />
              <h1 className="text-3xl font-bold">
                {isAdmin ? "Admin Dashboard" : "Support Dashboard"}
              </h1>
            </div>
            <p className="text-blue-100">
              Welcome back, {profile?.full_name || user?.email}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {isAdmin ? "System Administrator" : "Support Staff"}
              </Badge>
              <AdminAlertBadge />
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Activity className="h-6 w-6" />
                Online
              </div>
              <p className="text-blue-100 text-sm">System Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;

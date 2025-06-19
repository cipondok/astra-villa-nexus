
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Building2, 
  Settings,
  Activity,
  AlertTriangle,
  Bell,
  User
} from "lucide-react";
import AdminAlertBadge from "./AdminAlertBadge";

interface AdminDashboardHeaderProps {
  isAdmin: boolean;
  user: any;
  profile: any;
}

const AdminDashboardHeader = ({ isAdmin, user, profile }: AdminDashboardHeaderProps) => {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  {isAdmin ? "Admin Dashboard" : "Support Dashboard"}
                </h1>
                <p className="text-blue-100 text-lg mt-1">
                  Welcome back, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors px-4 py-2">
                <User className="h-4 w-4 mr-2" />
                {isAdmin ? "System Administrator" : "Support Staff"}
              </Badge>
              <AdminAlertBadge />
              <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-300/30 px-4 py-2">
                <Activity className="h-4 w-4 mr-2" />
                Online
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Activity className="h-5 w-5 text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">System Status</p>
                    <p className="font-semibold text-white">All Systems Operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Active Users</p>
                    <p className="font-semibold text-white">24/7 Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;

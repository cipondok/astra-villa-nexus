import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Building2, Home, Star, AlertCircle } from "lucide-react";
import RoleUpgradeModal from "./RoleUpgradeModal";

const ProfileUpgradeCard = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { profile } = useAuth();

  if (profile?.role !== 'general_user') {
    return null;
  }

  return (
    <>
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-600" />
            Upgrade Your Account
          </CardTitle>
          <CardDescription>
            Unlock professional features by becoming a vendor or agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Current Status: <Badge variant="outline">{profile.role}</Badge>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Limited access to basic features only
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg bg-white/50 dark:bg-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                <h4 className="font-medium text-sm">Vendor</h4>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Offer services</li>
                <li>• Earn income</li>
                <li>• Build business profile</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg bg-white/50 dark:bg-black/20">
              <div className="flex items-center gap-2 mb-2">
                <Home className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-sm">Agent</h4>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• List properties</li>
                <li>• Manage clients</li>
                <li>• Professional tools</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Apply for Professional Account
          </Button>
        </CardContent>
      </Card>

      <RoleUpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};

export default ProfileUpgradeCard;
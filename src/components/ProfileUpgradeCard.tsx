import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Building2, Home, Star, Key } from "lucide-react";
import RoleUpgradeModal from "./RoleUpgradeModal";

const ProfileUpgradeCard = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { profile } = useAuth();

  if (profile?.role !== 'general_user') {
    return null;
  }

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Upgrade Your Account
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Unlock professional features
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-background/50 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-foreground">
                Current: <Badge variant="outline" className="text-[10px] sm:text-xs">{profile.role}</Badge>
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Limited access to basic features
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 border rounded-lg bg-background/50 text-center">
              <Key className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-[10px] sm:text-xs font-medium">Owner</p>
            </div>
            <div className="p-2 border rounded-lg bg-background/50 text-center">
              <Home className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <p className="text-[10px] sm:text-xs font-medium">Agent</p>
            </div>
            <div className="p-2 border rounded-lg bg-background/50 text-center">
              <Building2 className="h-4 w-4 mx-auto mb-1 text-orange-600" />
              <p className="text-[10px] sm:text-xs font-medium">Vendor</p>
            </div>
          </div>

          <Button 
            onClick={() => setShowUpgradeModal(true)}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Upgrade Account
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

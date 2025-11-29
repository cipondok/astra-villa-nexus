import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Building2, Home, Star, Key, Clock, Lock } from "lucide-react";
import RoleUpgradeModal from "./RoleUpgradeModal";
import { useUpgradeRestrictions } from "@/hooks/usePendingApplications";
import { useUserRoles } from "@/hooks/useUserRoles";

const ProfileUpgradeCard = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { profile } = useAuth();
  const { data: restrictions, isLoading: restrictionsLoading } = useUpgradeRestrictions();
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();

  // Check if user has any upgraded roles from user_roles table
  const hasUpgradedRole = userRoles.some(role => 
    ['property_owner', 'agent', 'vendor', 'admin', 'super_admin', 'customer_service'].includes(role)
  );

  // Don't show this card if user already has an upgraded role
  if (hasUpgradedRole) {
    return null;
  }

  const isLoading = restrictionsLoading || rolesLoading;
  const canUpgrade = restrictions?.canUpgrade ?? true;
  const restrictionReason = restrictions?.restrictionReason;
  const hasPendingApplication = restrictions?.hasPendingApplication;
  const daysUntilCanUpgrade = restrictions?.daysUntilCanUpgrade || 0;

  // Get the primary display role
  const displayRole = userRoles.length > 0 ? userRoles[0] : 'general_user';

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
                Current: <Badge variant="outline" className="text-[10px] sm:text-xs">{displayRole}</Badge>
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

          {/* Restriction Warning */}
          {!canUpgrade && restrictionReason && (
            <div className={`p-2 sm:p-3 rounded-lg flex items-start gap-2 ${
              hasPendingApplication 
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' 
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
            }`}>
              {hasPendingApplication ? (
                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
              ) : (
                <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium">
                  {hasPendingApplication ? 'Application Pending' : 'Cooldown Period'}
                </p>
                <p className="text-[10px] sm:text-xs mt-0.5">
                  {restrictionReason}
                </p>
                {daysUntilCanUpgrade > 0 && !hasPendingApplication && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="h-1.5 flex-1 bg-background/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${((30 - daysUntilCanUpgrade) / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium">{30 - daysUntilCanUpgrade}/30 days</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button 
            onClick={() => setShowUpgradeModal(true)}
            disabled={!canUpgrade || isLoading}
            className={`w-full h-9 sm:h-10 text-xs sm:text-sm ${
              canUpgrade 
                ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                Checking...
              </>
            ) : canUpgrade ? (
              <>
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Upgrade Account
              </>
            ) : hasPendingApplication ? (
              <>
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Application Pending
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                {daysUntilCanUpgrade} Days Remaining
              </>
            )}
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

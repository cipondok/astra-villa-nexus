import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Building2, Home, Star, Key, Clock, Lock, ChevronDown, ChevronUp } from "lucide-react";
import RoleUpgradeModal from "./RoleUpgradeModal";
import { useUpgradeRestrictions } from "@/hooks/usePendingApplications";
import { useUserRoles } from "@/hooks/useUserRoles";
import { motion, AnimatePresence } from "framer-motion";

const ProfileUpgradeCard = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        {/* Minimized Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center justify-between hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/10">
              <Star className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs sm:text-sm font-medium">Upgrade Your Account</p>
              <p className="text-[10px] text-muted-foreground">
                {canUpgrade ? 'Unlock professional features' : hasPendingApplication ? 'Application pending' : `${daysUntilCanUpgrade} days remaining`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{displayRole}</Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <CardContent className="p-3 pt-0 space-y-3 border-t border-border/50">
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg mt-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground">
                      Current: <Badge variant="outline" className="text-[10px]">{displayRole}</Badge>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Limited access to basic features
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="p-1.5 border rounded-lg bg-background/50 text-center">
                    <Key className="h-3.5 w-3.5 mx-auto mb-0.5 text-green-600" />
                    <p className="text-[10px] font-medium">Owner</p>
                  </div>
                  <div className="p-1.5 border rounded-lg bg-background/50 text-center">
                    <Home className="h-3.5 w-3.5 mx-auto mb-0.5 text-blue-600" />
                    <p className="text-[10px] font-medium">Agent</p>
                  </div>
                  <div className="p-1.5 border rounded-lg bg-background/50 text-center">
                    <Building2 className="h-3.5 w-3.5 mx-auto mb-0.5 text-orange-600" />
                    <p className="text-[10px] font-medium">Vendor</p>
                  </div>
                </div>

                {/* Restriction Warning */}
                {!canUpgrade && restrictionReason && (
                  <div className={`p-2 rounded-lg flex items-start gap-2 ${
                    hasPendingApplication 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  }`}>
                    {hasPendingApplication ? (
                      <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium">
                        {hasPendingApplication ? 'Application Pending' : 'Cooldown Period'}
                      </p>
                      <p className="text-[10px] mt-0.5">
                        {restrictionReason}
                      </p>
                      {daysUntilCanUpgrade > 0 && !hasPendingApplication && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <div className="h-1 flex-1 bg-background/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${((30 - daysUntilCanUpgrade) / 30) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium">{30 - daysUntilCanUpgrade}/30</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => setShowUpgradeModal(true)}
                  disabled={!canUpgrade || isLoading}
                  size="sm"
                  className={`w-full h-8 text-xs ${
                    canUpgrade 
                      ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-3 w-3 mr-1.5 animate-spin" />
                      Checking...
                    </>
                  ) : canUpgrade ? (
                    <>
                      <UserPlus className="h-3 w-3 mr-1.5" />
                      Upgrade Account
                    </>
                  ) : hasPendingApplication ? (
                    <>
                      <Clock className="h-3 w-3 mr-1.5" />
                      Pending
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1.5" />
                      {daysUntilCanUpgrade} Days
                    </>
                  )}
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <RoleUpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};

export default ProfileUpgradeCard;

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, UserPlus, Home, AlertCircle, Key, Clock, Lock } from "lucide-react";
import VendorRegistrationForm from "./vendor/VendorRegistrationForm";
import AgentRegistrationModal from "./agent/AgentRegistrationModal";
import PropertyOwnerRegistrationForm from "./propertyowner/PropertyOwnerRegistrationForm";
import { useUpgradeRestrictions } from "@/hooks/usePendingApplications";

interface RoleUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleUpgradeModal = ({ isOpen, onClose }: RoleUpgradeModalProps) => {
  const [selectedRole, setSelectedRole] = useState<'vendor' | 'agent' | 'property_owner' | null>(null);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showPropertyOwnerForm, setShowPropertyOwnerForm] = useState(false);
  const { profile } = useAuth();
  const { data: restrictions } = useUpgradeRestrictions();

  const canUpgrade = restrictions?.canUpgrade ?? true;
  const restrictionReason = restrictions?.restrictionReason;
  const hasPendingApplication = restrictions?.hasPendingApplication;
  const daysUntilCanUpgrade = restrictions?.daysUntilCanUpgrade || 0;

  const resetState = () => {
    setSelectedRole(null);
    setShowVendorForm(false);
    setShowAgentForm(false);
    setShowPropertyOwnerForm(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (showVendorForm) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 sm:p-6">
          <VendorRegistrationForm onSuccess={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  if (showAgentForm) {
    return <AgentRegistrationModal isOpen={isOpen} onClose={handleClose} />;
  }

  if (showPropertyOwnerForm) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:p-6">
          <PropertyOwnerRegistrationForm onSuccess={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            Upgrade Your Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Restriction Warning */}
          {!canUpgrade && restrictionReason && (
            <div className={`p-3 sm:p-4 rounded-lg flex items-start gap-3 ${
              hasPendingApplication 
                ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800' 
                : 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800'
            }`}>
              {hasPendingApplication ? (
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {hasPendingApplication ? 'Application Pending' : 'Upgrade Cooldown'}
                </p>
                <p className="text-xs sm:text-sm mt-1 text-muted-foreground">
                  {restrictionReason}
                </p>
                {daysUntilCanUpgrade > 0 && !hasPendingApplication && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 bg-background/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${((30 - daysUntilCanUpgrade) / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{30 - daysUntilCanUpgrade}/30 days</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {canUpgrade && (
            <>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-primary/5 rounded-lg">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-foreground">
                    Current Role: <Badge variant="outline" className="text-xs">{profile?.role}</Badge>
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Choose a professional role to access advanced features
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {/* Property Owner Option */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
                    selectedRole === 'property_owner' ? 'ring-2 ring-primary' : ''
                  }`} 
                  onClick={() => setSelectedRole('property_owner')}
                >
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <Key className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Property Owner
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      List and manage your properties
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <li>• List multiple properties</li>
                      <li>• Access property analytics</li>
                      <li>• Connect with agents & vendors</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Agent Option */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
                    selectedRole === 'agent' ? 'ring-2 ring-primary' : ''
                  }`} 
                  onClick={() => setSelectedRole('agent')}
                >
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <Home className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      Real Estate Agent
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Help clients buy, sell, and rent properties
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <li>• List and manage properties</li>
                      <li>• Access agent tools & resources</li>
                      <li>• Build client relationships</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Vendor Option */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
                    selectedRole === 'vendor' ? 'ring-2 ring-primary' : ''
                  }`} 
                  onClick={() => setSelectedRole('vendor')}
                >
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                      Service Vendor
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Offer services to property owners
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <li>• Create service listings</li>
                      <li>• Accept bookings & earn</li>
                      <li>• Build your business profile</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1 h-9 sm:h-10 text-sm">
              {canUpgrade ? 'Cancel' : 'Close'}
            </Button>
            {canUpgrade && (
              <Button 
                onClick={() => {
                  if (selectedRole === 'vendor') {
                    setShowVendorForm(true);
                  } else if (selectedRole === 'agent') {
                    setShowAgentForm(true);
                  } else if (selectedRole === 'property_owner') {
                    setShowPropertyOwnerForm(true);
                  }
                }}
                disabled={!selectedRole}
                className="flex-1 h-9 sm:h-10 text-sm"
              >
                {selectedRole === 'vendor' 
                  ? 'Apply as Vendor' 
                  : selectedRole === 'agent' 
                    ? 'Apply as Agent' 
                    : selectedRole === 'property_owner'
                      ? 'Apply as Owner'
                      : 'Select Role First'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleUpgradeModal;

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, UserPlus, Home, AlertCircle } from "lucide-react";
import VendorRegistrationForm from "./vendor/VendorRegistrationForm";
import AgentRegistrationModal from "./agent/AgentRegistrationModal";

interface RoleUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleUpgradeModal = ({ isOpen, onClose }: RoleUpgradeModalProps) => {
  const [selectedRole, setSelectedRole] = useState<'vendor' | 'agent' | null>(null);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const { profile } = useAuth();

  if (showVendorForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <VendorRegistrationForm onSuccess={() => {
            setShowVendorForm(false);
            onClose();
          }} />
        </DialogContent>
      </Dialog>
    );
  }

  if (showAgentForm) {
    return <AgentRegistrationModal isOpen={isOpen} onClose={onClose} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Upgrade Your Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Current Role: <Badge variant="outline">{profile?.role}</Badge>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Choose a professional role to access advanced features
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Option */}
            <Card className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === 'vendor' ? 'ring-2 ring-blue-500' : ''
            }`} onClick={() => setSelectedRole('vendor')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  Become a Vendor
                </CardTitle>
                <CardDescription>
                  Offer services to property owners and earn income
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Create and manage service listings</li>
                  <li>• Accept service bookings</li>
                  <li>• Build your business profile</li>
                  <li>• Access vendor dashboard</li>
                  <li>• Track earnings and analytics</li>
                </ul>
              </CardContent>
            </Card>

            {/* Agent Option */}
            <Card className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === 'agent' ? 'ring-2 ring-blue-500' : ''
            }`} onClick={() => setSelectedRole('agent')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="h-5 w-5 text-blue-600" />
                  Become an Agent
                </CardTitle>
                <CardDescription>
                  Help clients buy, sell, and rent properties
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• List and manage properties</li>
                  <li>• Connect with buyers and sellers</li>
                  <li>• Access agent tools and resources</li>
                  <li>• Build client relationships</li>
                  <li>• Professional certification</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedRole === 'vendor') {
                  setShowVendorForm(true);
                } else if (selectedRole === 'agent') {
                  setShowAgentForm(true);
                }
              }}
              disabled={!selectedRole}
              className="flex-1"
            >
              {selectedRole === 'vendor' ? 'Apply as Vendor' : selectedRole === 'agent' ? 'Apply as Agent' : 'Select Role First'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleUpgradeModal;
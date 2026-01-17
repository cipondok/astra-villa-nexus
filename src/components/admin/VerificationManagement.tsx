import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, Building2, UserCheck, CheckCircle, XCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface OwnerVerification {
  id: string;
  user_id: string;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  identity_verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    created_at: string;
  };
}

interface VendorVerification {
  id: string;
  vendor_id: string;
  business_name: string;
  business_type: string;
  is_verified: boolean;
  ktp_verified: boolean;
  npwp_verified: boolean;
  siup_verified: boolean;
  niu_verified: boolean;
  skk_verified: boolean;
  siuk_verified: boolean;
  verification_completed_at: string | null;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

const VerificationManagement = () => {
  const [ownerVerifications, setOwnerVerifications] = useState<OwnerVerification[]>([]);
  const [vendorVerifications, setVendorVerifications] = useState<VendorVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('owners');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('pending');
  
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationType, setVerificationType] = useState<string>('');

  const [stats, setStats] = useState({
    totalOwners: 0,
    totalVendors: 0,
    pendingOwners: 0,
    pendingVendors: 0,
    verifiedOwners: 0,
    verifiedVendors: 0
  });

  const [authStatus, setAuthStatus] = useState<'ok' | 'unauth' | 'forbidden'>('ok');

  useEffect(() => {
    fetchVerifications();
  }, [selectedTab, statusFilter]);

  if (authStatus !== 'ok') {
    return (
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>{authStatus === 'unauth' ? 'Sign in required' : 'Admin access required'}</CardTitle>
          <CardDescription>
            {authStatus === 'unauth'
              ? 'Please sign in to view verification requests.'
              : 'You do not have permission to access this section.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => window.location.href = '/'} variant="outline">Go Home</Button>
          {authStatus === 'unauth' && (
            <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const fetchVerifications = async () => {
    try {
      setLoading(true);

      // Ensure authenticated session and pass JWT explicitly
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setAuthStatus('unauth');
        toast.error('Please sign in to access verification requests');
        return;
      }

      // Call edge function to get verification requests with auth header
      const { data, error } = await supabase.functions.invoke('get-verification-requests', {
        body: {
          type: selectedTab,
          status: statusFilter
        },
        headers: { Authorization: `Bearer ${token}` }
      });


      if (error) throw error;

      if (data.success) {
        setOwnerVerifications(data.data.owners || []);
        setVendorVerifications(data.data.vendors || []);
        setStats(data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching verifications:', error);
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('admin')) {
        setAuthStatus('forbidden');
        toast.error('Admin access required');
      } else if (msg.includes('unauthorized')) {
        setAuthStatus('unauth');
        toast.error('Please sign in to continue');
      } else {
        toast.error('Failed to load verification requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOwner = async (userId: string, type: 'identity' | 'email' | 'phone', status: boolean) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Unauthorized');

      const { data, error } = await supabase.functions.invoke('verify-owner', {
        body: {
          userId,
          verificationType: type,
          status,
          notes: verificationNotes
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setVerificationDialog(false);
        setVerificationNotes('');
        fetchVerifications();
      }
    } catch (error: any) {
      console.error('Error verifying owner:', error);
      toast.error(error.message || 'Failed to update verification');
    }
  };

  const handleVerifyVendor = async (vendorId: string, type: string, status: boolean) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Unauthorized');

      const { data, error } = await supabase.functions.invoke('verify-vendor', {
        body: {
          vendorId,
          verificationType: type,
          status,
          notes: verificationNotes
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setVerificationDialog(false);
        setVerificationNotes('');
        fetchVerifications();
      }
    } catch (error: any) {
      console.error('Error verifying vendor:', error);
      toast.error(error.message || 'Failed to update verification');
    }
  };

  const openVerificationDialog = (user: any, type: string) => {
    setSelectedUser(user);
    setVerificationType(type);
    setVerificationDialog(true);
  };

  const renderOwnerCard = (verification: OwnerVerification) => {
    const isPending = !verification.identity_verified || !verification.email_verified || !verification.phone_verified;
    
    return (
      <Card key={verification.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={verification.profiles?.avatar_url || ''} />
                <AvatarFallback>{verification.profiles?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{verification.profiles?.full_name}</CardTitle>
                <CardDescription className="text-sm">{verification.profiles?.email}</CardDescription>
              </div>
            </div>
            <Badge variant={isPending ? 'secondary' : 'default'} className="gap-1">
              {isPending ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
              {isPending ? 'Pending' : 'Verified'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <VerificationItem
              label="Identity Verification"
              verified={verification.identity_verified}
              verifiedAt={verification.identity_verified_at}
              onVerify={() => openVerificationDialog(verification, 'identity')}
            />
            <VerificationItem
              label="Email Verification"
              verified={verification.email_verified}
              verifiedAt={verification.email_verified_at}
              onVerify={() => openVerificationDialog(verification, 'email')}
            />
            <VerificationItem
              label="Phone Verification"
              verified={verification.phone_verified}
              verifiedAt={verification.phone_verified_at}
              onVerify={() => openVerificationDialog(verification, 'phone')}
            />
          </div>
          
          {verification.verification_notes && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
              <strong>Notes:</strong> {verification.verification_notes}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Registered: {new Date(verification.profiles?.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVendorCard = (vendor: VendorVerification) => {
    const isPending = !vendor.is_verified;
    
    return (
      <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">{vendor.business_name}</CardTitle>
                <CardDescription className="text-sm capitalize">{vendor.business_type}</CardDescription>
                {vendor.profiles && (
                  <CardDescription className="text-xs">{vendor.profiles.email}</CardDescription>
                )}
              </div>
            </div>
            <Badge variant={isPending ? 'secondary' : 'default'} className="gap-1">
              {isPending ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
              {isPending ? 'Pending' : 'Verified'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <VerificationItem
              label="General Verification"
              verified={vendor.is_verified}
              verifiedAt={vendor.verification_completed_at}
              onVerify={() => openVerificationDialog(vendor, 'general')}
            />
            <VerificationItem
              label="KTP Verified"
              verified={vendor.ktp_verified}
              onVerify={() => openVerificationDialog(vendor, 'ktp')}
            />
            <VerificationItem
              label="NPWP Verified"
              verified={vendor.npwp_verified}
              onVerify={() => openVerificationDialog(vendor, 'npwp')}
            />
            <VerificationItem
              label="SIUP Verified"
              verified={vendor.siup_verified}
              onVerify={() => openVerificationDialog(vendor, 'siup')}
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            Registered: {new Date(vendor.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold">{stats.totalOwners}</p>
              <p className="text-[9px] text-muted-foreground">Owners • {stats.pendingOwners} pending</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-lg font-bold">{stats.totalVendors}</p>
              <p className="text-[9px] text-muted-foreground">Vendors • {stats.pendingVendors} pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-lg font-bold text-orange-600">{stats.pendingOwners + stats.pendingVendors}</p>
              <p className="text-[9px] text-muted-foreground">Action Required</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Verification Tabs */}
      <Card>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs">Verification Requests</CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className="h-6 text-[9px] px-2"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                className="h-6 text-[9px] px-2"
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'verified' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('verified')}
                className="h-6 text-[9px] px-2"
              >
                Verified
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 h-7">
              <TabsTrigger value="owners" className="text-[10px] h-6 gap-1">
                <ShieldCheck className="h-3 w-3" />
                Owners ({stats.totalOwners})
              </TabsTrigger>
              <TabsTrigger value="vendors" className="gap-2">
                <Building2 className="h-4 w-4" />
                Vendors ({stats.totalVendors})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="owners" className="mt-6">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : ownerVerifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No owner verifications found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownerVerifications.map(renderOwnerCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="vendors" className="mt-6">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : vendorVerifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vendor verifications found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendorVerifications.map(renderVendorCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onOpenChange={setVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Verification Status</DialogTitle>
            <DialogDescription>
              Update {verificationType} verification for {selectedUser?.profiles?.full_name || selectedUser?.business_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Verification Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this verification..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setVerificationDialog(false);
                setVerificationNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedTab === 'owners') {
                  handleVerifyOwner(selectedUser.user_id, verificationType as any, false);
                } else {
                  handleVerifyVendor(selectedUser.vendor_id, verificationType, false);
                }
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedTab === 'owners') {
                  handleVerifyOwner(selectedUser.user_id, verificationType as any, true);
                } else {
                  handleVerifyVendor(selectedUser.vendor_id, verificationType, true);
                }
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for verification items
const VerificationItem = ({ label, verified, verifiedAt, onVerify }: any) => (
  <div className="flex items-center justify-between py-2 border-b">
    <div className="flex items-center gap-2">
      {verified ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400" />
      )}
      <span className="text-sm">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {verified && verifiedAt && (
        <span className="text-xs text-muted-foreground">
          {new Date(verifiedAt).toLocaleDateString()}
        </span>
      )}
      <Button size="sm" variant="ghost" onClick={onVerify}>
        {verified ? 'Revoke' : 'Verify'}
      </Button>
    </div>
  </div>
);

export default VerificationManagement;

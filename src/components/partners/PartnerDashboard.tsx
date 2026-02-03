import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/utils/formatters";
import { 
  Building2, Users, DollarSign, TrendingUp, Copy, Plus, 
  Clock, CheckCircle, XCircle, Wallet, FileText, Package
} from "lucide-react";

const PARTNER_TYPE_LABELS: Record<string, string> = {
  mortgage_broker: "Mortgage Broker",
  home_inspector: "Home Inspector",
  moving_company: "Moving Company",
  insurance_provider: "Insurance Provider",
  interior_designer: "Interior Designer",
  smart_home_installer: "Smart Home Installer"
};

const PartnerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [newReferral, setNewReferral] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_type: "",
    notes: ""
  });

  // Fetch partner profile
  const { data: partner, isLoading: partnerLoading } = useQuery({
    queryKey: ['partner-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['partner-referrals', partner?.id],
    queryFn: async () => {
      if (!partner?.id) return [];
      const { data, error } = await supabase
        .from('partner_referrals')
        .select('*')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!partner?.id,
  });

  // Fetch payouts
  const { data: payouts = [] } = useQuery({
    queryKey: ['partner-payouts', partner?.id],
    queryFn: async () => {
      if (!partner?.id) return [];
      const { data, error } = await supabase
        .from('partner_payouts')
        .select('*')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!partner?.id,
  });

  // Fetch packages
  const { data: packages = [] } = useQuery({
    queryKey: ['partner-packages', partner?.id],
    queryFn: async () => {
      if (!partner?.id) return [];
      const { data, error } = await supabase
        .from('partner_packages')
        .select('*')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!partner?.id,
  });

  // Create referral mutation
  const createReferral = useMutation({
    mutationFn: async (referralData: typeof newReferral) => {
      const { data, error } = await supabase
        .from('partner_referrals')
        .insert({
          partner_id: partner?.id,
          ...referralData
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsNewReferralOpen(false);
      setNewReferral({ customer_name: "", customer_email: "", customer_phone: "", service_type: "", notes: "" });
      toast({ title: "Success", description: "Referral submitted successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const copyReferralLink = () => {
    if (partner?.id) {
      const link = `${window.location.origin}/?partner=${partner.id.slice(0, 8)}`;
      navigator.clipboard.writeText(link);
      toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      qualified: "outline",
      converted: "default",
      rejected: "destructive",
      expired: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (partnerLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!partner) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Become a Partner
          </CardTitle>
          <CardDescription>Join our partnership program to earn commissions and grow your business</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Partner with us to access exclusive referral opportunities, revenue sharing, and package deals.
          </p>
          <Button>Apply for Partnership</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 via-background to-blue-500/5 rounded-xl border border-border/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold">{partner.company_name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {PARTNER_TYPE_LABELS[partner.partner_type] || partner.partner_type}
              </Badge>
              <span>•</span>
              <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                {partner.status}
              </Badge>
            </div>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={copyReferralLink} className="gap-2">
          <Copy className="h-3 w-3" />
          Copy Link
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold mt-1">{partner.total_referrals || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Conversions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{partner.successful_conversions || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Pending Payout</span>
            </div>
            <p className="text-lg font-bold mt-1">{formatIDR(partner.pending_payout || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Earned</span>
            </div>
            <p className="text-lg font-bold mt-1">{formatIDR(partner.total_earnings || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            {partner.commission_rate > 0 && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span>Commission: <strong>{partner.commission_rate}%</strong></span>
              </div>
            )}
            {partner.revenue_share_rate > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Revenue Share: <strong>{partner.revenue_share_rate}%</strong></span>
              </div>
            )}
            {partner.referral_fee > 0 && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-500" />
                <span>Referral Fee: <strong>{formatIDR(partner.referral_fee)}</strong></span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="referrals" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="packages" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Packages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Your Referrals</h3>
            <Dialog open={isNewReferralOpen} onOpenChange={setIsNewReferralOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  New Referral
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit New Referral</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input 
                      value={newReferral.customer_name}
                      onChange={(e) => setNewReferral(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={newReferral.customer_email}
                        onChange={(e) => setNewReferral(prev => ({ ...prev, customer_email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        value={newReferral.customer_phone}
                        onChange={(e) => setNewReferral(prev => ({ ...prev, customer_phone: e.target.value }))}
                        placeholder="+62..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Input 
                      value={newReferral.service_type}
                      onChange={(e) => setNewReferral(prev => ({ ...prev, service_type: e.target.value }))}
                      placeholder="e.g., Property Purchase, Home Inspection"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={newReferral.notes}
                      onChange={(e) => setNewReferral(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional details..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => createReferral.mutate(newReferral)}
                    disabled={!newReferral.customer_name || createReferral.isPending}
                  >
                    {createReferral.isPending ? "Submitting..." : "Submit Referral"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {referrals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No referrals yet. Submit your first referral to start earning!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {referrals.map((referral: any) => (
                <Card key={referral.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{referral.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {referral.service_type || "General"} • {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(referral.status)}
                        {referral.commission_amount && (
                          <p className="text-xs text-green-600 mt-1">
                            {formatIDR(referral.commission_amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payouts" className="mt-3 space-y-3">
          <h3 className="font-semibold">Payout History</h3>
          {payouts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No payouts yet. Payouts are processed monthly.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {payouts.map((payout: any) => (
                <Card key={payout.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatIDR(payout.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {payout.payment_method} • {new Date(payout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                        {payout.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Your Package Deals</h3>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Package
            </Button>
          </div>
          {packages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No packages yet. Create bundled offers for customers!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {packages.map((pkg: any) => (
                <Card key={pkg.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{pkg.package_name}</p>
                        <p className="text-xs text-muted-foreground">{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm line-through text-muted-foreground">{formatIDR(pkg.original_price)}</p>
                        <p className="font-bold text-green-600">{formatIDR(pkg.discounted_price)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerDashboard;

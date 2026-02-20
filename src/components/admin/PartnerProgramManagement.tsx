import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/utils/formatters";
import { 
  Building2, Users, DollarSign, TrendingUp, Search, Plus,
  CheckCircle, XCircle, Wallet, FileText, Package, Activity,
  Filter, Download, RefreshCw
} from "lucide-react";

const PARTNER_TYPE_LABELS: Record<string, string> = {
  mortgage_broker: "Mortgage Broker",
  home_inspector: "Home Inspector",
  moving_company: "Moving Company",
  insurance_provider: "Insurance Provider",
  interior_designer: "Interior Designer",
  smart_home_installer: "Smart Home Installer"
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending: "secondary",
  suspended: "destructive",
  terminated: "destructive"
};

type PartnerStatus = "active" | "pending" | "suspended" | "terminated";
type PartnerType = "mortgage_broker" | "home_inspector" | "moving_company" | "insurance_provider" | "interior_designer" | "smart_home_installer";

const PartnerProgramManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PartnerType | "all">("all");
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  // Fetch all partners
  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ['admin-partners', statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase.from('partners').select('*').order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as PartnerStatus);
      }
      if (typeFilter !== 'all') {
        query = query.eq('partner_type', typeFilter as PartnerType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch all referrals
  const { data: allReferrals = [] } = useQuery({
    queryKey: ['admin-all-referrals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_referrals')
        .select('*, partners(company_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Fetch pending payouts
  const { data: pendingPayouts = [] } = useQuery({
    queryKey: ['admin-pending-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_payouts')
        .select('*, partners(company_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Update partner status
  const updatePartnerStatus = useMutation({
    mutationFn: async ({ partnerId, status }: { partnerId: string; status: PartnerStatus }) => {
      const { error } = await supabase
        .from('partners')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', partnerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      toast({ title: "Success", description: "Partner status updated" });
    }
  });

  // Update referral status
  const updateReferralStatus = useMutation({
    mutationFn: async ({ referralId, status, commissionAmount }: { referralId: string; status: string; commissionAmount?: number }) => {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === 'converted') {
        updateData.converted_at = new Date().toISOString();
        if (commissionAmount) updateData.commission_amount = commissionAmount;
      } else if (status === 'qualified') {
        updateData.qualified_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('partner_referrals')
        .update(updateData)
        .eq('id', referralId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      toast({ title: "Success", description: "Referral status updated" });
    }
  });

  // Process payout
  const processPayout = useMutation({
    mutationFn: async ({ payoutId, status, reference }: { payoutId: string; status: string; reference?: string }) => {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      };
      if (reference) updateData.payment_reference = reference;
      
      const { error } = await supabase
        .from('partner_payouts')
        .update(updateData)
        .eq('id', payoutId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      toast({ title: "Success", description: "Payout processed" });
    }
  });

  // Create payout for partner
  const createPayout = useMutation({
    mutationFn: async (partnerId: string) => {
      const partner = partners.find(p => p.id === partnerId);
      if (!partner || partner.pending_payout <= 0) throw new Error("No pending amount");
      
      const { error } = await supabase
        .from('partner_payouts')
        .insert({
          partner_id: partnerId,
          amount: partner.pending_payout,
          bank_name: partner.bank_name,
          account_number: partner.bank_account_number,
          account_name: partner.bank_account_name
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payouts'] });
      toast({ title: "Success", description: "Payout request created" });
    }
  });

  const filteredPartners = partners.filter(p => 
    p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === 'active').length,
    totalReferrals: partners.reduce((sum, p) => sum + (p.total_referrals || 0), 0),
    totalEarnings: partners.reduce((sum, p) => sum + Number(p.total_earnings || 0), 0),
    pendingPayouts: partners.reduce((sum, p) => sum + Number(p.pending_payout || 0), 0)
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary/5 rounded-xl border border-border/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold">Partnership Program Management</h1>
            <p className="text-xs text-muted-foreground">Manage partners, referrals, and payouts</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">Total Partners</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.totalPartners}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-chart-1" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.activePartners}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Referrals</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.totalReferrals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
              <span className="text-xs text-muted-foreground">Total Paid</span>
            </div>
            <p className="text-lg font-bold mt-1">{formatIDR(stats.totalEarnings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-lg font-bold mt-1">{formatIDR(stats.pendingPayouts)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="partners" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="referrals" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners" className="mt-3 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PartnerStatus | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as PartnerType | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(PARTNER_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Partners List */}
          {partnersLoading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPartners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{partner.company_name}</h3>
                          <Badge variant={STATUS_COLORS[partner.status] || "secondary"}>
                            {partner.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {PARTNER_TYPE_LABELS[partner.partner_type]} • {partner.contact_email}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                          <span>Referrals: <strong>{partner.total_referrals || 0}</strong></span>
                          <span>Conversions: <strong>{partner.successful_conversions || 0}</strong></span>
                          <span>Pending: <strong>{formatIDR(partner.pending_payout || 0)}</strong></span>
                          <span>Total: <strong>{formatIDR(partner.total_earnings || 0)}</strong></span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {partner.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updatePartnerStatus.mutate({ partnerId: partner.id, status: 'active' })}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updatePartnerStatus.mutate({ partnerId: partner.id, status: 'terminated' })}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {partner.status === 'active' && partner.pending_payout > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => createPayout.mutate(partner.id)}
                          >
                            <Wallet className="h-3.5 w-3.5 mr-1" />
                            Create Payout
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Recent Referrals</h3>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
          
          <div className="space-y-2">
            {allReferrals.map((referral: any) => (
              <Card key={referral.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{referral.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {referral.partners?.company_name} • {referral.service_type || "General"} • {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={referral.status} 
                        onValueChange={(status) => updateReferralStatus.mutate({ 
                          referralId: referral.id, 
                          status,
                          commissionAmount: status === 'converted' ? 500000 : undefined
                        })}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Pending Payouts</h3>
            <Badge variant="outline">{pendingPayouts.length} pending</Badge>
          </div>
          
          {pendingPayouts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending payouts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {pendingPayouts.map((payout: any) => (
                <Card key={payout.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{payout.partners?.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payout.bank_name} - {payout.account_number}
                        </p>
                        <p className="text-lg font-bold text-primary mt-1">{formatIDR(payout.amount)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => processPayout.mutate({ payoutId: payout.id, status: 'completed' })}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Mark Paid
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => processPayout.mutate({ payoutId: payout.id, status: 'cancelled' })}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Partner Performance by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(PARTNER_TYPE_LABELS).map(([type, label]) => {
                    const typePartners = partners.filter(p => p.partner_type === type);
                    const totalReferrals = typePartners.reduce((sum, p) => sum + (p.total_referrals || 0), 0);
                    const totalEarnings = typePartners.reduce((sum, p) => sum + Number(p.total_earnings || 0), 0);
                    
                    return (
                      <div key={type} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{typePartners.length} partners</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{totalReferrals} referrals</p>
                          <p className="text-xs text-chart-1">{formatIDR(totalEarnings)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversion Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Conversion Rate</span>
                    <span className="text-lg font-bold">
                      {stats.totalReferrals > 0 
                        ? ((partners.reduce((sum, p) => sum + (p.successful_conversions || 0), 0) / stats.totalReferrals) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Earnings per Partner</span>
                    <span className="text-lg font-bold">
                      {formatIDR(stats.activePartners > 0 ? stats.totalEarnings / stats.activePartners : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Payouts</span>
                    <span className="text-lg font-bold text-chart-3">{formatIDR(stats.pendingPayouts)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerProgramManagement;

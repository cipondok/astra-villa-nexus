import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Gift,
  Landmark,
  FileText,
  Instagram,
  Building2,
  GraduationCap,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Plus,
  Edit,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  Ban,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import SEOManagement from "./marketing/SEOManagement";

const UserAcquisitionManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPartnershipDialog, setShowPartnershipDialog] = useState(false);

  // Fetch referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['acquisition-referrals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_referrals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch bank partnerships
  const { data: bankPartnerships = [] } = useQuery({
    queryKey: ['acquisition-bank-partnerships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_bank_partnerships')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch SEO content
  const { data: seoContent = [] } = useQuery({
    queryKey: ['acquisition-seo-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_seo_content')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch influencers
  const { data: influencers = [] } = useQuery({
    queryKey: ['acquisition-influencers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_influencers')
        .select('*')
        .order('followers_count', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch corporate partnerships
  const { data: corporatePartnerships = [] } = useQuery({
    queryKey: ['acquisition-corporate-partnerships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_corporate_partnerships')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch university partnerships
  const { data: universityPartnerships = [] } = useQuery({
    queryKey: ['acquisition-university-partnerships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_university_partnerships')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate stats
  const convertedReferrals = referrals.filter(r => r.status === 'converted' || r.status === 'rewarded').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'signed_up').length;
  const totalReferralRewards = referrals.filter(r => r.referrer_reward_paid).reduce((sum, r) => sum + (r.referrer_reward_amount || 0), 0);
  const seoArticleGoal = 1000;
  const seoProgress = (seoContent.length / seoArticleGoal) * 100;
  const totalInfluencerReach = influencers.reduce((sum, i) => sum + (i.followers_count || 0), 0);
  const targetCPA = 300000; // Rp 300.000 target CPA

  // These would come from analytics in real implementation
  const referralRewardSpend = totalReferralRewards;
  const bankLeadSpend = 0;
  const influencerSpend = influencers.reduce((sum, i) => sum + (i.total_campaigns || 0) * (i.rate_per_post || 0), 0);
  const bankConversions = bankPartnerships.reduce((sum, b) => sum + (b.total_conversions || 0), 0);
  const influencerConversions = influencers.reduce((sum, i) => sum + (i.total_conversions || 0), 0);

  // Calculate CPA
  const totalSpend = referralRewardSpend + bankLeadSpend + influencerSpend;
  const totalAcquisitions = convertedReferrals + bankConversions + influencerConversions;
  const actualCPA = totalAcquisitions > 0 ? totalSpend / totalAcquisitions : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'converted':
      case 'rewarded':
        return <CheckCircle className="h-4 w-4 text-chart-1" />;
      case 'pending':
      case 'signed_up':
        return <Clock className="h-4 w-4 text-chart-3" />;
      case 'expired':
      case 'cancelled':
        return <Ban className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[6px] bg-primary/10 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">User Acquisition System</h2>
            <p className="text-sm text-muted-foreground">
              Referrals, Partnerships, SEO, Influencers, Corporate & University Programs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-chart-1/10 px-4 py-2 rounded-[6px] border border-chart-1/20">
          <span className="text-sm text-muted-foreground">Target CPA</span>
          <span className="text-lg font-bold text-chart-1">&lt; {formatCurrency(targetCPA)}</span>
        </div>
      </div>

      {/* Stats Grid - Professional Rumah123 Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-card border border-border rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[6px] bg-chart-1/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className={`text-xl font-bold ${actualCPA <= targetCPA ? 'text-chart-1' : 'text-destructive'}`}>
                {formatCurrency(actualCPA)}
              </p>
              <p className="text-xs text-muted-foreground">Current CPA</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[6px] bg-accent/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{referrals.length}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{convertedReferrals} converted</p>
        </div>

        <div className="bg-card border border-border rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[6px] bg-primary/10 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{bankPartnerships.length}</p>
              <p className="text-xs text-muted-foreground">Bank Partners</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{bankConversions} leads</p>
        </div>

        <div className="bg-card border border-border rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[6px] bg-chart-1/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{seoContent.length}</p>
              <p className="text-xs text-muted-foreground">SEO Articles</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <Progress value={seoProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">{seoProgress.toFixed(1)}% of 1,000</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[6px] bg-accent/10 flex items-center justify-center">
              <Instagram className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{influencers.length}</p>
              <p className="text-xs text-muted-foreground">Influencers</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{formatNumber(totalInfluencerReach)} reach</p>
        </div>

        <div className="bg-card border border-border rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[6px] bg-chart-3/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{corporatePartnerships.length}</p>
              <p className="text-xs text-muted-foreground">Corporate</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">HR partnerships</p>
        </div>

        <div className="bg-card border border-border rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[6px] bg-chart-4/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{universityPartnerships.length}</p>
              <p className="text-xs text-muted-foreground">Universities</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">Student housing</p>
        </div>
      </div>

      {/* Main Tabs - Professional Style */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-6 bg-muted/50 border border-border rounded-[6px] p-1">
          <TabsTrigger value="overview" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Referral 2.0</TabsTrigger>
          <TabsTrigger value="banks" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Banks</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">SEO Factory</TabsTrigger>
          <TabsTrigger value="influencers" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Influencers</TabsTrigger>
          <TabsTrigger value="partnerships" className="text-xs rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Corporate/Uni</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Referral Program Stats */}
            <Card className="bg-card border border-border rounded-[6px] shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Gift className="h-4 w-4 text-accent-foreground" />
                    Referral Program 2.0
                  </CardTitle>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">Give Rp 1.5jt, Get Rp 1.5jt</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="bg-muted/30 rounded-[6px] p-3">
                    <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
                    <p className="text-xs text-muted-foreground">Total Referrals</p>
                  </div>
                   <div className="bg-chart-1/10 rounded-[6px] p-3">
                    <p className="text-2xl font-bold text-chart-1">{convertedReferrals}</p>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                  <div className="bg-chart-3/10 rounded-[6px] p-3">
                    <p className="text-2xl font-bold text-chart-3">{pendingReferrals}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">Total Rewards Paid: <span className="font-bold text-foreground">{formatCurrency(totalReferralRewards)}</span></p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Content Factory */}
            <Card className="bg-card border border-border rounded-[6px] shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-chart-1" />
                    SEO Content Factory
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{seoContent.length} / 1,000 articles</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={seoProgress} className="h-2 mb-4" />
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-muted/30 rounded-[6px] p-2">
                    <p className="text-lg font-bold text-foreground">{seoContent.filter(s => s.status === 'published').length}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                  <div className="bg-muted/30 rounded-[6px] p-2">
                    <p className="text-lg font-bold text-foreground">{seoContent.filter(s => s.status === 'draft').length}</p>
                    <p className="text-xs text-muted-foreground">Drafts</p>
                  </div>
                  <div className="bg-muted/30 rounded-[6px] p-2">
                    <p className="text-lg font-bold text-foreground">{seoContent.filter(s => s.ai_generated).length}</p>
                    <p className="text-xs text-muted-foreground">AI Generated</p>
                  </div>
                  <div className="bg-muted/30 rounded-[6px] p-2">
                    <p className="text-lg font-bold text-foreground">{seoContent.reduce((sum, s) => sum + (s.organic_traffic || 0), 0)}</p>
                    <p className="text-xs text-muted-foreground">Traffic</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Influencer Network */}
            <Card className="bg-card border border-border rounded-[6px] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-accent-foreground" />
                  Influencer Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-muted/30 rounded-[6px] p-3">
                    <p className="text-lg font-bold text-foreground">{influencers.filter(i => i.platform === 'tiktok').length}</p>
                    <p className="text-xs text-muted-foreground">TikTok</p>
                  </div>
                  <div className="bg-muted/30 rounded-[6px] p-3">
                    <p className="text-lg font-bold text-foreground">{influencers.filter(i => i.platform === 'instagram').length}</p>
                    <p className="text-xs text-muted-foreground">Instagram</p>
                  </div>
                  <div className="bg-muted/30 rounded-[6px] p-3">
                    <p className="text-lg font-bold text-foreground">{influencers.filter(i => i.platform === 'youtube').length}</p>
                    <p className="text-xs text-muted-foreground">YouTube</p>
                  </div>
                  <div className="bg-primary/10 rounded-[6px] p-3">
                    <p className="text-lg font-bold text-primary">{formatNumber(totalInfluencerReach)}</p>
                    <p className="text-xs text-muted-foreground">Total Reach</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Summary */}
            <Card className="bg-card border border-border rounded-[6px] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                   <Building2 className="h-4 w-4 text-chart-3" />
                  Strategic Partnerships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-[6px]">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Bank/Mortgage Partners</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">{bankPartnerships.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-[6px]">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-chart-3" />
                      <span className="text-sm font-medium text-foreground">Corporate HR Programs</span>
                    </div>
                    <Badge className="bg-chart-3/10 text-chart-3 border-0">{corporatePartnerships.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-[6px]">
                    <div className="flex items-center gap-2">
                       <GraduationCap className="h-4 w-4 text-chart-4" />
                      <span className="text-sm font-medium text-foreground">University Housing</span>
                    </div>
                    <Badge className="bg-chart-4/10 text-chart-4 border-0">{universityPartnerships.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-accent-foreground" />
                    Referral Program 2.0
                  </CardTitle>
                  <CardDescription>Give Rp 1,500,000, Get Rp 1,500,000</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referee</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rewards</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{referral.referral_code}</code>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                            navigator.clipboard.writeText(referral.referral_code);
                            toast.success("Copied!");
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{referral.referrer_id?.slice(0, 8)}...</TableCell>
                      <TableCell className="text-sm">{referral.referee_email || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{referral.source_channel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(referral.status)}
                          <span className="text-sm capitalize">{referral.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p>Referrer: {referral.referrer_reward_paid ? '✅' : '⏳'} {formatCurrency(referral.referrer_reward_amount)}</p>
                          <p>Referee: {referral.referee_reward_paid ? '✅' : '⏳'} {formatCurrency(referral.referee_reward_amount)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(referral.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {referrals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No referrals yet. Share referral links to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banks Tab */}
        <TabsContent value="banks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bank & Mortgage Partnerships</CardTitle>
                <Button onClick={() => setShowPartnershipDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Partner
                </Button>
              </div>
              <CardDescription>Strategic partnerships with banks for KPR/mortgage referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankPartnerships.map((bank) => (
                    <TableRow key={bank.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Landmark className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{bank.bank_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{bank.partnership_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={bank.partnership_tier === 'premium' ? 'default' : 'secondary'}>
                          {bank.partnership_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>{bank.commission_rate}%</TableCell>
                      <TableCell>{bank.total_leads_sent}</TableCell>
                      <TableCell>{bank.total_conversions}</TableCell>
                      <TableCell>{formatCurrency(bank.total_commission_earned || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={bank.is_active ? "default" : "secondary"}>
                          {bank.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab - Full Management */}
        <TabsContent value="seo" className="space-y-4">
          <SEOManagement />
        </TabsContent>

        {/* Influencers Tab */}
        <TabsContent value="influencers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>TikTok/Instagram Influencer Network</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Influencer
                </Button>
              </div>
              <CardDescription>Property influencers for sponsored content and brand awareness</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Influencer</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Rate/Post</TableHead>
                    <TableHead>Campaigns</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {influencers.map((influencer) => (
                    <TableRow key={influencer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent to-chart-5 rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {influencer.influencer_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{influencer.influencer_name}</p>
                            <p className="text-xs text-muted-foreground">@{influencer.handle}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{influencer.platform}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(influencer.followers_count || 0)}</TableCell>
                      <TableCell>{influencer.engagement_rate}%</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{influencer.partnership_tier}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(influencer.rate_per_post || 0)}</TableCell>
                      <TableCell>{influencer.total_campaigns}</TableCell>
                      <TableCell>{influencer.total_conversions}</TableCell>
                      <TableCell>
                        <Badge variant={influencer.is_active ? "default" : "secondary"}>
                          {influencer.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {influencers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No influencers added yet. Start building your network.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Corporate/University Tab */}
        <TabsContent value="partnerships" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Corporate Partnerships */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-chart-3" />
                    Corporate HR Programs
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <CardDescription>Employee housing benefits and relocation programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {corporatePartnerships.map((corp) => (
                    <div key={corp.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{corp.company_name}</p>
                          <p className="text-xs text-muted-foreground">{corp.industry} • {corp.employee_count?.toLocaleString()} employees</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={corp.is_active ? "default" : "secondary"}>
                          {corp.partnership_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {corp.total_employees_registered} registered
                        </p>
                      </div>
                    </div>
                  ))}
                  {corporatePartnerships.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No corporate partnerships yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* University Partnerships */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-chart-4" />
                    University Student Housing
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <CardDescription>Student housing programs with universities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {universityPartnerships.map((uni) => (
                    <div key={uni.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-chart-4/10 rounded flex items-center justify-center">
                           <GraduationCap className="h-5 w-5 text-chart-4" />
                        </div>
                        <div>
                          <p className="font-medium">{uni.university_name}</p>
                          <p className="text-xs text-muted-foreground">{uni.campus_location} • {uni.student_population?.toLocaleString()} students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={uni.is_active ? "default" : "secondary"}>
                          {uni.partnership_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {uni.total_placements} placements
                        </p>
                      </div>
                    </div>
                  ))}
                  {universityPartnerships.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No university partnerships yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Partnership Dialog */}
      <Dialog open={showPartnershipDialog} onOpenChange={setShowPartnershipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Partnership</DialogTitle>
            <DialogDescription>Add a new bank or mortgage company partnership</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input placeholder="e.g., Bank Mandiri" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Partnership Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mortgage">Mortgage</SelectItem>
                    <SelectItem value="kpr">KPR</SelectItem>
                    <SelectItem value="refinancing">Refinancing</SelectItem>
                    <SelectItem value="home_equity">Home Equity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input type="number" step="0.1" placeholder="0.5" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" placeholder="partner@bank.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartnershipDialog(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Partnership added!"); setShowPartnershipDialog(false); }}>Add Partnership</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAcquisitionManagement;

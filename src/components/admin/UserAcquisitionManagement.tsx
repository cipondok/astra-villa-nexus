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
  Ban
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const targetCPA = 300000; // ~$20 in IDR

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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'signed_up':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
      case 'cancelled':
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            User Acquisition System
          </h2>
          <p className="text-muted-foreground">
            Referrals, Partnerships, SEO, Influencers, Corporate & University Programs
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Target CPA</p>
          <p className="text-xl font-bold text-green-600">&lt; {formatCurrency(targetCPA)}</p>
        </div>
      </div>

      {/* CPA & Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="col-span-1">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Current CPA</p>
                <p className={`text-xl font-bold ${actualCPA <= targetCPA ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(actualCPA)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-xs text-muted-foreground">Referrals</p>
                <p className="text-xl font-bold">{referrals.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{convertedReferrals} converted</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Bank Partners</p>
                <p className="text-xl font-bold">{bankPartnerships.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{bankConversions} leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">SEO Articles</p>
                <p className="text-xl font-bold">{seoContent.length}</p>
              </div>
            </div>
            <Progress value={seoProgress} className="h-1 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{seoProgress.toFixed(1)}% of 1000</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Influencers</p>
                <p className="text-xl font-bold">{influencers.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(totalInfluencerReach)} reach</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Corporate</p>
                <p className="text-xl font-bold">{corporatePartnerships.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">HR partnerships</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-xs text-muted-foreground">Universities</p>
                <p className="text-xl font-bold">{universityPartnerships.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Student housing</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs">Referral 2.0</TabsTrigger>
          <TabsTrigger value="banks" className="text-xs">Banks</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs">SEO Factory</TabsTrigger>
          <TabsTrigger value="influencers" className="text-xs">Influencers</TabsTrigger>
          <TabsTrigger value="partnerships" className="text-xs">Corporate/Uni</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Referral Program Stats */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gift className="h-4 w-4 text-pink-500" />
                    Referral Program 2.0
                  </CardTitle>
                  <Badge variant="outline">Give $100, Get $100</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <p className="text-2xl font-bold">{referrals.length}</p>
                    <p className="text-xs text-muted-foreground">Total Referrals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{convertedReferrals}</p>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{pendingReferrals}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm">Total Rewards Paid: <span className="font-bold">{formatCurrency(totalReferralRewards)}</span></p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Content Factory */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    SEO Content Factory
                  </CardTitle>
                  <Badge variant="outline">{seoContent.length} / 1,000 articles</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={seoProgress} className="h-3 mb-4" />
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{seoContent.filter(s => s.status === 'published').length}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{seoContent.filter(s => s.status === 'draft').length}</p>
                    <p className="text-xs text-muted-foreground">Drafts</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{seoContent.filter(s => s.ai_generated).length}</p>
                    <p className="text-xs text-muted-foreground">AI Generated</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{seoContent.reduce((sum, s) => sum + (s.organic_traffic || 0), 0)}</p>
                    <p className="text-xs text-muted-foreground">Traffic</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Influencer Network */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-purple-500" />
                    Influencer Network
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  <div>
                    <p className="text-lg font-bold">{influencers.filter(i => i.platform === 'tiktok').length}</p>
                    <p className="text-xs text-muted-foreground">TikTok</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{influencers.filter(i => i.platform === 'instagram').length}</p>
                    <p className="text-xs text-muted-foreground">Instagram</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{influencers.filter(i => i.platform === 'youtube').length}</p>
                    <p className="text-xs text-muted-foreground">YouTube</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatNumber(totalInfluencerReach)}</p>
                    <p className="text-xs text-muted-foreground">Total Reach</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-500" />
                  Strategic Partnerships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Bank/Mortgage Partners</span>
                    </div>
                    <Badge>{bankPartnerships.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Corporate HR Programs</span>
                    </div>
                    <Badge>{corporatePartnerships.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm">University Housing</span>
                    </div>
                    <Badge>{universityPartnerships.length}</Badge>
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
                    <Gift className="h-5 w-5 text-pink-500" />
                    Referral Program 2.0
                  </CardTitle>
                  <CardDescription>Give Rp 1,500,000, Get Rp 1,500,000 (~$100 each)</CardDescription>
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

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SEO Content Factory</CardTitle>
                  <CardDescription>Goal: 1,000 property-related articles for organic traffic</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress value={seoProgress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-1">{seoContent.length} of 1,000 articles ({seoProgress.toFixed(1)}%)</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Traffic</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seoContent.slice(0, 10).map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{content.title}</p>
                          <p className="text-xs text-muted-foreground">{content.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{content.content_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{content.primary_keyword}</TableCell>
                      <TableCell>{content.organic_traffic?.toLocaleString() || 0}</TableCell>
                      <TableCell>{content.conversions || 0}</TableCell>
                      <TableCell>
                        <Badge variant={content.status === 'published' ? "default" : "secondary"}>
                          {content.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {seoContent.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Start creating SEO-optimized content to drive organic traffic.
                </div>
              )}
            </CardContent>
          </Card>
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
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                    <Building2 className="h-5 w-5 text-orange-500" />
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
                    <GraduationCap className="h-5 w-5 text-indigo-500" />
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
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-indigo-600" />
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

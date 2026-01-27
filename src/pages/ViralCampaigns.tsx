import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Rocket, Users, Camera, Handshake, TrendingUp, 
  Calendar, DollarSign, Target, Clock, CheckCircle
} from "lucide-react";
import { ReferralCampaignCard, UGCChallengeCard, LocalPartnershipCard } from "@/components/campaigns";

interface CampaignOverview {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: string;
  spent: string;
  targetMetric: string;
  currentMetric: string;
  timeline: string[];
}

const CAMPAIGN_OVERVIEWS: CampaignOverview[] = [
  {
    id: 'referral',
    name: 'Refer & Earn Campaign',
    type: 'Referral Program',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 'IDR 100M',
    spent: 'IDR 23M',
    targetMetric: '1,000 referrals',
    currentMetric: '287 referrals',
    timeline: [
      'Week 1-2: Soft launch to existing users',
      'Week 3-4: Email campaign blast',
      'Month 2: Social media push',
      'Month 3: Influencer partnerships',
      'Month 4-6: Scale based on performance'
    ]
  },
  {
    id: 'ugc',
    name: 'Dream Home Photo Challenge',
    type: 'UGC Challenge',
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    budget: 'IDR 15M',
    spent: 'IDR 5M',
    targetMetric: '500 submissions',
    currentMetric: '142 submissions',
    timeline: [
      'Week 1: Launch announcement across all channels',
      'Week 2-3: Daily highlights of best submissions',
      'Week 4: Voting period opens',
      'Week 5: Community voting + judge panel',
      'Week 6: Winners announcement + prize distribution'
    ]
  },
  {
    id: 'partnership',
    name: 'Local Business Alliance',
    type: 'Partnership Campaign',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    budget: 'IDR 40M',
    spent: 'IDR 12M',
    targetMetric: '50 partners',
    currentMetric: '18 partners',
    timeline: [
      'Month 1: Identify & approach top 20 prospects',
      'Month 2-3: Onboard first wave of partners',
      'Month 4: Launch co-marketing initiatives',
      'Month 5-6: Measure & optimize partnerships',
      'Month 7+: Scale to new service categories'
    ]
  }
];

const ViralCampaigns = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Viral Marketing Campaigns</h1>
              <p className="text-muted-foreground">
                Drive growth through referrals, user content, and partnerships
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">3 Active Campaigns</Badge>
            <Badge variant="outline">IDR 155M Total Budget</Badge>
            <Badge className="bg-green-500">30% Target Conversion</Badge>
          </div>
        </div>

        {/* Campaign Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="referral" className="gap-2">
              <Users className="w-4 h-4" />
              Referral
            </TabsTrigger>
            <TabsTrigger value="ugc" className="gap-2">
              <Camera className="w-4 h-4" />
              UGC Challenge
            </TabsTrigger>
            <TabsTrigger value="partnership" className="gap-2">
              <Handshake className="w-4 h-4" />
              Partnerships
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CAMPAIGN_OVERVIEWS.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{campaign.type}</span>
                    </div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Budget
                        </p>
                        <p className="font-medium">{campaign.budget}</p>
                        <p className="text-xs text-muted-foreground">Spent: {campaign.spent}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Target
                        </p>
                        <p className="font-medium">{campaign.targetMetric}</p>
                        <p className="text-xs text-green-600">Current: {campaign.currentMetric}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" />
                        Timeline
                      </p>
                      <ul className="space-y-1">
                        {campaign.timeline.slice(0, 3).map((item, index) => (
                          <li key={index} className="text-xs flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {campaign.timeline.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{campaign.timeline.length - 3} more phases
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTab(campaign.id)}
                    >
                      View Campaign
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Budget Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">IDR 155M</p>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 text-center">
                    <p className="text-2xl font-bold text-green-600">IDR 40M</p>
                    <p className="text-sm text-muted-foreground">Spent to Date</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                    <p className="text-2xl font-bold text-blue-600">26%</p>
                    <p className="text-sm text-muted-foreground">Budget Utilization</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                    <p className="text-2xl font-bold text-purple-600">3.2x</p>
                    <p className="text-sm text-muted-foreground">Projected ROI</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">447</p>
                    <p className="text-sm text-muted-foreground">Total Participants</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-500">287</p>
                    <p className="text-sm text-muted-foreground">Referral Signups</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-500">142</p>
                    <p className="text-sm text-muted-foreground">UGC Submissions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-500">18</p>
                    <p className="text-sm text-muted-foreground">Business Partners</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-500">28%</p>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Campaign Tabs */}
          <TabsContent value="referral">
            <ReferralCampaignCard />
          </TabsContent>

          <TabsContent value="ugc">
            <UGCChallengeCard />
          </TabsContent>

          <TabsContent value="partnership">
            <LocalPartnershipCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ViralCampaigns;

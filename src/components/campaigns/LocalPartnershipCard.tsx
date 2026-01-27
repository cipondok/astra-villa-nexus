import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Handshake, Building2, Star, MapPin, ExternalLink, 
  Phone, Mail, CheckCircle, TrendingUp, Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessPartner {
  id: string;
  business_name: string;
  business_type: string;
  logo_url: string | null;
  website_url: string | null;
  partnership_tier: string;
  customer_rating: number;
  review_count: number;
  featured_on_platform: boolean;
}

const PARTNER_TYPES = [
  { id: 'interior_designer', label: 'Interior Designer', icon: '🎨' },
  { id: 'moving_company', label: 'Moving Company', icon: '🚚' },
  { id: 'home_insurance', label: 'Home Insurance', icon: '🛡️' },
  { id: 'mortgage_broker', label: 'Mortgage Broker', icon: '🏦' },
  { id: 'furniture_store', label: 'Furniture Store', icon: '🛋️' },
  { id: 'cleaning_service', label: 'Cleaning Service', icon: '🧹' },
  { id: 'renovation_contractor', label: 'Renovation Contractor', icon: '🔨' },
  { id: 'smart_home_installer', label: 'Smart Home', icon: '🏠' }
];

const TIER_BADGES: Record<string, { label: string; color: string }> = {
  basic: { label: 'Partner', color: 'bg-gray-500' },
  premium: { label: 'Premium Partner', color: 'bg-blue-500' },
  exclusive: { label: 'Exclusive Partner', color: 'bg-amber-500' }
};

const LocalPartnershipCard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("directory");
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  
  // Application form
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    service_areas: ''
  });

  const fetchPartners = useCallback(async () => {
    try {
      let query = supabase
        .from('business_partners')
        .select('*')
        .eq('status', 'active')
        .order('featured_on_platform', { ascending: false })
        .order('customer_rating', { ascending: false });

      if (selectedType !== 'all') {
        query = query.eq('business_type', selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleApply = async () => {
    if (!formData.business_name || !formData.business_type || !formData.contact_email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('business_partners').insert({
        ...formData,
        service_areas: formData.service_areas.split(',').map(s => s.trim()),
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Application Submitted! 🎉",
        description: "We'll review your application and get back to you soon.",
      });

      setShowApplyDialog(false);
      setFormData({
        business_name: '',
        business_type: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        website_url: '',
        service_areas: ''
      });

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const valueProposition = {
    forPartners: [
      "Access to 10,000+ qualified property leads monthly",
      "Co-branded marketing on property listings",
      "Featured placement in partner directory",
      "Customer insights and analytics dashboard",
      "Priority referrals from our agent network"
    ],
    forPlatform: [
      "Enhanced user experience with trusted services",
      "Additional revenue through referral fees",
      "Content generation from partner expertise",
      "Market expansion into new verticals"
    ]
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Handshake className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <CardTitle>Local Business Partnerships</CardTitle>
            <CardDescription>
              Connect with trusted service providers for your property needs
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="directory">Partner Directory</TabsTrigger>
            <TabsTrigger value="benefits">Partnership Benefits</TabsTrigger>
            <TabsTrigger value="apply">Become a Partner</TabsTrigger>
          </TabsList>

          {/* Directory Tab */}
          <TabsContent value="directory" className="space-y-4">
            {/* Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                All Partners
              </Button>
              {PARTNER_TYPES.map(type => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.icon} {type.label}
                </Button>
              ))}
            </div>

            {/* Partner List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="animate-pulse h-32" />
                ))}
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No partners found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partners.map(partner => {
                  const typeInfo = PARTNER_TYPES.find(t => t.id === partner.business_type);
                  const tierInfo = TIER_BADGES[partner.partnership_tier] || TIER_BADGES.basic;
                  
                  return (
                    <Card key={partner.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl">
                            {partner.logo_url ? (
                              <img src={partner.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              typeInfo?.icon || '🏢'
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{partner.business_name}</h4>
                              {partner.featured_on_platform && (
                                <Badge variant="secondary" className="text-xs">Featured</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {typeInfo?.label || partner.business_type}
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">
                                  {partner.customer_rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({partner.review_count})
                                </span>
                              </div>
                              <Badge className={`${tierInfo.color} text-white text-xs`}>
                                {tierInfo.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Phone className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          {partner.website_url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(partner.website_url!, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="font-medium text-emerald-600 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  For Partners
                </h4>
                <ul className="space-y-3">
                  {valueProposition.forPartners.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h4 className="font-medium text-blue-600 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Co-Marketing Ideas
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    Joint webinars on home buying tips
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    Exclusive discounts for platform users
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    Featured blog posts and case studies
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    Social media cross-promotion
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    Open house event sponsorship
                  </li>
                </ul>
              </div>
            </div>

            {/* Success Metrics */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-4">Partnership Success Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">50+</p>
                  <p className="text-xs text-muted-foreground">Target Partners</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">IDR 25M</p>
                  <p className="text-xs text-muted-foreground">Marketing Budget</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">10,000+</p>
                  <p className="text-xs text-muted-foreground">Monthly Leads</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">15%</p>
                  <p className="text-xs text-muted-foreground">Avg Conversion</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Apply Tab */}
          <TabsContent value="apply" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Business Name *</Label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  placeholder="Your company name"
                />
              </div>
              <div>
                <Label>Business Type *</Label>
                <Select 
                  value={formData.business_type}
                  onValueChange={(v) => setFormData({...formData, business_type: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contact Name *</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label>Contact Email *</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  placeholder="+62..."
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-2">
                <Label>Service Areas</Label>
                <Input
                  value={formData.service_areas}
                  onChange={(e) => setFormData({...formData, service_areas: e.target.value})}
                  placeholder="Jakarta, Bali, Surabaya (comma separated)"
                />
              </div>
            </div>

            <Button onClick={handleApply} size="lg" className="w-full">
              <Handshake className="w-4 h-4 mr-2" />
              Submit Partnership Application
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LocalPartnershipCard;

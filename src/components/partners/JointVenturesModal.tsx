import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { Handshake, Building, MapPin, DollarSign, Calendar, Users, Target, Briefcase, Send } from "lucide-react";

interface JointVenturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JointVenturesModal = ({ isOpen, onClose }: JointVenturesModalProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [proposalData, setProposalData] = useState({
    projectName: "", projectType: "", location: "", investment: "",
    timeline: "", description: "", contactName: "", contactEmail: "", contactPhone: ""
  });

  const opportunities = [
    { id: 1, title: "Luxury Resort Development - Bali", type: "Resort Development", location: "Bali, Indonesia", investment: "$5M - $10M", timeline: "24 months", description: "Premium beachfront resort development opportunity with established tourism infrastructure.", status: "Active", partnersNeeded: 2, leadPartner: "Bali Development Corp" },
    { id: 2, title: "Commercial Complex - Jakarta", type: "Commercial Development", location: "Jakarta, Indonesia", investment: "$15M - $25M", timeline: "36 months", description: "Mixed-use commercial complex in prime Jakarta business district.", status: "Planning", partnersNeeded: 3, leadPartner: "Jakarta Properties Ltd" },
    { id: 3, title: "Residential Township - Surabaya", type: "Residential Development", location: "Surabaya, Indonesia", investment: "$8M - $12M", timeline: "30 months", description: "Sustainable residential township with modern amenities and green spaces.", status: "Active", partnersNeeded: 2, leadPartner: "Green Living Developments" },
  ];

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: t('jointVentures.proposalSubmitted'), description: t('jointVentures.proposalSubmittedDesc') });
      setProposalData({ projectName: "", projectType: "", location: "", investment: "", timeline: "", description: "", contactName: "", contactEmail: "", contactPhone: "" });
    } catch (error) {
      toast({ title: "Error", description: t('jointVentures.submitFailed'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-chart-1/20 text-chart-1";
      case "Planning": return "bg-chart-3/20 text-chart-3";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Handshake className="h-5 w-5" />
            <span>{t('jointVentures.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="opportunities">{t('jointVentures.availableOpportunities')}</TabsTrigger>
            <TabsTrigger value="propose">{t('jointVentures.submitProposal')}</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {opportunities.map((opp) => (
                <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{opp.title}</CardTitle>
                        <CardDescription>{opp.type}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(opp.status)}>{opp.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{opp.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{opp.location}</span></div>
                      <div className="flex items-center space-x-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>{opp.investment}</span></div>
                      <div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{opp.timeline}</span></div>
                      <div className="flex items-center space-x-2"><Users className="h-4 w-4 text-muted-foreground" /><span>{opp.partnersNeeded} {t('partnerNetwork.partnersNeeded')}</span></div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t('partnerNetwork.leadPartner')}: </span>
                          <span className="font-medium">{opp.leadPartner}</span>
                        </div>
                        <Button size="sm"><Target className="h-4 w-4 mr-2" />{t('jointVentures.expressInterest')}</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="propose" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>{t('jointVentures.submitYourProposal')}</span>
                </CardTitle>
                <CardDescription>{t('jointVentures.proposalDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('jointVentures.projectName')} *</Label>
                      <Input placeholder={t('jointVentures.projectNamePlaceholder')} value={proposalData.projectName} onChange={(e) => setProposalData({ ...proposalData, projectName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('jointVentures.projectType')} *</Label>
                      <Select value={proposalData.projectType} onValueChange={(value) => setProposalData({ ...proposalData, projectType: value })}>
                        <SelectTrigger><SelectValue placeholder={t('jointVentures.selectProjectType')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">{t('jointVentures.residentialDev')}</SelectItem>
                          <SelectItem value="commercial">{t('jointVentures.commercialDev')}</SelectItem>
                          <SelectItem value="mixed-use">{t('jointVentures.mixedUseDev')}</SelectItem>
                          <SelectItem value="hospitality">{t('jointVentures.hospitalityResort')}</SelectItem>
                          <SelectItem value="industrial">{t('jointVentures.industrialDev')}</SelectItem>
                          <SelectItem value="retail">{t('jointVentures.retailDev')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('jointVentures.location')} *</Label>
                      <Input placeholder={t('jointVentures.locationPlaceholder')} value={proposalData.location} onChange={(e) => setProposalData({ ...proposalData, location: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('jointVentures.investmentRange')} *</Label>
                      <Select value={proposalData.investment} onValueChange={(value) => setProposalData({ ...proposalData, investment: value })}>
                        <SelectTrigger><SelectValue placeholder={t('jointVentures.selectInvestmentRange')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-1m">Under $1M</SelectItem>
                          <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                          <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                          <SelectItem value="10m-25m">$10M - $25M</SelectItem>
                          <SelectItem value="25m-50m">$25M - $50M</SelectItem>
                          <SelectItem value="over-50m">Over $50M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('jointVentures.timeline')} *</Label>
                      <Select value={proposalData.timeline} onValueChange={(value) => setProposalData({ ...proposalData, timeline: value })}>
                        <SelectTrigger><SelectValue placeholder={t('jointVentures.selectTimeline')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6-12">{t('jointVentures.months6_12')}</SelectItem>
                          <SelectItem value="12-24">{t('jointVentures.months12_24')}</SelectItem>
                          <SelectItem value="24-36">{t('jointVentures.months24_36')}</SelectItem>
                          <SelectItem value="36-48">{t('jointVentures.months36_48')}</SelectItem>
                          <SelectItem value="over-48">{t('jointVentures.monthsOver48')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('jointVentures.contactName')} *</Label>
                      <Input placeholder={t('jointVentures.contactNamePlaceholder')} value={proposalData.contactName} onChange={(e) => setProposalData({ ...proposalData, contactName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('jointVentures.email')} *</Label>
                      <Input type="email" placeholder={t('jointVentures.emailPlaceholder')} value={proposalData.contactEmail} onChange={(e) => setProposalData({ ...proposalData, contactEmail: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('jointVentures.phone')} *</Label>
                      <Input placeholder={t('jointVentures.phonePlaceholder')} value={proposalData.contactPhone} onChange={(e) => setProposalData({ ...proposalData, contactPhone: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('jointVentures.projectDescription')} *</Label>
                    <Textarea placeholder={t('jointVentures.projectDescriptionPlaceholder')} value={proposalData.description} onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })} className="min-h-[120px]" required />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">{t('jointVentures.cancel')}</Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? t('jointVentures.submitting') : t('jointVentures.submitProposalBtn')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default JointVenturesModal;

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
import { 
  Handshake, 
  Building, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Calendar,
  Users,
  Target,
  Briefcase,
  Send
} from "lucide-react";

interface JointVenturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JointVenturesModal = ({ isOpen, onClose }: JointVenturesModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [proposalData, setProposalData] = useState({
    projectName: "",
    projectType: "",
    location: "",
    investment: "",
    timeline: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });

  // Mock joint venture opportunities
  const opportunities = [
    {
      id: 1,
      title: "Luxury Resort Development - Bali",
      type: "Resort Development",
      location: "Bali, Indonesia",
      investment: "$5M - $10M",
      timeline: "24 months",
      description: "Premium beachfront resort development opportunity with established tourism infrastructure.",
      status: "Active",
      partnersNeeded: 2,
      leadPartner: "Bali Development Corp"
    },
    {
      id: 2,
      title: "Commercial Complex - Jakarta",
      type: "Commercial Development",
      location: "Jakarta, Indonesia",
      investment: "$15M - $25M",
      timeline: "36 months",
      description: "Mixed-use commercial complex in prime Jakarta business district.",
      status: "Planning",
      partnersNeeded: 3,
      leadPartner: "Jakarta Properties Ltd"
    },
    {
      id: 3,
      title: "Residential Township - Surabaya",
      type: "Residential Development",
      location: "Surabaya, Indonesia",
      investment: "$8M - $12M",
      timeline: "30 months",
      description: "Sustainable residential township with modern amenities and green spaces.",
      status: "Active",
      partnersNeeded: 2,
      leadPartner: "Green Living Developments"
    }
  ];

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Proposal Submitted!",
        description: "Your joint venture proposal has been submitted. We'll review it and get back to you within 5 business days.",
      });
      
      // Reset form
      setProposalData({
        projectName: "",
        projectType: "",
        location: "",
        investment: "",
        timeline: "",
        description: "",
        contactName: "",
        contactEmail: "",
        contactPhone: ""
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Planning":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Handshake className="h-5 w-5" />
            <span>Joint Venture Opportunities</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="opportunities">Available Opportunities</TabsTrigger>
            <TabsTrigger value="propose">Submit Proposal</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                        <CardDescription>{opportunity.type}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(opportunity.status)}>
                        {opportunity.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{opportunity.investment}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{opportunity.timeline}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{opportunity.partnersNeeded} partners needed</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Lead Partner: </span>
                          <span className="font-medium">{opportunity.leadPartner}</span>
                        </div>
                        <Button size="sm">
                          <Target className="h-4 w-4 mr-2" />
                          Express Interest
                        </Button>
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
                  <span>Submit Your Joint Venture Proposal</span>
                </CardTitle>
                <CardDescription>
                  Have a project idea? Submit your proposal and find the right partners.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name *</Label>
                      <Input
                        id="projectName"
                        placeholder="Enter project name"
                        value={proposalData.projectName}
                        onChange={(e) => setProposalData({ ...proposalData, projectName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectType">Project Type *</Label>
                      <Select 
                        value={proposalData.projectType} 
                        onValueChange={(value) => setProposalData({ ...proposalData, projectType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential Development</SelectItem>
                          <SelectItem value="commercial">Commercial Development</SelectItem>
                          <SelectItem value="mixed-use">Mixed-Use Development</SelectItem>
                          <SelectItem value="hospitality">Hospitality/Resort</SelectItem>
                          <SelectItem value="industrial">Industrial Development</SelectItem>
                          <SelectItem value="retail">Retail Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="Project location"
                        value={proposalData.location}
                        onChange={(e) => setProposalData({ ...proposalData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="investment">Investment Range *</Label>
                      <Select 
                        value={proposalData.investment} 
                        onValueChange={(value) => setProposalData({ ...proposalData, investment: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select investment range" />
                        </SelectTrigger>
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
                      <Label htmlFor="timeline">Timeline *</Label>
                      <Select 
                        value={proposalData.timeline} 
                        onValueChange={(value) => setProposalData({ ...proposalData, timeline: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6-12">6-12 months</SelectItem>
                          <SelectItem value="12-24">12-24 months</SelectItem>
                          <SelectItem value="24-36">24-36 months</SelectItem>
                          <SelectItem value="36-48">36-48 months</SelectItem>
                          <SelectItem value="over-48">Over 48 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        placeholder="Your full name"
                        value={proposalData.contactName}
                        onChange={(e) => setProposalData({ ...proposalData, contactName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={proposalData.contactEmail}
                        onChange={(e) => setProposalData({ ...proposalData, contactEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone *</Label>
                      <Input
                        id="contactPhone"
                        placeholder="+62 xxx xxxx xxxx"
                        value={proposalData.contactPhone}
                        onChange={(e) => setProposalData({ ...proposalData, contactPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed information about your project, including objectives, target market, expected returns, and partnership requirements..."
                      value={proposalData.description}
                      onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? "Submitting..." : "Submit Proposal"}
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
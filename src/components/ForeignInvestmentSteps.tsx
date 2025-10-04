import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, FileText, Home, Shield, ListChecks, AlertCircle, Clock, DollarSign, Building2 } from "lucide-react";

export const ForeignInvestmentSteps = () => {
  const steps = [
    {
      number: 1,
      title: "Research & Planning 🎯",
      description: "Start your journey with proper planning",
      icon: FileText,
      duration: "1-2 weeks",
      tasks: [
        "Consult with property lawyer",
        "Review investment goals",
        "Check eligibility requirements",
        "Understand local regulations"
      ]
    },
    {
      number: 2,
      title: "Document Preparation",
      description: "Gather and prepare all required documentation",
      icon: FileText,
      duration: "1-2 weeks",
      tasks: [
        "Valid passport (minimum 6 months validity)",
        "KITAS/KITAP residence permit application",
        "NPWP (tax identification) registration",
        "Proof of funds and source declaration",
        "Marriage certificate (if applicable)",
        "Employment/business documentation"
      ]
    },
    {
      number: 3,
      title: "Property Selection",
      description: "Find and inspect suitable properties",
      icon: Home,
      duration: "2-4 weeks",
      tasks: [
        "Property search based on budget and preferences",
        "Physical property inspection",
        "Legal title verification (Hak Pakai/SHMRS)",
        "Review property documents and certificates",
        "Conduct due diligence on seller",
        "Negotiate price and terms"
      ]
    },
    {
      number: 4,
      title: "Legal Review",
      description: "Engage legal professionals for verification",
      icon: Shield,
      duration: "1-2 weeks",
      tasks: [
        "Hire Indonesian property lawyer",
        "Title search and verification",
        "Review sale and purchase agreement",
        "Check for encumbrances or disputes",
        "Verify zoning and land use compliance",
        "Environmental and building permit checks"
      ]
    },
    {
      number: 5,
      title: "Financial Arrangements",
      description: "Secure funding and prepare payments",
      icon: DollarSign,
      duration: "2-4 weeks",
      tasks: [
        "Open Indonesian bank account (IDR account required)",
        "Secure financing (if applicable - rare for foreigners)",
        "Arrange fund transfer to Indonesia",
        "Currency exchange and transfer fees consideration",
        "Set up escrow account for deposit",
        "Prepare proof of payment documentation"
      ]
    },
    {
      number: 6,
      title: "Transaction Execution",
      description: "Complete the purchase transaction",
      icon: Building2,
      duration: "2-3 weeks",
      tasks: [
        "Sign preliminary sale agreement (PPJB)",
        "Pay deposit (typically 10-30%)",
        "Notary appointment for deed execution",
        "Sign final deed of sale (Akta Jual Beli)",
        "Complete payment transfer",
        "Receive original property certificates"
      ]
    },
    {
      number: 7,
      title: "Title Transfer & Registration",
      description: "Official registration of ownership",
      icon: FileText,
      duration: "1-3 months",
      tasks: [
        "Submit documents to Land Office (BPN)",
        "Pay BPHTB (land transfer tax - 5% of property value)",
        "Pay notary and registration fees",
        "Title deed processing and verification",
        "Receive new title certificate in your name",
        "Register with local authorities (RT/RW)"
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="text-center space-y-3">
          <div className="inline-block mx-auto p-3 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2 shadow-lg">
            <ListChecks className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl">Your Investment Journey 🗺️</CardTitle>
          <CardDescription className="text-lg">Follow these steps for a successful investment!</CardDescription>
          <Badge className="mx-auto bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2">
            ⏱️ Timeline: 2-4 Months
          </Badge>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isEven = index % 2 === 0;
          return (
            <Card key={step.number} className={`border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${isEven ? 'from-primary/5' : 'from-accent/5'} to-transparent`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isEven ? 'from-primary to-accent' : 'from-accent to-primary'} flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg flex-shrink-0`}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {step.title}
                      </CardTitle>
                      <Badge className={`${isEven ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'} border-0`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {step.duration}
                      </Badge>
                    </div>
                    <CardDescription className="mb-3">{step.description}</CardDescription>
                    <div className="grid md:grid-cols-2 gap-2">
                      {step.tasks.map((task, taskIdx) => (
                        <div key={taskIdx} className="flex items-center gap-2 p-2 rounded-lg bg-card/50 hover:bg-card transition-colors">
                          <CheckCircle2 className={`h-4 w-4 ${isEven ? 'text-primary' : 'text-accent'} flex-shrink-0`} />
                          <span className="text-sm">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

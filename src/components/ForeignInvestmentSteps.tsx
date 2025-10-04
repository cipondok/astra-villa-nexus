import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, Building2, Shield, DollarSign, Home } from "lucide-react";

export const ForeignInvestmentSteps = () => {
  const steps = [
    {
      number: 1,
      title: "Eligibility Assessment",
      description: "Verify your eligibility for foreign property investment",
      icon: CheckCircle2,
      duration: "1-2 days",
      tasks: [
        "Check nationality eligibility (green, yellow, or red list)",
        "Verify minimum investment requirements",
        "Assess financial capability",
        "Review residence permit requirements"
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Step-by-Step Investment Process</h2>
        <p className="text-muted-foreground">Complete guide from eligibility to ownership</p>
        <Badge variant="outline" className="mt-2">Estimated Total Timeline: 2-4 months</Badge>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Step number badge */}
                <div className="absolute left-0 top-0 z-10 hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {step.number}
                </div>

                <Card className={`md:ml-24 ${index % 2 === 0 ? 'md:mr-0' : 'md:mr-0'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 md:hidden">
                          <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                            {step.number}
                          </Badge>
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary hidden md:block" />
                          {step.title}
                        </CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                        <Clock className="h-4 w-4" />
                        <span className="whitespace-nowrap">{step.duration}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

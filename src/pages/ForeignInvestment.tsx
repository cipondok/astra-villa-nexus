import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, Shield, DollarSign, Home, Key, AlertCircle, CheckCircle2, XCircle, Globe, Briefcase, Headphones, MessageSquare, BookOpen, ListChecks } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ForeignInvestmentContactDialog } from "@/components/ForeignInvestmentContactDialog";
import { EligibilityChecker } from "@/components/EligibilityChecker";
import { ForeignInvestmentSteps } from "@/components/ForeignInvestmentSteps";
import { ForeignInvestmentFAQ } from "@/components/ForeignInvestmentFAQ";
import { ForeignInvestmentChat } from "@/components/ForeignInvestmentChat";

const ForeignInvestment = () => {
  const { language } = useLanguage();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Friendly Hero Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-block">
            <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
              <Globe className="h-4 w-4 inline mr-2" />
              Your Journey Starts Here
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Welcome to Indonesian Property Investment
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            We're here to guide you through every step of investing in Indonesian property. 
            Let's make your investment journey smooth and successful! 🏡
          </p>
        </div>

        {/* Friendly Notice */}
        <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg">
          <AlertCircle className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg font-semibold">We're Here to Help!</AlertTitle>
          <AlertDescription className="text-base">
            This guide provides general information to get you started. For personalized advice, 
            we recommend consulting with our qualified legal advisors who specialize in foreign property investment.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="w-full space-y-8">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 bg-card/50 backdrop-blur-sm p-2 rounded-2xl border border-border/50 shadow-lg h-auto">
            <TabsTrigger value="overview" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <Globe className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <ListChecks className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Steps</span>
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Eligibility</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Ask AI</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="ownership" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <Key className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Ownership</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <FileText className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="restrictions" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <Shield className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Rules</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
              <Headphones className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Contact</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl -z-10" />
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Building2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  Investment Opportunities
                </CardTitle>
                <CardDescription className="text-base">Discover what you can invest in and the exciting opportunities waiting for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-accent">
                        <CheckCircle2 className="h-6 w-6" />
                        ✅ You CAN Invest In
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-card/50 hover:bg-card transition-colors">
                          <Home className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Apartments & Condos</strong> - Modern living with Strata Title (SHMRS)</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-card/50 hover:bg-card transition-colors">
                          <Key className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Houses</strong> - With Hak Pakai (Right to Use) - 30 years, renewable</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-card/50 hover:bg-card transition-colors">
                          <Building2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Villas</strong> - Perfect for tourist destinations like Bali</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10 hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                        <XCircle className="h-6 w-6" />
                        ❌ Investment Restrictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                          <Shield className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Freehold Land</strong> - Hak Milik title not available directly</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Agricultural Land</strong> - Reserved for local farmers</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                          <FileText className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Government Property</strong> - State-owned land not for sale</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="pt-6 space-y-4">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    Investment Starting Points
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/5 to-transparent">
                      <CardHeader>
                        <Home className="h-8 w-8 text-primary mb-2" />
                        <CardTitle className="text-base">Houses</CardTitle>
                        <CardDescription className="text-xs">Hak Pakai Title</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">IDR 5B</p>
                        <p className="text-xs text-muted-foreground">Minimum investment required</p>
                        <Badge className="mt-2" variant="secondary">30 Years Renewable</Badge>
                      </CardContent>
                    </Card>
                    <Card className="border-accent/30 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-accent/5 to-transparent">
                      <CardHeader>
                        <Building2 className="h-8 w-8 text-accent mb-2" />
                        <CardTitle className="text-base">Apartments</CardTitle>
                        <CardDescription className="text-xs">Strata Title (SHMRS)</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">IDR 3B</p>
                        <p className="text-xs text-muted-foreground">Minimum investment required</p>
                        <Badge className="mt-2" variant="secondary">Most Popular</Badge>
                      </CardContent>
                    </Card>
                    <Card className="border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/5 to-accent/5">
                      <CardHeader>
                        <Globe className="h-8 w-8 text-primary mb-2" />
                        <CardTitle className="text-base">Tourist Areas</CardTitle>
                        <CardDescription className="text-xs">Special Zones</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-3xl font-bold text-primary">Varies</p>
                        <p className="text-xs text-muted-foreground">Check local regulations</p>
                        <Badge className="mt-2" variant="secondary">Regional Rules</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Steps Tab */}
          <TabsContent value="steps" className="space-y-6">
            <ForeignInvestmentSteps />
          </TabsContent>

          {/* Eligibility Checker Tab */}
          <TabsContent value="eligibility" className="space-y-6">
            <EligibilityChecker />
          </TabsContent>

          {/* AI Chat Assistant Tab */}
          <TabsContent value="chat" className="space-y-6">
            <ForeignInvestmentChat />
          </TabsContent>

          {/* FAQ & Knowledge Base Tab */}
          <TabsContent value="faq" className="space-y-6">
            <ForeignInvestmentFAQ />
          </TabsContent>

          {/* Ownership Types Tab */}
          <TabsContent value="ownership" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Hak Pakai (Right to Use)
                  </CardTitle>
                  <CardDescription>For foreign individuals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-semibold">Duration:</p>
                    <p className="text-sm text-muted-foreground">30 years, renewable for 20 years, then another 30 years</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">Requirements:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Valid passport</li>
                      <li>• KITAS/KITAP (residence permit)</li>
                      <li>• NPWP (tax identification number)</li>
                      <li>• Minimum property value requirement met</li>
                    </ul>
                  </div>
                  <Badge variant="secondary">Most Common for Foreigners</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    SHMRS/Strata Title
                  </CardTitle>
                  <CardDescription>For apartments and condominiums</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-semibold">Duration:</p>
                    <p className="text-sm text-muted-foreground">Perpetual (as long as building exists)</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">Requirements:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Valid passport</li>
                      <li>• KITAS/KITAP</li>
                      <li>• NPWP</li>
                      <li>• Minimum IDR 3 billion property value</li>
                    </ul>
                  </div>
                  <Badge variant="secondary">Apartments Only</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    PT PMA (Foreign Investment Company)
                  </CardTitle>
                  <CardDescription>Company ownership structure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-semibold">Duration:</p>
                    <p className="text-sm text-muted-foreground">Based on company structure (Hak Guna Bangunan - 30 years)</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">Requirements:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Establish PT PMA company</li>
                      <li>• Minimum capital requirements</li>
                      <li>• Business license (NIB)</li>
                      <li>• Property used for business purposes</li>
                    </ul>
                  </div>
                  <Badge variant="secondary">Commercial Use</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Nominee Structure (Not Recommended)
                  </CardTitle>
                  <CardDescription>Using Indonesian nominee</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription className="text-xs">
                      Nominee arrangements are legally questionable and carry significant risks. Not recommended by legal experts.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Risks Include:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• No legal protection</li>
                      <li>• Property can be seized</li>
                      <li>• Disputes with nominee</li>
                      <li>• Illegal under certain conditions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Required Documents for Foreign Buyers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Personal Documents</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Valid Passport</p>
                          <p className="text-muted-foreground text-xs">Original and certified copy</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">KITAS or KITAP</p>
                          <p className="text-muted-foreground text-xs">Valid Indonesian residence permit</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">NPWP</p>
                          <p className="text-muted-foreground text-xs">Indonesian tax identification number</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Proof of Address</p>
                          <p className="text-muted-foreground text-xs">In Indonesia (rental agreement, utility bills)</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Marriage Certificate</p>
                          <p className="text-muted-foreground text-xs">If applicable, translated to Indonesian</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Financial Documents</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Proof of Funds</p>
                          <p className="text-muted-foreground text-xs">Bank statements showing sufficient funds</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Source of Funds Declaration</p>
                          <p className="text-muted-foreground text-xs">Letter explaining origin of funds</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Employment Letter</p>
                          <p className="text-muted-foreground text-xs">Or business registration documents</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Tax Returns</p>
                          <p className="text-muted-foreground text-xs">Recent tax filing documents</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-4">KPR (Mortgage) for Foreigners</h3>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Limited Availability</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">Most Indonesian banks do not offer mortgages (KPR) to foreigners. Cash payment is typically required.</p>
                      <p className="text-sm">Some international banks may offer financing options with:</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Down payment: 40-50% minimum</li>
                        <li>• Maximum loan period: 10-15 years</li>
                        <li>• Higher interest rates than locals</li>
                        <li>• Extensive documentation requirements</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restrictions Tab */}
          <TabsContent value="restrictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Restrictions and Limitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Geographic Restrictions
                  </h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p className="text-sm"><strong>Prohibited Areas:</strong></p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Within 50km of national borders</li>
                      <li>• Military installations and strategic areas</li>
                      <li>• Cultural heritage sites without special permits</li>
                      <li>• Agricultural land zones</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    Price Thresholds by Region (2024)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-semibold text-sm">Jakarta & Surrounding Areas</p>
                      <p className="text-2xl font-bold text-primary">IDR 10 Billion+</p>
                      <p className="text-xs text-muted-foreground">For houses with Hak Pakai</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-semibold text-sm">Bali (Tourist Areas)</p>
                      <p className="text-2xl font-bold text-primary">IDR 5 Billion+</p>
                      <p className="text-xs text-muted-foreground">For houses with Hak Pakai</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-semibold text-sm">Other Major Cities</p>
                      <p className="text-2xl font-bold text-primary">IDR 5-7 Billion</p>
                      <p className="text-xs text-muted-foreground">Varies by city regulations</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-semibold text-sm">Apartments (All Areas)</p>
                      <p className="text-2xl font-bold text-primary">IDR 3 Billion+</p>
                      <p className="text-xs text-muted-foreground">Minimum value requirement</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Ownership Limitations
                  </h3>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div>
                      <p className="font-medium text-sm">Hak Pakai Duration:</p>
                      <p className="text-sm text-muted-foreground">Initial 30 years → renewable 20 years → renewable 30 years (max 80 years total)</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Transfer Restrictions:</p>
                      <p className="text-sm text-muted-foreground">Can only transfer to other foreigners or upgrade to PT PMA structure</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Usage Requirements:</p>
                      <p className="text-sm text-muted-foreground">Must be used and maintained; cannot remain vacant long-term</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Annual Reporting:</p>
                      <p className="text-sm text-muted-foreground">Required to report property ownership to immigration authorities</p>
                    </div>
                  </div>
                </div>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important: Regulatory Changes</AlertTitle>
                  <AlertDescription>
                    Indonesian property laws are subject to change. The government periodically reviews and updates minimum investment thresholds, permitted areas, and ownership structures. Always verify current regulations with a qualified legal advisor before proceeding.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step-by-Step Purchase Process</CardTitle>
                <CardDescription>Timeline and procedures for foreign property acquisition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Initial Research & Consultation",
                      duration: "1-2 weeks",
                      tasks: [
                        "Engage qualified property lawyer and tax advisor",
                        "Verify property ownership type (Hak Pakai, SHMRS, etc.)",
                        "Check zoning and foreign ownership eligibility",
                        "Review regional minimum investment requirements"
                      ]
                    },
                    {
                      step: 2,
                      title: "Document Preparation",
                      duration: "2-4 weeks",
                      tasks: [
                        "Obtain NPWP (tax ID) if not already held",
                        "Gather all required personal documents",
                        "Prepare proof of funds and source of funds declaration",
                        "Get documents translated and notarized"
                      ]
                    },
                    {
                      step: 3,
                      title: "Property Due Diligence",
                      duration: "2-3 weeks",
                      tasks: [
                        "Verify land certificate authenticity at BPN (Land Office)",
                        "Check for encumbrances, liens, or legal disputes",
                        "Conduct building inspection and valuation",
                        "Review IMB (building permit) and compliance"
                      ]
                    },
                    {
                      step: 4,
                      title: "Purchase Agreement",
                      duration: "1-2 weeks",
                      tasks: [
                        "Negotiate terms with seller",
                        "Sign preliminary purchase agreement (PPJB)",
                        "Pay deposit (typically 10-30%)",
                        "Set timeline for final sale completion"
                      ]
                    },
                    {
                      step: 5,
                      title: "Title Transfer Process",
                      duration: "4-8 weeks",
                      tasks: [
                        "Prepare Akta Jual Beli (Sale and Purchase Deed) with PPAT notary",
                        "Pay BPHTB (land and building transfer tax) - 5% of transaction value",
                        "Submit documents to BPN for title conversion",
                        "Complete final payment to seller"
                      ]
                    },
                    {
                      step: 6,
                      title: "Post-Purchase Registration",
                      duration: "2-4 weeks",
                      tasks: [
                        "Register new title certificate with BPN",
                        "Update PBB (annual property tax) records",
                        "Report to immigration if required",
                        "Arrange property insurance and utilities"
                      ]
                    }
                  ].map((phase) => (
                    <div key={phase.step} className="relative pl-8 pb-6 border-l-2 border-primary/20 last:border-transparent">
                      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {phase.step}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <h3 className="font-semibold">{phase.title}</h3>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {phase.tasks.map((task, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t space-y-4">
                  <h3 className="font-semibold">Associated Costs</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-medium text-sm">Transfer Taxes & Fees</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• BPHTB (Transfer Tax): 5% of property value</li>
                        <li>• Notary fees: 0.5-1% of property value</li>
                        <li>• Title transfer fees: ~0.1% of property value</li>
                        <li>• Stamp duty: IDR 10,000 per document</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-medium text-sm">Annual Ongoing Costs</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• PBB (Property Tax): 0.1-0.3% annually</li>
                        <li>• Management fees (apartments): varies</li>
                        <li>• Insurance: 0.1-0.3% annually</li>
                        <li>• Maintenance and utilities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Professional Assistance Recommended</AlertTitle>
              <AlertDescription>
                Due to the complexity of Indonesian property law and potential language barriers, it is strongly recommended to engage:
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Licensed property lawyer specializing in foreign ownership</li>
                  <li>• Registered PPAT notary for deed preparation</li>
                  <li>• Tax advisor familiar with cross-border taxation</li>
                  <li>• Real estate agent with foreign client experience</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Specialist Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language === "id" ? "Butuh Bantuan Khusus?" : "Need Specialized Assistance?"}
          </h2>
          <p className="text-muted-foreground">
            {language === "id" 
              ? "Tim spesialis investasi asing kami siap membantu Anda dengan bahasa Inggris yang lancar dan pemahaman mendalam tentang regulasi"
              : "Our foreign investment specialists are ready to assist you with fluent English and in-depth knowledge of regulations"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="font-semibold mb-2">
              {language === "id" ? "Konsultasi Bahasa Inggris" : "English Consultation"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "id" 
                ? "Komunikasi lancar dalam bahasa Inglris untuk investor asing"
                : "Fluent English communication for foreign investors"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="font-semibold mb-2">
              {language === "id" ? "Ahli Regulasi" : "Regulation Experts"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "id" 
                ? "Pemahaman mendalam tentang hukum dan regulasi Indonesia"
                : "In-depth knowledge of Indonesian laws and regulations"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="font-semibold mb-2">
              {language === "id" ? "Dukungan Penuh" : "Full Support"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "id" 
                ? "Pendampingan dari awal hingga selesai proses investasi"
                : "Support from start to finish of your investment process"}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => setContactDialogOpen(true)}
          >
            <Headphones className="h-5 w-5 mr-2" />
            {language === "id" ? "Hubungi Spesialis Kami" : "Contact Our Specialists"}
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            {language === "id" 
              ? "Layanan khusus investasi asing tersedia 24/7"
              : "Foreign investment service available 24/7"}
          </p>
        </div>
      </div>

      <ForeignInvestmentContactDialog 
        open={contactDialogOpen} 
        onOpenChange={setContactDialogOpen} 
      />
    </div>
  );
};

export default ForeignInvestment;

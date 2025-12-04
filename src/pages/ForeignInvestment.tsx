import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, Shield, DollarSign, Home, Key, AlertCircle, CheckCircle2, XCircle, Globe, Briefcase, Headphones, MessageSquare, BookOpen, ListChecks } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ForeignInvestmentContactDialog } from "@/components/ForeignInvestmentContactDialog";
import { EligibilityChecker } from "@/components/EligibilityChecker";
import { ForeignInvestmentSteps } from "@/components/ForeignInvestmentSteps";
import { ForeignInvestmentFAQ } from "@/components/ForeignInvestmentFAQ";
import { ForeignInvestmentChat } from "@/components/ForeignInvestmentChat";
import { UserInvestmentDashboard } from "@/components/foreign-investment/UserInvestmentDashboard";

const ForeignInvestment = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  // If user is logged in, show the dashboard
  if (user) {
    return <UserInvestmentDashboard />;
  }
  
  // If not logged in, show the public information page
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-amber-950/20">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Luxury Hero Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex justify-center items-center gap-4">
            <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-amber-500/10 text-amber-400 border-amber-500/30">
              <Globe className="h-4 w-4 inline mr-2" />
              Your Journey Starts Here
            </Badge>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-background shadow-lg shadow-amber-500/25"
            >
              Sign In to Get Started
            </Button>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent leading-tight">
            Welcome to Indonesian Property Investment
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            We're here to guide you through every step of investing in Indonesian property. 
            Let's make your investment journey smooth and successful! 🏡
          </p>
        </div>

        {/* Luxury Notice */}
        <Alert className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-amber-600/10 backdrop-blur-sm shadow-lg">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-lg font-semibold text-amber-400">We're Here to Help!</AlertTitle>
          <AlertDescription className="text-base text-muted-foreground">
            This guide provides general information to get you started. For personalized advice, 
            we recommend consulting with our qualified legal advisors who specialize in foreign property investment.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="w-full space-y-8">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 bg-background/60 backdrop-blur-xl p-2 rounded-2xl border border-amber-500/20 shadow-lg h-auto">
            <TabsTrigger value="overview" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <Globe className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <ListChecks className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Steps</span>
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Eligibility</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Ask AI</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="ownership" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <Key className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Ownership</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <FileText className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="restrictions" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <Shield className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Rules</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-col sm:flex-row gap-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-background data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-300">
              <Headphones className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium">Contact</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <Card className="border-amber-500/20 shadow-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-full blur-3xl -z-10" />
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                    <Building2 className="h-6 w-6 text-background" />
                  </div>
                  Investment Opportunities
                </CardTitle>
                <CardDescription className="text-base">Discover what you can invest in and the exciting opportunities waiting for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="h-6 w-6" />
                        ✅ You CAN Invest In
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <Home className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Apartments & Condos</strong> - Modern living with Strata Title (SHMRS)</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <Key className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Houses</strong> - With Hak Pakai (Right to Use) - 30 years, renewable</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <Building2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Villas</strong> - Perfect for tourist destinations like Bali</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-rose-600/10 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-rose-400">
                        <XCircle className="h-6 w-6" />
                        ❌ Investment Restrictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                          <Shield className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Freehold Land</strong> - Hak Milik title not available directly</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                          <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Agricultural Land</strong> - Reserved for local farmers</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                          <FileText className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm"><strong>Government Property</strong> - State-owned land not for sale</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="pt-6 space-y-4">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10">
                      <DollarSign className="h-5 w-5 text-amber-400" />
                    </div>
                    Investment Starting Points
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-amber-500/5 to-transparent">
                      <CardHeader>
                        <Home className="h-8 w-8 text-amber-400 mb-2" />
                        <CardTitle className="text-base">Houses</CardTitle>
                        <CardDescription className="text-xs">Hak Pakai Title</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">IDR 5B</p>
                        <p className="text-xs text-muted-foreground">Minimum investment required</p>
                        <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-amber-500/30">30 Years Renewable</Badge>
                      </CardContent>
                    </Card>
                    <Card className="border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-amber-500/5 to-transparent">
                      <CardHeader>
                        <Building2 className="h-8 w-8 text-amber-400 mb-2" />
                        <CardTitle className="text-base">Apartments</CardTitle>
                        <CardDescription className="text-xs">Strata Title (SHMRS)</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">IDR 3B</p>
                        <p className="text-xs text-muted-foreground">Minimum investment required</p>
                        <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-amber-500/30">Most Popular</Badge>
                      </CardContent>
                    </Card>
                    <Card className="border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-amber-500/5 to-transparent">
                      <CardHeader>
                        <Globe className="h-8 w-8 text-amber-400 mb-2" />
                        <CardTitle className="text-base">Tourist Areas</CardTitle>
                        <CardDescription className="text-xs">Special Zones</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-3xl font-bold text-amber-400">Varies</p>
                        <p className="text-xs text-muted-foreground">Check local regulations</p>
                        <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-amber-500/30">Regional Rules</Badge>
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
          <TabsContent value="ownership" className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-amber-500/30 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 bg-gradient-to-br from-amber-500/5 to-transparent backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl" />
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                      <Key className="h-6 w-6 text-background" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Hak Pakai 🏡</CardTitle>
                      <CardDescription className="text-sm">Perfect for foreign individuals</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="font-semibold text-sm mb-2">⏱️ Duration:</p>
                    <p className="text-sm text-muted-foreground">30 years → 20 years → 30 years (up to 80 years total!)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="font-semibold text-sm mb-2">📋 What You'll Need:</p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Valid passport</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> KITAS/KITAP permit</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> NPWP tax ID</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Meet minimum value</li>
                    </ul>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-background">⭐ Most Popular Choice</Badge>
                </CardContent>
              </Card>

              <Card className="border-amber-500/30 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 bg-gradient-to-br from-amber-500/5 to-transparent backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl" />
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                      <Building2 className="h-6 w-6 text-background" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">SHMRS/Strata 🏢</CardTitle>
                      <CardDescription className="text-sm">For apartments & condos</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="font-semibold text-sm mb-2">⏱️ Duration:</p>
                    <p className="text-sm text-muted-foreground">Perpetual ownership (as long as building stands)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="font-semibold text-sm mb-2">📋 Requirements:</p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Valid passport</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> KITAS/KITAP</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> NPWP</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Min. IDR 3 billion</li>
                    </ul>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-background">🏙️ Urban Living</Badge>
                </CardContent>
              </Card>

              <Card className="border-amber-500/30 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 bg-gradient-to-br from-amber-500/5 to-transparent backdrop-blur-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                      <Briefcase className="h-6 w-6 text-background" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">PT PMA 🏢</CardTitle>
                      <CardDescription className="text-sm">Company ownership</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="font-semibold text-sm mb-2">⏱️ Duration:</p>
                    <p className="text-sm text-muted-foreground">Hak Guna Bangunan - 30 years renewable</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="font-semibold text-sm mb-2">📋 What's Needed:</p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-amber-400" /> PT PMA company</li>
                      <li className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-amber-400" /> Capital requirements</li>
                      <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-amber-400" /> Business license</li>
                      <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-amber-400" /> Commercial use</li>
                    </ul>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-background">💼 Business Investors</Badge>
                </CardContent>
              </Card>

              <Card className="border-rose-500/40 shadow-xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 backdrop-blur-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20">
                      <Shield className="h-6 w-6 text-rose-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-rose-400">Nominee ⚠️</CardTitle>
                      <CardDescription className="text-sm">Not recommended!</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive" className="border-rose-500/50 bg-rose-500/10">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-bold">⛔ High Risk Warning</AlertTitle>
                    <AlertDescription className="text-sm">
                      Legally questionable with serious risks. Our experts strongly advise against this approach.
                    </AlertDescription>
                  </Alert>
                  <div className="p-3 rounded-lg bg-rose-500/10">
                    <p className="font-semibold text-sm mb-2 text-rose-400">⚠️ Major Risks:</p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-400" /> No legal protection</li>
                      <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-400" /> Property seizure risk</li>
                      <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-400" /> Nominee disputes</li>
                      <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-400" /> Illegal complications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6 animate-fade-in">
            <Card className="border-amber-500/20 shadow-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-full blur-3xl -z-10" />
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                    <FileText className="h-6 w-6 text-background" />
                  </div>
                  <CardTitle className="text-2xl">Documents Checklist 📋</CardTitle>
                </div>
                <CardDescription className="text-base">Everything you need to prepare for a smooth investment process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="h-5 w-5 text-amber-400" />
                        👤 Personal Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Valid Passport 🛂</p>
                            <p className="text-muted-foreground text-sm">Original and certified copy</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">KITAS or KITAP 🏠</p>
                            <p className="text-muted-foreground text-sm">Valid Indonesian residence permit</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">NPWP 📊</p>
                            <p className="text-muted-foreground text-sm">Indonesian tax identification number</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Proof of Address 📍</p>
                            <p className="text-muted-foreground text-sm">Rental agreement or utility bills</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Marriage Certificate 💑</p>
                            <p className="text-muted-foreground text-sm">If applicable, translated</p>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-amber-400" />
                        💰 Financial Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Proof of Funds 💵</p>
                            <p className="text-muted-foreground text-sm">Bank statements (3-6 months)</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Source of Funds 📝</p>
                            <p className="text-muted-foreground text-sm">Declaration letter required</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Employment Letter 💼</p>
                            <p className="text-muted-foreground text-sm">Or business registration</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Tax Returns 📑</p>
                            <p className="text-muted-foreground text-sm">Recent tax filings</p>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-600/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-amber-400" />
                      🏦 Mortgage Options (KPR)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert className="border-amber-500/30 bg-amber-500/5">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                      <AlertTitle className="text-base font-bold text-amber-400">💡 Important to Know</AlertTitle>
                      <AlertDescription className="space-y-3 mt-2">
                        <p className="text-sm">Most Indonesian banks don't offer mortgages to foreigners. Cash payment is usually needed.</p>
                        <div className="p-3 rounded-lg bg-background/50">
                          <p className="text-sm font-semibold mb-2">Some international banks may offer:</p>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">40-50%</Badge>
                              <span>Minimum down payment</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">10-15y</Badge>
                              <span>Maximum loan period</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">Higher</Badge>
                              <span>Interest rates</span>
                            </li>
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restrictions Tab */}
          <TabsContent value="restrictions" className="space-y-6 animate-fade-in">
            <Card className="border-amber-500/20 shadow-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/10 to-amber-500/10 rounded-full blur-3xl -z-10" />
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20">
                    <Shield className="h-6 w-6 text-rose-400" />
                  </div>
                  <CardTitle className="text-2xl">📜 Investment Rules & Restrictions</CardTitle>
                </div>
                <CardDescription className="text-base">Understanding the boundaries helps you invest with confidence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Geographic Restrictions
                  </h3>
                  <div className="bg-background/50 p-4 rounded-lg space-y-2 border border-amber-500/20">
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
                    <DollarSign className="h-5 w-5 text-amber-500" />
                    Price Thresholds by Region (2024)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-background/50 p-4 rounded-lg space-y-2 border border-amber-500/20">
                      <p className="font-semibold text-sm">Jakarta & Surrounding Areas</p>
                      <p className="text-2xl font-bold text-amber-400">IDR 10 Billion+</p>
                      <p className="text-xs text-muted-foreground">For houses with Hak Pakai</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg space-y-2 border border-amber-500/20">
                      <p className="font-semibold text-sm">Bali (Tourist Areas)</p>
                      <p className="text-2xl font-bold text-amber-400">IDR 5 Billion+</p>
                      <p className="text-xs text-muted-foreground">For houses with Hak Pakai</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg space-y-2 border border-amber-500/20">
                      <p className="font-semibold text-sm">Other Major Cities</p>
                      <p className="text-2xl font-bold text-amber-400">IDR 5-7 Billion</p>
                      <p className="text-xs text-muted-foreground">Varies by city regulations</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg space-y-2 border border-amber-500/20">
                      <p className="font-semibold text-sm">Apartments (All Areas)</p>
                      <p className="text-2xl font-bold text-amber-400">IDR 3 Billion+</p>
                      <p className="text-xs text-muted-foreground">Minimum value requirement</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-500" />
                    Ownership Limitations
                  </h3>
                  <div className="bg-background/50 p-4 rounded-lg space-y-3 border border-amber-500/20">
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

                <Alert variant="destructive" className="border-rose-500/40 bg-rose-500/10">
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
            <Card className="border-amber-500/20 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl">
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
                    <div key={phase.step} className="relative pl-8 pb-6 border-l-2 border-amber-500/30 last:border-transparent">
                      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-background flex items-center justify-center text-xs font-bold">
                        {phase.step}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <h3 className="font-semibold">{phase.title}</h3>
                          <Badge variant="outline" className="border-amber-500/30 text-amber-400">{phase.duration}</Badge>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {phase.tasks.map((task, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-amber-500/20 space-y-4">
                  <h3 className="font-semibold">Associated Costs</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-background/50 p-4 rounded-lg space-y-2 border border-amber-500/20">
                      <p className="font-medium text-sm">Transfer Taxes & Fees</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• BPHTB (Transfer Tax): 5% of property value</li>
                        <li>• Notary fees: 0.5-1% of property value</li>
                        <li>• Title transfer fees: ~0.1% of property value</li>
                        <li>• Stamp duty: IDR 10,000 per document</li>
                      </ul>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg space-y-2 border border-amber-500/20">
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

            <Alert className="border-amber-500/30 bg-amber-500/5">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertTitle className="text-amber-400">Professional Assistance Recommended</AlertTitle>
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

      {/* Luxury Contact Specialist Section */}
      <div className="bg-gradient-to-br from-amber-950/40 via-background to-amber-900/20 rounded-2xl p-8 border border-amber-500/30 backdrop-blur-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            {language === "id" ? "Butuh Bantuan Khusus?" : "Need Specialized Assistance?"}
          </h2>
          <p className="text-muted-foreground">
            {language === "id" 
              ? "Tim spesialis investasi asing kami siap membantu Anda dengan bahasa Inggris yang lancar dan pemahaman mendalam tentang regulasi"
              : "Our foreign investment specialists are ready to assist you with fluent English and in-depth knowledge of regulations"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-background/60 backdrop-blur-xl rounded-xl p-6 text-center border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
            <Globe className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <h3 className="font-semibold mb-2">
              {language === "id" ? "Konsultasi Bahasa Inggris" : "English Consultation"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "id" 
                ? "Komunikasi lancar dalam bahasa Inglris untuk investor asing"
                : "Fluent English communication for foreign investors"}
            </p>
          </div>

          <div className="bg-background/60 backdrop-blur-xl rounded-xl p-6 text-center border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
            <FileText className="h-12 w-12 mx-auto mb-4 text-amber-400" />
            <h3 className="font-semibold mb-2">
              {language === "id" ? "Ahli Regulasi" : "Regulation Experts"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "id" 
                ? "Pemahaman mendalam tentang hukum dan regulasi Indonesia"
                : "In-depth knowledge of Indonesian laws and regulations"}
            </p>
          </div>

          <div className="bg-background/60 backdrop-blur-xl rounded-xl p-6 text-center border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-amber-400" />
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
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-background shadow-lg shadow-amber-500/25"
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

import React, { useState } from "react";
import { useNeighborhoodInsights, NeighborhoodInsightsResult } from "@/hooks/useNeighborhoodInsights";
import { getEdgeFunctionUserMessage } from "@/lib/supabaseFunctionErrors";
import { isAiTemporarilyDisabled, markAiTemporarilyDisabledFromError } from "@/lib/aiAvailability";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import {
  MapPin, GraduationCap, Shield, Bus, ShoppingBag, TrendingUp,
  TreePine, Send, Loader2, MessageCircle, Star, Droplets, Volume2,
  Wind, Building, School, Heart, Utensils,
} from "lucide-react";

const SUGGESTED_LOCATIONS = ["Menteng, Jakarta", "Kebayoran Baru", "BSD City", "Alam Sutera", "Kemang", "Pondok Indah", "Kelapa Gading", "Canggu, Bali"];
const SUGGESTED_QUESTIONS = [
  "What are the best international schools nearby?",
  "How is the traffic and commute to CBD?",
  "Is this area prone to flooding?",
  "What's the investment potential here?",
  "What amenities are within walking distance?",
];

function ScoreBar({ label, score, icon: Icon, maxScore = 10 }: { label: string; score: number; icon: React.ElementType; maxScore?: number }) {
  const pct = (score / maxScore) * 100;
  const color = pct >= 70 ? "text-green-500" : pct >= 50 ? "text-yellow-500" : "text-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-foreground"><Icon className="h-4 w-4" />{label}</span>
        <span className={`font-bold ${color}`}>{score}/{maxScore}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

function InsightCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5 text-primary" />{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">{children}</CardContent>
    </Card>
  );
}

export default function NeighborhoodInsightsPage() {
  const [location, setLocation] = useState("");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [result, setResult] = useState<NeighborhoodInsightsResult | null>(null);

  const insights = useNeighborhoodInsights();
  const { toast } = useToast();

  const handleSubmit = async (customQuestion?: string) => {
    if (!location.trim()) {
      toast({ title: "Location required", description: "Please enter a neighborhood or area name.", variant: "destructive" });
      return;
    }
    if (isAiTemporarilyDisabled()) {
      toast({ title: "AI temporarily unavailable", description: "Please try again shortly.", variant: "destructive" });
      return;
    }

    const q = customQuestion || question;
    setChatHistory((prev) => [...prev, { role: "user", text: q || `Tell me about ${location}` }]);
    setQuestion("");

    try {
      const data = await insights.mutateAsync({ location, question: q || undefined });
      setResult(data);
      setChatHistory((prev) => [...prev, { role: "bot", text: data.chat_response }]);
    } catch (err) {
      markAiTemporarilyDisabledFromError(err);
      const msg = getEdgeFunctionUserMessage(err);
      toast({ title: msg.title, description: msg.description, variant: msg.variant });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" /> AI Neighborhood Insights
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Explore Any Neighborhood</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Ask questions about schools, safety, commute, amenities, and investment potential — powered by AI.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Chat Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Location input */}
            <Card className="border-border/50">
              <CardContent className="pt-4 space-y-3">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input placeholder="e.g. Menteng, Jakarta" value={location} onChange={(e) => setLocation(e.target.value)} />
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_LOCATIONS.map((loc) => (
                    <Badge key={loc} variant="outline" className="cursor-pointer hover:bg-accent text-xs" onClick={() => setLocation(loc)}>{loc}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat area */}
            <Card className="border-border/50 flex flex-col" style={{ minHeight: 400 }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><MessageCircle className="h-4 w-4" />Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-[300px]">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <p className="mb-3">Ask anything about a neighborhood:</p>
                      <div className="space-y-1.5">
                        {SUGGESTED_QUESTIONS.map((q) => (
                          <button key={q} className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-accent transition-colors" onClick={() => { setQuestion(q); handleSubmit(q); }}>{q}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        {msg.role === "bot" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                        ) : msg.text}
                      </div>
                    </div>
                  ))}
                  {insights.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing neighborhood...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Ask about this area..." value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} disabled={insights.isPending} />
                  <Button size="icon" onClick={() => handleSubmit()} disabled={insights.isPending || !location.trim()}>
                    {insights.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Insights Dashboard */}
          <div className="lg:col-span-3">
            {!result ? (
              <Card className="border-border/50 h-full flex items-center justify-center min-h-[500px]">
                <div className="text-center text-muted-foreground space-y-2 p-8">
                  <MapPin className="h-12 w-12 mx-auto opacity-30" />
                  <p className="text-lg font-medium">No insights yet</p>
                  <p className="text-sm">Enter a location and ask a question to get started.</p>
                </div>
              </Card>
            ) : (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="living">Living</TabsTrigger>
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="environment">Environment</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{location}</h3>
                          <p className="text-sm text-muted-foreground">{result.overview.demographic}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{result.overview.livability_score}</div>
                          <div className="text-xs text-muted-foreground">Livability</div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 mb-3">{result.overview.summary}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.overview.property_type_fit.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <ScoreBar label="Education" score={result.education.score} icon={GraduationCap} />
                    <ScoreBar label="Safety" score={result.safety.score} icon={Shield} />
                    <ScoreBar label="Transportation" score={result.transportation.score} icon={Bus} />
                    <ScoreBar label="Amenities" score={result.amenities.score} icon={ShoppingBag} />
                  </div>
                </TabsContent>

                {/* Living Tab */}
                <TabsContent value="living" className="space-y-4">
                  <InsightCard title="Education" icon={GraduationCap}>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {result.education.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                    {result.education.notable_schools && result.education.notable_schools.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {result.education.notable_schools.map((s, i) => (
                          <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2"><School className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{s.name}</span></div>
                            <Badge variant="outline" className="text-xs">{s.type}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </InsightCard>

                  <InsightCard title="Safety & Security" icon={Shield}>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {result.safety.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                    {result.safety.considerations && result.safety.considerations.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-500/10 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                        {result.safety.considerations.map((c, i) => <p key={i}>⚠️ {c}</p>)}
                      </div>
                    )}
                  </InsightCard>

                  <InsightCard title="Transportation" icon={Bus}>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {result.transportation.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                    {result.transportation.commute_options && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {result.transportation.commute_options.map((c, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-2">
                            <p className="font-medium text-xs text-foreground">{c.mode}</p>
                            <p className="text-xs text-muted-foreground">{c.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </InsightCard>

                  <InsightCard title="Amenities" icon={ShoppingBag}>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {result.amenities.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                    {result.amenities.categories && (
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {result.amenities.categories.shopping && (
                          <div><p className="flex items-center gap-1 font-medium text-xs mb-1"><ShoppingBag className="h-3 w-3" />Shopping</p>{result.amenities.categories.shopping.map((s, i) => <p key={i} className="text-xs text-muted-foreground">• {s}</p>)}</div>
                        )}
                        {result.amenities.categories.healthcare && (
                          <div><p className="flex items-center gap-1 font-medium text-xs mb-1"><Heart className="h-3 w-3" />Healthcare</p>{result.amenities.categories.healthcare.map((s, i) => <p key={i} className="text-xs text-muted-foreground">• {s}</p>)}</div>
                        )}
                        {result.amenities.categories.dining && (
                          <div><p className="flex items-center gap-1 font-medium text-xs mb-1"><Utensils className="h-3 w-3" />Dining</p>{result.amenities.categories.dining.map((s, i) => <p key={i} className="text-xs text-muted-foreground">• {s}</p>)}</div>
                        )}
                        {result.amenities.categories.recreation && (
                          <div><p className="flex items-center gap-1 font-medium text-xs mb-1"><TreePine className="h-3 w-3" />Recreation</p>{result.amenities.categories.recreation.map((s, i) => <p key={i} className="text-xs text-muted-foreground">• {s}</p>)}</div>
                        )}
                      </div>
                    )}
                  </InsightCard>
                </TabsContent>

                {/* Market Tab */}
                <TabsContent value="market" className="space-y-4">
                  <InsightCard title="Market Insights" icon={TrendingUp}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Avg Price Range</p>
                        <p className="font-bold text-foreground text-sm">{result.market_insights.avg_price_range}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Price Trend</p>
                        <Badge variant={result.market_insights.price_trend === "rising" ? "default" : result.market_insights.price_trend === "stable" ? "secondary" : "destructive"}>
                          {result.market_insights.price_trend}
                        </Badge>
                      </div>
                      {result.market_insights.rental_yield && (
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Rental Yield</p>
                          <p className="font-bold text-foreground text-sm">{result.market_insights.rental_yield}</p>
                        </div>
                      )}
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Investment Outlook</p>
                        <Badge variant={result.market_insights.investment_outlook === "excellent" || result.market_insights.investment_outlook === "good" ? "default" : "secondary"}>
                          {result.market_insights.investment_outlook}
                        </Badge>
                      </div>
                    </div>
                    {result.market_insights.key_developments && result.market_insights.key_developments.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-xs mb-2 flex items-center gap-1"><Building className="h-3 w-3" />Key Developments</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                          {result.market_insights.key_developments.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    )}
                  </InsightCard>
                </TabsContent>

                {/* Environment Tab */}
                <TabsContent value="environment" className="space-y-4">
                  <InsightCard title="Environment" icon={TreePine}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <Droplets className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-xs text-muted-foreground mb-1">Flood Risk</p>
                        <Badge variant={result.environment.flood_risk === "low" ? "secondary" : result.environment.flood_risk === "moderate" ? "outline" : "destructive"}>
                          {result.environment.flood_risk}
                        </Badge>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <Volume2 className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                        <p className="text-xs text-muted-foreground mb-1">Noise Level</p>
                        <Badge variant="secondary">{result.environment.noise_level}</Badge>
                      </div>
                      {result.environment.air_quality && (
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <Wind className="h-5 w-5 mx-auto mb-1 text-green-500" />
                          <p className="text-xs text-muted-foreground mb-1">Air Quality</p>
                          <Badge variant="secondary">{result.environment.air_quality}</Badge>
                        </div>
                      )}
                    </div>
                    {result.environment.green_spaces && result.environment.green_spaces.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-xs mb-2 flex items-center gap-1"><TreePine className="h-3 w-3" />Green Spaces</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.environment.green_spaces.map((g, i) => <Badge key={i} variant="outline" className="text-xs">{g}</Badge>)}
                        </div>
                      </div>
                    )}
                  </InsightCard>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

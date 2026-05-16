import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Search, Home, MapPin, Heart, AlertTriangle, TrendingUp,
  Loader2, Star, DollarSign, Clock, CheckCircle, XCircle, Sparkles
} from "lucide-react";
import { useTenantMatching, type TenantMatchInput, type PropertyMatch } from "@/hooks/useTenantMatching";
import { useToast } from "@/hooks/use-toast";
import { getEdgeFunctionUserMessage } from "@/lib/supabaseFunctionErrors";

// ─── Sample properties for demo ─────────────────────────────────────
const SAMPLE_PROPERTIES = [
  { id: "p1", title: "Modern Villa Seminyak", location: "Seminyak, Bali", property_type: "villa", monthly_rent: 35000000, bedrooms: 3, bathrooms: 2, amenities: ["pool", "garden", "parking", "furnished", "wifi"], land_area_sqm: 300, building_area_sqm: 200 },
  { id: "p2", title: "Cozy Apartment Sudirman", location: "Sudirman, Jakarta", property_type: "apartment", monthly_rent: 15000000, bedrooms: 2, bathrooms: 1, amenities: ["gym", "pool", "security", "parking", "furnished"], land_area_sqm: 0, building_area_sqm: 75 },
  { id: "p3", title: "Family House BSD City", location: "BSD City, Tangerang", property_type: "house", monthly_rent: 12000000, bedrooms: 4, bathrooms: 3, amenities: ["garden", "parking", "security", "playground"], land_area_sqm: 200, building_area_sqm: 180 },
  { id: "p4", title: "Luxury Penthouse Kuningan", location: "Kuningan, Jakarta", property_type: "apartment", monthly_rent: 45000000, bedrooms: 3, bathrooms: 2, amenities: ["pool", "gym", "concierge", "rooftop", "furnished", "wifi"], land_area_sqm: 0, building_area_sqm: 150 },
  { id: "p5", title: "Tropical Villa Canggu", location: "Canggu, Bali", property_type: "villa", monthly_rent: 28000000, bedrooms: 2, bathrooms: 2, amenities: ["pool", "garden", "furnished", "wifi", "pet-friendly"], land_area_sqm: 250, building_area_sqm: 120 },
  { id: "p6", title: "Townhouse Alam Sutera", location: "Alam Sutera, Tangerang", property_type: "house", monthly_rent: 18000000, bedrooms: 3, bathrooms: 2, amenities: ["parking", "garden", "security", "clubhouse"], land_area_sqm: 150, building_area_sqm: 140 },
];

const LOCATIONS = ["Seminyak, Bali", "Canggu, Bali", "Ubud, Bali", "Sudirman, Jakarta", "Kuningan, Jakarta", "BSD City, Tangerang", "Alam Sutera, Tangerang", "Menteng, Jakarta", "Kemang, Jakarta"];
const PROPERTY_TYPES = ["villa", "apartment", "house", "townhouse"];
const AMENITIES = ["pool", "garden", "gym", "parking", "security", "furnished", "wifi", "pet-friendly", "playground", "concierge"];
const LIFESTYLE = ["family-friendly", "young-professional", "digital-nomad", "retiree", "student", "expat", "nature-lover", "urban"];

function ScoreBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const color = score >= 80 ? "text-primary" : score >= 60 ? "text-chart-3" : "text-destructive";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">{icon}{label}</div>
        <span className={`text-xs font-semibold ${color}`}>{score}%</span>
      </div>
      <Progress value={score} className="h-1.5" />
    </div>
  );
}

function MatchCard({ match, rank }: { match: PropertyMatch; rank: number }) {
  const scoreColor = match.compatibility_score >= 80 ? "bg-primary text-primary-foreground" :
    match.compatibility_score >= 60 ? "bg-chart-3 text-primary-foreground" : "bg-destructive text-destructive-foreground";

  return (
    <Card className="border-border/40 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Rank + Score */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-medium">#{rank}</span>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scoreColor}`}>
              <span className="text-lg font-bold">{match.compatibility_score}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{match.property_title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rp {match.monthly_rent.toLocaleString()}/bulan • {match.commute_estimate}
            </p>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
              <ScoreBar label="Budget" score={match.budget_fit} icon={<DollarSign className="h-3 w-3" />} />
              <ScoreBar label="Location" score={match.location_fit} icon={<MapPin className="h-3 w-3" />} />
              <ScoreBar label="Features" score={match.feature_fit} icon={<Home className="h-3 w-3" />} />
              <ScoreBar label="Lifestyle" score={match.lifestyle_fit} icon={<Heart className="h-3 w-3" />} />
            </div>

            {/* Highlights & Concerns */}
            <div className="mt-3 space-y-1.5">
              {match.match_highlights.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  <span className="text-[11px] text-foreground">{h}</span>
                </div>
              ))}
              {match.concerns.slice(0, 2).map((c, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-chart-3 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-muted-foreground">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const AITenantMatchingPage = () => {
  const { toast } = useToast();
  const mutation = useTenantMatching();

  const [budgetMin, setBudgetMin] = useState(10000000);
  const [budgetMax, setBudgetMax] = useState(30000000);
  const [locations, setLocations] = useState<string[]>([]);
  const [propTypes, setPropTypes] = useState<string[]>([]);
  const [bedroomsMin, setBedroomsMin] = useState(2);
  const [bathroomsMin, setBathroomsMin] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [tenantName, setTenantName] = useState("");
  const [familySize, setFamilySize] = useState(2);
  const [pets, setPets] = useState("no");
  const [workLocation, setWorkLocation] = useState("");
  const [commutePref, setCommutePref] = useState("30 minutes max");

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const handleMatch = () => {
    const input: TenantMatchInput = {
      tenant_name: tenantName || undefined,
      budget_min: budgetMin,
      budget_max: budgetMax,
      preferred_locations: locations,
      property_type_preferences: propTypes,
      bedrooms_min: bedroomsMin,
      bathrooms_min: bathroomsMin,
      must_have_amenities: amenities,
      lifestyle_tags: lifestyle,
      pets,
      family_size: familySize,
      work_location: workLocation || undefined,
      commute_preference: commutePref,
      available_properties: SAMPLE_PROPERTIES,
    };
    mutation.mutate(input, {
      onError: (e) => {
        const msg = getEdgeFunctionUserMessage(e);
        toast({ title: msg.title, description: msg.description, variant: msg.variant });
      },
    });
  };

  const result = mutation.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Tenant Matching</h1>
              <p className="text-sm text-muted-foreground">Find the perfect property match based on tenant preferences and lifestyle</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─── Input Form (Left 2 cols) ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  Tenant Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tenant Name (optional)</Label>
                  <Input value={tenantName} onChange={e => setTenantName(e.target.value)} placeholder="Name..." className="text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Budget Min (Rp/mo)</Label>
                    <Input type="number" value={budgetMin} onChange={e => setBudgetMin(+e.target.value)} className="text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Budget Max (Rp/mo)</Label>
                    <Input type="number" value={budgetMax} onChange={e => setBudgetMax(+e.target.value)} className="text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Min Bedrooms</Label>
                    <Input type="number" value={bedroomsMin} onChange={e => setBedroomsMin(+e.target.value)} className="text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Min Bathrooms</Label>
                    <Input type="number" value={bathroomsMin} onChange={e => setBathroomsMin(+e.target.value)} className="text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Family Size</Label>
                    <Input type="number" value={familySize} onChange={e => setFamilySize(+e.target.value)} className="text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Pets</Label>
                    <Select value={pets} onValueChange={setPets}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no" className="text-xs">No pets</SelectItem>
                        <SelectItem value="dog" className="text-xs">Dog</SelectItem>
                        <SelectItem value="cat" className="text-xs">Cat</SelectItem>
                        <SelectItem value="both" className="text-xs">Dog & Cat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Work Location</Label>
                  <Input value={workLocation} onChange={e => setWorkLocation(e.target.value)} placeholder="e.g., SCBD Jakarta" className="text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Preferred Locations</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LOCATIONS.map(loc => (
                      <Badge
                        key={loc}
                        variant={locations.includes(loc) ? "default" : "outline"}
                        className="text-[10px] cursor-pointer"
                        onClick={() => toggleItem(locations, loc, setLocations)}
                      >{loc}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Property Types</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROPERTY_TYPES.map(t => (
                      <Badge
                        key={t}
                        variant={propTypes.includes(t) ? "default" : "outline"}
                        className="text-[10px] cursor-pointer capitalize"
                        onClick={() => toggleItem(propTypes, t, setPropTypes)}
                      >{t}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Must-have Amenities</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {AMENITIES.map(a => (
                      <Badge
                        key={a}
                        variant={amenities.includes(a) ? "default" : "outline"}
                        className="text-[10px] cursor-pointer capitalize"
                        onClick={() => toggleItem(amenities, a, setAmenities)}
                      >{a}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Lifestyle</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LIFESTYLE.map(l => (
                      <Badge
                        key={l}
                        variant={lifestyle.includes(l) ? "default" : "outline"}
                        className="text-[10px] cursor-pointer capitalize"
                        onClick={() => toggleItem(lifestyle, l, setLifestyle)}
                      >{l}</Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleMatch} disabled={mutation.isPending} className="w-full">
                  {mutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing matches...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" />Find Best Matches</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ─── Results (Right 3 cols) ────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">
            {!result && !mutation.isPending && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-sm font-medium text-foreground mb-1">Configure Tenant Preferences</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Set budget, location, amenities, and lifestyle preferences to find the best property matches using AI.
                  </p>
                </CardContent>
              </Card>
            )}

            {mutation.isPending && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Analyzing {SAMPLE_PROPERTIES.length} properties against tenant profile...</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card><CardContent className="p-3 text-center">
                    <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">{result.strong_matches}</div>
                    <div className="text-[10px] text-muted-foreground">Strong Matches (75+)</div>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <Star className="h-4 w-4 text-chart-3 mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">{result.average_compatibility.toFixed(0)}%</div>
                    <div className="text-[10px] text-muted-foreground">Avg Compatibility</div>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <Home className="h-4 w-4 text-chart-4 mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">{result.total_properties_analyzed}</div>
                    <div className="text-[10px] text-muted-foreground">Properties Analyzed</div>
                  </CardContent></Card>
                </div>

                {/* Tenant Summary */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Tenant Profile Summary
                    </h3>
                    <p className="text-xs text-muted-foreground">{result.tenant_summary}</p>
                    <div className="mt-2 pt-2 border-t border-border">
                      <h4 className="text-[11px] font-medium text-foreground mb-1">Market Advice</h4>
                      <p className="text-[11px] text-muted-foreground">{result.market_advice}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Match Cards */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Property Matches</h3>
                  {result.matches
                    .sort((a, b) => b.compatibility_score - a.compatibility_score)
                    .map((match, i) => (
                      <MatchCard key={match.property_id} match={match} rank={i + 1} />
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITenantMatchingPage;

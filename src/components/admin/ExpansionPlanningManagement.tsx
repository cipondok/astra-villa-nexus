import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  TrendingUp, 
  Target, 
  Calendar, 
  DollarSign, 
  Users, 
  Building2, 
  BarChart3,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Megaphone,
  Trophy,
  Globe
} from "lucide-react";

interface ExpansionPhase {
  id: string;
  phase_number: number;
  phase_name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  total_budget: number;
  spent_budget: number;
  target_market_share: number | null;
  kpis: any;
}

interface ExpansionCity {
  id: string;
  phase_id: string;
  city_name: string;
  province: string;
  population: number | null;
  property_market_size: number | null;
  status: string;
  launch_date: string | null;
  target_listings: number | null;
  current_listings: number;
  target_agents: number | null;
  current_agents: number;
  target_monthly_transactions: number | null;
  current_monthly_transactions: number;
  localization_status: any;
  competitors: any;
  marketing_budget: number;
  marketing_spent: number;
  notes: string | null;
}

interface Competitor {
  id: string;
  city_id: string;
  competitor_name: string;
  website_url: string | null;
  market_share: number | null;
  strengths: any;
  weaknesses: any;
  pricing_model: string | null;
  estimated_listings: number | null;
  threat_level: string | null;
  notes: string | null;
}

interface Milestone {
  id: string;
  phase_id: string | null;
  city_id: string | null;
  milestone_name: string;
  description: string | null;
  target_date: string | null;
  completed_date: string | null;
  status: string;
  assigned_to: string | null;
  priority: string;
}

const ExpansionPlanningManagement = () => {
  const { toast } = useToast();
  const [phases, setPhases] = useState<ExpansionPhase[]>([]);
  const [cities, setCities] = useState<ExpansionCity[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<ExpansionPhase | null>(null);
  const [selectedCity, setSelectedCity] = useState<ExpansionCity | null>(null);
  const [showCityDialog, setShowCityDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [phasesRes, citiesRes, competitorsRes, milestonesRes] = await Promise.all([
        supabase.from('expansion_phases').select('*').order('phase_number'),
        supabase.from('expansion_cities').select('*').order('city_name'),
        supabase.from('expansion_competitors').select('*'),
        supabase.from('expansion_milestones').select('*').order('target_date')
      ]);

      if (phasesRes.data) setPhases(phasesRes.data);
      if (citiesRes.data) setCities(citiesRes.data);
      if (competitorsRes.data) setCompetitors(competitorsRes.data);
      if (milestonesRes.data) setMilestones(milestonesRes.data);
    } catch (error) {
      console.error('Error fetching expansion data:', error);
      toast({ title: "Error", description: "Failed to load expansion data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-chart-1';
      case 'planning': return 'bg-chart-2';
      case 'completed': return 'bg-chart-5';
      case 'paused': return 'bg-chart-3';
      case 'launching': return 'bg-chart-3';
      case 'mature': return 'bg-chart-1';
      default: return 'bg-muted';
    }
  };

  const getThreatColor = (level: string | null) => {
    switch (level) {
      case 'critical': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-chart-3 bg-chart-3/10';
      case 'medium': return 'text-chart-4 bg-chart-4/10';
      case 'low': return 'text-chart-1 bg-chart-1/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-chart-3';
      case 'medium': return 'text-chart-4';
      case 'low': return 'text-chart-1';
      default: return 'text-muted-foreground';
    }
  };

  const calculatePhaseProgress = (phase: ExpansionPhase) => {
    const phaseCities = cities.filter(c => c.phase_id === phase.id);
    if (phaseCities.length === 0) return 0;
    
    const totalProgress = phaseCities.reduce((acc, city) => {
      const listingProgress = city.target_listings ? (city.current_listings / city.target_listings) * 100 : 0;
      const agentProgress = city.target_agents ? (city.current_agents / city.target_agents) * 100 : 0;
      return acc + (listingProgress + agentProgress) / 2;
    }, 0);
    
    return Math.min(totalProgress / phaseCities.length, 100);
  };

  const totalBudget = phases.reduce((acc, p) => acc + Number(p.total_budget), 0);
  const totalSpent = phases.reduce((acc, p) => acc + Number(p.spent_budget), 0);
  const totalCities = cities.length;
  const activeCities = cities.filter(c => c.status === 'active' || c.status === 'launching').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">City Expansion Planning</h2>
          <p className="text-muted-foreground">
            Manage your city-by-city expansion strategy across Indonesia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            Refresh Data
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Expansion City</DialogTitle>
                <DialogDescription>Add a new city to your expansion plan</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City Name</Label>
                    <Input placeholder="e.g., Surabaya" />
                  </div>
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Input placeholder="e.g., Jawa Timur" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phase</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map(phase => (
                          <SelectItem key={phase.id} value={phase.id}>
                            Phase {phase.phase_number}: {phase.phase_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Population</Label>
                    <Input type="number" placeholder="e.g., 2500000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Listings</Label>
                    <Input type="number" placeholder="e.g., 2000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Marketing Budget (IDR)</Label>
                    <Input type="number" placeholder="e.g., 150000000" />
                  </div>
                </div>
                <Button className="w-full">Add City</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} spent ({Math.round((totalSpent / totalBudget) * 100)}%)
            </p>
            <Progress value={(totalSpent / totalBudget) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCities}</div>
            <p className="text-xs text-muted-foreground">
              {activeCities} active, {totalCities - activeCities} planned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Phase</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {phases.find(p => p.status === 'active')?.phase_name || 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              Phase {phases.find(p => p.status === 'active')?.phase_number || 0} of {phases.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {milestones.filter(m => m.status === 'in_progress').length} in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="phases" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        {/* Phases Tab */}
        <TabsContent value="phases" className="space-y-4">
          <div className="grid gap-4">
            {phases.map(phase => {
              const phaseCities = cities.filter(c => c.phase_id === phase.id);
              const progress = calculatePhaseProgress(phase);
              
              return (
                <Card key={phase.id} className="overflow-hidden">
                  <div className={`h-1 ${getStatusColor(phase.status)}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">{phase.phase_number}</span>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{phase.phase_name}</CardTitle>
                          <CardDescription>{phase.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(phase.status)}>
                        {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Timeline</p>
                        <p className="font-medium">
                          {phase.start_date ? new Date(phase.start_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'TBD'} - {phase.end_date ? new Date(phase.end_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-medium">{formatCurrency(Number(phase.total_budget))}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Target Market Share</p>
                        <p className="font-medium">{phase.target_market_share || 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cities</p>
                        <p className="font-medium">{phaseCities.length} cities</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {phaseCities.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {phaseCities.map(city => (
                          <Badge key={city.id} variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {city.city_name}
                            <span className={`ml-1 w-2 h-2 rounded-full ${getStatusColor(city.status)}`} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {cities.map(city => {
              const listingProgress = city.target_listings ? (city.current_listings / city.target_listings) * 100 : 0;
              const agentProgress = city.target_agents ? (city.current_agents / city.target_agents) * 100 : 0;
              const phase = phases.find(p => p.id === city.phase_id);
              
              return (
                <Card key={city.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {city.city_name}
                        </CardTitle>
                        <CardDescription>{city.province}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Phase {phase?.phase_number}</Badge>
                        <Badge className={getStatusColor(city.status)}>
                          {city.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Population</p>
                        <p className="font-medium">{city.population ? formatNumber(city.population) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Market Size</p>
                        <p className="font-medium">{city.property_market_size ? formatCurrency(Number(city.property_market_size)) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Marketing Budget</p>
                        <p className="font-medium">{formatCurrency(Number(city.marketing_budget))}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Launch Date</p>
                        <p className="font-medium">
                          {city.launch_date ? new Date(city.launch_date).toLocaleDateString('id-ID') : 'Planned'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Listings
                          </span>
                          <span>{city.current_listings}/{city.target_listings || 0}</span>
                        </div>
                        <Progress value={listingProgress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Agents
                          </span>
                          <span>{city.current_agents}/{city.target_agents || 0}</span>
                        </div>
                        <Progress value={agentProgress} className="h-2" />
                      </div>
                    </div>

                    {/* Localization Status */}
                    <div>
                      <p className="text-sm font-medium mb-2">Localization Status</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(city.localization_status || {}).map(([key, value]) => (
                          <Badge 
                            key={key} 
                            variant={value ? "default" : "outline"}
                            className={value ? "bg-green-500" : ""}
                          >
                            {value ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-4">
          {cities.map(city => {
            const cityCompetitors = city.competitors as Array<{name: string, threat: string}> || [];
            
            if (cityCompetitors.length === 0) return null;
            
            return (
              <Card key={city.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {city.city_name} Competitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Competitor</TableHead>
                        <TableHead>Threat Level</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cityCompetitors.map((comp, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{comp.name}</TableCell>
                          <TableCell>
                            <Badge className={getThreatColor(comp.threat)}>
                              {comp.threat?.toUpperCase() || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Analyze
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader>
              <CardTitle>Add Competitor Analysis</CardTitle>
              <CardDescription>Track competitor activity in your expansion markets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.id}>{city.city_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Competitor Name</Label>
                    <Input placeholder="e.g., Rumah123" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Market Share (%)</Label>
                    <Input type="number" placeholder="e.g., 25" />
                  </div>
                  <div className="space-y-2">
                    <Label>Threat Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competitor
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expansion Milestones</CardTitle>
                <CardDescription>Track key milestones across all phases</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No milestones defined yet</p>
                  <p className="text-sm">Add milestones to track your expansion progress</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Phase/City</TableHead>
                      <TableHead>Target Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milestones.map(milestone => {
                      const phase = phases.find(p => p.id === milestone.phase_id);
                      const city = cities.find(c => c.id === milestone.city_id);
                      
                      return (
                        <TableRow key={milestone.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{milestone.milestone_name}</p>
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {phase && <Badge variant="outline">Phase {phase.phase_number}</Badge>}
                            {city && <Badge variant="outline" className="ml-1">{city.city_name}</Badge>}
                          </TableCell>
                          <TableCell>
                            {milestone.target_date ? new Date(milestone.target_date).toLocaleDateString('id-ID') : 'TBD'}
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getPriorityColor(milestone.priority)}`}>
                              {milestone.priority.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget by Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phases.map(phase => {
                    const budgetProgress = phase.total_budget > 0 
                      ? (Number(phase.spent_budget) / Number(phase.total_budget)) * 100 
                      : 0;
                    
                    return (
                      <div key={phase.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Phase {phase.phase_number}: {phase.phase_name}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(Number(phase.spent_budget))} / {formatCurrency(Number(phase.total_budget))}
                          </span>
                        </div>
                        <Progress value={budgetProgress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Marketing Budget by City
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cities.filter(c => c.marketing_budget > 0).map(city => {
                    const marketingProgress = city.marketing_budget > 0 
                      ? (Number(city.marketing_spent) / Number(city.marketing_budget)) * 100 
                      : 0;
                    
                    return (
                      <div key={city.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{city.city_name}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(Number(city.marketing_spent))} / {formatCurrency(Number(city.marketing_budget))}
                          </span>
                        </div>
                        <Progress value={marketingProgress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Total Investment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Budget (IDR)</TableHead>
                    <TableHead className="text-right">Budget (USD)</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phases.map(phase => (
                    <TableRow key={phase.id}>
                      <TableCell className="font-medium">
                        Phase {phase.phase_number}: {phase.phase_name}
                      </TableCell>
                      <TableCell>
                        {phase.start_date && phase.end_date 
                          ? `${Math.round((new Date(phase.end_date).getTime() - new Date(phase.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months`
                          : 'TBD'}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(phase.total_budget))}</TableCell>
                      <TableCell className="text-right">~${Math.round(Number(phase.total_budget) / 16000).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(phase.spent_budget))}</TableCell>
                      <TableCell className="text-right text-chart-1">
                        {formatCurrency(Number(phase.total_budget) - Number(phase.spent_budget))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>36 months</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalBudget)}</TableCell>
                    <TableCell className="text-right">~${Math.round(totalBudget / 16000).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalSpent)}</TableCell>
                    <TableCell className="text-right text-chart-1">
                      {formatCurrency(totalBudget - totalSpent)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpansionPlanningManagement;

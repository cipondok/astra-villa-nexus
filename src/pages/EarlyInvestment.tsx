import { useState, useMemo } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, TrendingUp, BarChart3, Search, HardHat } from 'lucide-react';
import { motion } from 'framer-motion';
import OffPlanProjectCard from '@/components/investment/OffPlanProjectCard';
import DeveloperProfileCard from '@/components/investment/DeveloperProfileCard';
import OffPlanROICalculator from '@/components/investment/OffPlanROICalculator';
import { DEMO_PROJECTS, DEMO_DEVELOPERS } from '@/data/demoOffPlanProjects';
import { useNavigate } from 'react-router-dom';

const EarlyInvestment = () => {
  const navigate = useNavigate();
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cities = useMemo(() => ['all', ...new Set(DEMO_PROJECTS.map(p => p.city))], []);
  const types = useMemo(() => ['all', ...new Set(DEMO_PROJECTS.map(p => p.propertyType))], []);

  const filteredProjects = useMemo(() => {
    return DEMO_PROJECTS.filter(p => {
      if (cityFilter !== 'all' && p.city !== cityFilter) return false;
      if (typeFilter !== 'all' && p.propertyType !== typeFilter) return false;
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [cityFilter, typeFilter, searchQuery]);

  const avgROI = useMemo(() => {
    const total = DEMO_PROJECTS.reduce((s, p) => s + p.appreciationPct, 0);
    return (total / DEMO_PROJECTS.length).toFixed(0);
  }, []);

  const avgCompletion = useMemo(() => {
    const total = DEMO_PROJECTS.reduce((s, p) => s + p.completionPct, 0);
    return (total / DEMO_PROJECTS.length).toFixed(0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Early Investment Opportunities | Off-Plan Projects Indonesia"
        description="Invest early in Indonesia's best off-plan properties. Track construction progress, ROI forecasts, and trusted developer profiles."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs">
              <HardHat className="h-3 w-3 mr-1" /> Off-Plan Investments
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground mb-3">
              Early Investment Opportunities
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Get in early on Indonesia's most promising developments. Track construction progress, forecast ROI, and invest with confidence.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-primary">{DEMO_PROJECTS.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Active Projects</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-primary">{avgROI}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Avg. ROI</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-primary">{avgCompletion}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Avg. Completion</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-9">
            <TabsTrigger value="projects" className="text-xs gap-1"><Building2 className="h-3 w-3" /> Projects</TabsTrigger>
            <TabsTrigger value="calculator" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Calculator</TabsTrigger>
            <TabsTrigger value="developers" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Developers</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-9 text-xs pl-8"
                />
              </div>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(c => (
                    <SelectItem key={c} value={c} className="text-xs">{c === 'all' ? 'All Cities' : c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(t => (
                    <SelectItem key={t} value={t} className="text-xs capitalize">{t === 'all' ? 'All Types' : t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <OffPlanProjectCard
                  key={project.id}
                  project={project}
                  onClick={(id) => navigate(`/properties/${id}`)}
                />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No projects match your filters.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calculator">
            <div className="max-w-lg mx-auto">
              <OffPlanROICalculator />
            </div>
          </TabsContent>

          <TabsContent value="developers" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEMO_DEVELOPERS.map(dev => (
                <DeveloperProfileCard key={dev.id} developer={dev} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EarlyInvestment;

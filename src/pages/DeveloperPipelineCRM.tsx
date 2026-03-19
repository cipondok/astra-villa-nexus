import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Layers, Tag, Clock, User, FileText,
  Calendar, ChevronRight, Plus, Search, Filter, X,
  TrendingUp, Users, Handshake, BarChart3, Phone, Mail,
  MessageSquare, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type Stage = 'new_lead' | 'contact_initiated' | 'demo_scheduled' | 'agreement_pending' | 'listings_live' | 'strategic_partner';

interface Developer {
  id: string;
  company: string;
  location: string;
  listingVolume: number;
  priority: 'high' | 'medium' | 'low';
  lastInteraction: string;
  stage: Stage;
  contact: { name: string; role: string; phone: string; email: string };
  notes: { date: string; text: string }[];
  launchTimeline: string;
  brochure?: string;
}

const stages: { key: Stage; label: string; color: string }[] = [
  { key: 'new_lead', label: 'New Lead', color: 'bg-blue-500' },
  { key: 'contact_initiated', label: 'Contact Initiated', color: 'bg-amber-500' },
  { key: 'demo_scheduled', label: 'Demo Scheduled', color: 'bg-purple-500' },
  { key: 'agreement_pending', label: 'Agreement Pending', color: 'bg-orange-500' },
  { key: 'listings_live', label: 'Listings Live', color: 'bg-emerald-500' },
  { key: 'strategic_partner', label: 'Strategic Partner', color: 'bg-teal-500' },
];

const priorityColors = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const mockDevelopers: Developer[] = [
  { id: '1', company: 'Bali Tropika Development', location: 'Canggu, Bali', listingVolume: 48, priority: 'high', lastInteraction: '2 hours ago', stage: 'demo_scheduled', contact: { name: 'Wayan Sudiarta', role: 'Head of Sales', phone: '+62 812 3456 7890', email: 'wayan@balitropika.id' }, notes: [{ date: 'Mar 18', text: 'Very interested in AI scoring feature' }, { date: 'Mar 15', text: 'Initial call — warm lead from conference' }], launchTimeline: 'Q2 2026' },
  { id: '2', company: 'Jakarta Prime Estates', location: 'South Jakarta', listingVolume: 120, priority: 'high', lastInteraction: '1 day ago', stage: 'agreement_pending', contact: { name: 'Rini Hartono', role: 'CEO', phone: '+62 811 2233 445', email: 'rini@jpe.co.id' }, notes: [{ date: 'Mar 17', text: 'Legal reviewing partnership terms' }], launchTimeline: 'Q3 2026' },
  { id: '3', company: 'Lombok Sunrise Properties', location: 'Kuta Lombok', listingVolume: 22, priority: 'medium', lastInteraction: '3 days ago', stage: 'new_lead', contact: { name: 'Ahmad Fauzi', role: 'Director', phone: '+62 813 5566 778', email: 'ahmad@lomboksunrise.com' }, notes: [{ date: 'Mar 14', text: 'Found via LinkedIn outreach' }], launchTimeline: 'Q4 2026' },
  { id: '4', company: 'Ubud Green Living', location: 'Ubud, Bali', listingVolume: 35, priority: 'medium', lastInteraction: '5 days ago', stage: 'contact_initiated', contact: { name: 'Made Surya', role: 'Marketing Lead', phone: '+62 812 9988 776', email: 'made@ubudgreen.id' }, notes: [{ date: 'Mar 12', text: 'Sent intro deck, awaiting reply' }], launchTimeline: 'Q1 2027' },
  { id: '5', company: 'Surabaya Metro Developers', location: 'Surabaya', listingVolume: 85, priority: 'high', lastInteraction: '6 hours ago', stage: 'listings_live', contact: { name: 'Budi Santoso', role: 'Partnership Manager', phone: '+62 815 3344 556', email: 'budi@surabayametro.id' }, notes: [{ date: 'Mar 18', text: '42 listings uploaded, performance tracking active' }], launchTimeline: 'Active' },
  { id: '6', company: 'Nusa Dua Capital Group', location: 'Nusa Dua, Bali', listingVolume: 200, priority: 'high', lastInteraction: '1 week ago', stage: 'strategic_partner', contact: { name: 'Ketut Darma', role: 'VP Business Dev', phone: '+62 811 7788 990', email: 'ketut@nusaduacapital.com' }, notes: [{ date: 'Mar 10', text: 'Full partnership signed — exclusive listings deal' }], launchTimeline: 'Ongoing' },
  { id: '7', company: 'Bandung Hills Realty', location: 'Bandung', listingVolume: 15, priority: 'low', lastInteraction: '2 weeks ago', stage: 'new_lead', contact: { name: 'Sari Dewi', role: 'Owner', phone: '+62 822 1122 334', email: 'sari@bandunghills.id' }, notes: [{ date: 'Mar 4', text: 'Cold outreach — small portfolio' }], launchTimeline: 'TBD' },
  { id: '8', company: 'Seminyak Luxury Villas', location: 'Seminyak, Bali', listingVolume: 60, priority: 'medium', lastInteraction: '4 days ago', stage: 'demo_scheduled', contact: { name: 'Putu Agung', role: 'Sales Director', phone: '+62 813 4455 667', email: 'putu@seminyaklux.com' }, notes: [{ date: 'Mar 14', text: 'Demo set for March 22' }], launchTimeline: 'Q2 2026' },
];

const kpis = [
  { label: 'Active Developers', value: '24', icon: Users, delta: '+3 this month' },
  { label: 'Listings Potential', value: '1,240', icon: Layers, delta: '+180 units' },
  { label: 'Conversion Rate', value: '34%', icon: TrendingUp, delta: '+5% vs last month' },
  { label: 'Strategic Partners', value: '6', icon: Handshake, delta: '+1 this quarter' },
];

const DeveloperPipelineCRM = () => {
  const [selected, setSelected] = useState<Developer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevs = mockDevelopers.filter(d =>
    d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getByStage = (stage: Stage) => filteredDevs.filter(d => d.stage === stage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Developer Deal Pipeline</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage listing partnerships and supply growth momentum</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search developers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button onClick={() => toast.success('New developer lead form opened')}>
                <Plus className="w-4 h-4 mr-2" /> Add Developer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="border-b bg-card/50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border"
              >
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <kpi.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{kpi.delta}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex gap-6">
        {/* Kanban Board */}
        <div className={`flex-1 transition-all ${selected ? 'mr-0' : ''}`}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => {
              const cards = getByStage(stage.key);
              return (
                <div key={stage.key} className="min-w-[260px] w-[260px] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                    <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                    <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
                      {cards.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {cards.map(dev => (
                      <motion.div
                        key={dev.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -2 }}
                        onClick={() => setSelected(dev)}
                        className={`p-4 rounded-xl border bg-card cursor-pointer transition-shadow hover:shadow-md ${
                          selected?.id === dev.id ? 'ring-2 ring-primary shadow-md' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="text-sm font-semibold text-foreground leading-tight">{dev.company}</h4>
                          </div>
                        </div>
                        <div className="space-y-1.5 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" /> {dev.location}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Layers className="w-3 h-3" /> {dev.listingVolume} units potential
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t">
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${priorityColors[dev.priority]}`}>
                            {dev.priority}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {dev.lastInteraction}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {cards.length === 0 && (
                      <div className="p-6 rounded-xl border border-dashed text-center">
                        <p className="text-xs text-muted-foreground">No developers</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 380 }}
              exit={{ opacity: 0, x: 40, width: 0 }}
              className="flex-shrink-0 w-[380px]"
            >
              <div className="sticky top-6 rounded-xl border bg-card overflow-hidden">
                {/* Detail Header */}
                <div className="p-5 border-b bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className={`text-xs ${priorityColors[selected.priority]}`}>
                      {selected.priority} priority
                    </Badge>
                    <button onClick={() => setSelected(null)} className="p-1 rounded-md hover:bg-muted">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{selected.company}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {selected.location}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{selected.listingVolume}</p>
                      <p className="text-[10px] text-muted-foreground">Units</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">{selected.launchTimeline}</p>
                      <p className="text-[10px] text-muted-foreground">Launch</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-5 border-b">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Person</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground font-medium">{selected.contact.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-5.5">{selected.contact.role}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{selected.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{selected.contact.email}</span>
                    </div>
                  </div>
                </div>

                {/* Notes Timeline */}
                <div className="p-5 border-b">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notes Timeline</h4>
                  <div className="space-y-3">
                    {selected.notes.map((note, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                          {i < selected.notes.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium">{note.date}</p>
                          <p className="text-sm text-foreground">{note.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brochure Preview */}
                <div className="p-5 border-b">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Project Brochure</h4>
                  <div className="rounded-lg border border-dashed p-6 text-center bg-muted/30">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Upload project brochure</p>
                    <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => toast.info('File upload dialog')}>
                      Upload PDF
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 space-y-2">
                  <Button className="w-full" onClick={() => toast.success(`${selected.company} moved to next stage`)}>
                    <ArrowRight className="w-4 h-4 mr-2" /> Move Stage
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => toast.success('Follow-up scheduled')}>
                    <Calendar className="w-4 h-4 mr-2" /> Schedule Follow-up
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeveloperPipelineCRM;

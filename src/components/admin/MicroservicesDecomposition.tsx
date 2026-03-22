import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, ArrowRight, Shield, Zap, Database, Bell, Search, CreditCard, Users, BarChart3, Package, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Service {
  name: string;
  icon: React.ElementType;
  desc: string;
  endpoints: number;
  deps: string[];
  scaling: string;
  health: string;
  version: string;
  events: string[];
}

const services: Service[] = [
  { name: 'Auth & Identity', icon: Shield, desc: 'User registration, JWT sessions, OAuth, MFA, role resolution via user_roles', endpoints: 5, deps: ['Database'], scaling: 'Horizontal', health: 'Healthy', version: 'v1.4.2', events: ['user.created', 'user.login', 'session.expired'] },
  { name: 'Property Listings', icon: Database, desc: 'CRUD operations, image management, quality scoring, geo-indexing', endpoints: 7, deps: ['Auth', 'Storage', 'Search'], scaling: 'Horizontal', health: 'Healthy', version: 'v2.1.0', events: ['listing.created', 'listing.updated', 'listing.deleted'] },
  { name: 'Search & Recommendation', icon: Search, desc: 'Full-text search, geo-spatial queries, AI-powered matching, personalization', endpoints: 4, deps: ['Listings', 'Analytics'], scaling: 'Horizontal', health: 'Healthy', version: 'v1.8.1', events: ['search.executed', 'recommendation.generated'] },
  { name: 'Deal & Negotiation', icon: Package, desc: 'Offer management, negotiation chat, deal pipeline staging, timeline tracking', endpoints: 6, deps: ['Auth', 'Listings', 'Notification'], scaling: 'Horizontal', health: 'Healthy', version: 'v1.5.3', events: ['offer.placed', 'deal.stage_changed', 'negotiation.message'] },
  { name: 'Payment & Escrow', icon: CreditCard, desc: 'Payment intent creation, escrow management, commission calculation, refunds', endpoints: 4, deps: ['Auth', 'Deal'], scaling: 'Vertical', health: 'Degraded', version: 'v0.9.1', events: ['payment.initiated', 'payment.confirmed', 'escrow.released'] },
  { name: 'Notification & Messaging', icon: Bell, desc: 'In-app notifications, push delivery, email routing, WebSocket broadcast', endpoints: 3, deps: ['Auth'], scaling: 'Horizontal', health: 'Healthy', version: 'v1.3.0', events: ['notification.sent', 'message.delivered'] },
  { name: 'Analytics & Intelligence', icon: BarChart3, desc: 'KPI computation, AI model serving, intelligence cache, predictive insights', endpoints: 4, deps: ['Database', 'Listings', 'Deal'], scaling: 'Horizontal', health: 'Healthy', version: 'v1.6.2', events: ['insight.generated', 'model.retrained'] },
  { name: 'Agent Network', icon: Users, desc: 'Agent profiles, territory management, performance ranking, referral tracking', endpoints: 5, deps: ['Auth', 'Listings', 'Analytics'], scaling: 'Horizontal', health: 'Healthy', version: 'v1.2.4', events: ['agent.onboarded', 'territory.assigned'] },
  { name: 'Subscription & Monetization', icon: Globe, desc: 'Plan management, premium listings, feature gating, billing integration', endpoints: 4, deps: ['Auth', 'Payment'], scaling: 'Vertical', health: 'Healthy', version: 'v1.0.1', events: ['subscription.created', 'plan.upgraded'] },
];

const MicroservicesDecomposition = () => {
  const [expanded, setExpanded] = useState<string | null>('Auth & Identity');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Server className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Microservices Decomposition</h2>
          <Badge variant="outline">🏗️ Architecture</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Core functional domains mapped into scalable, independently deployable service units</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Service Domains', value: `${services.length}` },
          { label: 'Total Endpoints', value: `${services.reduce((s, sv) => s + sv.endpoints, 0)}` },
          { label: 'Healthy Services', value: `${services.filter(s => s.health === 'Healthy').length}/${services.length}` },
          { label: 'Event Types', value: `${services.reduce((s, sv) => s + sv.events.length, 0)}` },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="services">
        <TabsList><TabsTrigger value="services">Service Registry</TabsTrigger><TabsTrigger value="dependencies">Dependency Map</TabsTrigger><TabsTrigger value="gateway">API Gateway</TabsTrigger></TabsList>

        <TabsContent value="services" className="mt-4 space-y-2">
          {services.map((svc, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`cursor-pointer transition-colors ${expanded === svc.name ? 'border-primary' : ''}`} onClick={() => setExpanded(expanded === svc.name ? null : svc.name)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {expanded === svc.name ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <svc.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{svc.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{svc.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={svc.health === 'Healthy' ? 'default' : 'destructive'} className="text-xs">{svc.health}</Badge>
                      <Badge variant="outline" className="text-xs font-mono">{svc.version}</Badge>
                    </div>
                  </div>
                  {expanded === svc.name && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 ml-11 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground">Endpoints</p>
                          <p className="text-lg font-bold text-foreground">{svc.endpoints}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground">Scaling</p>
                          <p className="text-sm font-medium text-foreground">{svc.scaling}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground">Dependencies</p>
                          <p className="text-sm font-medium text-foreground">{svc.deps.length}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Emitted Events</p>
                        <div className="flex flex-wrap gap-1.5">
                          {svc.events.map((e, ei) => <Badge key={ei} variant="secondary" className="text-xs font-mono">{e}</Badge>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Depends On</p>
                        <div className="flex flex-wrap gap-1.5">
                          {svc.deps.map((d, di) => <Badge key={di} variant="outline" className="text-xs">{d}</Badge>)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="dependencies" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {services.map((svc, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                  <Badge variant="secondary" className="font-mono text-xs min-w-[140px] justify-center">{svc.name}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {svc.deps.map((d, di) => <Badge key={di} variant="outline" className="text-xs">{d}</Badge>)}
                  </div>
                  <Badge variant={svc.scaling === 'Horizontal' ? 'default' : 'secondary'} className="text-xs shrink-0">↔ {svc.scaling}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateway" className="mt-4 space-y-4">
          {[
            { title: 'API Gateway Layer', desc: 'Single entry point routing requests to appropriate microservices via path-based routing with JWT validation' },
            { title: 'Rate Limiting', desc: 'Token bucket per service per API key — separate limits for auth (10/min), search (60/min), and payment (5/min) endpoints' },
            { title: 'Circuit Breaker', desc: 'Automatic service isolation when error rate exceeds 5% — fallback to cached responses for read operations' },
            { title: 'Service Mesh', desc: 'Mutual TLS between services, distributed tracing with correlation IDs, and centralized logging aggregation' },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-start gap-3">
                <Server className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MicroservicesDecomposition;

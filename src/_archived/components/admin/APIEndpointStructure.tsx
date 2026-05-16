import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Lock, Zap, Globe, Shield, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  desc: string;
  auth: boolean;
  rateLimit: string;
  version: string;
}

interface EndpointGroup {
  name: string;
  prefix: string;
  endpoints: Endpoint[];
  microservice: boolean;
}

const groups: EndpointGroup[] = [
  {
    name: 'Authentication', prefix: '/auth', microservice: false,
    endpoints: [
      { method: 'POST', path: '/signup', desc: 'Register new user with email/password', auth: false, rateLimit: '5/min', version: 'v1' },
      { method: 'POST', path: '/login', desc: 'Authenticate user, return JWT', auth: false, rateLimit: '10/min', version: 'v1' },
      { method: 'POST', path: '/logout', desc: 'Invalidate session token', auth: true, rateLimit: '30/min', version: 'v1' },
      { method: 'POST', path: '/refresh', desc: 'Refresh access token', auth: true, rateLimit: '10/min', version: 'v1' },
      { method: 'POST', path: '/reset-password', desc: 'Send password reset email', auth: false, rateLimit: '3/min', version: 'v1' },
    ],
  },
  {
    name: 'Properties', prefix: '/properties', microservice: true,
    endpoints: [
      { method: 'GET', path: '/', desc: 'List properties with filters, pagination & geo-search', auth: false, rateLimit: '60/min', version: 'v1' },
      { method: 'POST', path: '/', desc: 'Create new property listing', auth: true, rateLimit: '10/min', version: 'v1' },
      { method: 'GET', path: '/:id', desc: 'Get property details with images & agent info', auth: false, rateLimit: '120/min', version: 'v1' },
      { method: 'PATCH', path: '/:id', desc: 'Update property details (owner/agent only)', auth: true, rateLimit: '20/min', version: 'v1' },
      { method: 'DELETE', path: '/:id', desc: 'Soft-delete property listing', auth: true, rateLimit: '5/min', version: 'v1' },
      { method: 'POST', path: '/:id/images', desc: 'Upload property images (max 20)', auth: true, rateLimit: '10/min', version: 'v1' },
      { method: 'GET', path: '/:id/analytics', desc: 'Property performance metrics', auth: true, rateLimit: '30/min', version: 'v1' },
    ],
  },
  {
    name: 'Deals', prefix: '/deals', microservice: true,
    endpoints: [
      { method: 'POST', path: '/', desc: 'Initiate deal from accepted offer', auth: true, rateLimit: '10/min', version: 'v1' },
      { method: 'GET', path: '/', desc: 'List deals for authenticated user', auth: true, rateLimit: '30/min', version: 'v1' },
      { method: 'GET', path: '/:id', desc: 'Get deal details with timeline', auth: true, rateLimit: '60/min', version: 'v1' },
      { method: 'PATCH', path: '/:id/stage', desc: 'Advance deal stage (role-gated)', auth: true, rateLimit: '10/min', version: 'v1' },
    ],
  },
  {
    name: 'Viewings', prefix: '/viewings', microservice: false,
    endpoints: [
      { method: 'POST', path: '/schedule', desc: 'Schedule property viewing', auth: true, rateLimit: '10/min', version: 'v1' },
      { method: 'GET', path: '/', desc: 'List viewings for user/agent', auth: true, rateLimit: '30/min', version: 'v1' },
      { method: 'PATCH', path: '/:id', desc: 'Reschedule or cancel viewing', auth: true, rateLimit: '10/min', version: 'v1' },
      { method: 'POST', path: '/:id/feedback', desc: 'Submit viewing feedback', auth: true, rateLimit: '5/min', version: 'v1' },
    ],
  },
  {
    name: 'Payments', prefix: '/payments', microservice: true,
    endpoints: [
      { method: 'POST', path: '/initiate', desc: 'Create payment intent (Midtrans/Stripe)', auth: true, rateLimit: '5/min', version: 'v1' },
      { method: 'POST', path: '/confirm', desc: 'Confirm payment completion', auth: true, rateLimit: '10/min', version: 'v1' },
      { method: 'POST', path: '/webhook', desc: 'Payment provider webhook handler', auth: false, rateLimit: '100/min', version: 'v1' },
      { method: 'GET', path: '/history', desc: 'User payment transaction history', auth: true, rateLimit: '30/min', version: 'v1' },
    ],
  },
  {
    name: 'Analytics', prefix: '/analytics', microservice: true,
    endpoints: [
      { method: 'GET', path: '/dashboard', desc: 'Executive KPI dashboard data', auth: true, rateLimit: '20/min', version: 'v1' },
      { method: 'GET', path: '/liquidity/:district', desc: 'District liquidity intelligence', auth: true, rateLimit: '30/min', version: 'v1' },
      { method: 'GET', path: '/agent-performance', desc: 'Agent productivity metrics', auth: true, rateLimit: '20/min', version: 'v1' },
      { method: 'GET', path: '/market-trends', desc: 'AI market trend forecasting', auth: true, rateLimit: '10/min', version: 'v1' },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  POST: 'bg-primary/10 text-primary border-primary/20',
  PATCH: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
};

const APIEndpointStructure = () => {
  const [expanded, setExpanded] = useState<string | null>('Authentication');
  const totalEndpoints = groups.reduce((sum, g) => sum + g.endpoints.length, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Server className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">API Endpoint Structure</h2>
          <Badge variant="outline">🔗 Service Architecture</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Structured API documentation with rate limiting, versioning & microservice readiness</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Endpoint Groups', value: `${groups.length}` },
          { label: 'Total Endpoints', value: `${totalEndpoints}` },
          { label: 'Microservice Ready', value: `${groups.filter(g => g.microservice).length}` },
          { label: 'API Version', value: 'v1' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        {groups.map((g, gi) => (
          <motion.div key={gi} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}>
            <Card>
              <CardContent className="p-0">
                <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpanded(expanded === g.name ? null : g.name)}>
                  <div className="flex items-center gap-3">
                    {expanded === g.name ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-bold text-foreground text-sm">{g.name}</span>
                    <Badge variant="secondary" className="font-mono text-xs">{g.prefix}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{g.endpoints.length} endpoints</Badge>
                    {g.microservice && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">🔀 Microservice</Badge>}
                  </div>
                </button>
                {expanded === g.name && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-border">
                    {g.endpoints.map((ep, ei) => (
                      <div key={ei} className="p-3 px-4 border-b border-border last:border-b-0 flex items-center gap-3">
                        <Badge className={`${methodColors[ep.method]} text-xs font-mono min-w-[52px] justify-center`}>{ep.method}</Badge>
                        <span className="font-mono text-sm text-foreground flex-1">{g.prefix}{ep.path}</span>
                        <span className="text-xs text-muted-foreground hidden md:block max-w-[240px] truncate">{ep.desc}</span>
                        <div className="flex items-center gap-1.5">
                          {ep.auth && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                          <Badge variant="outline" className="text-xs font-mono flex items-center gap-1"><Clock className="h-3 w-3" />{ep.rateLimit}</Badge>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Versioning & Strategy Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Versioning Strategy</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• URL-based versioning: <code className="text-foreground font-mono text-xs">/api/v1/...</code></p>
            <p>• Breaking changes increment major version</p>
            <p>• Deprecated endpoints maintain 6-month sunset window</p>
            <p>• Version header fallback: <code className="text-foreground font-mono text-xs">X-API-Version: 1</code></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Rate Limiting Architecture</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Token bucket algorithm per API key</p>
            <p>• Sliding window for auth endpoints</p>
            <p>• Premium tier: 5x rate multiplier</p>
            <p>• Response headers: <code className="text-foreground font-mono text-xs">X-RateLimit-*</code></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APIEndpointStructure;

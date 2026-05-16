import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Users, Eye, AlertTriangle, CheckCircle, XCircle, Key, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = ['Admin', 'Ops Manager', 'Agent', 'Seller', 'Buyer', 'Investor'];

const permissions = [
  { category: 'Listings', actions: [
    { name: 'Create Listing', access: [true, true, true, true, false, false] },
    { name: 'Edit Any Listing', access: [true, true, false, false, false, false] },
    { name: 'Edit Own Listing', access: [true, true, true, true, false, false] },
    { name: 'Delete Listing', access: [true, true, false, false, false, false] },
    { name: 'View All Listings', access: [true, true, true, true, true, true] },
    { name: 'Boost/Promote', access: [true, true, true, true, false, false] },
  ]},
  { category: 'Deals & Negotiation', actions: [
    { name: 'Create Offer', access: [true, false, false, false, true, true] },
    { name: 'View All Deals', access: [true, true, false, false, false, false] },
    { name: 'View Own Deals', access: [true, true, true, true, true, true] },
    { name: 'Advance Deal Stage', access: [true, true, true, false, false, false] },
    { name: 'Negotiate Price', access: [true, false, true, true, true, true] },
  ]},
  { category: 'Payments & Finance', actions: [
    { name: 'View All Payments', access: [true, true, false, false, false, false] },
    { name: 'View Own Payments', access: [true, true, true, true, true, true] },
    { name: 'Initiate Payment', access: [true, false, false, false, true, true] },
    { name: 'Process Refund', access: [true, false, false, false, false, false] },
    { name: 'Commission Dashboard', access: [true, true, true, false, false, false] },
  ]},
  { category: 'Analytics & Intelligence', actions: [
    { name: 'Executive Dashboard', access: [true, true, false, false, false, false] },
    { name: 'Agent Performance', access: [true, true, false, false, false, false] },
    { name: 'Own Analytics', access: [true, true, true, true, true, true] },
    { name: 'Market Intelligence', access: [true, true, true, false, false, true] },
    { name: 'AI Predictions', access: [true, true, false, false, false, true] },
  ]},
  { category: 'Documents & Verification', actions: [
    { name: 'Upload Documents', access: [true, true, true, true, true, true] },
    { name: 'Verify Documents', access: [true, true, false, false, false, false] },
    { name: 'Access All Documents', access: [true, true, false, false, false, false] },
    { name: 'KYC Management', access: [true, false, false, false, false, false] },
  ]},
];

const authLifecycle = [
  { stage: 'Unauthenticated', desc: 'Public routes: search, listing view, landing page', icon: Eye },
  { stage: 'Email/OAuth Login', desc: 'Supabase Auth with JWT + refresh token', icon: Key },
  { stage: 'Session Active', desc: 'Access token in memory, refresh in httpOnly cookie', icon: CheckCircle },
  { stage: 'Role Resolution', desc: 'user_roles table lookup via has_permission()', icon: Users },
  { stage: 'RLS Enforcement', desc: 'Row-level security on every database query', icon: Shield },
  { stage: 'Inactivity Timeout', desc: '30min idle → 5min grace → forced logout', icon: Lock },
];

const SecurityPermissionMatrix = () => {
  const [expandedCat, setExpandedCat] = useState<string | null>('Listings');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Security & Permission Role Matrix</h2>
          <Badge variant="outline">🔐 RBAC</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Structured access control architecture with role-based permission enforcement</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'User Roles', value: '6' },
          { label: 'Permission Actions', value: `${permissions.reduce((s, c) => s + c.actions.length, 0)}` },
          { label: 'RLS Policies', value: 'Active' },
          { label: 'Auth Method', value: 'JWT + MFA' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="matrix">
        <TabsList><TabsTrigger value="matrix">Permission Matrix</TabsTrigger><TabsTrigger value="lifecycle">Auth Lifecycle</TabsTrigger><TabsTrigger value="alerts">Security Monitoring</TabsTrigger></TabsList>

        <TabsContent value="matrix" className="mt-4 space-y-3">
          {permissions.map((cat, ci) => (
            <Card key={ci}>
              <CardContent className="p-0">
                <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpandedCat(expandedCat === cat.category ? null : cat.category)}>
                  <span className="font-bold text-foreground text-sm">{cat.category}</span>
                  <Badge variant="outline" className="text-xs">{cat.actions.length} actions</Badge>
                </button>
                {expandedCat === cat.category && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-muted-foreground font-medium text-xs min-w-[180px]">Action</th>
                          {roles.map((r, ri) => (
                            <th key={ri} className="p-3 text-center text-muted-foreground font-medium text-xs min-w-[80px]">{r}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.actions.map((action, ai) => (
                          <tr key={ai} className="border-b border-border last:border-b-0">
                            <td className="p-3 text-foreground text-xs font-medium">{action.name}</td>
                            {action.access.map((has, hi) => (
                              <td key={hi} className="p-3 text-center">
                                {has ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                {authLifecycle.map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border min-w-[180px]">
                      <s.icon className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{s.stage}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                    {i < authLifecycle.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4 space-y-3">
          {[
            { title: 'Failed Login Attempts', desc: 'Auto-lockout after 5 consecutive failures for 30 minutes', severity: 'Active', icon: Lock },
            { title: 'Suspicious IP Detection', desc: 'Browser fingerprinting + IP geolocation anomaly detection', severity: 'Active', icon: AlertTriangle },
            { title: 'Privilege Escalation Guard', desc: 'Roles stored in separate user_roles table — never on profile', severity: 'Enforced', icon: Shield },
            { title: 'RLS Bypass Prevention', desc: 'All views use security_invoker=on, no USING(true) policies', severity: 'Enforced', icon: Shield },
            { title: 'Session Hijacking Protection', desc: '30-min inactivity timeout with heartbeat verification', severity: 'Active', icon: Key },
            { title: 'API Key Encryption', desc: 'pgp_sym_encrypt via Supabase Vault for stored credentials', severity: 'Active', icon: Lock },
          ].map((alert, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-start gap-3">
                <alert.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground text-sm">{alert.title}</p>
                    <Badge variant="default" className="text-xs">{alert.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPermissionMatrix;

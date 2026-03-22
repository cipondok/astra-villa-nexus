import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Link, Key, Zap, Search, ArrowRight, Layers, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const entities = [
  { name: 'users', columns: ['id (PK)', 'email', 'role', 'created_at', 'updated_at'], indexes: ['email (UNIQUE)', 'role'], realtime: true, partition: false },
  { name: 'profiles', columns: ['id (PK/FK→users)', 'full_name', 'phone', 'avatar_url', 'location'], indexes: ['id'], realtime: false, partition: false },
  { name: 'agents', columns: ['id (PK/FK→users)', 'license_no', 'district', 'commission_rate', 'is_verified'], indexes: ['district', 'is_verified'], realtime: true, partition: false },
  { name: 'properties', columns: ['id (PK)', 'owner_id (FK→users)', 'agent_id (FK→agents)', 'title', 'type', 'price', 'status', 'lat', 'lng', 'district', 'city'], indexes: ['status,city', 'owner_id', 'agent_id', '(lat,lng,status) COMPOSITE', 'GIN(title,description)'], realtime: true, partition: true },
  { name: 'property_images', columns: ['id (PK)', 'property_id (FK→properties)', 'url', 'order', 'is_primary'], indexes: ['property_id'], realtime: false, partition: false },
  { name: 'inquiries', columns: ['id (PK)', 'property_id (FK)', 'buyer_id (FK→users)', 'agent_id (FK)', 'message', 'status', 'created_at'], indexes: ['property_id', 'buyer_id', 'status'], realtime: true, partition: true },
  { name: 'viewings', columns: ['id (PK)', 'inquiry_id (FK)', 'property_id (FK)', 'scheduled_at', 'status', 'feedback_score'], indexes: ['property_id', 'scheduled_at'], realtime: true, partition: false },
  { name: 'offers', columns: ['id (PK)', 'property_id (FK)', 'buyer_id (FK)', 'amount', 'status', 'message', 'expires_at'], indexes: ['property_id', 'buyer_id', 'status'], realtime: true, partition: false },
  { name: 'deals', columns: ['id (PK)', 'property_id (FK)', 'offer_id (FK)', 'buyer_id (FK)', 'seller_id (FK)', 'agent_id (FK)', 'stage', 'amount', 'closed_at'], indexes: ['stage', 'agent_id', 'closed_at'], realtime: true, partition: true },
  { name: 'negotiations', columns: ['id (PK)', 'deal_id (FK)', 'sender_id (FK)', 'message', 'price_proposed', 'created_at'], indexes: ['deal_id'], realtime: true, partition: false },
  { name: 'payments', columns: ['id (PK)', 'deal_id (FK)', 'amount', 'method', 'status', 'provider_ref', 'paid_at'], indexes: ['deal_id', 'status'], realtime: true, partition: true },
  { name: 'subscriptions', columns: ['id (PK)', 'user_id (FK)', 'plan', 'status', 'current_period_end', 'stripe_id'], indexes: ['user_id', 'status'], realtime: false, partition: false },
  { name: 'reviews', columns: ['id (PK)', 'property_id (FK)', 'reviewer_id (FK)', 'agent_id (FK)', 'rating', 'comment'], indexes: ['property_id', 'agent_id'], realtime: false, partition: false },
  { name: 'notifications', columns: ['id (PK)', 'user_id (FK)', 'type', 'title', 'body', 'read', 'created_at'], indexes: ['user_id,read', 'created_at'], realtime: true, partition: true },
  { name: 'activity_logs', columns: ['id (PK)', 'user_id (FK)', 'action', 'entity_type', 'entity_id', 'metadata (JSONB)', 'created_at'], indexes: ['user_id', 'entity_type,entity_id', 'created_at'], realtime: false, partition: true },
];

const relationships = [
  { from: 'profiles', to: 'users', type: '1:1', key: 'id' },
  { from: 'agents', to: 'users', type: '1:1', key: 'id' },
  { from: 'properties', to: 'users', type: 'N:1', key: 'owner_id' },
  { from: 'properties', to: 'agents', type: 'N:1', key: 'agent_id' },
  { from: 'property_images', to: 'properties', type: 'N:1', key: 'property_id' },
  { from: 'inquiries', to: 'properties', type: 'N:1', key: 'property_id' },
  { from: 'inquiries', to: 'users', type: 'N:1', key: 'buyer_id' },
  { from: 'viewings', to: 'inquiries', type: 'N:1', key: 'inquiry_id' },
  { from: 'offers', to: 'properties', type: 'N:1', key: 'property_id' },
  { from: 'deals', to: 'properties', type: 'N:1', key: 'property_id' },
  { from: 'deals', to: 'offers', type: '1:1', key: 'offer_id' },
  { from: 'negotiations', to: 'deals', type: 'N:1', key: 'deal_id' },
  { from: 'payments', to: 'deals', type: 'N:1', key: 'deal_id' },
  { from: 'subscriptions', to: 'users', type: 'N:1', key: 'user_id' },
  { from: 'reviews', to: 'properties', type: 'N:1', key: 'property_id' },
  { from: 'notifications', to: 'users', type: 'N:1', key: 'user_id' },
  { from: 'activity_logs', to: 'users', type: 'N:1', key: 'user_id' },
];

const DatabaseArchitecture = () => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Database className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Database Table Relationship Architecture</h2>
          <Badge variant="outline">🗄️ Schema Blueprint</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Relational database schema visualization with index recommendations and scaling strategy</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Core Entities', value: `${entities.length}`, icon: Database },
          { label: 'Relationships', value: `${relationships.length}`, icon: Link },
          { label: 'Realtime Ready', value: `${entities.filter(e => e.realtime).length}`, icon: Zap },
          { label: 'Partitioned', value: `${entities.filter(e => e.partition).length}`, icon: Layers },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <m.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="entities">
        <TabsList><TabsTrigger value="entities">Entity Schema</TabsTrigger><TabsTrigger value="relationships">Relationships</TabsTrigger><TabsTrigger value="scaling">Scaling Strategy</TabsTrigger></TabsList>

        <TabsContent value="entities" className="space-y-3 mt-4">
          {entities.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`cursor-pointer transition-colors ${selectedEntity === e.name ? 'border-primary' : ''}`} onClick={() => setSelectedEntity(selectedEntity === e.name ? null : e.name)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="font-mono font-bold text-foreground text-sm">{e.name}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {e.realtime && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">⚡ Realtime</Badge>}
                      {e.partition && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">📊 Partitioned</Badge>}
                    </div>
                  </div>
                  {selectedEntity === e.name && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Columns</p>
                        <div className="flex flex-wrap gap-1.5">
                          {e.columns.map((c, ci) => (
                            <Badge key={ci} variant="secondary" className="text-xs font-mono">
                              {c.includes('PK') && <Key className="h-3 w-3 mr-1" />}
                              {c.includes('FK') && <Link className="h-3 w-3 mr-1" />}
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Indexes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {e.indexes.map((idx, ii) => (
                            <Badge key={ii} variant="outline" className="text-xs font-mono"><Search className="h-3 w-3 mr-1" />{idx}</Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="relationships" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {relationships.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                  <Badge variant="secondary" className="font-mono text-xs min-w-[120px] justify-center">{r.from}</Badge>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ArrowRight className="h-3.5 w-3.5" />
                    <Badge variant="outline" className="text-xs">{r.type}</Badge>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs min-w-[120px] justify-center">{r.to}</Badge>
                  <span className="text-xs text-muted-foreground font-mono ml-auto">FK: {r.key}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scaling" className="mt-4 space-y-4">
          {[
            { title: 'Monthly Range Partitioning', desc: 'High-write tables (properties, inquiries, deals, payments, notifications, activity_logs) partitioned by created_at month for query performance at 100K+ rows', status: 'Recommended' },
            { title: 'Composite & GIN Indexes', desc: 'Spatial composite indexes on (lat, lng, status) and GIN full-text on property descriptions for sub-50ms search at scale', status: 'Implemented' },
            { title: 'Materialized Views', desc: 'Pre-computed analytics views refreshed via pg_cron for dashboard KPIs, agent leaderboards, and district liquidity scores', status: 'Active' },
            { title: '4-Tier Intelligence Cache', desc: 'Hot (5min) → Warm (1hr) → Cool (24hr) → Frozen (7d) caching in ai_intelligence_cache for AI predictions', status: 'Active' },
            { title: 'Read Replica Routing', desc: 'Heavy analytics queries routed to read replicas when concurrent users exceed 100K threshold', status: 'Planned' },
            { title: 'S3 Archival Pipeline', desc: 'Activity logs and old notifications archived to S3 after 90 days to maintain primary database performance', status: 'Planned' },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground text-sm">{s.title}</p>
                    <Badge variant={s.status === 'Active' || s.status === 'Implemented' ? 'default' : 'secondary'} className="text-xs">{s.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseArchitecture;

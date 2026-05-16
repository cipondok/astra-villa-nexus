import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, File, ChevronDown, ChevronRight, Layers, Zap, Smartphone, Code } from 'lucide-react';
import { motion } from 'framer-motion';

interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  desc?: string;
  tags?: string[];
  children?: TreeNode[];
}

const tree: TreeNode[] = [
  { name: 'components/', type: 'folder', children: [
    { name: 'ui/', type: 'folder', desc: 'Shadcn/Radix primitives', tags: ['Reusable'], children: [
      { name: 'button.tsx', type: 'file', desc: 'CVA-based button variants' },
      { name: 'card.tsx', type: 'file', desc: 'Content container card' },
      { name: 'dialog.tsx', type: 'file', desc: 'Modal dialog component' },
      { name: 'input.tsx', type: 'file', desc: 'Form input primitives' },
      { name: 'badge.tsx', type: 'file', desc: 'Status & label badges' },
    ]},
    { name: 'forms/', type: 'folder', desc: 'React Hook Form compositions', tags: ['Validated'], children: [
      { name: 'PropertyForm.tsx', type: 'file', desc: 'Multi-step listing form' },
      { name: 'OfferForm.tsx', type: 'file', desc: 'Purchase offer submission' },
      { name: 'ProfileForm.tsx', type: 'file', desc: 'User profile editor' },
    ]},
    { name: 'cards/', type: 'folder', desc: 'Domain-specific cards', tags: ['Lazy-loaded'], children: [
      { name: 'PropertyCard.tsx', type: 'file', desc: 'Listing preview card' },
      { name: 'AgentCard.tsx', type: 'file', desc: 'Agent profile card' },
      { name: 'DealCard.tsx', type: 'file', desc: 'Deal progress card' },
      { name: 'KPICard.tsx', type: 'file', desc: 'Analytics metric card' },
    ]},
    { name: 'charts/', type: 'folder', desc: 'Recharts-based visualizations', tags: ['Theme-aware'], children: [
      { name: 'AreaTrend.tsx', type: 'file', desc: 'Area chart with semantic tokens' },
      { name: 'BarComparison.tsx', type: 'file', desc: 'Comparative bar chart' },
      { name: 'RadarScore.tsx', type: 'file', desc: 'Multi-axis radar scoring' },
    ]},
    { name: 'maps/', type: 'folder', desc: 'Mapbox GL integrations', tags: ['GPU-accelerated'], children: [
      { name: 'InteractiveMap.tsx', type: 'file', desc: 'Property map with clustering' },
      { name: 'HeatLayer.tsx', type: 'file', desc: 'District heat overlay' },
    ]},
    { name: 'modals/', type: 'folder', desc: 'Action confirmation modals', children: [
      { name: 'ViewingBooking.tsx', type: 'file', desc: 'Schedule viewing modal' },
      { name: 'PaymentConfirm.tsx', type: 'file', desc: 'Secure payment modal' },
    ]},
  ]},
  { name: 'modules/', type: 'folder', children: [
    { name: 'auth/', type: 'folder', desc: 'Authentication flows', tags: ['Security'], children: [
      { name: 'LoginForm.tsx', type: 'file' }, { name: 'SignupFlow.tsx', type: 'file' }, { name: 'useAuth.ts', type: 'file' },
    ]},
    { name: 'properties/', type: 'folder', desc: 'Property CRUD & search', tags: ['Core'], children: [
      { name: 'PropertyList.tsx', type: 'file' }, { name: 'PropertyDetail.tsx', type: 'file' }, { name: 'SearchFilters.tsx', type: 'file' },
    ]},
    { name: 'deals/', type: 'folder', desc: 'Deal pipeline management', tags: ['Realtime'], children: [
      { name: 'DealTimeline.tsx', type: 'file' }, { name: 'NegotiationChat.tsx', type: 'file' }, { name: 'OfferSubmission.tsx', type: 'file' },
    ]},
    { name: 'agents/', type: 'folder', desc: 'Agent dashboards & tools', children: [
      { name: 'AgentDashboard.tsx', type: 'file' }, { name: 'PerformanceMetrics.tsx', type: 'file' },
    ]},
    { name: 'analytics/', type: 'folder', desc: 'Intelligence dashboards', tags: ['Lazy-loaded'], children: [
      { name: 'ExecutiveKPIs.tsx', type: 'file' }, { name: 'LiquidityEngine.tsx', type: 'file' }, { name: 'MarketForecasting.tsx', type: 'file' },
    ]},
    { name: 'payments/', type: 'folder', desc: 'Payment & escrow flows', tags: ['Secure'], children: [
      { name: 'PaymentFlow.tsx', type: 'file' }, { name: 'EscrowTracker.tsx', type: 'file' },
    ]},
  ]},
  { name: 'pages/', type: 'folder', children: [
    { name: 'Dashboard.tsx', type: 'file', desc: 'Role-based dashboard router' },
    { name: 'PropertyListing.tsx', type: 'file', desc: 'Property discovery page' },
    { name: 'DealRoom.tsx', type: 'file', desc: 'Deal management interface' },
    { name: 'Profile.tsx', type: 'file', desc: 'User profile page' },
    { name: 'AdminPanel.tsx', type: 'file', desc: 'Admin command center' },
  ]},
  { name: 'state/', type: 'folder', children: [
    { name: 'stores/', type: 'folder', desc: 'Zustand state stores', children: [
      { name: 'usePropertyStore.ts', type: 'file' }, { name: 'useAuthStore.ts', type: 'file' }, { name: 'useUIStore.ts', type: 'file' },
    ]},
    { name: 'hooks/', type: 'folder', desc: 'TanStack Query hooks', children: [
      { name: 'useProperties.ts', type: 'file' }, { name: 'useDeals.ts', type: 'file' }, { name: 'useAnalytics.ts', type: 'file' },
    ]},
  ]},
  { name: 'services/', type: 'folder', children: [
    { name: 'api/', type: 'folder', desc: 'Supabase client wrappers', children: [
      { name: 'propertyService.ts', type: 'file' }, { name: 'dealService.ts', type: 'file' }, { name: 'paymentService.ts', type: 'file' },
    ]},
    { name: 'realtime/', type: 'folder', desc: 'Supabase Realtime channels', children: [
      { name: 'dealChannel.ts', type: 'file' }, { name: 'notificationChannel.ts', type: 'file' },
    ]},
  ]},
];

const FolderTree = ({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) => {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(nodes.filter(n => n.type === 'folder' && depth < 1).map(n => n.name)));

  const toggle = (name: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-0.5">
      {nodes.map((node, i) => (
        <div key={i} style={{ paddingLeft: `${depth * 16}px` }}>
          {node.type === 'folder' ? (
            <>
              <button onClick={() => toggle(node.name)} className="flex items-center gap-2 w-full p-1.5 rounded hover:bg-muted/50 text-left">
                {openFolders.has(node.name) ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-mono font-medium text-foreground">{node.name}</span>
                {node.desc && <span className="text-xs text-muted-foreground ml-1">{node.desc}</span>}
                {node.tags?.map((t, ti) => <Badge key={ti} variant="outline" className="text-xs ml-1">{t}</Badge>)}
              </button>
              {openFolders.has(node.name) && node.children && <FolderTree nodes={node.children} depth={depth + 1} />}
            </>
          ) : (
            <div className="flex items-center gap-2 p-1.5 pl-7">
              <File className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-mono text-foreground">{node.name}</span>
              {node.desc && <span className="text-xs text-muted-foreground">— {node.desc}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const FrontendArchitecture = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Code className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Frontend Component Architecture</h2>
          <Badge variant="outline">📁 Project Structure</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Modular frontend organization for scalable development</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Component Dirs', value: '6', icon: FolderOpen },
          { label: 'Module Domains', value: '6', icon: Layers },
          { label: 'Lazy-loaded', value: '8+', icon: Zap },
          { label: 'Mobile Responsive', value: '100%', icon: Smartphone },
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

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-mono">src/</CardTitle></CardHeader>
        <CardContent><FolderTree nodes={tree} /></CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Reusability</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p>• UI primitives shared across all modules</p>
            <p>• CVA variants for consistent button/badge styling</p>
            <p>• Design tokens from Tailwind config — no hardcoded colors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Performance</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p>• React.lazy() for heavy modules (maps, charts, 3D)</p>
            <p>• Bundle target: &lt;250KB initial load</p>
            <p>• Image optimization via Supabase transformations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Responsive</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p>• Mobile-first grid system</p>
            <p>• Breakpoints: sm(640) / md(768) / lg(1024) / xl(1280)</p>
            <p>• Touch-optimized interactive elements</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FrontendArchitecture;

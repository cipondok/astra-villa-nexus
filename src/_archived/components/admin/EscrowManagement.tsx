import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const escrowAccounts = [
  { id: 'ESC-001', property: 'Villa Seminyak Luxury', buyer: 'John Doe', seller: 'PT Bali Realty', amount: 2500000000, status: 'active', phase: 'inspection', released: 0, created: '2024-01-15' },
  { id: 'ESC-002', property: 'Apartment Sudirman Tower', buyer: 'Jane Smith', seller: 'PT Jakarta Properties', amount: 1800000000, status: 'pending_release', phase: 'closing', released: 1200000000, created: '2024-01-10' },
  { id: 'ESC-003', property: 'House BSD City', buyer: 'Ahmad Reza', seller: 'PT Serpong Land', amount: 950000000, status: 'completed', phase: 'completed', released: 950000000, created: '2023-12-20' },
  { id: 'ESC-004', property: 'Condo PIK 2', buyer: 'Lisa Wang', seller: 'PT Pantai Indah', amount: 3200000000, status: 'dispute', phase: 'dispute_resolution', released: 0, created: '2024-01-08' },
  { id: 'ESC-005', property: 'Land Ubud 500sqm', buyer: 'Michael Brown', seller: 'CV Ubud Properti', amount: 1500000000, status: 'active', phase: 'document_review', released: 0, created: '2024-02-01' },
];

const monthlyVolume = [
  { month: 'Sep', volume: 12, value: 18.5 },
  { month: 'Oct', volume: 15, value: 22.3 },
  { month: 'Nov', volume: 18, value: 27.1 },
  { month: 'Dec', volume: 14, value: 21.8 },
  { month: 'Jan', volume: 22, value: 33.6 },
  { month: 'Feb', volume: 19, value: 28.9 },
];

const statusDistribution = [
  { name: 'Active', value: 12, color: 'hsl(var(--primary))' },
  { name: 'Pending Release', value: 5, color: 'hsl(var(--chart-3))' },
  { name: 'Completed', value: 28, color: 'hsl(var(--chart-4))' },
  { name: 'Disputed', value: 2, color: 'hsl(var(--destructive))' },
];

const releaseTimeline = [
  { day: 'Mon', releases: 3, amount: 4.2 },
  { day: 'Tue', releases: 5, amount: 7.1 },
  { day: 'Wed', releases: 2, amount: 2.8 },
  { day: 'Thu', releases: 4, amount: 5.5 },
  { day: 'Fri', releases: 6, amount: 9.3 },
  { day: 'Sat', releases: 1, amount: 1.2 },
  { day: 'Sun', releases: 0, amount: 0 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-primary/10 text-primary border-primary/30';
    case 'pending_release': return 'bg-chart-3/10 text-chart-3 border-chart-3/30';
    case 'completed': return 'bg-chart-4/10 text-chart-4 border-chart-4/30';
    case 'dispute': return 'bg-destructive/10 text-destructive border-destructive/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getPhaseIcon = (phase: string) => {
  switch (phase) {
    case 'inspection': return <Clock className="h-3 w-3" />;
    case 'document_review': return <Shield className="h-3 w-3" />;
    case 'closing': return <Unlock className="h-3 w-3" />;
    case 'completed': return <CheckCircle className="h-3 w-3" />;
    case 'dispute_resolution': return <AlertTriangle className="h-3 w-3" />;
    default: return <Lock className="h-3 w-3" />;
  }
};

const formatIDR = (amount: number) => `Rp ${(amount / 1000000000).toFixed(1)}B`;

const EscrowManagement = () => {
  const totalHeld = escrowAccounts.filter(a => a.status !== 'completed').reduce((s, a) => s + a.amount - a.released, 0);
  const totalReleased = escrowAccounts.reduce((s, a) => s + a.released, 0);
  const activeCount = escrowAccounts.filter(a => a.status === 'active').length;
  const disputeCount = escrowAccounts.filter(a => a.status === 'dispute').length;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Escrow Management</h2>
          <p className="text-xs text-muted-foreground">Property transaction escrow accounts and fund releases</p>
        </div>
        <Button size="sm" className="text-xs"><Lock className="h-3 w-3 mr-1" /> New Escrow</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><Lock className="h-4 w-4 text-primary" /><span className="text-[10px] text-muted-foreground">Funds Held</span></div>
          <div className="text-lg font-bold text-foreground">{formatIDR(totalHeld)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><Unlock className="h-4 w-4 text-chart-4" /><span className="text-[10px] text-muted-foreground">Released</span></div>
          <div className="text-lg font-bold text-foreground">{formatIDR(totalReleased)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-primary" /><span className="text-[10px] text-muted-foreground">Active</span></div>
          <div className="text-lg font-bold text-foreground">{activeCount}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-[10px] text-muted-foreground">Disputes</span></div>
          <div className="text-lg font-bold text-foreground">{disputeCount}</div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="h-8 bg-muted/30">
          <TabsTrigger value="accounts" className="text-xs">Escrow Accounts</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          <TabsTrigger value="releases" className="text-xs">Release Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-2 mt-3">
          {escrowAccounts.map(account => (
            <Card key={account.id} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{account.id}</span>
                      <Badge className={`text-[9px] ${getStatusColor(account.status)}`}>{account.status.replace('_', ' ')}</Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">{getPhaseIcon(account.phase)}<span className="text-[9px]">{account.phase.replace('_', ' ')}</span></div>
                    </div>
                    <p className="text-sm font-medium text-foreground">{account.property}</p>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span>Buyer: {account.buyer}</span>
                      <span>Seller: {account.seller}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-semibold text-foreground">{formatIDR(account.amount)}</span>
                      <Progress value={(account.released / account.amount) * 100} className="flex-1 h-1.5" />
                      <span className="text-[10px] text-muted-foreground">{Math.round((account.released / account.amount) * 100)}% released</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {account.status === 'pending_release' && <Button size="sm" variant="outline" className="text-[10px] h-6"><Unlock className="h-3 w-3 mr-1" />Release</Button>}
                    {account.status === 'dispute' && <Button size="sm" variant="destructive" className="text-[10px] h-6"><AlertTriangle className="h-3 w-3 mr-1" />Resolve</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Volume</CardTitle></CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyVolume}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Accounts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Status Distribution</CardTitle></CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="releases" className="mt-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Release Schedule</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={releaseTimeline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="releases" stroke="hsl(var(--primary))" strokeWidth={2} name="Releases" />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Amount (B)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EscrowManagement;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calculator, TrendingUp, MapPin, Home, BarChart3, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const recentValuations = [
  { id: 'VAL-001', property: 'Villa Canggu 3BR', location: 'Canggu, Bali', type: 'Villa', size: 250, listed: 4200000000, estimated: 3950000000, confidence: 92, status: 'completed', delta: -5.9 },
  { id: 'VAL-002', property: 'Apt Sudirman Park', location: 'Jakarta Selatan', type: 'Apartment', size: 85, listed: 1800000000, estimated: 1920000000, confidence: 88, status: 'completed', delta: 6.7 },
  { id: 'VAL-003', property: 'House BSD Serpong', location: 'Tangerang Selatan', type: 'House', size: 180, listed: 2100000000, estimated: 2050000000, confidence: 95, status: 'completed', delta: -2.4 },
  { id: 'VAL-004', property: 'Land Ubud 800sqm', location: 'Ubud, Bali', type: 'Land', size: 800, listed: 6400000000, estimated: 5800000000, confidence: 78, status: 'review', delta: -9.4 },
  { id: 'VAL-005', property: 'Townhouse PIK', location: 'Jakarta Utara', type: 'Townhouse', size: 120, listed: 3500000000, estimated: 3650000000, confidence: 85, status: 'completed', delta: 4.3 },
];

const priceIndex = [
  { month: 'Sep', jakarta: 100, bali: 100, surabaya: 100, bandung: 100 },
  { month: 'Oct', jakarta: 101.2, bali: 102.5, surabaya: 100.8, bandung: 101.1 },
  { month: 'Nov', jakarta: 102.1, bali: 104.2, surabaya: 101.2, bandung: 101.8 },
  { month: 'Dec', jakarta: 101.8, bali: 105.8, surabaya: 101.5, bandung: 102.3 },
  { month: 'Jan', jakarta: 103.2, bali: 107.1, surabaya: 102.1, bandung: 103.0 },
  { month: 'Feb', jakarta: 104.1, bali: 108.5, surabaya: 102.8, bandung: 103.5 },
];

const valuationVolume = [
  { month: 'Sep', automated: 145, manual: 23 },
  { month: 'Oct', automated: 167, manual: 28 },
  { month: 'Nov', automated: 189, manual: 31 },
  { month: 'Dec', automated: 156, manual: 25 },
  { month: 'Jan', automated: 212, manual: 35 },
  { month: 'Feb', automated: 198, manual: 32 },
];

const accuracyByType = [
  { type: 'House', accuracy: 93, count: 312 },
  { type: 'Apartment', accuracy: 91, count: 245 },
  { type: 'Villa', accuracy: 87, count: 156 },
  { type: 'Land', accuracy: 78, count: 89 },
  { type: 'Townhouse', accuracy: 90, count: 134 },
  { type: 'Commercial', accuracy: 82, count: 67 },
];

const formatIDR = (amount: number) => `Rp ${(amount / 1000000000).toFixed(1)}B`;

const PropertyValuationTool = () => {
  const totalValuations = recentValuations.length;
  const avgConfidence = (recentValuations.reduce((s, v) => s + v.confidence, 0) / totalValuations).toFixed(1);
  const overpriced = recentValuations.filter(v => v.delta < -5).length;
  const underpriced = recentValuations.filter(v => v.delta > 5).length;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Property Valuation Tool</h2>
          <p className="text-xs text-muted-foreground">AI-powered property appraisal and market value estimation</p>
        </div>
        <Button size="sm" className="text-xs"><Calculator className="h-3 w-3 mr-1" /> New Valuation</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-primary" /><span className="text-[10px] text-muted-foreground">Avg Confidence</span></div>
          <div className="text-lg font-bold text-foreground">{avgConfidence}%</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-destructive" /><span className="text-[10px] text-muted-foreground">Overpriced</span></div>
          <div className="text-lg font-bold text-foreground">{overpriced}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-chart-4" /><span className="text-[10px] text-muted-foreground">Underpriced</span></div>
          <div className="text-lg font-bold text-foreground">{underpriced}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><Home className="h-4 w-4 text-chart-3" /><span className="text-[10px] text-muted-foreground">This Month</span></div>
          <div className="text-lg font-bold text-foreground">198</div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="valuations" className="w-full">
        <TabsList className="h-8 bg-muted/30">
          <TabsTrigger value="valuations" className="text-xs">Recent Valuations</TabsTrigger>
          <TabsTrigger value="index" className="text-xs">Price Index</TabsTrigger>
          <TabsTrigger value="accuracy" className="text-xs">Accuracy</TabsTrigger>
        </TabsList>

        <TabsContent value="valuations" className="space-y-2 mt-3">
          {recentValuations.map(val => (
            <Card key={val.id} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{val.id}</span>
                      <Badge variant={val.status === 'completed' ? 'default' : 'secondary'} className="text-[9px]">{val.status}</Badge>
                      <Badge className={`text-[9px] ${val.delta < -5 ? 'bg-destructive/10 text-destructive' : val.delta > 5 ? 'bg-chart-4/10 text-chart-4' : 'bg-muted text-muted-foreground'}`}>
                        {val.delta > 0 ? '+' : ''}{val.delta}%
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{val.property}</p>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{val.location}</span>
                      <span>{val.type}</span>
                      <span>{val.size}m²</span>
                    </div>
                    <div className="flex gap-4 text-[10px] mt-1">
                      <span>Listed: <strong className="text-foreground">{formatIDR(val.listed)}</strong></span>
                      <span>Estimated: <strong className="text-primary">{formatIDR(val.estimated)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-muted-foreground">Confidence:</span>
                      <Progress value={val.confidence} className="flex-1 h-1.5" />
                      <span className={`text-[10px] font-medium ${val.confidence >= 85 ? 'text-primary' : 'text-chart-3'}`}>{val.confidence}%</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 ml-2"><RefreshCw className="h-3 w-3 mr-1" />Revalue</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="index" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Price Index by City (Base=100)</CardTitle></CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceIndex}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis domain={[98, 110]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Line type="monotone" dataKey="jakarta" stroke="hsl(var(--primary))" strokeWidth={2} name="Jakarta" />
                    <Line type="monotone" dataKey="bali" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Bali" />
                    <Line type="monotone" dataKey="surabaya" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Surabaya" />
                    <Line type="monotone" dataKey="bandung" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Bandung" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Valuation Volume</CardTitle></CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={valuationVolume}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="automated" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" name="Automated" />
                    <Area type="monotone" dataKey="manual" fill="hsl(var(--chart-3) / 0.2)" stroke="hsl(var(--chart-3))" name="Manual" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accuracy" className="mt-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Accuracy by Property Type</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accuracyByType.map(item => (
                  <div key={item.type} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-foreground w-24">{item.type}</span>
                    <Progress value={item.accuracy} className="flex-1 h-2" />
                    <span className={`text-xs font-medium w-10 text-right ${item.accuracy >= 85 ? 'text-primary' : 'text-chart-3'}`}>{item.accuracy}%</span>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">{item.count} vals</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyValuationTool;

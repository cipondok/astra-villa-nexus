import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Star, AlertTriangle, CheckCircle, Clock, Lightbulb } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const providers = [
  { name: 'PropertyGuard Pro', premium: 'Rp 4.2M/yr', coverage: 95, claimSpeed: 92, rating: 4.8, recommended: true, features: ['Full structural', 'Natural disaster', 'Liability', 'Contents'] },
  { name: 'HomeSafe Basic', premium: 'Rp 2.8M/yr', coverage: 72, claimSpeed: 78, rating: 4.2, recommended: false, features: ['Structural', 'Fire & flood', 'Basic contents'] },
  { name: 'Elite Shield Plus', premium: 'Rp 6.5M/yr', coverage: 98, claimSpeed: 95, rating: 4.9, recommended: false, features: ['Full structural', 'All natural events', 'Liability', 'Contents', 'Rental loss', 'Legal'] },
  { name: 'ValueProtect Standard', premium: 'Rp 1.9M/yr', coverage: 58, claimSpeed: 65, rating: 3.8, recommended: false, features: ['Fire & flood', 'Basic structural'] },
];

const radarData = [
  { factor: 'Fire', score: 85 }, { factor: 'Flood', score: 72 },
  { factor: 'Earthquake', score: 60 }, { factor: 'Theft', score: 45 },
  { factor: 'Liability', score: 55 }, { factor: 'Structural', score: 78 },
];

const PropertyInsuranceComparison = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Property Insurance Comparison</h2>
          <Badge variant="outline">🛡️ Protection</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Compare coverage options and find optimal protection</p>
      </motion.div>

      {/* Risk Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Risk Exposure Profile</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Coverage Recommendation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Risk Score', value: '68/100', desc: 'Moderate exposure', color: 'text-amber-500' },
                { label: 'Suggested Coverage', value: 'Comprehensive', desc: 'Based on location & value', color: 'text-primary' },
                { label: 'Renewal Due', value: '45 days', desc: 'Policy expiring soon', color: 'text-destructive' },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">Policy renewal approaching — review coverage before expiry to maintain continuous protection.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={p.recommended ? 'border-primary ring-1 ring-primary/20' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-sm text-primary font-medium">{p.premium}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.recommended && <Badge className="bg-primary/10 text-primary border-primary/20">Recommended</Badge>}
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-medium">{p.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-muted-foreground">Coverage Scope</span>
                      <span className="text-foreground font-medium">{p.coverage}%</span>
                    </div>
                    <Progress value={p.coverage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-muted-foreground">Claim Speed</span>
                      <span className="text-foreground font-medium">{p.claimSpeed}%</span>
                    </div>
                    <Progress value={p.claimSpeed} className="h-2" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.features.map(f => (
                    <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
                <Button variant={p.recommended ? 'default' : 'outline'} size="sm" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PropertyInsuranceComparison;

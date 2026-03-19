import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key, Code2, Zap, BarChart3, Activity, TrendingUp,
  Shield, Clock, Globe, FileText, Rocket, ChevronRight,
  Copy, Check, Users, Database, ArrowUpRight, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const apiModules = [
  { name: 'Opportunity Score', path: '/v1/opportunities/score', desc: 'AI-ranked property investment opportunities with confidence scores', latency: '~120ms', rateLimit: '500/min', icon: TrendingUp, status: 'stable' },
  { name: 'Market Demand Signal', path: '/v1/market/demand', desc: 'Real-time demand pressure indicators by micro-location', latency: '~85ms', rateLimit: '1000/min', icon: Activity, status: 'stable' },
  { name: 'Pricing Inefficiency', path: '/v1/pricing/inefficiency', desc: 'Detect undervalued and overpriced listings vs FMV', latency: '~200ms', rateLimit: '300/min', icon: Zap, status: 'stable' },
  { name: 'Liquidity Forecast', path: '/v1/liquidity/forecast', desc: 'Predict time-to-sell and absorption rate by segment', latency: '~150ms', rateLimit: '500/min', icon: Layers, status: 'beta' },
  { name: 'Investor Sentiment', path: '/v1/sentiment/investors', desc: 'Aggregated behavioral signals from investor activity', latency: '~95ms', rateLimit: '800/min', icon: Users, status: 'stable' },
  { name: 'Deal Activity Stream', path: '/v1/deals/stream', desc: 'Live stream of negotiation and transaction events', latency: '~60ms', rateLimit: '2000/min', icon: Globe, status: 'stable' },
];

const sampleRequest = `curl -X GET "https://api.astra.ai/v1/opportunities/score" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"location": "Jakarta South", "budget_max": 5000000000}'`;

const sampleResponse = `{
  "status": "success",
  "data": {
    "opportunities": [
      {
        "property_id": "prop_8f2k9x",
        "score": 87,
        "confidence": 0.92,
        "predicted_roi": "12.4%",
        "risk_level": "moderate",
        "signal": "strong_buy"
      }
    ],
    "meta": {
      "total": 24,
      "model_version": "v3.7.2",
      "computed_at": "2026-03-19T10:42:00Z"
    }
  }
}`;

const usageData = [32, 45, 38, 52, 61, 58, 72, 85, 78, 92, 88, 105];
const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const RealEstateIntelligenceAPIHub = () => {
  const [selectedModule, setSelectedModule] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const maxUsage = Math.max(...usageData) * 1.15;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-900 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100">
                  <Code2 className="w-4 h-4 text-blue-600" />
                </div>
                <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[9px] uppercase tracking-widest hover:bg-blue-50">
                  Developer Platform
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px] uppercase tracking-widest hover:bg-emerald-50">
                  v3.7
                </Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
                Global Property Intelligence API
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Connect applications to AI-driven real estate opportunity data</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> All Systems Operational
              </span>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] uppercase tracking-widest h-8 px-4">
                <FileText className="w-3 h-3 mr-1.5" /> Docs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* API Module Grid */}
        <section>
          <h2 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Intelligence Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {apiModules.map((m, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedModule(i)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedModule === i
                    ? 'border-blue-300 bg-blue-50/50 shadow-sm shadow-blue-100'
                    : 'border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <m.icon className={`w-4 h-4 ${selectedModule === i ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="flex items-center gap-1.5">
                    {m.status === 'beta' && (
                      <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[7px] uppercase hover:bg-amber-50">Beta</Badge>
                    )}
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[7px] hover:bg-slate-100">{m.latency}</Badge>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">{m.name}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed mb-2">{m.desc}</p>
                <code className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">{m.path}</code>
              </motion.button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoint Detail Panel */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div
              key={selectedModule}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-slate-200/60 bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">{apiModules[selectedModule].name} API</span>
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[7px] hover:bg-emerald-50">
                    {apiModules[selectedModule].status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apiModules[selectedModule].latency}</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {apiModules[selectedModule].rateLimit}</span>
                </div>
              </div>

              {/* Request */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">Sample Request</span>
                  <button onClick={() => handleCopy(sampleRequest)} className="flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-700">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-slate-700 bg-slate-50 rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {sampleRequest}
                </pre>
              </div>

              {/* Response */}
              <div className="px-4 py-3">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-medium mb-2 block">Sample Response</span>
                <pre className="text-[10px] font-mono text-slate-700 bg-slate-50 rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {sampleResponse}
                </pre>
              </div>
            </motion.div>

            {/* Integration Flow */}
            <div>
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Integration Flow</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { step: '01', title: 'Generate API Key', desc: 'Create credentials in the developer console with scoped permissions', icon: Key },
                  { step: '02', title: 'Select Module', desc: 'Choose intelligence endpoints matching your platform needs', icon: Database },
                  { step: '03', title: 'Deploy & Scale', desc: 'Integrate into partner applications with enterprise SLA support', icon: Rocket },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="relative p-4 rounded-xl border border-slate-200/60 bg-white"
                  >
                    <span className="text-[28px] font-bold text-slate-100 absolute top-3 right-3">{s.step}</span>
                    <s.icon className="w-5 h-5 text-blue-600 mb-2.5" />
                    <p className="text-sm font-semibold text-slate-900 mb-1">{s.title}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{s.desc}</p>
                    {i < 2 && <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 z-10" />}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Usage Analytics */}
            <div>
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Usage Analytics</h3>
              <div className="rounded-xl border border-slate-200/60 bg-white p-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'API Calls (30d)', value: '1.24M', trend: '+18%' },
                    { label: 'Active Integrations', value: '47', trend: '+6' },
                    { label: 'Data Consumed', value: '8.2 TB', trend: '+22%' },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <p className="text-lg font-bold text-slate-900">{s.value}</p>
                      <p className="text-[9px] text-slate-500">{s.label}</p>
                      <span className="text-[9px] text-emerald-600 font-medium">{s.trend}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[100px] flex items-end gap-1.5">
                  {usageData.map((v, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.5 + i * 0.04, duration: 0.4 }}
                      style={{ transformOrigin: 'bottom' }}
                    >
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-blue-500 to-blue-400 min-h-[4px]"
                        style={{ height: `${(v / maxUsage) * 80}px` }}
                      />
                      <span className="text-[7px] text-slate-400">{months[i]}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="rounded-xl border border-slate-200/60 bg-white p-5"
            >
              <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Platform Stats</h4>
              <div className="space-y-3">
                {[
                  { label: 'Uptime SLA', value: '99.97%' },
                  { label: 'Avg Latency', value: '118ms' },
                  { label: 'Endpoints', value: '6 Active' },
                  { label: 'Coverage', value: '38 Provinces' },
                  { label: 'Model Version', value: 'v3.7.2' },
                  { label: 'SDK Support', value: 'JS, Python, Go' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="text-slate-900 font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Enterprise Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="rounded-xl border border-blue-200/60 bg-blue-50/30 p-5"
            >
              <h4 className="text-[10px] text-blue-600 uppercase tracking-widest mb-3 font-medium">Enterprise Features</h4>
              <div className="space-y-2">
                {[
                  'Custom rate limits & dedicated endpoints',
                  'Webhook event subscriptions',
                  'White-label data intelligence feeds',
                  'SOC 2 compliant infrastructure',
                  'Dedicated integration support',
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] text-slate-600">
                    <Check className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="space-y-2.5"
            >
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] uppercase tracking-widest font-medium"
                onClick={() => toast.success('Developer API key generated')}
              >
                <Key className="w-3.5 h-3.5 mr-2" /> Generate Developer Key
              </Button>
              <Button
                variant="outline"
                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] uppercase tracking-widest"
                onClick={() => toast.success('Opening integration documentation')}
              >
                <FileText className="w-3.5 h-3.5 mr-2" /> View Integration Docs
              </Button>
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 text-[10px] uppercase tracking-widest"
                onClick={() => toast.success('Enterprise access request submitted')}
              >
                <ArrowUpRight className="w-3.5 h-3.5 mr-2" /> Activate Enterprise Access
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealEstateIntelligenceAPIHub;

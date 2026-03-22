import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  CheckCircle, XCircle, Clock, Eye, MoreHorizontal, Search,
  ChevronUp, ChevronDown, Shield, TrendingUp, AlertTriangle,
  X, ExternalLink, Filter
} from 'lucide-react';
import { AIInlineTag } from './AIInlineWidgets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VendorRow {
  id: string;
  name: string;
  category: string;
  aiScore: number;
  verified: boolean;
  listings: number;
  revenue: number;
  growthTrend: number[];
  riskLevel: 'low' | 'medium' | 'high';
  lastActive: string;
  aiTag?: { type: 'growth' | 'risk' | 'optimize' | 'revenue'; label: string };
}

/* Mini sparkline — pure CSS + divs for zero-dep performance */
const MiniSparkline = ({ data, className }: { data: number[]; className?: string }) => {
  const max = Math.max(...data, 1);
  return (
    <div className={cn("flex items-end gap-px h-4", className)}>
      {data.map((v, i) => (
        <div
          key={i}
          className="w-1 rounded-t-sm bg-chart-1/60"
          style={{ height: `${(v / max) * 100}%`, minHeight: '2px' }}
        />
      ))}
    </div>
  );
};

/* AI Score micro bar */
const AIScoreBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-1.5 w-20">
    <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          score >= 80 ? 'bg-chart-1' : score >= 50 ? 'bg-chart-3' : 'bg-destructive'
        )}
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-[9px] tabular-nums text-muted-foreground w-6 text-right">{score}</span>
  </div>
);

/* Risk indicator */
const RiskIcon = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  if (level === 'high') return <AlertTriangle className="h-3 w-3 text-destructive" />;
  if (level === 'medium') return <AlertTriangle className="h-3 w-3 text-chart-3" />;
  return <Shield className="h-3 w-3 text-chart-1" />;
};

/* Generate mock data (will be replaced by real query) */
const generateMockVendors = (): VendorRow[] => [
  { id: '1', name: 'Bali Villa Partners', category: 'Property Agent', aiScore: 92, verified: true, listings: 47, revenue: 128500000, growthTrend: [3,5,4,7,6,8,9], riskLevel: 'low', lastActive: '2m ago', aiTag: { type: 'growth', label: 'High growth potential' } },
  { id: '2', name: 'Jakarta Realty Group', category: 'Developer', aiScore: 78, verified: true, listings: 23, revenue: 87200000, growthTrend: [5,4,6,5,7,6,8], riskLevel: 'low', lastActive: '15m ago' },
  { id: '3', name: 'Seminyak Luxury Homes', category: 'Property Agent', aiScore: 85, verified: false, listings: 12, revenue: 45300000, growthTrend: [2,3,4,3,5,4,6], riskLevel: 'medium', lastActive: '1h ago', aiTag: { type: 'optimize', label: 'Price optimization' } },
  { id: '4', name: 'Ubud Heritage Estate', category: 'Property Manager', aiScore: 64, verified: true, listings: 8, revenue: 23100000, growthTrend: [4,3,2,3,2,3,4], riskLevel: 'medium', lastActive: '3h ago' },
  { id: '5', name: 'Canggu Surf Villas', category: 'Property Agent', aiScore: 88, verified: true, listings: 31, revenue: 92400000, growthTrend: [2,4,5,7,8,9,11], riskLevel: 'low', lastActive: '5m ago', aiTag: { type: 'revenue', label: 'Revenue leader' } },
  { id: '6', name: 'Nusa Dua Premium', category: 'Developer', aiScore: 71, verified: false, listings: 5, revenue: 15800000, growthTrend: [3,2,3,2,1,2,3], riskLevel: 'high', lastActive: '2d ago', aiTag: { type: 'risk', label: 'Verification overdue' } },
  { id: '7', name: 'Lombok Paradise Realty', category: 'Property Agent', aiScore: 76, verified: true, listings: 19, revenue: 56700000, growthTrend: [1,2,3,4,5,4,6], riskLevel: 'low', lastActive: '30m ago' },
  { id: '8', name: 'Surabaya Metro Homes', category: 'Property Manager', aiScore: 82, verified: true, listings: 15, revenue: 41200000, growthTrend: [3,4,5,4,6,5,7], riskLevel: 'low', lastActive: '1h ago' },
  { id: '9', name: 'Bandung Hillside Props', category: 'Property Agent', aiScore: 45, verified: false, listings: 3, revenue: 8900000, growthTrend: [2,1,1,2,1,1,2], riskLevel: 'high', lastActive: '5d ago', aiTag: { type: 'risk', label: 'Fraud flag' } },
  { id: '10', name: 'Yogya Heritage Homes', category: 'Property Manager', aiScore: 69, verified: true, listings: 11, revenue: 29800000, growthTrend: [2,3,3,4,3,4,5], riskLevel: 'medium', lastActive: '4h ago' },
  { id: '11', name: 'Bali Coastal Living', category: 'Developer', aiScore: 91, verified: true, listings: 38, revenue: 145000000, growthTrend: [4,6,7,8,9,10,12], riskLevel: 'low', lastActive: '1m ago', aiTag: { type: 'growth', label: 'Top performer' } },
  { id: '12', name: 'Medan Property Hub', category: 'Property Agent', aiScore: 58, verified: true, listings: 7, revenue: 18500000, growthTrend: [3,2,3,2,3,2,3], riskLevel: 'medium', lastActive: '6h ago' },
];

const formatRevenue = (v: number) => {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

/* ──────────────────────────────────────────
   Ultra Dense Vendor Table
   ────────────────────────────────────────── */
const EnterpriseVendorTable = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<string>('aiScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const vendors = useMemo(() => generateMockVendors(), []);

  const filtered = useMemo(() => {
    let result = vendors;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const aVal = (a as any)[sortCol];
      const bVal = (b as any)[sortCol];
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortAsc ? aVal - bVal : bVal - aVal;
      return 0;
    });
    return result;
  }, [vendors, searchQuery, sortCol, sortAsc]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(v => v.id)));
  }, [selectedIds.size, filtered]);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return null;
    return sortAsc ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />;
  };

  const previewVendor = previewId ? vendors.find(v => v.id === previewId) : null;

  return (
    <div className="relative">
      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="sticky top-0 z-20 mb-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between"
          >
            <span className="text-[10px] text-foreground font-medium tabular-nums">{selectedIds.size} selected</span>
            <div className="flex items-center gap-1.5">
              <Button size="sm" className="h-6 text-[9px] px-2">Approve All</Button>
              <Button size="sm" variant="outline" className="h-6 text-[9px] px-2">Flag</Button>
              <Button size="sm" variant="ghost" className="h-6 text-[9px] px-2" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search vendors..."
            className="h-7 text-[10px] pl-7 bg-muted/20 border-border/30"
          />
        </div>
        <Button variant="outline" size="sm" className="h-7 text-[9px] px-2 gap-1">
          <Filter className="h-2.5 w-2.5" />Filters
        </Button>
      </div>

      <div className="flex gap-3">
        {/* Table */}
        <div className={cn("flex-1 min-w-0 border border-border/30 rounded-lg overflow-hidden", previewId && "max-w-[65%]")}>
          <div className="overflow-x-auto">
            <table className="w-full admin-table-enterprise">
              <thead>
                <tr>
                  <th className="w-8">
                    <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                    <span className="flex items-center gap-1">Vendor <SortIcon col="name" /></span>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => handleSort('aiScore')}>
                    <span className="flex items-center gap-1">AI Score <SortIcon col="aiScore" /></span>
                  </th>
                  <th>Status</th>
                  <th className="cursor-pointer select-none" onClick={() => handleSort('listings')}>
                    <span className="flex items-center gap-1">Listings <SortIcon col="listings" /></span>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => handleSort('revenue')}>
                    <span className="flex items-center gap-1">Revenue <SortIcon col="revenue" /></span>
                  </th>
                  <th>Trend</th>
                  <th>Risk</th>
                  <th>Active</th>
                  <th className="w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className={cn(
                      "group cursor-pointer",
                      selectedIds.has(v.id) && "bg-primary/5",
                      previewId === v.id && "bg-muted/30"
                    )}
                    onClick={() => setPreviewId(previewId === v.id ? null : v.id)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.has(v.id)} onCheckedChange={() => toggleSelect(v.id)} className="h-3.5 w-3.5" />
                    </td>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-medium text-foreground leading-none">{v.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-muted-foreground">{v.category}</span>
                          {v.aiTag && <AIInlineTag type={v.aiTag.type} label={v.aiTag.label} />}
                        </div>
                      </div>
                    </td>
                    <td><AIScoreBar score={v.aiScore} /></td>
                    <td>
                      {v.verified ? (
                        <Badge variant="default" className="text-[8px] h-4 px-1.5 gap-0.5 bg-chart-1/15 text-chart-1 border-chart-1/20">
                          <CheckCircle className="h-2.5 w-2.5" />Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[8px] h-4 px-1.5 gap-0.5">
                          <Clock className="h-2.5 w-2.5" />Pending
                        </Badge>
                      )}
                    </td>
                    <td className="text-[11px] tabular-nums text-foreground">{v.listings}</td>
                    <td className="text-[11px] tabular-nums text-foreground">{formatRevenue(v.revenue)}</td>
                    <td><MiniSparkline data={v.growthTrend} /></td>
                    <td><RiskIcon level={v.riskLevel} /></td>
                    <td className="text-[10px] text-muted-foreground">{v.lastActive}</td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted" aria-label="View vendor">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted" aria-label="More actions">
                          <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Preview Panel */}
        <AnimatePresence>
          {previewVendor && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.15 }}
              className="w-[280px] shrink-0 border border-border/30 rounded-lg bg-card p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground">{previewVendor.name}</h3>
                <button onClick={() => setPreviewId(null)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted" aria-label="Close preview">
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-2">
                <PreviewRow label="Category" value={previewVendor.category} />
                <PreviewRow label="AI Trust Score" value={`${previewVendor.aiScore}/100`} />
                <PreviewRow label="Active Listings" value={String(previewVendor.listings)} />
                <PreviewRow label="Revenue" value={formatRevenue(previewVendor.revenue)} />
                <PreviewRow label="Risk Level" value={previewVendor.riskLevel} />
                <PreviewRow label="Last Active" value={previewVendor.lastActive} />
              </div>
              {previewVendor.aiTag && (
                <div className="pt-2 border-t border-border/20">
                  <AIInlineTag type={previewVendor.aiTag.type} label={previewVendor.aiTag.label} />
                </div>
              )}
              <div className="flex gap-1.5 pt-1">
                <Button size="sm" className="h-6 text-[9px] flex-1">View Full Profile</Button>
                <Button size="sm" variant="outline" className="h-6 text-[9px] gap-1 px-2">
                  <ExternalLink className="h-2.5 w-2.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PreviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-[9px] text-muted-foreground">{label}</span>
    <span className="text-[10px] font-medium text-foreground capitalize">{value}</span>
  </div>
);

export default EnterpriseVendorTable;

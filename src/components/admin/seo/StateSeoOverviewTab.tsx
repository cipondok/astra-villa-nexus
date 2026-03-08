import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, MapPin, Lock, ShieldCheck, Shield, AlertTriangle, Zap } from 'lucide-react';
import SeoStateSummaryCards from './SeoStateSummaryCards';
import ProvinceRow, { type ProvinceData } from './ProvinceRow';

interface StateSeoOverviewTabProps {
  stateSeoOverview: ProvinceData[];
  stateOverviewLoading: boolean;
  selectedStates: Set<string>;
  setSelectedStates: React.Dispatch<React.SetStateAction<Set<string>>>;
  autoFixThreshold: number;
  setAutoFixThreshold: React.Dispatch<React.SetStateAction<number>>;
  showAutoFixConfirm: boolean;
  setShowAutoFixConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  autoOptimize: { mutate: (args: { threshold: number; limit: number; state?: string }) => void; isPending: boolean };
  filterState: string;
  setFilterState: (state: string) => void;
  setActiveTab: (tab: string) => void;
}

const StateSeoOverviewTab = ({
  stateSeoOverview,
  stateOverviewLoading,
  selectedStates,
  setSelectedStates,
  autoFixThreshold,
  setAutoFixThreshold,
  showAutoFixConfirm,
  setShowAutoFixConfirm,
  autoOptimize,
  filterState,
  setFilterState,
  setActiveTab,
}: StateSeoOverviewTabProps) => {

  const handleToggleSelect = useCallback((state: string, checked: boolean) => {
    setSelectedStates(prev => {
      const next = new Set(prev);
      checked ? next.add(state) : next.delete(state);
      return next;
    });
  }, [setSelectedStates]);

  const handleClickProvince = useCallback((state: string) => {
    setFilterState(state);
    setActiveTab('dashboard');
  }, [setFilterState, setActiveTab]);

  const handleQuickFix = useCallback((state: string) => {
    autoOptimize.mutate({ threshold: autoFixThreshold, limit: 20, state });
  }, [autoOptimize, autoFixThreshold]);

  const handleSelectAllWeak = useCallback(() => {
    const weakStates = stateSeoOverview
      .filter(s => s.status === 'poor' || s.status === 'needs-work')
      .map(s => s.state);
    setSelectedStates(new Set(weakStates));
  }, [stateSeoOverview, setSelectedStates]);

  const handleConfirmFix = useCallback(() => {
    Array.from(selectedStates).forEach(state => {
      autoOptimize.mutate({ threshold: autoFixThreshold, limit: 20, state });
    });
    setShowAutoFixConfirm(false);
  }, [selectedStates, autoOptimize, autoFixThreshold, setShowAutoFixConfirm]);

  return (
    <div className="space-y-3">
      {/* AI Auto-Fix Controls */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">AI Auto-Fix SEO</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {selectedStates.size} states selected
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="h-7 rounded-md border border-input bg-background px-2 text-xs"
                value={autoFixThreshold}
                onChange={(e) => setAutoFixThreshold(Number(e.target.value))}
              >
                <option value={50}>Score &lt; 50 (Poor)</option>
                <option value={60}>Score &lt; 60</option>
                <option value={70}>Score &lt; 70 (Recommended)</option>
                <option value={80}>Score &lt; 80</option>
              </select>
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5"
                disabled={selectedStates.size === 0 || autoOptimize.isPending}
                onClick={() => setShowAutoFixConfirm(true)}
              >
                <Lock className="h-3 w-3" />
                AI Auto-Fix Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleSelectAllWeak}
              >
                Select All Weak
              </Button>
              {selectedStates.size > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedStates(new Set())}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {!stateOverviewLoading && stateSeoOverview.length > 0 && (
        <SeoStateSummaryCards overview={stateSeoOverview} />
      )}

      {/* State Table */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            All 38 Provinces — SEO Progress & Rankings
          </CardTitle>
          <CardDescription className="text-[10px]">Select states for AI auto-fix · Click province to filter</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {stateOverviewLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-1.5">
              {stateSeoOverview.map((s, idx) => (
                <ProvinceRow
                  key={s.state}
                  data={s}
                  rank={idx + 1}
                  isSelected={selectedStates.has(s.state)}
                  isFilterActive={filterState === s.state}
                  onToggleSelect={handleToggleSelect}
                  onClickProvince={handleClickProvince}
                  onQuickFix={handleQuickFix}
                  isFixDisabled={autoOptimize.isPending}
                />
              ))}
              <p className="text-[10px] text-muted-foreground mt-2">
                Total: {stateSeoOverview.length} provinces · {selectedStates.size} selected for auto-fix
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Confirmation Dialog */}
      <AlertDialog open={showAutoFixConfirm} onOpenChange={setShowAutoFixConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Confirm AI Auto-Fix SEO
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This will run AI-powered SEO optimization on properties in <strong>{selectedStates.size} selected state(s)</strong> with scores below <strong>{autoFixThreshold}</strong>.</p>
                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium text-foreground">Selected States:</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(selectedStates).map(s => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-chart-4">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>AI will modify SEO titles, descriptions, and keywords for properties below the threshold. Changes are applied directly.</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="gap-1.5" onClick={handleConfirmFix}>
              <ShieldCheck className="h-4 w-4" />
              Confirm & Run AI Fix
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StateSeoOverviewTab;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search, Download, Edit, Copy, Trash2, CheckCircle } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  version: string;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
  usageCount: number;
  variables: string[];
}

const templates: Template[] = [
  { id: '1', name: 'Sale & Purchase Agreement (AJB)', category: 'sale', language: 'ID/EN', version: '3.2', lastUpdated: '2026-02-15', status: 'active', usageCount: 245, variables: ['buyer_name', 'seller_name', 'property_address', 'price', 'notary'] },
  { id: '2', name: 'Rental Agreement (Sewa)', category: 'rental', language: 'ID/EN', version: '2.8', lastUpdated: '2026-02-10', status: 'active', usageCount: 412, variables: ['tenant_name', 'landlord_name', 'duration', 'monthly_rent'] },
  { id: '3', name: 'Power of Attorney (Surat Kuasa)', category: 'legal', language: 'ID', version: '1.5', lastUpdated: '2026-01-28', status: 'active', usageCount: 89, variables: ['grantor', 'grantee', 'scope', 'notary'] },
  { id: '4', name: 'Booking Fee Receipt', category: 'sale', language: 'ID/EN', version: '2.1', lastUpdated: '2026-02-20', status: 'active', usageCount: 367, variables: ['buyer_name', 'unit', 'amount', 'date'] },
  { id: '5', name: 'Property Handover (BAST)', category: 'sale', language: 'ID/EN', version: '1.9', lastUpdated: '2026-01-15', status: 'active', usageCount: 156, variables: ['buyer', 'developer', 'unit_no', 'condition'] },
  { id: '6', name: 'Land Certificate Transfer (SHM)', category: 'legal', language: 'ID', version: '1.0', lastUpdated: '2025-12-01', status: 'draft', usageCount: 0, variables: ['owner', 'certificate_no', 'location', 'area'] },
  { id: '7', name: 'Agency Agreement (Exclusive)', category: 'agency', language: 'ID/EN', version: '2.3', lastUpdated: '2026-02-05', status: 'active', usageCount: 78, variables: ['agent', 'owner', 'property', 'commission_rate', 'duration'] },
  { id: '8', name: 'Mortgage Pre-Approval Letter', category: 'mortgage', language: 'EN', version: '1.2', lastUpdated: '2025-11-20', status: 'archived', usageCount: 34, variables: ['applicant', 'bank', 'max_amount', 'rate'] },
];

const ContractTemplateManager = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.category === filter;
    return matchSearch && matchFilter;
  });

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-primary/20 text-primary';
    if (s === 'draft') return 'bg-secondary/20 text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Contract Template Manager
          </h2>
          <p className="text-xs text-muted-foreground">Indonesian property legal documents with variable substitution</p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1"><Plus className="h-3 w-3" /> New Template</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Templates', value: templates.length },
          { label: 'Active', value: templates.filter(t => t.status === 'active').length },
          { label: 'Total Uses', value: templates.reduce((s, t) => s + t.usageCount, 0) },
          { label: 'Categories', value: [...new Set(templates.map(t => t.category))].length },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-[10px]">All</TabsTrigger>
            <TabsTrigger value="sale" className="text-[10px]">Sale</TabsTrigger>
            <TabsTrigger value="rental" className="text-[10px]">Rental</TabsTrigger>
            <TabsTrigger value="legal" className="text-[10px]">Legal</TabsTrigger>
            <TabsTrigger value="agency" className="text-[10px]">Agency</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Template List */}
      <div className="space-y-2">
        {filtered.map(template => (
          <Card key={template.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground">{template.name}</p>
                    <Badge className={`${statusColor(template.status)} text-[9px]`}>{template.status}</Badge>
                    <Badge variant="outline" className="text-[9px]">v{template.version}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">📂 {template.category}</span>
                    <span className="text-[10px] text-muted-foreground">🌐 {template.language}</span>
                    <span className="text-[10px] text-muted-foreground">📊 {template.usageCount} uses</span>
                    <span className="text-[10px] text-muted-foreground">Updated {template.lastUpdated}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {template.variables.slice(0, 4).map(v => (
                      <Badge key={v} variant="outline" className="text-[8px] px-1.5 py-0">{`{{${v}}}`}</Badge>
                    ))}
                    {template.variables.length > 4 && <Badge variant="outline" className="text-[8px] px-1.5 py-0">+{template.variables.length - 4}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContractTemplateManager;

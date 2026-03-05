import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Database, Download, FileJson, FileText, RefreshCw, HardDrive, Check } from "lucide-react";
import { format } from "date-fns";

const EXPORTABLE_TABLES = [
  { name: "properties", label: "Properties", category: "Core" },
  { name: "profiles", label: "User Profiles", category: "Core" },
  { name: "transactions", label: "Transactions", category: "Finance" },
  { name: "affiliate_commissions", label: "Affiliate Commissions", category: "Finance" },
  { name: "affiliates", label: "Affiliates", category: "Finance" },
  { name: "activity_logs", label: "Activity Logs", category: "System" },
  { name: "admin_alerts", label: "Admin Alerts", category: "System" },
  { name: "ai_chat_logs", label: "AI Chat Logs", category: "AI" },
  { name: "ai_behavior_tracking", label: "AI Behavior Tracking", category: "AI" },
  { name: "vendor_services", label: "Vendor Services", category: "Vendors" },
  { name: "user_sessions", label: "User Sessions", category: "System" },
  { name: "contact_submissions", label: "Contact Submissions", category: "Support" },
  { name: "property_inquiries", label: "Property Inquiries", category: "Core" },
  { name: "bookings", label: "Bookings", category: "Core" },
  { name: "saved_properties", label: "Saved Properties", category: "Core" },
  { name: "reviews", label: "Reviews", category: "Core" },
] as const;

type TableName = typeof EXPORTABLE_TABLES[number]["name"];

const DataBackupExport = () => {
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("csv");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedFiles, setExportedFiles] = useState<string[]>([]);

  const { data: tableCounts, isLoading } = useQuery({
    queryKey: ["backup-table-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        EXPORTABLE_TABLES.map(async (t) => {
          try {
            const { count, error } = await supabase
              .from(t.name as any)
              .select("*", { count: "exact", head: true });
            counts[t.name] = error ? 0 : (count || 0);
          } catch {
            counts[t.name] = 0;
          }
        })
      );
      return counts;
    },
  });

  const toggleTable = (name: string) => {
    const next = new Set(selectedTables);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelectedTables(next);
  };

  const selectAll = () => {
    if (selectedTables.size === EXPORTABLE_TABLES.length) {
      setSelectedTables(new Set());
    } else {
      setSelectedTables(new Set(EXPORTABLE_TABLES.map((t) => t.name)));
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = async () => {
    if (selectedTables.size === 0) {
      toast.warning("Select at least one table to export");
      return;
    }

    setExporting(true);
    setProgress(0);
    setExportedFiles([]);
    const tables = Array.from(selectedTables);
    const dateStr = format(new Date(), "yyyy-MM-dd_HHmmss");
    const files: string[] = [];

    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i];
      setProgress(Math.round(((i) / tables.length) * 100));

      try {
        // Fetch all data (paginated for large tables)
        let allData: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(tableName as any)
            .select("*")
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .order("created_at" as any, { ascending: false });

          if (error) throw error;
          allData = [...allData, ...(data || [])];
          hasMore = (data?.length || 0) === pageSize;
          page++;
        }

        const filename = `${tableName}_${dateStr}.${exportFormat}`;

        if (exportFormat === "json") {
          downloadFile(JSON.stringify(allData, null, 2), filename, "application/json");
        } else {
          // CSV
          if (allData.length === 0) {
            downloadFile("No data", filename, "text/csv");
          } else {
            const headers = Object.keys(allData[0]);
            const csvRows = [
              headers.join(","),
              ...allData.map((row) =>
                headers
                  .map((h) => {
                    const val = row[h];
                    if (val === null || val === undefined) return "";
                    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
                    return `"${str.replace(/"/g, '""')}"`;
                  })
                  .join(",")
              ),
            ];
            downloadFile(csvRows.join("\n"), filename, "text/csv");
          }
        }

        files.push(`${filename} (${allData.length} rows)`);
      } catch (err) {
        console.error(`Export error for ${tableName}:`, err);
        files.push(`${tableName} — FAILED`);
      }
    }

    setProgress(100);
    setExportedFiles(files);
    setExporting(false);
    toast.success(`Exported ${files.length} table(s)`);
  };

  const categories = [...new Set(EXPORTABLE_TABLES.map((t) => t.category))];
  const totalSelected = selectedTables.size;
  const totalRows = Array.from(selectedTables).reduce((sum, t) => sum + ((tableCounts || {})[t] || 0), 0);

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Data Backup & Export</h2>
        </div>
        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={(v: "json" | "csv") => setExportFormat(v)}>
            <SelectTrigger className="w-28 h-9 text-sm">
              {exportFormat === "json" ? <FileJson className="h-3.5 w-3.5 mr-1" /> : <FileText className="h-3.5 w-3.5 mr-1" />}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={exportData} disabled={exporting || totalSelected === 0}>
            <Download className="h-3.5 w-3.5 mr-1" />
            {exporting ? "Exporting..." : `Export ${totalSelected} table(s)`}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Selected Tables</p>
            <p className="text-lg font-bold text-foreground">{totalSelected} / {EXPORTABLE_TABLES.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Estimated Rows</p>
            <p className="text-lg font-bold text-foreground">{totalRows.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Format</p>
            <p className="text-lg font-bold text-foreground uppercase">{exportFormat}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {exporting && (
        <Card className="border-border/40">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-foreground">Exporting data...</p>
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Export results */}
      {exportedFiles.length > 0 && !exporting && (
        <Card className="border-border/40 border-emerald-500/30">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" /> Export Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1">
              {exportedFiles.map((f, i) => (
                <p key={i} className="text-xs text-muted-foreground">✓ {f}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table selection */}
      <Card className="border-border/40">
        <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Select Tables</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>
            {selectedTables.size === EXPORTABLE_TABLES.length ? "Deselect All" : "Select All"}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {categories.map((category) => {
              const tables = EXPORTABLE_TABLES.filter((t) => t.category === category);
              return (
                <div key={category}>
                  <div className="px-4 py-1.5 bg-muted/30 border-y border-border/20">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{category}</span>
                  </div>
                  {tables.map((table) => (
                    <div
                      key={table.name}
                      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors cursor-pointer ${
                        selectedTables.has(table.name) ? "bg-primary/5" : ""
                      }`}
                      onClick={() => toggleTable(table.name)}
                    >
                      <Checkbox checked={selectedTables.has(table.name)} onCheckedChange={() => toggleTable(table.name)} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{table.label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{table.name}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {isLoading ? "..." : ((tableCounts || {})[table.name] || 0).toLocaleString()} rows
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataBackupExport;

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildMetaDescription, buildSeoTitle, cleanPlace, propertyPath, seoCompleteness, type PropertySeoInput } from "@/lib/propertySeo";
import { usePropertyRankings } from "@/hooks/usePropertyRankings";

type Row = PropertySeoInput & { status: string | null };

/** Listing-level SEO health: completeness, duplicates, thin content and missing photos. */
export function ListingSeoHealthTab() {
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");
  const [status, setStatus] = useState("active");

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin-listing-seo-health", status],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Row[]> => {
      let q = supabase
        .from("properties")
        .select("id, slug, title, description, price, city, area, state, property_type, listing_type, bedrooms, bathrooms, area_sqm, land_area_sqm, images, image_urls, status")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (status !== "all") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as Row[];
    },
  });
  const { data: top = [] } = usePropertyRankings("popular", 10);

  const cities = useMemo(() => Array.from(new Set(rows.map((r) => cleanPlace(r.city)).filter(Boolean))).sort(), [rows]);
  const types = useMemo(() => Array.from(new Set(rows.map((r) => r.property_type || "").filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(
    () => rows.filter((r) => (type === "all" || r.property_type === type) && (city === "all" || cleanPlace(r.city) === city)),
    [rows, type, city],
  );

  const report = useMemo(() => {
    const titleCount = new Map<string, number>();
    const descCount = new Map<string, number>();
    const analysed = filtered.map((r) => {
      const t = buildSeoTitle(r).toLowerCase();
      const d = buildMetaDescription(r).toLowerCase();
      titleCount.set(t, (titleCount.get(t) || 0) + 1);
      descCount.set(d, (descCount.get(d) || 0) + 1);
      return { row: r, t, d, ...seoCompleteness(r) };
    });
    const withDupes = analysed.map((a) => ({
      ...a,
      dupTitle: (titleCount.get(a.t) || 0) > 1,
      dupDesc: (descCount.get(a.d) || 0) > 1,
    }));
    const n = withDupes.length || 1;
    const failing = (key: string) => withDupes.filter((a) => !a.checks.find((c) => c.key === key)?.passed).length;
    return {
      list: withDupes.sort((a, b) => a.score - b.score),
      avg: Math.round(withDupes.reduce((s, a) => s + a.score, 0) / n),
      dupTitles: withDupes.filter((a) => a.dupTitle).length,
      dupDescs: withDupes.filter((a) => a.dupDesc).length,
      thin: failing("description"),
      fewPhotos: failing("images"),
      noSlug: failing("slug"),
      noLocation: failing("location"),
    };
  }, [filtered]);

  const stat = (label: string, value: number | string, warn = false) => (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${warn ? "text-destructive" : "text-foreground"}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-3">
      <Card className="border-border/40">
        <CardContent className="p-3 flex items-start gap-2 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
          <span>
            Everything below is <strong className="text-foreground">measured from your own listings and visitor activity</strong>.
            Google clicks, impressions, average position and indexing status are not shown because Google Search Console is not connected yet —
            no estimates are filled in for them.
          </span>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="all">All statuses</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <p className="text-xs text-destructive flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Couldn't load listings.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {stat("Listings checked", isLoading ? "…" : filtered.length)}
            {stat("Avg. SEO score", isLoading ? "…" : `${report.avg}/100`)}
            {stat("Duplicate titles", report.dupTitles, report.dupTitles > 0)}
            {stat("Duplicate descriptions", report.dupDescs, report.dupDescs > 0)}
            {stat("Thin descriptions", report.thin, report.thin > 0)}
            {stat("Under 5 photos", report.fewPhotos, report.fewPhotos > 0)}
            {stat("No area", report.noLocation, report.noLocation > 0)}
            {stat("No readable link", report.noSlug, report.noSlug > 0)}
          </div>

          <Card className="border-border/40">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-xs">Listings needing the most work</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] h-8">Listing</TableHead>
                    <TableHead className="text-[10px] h-8 w-[120px]">Score</TableHead>
                    <TableHead className="text-[10px] h-8">Missing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.list.slice(0, 25).map((a) => (
                    <TableRow key={a.row.id}>
                      <TableCell className="text-[11px] py-2 max-w-[260px]">
                        <a href={propertyPath(a.row)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary truncate max-w-full">
                          <span className="truncate">{a.row.title}</span><ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2"><Progress value={a.score} className="h-1.5 w-16" /><span className="text-[10px]">{a.score}</span></div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {a.checks.filter((c) => !c.passed).map((c) => <Badge key={c.key} variant="outline" className="text-[10px] px-1.5 py-0">{c.label}</Badge>)}
                          {a.dupTitle && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Duplicate title</Badge>}
                          {a.dupDesc && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Duplicate description</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-xs">Top listings by real engagement (30 days)</CardTitle></CardHeader>
            <CardContent className="p-3 pt-1">
              {top.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">No recorded views, saves, shares or inquiries yet.</p>
              ) : (
                <ul className="space-y-1">
                  {top.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 text-[11px] border-b border-border/30 pb-1">
                      <a href={propertyPath(p)} target="_blank" rel="noreferrer" className="truncate hover:text-primary">{p.title}</a>
                      <span className="shrink-0 text-muted-foreground">{p.unique_views} views · {p.saves} saves · {p.shares} shares · {p.inquiries} inquiries</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default ListingSeoHealthTab;

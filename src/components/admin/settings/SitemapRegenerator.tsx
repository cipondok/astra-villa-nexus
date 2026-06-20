import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  regenerateAllSitemaps,
  verifyPublishedSitemap,
  SITEMAP_BASE_URL,
  type GeneratedSitemaps,
  type SitemapVerification,
} from "@/lib/sitemapGenerator";

const PUBLISHED_URLS = [
  `${SITEMAP_BASE_URL}/sitemap.xml`,
  `${SITEMAP_BASE_URL}/sitemap-en.xml`,
  `${SITEMAP_BASE_URL}/sitemap-id.xml`,
];

function downloadXml(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SitemapRegenerator() {
  const { toast } = useToast();
  const [generated, setGenerated] = useState<GeneratedSitemaps | null>(null);
  const [verifications, setVerifications] = useState<SitemapVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const result = regenerateAllSitemaps();
      setGenerated(result);
      toast({
        title: "Sitemap regenerated",
        description: `${result.routeCount} routes × 2 languages. Download the files below or replace the static ones in /public.`,
      });
    } catch (e) {
      toast({
        title: "Regeneration failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const results = await Promise.all(
        PUBLISHED_URLS.map((u) => verifyPublishedSitemap(u)),
      );
      setVerifications(results);
      const failed = results.filter((r) => !r.ok);
      toast({
        title:
          failed.length === 0
            ? "Sitemaps verified"
            : `${failed.length} sitemap(s) failed`,
        description:
          failed.length === 0
            ? `All ${results.length} sitemaps reachable.`
            : failed.map((f) => `${f.url} → ${f.status || f.error}`).join("\n"),
        variant: failed.length === 0 ? "default" : "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-primary" />
            Sitemap Regeneration
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerify}
              disabled={verifying}
              className="h-8 gap-1.5 text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {verifying ? "Verifying..." : "Verify Published"}
            </Button>
            <Button
              size="sm"
              onClick={handleRegenerate}
              disabled={loading}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Generating..." : "Regenerate"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <p className="text-xs text-muted-foreground">
          Rebuilds the sitemap index plus per-language sitemaps (
          <code className="text-[10px]">sitemap-en.xml</code>,{" "}
          <code className="text-[10px]">sitemap-id.xml</code>) from the current
          public route list. Download to replace the static files in{" "}
          <code className="text-[10px]">/public</code>.
        </p>

        {verifications.length > 0 && (
          <div className="space-y-1 rounded-md border border-border/50 p-2">
            <p className="text-[11px] font-medium text-muted-foreground">
              Verification
            </p>
            {verifications.map((v) => (
              <div
                key={v.url}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  {v.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                  >
                    {v.url.replace(SITEMAP_BASE_URL, "")}
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {v.urlCount !== undefined && (
                    <Badge variant="outline" className="h-5 text-[10px]">
                      {v.urlCount} entries
                    </Badge>
                  )}
                  <Badge
                    variant={v.ok ? "secondary" : "destructive"}
                    className="h-5 text-[10px]"
                  >
                    {v.status || "ERR"}
                  </Badge>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {generated && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                Generated {new Date(generated.generatedAt).toLocaleString()} ·{" "}
                {generated.routeCount} routes
              </span>
            </div>
            <Tabs defaultValue="index" className="w-full">
              <TabsList className="h-8">
                <TabsTrigger value="index" className="h-7 text-xs">
                  sitemap.xml
                </TabsTrigger>
                <TabsTrigger value="en" className="h-7 text-xs">
                  sitemap-en.xml
                </TabsTrigger>
                <TabsTrigger value="id" className="h-7 text-xs">
                  sitemap-id.xml
                </TabsTrigger>
              </TabsList>
              {(
                [
                  ["index", "sitemap.xml", generated.index],
                  ["en", "sitemap-en.xml", generated.en],
                  ["id", "sitemap-id.xml", generated.id],
                ] as const
              ).map(([key, filename, xml]) => (
                <TabsContent key={key} value={key} className="mt-2 space-y-2">
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadXml(filename, xml)}
                      className="h-7 gap-1.5 text-xs"
                    >
                      <Download className="h-3 w-3" />
                      Download {filename}
                    </Button>
                  </div>
                  <pre className="max-h-72 overflow-auto rounded-md bg-muted/40 p-2 text-[10px] leading-relaxed">
                    <code>{xml}</code>
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

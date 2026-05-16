import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, ShieldAlert, ShieldCheck, Search, AlertTriangle, Eye, Loader2 } from "lucide-react";
import { useFraudDetector, FlaggedListing } from "@/hooks/useFraudDetector";
import { useNavigate } from "react-router-dom";

const severityColor: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-muted text-muted-foreground",
};

const scoreColor = (score: number) => {
  if (score >= 70) return "text-destructive";
  if (score >= 40) return "text-orange-500";
  return "text-yellow-600";
};

const FraudDetectorPage = () => {
  const [city, setCity] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { mutate, data, isPending } = useFraudDetector();
  const navigate = useNavigate();

  const handleScan = () => mutate(city || undefined);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-destructive/10">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Anomaly & Fraud Detector</h1>
            <p className="text-muted-foreground text-sm">
              Scan listings for unrealistic pricing, duplicates, missing data & suspicious content
            </p>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by city (optional)..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleScan} disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {isPending ? "Scanning..." : "Run Scan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">{data.total_scanned}</p>
                  <p className="text-xs text-muted-foreground">Scanned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{data.summary.critical}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">{data.summary.high}</p>
                  <p className="text-xs text-muted-foreground">High Risk</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">{data.summary.low}</p>
                  <p className="text-xs text-muted-foreground">Low Risk</p>
                </CardContent>
              </Card>
            </div>

            {/* Flag Type Distribution */}
            {Object.keys(data.summary.flag_types).length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Flag Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.summary.flag_types)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <Badge key={type} variant="outline" className="gap-1">
                          {type.replace(/_/g, ' ')} <span className="font-bold">{count}</span>
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Flagged Listings */}
            {data.flagged.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">All Clear</p>
                  <p className="text-sm text-muted-foreground">No anomalies detected in {data.total_scanned} listings</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {data.flagged.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className={`w-4 h-4 shrink-0 ${scoreColor(item.fraud_score)}`} />
                              <p className="font-medium text-sm truncate">{item.title}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{item.city}</span>
                              <span>•</span>
                              <span>Rp {item.price.toLocaleString('id-ID')}</span>
                              <span>•</span>
                              <span>{item.flags.length} flags</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${scoreColor(item.fraud_score)}`}>
                              {item.fraud_score}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/property/${item.id}`);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {expanded === item.id && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            {item.flags.map((flag, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <Badge className={`text-[10px] shrink-0 ${severityColor[flag.severity]}`}>
                                  {flag.severity}
                                </Badge>
                                <p className="text-xs text-muted-foreground">{flag.detail}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}

        {!data && !isPending && (
          <Card>
            <CardContent className="py-16 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-medium mb-1">Ready to Scan</h3>
              <p className="text-sm text-muted-foreground">
                Click "Run Scan" to analyze listings for anomalies and potential fraud
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FraudDetectorPage;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle2, XCircle, Loader2, Sparkles, FileText, MapPin, User, Calendar, Building, Hash, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDocumentVerifier, DocumentVerifyResult } from "@/hooks/useDocumentVerifier";
import { useToast } from "@/hooks/use-toast";

const DOC_TYPES = [
  { value: "shm" as const, label: "SHM (Sertifikat Hak Milik)", desc: "Hak kepemilikan penuh" },
  { value: "shgb" as const, label: "SHGB (Sertifikat Hak Guna Bangunan)", desc: "Hak guna bangunan" },
  { value: "ajb" as const, label: "AJB (Akta Jual Beli)", desc: "Akta transaksi jual beli" },
  { value: "imb" as const, label: "IMB / PBG (Izin Mendirikan Bangunan)", desc: "Perizinan bangunan" },
  { value: "pbb" as const, label: "PBB (Pajak Bumi & Bangunan)", desc: "Bukti pembayaran pajak" },
  { value: "other" as const, label: "Dokumen Lainnya", desc: "Surat keterangan, dll" },
];

function StatusIcon({ status }: { status: string }) {
  if (status === "verified") return <ShieldCheck className="h-8 w-8 text-green-500" />;
  if (status === "suspicious") return <ShieldAlert className="h-8 w-8 text-yellow-500" />;
  if (status === "needs_review") return <AlertTriangle className="h-8 w-8 text-orange-500" />;
  return <ShieldX className="h-8 w-8 text-destructive" />;
}

function statusLabel(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    verified: { label: "Terverifikasi", color: "bg-green-500/10 text-green-600 border-green-500/20" },
    suspicious: { label: "Mencurigakan", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    needs_review: { label: "Perlu Review", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    invalid: { label: "Tidak Valid", color: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  return map[status] || map.invalid;
}

function FindingIcon({ status }: { status: "pass" | "warning" | "fail" }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
  return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
}

export default function AIDocumentVerifierPage() {
  const [docType, setDocType] = useState<"shm" | "shgb" | "ajb" | "imb" | "pbb" | "other">("shm");
  const [docText, setDocText] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [result, setResult] = useState<DocumentVerifyResult | null>(null);

  const mutation = useDocumentVerifier();
  const { toast } = useToast();

  const handleVerify = () => {
    if (!docText.trim()) {
      toast({ title: "Teks dokumen wajib diisi", description: "Salin atau ketik isi dokumen untuk diverifikasi.", variant: "destructive" });
      return;
    }
    mutation.mutate(
      {
        document_type: docType,
        document_text: docText,
        owner_name: ownerName || undefined,
        property_address: address || undefined,
        document_number: docNumber || undefined,
      },
      {
        onSuccess: (data) => setResult(data),
        onError: (err) => toast({ title: "AI Error", description: (err as Error).message, variant: "destructive" }),
      }
    );
  };

  const st = result ? statusLabel(result.verification_status) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              <FileCheck className="h-4 w-4" />
              AI Document Verifier
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Verifikasi Dokumen Properti dengan <span className="text-primary">AI</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Analisis keaslian SHM, SHGB, AJB, dan dokumen properti lainnya — deteksi potensi pemalsuan dan ketidaksesuaian secara instan.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Input Dokumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Jenis Dokumen</label>
                  <Select value={docType} onValueChange={(v) => setDocType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nomor Dokumen (opsional)</label>
                  <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="12345/2024" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nama Pemilik (opsional)</label>
                  <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Nama sesuai dokumen" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Alamat Properti (opsional)</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat lengkap properti" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Isi Dokumen / Teks yang Diekstrak *</label>
                <Textarea
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  placeholder="Salin dan tempel seluruh isi dokumen di sini. Semakin lengkap teks yang diberikan, semakin akurat hasil verifikasi AI..."
                  rows={8}
                  className="resize-y font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">Tip: Gunakan fitur OCR/scan untuk mengekstrak teks dari foto dokumen, lalu tempel di sini.</p>
              </div>
              <Button onClick={handleVerify} disabled={mutation.isPending} size="lg" className="w-full md:w-auto">
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Memverifikasi...</>
                ) : (
                  <><ShieldCheck className="h-4 w-4 mr-2" /> Verifikasi Dokumen</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && st && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Status Header */}
              <Card className={`border-2 ${st.color.includes("green") ? "border-green-500/30" : st.color.includes("yellow") ? "border-yellow-500/30" : st.color.includes("orange") ? "border-orange-500/30" : "border-destructive/30"}`}>
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <StatusIcon status={result.verification_status} />
                    <div className="flex-1 text-center md:text-left space-y-2">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <h2 className="text-xl font-bold text-foreground">{st.label}</h2>
                        <Badge className={st.color}>{result.document_type_detected}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <Progress value={result.confidence_score} className="h-2 max-w-xs" />
                        <span className="text-sm font-semibold text-foreground">{result.confidence_score}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Findings */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Hasil Pemeriksaan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.findings?.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <FindingIcon status={f.status} />
                          <div>
                            <p className="text-sm font-medium text-foreground">{f.category}</p>
                            <p className="text-xs text-muted-foreground">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Extracted Data */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Data Terekstrak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { icon: Hash, label: "No. Dokumen", value: result.extracted_data?.document_number },
                        { icon: User, label: "Nama Pemilik", value: result.extracted_data?.owner_name },
                        { icon: MapPin, label: "Alamat", value: result.extracted_data?.property_address },
                        { icon: Calendar, label: "Tanggal Terbit", value: result.extracted_data?.issue_date },
                        { icon: Calendar, label: "Tanggal Kadaluarsa", value: result.extracted_data?.expiry_date },
                        { icon: Building, label: "Luas Tanah", value: result.extracted_data?.land_area },
                        { icon: Building, label: "Luas Bangunan", value: result.extracted_data?.building_area },
                        { icon: Info, label: "Instansi Penerbit", value: result.extracted_data?.issuing_authority },
                      ].filter(item => item.value).map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className="flex items-start gap-2.5">
                            <Icon className="h-4 w-4 mt-0.5 text-primary/60 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">{item.label}</p>
                              <p className="text-sm font-medium text-foreground">{item.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Authenticity Indicators */}
              {result.authenticity_indicators?.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Indikator Keaslian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.authenticity_indicators.map((ind, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${ind.present ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20"}`}>
                          {ind.present ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{ind.indicator}</p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{ind.importance}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Factors */}
                {result.risk_factors?.length > 0 && (
                  <Card className="border-destructive/20">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Faktor Risiko
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.risk_factors.map((r, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <XCircle className="h-3.5 w-3.5 mt-0.5 text-destructive/60 flex-shrink-0" /> {r}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Rekomendasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations?.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary/60 flex-shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Legal Notes */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Catatan Hukum
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.legal_notes?.map((n, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Info className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/60 flex-shrink-0" /> {n}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Disclaimer */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">
                  ⚠️ Hasil verifikasi AI bersifat <strong>indikatif</strong> dan bukan pengganti verifikasi resmi oleh BPN, notaris, atau PPAT. Selalu lakukan pengecekan fisik dan legal due diligence sebelum transaksi.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

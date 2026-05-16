import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2, AlertTriangle, Scale, Download, Copy, Plus, X } from "lucide-react";
import { useDocumentGenerator, DocumentGenerateInput, DocumentGenerateResult } from "@/hooks/useDocumentGenerator";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const DOCUMENT_TYPES = [
  { value: "lease_agreement", label: "Lease Agreement (Perjanjian Sewa)" },
  { value: "sale_contract", label: "Sale Contract (AJB / PPJB)" },
  { value: "handover_report", label: "Handover Report (BAST)" },
  { value: "power_of_attorney", label: "Power of Attorney (Surat Kuasa)" },
  { value: "rental_receipt", label: "Rental Receipt (Kwitansi Sewa)" },
];

export default function AIDocumentGeneratorPage() {
  const { mutate, isPending, data: result } = useDocumentGenerator();

  const [form, setForm] = useState<DocumentGenerateInput>({
    document_type: "lease_agreement",
    property_title: "",
    property_address: "",
    property_type: "house",
    property_price: undefined,
    seller_name: "",
    buyer_name: "",
    tenant_name: "",
    landlord_name: "",
    lease_start_date: "",
    lease_end_date: "",
    monthly_rent: undefined,
    deposit_amount: undefined,
    payment_terms: "",
    additional_clauses: [],
    language: "Indonesian",
  });

  const [newClause, setNewClause] = useState("");

  const update = (key: keyof DocumentGenerateInput, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addClause = () => {
    if (!newClause.trim()) return;
    update("additional_clauses", [...(form.additional_clauses || []), newClause.trim()]);
    setNewClause("");
  };

  const removeClause = (i: number) => {
    update("additional_clauses", (form.additional_clauses || []).filter((_, idx) => idx !== i));
  };

  const handleGenerate = () => {
    if (!form.document_type) {
      toast.error("Please select a document type");
      return;
    }
    mutate(form, {
      onError: (err) => toast.error(err.message || "Failed to generate document"),
      onSuccess: () => toast.success("Document generated successfully!"),
    });
  };

  const isLease = form.document_type === "lease_agreement" || form.document_type === "rental_receipt";
  const isSale = form.document_type === "sale_contract" || form.document_type === "power_of_attorney";

  const copyToClipboard = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      toast.success("Document copied to clipboard");
    }
  };

  const downloadAsText = () => {
    if (!result?.content) return;
    const blob = new Blob([result.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title?.replace(/\s+/g, "_") || "document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Document Generator</h1>
          <p className="text-muted-foreground">Generate professional Indonesian property legal documents with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Document Type</Label>
                <Select value={form.document_type} onValueChange={(v: any) => update("document_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((dt) => (
                      <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Language</Label>
                <Select value={form.language || "Indonesian"} onValueChange={(v) => update("language", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indonesian">Indonesian (Bahasa)</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Bilingual">Bilingual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label>Property Title</Label>
                <Input placeholder="e.g., Villa Sunset Bali" value={form.property_title} onChange={(e) => update("property_title", e.target.value)} />
              </div>
              <div>
                <Label>Property Address</Label>
                <Input placeholder="Jl. Raya Seminyak No. 10, Bali" value={form.property_address} onChange={(e) => update("property_address", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Property Type</Label>
                  <Select value={form.property_type || "house"} onValueChange={(v) => update("property_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price (IDR)</Label>
                  <Input type="number" placeholder="1000000000" value={form.property_price || ""} onChange={(e) => update("property_price", Number(e.target.value) || undefined)} />
                </div>
              </div>

              <Separator />

              {isSale && (
                <>
                  <div>
                    <Label>Seller Name</Label>
                    <Input value={form.seller_name} onChange={(e) => update("seller_name", e.target.value)} />
                  </div>
                  <div>
                    <Label>Buyer Name</Label>
                    <Input value={form.buyer_name} onChange={(e) => update("buyer_name", e.target.value)} />
                  </div>
                </>
              )}

              {isLease && (
                <>
                  <div>
                    <Label>Landlord Name</Label>
                    <Input value={form.landlord_name} onChange={(e) => update("landlord_name", e.target.value)} />
                  </div>
                  <div>
                    <Label>Tenant Name</Label>
                    <Input value={form.tenant_name} onChange={(e) => update("tenant_name", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Lease Start</Label>
                      <Input type="date" value={form.lease_start_date} onChange={(e) => update("lease_start_date", e.target.value)} />
                    </div>
                    <div>
                      <Label>Lease End</Label>
                      <Input type="date" value={form.lease_end_date} onChange={(e) => update("lease_end_date", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Monthly Rent (IDR)</Label>
                      <Input type="number" value={form.monthly_rent || ""} onChange={(e) => update("monthly_rent", Number(e.target.value) || undefined)} />
                    </div>
                    <div>
                      <Label>Deposit (IDR)</Label>
                      <Input type="number" value={form.deposit_amount || ""} onChange={(e) => update("deposit_amount", Number(e.target.value) || undefined)} />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label>Payment Terms</Label>
                <Textarea placeholder="e.g., Monthly bank transfer to BCA account..." value={form.payment_terms} onChange={(e) => update("payment_terms", e.target.value)} />
              </div>

              <div>
                <Label>Additional Clauses</Label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="Add custom clause..." value={newClause} onChange={(e) => setNewClause(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addClause()} />
                  <Button variant="outline" size="icon" onClick={addClause}><Plus className="h-4 w-4" /></Button>
                </div>
                {(form.additional_clauses || []).map((clause, i) => (
                  <div key={i} className="flex items-center gap-2 mt-2 text-sm">
                    <Badge variant="secondary" className="flex-1 justify-start font-normal">{clause}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeClause(i)}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>

              <Button onClick={handleGenerate} disabled={isPending} className="w-full mt-4" size="lg">
                {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><FileText className="h-4 w-4 mr-2" />Generate Document</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Ref: {result.document_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" />Copy</Button>
                    <Button variant="outline" size="sm" onClick={downloadAsText}><Download className="h-4 w-4 mr-1" />Download</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{result.summary}</p>

                  {result.key_terms.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Key Terms</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {result.key_terms.map((kt, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">{kt.term}</p>
                            <p className="text-sm font-medium">{kt.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{result.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              {(result.warnings.length > 0 || result.applicable_laws.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.warnings.length > 0 && (
                    <Card className="border-destructive/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />Legal Warnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {result.warnings.map((w, i) => (
                            <li key={i} className="text-xs text-muted-foreground">• {w}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  {result.applicable_laws.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Scale className="h-4 w-4 text-primary" />Applicable Laws
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {result.applicable_laws.map((law, i) => (
                            <li key={i} className="text-xs text-muted-foreground">• {law}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-3">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground">Fill in the details and click Generate to create your document</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

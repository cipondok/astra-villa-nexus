import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MapPin, Sparkles, Copy, CheckCircle2, Tag, TrendingUp, Search, Loader2 } from 'lucide-react';
import { useSeoLandingContent, SeoLandingContentResult } from '@/hooks/useSeoLandingContent';
import { toast } from 'sonner';

const SeoLandingContentGenerator = () => {
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [result, setResult] = useState<SeoLandingContentResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { mutateAsync, isPending } = useSeoLandingContent();

  const handleGenerate = async () => {
    if (!province || !city || !district || !village) {
      toast.error('Semua field lokasi harus diisi');
      return;
    }
    try {
      const data = await mutateAsync({ province, city, district, village });
      setResult(data);
      toast.success('Konten SEO berhasil dibuat!');
    } catch (e: any) {
      toast.error(e?.message || 'Gagal membuat konten SEO');
    }
  };

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Disalin ke clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 shrink-0"
      onClick={() => copyText(text, field)}
    >
      {copiedField === field ? (
        <CheckCircle2 className="h-3 w-3 text-chart-3" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </Button>
  );

  const KeywordBadges = ({ keywords, label, color }: { keywords: string[]; label: string; color: string }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Tag className={`h-3 w-3 ${color}`} />
        <span className="text-[10px] font-semibold text-foreground">{label}</span>
        <Badge variant="outline" className="text-[8px] h-4 px-1">{keywords.length}</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {keywords.map((kw, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="text-[9px] px-1.5 py-0.5 cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => copyText(kw, `kw-${label}-${i}`)}
          >
            {kw}
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Location Input */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Generator Konten SEO Landing Page
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-3">
          <p className="text-[10px] text-muted-foreground">
            Masukkan data lokasi untuk generate konten SEO + 25 keyword high-intent dalam Bahasa Indonesia.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Provinsi</Label>
              <Input
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="DKI Jakarta"
                className="h-7 text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Kota / Kabupaten</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta Selatan"
                className="h-7 text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Kecamatan</Label>
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Kebayoran Baru"
                className="h-7 text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Kelurahan / Desa</Label>
              <Input
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Senayan"
                className="h-7 text-[11px]"
              />
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isPending || !province || !city || !district || !village}
            className="w-full h-8 text-[11px] gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate Konten SEO & Keywords
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* SEO Title & Meta */}
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-chart-3">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-chart-3" />
                SEO Title & Meta Description
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">SEO Title</Label>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[8px] h-4 px-1">
                      {result.seo_title.length} chars
                    </Badge>
                    <CopyButton text={result.seo_title} field="seo_title" />
                  </div>
                </div>
                <div className="p-2 rounded-md bg-muted/40 border border-border/30 text-[11px] text-foreground font-medium">
                  {result.seo_title}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Meta Description</Label>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[8px] h-4 px-1">
                      {result.meta_description.length} chars
                    </Badge>
                    <CopyButton text={result.meta_description} field="meta_desc" />
                  </div>
                </div>
                <div className="p-2 rounded-md bg-muted/40 border border-border/30 text-[10px] text-muted-foreground">
                  {result.meta_description}
                </div>
              </div>

              {/* Google Preview */}
              <div className="space-y-1 pt-1">
                <Label className="text-[10px] text-muted-foreground">Google Preview</Label>
                <div className="p-2.5 rounded-md bg-background border border-border/40 space-y-0.5">
                  <div className="text-[11px] text-primary font-medium leading-snug truncate">
                    {result.seo_title}
                  </div>
                  <div className="text-[9px] text-chart-3">
                    astra-villa-realty.lovable.app › properti › {village.toLowerCase().replace(/\s+/g, '-')}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                    {result.meta_description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intro Content */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Konten Intro Landing Page
                </span>
                <CopyButton text={result.intro_content} field="intro" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <ScrollArea className="h-[200px]">
                <div className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap pr-3">
                  {result.intro_content}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[8px] h-4 px-1">
                  {result.intro_content.split(/\s+/).length} kata
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Investment Insight */}
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-chart-4">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-chart-4" />
                  Investment Insight
                </span>
                <CopyButton text={result.investment_insight} field="invest" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="text-[11px] text-foreground leading-relaxed">
                {result.investment_insight}
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-primary" />
                25 High-Intent SEO Keywords
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <KeywordBadges keywords={result.primary_keywords} label="Primary Keywords (Beli/Sewa)" color="text-primary" />
              <Separator className="bg-border/30" />
              <KeywordBadges keywords={result.secondary_keywords} label="Secondary Keywords (Investasi)" color="text-chart-4" />
              <Separator className="bg-border/30" />
              <KeywordBadges keywords={result.long_tail_keywords} label="Long-Tail Keywords" color="text-chart-3" />
              <Separator className="bg-border/30" />
              <KeywordBadges keywords={result.urgent_buyer_keywords} label="Urgent Buyer Keywords" color="text-destructive" />

              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] gap-1.5 w-full"
                  onClick={() => {
                    const all = [
                      ...result.primary_keywords,
                      ...result.secondary_keywords,
                      ...result.long_tail_keywords,
                      ...result.urgent_buyer_keywords,
                    ].join(', ');
                    copyText(all, 'all-kw');
                  }}
                >
                  <Copy className="h-3 w-3" />
                  Copy Semua Keywords
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SeoLandingContentGenerator;

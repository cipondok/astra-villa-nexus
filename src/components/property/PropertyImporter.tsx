import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, CheckCircle2, AlertCircle, Home, MapPin, Bed, Bath, Square, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExtractedProperty {
  title: string;
  property_type: string;
  listing_type: string;
  price: string;
  currency: string;
  location: {
    full_address: string;
    city: string;
    province: string;
    country: string;
  };
  specifications: {
    bedrooms: number | null;
    bathrooms: number | null;
    building_size_m2: number | null;
    land_size_m2: number | null;
    floors: number | null;
    carports: number | null;
  };
  features: string[];
  description: string;
  images: string[];
  source: {
    url: string;
    website: string;
  };
}

interface PropertyImporterProps {
  onImport?: (property: ExtractedProperty) => void;
}

const PropertyImporter = ({ onImport }: PropertyImporterProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedProperty | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = {
    en: {
      title: "Import Property from URL",
      description: "Paste a property listing URL from other websites to import it automatically",
      placeholder: "https://www.rumah123.com/properti/...",
      import: "Import",
      importing: "Extracting...",
      preview: "Extracted Property Preview",
      useThis: "Use This Data",
      tryAgain: "Try Another URL",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      buildingSize: "Building",
      landSize: "Land",
      features: "Features",
      source: "Source",
      supportedSites: "Supported sites: Rumah123, OLX, Lamudi, 99.co, and more",
      noImages: "No images found",
      success: "Property data extracted successfully!",
      importSuccess: "Property imported! You can now edit the details.",
    },
    id: {
      title: "Impor Properti dari URL",
      description: "Tempel URL iklan properti dari website lain untuk mengimpor secara otomatis",
      placeholder: "https://www.rumah123.com/properti/...",
      import: "Impor",
      importing: "Mengekstrak...",
      preview: "Pratinjau Properti",
      useThis: "Gunakan Data Ini",
      tryAgain: "Coba URL Lain",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      buildingSize: "Luas Bangunan",
      landSize: "Luas Tanah",
      features: "Fasilitas",
      source: "Sumber",
      supportedSites: "Website yang didukung: Rumah123, OLX, Lamudi, 99.co, dan lainnya",
      noImages: "Tidak ada gambar",
      success: "Data properti berhasil diekstrak!",
      importSuccess: "Properti berhasil diimpor! Anda dapat mengedit detailnya.",
    }
  }[language];

  const handleExtract = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('scrape-property-url', {
        body: { url: url.trim() }
      });

      if (fnError) throw fnError;

      if (data?.success && data?.data) {
        setExtractedData(data.data);
        toast({
          title: "✓",
          description: t.success,
        });
      } else {
        throw new Error(data?.error || "Failed to extract property data");
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.message || "Failed to import property");
      toast({
        title: "Error",
        description: err.message || "Failed to import property",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseData = () => {
    if (extractedData && onImport) {
      onImport(extractedData);
      toast({
        title: "✓",
        description: t.importSuccess,
      });
    }
  };

  const formatPrice = (price: string, currency: string) => {
    const num = parseInt(price.replace(/\D/g, ''));
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleExtract} disabled={isLoading || !url.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.importing}
              </>
            ) : (
              t.import
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">{t.supportedSites}</p>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Extracted Data Preview */}
        {extractedData && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {t.preview}
              </h4>
              <div className="flex gap-2">
                <Badge variant="outline">{extractedData.property_type}</Badge>
                <Badge variant={extractedData.listing_type === 'sale' ? 'default' : 'secondary'}>
                  {extractedData.listing_type === 'sale' ? 'Dijual' : 'Disewa'}
                </Badge>
              </div>
            </div>

            {/* Images */}
            {extractedData.images && extractedData.images.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {extractedData.images.slice(0, 5).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Property ${idx + 1}`}
                    className="h-20 w-28 object-cover rounded border flex-shrink-0"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ))}
                {extractedData.images.length > 5 && (
                  <div className="h-20 w-28 bg-muted rounded border flex items-center justify-center text-sm text-muted-foreground flex-shrink-0">
                    +{extractedData.images.length - 5}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noImages}</p>
            )}

            {/* Title & Price */}
            <div>
              <h5 className="font-medium text-lg">{extractedData.title || "Untitled Property"}</h5>
              <p className="text-xl font-bold text-primary">
                {formatPrice(extractedData.price, extractedData.currency)}
              </p>
            </div>

            {/* Location */}
            {extractedData.location?.full_address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{extractedData.location.full_address}</span>
              </div>
            )}

            {/* Specs */}
            <div className="flex flex-wrap gap-4 text-sm">
              {extractedData.specifications?.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span>{extractedData.specifications.bedrooms} {t.bedrooms}</span>
                </div>
              )}
              {extractedData.specifications?.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <span>{extractedData.specifications.bathrooms} {t.bathrooms}</span>
                </div>
              )}
              {extractedData.specifications?.building_size_m2 && (
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{extractedData.specifications.building_size_m2} m² {t.buildingSize}</span>
                </div>
              )}
              {extractedData.specifications?.land_size_m2 && (
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span>{extractedData.specifications.land_size_m2} m² {t.landSize}</span>
                </div>
              )}
            </div>

            {/* Features */}
            {extractedData.features && extractedData.features.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">{t.features}:</p>
                <div className="flex flex-wrap gap-1">
                  {extractedData.features.slice(0, 8).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {extractedData.features.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{extractedData.features.length - 8}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Source */}
            {extractedData.source?.url && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <span>{t.source}:</span>
                <a 
                  href={extractedData.source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline text-primary"
                >
                  {extractedData.source.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleUseData} className="flex-1">
                {t.useThis}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setExtractedData(null);
                  setUrl("");
                }}
              >
                {t.tryAgain}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyImporter;

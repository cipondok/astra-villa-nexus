import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Bed, Bath, Maximize, CheckCircle2, Eye, Box, Sparkles, Heart, TrendingUp, Star } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import OpportunityScoreRing from "../OpportunityScoreRing";
import DemandHeatLabel from "../DemandHeatLabel";
import { formatCurrency } from "@/lib/utils";

interface ReviewStepProps {
  formData: {
    virtual_tour_url?: string;
    three_d_model_url?: string;
    [key: string]: any;
  };
  features: any;
}

const ReviewStep = ({ formData, features }: ReviewStepProps) => {
  const { language } = useTranslation();

  const t = {
    en: {
      pageTitle: "Review Your Listing",
      subtitle: "Preview how your property will appear to investors",
      basicInfo: "Basic Information",
      titleLabel: "Title:",
      propertyType: "Property Type:",
      listingType: "Listing Type:",
      pricingDetails: "Pricing & Details",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      location: "Location",
      locationNotSet: "Location not set",
      features: "Features",
      images: "Images",
      imagesUploaded: "image(s) uploaded",
      description: "Description",
      note: "Note:",
      noteText: "Your property will be submitted for admin approval. You'll be notified once it's reviewed and published.",
      notSet: "Not set",
      previewTitle: "Card Preview",
      previewSubtitle: "How investors will see your listing",
      aiScore: "AI Opportunity Score",
      aiScoreDesc: "Score will be calculated after submission based on market data",
    },
    id: {
      pageTitle: "Tinjau Listing Anda",
      subtitle: "Preview tampilan properti Anda untuk investor",
      basicInfo: "Informasi Dasar",
      titleLabel: "Judul:",
      propertyType: "Tipe Properti:",
      listingType: "Tipe Listing:",
      pricingDetails: "Harga & Detail",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      location: "Lokasi",
      locationNotSet: "Lokasi belum diatur",
      features: "Fitur",
      images: "Gambar",
      imagesUploaded: "gambar diunggah",
      description: "Deskripsi",
      note: "Catatan:",
      noteText: "Properti Anda akan dikirimkan untuk persetujuan admin. Anda akan diberitahu setelah ditinjau dan dipublikasikan.",
      notSet: "Belum diatur",
      previewTitle: "Preview Kartu",
      previewSubtitle: "Tampilan listing Anda untuk investor",
      aiScore: "AI Opportunity Score",
      aiScoreDesc: "Skor akan dihitung setelah pengiriman berdasarkan data pasar",
    }
  }[language];

  const price = formData.price ? parseFloat(formData.price) : 0;
  const imageUrl = formData.images?.[0] || '/placeholder.svg';

  const activeFeatures = Object.entries(features)
    .filter(([_, value]) => value)
    .map(([key, _]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

  // Estimate a preliminary score based on listing completeness
  const completenessScore = (() => {
    let score = 0;
    if (formData.title) score += 15;
    if (formData.description && formData.description.length > 50) score += 15;
    if (formData.price) score += 15;
    if (formData.property_type) score += 10;
    if (formData.location) score += 10;
    if (formData.images?.length >= 3) score += 15;
    else if (formData.images?.length > 0) score += 8;
    if (formData.bedrooms) score += 5;
    if (formData.bathrooms) score += 5;
    if (formData.area_sqm) score += 5;
    if (activeFeatures.length >= 3) score += 5;
    return Math.min(score, 100);
  })();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t.pageTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* AI Score Preview */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <OpportunityScoreRing score={completenessScore} size={56} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {t.aiScore}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{t.aiScoreDesc}</p>
              <div className="flex gap-1.5 mt-2">
                {completenessScore >= 85 && (
                  <Badge className="text-[9px] px-1.5 py-0 bg-chart-2/15 text-chart-2 border-chart-2/20" variant="outline">
                    <Star className="h-2.5 w-2.5 mr-0.5" /> Elite Potential
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                  Completeness: {completenessScore}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Card Preview */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-muted-foreground" />
          {t.previewTitle}
        </h4>
        <p className="text-xs text-muted-foreground mb-3">{t.previewSubtitle}</p>

        <div className="max-w-sm mx-auto">
          <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-sm">
            {/* Image */}
            <div className="relative h-40 bg-muted overflow-hidden">
              {formData.images?.length > 0 ? (
                <img src={imageUrl} alt={formData.title} className="w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
              <Badge className={`absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-lg font-semibold shadow-sm ${
                formData.listing_type === 'sale' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
              }`}>
                {formData.listing_type === 'sale' ? 'Dijual' : formData.listing_type === 'rent' ? 'Disewa' : formData.listing_type || 'N/A'}
              </Badge>
              <div className="absolute top-2.5 right-2.5">
                <OpportunityScoreRing score={completenessScore} size={42} />
              </div>
              <button className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center">
                <Heart className="h-4 w-4 text-foreground/70" />
              </button>
              <div className="absolute bottom-3 left-3">
                <p className="text-base font-black text-white drop-shadow-md">
                  {price > 0 ? formatCurrency(price) : 'Harga TBD'}
                </p>
              </div>
            </div>
            {/* Content */}
            <div className="p-3.5">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1.5">
                {formData.title || 'Judul Properti'}
              </h3>
              <div className="flex items-center text-muted-foreground mb-3">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-primary/60" />
                <span className="text-xs line-clamp-1">{formData.location || 'Lokasi belum diatur'}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {formData.bedrooms && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Bed className="h-3 w-3" /> {formData.bedrooms}
                  </span>
                )}
                {formData.bathrooms && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Bath className="h-3 w-3" /> {formData.bathrooms}
                  </span>
                )}
                {formData.area_sqm && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Maximize className="h-3 w-3" /> {formData.area_sqm}m²
                  </span>
                )}
                <DemandHeatLabel score={null} compact />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Summary */}
      <Card className="rounded-2xl border-border/40">
        <CardContent className="p-4 sm:p-5 space-y-5">
          {/* Basic Info */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-primary" />
              {t.basicInfo}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t.titleLabel}</span><span className="font-medium text-right max-w-[60%] truncate">{formData.title || t.notSet}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.propertyType}</span><Badge variant="secondary" className="text-xs">{formData.property_type || t.notSet}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.listingType}</span><Badge variant="outline" className="text-xs">{formData.listing_type || t.notSet}</Badge></div>
            </div>
          </div>

          {/* Price & Details */}
          <div className="border-t border-border/30 pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              {t.pricingDetails}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>{price > 0 ? formatCurrency(price) : t.notSet}</span></div>
              <div className="flex items-center gap-2"><Maximize className="h-4 w-4 text-muted-foreground" /><span>{formData.area_sqm || 0} m²</span></div>
              <div className="flex items-center gap-2"><Bed className="h-4 w-4 text-muted-foreground" /><span>{formData.bedrooms || 0} {t.bedrooms}</span></div>
              <div className="flex items-center gap-2"><Bath className="h-4 w-4 text-muted-foreground" /><span>{formData.bathrooms || 0} {t.bathrooms}</span></div>
            </div>
          </div>

          {/* Location */}
          <div className="border-t border-border/30 pt-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              {t.location}
            </h4>
            <p className="text-sm">{formData.location || t.locationNotSet}</p>
            {formData.state && <p className="text-sm text-muted-foreground mt-0.5">{formData.area}, {formData.city}, {formData.state}</p>}
          </div>

          {/* Features */}
          {activeFeatures.length > 0 && (
            <div className="border-t border-border/30 pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                {t.features}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeFeatures.map(f => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
              </div>
            </div>
          )}

          {/* Images */}
          <div className="border-t border-border/30 pt-4">
            <h4 className="font-semibold mb-2 text-sm">{t.images}</h4>
            {formData.images?.length > 0 ? (
              <div className="grid grid-cols-4 gap-1.5">
                {formData.images.slice(0, 8).map((url: string, i: number) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {formData.images.length > 8 && (
                  <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">+{formData.images.length - 8}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">0 {t.imagesUploaded}</p>
            )}
          </div>

          {/* 3D */}
          {(formData.virtual_tour_url || formData.three_d_model_url) && (
            <div className="border-t border-border/30 pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" /> 3D Experience
              </h4>
              <div className="space-y-1.5">
                {formData.virtual_tour_url && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
                    <Eye className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Virtual Tour</span>
                    <Badge variant="outline" className="ml-auto text-xs">Added</Badge>
                  </div>
                )}
                {formData.three_d_model_url && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-chart-4/5 border border-chart-4/20">
                    <Box className="h-4 w-4 text-chart-4" /><span className="text-sm font-medium">3D Model</span>
                    <Badge variant="outline" className="ml-auto text-xs">Added</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {formData.description && (
            <div className="border-t border-border/30 pt-4">
              <h4 className="font-semibold mb-2 text-sm">{t.description}</h4>
              <p className="text-sm text-muted-foreground line-clamp-4">{formData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-sm">
          <strong>{t.note}</strong> {t.noteText}
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;

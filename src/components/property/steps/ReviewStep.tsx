import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Bed, Bath, Maximize, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewStepProps {
  formData: any;
  features: any;
}

const ReviewStep = ({ formData, features }: ReviewStepProps) => {
  const { language } = useLanguage();

  const t = {
    en: {
      pageTitle: "Review Your Listing",
      subtitle: "Please review all information before submitting",
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
    },
    id: {
      pageTitle: "Tinjau Listing Anda",
      subtitle: "Silakan tinjau semua informasi sebelum mengirimkan",
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
    }
  }[language];
  const formatPrice = (price: string) => {
    if (!price) return 'Not set';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const activeFeatures = Object.entries(features)
    .filter(([_, value]) => value)
    .map(([key, _]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t.pageTitle}</h3>
        <p className="text-sm text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t.basicInfo}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.titleLabel}</span>
                <span className="font-medium">{formData.title || t.notSet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.propertyType}</span>
                <Badge variant="secondary">{formData.property_type || t.notSet}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.listingType}</span>
                <Badge variant="outline">{formData.listing_type || t.notSet}</Badge>
              </div>
            </div>
          </div>

          {/* Price & Details */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t.pricingDetails}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatPrice(formData.price)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-muted-foreground" />
                <span>{formData.area_sqm || 0} m²</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>{formData.bedrooms || 0} {t.bedrooms}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span>{formData.bathrooms || 0} {t.bathrooms}</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t.location}
            </h4>
            <p className="text-sm">
              {formData.location || t.locationNotSet}
            </p>
            {formData.state && (
              <p className="text-sm text-muted-foreground mt-1">
                {formData.area}, {formData.city}, {formData.state}
              </p>
            )}
          </div>

          {/* Features */}
          {activeFeatures.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {t.features}
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeFeatures.map((feature) => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">{t.images}</h4>
            <p className="text-sm text-muted-foreground">
              {formData.images?.length || 0} {t.imagesUploaded}
            </p>
          </div>

          {/* Description */}
          {formData.description && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">{t.description}</h4>
              <p className="text-sm text-muted-foreground line-clamp-4">
                {formData.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
        <p className="text-sm">
          <strong>{t.note}</strong> {t.noteText}
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;

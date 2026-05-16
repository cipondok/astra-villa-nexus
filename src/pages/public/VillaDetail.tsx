import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useVilla } from "@/features/villas/useVillas";
import VillaGallery from "@/features/villas/VillaGallery";
import ContactForm from "@/features/leads/ContactForm";
import { formatIDR, formatNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Bath, MapPin, Maximize, Trees, MessageCircle } from "lucide-react";
import { useT } from "@/i18n/LangProvider";
import { buildWhatsAppUrl, defaultInquiryMessage } from "@/lib/whatsapp";
import { SITE } from "@/config/site";

export default function VillaDetail() {
  const { slug } = useParams();
  const { t } = useT();
  const { data: villa, isLoading } = useVilla(slug);

  if (isLoading) {
    return <div className="container-prose py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!villa) {
    return (
      <div className="container-prose py-20 text-center">
        <h1 className="font-serif text-2xl">Villa not found</h1>
        <Button asChild variant="outline" className="mt-4"><Link to="/villas">Back to villas</Link></Button>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": villa.listing_type === "sale" ? "SingleFamilyResidence" : "LodgingBusiness",
    name: villa.title,
    description: villa.description,
    image: villa.cover_image ? [villa.cover_image] : villa.images,
    address: { "@type": "PostalAddress", addressLocality: villa.city, streetAddress: villa.address },
    numberOfBedrooms: villa.bedrooms,
    numberOfBathroomsTotal: villa.bathrooms,
    floorSize: { "@type": "QuantitativeValue", value: villa.building_sqm, unitCode: "MTK" },
  };

  const inquiryMessage = `Halo ASTRA Villa, saya tertarik dengan villa "${villa.title}" di ${villa.city} (${formatIDR(villa.price_idr)}). Mohon info lebih lanjut.`;

  return (
    <>
      <SEO
        title={villa.title}
        description={`${villa.title} di ${villa.city}. ${villa.bedrooms} kamar tidur, ${villa.bathrooms} kamar mandi. ${formatIDR(villa.price_idr)}.`}
        path={`/villas/${villa.slug}`}
        type="article"
        image={villa.cover_image ?? villa.images[0]}
        jsonLd={jsonLd}
      />

      <article className="container-prose py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge>{villa.listing_type === "sale" ? t("common.forSale") : t("common.forRent")}</Badge>
                {villa.featured && <Badge variant="secondary">{t("common.featured")}</Badge>}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold">{villa.title}</h1>
              <div className="flex items-center gap-1 text-muted-foreground mt-2">
                <MapPin className="h-4 w-4" /> {villa.address ? `${villa.address}, ` : ""}{villa.city}
              </div>
            </div>

            <VillaGallery images={villa.cover_image ? [villa.cover_image, ...villa.images.filter(i => i !== villa.cover_image)] : villa.images} title={villa.title} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 border border-border rounded-xl bg-card">
              <Stat icon={<Bed className="h-5 w-5" />} label={t("common.bedrooms")} value={villa.bedrooms} />
              <Stat icon={<Bath className="h-5 w-5" />} label={t("common.bathrooms")} value={villa.bathrooms} />
              <Stat icon={<Maximize className="h-5 w-5" />} label={t("common.buildingArea")} value={`${formatNumber(villa.building_sqm)} m²`} />
              <Stat icon={<Trees className="h-5 w-5" />} label={t("common.landArea")} value={`${formatNumber(villa.land_sqm)} m²`} />
            </div>

            {villa.description && (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-foreground/90 leading-relaxed">{villa.description}</p>
              </div>
            )}
          </div>

          {/* Sticky inquiry */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4 p-6 border border-border rounded-2xl bg-card shadow-sm">
              <div className="text-3xl font-semibold text-primary">{formatIDR(villa.price_idr)}</div>
              <div>
                <h2 className="font-serif text-lg font-semibold">{t("detail.inquireTitle")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("detail.inquireSubtitle")}</p>
              </div>
              <Button asChild className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white">
                <a href={buildWhatsAppUrl(inquiryMessage)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp: +{SITE.whatsappNumber}
                </a>
              </Button>
              <div className="border-t border-border pt-4">
                <ContactForm propertyId={villa.id} defaultMessage={inquiryMessage} source="website" />
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-primary">{icon}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

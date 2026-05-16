import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { useT } from "@/i18n/LangProvider";
import { useVillas } from "@/features/villas/useVillas";
import VillaCard from "@/features/villas/VillaCard";
import { buildWhatsAppUrl, defaultInquiryMessage } from "@/lib/whatsapp";
import { SITE } from "@/config/site";

export default function Home() {
  const { t } = useT();
  const { data: featured = [], isLoading } = useVillas({ featured: true });
  const display = featured.slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };

  return (
    <>
      <SEO path="/" jsonLd={jsonLd} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-foreground/5 via-background to-primary/5 border-b border-border">
        <div className="container-prose py-20 md:py-28 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl mx-auto">
            {t("home.hero.title")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/villas">{t("home.hero.ctaBrowse")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={buildWhatsAppUrl(defaultInquiryMessage())} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> {t("home.hero.ctaWhatsApp")}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-prose py-16">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-semibold">{t("home.featured.title")}</h2>
          <p className="text-muted-foreground mt-1">{t("home.featured.subtitle")}</p>
        </div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : display.length === 0 ? (
          <p className="text-muted-foreground">No featured villas yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {display.map((v) => <VillaCard key={v.id} villa={v} />)}
          </div>
        )}
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link to="/villas">{t("home.hero.ctaBrowse")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}

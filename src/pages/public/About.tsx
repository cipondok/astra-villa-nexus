import SEO from "@/components/SEO";
import { useT } from "@/i18n/LangProvider";

export default function About() {
  const { t } = useT();
  return (
    <>
      <SEO title={t("about.title")} path="/about" />
      <section className="container-prose py-16 max-w-3xl">
        <h1 className="font-serif text-4xl font-semibold">{t("about.title")}</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("about.body")}</p>
      </section>
    </>
  );
}

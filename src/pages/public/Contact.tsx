import SEO from "@/components/SEO";
import ContactForm from "@/features/leads/ContactForm";
import { useT } from "@/i18n/LangProvider";

export default function Contact() {
  const { t } = useT();
  return (
    <>
      <SEO title={t("contact.title")} path="/contact" />
      <section className="container-prose py-16 max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold">{t("contact.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("contact.subtitle")}</p>
        <div className="mt-8">
          <ContactForm source="contact" />
        </div>
      </section>
    </>
  );
}

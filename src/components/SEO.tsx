import { Helmet } from "react-helmet-async";
import { SITE } from "@/config/site";

type Props = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown>;
};

export default function SEO({ title, description, path = "/", image, type = "website", jsonLd }: Props) {
  const fullTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.description}`;
  const desc = description ?? SITE.description;
  const url = `${SITE.url}${path}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

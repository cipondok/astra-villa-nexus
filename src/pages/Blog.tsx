import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

const posts = [
  {
    slug: "indonesia-property-market-outlook-2026",
    title: "Indonesia Property Market Outlook 2026",
    excerpt: "Where smart capital is flowing next: Bali luxury, Jakarta commercial, and emerging secondary cities.",
    date: "June 18, 2026",
    readTime: "6 min read",
    category: "Market Intelligence",
  },
  {
    slug: "ai-valuation-vs-traditional-appraisal",
    title: "AI Valuation vs. Traditional Appraisal",
    excerpt: "How machine learning models trained on 50,000+ transactions are reshaping property pricing accuracy.",
    date: "June 10, 2026",
    readTime: "8 min read",
    category: "Technology",
  },
  {
    slug: "foreign-investor-guide-wna-property",
    title: "Foreign Investor Guide to WNA Property in Indonesia",
    excerpt: "Hak Guna Bangunan, nominee structures, and legal pathways for international buyers.",
    date: "May 28, 2026",
    readTime: "10 min read",
    category: "Legal",
  },
  {
    slug: "tokenized-real-estate-beginners",
    title: "Tokenized Real Estate: A Beginner's Guide",
    excerpt: "How fractional ownership on blockchain is lowering entry barriers for property investors.",
    date: "May 15, 2026",
    readTime: "7 min read",
    category: "Investment",
  },
  {
    slug: "best-areas-canggu-investment-2026",
    title: "Best Areas to Invest in Canggu 2026",
    excerpt: "Micro-location analysis of Pererenan, Batu Bolong, and Berawa — yields, risks, and growth curves.",
    date: "May 2, 2026",
    readTime: "5 min read",
    category: "Locations",
  },
  {
    slug: "property-management-automation",
    title: "Automating Property Management with AI",
    excerpt: "From tenant screening to predictive maintenance — how AI is reducing operational overhead by 40%.",
    date: "April 20, 2026",
    readTime: "6 min read",
    category: "Technology",
  },
  {
    slug: "bali-property-buying-guide",
    title: "How to Buy a Villa in Bali as a Foreigner",
    excerpt: "A 2026 guide to leasehold vs freehold, legal structures, area comparisons, ROI, and due diligence for international investors.",
    date: "July 17, 2026",
    readTime: "12 min read",
    category: "Investor Guide",
  },
];

export default function BlogPage() {
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "ASTRA Insights",
    url: "https://astravilla.com/blog",
    description: "Insights on Indonesian real estate, AI property technology, and investment strategies.",
    publisher: {
      "@type": "Organization",
      name: "ASTRA Villa Property",
      url: "https://astravilla.com",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.date,
      articleSection: p.category,
      url: `https://astravilla.com/blog/${p.slug}`,
    })),
  };
  return (
    <div className="reos min-h-screen">
      <SEOHead
        title="Blog"
        description="Insights on Indonesian real estate, AI property technology, investment strategies, and market intelligence from ASTRA Villa Property."
        canonical="https://astravilla.com/blog"
        jsonLd={blogJsonLd}
      />

      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">ASTRA Insights</h1>
          <p className="mt-5 text-lg text-[var(--text-2)] max-w-2xl mx-auto">
            Market intelligence, investment strategies, and technology deep-dives from the team building Southeast Asia's AI property platform.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post) => (
            <article key={post.slug} className="reos-card p-6 flex flex-col hover:border-[var(--line-strong)] transition group">
              <div className="flex items-center gap-2 text-xs text-[var(--gold-2)] font-medium tracking-wide uppercase">
                <BookOpen className="h-3 w-3" /> {post.category}
              </div>
              <h3 className="mt-3 text-lg font-medium leading-snug group-hover:text-[var(--gold-2)] transition-colors">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--text-2)] line-clamp-2">{post.excerpt}</p>
              <div className="mt-auto pt-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-[var(--text-3)]">
                  <span>{post.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                </div>
                <span className="text-xs font-medium text-[var(--text-2)] group-hover:text-[var(--gold-2)] inline-flex items-center gap-1 transition-colors">
                  Read <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

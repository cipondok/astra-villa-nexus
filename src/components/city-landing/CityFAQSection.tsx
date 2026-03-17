import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Props {
  cityName: string;
  hotspot: any;
}

const CityFAQSection = ({ cityName, hotspot }: Props) => {
  const trendText = hotspot?.trend ?? 'stable';
  const heatScore = hotspot?.hotspot_score ?? null;
  const rentalScore = hotspot?.rental_score ?? null;
  const growthScore = hotspot?.growth_score ?? null;

  const faqs = [
    {
      q: `What are the best areas to invest in ${cityName}?`,
      a: `The best investment areas in ${cityName} are identified by our AI Market Heat Engine, which analyzes property demand density, price growth momentum, and rental absorption rates.${heatScore ? ` Currently, ${cityName} has a heat score of ${heatScore}/100, indicating ${heatScore >= 70 ? 'strong' : heatScore >= 45 ? 'moderate' : 'emerging'} investment potential.` : ''} Use our interactive heat map to explore micro-locations with the highest opportunity scores.`,
    },
    {
      q: `What is the rental income potential in ${cityName}?`,
      a: `Rental income in ${cityName} varies by property type and location.${rentalScore ? ` Our data shows a rental market score of ${rentalScore}/100 for this area.` : ''} Villas in tourist zones typically yield 8-12% annually, while apartments in urban centers average 5-8%. Our AI Rental Yield Optimizer provides property-specific projections based on comparable market data.`,
    },
    {
      q: `What is the price growth outlook for ${cityName}?`,
      a: `${cityName}'s property market is currently trending ${trendText}.${growthScore ? ` The AI growth score is ${growthScore}/100.` : ''} Our Price Prediction Engine forecasts 3, 6, and 12-month price movements using infrastructure development signals, demographic trends, and transaction velocity data. Properties scored ≥85 on our Opportunity Score are classified as Strong Buy opportunities.`,
    },
    {
      q: `Is ${cityName} good for foreign property investment?`,
      a: `Indonesia allows foreign investors to hold property under specific ownership structures (Hak Pakai, PMA company, or nominee arrangements). ${cityName} is accessible to international investors through ASTRA's Foreign Investment Program, which provides legal guidance, taxation advisory, and verified property listings. Visit our WNA Investment Guide for details.`,
    },
    {
      q: `How does ASTRA's AI scoring work for ${cityName} properties?`,
      a: `Our AI Opportunity Score (0-100) evaluates properties using six weighted factors: ROI Projection (30%), Market Demand Heat (20%), Price Undervaluation (20%), Buyer Inquiry Velocity (15%), Rental Yield Strength (10%), and Luxury Appeal (5%). Properties in ${cityName} are continuously scored and re-ranked as new market data flows in.`,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-2">
            Frequently Asked Questions
          </h2>
          <p className="font-inter text-sm text-muted-foreground">
            Common questions about investing in {cityName} property.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-5 bg-card">
                <AccordionTrigger className="font-inter text-sm font-medium text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-inter text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* FAQ Schema - rendered as JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
};

export default CityFAQSection;

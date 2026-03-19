import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OpportunityScoreRing from '@/components/property/OpportunityScoreRing';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Maximize, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}Jt`;
  return `Rp ${price.toLocaleString('id-ID')}`;
};

const LandingFeatured = () => {
  const navigate = useNavigate();

  const { data: properties = [] } = useQuery({
    queryKey: ['landing-featured'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, price, city, state, bedrooms, bathrooms, area_sqm, images, opportunity_score, property_type')
        .gte('opportunity_score', 70)
        .eq('status', 'active')
        .order('opportunity_score', { ascending: false })
        .limit(6);
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

  const getTag = (score: number | null) => {
    if (!score) return null;
    if (score >= 85) return { label: 'Strong Buy', color: 'bg-intel-success text-white' };
    if (score >= 75) return { label: 'Growth Zone', color: 'bg-intel-blue text-white' };
    return { label: 'Opportunity', color: 'bg-intel-warning text-astra-navy-dark' };
  };

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-astra-navy-dark via-astra-navy to-astra-navy-dark">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="font-inter text-xs uppercase tracking-[0.2em] text-gold-primary mb-4 block">
            Elite Investments
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-titanium-white mb-4">
            Top-Scored Opportunities
          </h2>
          <p className="font-inter text-text-muted max-w-lg mx-auto">
            Properties with the highest AI opportunity scores, curated for serious investors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p, i) => {
            const tag = getTag(p.opportunity_score);
            const img = (p.images as string[] | null)?.[0] ?? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=75';
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(`/property/${p.id}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-border/15 bg-card/5 hover:border-gold-primary/30 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-astra-navy-dark/80 to-transparent" />

                  {/* Score */}
                  <div className="absolute top-3 right-3">
                    <OpportunityScoreRing score={p.opportunity_score} size={44} />
                  </div>

                  {/* Tag */}
                  {tag && (
                    <Badge className={`absolute top-3 left-3 ${tag.color} text-[10px] font-semibold border-0`}>
                      {tag.label}
                    </Badge>
                  )}

                  {/* Price */}
                  <div className="absolute bottom-3 left-3">
                    <span className="font-playfair text-xl font-bold text-gold-primary">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-playfair text-base font-semibold text-titanium-white line-clamp-1 mb-1">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-1 text-text-muted text-xs mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{p.city}, {p.state}</span>
                  </div>
                  <div className="flex items-center gap-4 text-text-muted text-xs">
                    {p.bedrooms && (
                      <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{p.bedrooms}</span>
                    )}
                    {p.bathrooms && (
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{p.bathrooms}</span>
                    )}
                    {p.area_sqm && (
                      <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{p.area_sqm}m²</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-8 h-8 text-gold-primary/40 mx-auto mb-4" />
            <p className="text-titanium-white font-inter font-medium mb-2">Properties are being scored by our AI engine</p>
            <p className="text-text-muted font-inter text-sm">Check back shortly — new opportunities are added daily.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingFeatured;

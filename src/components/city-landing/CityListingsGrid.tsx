import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OpportunityScoreRing from '@/components/property/OpportunityScoreRing';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  cityName: string;
  properties: any[];
}

const formatPrice = (p: number) => {
  if (p >= 1e9) return `Rp ${(p / 1e9).toFixed(1)}M`;
  if (p >= 1e6) return `Rp ${(p / 1e6).toFixed(0)}Jt`;
  return `Rp ${p.toLocaleString('id-ID')}`;
};

const CityListingsGrid = ({ cityName, properties }: Props) => {
  const navigate = useNavigate();

  if (properties.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-2">
            Top Opportunities in {cityName}
          </h2>
          <p className="font-inter text-sm text-muted-foreground">
            Ranked by AI opportunity score – highest investment potential first.
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-gold-primary to-transparent mt-3" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p, i) => {
            const img = (p.images as string[] | null)?.[0] ?? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=75';
            const isElite = (p.opportunity_score ?? 0) >= 85;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/properties/${p.id}`)}
                className={`group cursor-pointer rounded-2xl overflow-hidden border bg-card transition-all duration-300 ${isElite ? 'border-intel-success/30 shadow-md' : 'border-border hover:border-primary/20'}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

                  <div className="absolute top-3 right-3">
                    <OpportunityScoreRing score={p.opportunity_score} size={42} />
                  </div>

                  {isElite && (
                    <Badge className="absolute top-3 left-3 bg-intel-success text-white text-[10px] border-0">
                      Strong Buy
                    </Badge>
                  )}

                  <div className="absolute bottom-3 left-3">
                    <span className="font-playfair text-lg font-bold text-foreground">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-playfair text-sm font-semibold text-foreground line-clamp-1 mb-1">{p.title}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{p.city}, {p.state}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    {p.bedrooms && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{p.bedrooms}</span>}
                    {p.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{p.bathrooms}</span>}
                    {p.area_sqm && <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{p.area_sqm}m²</span>}
                    {p.rental_yield_percentage && (
                      <span className="text-intel-success font-medium">{p.rental_yield_percentage.toFixed(1)}% yield</span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button
            variant="outline"
            onClick={() => navigate(`/search?city=${encodeURIComponent(cityName)}`)}
            className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
          >
            View All {cityName} Properties
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CityListingsGrid;

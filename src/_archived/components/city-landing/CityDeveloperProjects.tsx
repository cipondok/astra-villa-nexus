import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';

interface Props {
  cityName: string;
  projects: any[];
}

const CityDeveloperProjects = ({ cityName, projects }: Props) => {
  const navigate = useNavigate();

  if (projects.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-gold-primary" />
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">
              New Launches in {cityName}
            </h2>
          </div>
          <p className="font-inter text-sm text-muted-foreground">
            Recently listed developer projects and new construction opportunities.
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-gold-primary to-transparent mt-3" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((p, i) => {
            const img = (p.images as string[] | null)?.[0] ?? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=75';
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(`/properties/${p.id}`)}
                className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-card hover:border-primary/20 transition-all"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-3">
                  <h3 className="font-inter text-sm font-semibold text-foreground line-clamp-1">{p.title}</h3>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">{p.property_type}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CityDeveloperProjects;

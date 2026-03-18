import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Rina Sari',
    role: 'First-time Buyer',
    avatar: '',
    rating: 5,
    text: 'The AI scoring helped me find a property 15% below market value. I would never have found this deal on my own.',
    location: 'Jakarta Selatan',
  },
  {
    name: 'Ahmad Pratama',
    role: 'Property Investor',
    avatar: '',
    rating: 5,
    text: 'ASTRA\'s market intelligence is unmatched. I\'ve used the ROI predictions for 3 purchases — all outperforming expectations.',
    location: 'Bali',
  },
  {
    name: 'Diana Wijaya',
    role: 'Real Estate Agent',
    avatar: '',
    rating: 4,
    text: 'My clients trust verified listings. ASTRA\'s platform has doubled my closing rate in just 6 months.',
    location: 'Surabaya',
  },
  {
    name: 'Budi Santoso',
    role: 'Investor',
    avatar: '',
    rating: 5,
    text: 'The deal finder feature surfaced an undervalued villa in Ubud. Best investment decision I\'ve made this year.',
    location: 'Bandung',
  },
];

export default function TestimonialsCarousel() {
  const [active, setActive] = useState(0);

  const next = () => setActive((p) => (p + 1) % testimonials.length);
  const prev = () => setActive((p) => (p - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[active];

  return (
    <div className="w-full py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-5">
          <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            What Our Users Say
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Trusted by thousands of property seekers across Indonesia
          </p>
        </div>

        <div className="relative bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-6 sm:p-8 overflow-hidden">
          {/* Decorative quote */}
          <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/5" />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center text-center gap-4"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? 'text-gold-primary fill-gold-primary' : 'text-muted-foreground/20'}`}
                  />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed max-w-2xl font-medium italic">
                "{t.text}"
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center gap-1 mt-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-foreground">{t.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {t.role} • {t.location}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={prev}
              className="h-8 w-8 rounded-full border border-border/50 hover:border-primary/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              className="h-8 w-8 rounded-full border border-border/50 hover:border-primary/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

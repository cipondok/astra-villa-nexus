import { Button } from '@/components/ui/button';
import { Gift, Home, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import OfferRegistration from '@/components/cookies/OfferRegistration';

const Offers = () => {
  const offers = [
    {
      id: 1,
      title: 'Bali Beach Villa',
      location: 'Seminyak, Bali',
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&auto=format&fit=crop',
      features: ['3 Bedrooms', 'Private Pool', 'Ocean View']
    },
    {
      id: 2,
      title: 'Ubud Jungle Villa',
      location: 'Ubud, Bali',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
      features: ['4 Bedrooms', 'Garden View', 'Infinity Pool']
    },
    {
      id: 3,
      title: 'Canggu Modern Villa',
      location: 'Canggu, Bali',
      discount: '10% OFF',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
      features: ['5 Bedrooms', 'Rooftop Terrace', 'Smart Home']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-6 animate-pulse">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Exclusive Villa Offers
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover luxury 3D villas in Bali with special discounts and early access
          </p>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="group glass-effect rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  {offer.discount}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{offer.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{offer.location}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {offer.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted/30 border border-border/50 rounded-full text-xs text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                >
                  <Home className="w-4 h-4" />
                  View Villa
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Section */}
      <div className="py-16 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Don't Miss Out on New Offers
            </h2>
            <p className="text-lg text-muted-foreground">
              Register now to receive exclusive deals on newly listed villas
            </p>
          </div>
          <OfferRegistration />
        </div>
      </div>
    </div>
  );
};

export default Offers;

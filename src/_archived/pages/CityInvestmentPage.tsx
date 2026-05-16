import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead, seoSchemas } from '@/components/SEOHead';
import CityHeroSection from '@/components/city-landing/CityHeroSection';
import CityInsightsSection from '@/components/city-landing/CityInsightsSection';
import CityListingsGrid from '@/components/city-landing/CityListingsGrid';
import CityDeveloperProjects from '@/components/city-landing/CityDeveloperProjects';
import CityFAQSection from '@/components/city-landing/CityFAQSection';
import { Loader2 } from 'lucide-react';

const formatCitySlug = (slug: string) =>
  slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const CityInvestmentPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const cityName = formatCitySlug(citySlug || '');

  // Fetch hotspot data for this city
  const { data: hotspot, isLoading: hotspotLoading } = useQuery({
    queryKey: ['city-hotspot', cityName],
    queryFn: async () => {
      const { data } = await supabase
        .from('investment_hotspots')
        .select('*')
        .ilike('city', `%${cityName}%`)
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 10 * 60_000,
  });

  // Fetch top properties
  const { data: properties = [] } = useQuery({
    queryKey: ['city-properties', cityName],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, price, city, state, bedrooms, bathrooms, area_sqm, images, opportunity_score, property_type, rental_yield_percentage, listing_type')
        .ilike('city', `%${cityName}%`)
        .eq('status', 'active')
        .order('opportunity_score', { ascending: false })
        .limit(9);
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

  // Fetch new developer projects
  const { data: projects = [] } = useQuery({
    queryKey: ['city-projects', cityName],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, price, city, state, images, opportunity_score, property_type')
        .ilike('city', `%${cityName}%`)
        .eq('status', 'active')
        .eq('listing_type', 'sale')
        .order('created_at', { ascending: false })
        .limit(4);
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

  const seoTitle = `Property Investment in ${cityName} – Top Opportunities & Market Insights`;
  const seoDesc = `Discover AI-scored property investment opportunities in ${cityName}, Indonesia. View rental yields, market heat trends, and elite listings for smart investors.`;
  const pageUrl = `/invest/${citySlug}`;

  if (hotspotLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        keywords={`property investment ${cityName}, buy property ${cityName}, rental yield ${cityName}, real estate indonesia`}
        canonical={`https://astra-villa-realty.lovable.app${pageUrl}`}
        ogType="website"
        jsonLd={[
          seoSchemas.breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Invest', url: '/investment' },
            { name: cityName, url: pageUrl },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Top Investment Properties in ${cityName}`,
            numberOfItems: properties.length,
            itemListElement: properties.slice(0, 5).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: p.title,
              url: `https://astra-villa-realty.lovable.app/properties/${p.id}`,
            })),
          },
        ]}
      />

      <div className="min-h-screen bg-background">
        <CityHeroSection cityName={cityName} hotspot={hotspot} propertyCount={properties.length} />
        <CityInsightsSection cityName={cityName} hotspot={hotspot} properties={properties} />
        <CityListingsGrid cityName={cityName} properties={properties} />
        <CityDeveloperProjects cityName={cityName} projects={projects} />
        <CityFAQSection cityName={cityName} hotspot={hotspot} />
      </div>
    </>
  );
};

export default CityInvestmentPage;

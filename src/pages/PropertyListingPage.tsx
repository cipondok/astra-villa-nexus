
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import PropertyListingsSection from '@/components/PropertyListingsSection';
import { supabase } from '@/integrations/supabase/client';

interface PropertyListingPageProps {
  pageType: 'buy' | 'rent' | 'new-projects' | 'pre-launching';
  title: string;
  subtitle: string;
}

const mockPreLaunchingProperties = [
  {
    id: 'mock-pre-1',
    title: 'Astra Heights - Tower A (Pre-launch)',
    description: 'Exclusive pre-launch offer for our newest luxury apartment tower. Book now for special prices and benefits.',
    property_type: 'apartment',
    listing_type: 'sale',
    location: 'Central Business District, Jakarta',
    price: 3000000000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 95,
    status: 'active',
    development_status: 'pre_launching',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'Jakarta',
    city: 'Central Jakarta',
    area: 'CBD'
  },
  {
    id: 'mock-pre-2',
    title: 'Greenville Residences (Pre-launch)',
    description: 'Eco-friendly villas in a serene environment. Pre-launch phase with attractive payment plans.',
    property_type: 'villa',
    listing_type: 'sale',
    location: 'Greenville, Bogor',
    price: 5500000000,
    bedrooms: 4,
    bathrooms: 4,
    area_sqm: 320,
    status: 'active',
    development_status: 'pre_launching',
    images: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'West Java',
    city: 'Bogor',
    area: 'Greenville'
  },
];

const mockNewProjectProperties = [
  {
    id: 'mock-new-1',
    title: 'Metropolis Towers - Under Construction',
    description: 'A new landmark in the city. Modern apartments with stunning city views. Construction in full swing.',
    property_type: 'condo',
    listing_type: 'sale',
    location: 'Downtown Core, Jakarta',
    price: 4200000000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 120,
    status: 'active',
    development_status: 'new_project',
    images: ['https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=2070&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'Jakarta',
    city: 'Central Jakarta',
    area: 'Downtown'
  },
  {
    id: 'mock-new-2',
    title: 'The Orchard - New Project',
    description: 'Family-friendly townhouses with private gardens. A new community is blossoming here.',
    property_type: 'house',
    listing_type: 'sale',
    location: 'BSD City, Tangerang',
    price: 2800000000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 180,
    status: 'active',
    development_status: 'new_project',
    images: ['https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'Banten',
    city: 'Tangerang',
    area: 'BSD City'
  },
];

const PropertyListingPage = ({ pageType, title, subtitle }: PropertyListingPageProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const language = 'en'; // Hardcoding for now, could be dynamic later

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      console.log(`Fetching ${pageType} properties...`);
      
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active');

        if (pageType === 'buy') {
          query = query.eq('listing_type', 'sale').eq('development_status', 'completed');
        } else if (pageType === 'rent') {
          query = query.eq('listing_type', 'rent').eq('development_status', 'completed');
        } else if (pageType === 'new-projects') {
          query = query.eq('development_status', 'new_project');
        } else if (pageType === 'pre-launching') {
          query = query.eq('development_status', 'pre_launching');
        }

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000);
        });

        const { data, error } = await Promise.race([
          query.order('created_at', { ascending: false }).limit(20),
          timeoutPromise
        ]);

        if (error) {
          console.error(`Error fetching ${pageType} properties:`, error);
          // Use mock data on error
          if (pageType === 'pre-launching') {
            setProperties(mockPreLaunchingProperties);
          } else if (pageType === 'new-projects') {
            setProperties(mockNewProjectProperties);
          } else {
            setProperties([]);
          }
        } else {
          console.log(`Found ${data?.length || 0} ${pageType} properties`);
          if (data && data.length > 0) {
            setProperties(data);
          } else {
            // Use mock data if no real data found
            if (pageType === 'pre-launching') {
              setProperties(mockPreLaunchingProperties);
            } else if (pageType === 'new-projects') {
              setProperties(mockNewProjectProperties);
            } else {
              setProperties([]);
            }
          }
        }
      } catch (error) {
        console.error(`Error in fetchProperties for ${pageType}:`, error);
        // Use mock data on any error
        if (pageType === 'pre-launching') {
          setProperties(mockPreLaunchingProperties);
        } else if (pageType === 'new-projects') {
          setProperties(mockNewProjectProperties);
        } else {
          setProperties([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [pageType]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-6 pt-20">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-4">{subtitle}</p>
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading {pageType} properties...</p>
              </div>
            </div>
          ) : (
            <PropertyListingsSection
              language={language}
              searchResults={properties}
              hasSearched={true}
              hideTitle={true}
            />
          )}
        </div>
      </main>
      <ProfessionalFooter language="en" />
    </div>
  );
};

export default PropertyListingPage;

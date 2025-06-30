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

const mockRentProperties = [
  {
    id: 'mock-rent-1',
    title: 'Modern 2BR Apartment for Rent',
    description: 'Beautiful modern apartment with city views, fully furnished, perfect for professionals.',
    property_type: 'apartment',
    listing_type: 'rent',
    location: 'Central Jakarta, Jakarta',
    price: 15000000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 85,
    status: 'active',
    development_status: 'completed',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'Jakarta',
    city: 'Central Jakarta',
    area: 'Sudirman'
  },
  {
    id: 'mock-rent-2',
    title: '3BR House for Rent in BSD',
    description: 'Spacious family house with garden, located in quiet residential area with good access to schools.',
    property_type: 'house',
    listing_type: 'rent',
    location: 'BSD City, Tangerang',
    price: 25000000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 150,
    status: 'active',
    development_status: 'completed',
    images: ['https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'Banten',
    city: 'Tangerang',
    area: 'BSD City'
  },
  {
    id: 'mock-rent-3',
    title: 'Studio Apartment - Kemang Area',
    description: 'Cozy studio apartment in trendy Kemang area, perfect for young professionals.',
    property_type: 'apartment',
    listing_type: 'rent',
    location: 'Kemang, South Jakarta',
    price: 8000000,
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 35,
    status: 'active',
    development_status: 'completed',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'Jakarta',
    city: 'South Jakarta',
    area: 'Kemang'
  },
  {
    id: 'mock-rent-4',
    title: 'Luxury Villa with Pool - Alam Sutera',
    description: 'Exclusive villa with private swimming pool and garden, fully furnished.',
    property_type: 'villa',
    listing_type: 'rent',
    location: 'Alam Sutera, Tangerang',
    price: 45000000,
    bedrooms: 4,
    bathrooms: 4,
    area_sqm: 280,
    status: 'active',
    development_status: 'completed',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'Banten',
    city: 'Tangerang',
    area: 'Alam Sutera'
  }
];

const mockBuyProperties = [
  {
    id: 'mock-buy-1',
    title: 'Modern Townhouse for Sale',
    description: 'Brand new townhouse in gated community with modern amenities and security.',
    property_type: 'house',
    listing_type: 'sale',
    location: 'Bekasi, West Java',
    price: 850000000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 120,
    status: 'active',
    development_status: 'completed',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'West Java',
    city: 'Bekasi',
    area: 'Grand Wisata'
  },
  {
    id: 'mock-buy-2',
    title: 'Luxury Condo - Sudirman Area',
    description: 'Premium condominium unit with panoramic city views in prime business district.',
    property_type: 'condo',
    listing_type: 'sale',
    location: 'Sudirman, Central Jakarta',
    price: 2800000000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 95,
    status: 'active',
    development_status: 'completed',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop'],
    thumbnail_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    state: 'Jakarta',
    city: 'Central Jakarta',
    area: 'Sudirman'
  }
];

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
  const language = 'en';

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      console.log(`Fetching ${pageType} properties...`);
      
      try {
        // Always use mock data first to ensure page loads with content
        let fallbackData: any[] = [];
        if (pageType === 'rent') {
          fallbackData = mockRentProperties;
        } else if (pageType === 'buy') {
          fallbackData = mockBuyProperties;
        } else if (pageType === 'pre-launching') {
          fallbackData = mockPreLaunchingProperties;
        } else if (pageType === 'new-projects') {
          fallbackData = mockNewProjectProperties;
        }

        // Set fallback data immediately
        setProperties(fallbackData);

        // Try to fetch real data with short timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 3000);
        });

        let query = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active');

        if (pageType === 'buy') {
          query = query.eq('listing_type', 'sale').in('development_status', ['completed', 'ready']);
        } else if (pageType === 'rent') {
          query = query.eq('listing_type', 'rent').in('development_status', ['completed', 'ready']);
        } else if (pageType === 'new-projects') {
          query = query.eq('development_status', 'new_project');
        } else if (pageType === 'pre-launching') {
          query = query.eq('development_status', 'pre_launching');
        }

        try {
          const { data, error } = await Promise.race([
            query.order('created_at', { ascending: false }).limit(20),
            timeoutPromise
          ]);

          if (!error && data && data.length > 0) {
            console.log(`Found ${data.length} real ${pageType} properties, updating display`);
            // Filter valid properties
            const validProperties = data.filter(property => 
              property.title && 
              property.title.trim() !== '' &&
              property.price && 
              property.price > 0
            );
            
            if (validProperties.length > 0) {
              setProperties(validProperties);
            }
            // Keep fallback data if no valid real properties
          } else if (error) {
            console.log(`Database error for ${pageType}:`, error.message);
          }
        } catch (fetchError) {
          console.log(`Fetch timeout for ${pageType}, keeping mock data`);
        }

      } catch (error) {
        console.error(`Error in fetchProperties for ${pageType}:`, error);
        // Fallback data is already set above
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
          <PropertyListingsSection
            language={language}
            searchResults={properties}
            hasSearched={true}
            hideTitle={true}
            isSearching={isLoading}
          />
        </div>
      </main>
      <ProfessionalFooter language="en" />
    </div>
  );
};

export default PropertyListingPage;


import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';
import PropertyListingsSection from '@/components/PropertyListingsSection';
import { supabase } from '@/integrations/supabase/client';
import LoadingPopup from '@/components/LoadingPopup';

interface PropertyListingPageProps {
  pageType: 'buy' | 'rent' | 'new-projects' | 'pre-launching';
  title: string;
  subtitle: string;
}

const PropertyListingPage = ({ pageType, title, subtitle }: PropertyListingPageProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const language = 'en'; // Hardcoding for now, could be dynamic later

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved');

      if (pageType === 'buy') {
        query = query.eq('listing_type', 'sale').eq('development_status', 'completed');
      } else if (pageType === 'rent') {
        query = query.eq('listing_type', 'rent').eq('development_status', 'completed');
      } else if (pageType === 'new-projects') {
        query = query.eq('development_status', 'new_project');
      } else if (pageType === 'pre-launching') {
        query = query.eq('development_status', 'pre_launching');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching ${pageType} properties:`, error);
        setProperties([]);
      } else {
        setProperties(data || []);
      }
      setIsLoading(false);
    };

    fetchProperties();
  }, [pageType]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
        <div className="mt-8">
          {isLoading ? (
             <LoadingPopup 
                isOpen={isLoading} 
                message={language === "en" ? "Fetching properties..." : "Mengambil properti..."}
                language={language}
            />
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

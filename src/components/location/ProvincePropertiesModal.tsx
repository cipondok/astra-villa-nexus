import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Building2, ExternalLink, Loader2, Home, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Rumah123PropertyCard from '@/components/property/Rumah123PropertyCard';
import { motion } from 'framer-motion';
import { useScrollLock } from '@/hooks/useScrollLock';

interface Property {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_type: string;
  location: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  image_urls: string[];
  land_area_sqm?: number;
  building_area_sqm?: number;
  thumbnail_url?: string;
}

interface ProvincePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  provinceName: string;
}

// Province name mapping for search
const provinceNameMapping: Record<string, string[]> = {
  'Aceh': ['Aceh'],
  'Sumatera Utara': ['North Sumatra', 'Sumatra Utara', 'Medan'],
  'Sumatera Barat': ['West Sumatra', 'Sumatra Barat', 'Padang'],
  'Riau': ['Riau', 'Pekanbaru'],
  'Kepulauan Riau': ['Riau Islands', 'Batam'],
  'Jambi': ['Jambi'],
  'Sumatera Selatan': ['South Sumatra', 'Sumatra Selatan', 'Palembang'],
  'Bengkulu': ['Bengkulu'],
  'Bangka Belitung': ['Bangka Belitung'],
  'Lampung': ['Lampung'],
  'Banten': ['Banten', 'Tangerang', 'Serang'],
  'DKI Jakarta': ['Jakarta', 'DKI Jakarta', 'Central Jakarta', 'South Jakarta', 'North Jakarta', 'West Jakarta', 'East Jakarta'],
  'Jawa Barat': ['West Java', 'Jawa Barat', 'Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cimahi', 'Karawang', 'Cirebon'],
  'Jawa Tengah': ['Central Java', 'Jawa Tengah', 'Semarang', 'Solo', 'Surakarta'],
  'Yogyakarta': ['DIY Yogyakarta', 'Yogyakarta', 'Jogja', 'Jogjakarta'],
  'Jawa Timur': ['East Java', 'Jawa Timur', 'Surabaya', 'Malang', 'Sidoarjo'],
  'Kalimantan Barat': ['West Kalimantan', 'Kalimantan Barat', 'Pontianak'],
  'Kalimantan Tengah': ['Central Kalimantan', 'Kalimantan Tengah', 'Palangkaraya'],
  'Kalimantan Selatan': ['South Kalimantan', 'Kalimantan Selatan', 'Banjarmasin'],
  'Kalimantan Timur': ['East Kalimantan', 'Kalimantan Timur', 'Balikpapan', 'Samarinda'],
  'Kalimantan Utara': ['North Kalimantan', 'Kalimantan Utara', 'Tarakan'],
  'Sulawesi Utara': ['North Sulawesi', 'Sulawesi Utara', 'Manado'],
  'Gorontalo': ['Gorontalo'],
  'Sulawesi Tengah': ['Central Sulawesi', 'Sulawesi Tengah', 'Palu'],
  'Sulawesi Barat': ['West Sulawesi', 'Sulawesi Barat'],
  'Sulawesi Selatan': ['South Sulawesi', 'Sulawesi Selatan', 'Makassar'],
  'Sulawesi Tenggara': ['Southeast Sulawesi', 'Sulawesi Tenggara', 'Kendari'],
  'Bali': ['Bali', 'Denpasar', 'Seminyak', 'Ubud', 'Kuta', 'Sanur', 'Canggu'],
  'Nusa Tenggara Barat': ['West Nusa Tenggara', 'NTB', 'Lombok', 'Mataram'],
  'Nusa Tenggara Timur': ['East Nusa Tenggara', 'NTT', 'Kupang'],
  'Maluku Utara': ['North Maluku', 'Maluku Utara', 'Ternate'],
  'Maluku': ['Maluku', 'Ambon'],
  'Papua Barat': ['West Papua', 'Papua Barat', 'Sorong'],
  'Papua': ['Papua', 'Jayapura']
};

const ProvincePropertiesModal = ({ isOpen, onClose, provinceName }: ProvincePropertiesModalProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Prevent layout shift when modal opens/closes
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && provinceName) {
      fetchProperties();
    }
  }, [isOpen, provinceName]);

  const getSearchTerms = (name: string): string[] => {
    const terms = provinceNameMapping[name] || [name];
    return [name, ...terms];
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const searchTerms = getSearchTerms(provinceName);
      const priorityTerms = searchTerms.slice(0, 3);
      const orConditions = priorityTerms.flatMap(term => [
        `location.ilike.%${term}%`,
        `city.ilike.%${term}%`,
        `state.ilike.%${term}%`
      ]).join(',');

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(orConditions)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/properties?location=${encodeURIComponent(provinceName)}`);
  };

  const handlePropertyClick = (propertyId: string) => {
    window.open(`/property/${propertyId}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[85vh] p-0 gap-0 overflow-hidden"
        autoClose={false}
        showCountdown={false}
      >
        <DialogHeader className="p-4 pb-3 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <DialogTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-semibold text-base">Properti di {provinceName}</span>
                <p className="text-xs text-muted-foreground font-normal">
                  {isLoading ? 'Memuat...' : `${properties.length} properti ditemukan`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewAll}
                className="h-8 text-xs gap-1"
              >
                Lihat Semua
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(85vh-80px)]">
          <div className="p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Memuat properti...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Home className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Belum ada properti</h3>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Belum ada properti terdaftar di {provinceName}. Coba cari di lokasi lain.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Rumah123PropertyCard
                      property={property}
                      language="id"
                      isSaved={false}
                      onSave={() => {}}
                      onView={() => handlePropertyClick(property.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProvincePropertiesModal;

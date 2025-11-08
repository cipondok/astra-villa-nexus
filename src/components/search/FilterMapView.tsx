import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { PropertyFilters } from "./AdvancedPropertyFilters";
import { Loader2 } from 'lucide-react';

interface FilterMapViewProps {
  filters: PropertyFilters;
}

export const FilterMapView = ({ filters }: FilterMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ';
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [106.8456, -6.2088],
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.on('load', () => setIsLoading(false));

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!map.current) return;

      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      try {
        let query = supabase
          .from('properties')
          .select('id, title, price, city')
          .eq('status', 'active')
          .eq('approval_status', 'approved');

        if (filters.location && filters.location !== 'all') {
          query = query.eq('city', filters.location);
        }
        if (filters.propertyTypes.length > 0) {
          query = query.in('property_type', filters.propertyTypes);
        }
        if (filters.listingType && filters.listingType !== 'all') {
          query = query.eq('listing_type', filters.listingType);
        }
        if (filters.priceRange) {
          query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
        }

        const { data: properties } = await query.limit(50);

        // For demo purposes, show property count by city on the map
        if (properties && properties.length > 0) {
          const cityCoordinates: Record<string, [number, number]> = {
            'Jakarta': [106.8456, -6.2088],
            'Surabaya': [112.7521, -7.2575],
            'Bandung': [107.6191, -6.9175],
            'Medan': [98.6722, 3.5952],
            'Semarang': [110.4203, -6.9932],
            'Makassar': [119.4327, -5.1477],
            'Palembang': [104.7458, -2.9910],
            'Tangerang': [106.6302, -6.1783],
          };

          const cityCounts: Record<string, number> = {};
          properties.forEach(p => {
            if (p.city) {
              cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
            }
          });

          Object.entries(cityCounts).forEach(([city, count]) => {
            const coords = cityCoordinates[city];
            if (coords) {
              const el = document.createElement('div');
              el.className = 'px-3 py-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white font-bold text-sm';
              el.innerHTML = `${count}`;

              const marker = new mapboxgl.Marker(el)
                .setLngLat(coords)
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                      <div class="p-2">
                        <p class="font-bold text-sm">${city}</p>
                        <p class="text-xs text-primary">${count} properties</p>
                      </div>
                    `)
                )
                .addTo(map.current!);

              markers.current.push(marker);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, [filters]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useLocationSettings } from '@/stores/locationSettingsStore';

interface PropertyForMap {
  id: string;
  title: string;
  price: number;
  city?: string;
  location?: string;
  image_urls?: string[];
  images?: string[];
}

interface PropertyListingMapViewProps {
  properties: PropertyForMap[];
  formatPrice: (price: number) => string;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ';

const cityCoordinates: Record<string, [number, number]> = {
  'Jakarta': [106.8456, -6.2088],
  'Jakarta Selatan': [106.8271, -6.2615],
  'Jakarta Pusat': [106.8456, -6.1862],
  'Jakarta Barat': [106.7588, -6.1681],
  'Jakarta Utara': [106.8456, -6.1215],
  'Jakarta Timur': [106.9004, -6.2250],
  'Surabaya': [112.7521, -7.2575],
  'Bandung': [107.6191, -6.9175],
  'Medan': [98.6722, 3.5952],
  'Semarang': [110.4203, -6.9932],
  'Makassar': [119.4327, -5.1477],
  'Palembang': [104.7458, -2.9910],
  'Tangerang': [106.6302, -6.1783],
  'Bogor': [106.7980, -6.5971],
  'Bali': [115.1889, -8.4095],
  'Yogyakarta': [110.3695, -7.7956],
  'Depok': [106.8316, -6.4025],
  'Bekasi': [107.0007, -6.2383],
};

const PropertyListingMapView = ({ properties, formatPrice }: PropertyListingMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { settings, fetchSettings } = useLocationSettings();
  const { defaultMapCenter } = settings;

  useEffect(() => {
    if (!settings.isLoaded) fetchSettings();
  }, [settings.isLoaded, fetchSettings]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const center: [number, number] = [defaultMapCenter.longitude, defaultMapCenter.latitude];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom: defaultMapCenter.zoom,
      maxZoom: 18,
      minZoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.on('load', () => setIsLoading(false));

    return () => map.current?.remove();
  }, [defaultMapCenter.longitude, defaultMapCenter.latitude, defaultMapCenter.zoom]);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Group by city
    const grouped: Record<string, PropertyForMap[]> = {};
    properties.forEach(p => {
      const city = p.city || p.location || 'Unknown';
      if (!grouped[city]) grouped[city] = [];
      grouped[city].push(p);
    });

    Object.entries(grouped).forEach(([city, cityProperties]) => {
      const coords = cityCoordinates[city];
      if (!coords) return;

      const count = cityProperties.length;
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center px-3 py-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-background font-bold text-sm';
      el.textContent = String(count);

      // Build popup HTML (max 3 items)
      const shown = cityProperties.slice(0, 3);
      const remaining = count - shown.length;

      const itemsHtml = shown.map(p => {
        const img = p.image_urls?.[0] || p.images?.[0] || '/placeholder.svg';
        const safeTitle = DOMPurify.sanitize(p.title, { ALLOWED_TAGS: [] });
        const safePrice = DOMPurify.sanitize(formatPrice(p.price), { ALLOWED_TAGS: [] });
        return `
          <a href="/properties/${p.id}" class="flex gap-2 p-2 hover:bg-gray-50 rounded transition-colors no-underline" style="text-decoration:none;color:inherit;">
            <img src="${DOMPurify.sanitize(img, { ALLOWED_TAGS: [] })}" alt="" class="w-14 h-14 object-cover rounded flex-shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-semibold truncate">${safeTitle}</p>
              <p class="text-xs font-bold" style="color:hsl(var(--primary))">${safePrice}</p>
            </div>
          </a>
        `;
      }).join('');

      const moreHtml = remaining > 0
        ? `<p class="text-xs text-center py-1" style="color:hsl(var(--primary))">+${remaining} properti lainnya</p>`
        : '';

      const popupHtml = `
        <div style="max-width:260px;max-height:280px;overflow-y:auto;">
          <p class="font-bold text-sm px-2 pt-2 pb-1">${DOMPurify.sanitize(city, { ALLOWED_TAGS: [] })}</p>
          <div class="divide-y">${itemsHtml}</div>
          ${moreHtml}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup({ offset: 25, maxWidth: '280px' }).setHTML(popupHtml))
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [properties, formatPrice]);

  return (
    <div className="relative w-full min-h-[500px] h-[calc(100vh-250px)] rounded-lg overflow-hidden border border-border">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default PropertyListingMapView;

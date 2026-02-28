import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';
import PillToggleGroup from '@/components/ui/PillToggleGroup';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ';

export const cityCoordinates: Record<string, [number, number]> = {
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

interface POI {
  name: string;
  category: 'school' | 'hospital' | 'transit' | 'shopping' | 'restaurant';
  lat: number;
  lng: number;
  distance: string;
}

const categoryColors: Record<string, string> = {
  school: '#4CAF50',
  hospital: '#F44336',
  transit: '#2196F3',
  shopping: '#FF9800',
  restaurant: '#9C27B0',
};

const categoryLabels: Record<string, string> = {
  school: 'Sekolah',
  hospital: 'RS',
  transit: 'Transit',
  shopping: 'Mall',
  restaurant: 'Restoran',
};

// Seeded pseudo-random from city name
function seededRandom(seed: string, index: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  h = ((h + index * 2654435761) | 0) >>> 0;
  return (h % 10000) / 10000;
}

function generatePOIs(city: string, center: [number, number]): POI[] {
  const poiTemplates: { category: POI['category']; names: string[] }[] = [
    { category: 'school', names: ['SD Negeri', 'SMP Negeri', 'SMA Negeri', 'Universitas', 'TK Harapan'] },
    { category: 'hospital', names: ['RS Umum', 'Klinik Sehat', 'RS Ibu & Anak', 'Puskesmas'] },
    { category: 'transit', names: ['Stasiun MRT', 'Halte TransJakarta', 'Stasiun KRL', 'Terminal Bus'] },
    { category: 'shopping', names: ['Mall', 'Pasar Tradisional', 'Supermarket', 'Mini Market'] },
    { category: 'restaurant', names: ['Restoran Padang', 'Cafe & Bistro', 'Warung Makan', 'Food Court'] },
  ];

  const pois: POI[] = [];
  let idx = 0;
  poiTemplates.forEach(tmpl => {
    tmpl.names.forEach(name => {
      const r1 = seededRandom(city, idx++) * 2 - 1;
      const r2 = seededRandom(city, idx++) * 2 - 1;
      const offsetLng = r1 * 0.015;
      const offsetLat = r2 * 0.012;
      const dist = Math.sqrt(offsetLng ** 2 + offsetLat ** 2) * 111;
      pois.push({
        name: `${name} ${city.split(' ')[0]}`,
        category: tmpl.category,
        lng: center[0] + offsetLng,
        lat: center[1] + offsetLat,
        distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`,
      });
    });
  });
  return pois;
}

interface PropertyNeighborhoodMapProps {
  city?: string;
  coordinates?: { lat: number; lng: number };
}

const filterOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'school', label: '🏫 Sekolah' },
  { value: 'hospital', label: '🏥 RS' },
  { value: 'transit', label: '🚇 Transit' },
  { value: 'shopping', label: '🛍️ Mall' },
  { value: 'restaurant', label: '🍽️ Restoran' },
];

const PropertyNeighborhoodMap = ({ city, coordinates }: PropertyNeighborhoodMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const center: [number, number] = useMemo(() => {
    if (coordinates) return [coordinates.lng, coordinates.lat];
    if (city && cityCoordinates[city]) return cityCoordinates[city];
    return [106.8456, -6.2088]; // Jakarta default
  }, [city, coordinates]);

  const pois = useMemo(() => generatePOIs(city || 'Jakarta', center), [city, center]);

  const filteredPois = useMemo(
    () => activeCategory === 'all' ? pois : pois.filter(p => p.category === activeCategory),
    [pois, activeCategory]
  );

  // Init map
  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom: 14,
      maxZoom: 18,
      minZoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.on('load', () => setIsLoading(false));

    return () => map.current?.remove();
  }, [center]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Property marker
    const propEl = document.createElement('div');
    propEl.className = 'w-6 h-6 rounded-full border-2 border-background shadow-lg flex items-center justify-center';
    propEl.style.background = 'hsl(var(--gold-primary))';
    propEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>';
    const propMarker = new mapboxgl.Marker(propEl).setLngLat(center).addTo(map.current!);
    markersRef.current.push(propMarker);

    // POI markers
    filteredPois.forEach(poi => {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 rounded-full border border-background shadow cursor-pointer hover:scale-125 transition-transform';
      el.style.background = categoryColors[poi.category];

      const popup = new mapboxgl.Popup({ offset: 15, maxWidth: '200px' }).setHTML(
        `<div class="p-1.5"><p class="font-semibold text-xs">${poi.name}</p><p class="text-[10px] text-gray-500">${categoryLabels[poi.category]} · ${poi.distance}</p></div>`
      );

      const marker = new mapboxgl.Marker(el).setLngLat([poi.lng, poi.lat]).setPopup(popup).addTo(map.current!);
      markersRef.current.push(marker);
    });
  }, [filteredPois, center]);

  return (
    <div className="space-y-2">
      <PillToggleGroup
        options={filterOptions}
        value={activeCategory}
        onChange={(v) => setActiveCategory(v as string)}
        className="justify-start"
      />
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-gold-primary/15">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-gold-primary" />
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {Object.entries(categoryColors).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-muted-foreground capitalize">{categoryLabels[cat]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyNeighborhoodMap;
export { generatePOIs };

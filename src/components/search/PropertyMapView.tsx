import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BaseProperty } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Home, Bed, Bath, Maximize2 } from 'lucide-react';
import { formatIDR } from '@/utils/currency';

interface PropertyMapViewProps {
  properties: BaseProperty[];
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({ properties, onPropertyClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Initialize map centered on Indonesia
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [106.8456, -6.2088], // Jakarta coordinates
      zoom: 11,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(
      new mapboxgl.FullscreenControl(),
      'top-right'
    );

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add markers for properties
  useEffect(() => {
    if (!map.current || !properties.length) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;

    properties.forEach((property) => {
      // For demo: generate coordinates based on location or use default
      // In production, properties should have lat/lng in database
      const coords = getCoordinatesForProperty(property);
      
      if (coords) {
        hasValidCoordinates = true;
        bounds.extend(coords);

        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = property.listing_type === 'sale' ? '#3b82f6' : '#10b981';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        
        // Safely add price text without XSS risk
        const priceSpan = document.createElement('span');
        priceSpan.style.cssText = 'color: white; font-weight: bold; font-size: 12px;';
        priceSpan.textContent = formatPrice(property.price);
        el.appendChild(priceSpan);

        // Create marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map.current!);

        // Add click event
        el.addEventListener('click', () => {
          setSelectedProperty(property);
          map.current?.flyTo({
            center: coords,
            zoom: 14,
            duration: 1000
          });
        });

        markers.current.push(marker);
      }
    });

    // Fit map to markers
    if (hasValidCoordinates && markers.current.length > 0) {
      map.current?.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000
      });
    }
  }, [properties, mapboxToken]);

  // Helper function to get coordinates (placeholder - should come from database)
  const getCoordinatesForProperty = (property: BaseProperty): [number, number] | null => {
    // Default Jakarta area coordinates with random offset for demo
    const baseCoords: [number, number] = [106.8456, -6.2088];
    
    // Add random offset to spread markers (in production, use actual property coordinates)
    const offset = 0.05;
    return [
      baseCoords[0] + (Math.random() - 0.5) * offset,
      baseCoords[1] + (Math.random() - 0.5) * offset
    ];
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  };

  // Token input UI
  if (!mapboxToken && !showTokenInput) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <Card className="p-6 max-w-md text-center">
          <h3 className="text-lg font-semibold mb-2">Map View Requires Mapbox Token</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To use the map view, please add your Mapbox public token.
            Get one for free at{' '}
            <a
              href="https://mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <Button onClick={() => setShowTokenInput(true)}>
            Enter Mapbox Token
          </Button>
        </Card>
      </div>
    );
  }

  if (!mapboxToken && showTokenInput) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <Card className="p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-4">Enter Mapbox Token</h3>
          <input
            type="text"
            placeholder="pk.eyJ1..."
            className="w-full px-3 py-2 border rounded-md mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setMapboxToken((e.target as HTMLInputElement).value);
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const input = document.querySelector('input') as HTMLInputElement;
                setMapboxToken(input.value);
              }}
              className="flex-1"
            >
              Confirm
            </Button>
            <Button variant="outline" onClick={() => setShowTokenInput(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Property detail card */}
      {selectedProperty && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 p-4 shadow-lg z-10">
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={selectedProperty.thumbnail_url || selectedProperty.image_urls?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'}
                alt={selectedProperty.title}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2">
                  {selectedProperty.title}
                </h3>
                <p className="text-lg font-bold text-primary">
                  {formatIDR(selectedProperty.price)}
                </p>
              </div>
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bed className="h-3 w-3" />
                <span>{selectedProperty.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-3 w-3" />
                <span>{selectedProperty.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />
                <span>{selectedProperty.area_sqm}m²</span>
              </div>
            </div>

            <Button
              onClick={() => onPropertyClick(selectedProperty)}
              className="w-full"
              size="sm"
            >
              View Details
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PropertyMapView;

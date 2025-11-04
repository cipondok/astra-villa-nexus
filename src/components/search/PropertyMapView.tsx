import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BaseProperty } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  X, Home, Bed, Bath, Maximize2, Circle, Pentagon, Trash2, 
  Layers, Save, BookmarkPlus, Flame 
} from 'lucide-react';
import { formatIDR } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';

interface SavedArea {
  id: string;
  name: string;
  type: 'polygon' | 'circle';
  feature: any;
  radius?: number;
  createdAt: string;
}

interface PropertyMapViewProps {
  properties: BaseProperty[];
  onPropertyClick: (property: BaseProperty) => void;
  onFilterByArea?: (filteredProperties: BaseProperty[]) => void;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({ properties, onPropertyClick, onFilterByArea }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const clusterMarkers = useRef<mapboxgl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [drawMode, setDrawMode] = useState<'none' | 'polygon' | 'circle'>('none');
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [drawnArea, setDrawnArea] = useState<any>(null);
  const [circleRadius, setCircleRadius] = useState<number>(2000);
  const [useClustering, setUseClustering] = useState<boolean>(true);
  const [savedAreas, setSavedAreas] = useState<SavedArea[]>([]);
  const [areaName, setAreaName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [selectedSavedArea, setSelectedSavedArea] = useState<string>('');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [heatmapMode, setHeatmapMode] = useState<'density' | 'price'>('density');
  const { toast } = useToast();

  // Load saved areas from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedSearchAreas');
    if (saved) {
      try {
        setSavedAreas(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved areas:', e);
      }
    }
  }, []);

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

    // Initialize Mapbox Draw
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      styles: [
        // Polygon fill
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#3b82f6',
            'fill-outline-color': '#3b82f6',
            'fill-opacity': 0.2,
          },
        },
        // Polygon outline
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3,
          },
        },
        // Vertex points
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#ffffff',
            'circle-stroke-color': '#3b82f6',
            'circle-stroke-width': 2,
          },
        },
      ],
    });

    map.current.addControl(draw.current as any);

    // Handle draw events
    map.current.on('draw.create', handleDrawCreate);
    map.current.on('draw.update', handleDrawCreate);
    map.current.on('draw.delete', handleDrawDelete);

    return () => {
      if (map.current) {
        map.current.off('draw.create', handleDrawCreate);
        map.current.off('draw.update', handleDrawCreate);
        map.current.off('draw.delete', handleDrawDelete);
      }
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      draw.current = null;
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add markers for properties
  useEffect(() => {
    if (!map.current || !properties.length) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    clusterMarkers.current.forEach(marker => marker.remove());
    clusterMarkers.current = [];

    if (useClustering) {
      // Use GeoJSON clustering
      setupClustering();
    } else {
      // Use individual markers
      setupIndividualMarkers();
    }
  }, [properties, mapboxToken, useClustering, showHeatmap, heatmapMode]);

  // Setup clustering with GeoJSON
  const setupClustering = () => {
    if (!map.current) return;

    // Remove existing sources and layers
    if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
    if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
    if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
    if (map.current.getLayer('heatmap-layer')) map.current.removeLayer('heatmap-layer');
    if (map.current.getSource('properties')) map.current.removeSource('properties');

    // Create GeoJSON features from properties
    const features = properties.map(property => {
      const coords = getCoordinatesForProperty(property);
      if (!coords) return null;

      // Normalize price for heatmap (0-1 scale based on price range)
      const maxPrice = Math.max(...properties.map(p => p.price));
      const minPrice = Math.min(...properties.map(p => p.price));
      const normalizedPrice = maxPrice > minPrice 
        ? (property.price - minPrice) / (maxPrice - minPrice)
        : 0.5;

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: coords,
        },
        properties: {
          id: property.id,
          title: property.title,
          price: property.price,
          normalizedPrice: normalizedPrice,
          listingType: property.listing_type,
          propertyData: JSON.stringify(property),
        },
      };
    }).filter(f => f !== null);

    // Add source
    map.current.addSource('properties', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features as any,
      },
      cluster: true,
      clusterMaxZoom: 16,
      clusterRadius: 50,
    });

    // Add heatmap layer
    map.current.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'properties',
      paint: {
        // Increase weight based on price or density
        'heatmap-weight': heatmapMode === 'price' 
          ? ['interpolate', ['linear'], ['get', 'normalizedPrice'], 0, 0, 1, 1]
          : 1,
        
        // Increase intensity as zoom increases
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
        
        // Color ramp for heatmap
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)',
        ],
        
        // Adjust radius by zoom level
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
        
        // Transition from heatmap to circle layer at higher zoom
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 14, showHeatmap ? 0.7 : 0],
      },
    }, 'clusters');

    // Add cluster circles layer
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'properties',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#10b981',
          10,
          '#3b82f6',
          25,
          '#8b5cf6',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          25,
          40,
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': showHeatmap ? 0 : 1,
      },
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'properties',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14,
      },
      paint: {
        'text-color': '#ffffff',
        'text-opacity': showHeatmap ? 0 : 1,
      },
    });

    // Add unclustered points layer
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'properties',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'listingType'], 'sale'],
          '#3b82f6',
          '#10b981',
        ],
        'circle-radius': 12,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': showHeatmap ? 0 : 1,
      },
    });

    // Handle cluster clicks
    map.current.on('click', 'clusters', (e) => {
      if (!map.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });

      const clusterId = features[0].properties?.cluster_id;
      const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource;
      
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current) return;

        map.current.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom + 0.5,
          duration: 500,
        });
      });
    });

    // Handle unclustered point clicks
    map.current.on('click', 'unclustered-point', (e) => {
      if (!e.features?.[0]) return;
      
      const propertyData = e.features[0].properties?.propertyData;
      if (propertyData) {
        const property = JSON.parse(propertyData);
        setSelectedProperty(property);
        
        map.current?.flyTo({
          center: (e.features[0].geometry as any).coordinates,
          zoom: 14,
          duration: 1000,
        });
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'unclustered-point', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

    // Fit bounds to properties
    if (features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      features.forEach(feature => {
        if (feature?.geometry.coordinates) {
          bounds.extend(feature.geometry.coordinates as [number, number]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15,
        duration: 1000,
      });
    }
  };

  // Setup individual markers (non-clustered)
  const setupIndividualMarkers = () => {
    if (!map.current) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;

    properties.forEach((property) => {
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
  };

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

  // Check if point is inside polygon
  const isPointInPolygon = (point: [number, number], polygon: number[][][]): boolean => {
    const [lng, lat] = point;
    const rings = polygon[0];
    let inside = false;

    for (let i = 0, j = rings.length - 1; i < rings.length; j = i++) {
      const xi = rings[i][0], yi = rings[i][1];
      const xj = rings[j][0], yj = rings[j][1];

      const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Handle draw create/update
  const handleDrawCreate = (e: any) => {
    const data = draw.current?.getAll();
    if (!data || data.features.length === 0) return;

    const feature = data.features[0];
    setDrawnArea(feature);

    // Filter properties within drawn area
    const filtered = properties.filter(property => {
      const coords = getCoordinatesForProperty(property);
      if (!coords) return false;

      if (feature.geometry.type === 'Polygon') {
        return isPointInPolygon(coords, feature.geometry.coordinates);
      }
      return false;
    });

    setFilteredCount(filtered.length);
    if (onFilterByArea) {
      onFilterByArea(filtered);
    }

    // Update marker visibility
    markers.current.forEach((marker, index) => {
      const property = properties[index];
      const coords = getCoordinatesForProperty(property);
      if (coords && feature.geometry.type === 'Polygon') {
        const isInside = isPointInPolygon(coords, feature.geometry.coordinates);
        const element = marker.getElement();
        element.style.opacity = isInside ? '1' : '0.3';
        element.style.pointerEvents = isInside ? 'auto' : 'none';
      }
    });
  };

  // Handle draw delete
  const handleDrawDelete = () => {
    setDrawnArea(null);
    setFilteredCount(null);
    setDrawMode('none');
    
    if (onFilterByArea) {
      onFilterByArea(properties);
    }

    // Reset marker visibility
    markers.current.forEach(marker => {
      const element = marker.getElement();
      element.style.opacity = '1';
      element.style.pointerEvents = 'auto';
    });
  };

  // Start drawing polygon
  const startDrawPolygon = () => {
    if (!draw.current) return;
    draw.current.deleteAll();
    draw.current.changeMode('draw_polygon');
    setDrawMode('polygon');
    setDrawnArea(null);
    setFilteredCount(null);
  };

  // Start drawing circle (approximated as polygon)
  const startDrawCircle = () => {
    if (!draw.current || !map.current) return;
    
    // Clear existing drawings
    draw.current.deleteAll();
    setDrawMode('circle');
    setDrawnArea(null);
    setFilteredCount(null);

    updateCircle();
  };

  // Update circle with current radius
  const updateCircle = () => {
    if (!draw.current || !map.current) return;

    // Clear existing circle
    draw.current.deleteAll();

    // Get center of current map view
    const center = map.current.getCenter();
    const points = 64;
    const coordinates: number[][] = [];

    // Create circle as polygon using current radius
    for (let i = 0; i <= points; i++) {
      const angle = (i * 360) / points;
      const dx = circleRadius * Math.cos(angle * Math.PI / 180) / 111320;
      const dy = circleRadius * Math.sin(angle * Math.PI / 180) / (111320 * Math.cos(center.lat * Math.PI / 180));
      coordinates.push([center.lng + dx, center.lat + dy]);
    }

    // Add circle to map
    const circleFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coordinates],
      },
      properties: {},
    };

    draw.current.add(circleFeature);
    handleDrawCreate({ features: [circleFeature] });
  };

  // Handle radius change
  const handleRadiusChange = (value: number[]) => {
    setCircleRadius(value[0]);
    if (drawMode === 'circle' && drawnArea) {
      // Redraw circle with new radius
      setTimeout(() => updateCircle(), 0);
    }
  };

  // Format radius for display
  const formatRadius = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  // Save current drawn area
  const saveCurrentArea = () => {
    if (!drawnArea || !areaName.trim()) {
      toast({
        title: "Error",
        description: "Please draw an area and enter a name",
        variant: "destructive",
      });
      return;
    }

    if (drawMode === 'none') {
      toast({
        title: "Error",
        description: "Please select a draw mode first",
        variant: "destructive",
      });
      return;
    }

    const newArea: SavedArea = {
      id: Date.now().toString(),
      name: areaName.trim(),
      type: drawMode,
      feature: drawnArea,
      radius: drawMode === 'circle' ? circleRadius : undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedAreas = [...savedAreas, newArea];
    setSavedAreas(updatedAreas);
    localStorage.setItem('savedSearchAreas', JSON.stringify(updatedAreas));
    
    setAreaName('');
    setShowSaveDialog(false);
    
    toast({
      title: "Area Saved",
      description: `"${newArea.name}" has been saved to your favorites`,
    });
  };

  // Load a saved area
  const loadSavedArea = (areaId: string) => {
    const area = savedAreas.find(a => a.id === areaId);
    if (!area || !draw.current) return;

    // Clear existing drawings
    draw.current.deleteAll();
    
    // Add the saved area
    draw.current.add(area.feature);
    setDrawnArea(area.feature);
    setDrawMode(area.type);
    
    if (area.radius) {
      setCircleRadius(area.radius);
    }

    // Trigger filtering
    handleDrawCreate({ features: [area.feature] });

    // Fit map to the loaded area
    if (map.current && area.feature.geometry) {
      const coordinates = area.feature.geometry.coordinates[0];
      const bounds = new mapboxgl.LngLatBounds();
      
      coordinates.forEach((coord: [number, number]) => {
        bounds.extend(coord);
      });
      
      map.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000,
      });
    }

    toast({
      title: "Area Loaded",
      description: `"${area.name}" has been loaded`,
    });
  };

  // Delete a saved area
  const deleteSavedArea = (areaId: string) => {
    const area = savedAreas.find(a => a.id === areaId);
    const updatedAreas = savedAreas.filter(a => a.id !== areaId);
    setSavedAreas(updatedAreas);
    localStorage.setItem('savedSearchAreas', JSON.stringify(updatedAreas));
    
    if (selectedSavedArea === areaId) {
      setSelectedSavedArea('');
    }

    toast({
      title: "Area Deleted",
      description: area ? `"${area.name}" has been removed` : "Area removed",
    });
  };

  // Clear drawn area
  const clearDrawnArea = () => {
    if (!draw.current) return;
    draw.current.deleteAll();
    handleDrawDelete();
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

      {/* Drawing Tools */}
      <Card className="absolute top-4 left-4 p-3 shadow-lg z-10 w-72">
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Map Controls
          </div>
          
          {/* Clustering Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="clustering" className="text-xs cursor-pointer">
              Property Clustering
            </Label>
            <Switch
              id="clustering"
              checked={useClustering}
              onCheckedChange={setUseClustering}
            />
          </div>

          {/* Heatmap Toggle */}
          <div className="flex items-center justify-between pb-2 border-b">
            <Label htmlFor="heatmap" className="text-xs cursor-pointer flex items-center gap-1">
              <Flame className="h-3 w-3" />
              Heatmap Overlay
            </Label>
            <Switch
              id="heatmap"
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
            />
          </div>

          {/* Heatmap Mode Selection */}
          {showHeatmap && (
            <div className="space-y-2 pb-2 border-b">
              <Label className="text-xs">Heatmap Mode</Label>
              <Select value={heatmapMode} onValueChange={(value: 'density' | 'price') => setHeatmapMode(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="density">Property Density</SelectItem>
                  <SelectItem value="price">Price Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Saved Areas */}
          {savedAreas.length > 0 && (
            <div className="space-y-2 pb-2 border-b">
              <Label className="text-xs">Saved Search Areas</Label>
              <div className="flex gap-1">
                <Select value={selectedSavedArea} onValueChange={(value) => {
                  setSelectedSavedArea(value);
                  loadSavedArea(value);
                }}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Load saved area..." />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        <div className="flex items-center gap-2">
                          {area.type === 'circle' ? <Circle className="h-3 w-3" /> : <Pentagon className="h-3 w-3" />}
                          <span>{area.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSavedArea && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteSavedArea(selectedSavedArea)}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-xs font-semibold text-muted-foreground">
            Draw Search Area
          </div>
          <Button
            size="sm"
            variant={drawMode === 'polygon' ? 'default' : 'outline'}
            onClick={startDrawPolygon}
            className="w-full justify-start"
          >
            <Pentagon className="h-4 w-4 mr-2" />
            Polygon
          </Button>
          <Button
            size="sm"
            variant={drawMode === 'circle' ? 'default' : 'outline'}
            onClick={startDrawCircle}
            className="w-full justify-start"
          >
            <Circle className="h-4 w-4 mr-2" />
            Circle
          </Button>
          
          {/* Radius Slider for Circle */}
          {drawMode === 'circle' && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Search Radius</Label>
                <Badge variant="secondary" className="text-xs font-mono">
                  {formatRadius(circleRadius)}
                </Badge>
              </div>
              <Slider
                value={[circleRadius]}
                onValueChange={handleRadiusChange}
                min={500}
                max={10000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>500m</span>
                <span>10km</span>
              </div>
            </div>
          )}

          {drawnArea && (
            <>
              {!showSaveDialog ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full justify-start"
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save This Area
                </Button>
              ) : (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs">Save Search Area</Label>
                  <Input
                    placeholder="Enter area name..."
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveCurrentArea();
                      }
                    }}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={saveCurrentArea}
                      className="flex-1 h-7"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowSaveDialog(false);
                        setAreaName('');
                      }}
                      className="h-7"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <Button
                size="sm"
                variant="destructive"
                onClick={clearDrawnArea}
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Area
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Filtered Results Badge */}
      {filteredCount !== null && (
        <Badge className="absolute top-4 right-4 z-10 py-2 px-4 text-sm">
          {filteredCount} {filteredCount === 1 ? 'property' : 'properties'} in area
        </Badge>
      )}

      {/* Heatmap Legend */}
      {showHeatmap && (
        <Card className="absolute bottom-4 right-4 p-3 shadow-lg z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-semibold">
                {heatmapMode === 'density' ? 'Property Density' : 'Price Distribution'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-4 rounded overflow-hidden" style={{ width: '120px' }}>
                <div style={{ flex: 1, background: 'rgb(103,169,207)' }} />
                <div style={{ flex: 1, background: 'rgb(209,229,240)' }} />
                <div style={{ flex: 1, background: 'rgb(253,219,199)' }} />
                <div style={{ flex: 1, background: 'rgb(239,138,98)' }} />
                <div style={{ flex: 1, background: 'rgb(178,24,43)' }} />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </Card>
      )}

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

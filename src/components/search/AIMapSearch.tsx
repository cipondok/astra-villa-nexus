import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapSearch, MapBounds, MapProperty } from "@/hooks/useMapSearch";
import { useCentralLocation } from "@/hooks/useCentralLocation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Price from "@/components/ui/Price";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, TrendingUp, Flame, Activity, BedDouble, X, Layers } from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ";

const ZONE_COLORS: Record<string, string> = {
  hot_investment: "#ef4444",
  growing: "#f59e0b",
  stable: "#3b82f6",
};

const ZONE_LABELS: Record<string, string> = {
  hot_investment: "Hot Investment Zone",
  growing: "Growing Zone",
  stable: "Stable Zone",
};

export default function AIMapSearch() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const { mapCenter, zoom: defaultZoom } = useCentralLocation();
  const navigate = useNavigate();

  const { data, isLoading } = useMapSearch(bounds);

  // Extract bounds from map
  const updateBounds = useCallback(() => {
    if (!map.current) return;
    const b = map.current.getBounds();
    setBounds({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: mapCenter,
      zoom: defaultZoom,
      minZoom: 5,
      maxZoom: 18,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setIsMapReady(true);
      updateBounds();
    });

    map.current.on("moveend", updateBounds);

    return () => {
      map.current?.remove();
    };
  }, []);

  // Render markers + heatmap
  useEffect(() => {
    if (!map.current || !isMapReady || !data) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Remove old heatmap layer/source
    if (map.current.getLayer("ai-heatmap")) map.current.removeLayer("ai-heatmap");
    if (map.current.getSource("ai-heatmap-source")) map.current.removeSource("ai-heatmap-source");

    // Add heatmap
    if (showHeatmap && data.heatmap_points.length > 0) {
      map.current.addSource("ai-heatmap-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: data.heatmap_points.map((pt) => ({
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: [pt.longitude, pt.latitude] },
            properties: { weight: pt.weight },
          })),
        },
      });

      map.current.addLayer({
        id: "ai-heatmap",
        type: "heatmap",
        source: "ai-heatmap-source",
        paint: {
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": 1.5,
          "heatmap-radius": 40,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "rgba(59,130,246,0.4)",
            0.4, "rgba(59,130,246,0.6)",
            0.6, "rgba(245,158,11,0.7)",
            0.8, "rgba(239,68,68,0.8)",
            1, "rgba(239,68,68,1)",
          ],
          "heatmap-opacity": 0.7,
        },
      });
    }

    // Add property markers
    for (const p of data.properties) {
      const el = document.createElement("div");
      el.className = "ai-map-marker";
      const color = ZONE_COLORS[p.zone] || "#3b82f6";
      el.style.cssText = `width:28px;height:28px;border-radius:50%;background:${color};border:2.5px solid white;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;transition:transform 0.15s;`;
      el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>`;
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.3)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([p.longitude, p.latitude])
        .addTo(map.current!);

      el.addEventListener("click", () => setSelectedProperty(p));
      markersRef.current.push(marker);
    }
  }, [data, showHeatmap, isMapReady]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-border gap-2 px-3 py-1.5 shadow-lg">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading AI insights...
          </Badge>
        </div>
      )}

      {/* Controls panel */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Card className="bg-background/90 backdrop-blur-sm border-border/60 shadow-lg">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">AI Investment Heatmap</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} id="heatmap-toggle" />
              <Label htmlFor="heatmap-toggle" className="text-xs text-muted-foreground">Show heatmap</Label>
            </div>
            {data && (
              <p className="text-[10px] text-muted-foreground">
                {data.total} properties in view
              </p>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        {showHeatmap && (
          <Card className="bg-background/90 backdrop-blur-sm border-border/60 shadow-lg">
            <CardContent className="p-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Zones</p>
              {Object.entries(ZONE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ZONE_COLORS[key] }} />
                  <span className="text-[10px] text-foreground">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected property panel */}
      {selectedProperty && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-sm">
          <Card className="bg-background/95 backdrop-blur-sm border-border/60 shadow-2xl overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-20 h-6 w-6"
              onClick={() => setSelectedProperty(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <div className="flex gap-3 p-3">
              {selectedProperty.thumbnail_url && (
                <img
                  src={selectedProperty.thumbnail_url}
                  alt={selectedProperty.title}
                  className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{selectedProperty.title}</h3>
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span className="text-[10px]">{selectedProperty.city}</span>
                </div>
                <p className="text-sm font-bold text-primary mt-1">
                  <Price amount={selectedProperty.price} short />
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge
                    className="text-[9px] px-1.5 py-0 text-white"
                    style={{ background: ZONE_COLORS[selectedProperty.zone] }}
                  >
                    {ZONE_LABELS[selectedProperty.zone]}
                  </Badge>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" /> {selectedProperty.investment_score.toFixed(0)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Activity className="h-3 w-3" /> {selectedProperty.heat_score.toFixed(0)}
                  </span>
                  {selectedProperty.bedrooms > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <BedDouble className="h-3 w-3" /> {selectedProperty.bedrooms}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="px-3 pb-3">
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate(`/property/${selectedProperty.id}`)}
              >
                View Property
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

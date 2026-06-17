import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { loadGoogleMaps, getGoogleMapsBrowserKey } from "./googleMapsLoader";
import { cn } from "@/lib/utils";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
}

interface AstraPropertyMapProps {
  markers: MapMarker[];
  highlightedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onMarkerHover?: (id: string | null) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  /** Optional fallback child rendered when Google Maps key is missing */
  fallback?: React.ReactNode;
}

// Dark gold-tinted map style matching ASTRA Black Gold theme
const ASTRA_DARK_STYLE: any[] = [
  { elementType: "geometry", stylers: [{ color: "#0b0b0c" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9c8a6a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0b0c" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1f1f22" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a1c" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2a2418" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#06080a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a4a5a" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0f0f10" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export default function AstraPropertyMap({
  markers,
  highlightedId,
  onMarkerClick,
  onMarkerHover,
  center,
  zoom = 11,
  className,
  fallback,
}: AstraPropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Init map once
  useEffect(() => {
    if (!getGoogleMapsBrowserKey()) {
      setStatus("error");
      setError("Google Maps Platform is not connected.");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        const initialCenter =
          center ||
          (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: -8.4095, lng: 115.1889 });
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: initialCenter,
          zoom,
          styles: ASTRA_DARK_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          backgroundColor: "#0b0b0c",
        });
        setStatus("ready");
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setStatus("error");
        setError(e.message);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google?.maps) return;
    const google = window.google;
    const existing = markersRef.current;

    // Remove markers no longer present
    const incomingIds = new Set(markers.map((m) => m.id));
    for (const [id, mk] of existing) {
      if (!incomingIds.has(id)) {
        mk.setMap(null);
        existing.delete(id);
      }
    }

    // Add/update markers
    const bounds = new google.maps.LatLngBounds();
    markers.forEach((m) => {
      if (typeof m.lat !== "number" || typeof m.lng !== "number") return;
      bounds.extend({ lat: m.lat, lng: m.lng });
      let mk = existing.get(m.id);
      if (!mk) {
        mk = new google.maps.Marker({
          position: { lat: m.lat, lng: m.lng },
          map: mapRef.current,
          title: m.title,
          icon: buildIcon(google, false),
          optimized: true,
        });
        mk.addListener("click", () => onMarkerClick?.(m.id));
        mk.addListener("mouseover", () => onMarkerHover?.(m.id));
        mk.addListener("mouseout", () => onMarkerHover?.(null));
        existing.set(m.id, mk);
      } else {
        mk.setPosition({ lat: m.lat, lng: m.lng });
        mk.setTitle(m.title);
      }
    });

    if (markers.length > 1) {
      mapRef.current.fitBounds(bounds, 48);
    } else if (markers.length === 1) {
      mapRef.current.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      mapRef.current.setZoom(13);
    }
  }, [markers, status, onMarkerClick, onMarkerHover]);

  // Highlight sync
  useEffect(() => {
    if (status !== "ready" || !window.google?.maps) return;
    const google = window.google;
    for (const [id, mk] of markersRef.current) {
      mk.setIcon(buildIcon(google, id === highlightedId));
      mk.setZIndex(id === highlightedId ? 999 : undefined);
    }
  }, [highlightedId, status]);

  if (status === "error") {
    return (
      <div
        className={cn(
          "relative rounded-2xl border border-border bg-muted/30 flex items-center justify-center text-center p-8",
          className,
        )}
      >
        {fallback ?? (
          <div className="max-w-sm">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Map unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-2xl overflow-hidden border border-border bg-muted/20", className)}>
      <div ref={containerRef} className="absolute inset-0" aria-label="Interactive property map" />
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading map…
          </div>
        </div>
      )}
      {status === "ready" && markers.length === 0 && (
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-xs text-muted-foreground border border-border flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          No properties to plot
        </div>
      )}
    </div>
  );
}

function buildIcon(google: any, highlighted: boolean) {
  const gold = "#C8A96A";
  const fill = highlighted ? gold : "#0b0b0c";
  const stroke = gold;
  const scale = highlighted ? 10 : 7;
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale,
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: stroke,
    strokeWeight: 2,
  };
}

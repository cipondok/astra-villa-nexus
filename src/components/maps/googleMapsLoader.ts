// Singleton loader for the Google Maps JS API.
// Uses the Lovable-managed referrer-restricted browser key.
//
// Returns a Promise that resolves once `window.google.maps` is ready.
// If the key is missing, the promise rejects with a friendly error so the
// caller can render a graceful fallback.

declare global {
  interface Window {
    google?: any;
    __astraGoogleMapsCallback?: () => void;
  }
}

let loaderPromise: Promise<typeof window.google> | null = null;

export function getGoogleMapsBrowserKey(): string | undefined {
  return import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as
    | string
    | undefined;
}

export function getGoogleMapsTrackingId(): string | undefined {
  return import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as
    | string
    | undefined;
}

export function loadGoogleMaps(): Promise<typeof window.google> {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Maps can only load in the browser"));
      return;
    }

    if (window.google?.maps) {
      resolve(window.google);
      return;
    }

    const key = getGoogleMapsBrowserKey();
    if (!key) {
      reject(
        new Error(
          "Google Maps Platform is not connected. Connect it from Settings → Connectors to enable interactive maps.",
        ),
      );
      return;
    }

    const channel = getGoogleMapsTrackingId();

    window.__astraGoogleMapsCallback = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps script loaded but window.google is unavailable"));
      }
    };

    const params = new URLSearchParams({
      key,
      libraries: "places",
      loading: "async",
      callback: "__astraGoogleMapsCallback",
      v: "weekly",
    });
    if (channel) params.set("channel", channel);

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

import { describe, it, expect, vi } from "vitest";
import { lazy } from "react";

// Mock heavy dependencies so we don't actually load three.js / mapbox in tests
vi.mock("three", () => ({}));
vi.mock("@react-three/fiber", () => ({ Canvas: ({ children }: any) => children }));
vi.mock("@react-three/drei", () => ({}));
vi.mock("mapbox-gl", () => ({ default: { Map: vi.fn() } }));

describe("Lazy Loading – Map & 3D Components", () => {
  it("PropertyMapView dynamic import resolves to a valid module", async () => {
    const mod = await import("@/components/search/PropertyMapView");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("Property3DModal dynamic import resolves", async () => {
    const mod = await import("@/components/property/Property3DModal");
    expect(mod.default).toBeDefined();
  });

  it("PropertyListingsSection dynamic import resolves", async () => {
    const mod = await import("@/components/PropertyListingsSection");
    expect(mod.default).toBeDefined();
  });

  it("PropertyListingMapView dynamic import resolves", async () => {
    const mod = await import("@/components/property/PropertyListingMapView");
    expect(mod.default).toBeDefined();
  });

  it("FilterMapView dynamic import resolves", async () => {
    const mod = await import("@/components/search/FilterMapView");
    expect(mod.default).toBeDefined();
  });

  it("lazy() wraps map component correctly", () => {
    const LazyMap = lazy(() => import("@/components/search/PropertyMapView"));
    expect(LazyMap).toBeDefined();
    expect(typeof LazyMap).toBe("object");
  });

  it("lazy() wraps 3D component correctly", () => {
    const Lazy3D = lazy(() => import("@/components/property/Property3DModal"));
    expect(Lazy3D).toBeDefined();
    expect(typeof Lazy3D).toBe("object");
  });
});

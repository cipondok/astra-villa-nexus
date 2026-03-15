export interface MapHeatColor {
  map_color: string;
  intensity_level: string;
}

export function getMapHeatColor(heat_score: number): MapHeatColor {
  const clamped = Math.max(0, Math.min(100, heat_score));

  if (clamped <= 25) return { map_color: "#93C5FD", intensity_level: "LOW" };
  if (clamped <= 50) return { map_color: "#FACC15", intensity_level: "MODERATE" };
  if (clamped <= 75) return { map_color: "#FB923C", intensity_level: "HIGH" };
  return { map_color: "#EF4444", intensity_level: "EXTREME" };
}

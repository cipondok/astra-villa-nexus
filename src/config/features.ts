// Phase 2 module flags. Flip to true when a module ships.
// Each key MUST correspond to a folder under src/modules/.
export const FEATURE_FLAGS = {
  "ai-assistant": false,
  "three-d-viewer": false,
  "virtual-tours": false,
  "crm": false,
  "pipeline": false,
  "automation": false,
  "analytics": false,
  "vendors": false,
  "notifications": false,
  "booking": false,
  "compliance": false,
  "portal": false,
  "multi-agent": false,
  "reporting": false,
  "recommendations": false,
} as const;

export type FeatureKey = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURE_FLAGS[key] === true;
}

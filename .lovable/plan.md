

## Plan: Add standalone route for AI Performance Dashboard

**What**: Add `/admin/ai-performance` as a routed page, importing the existing component.

**Changes** (1 file):

**`src/App.tsx`** — Add a new route after the existing admin routes (around line 228):
```tsx
import AIPerformanceDashboard from "@/components/admin/AIPerformanceDashboard";

<Route path="/admin/ai-performance" element={<AIPerformanceDashboard />} />
```

Note: The component lives at `src/components/admin/AIPerformanceDashboard.tsx`, not `src/pages/admin/`. The import path will reference the actual location. Also update `isAdminRoute` check (line 178) to include `/admin/ai-performance`.


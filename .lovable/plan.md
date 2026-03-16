

## Problem

The `InitialLoadingScreen` component is **lazy-loaded** (line 39 of `App.tsx`), wrapped in `<Suspense fallback={null}>` (line 628). This means during early page load, the browser must first download and parse the `InitialLoadingScreen` chunk before it can display anything. Until then, the user sees a blank white screen — defeating the purpose of a loading screen.

## Solution

**Eagerly import `InitialLoadingScreen`** so it's part of the main bundle and renders immediately on first paint. Also provide a lightweight inline fallback in the Suspense boundary so even if there's a brief parse delay, users see something.

### Changes

**`src/App.tsx`**:

1. Change `InitialLoadingScreen` from lazy to a direct import:
   ```tsx
   // Before (lazy — causes blank flash)
   const InitialLoadingScreen = lazy(() => import('@/components/ui/InitialLoadingScreen'));
   
   // After (eager — renders instantly)
   import InitialLoadingScreen from '@/components/ui/InitialLoadingScreen';
   ```

2. Remove the `<Suspense>` wrapper around `InitialLoadingScreen` since it's no longer lazy:
   ```tsx
   // Before
   <Suspense fallback={null}><InitialLoadingScreen key="loading" /></Suspense>
   
   // After
   <InitialLoadingScreen key="loading" />
   ```

3. Add a simple inline fallback to the main app `<Suspense>` boundaries so route transitions also show a spinner instead of blank:
   ```tsx
   const MinimalFallback = () => (
     <div className="min-h-screen flex items-center justify-center bg-background">
       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
     </div>
   );
   ```

This is a small, targeted fix. The `InitialLoadingScreen` component (~400 lines) adds minimal bundle overhead and is only used on first load, so eagerly importing it is the correct trade-off.


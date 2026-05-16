import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const AIMapSearch = lazy(() => import("@/components/search/AIMapSearch"));

export default function AIMapSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AIMapSearch />
    </Suspense>
  );
}

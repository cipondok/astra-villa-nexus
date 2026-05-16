import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const DigitalTwinViewer = lazy(() => import('@/components/property/DigitalTwinViewer'));

export default function DigitalTwinPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Property ID is required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <DigitalTwinViewer propertyId={id} className="h-screen" />
      </Suspense>
    </div>
  );
}

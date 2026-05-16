import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const InteractivePropertyMap = lazy(() => import('@/components/search/InteractivePropertyMap'));

export default function PropertyMapSearch() {
  return (
    <>
      <SEOHead
        title="Peta Properti Interaktif | ASTRA Villa"
        description="Cari properti di seluruh Indonesia dengan peta interaktif. Filter berdasarkan harga, kamar tidur, dan tipe properti."
        keywords="peta properti, cari properti peta, properti indonesia, real estate map"
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memuat peta...</p>
            </div>
          </div>
        }
      >
        <InteractivePropertyMap />
      </Suspense>
    </>
  );
}

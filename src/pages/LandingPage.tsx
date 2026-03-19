import { lazy, Suspense } from 'react';
import { SEOHead, seoSchemas } from '@/components/SEOHead';

const LandingHero = lazy(() => import('@/components/landing/LandingHero'));
const LandingBenefits = lazy(() => import('@/components/landing/LandingBenefits'));
const LandingFeatured = lazy(() => import('@/components/landing/LandingFeatured'));
const LandingDeveloper = lazy(() => import('@/components/landing/LandingDeveloper'));
const LandingServices = lazy(() => import('@/components/landing/LandingServices'));
const LandingTrustProof = lazy(() => import('@/components/landing/LandingTrustProof'));
const LandingLeadCapture = lazy(() => import('@/components/landing/LandingLeadCapture'));
const LandingFooter = lazy(() => import('@/components/landing/LandingFooter'));

const SectionLoader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const LandingPage = () => {
  return (
    <>
      <SEOHead
        title="AI-Powered Property Investment Platform"
        description="Discover elite property investment opportunities in Indonesia with AI-powered opportunity scoring, market intelligence, and rental yield insights."
        keywords="property investment indonesia, villa investment bali, AI real estate, luxury property"
        jsonLd={[seoSchemas.organization(), seoSchemas.realEstateAgent(), seoSchemas.searchAction()]}
      />
      <div className="min-h-screen bg-astra-navy-dark text-foreground overflow-x-hidden">
        <Suspense fallback={<SectionLoader />}><LandingHero /></Suspense>
        <Suspense fallback={<SectionLoader />}><LandingBenefits /></Suspense>
        <Suspense fallback={<SectionLoader />}><LandingFeatured /></Suspense>
        <Suspense fallback={<SectionLoader />}><LandingDeveloper /></Suspense>
        <Suspense fallback={<SectionLoader />}><LandingServices /></Suspense>
        <Suspense fallback={<SectionLoader />}><LandingTrustProof /></Suspense>
        <Suspense fallback={<SectionLoader />}><LandingLeadCapture /></Suspense>
        <Suspense fallback={<SectionLoader />}><LandingFooter /></Suspense>
      </div>
    </>
  );
};

export default LandingPage;

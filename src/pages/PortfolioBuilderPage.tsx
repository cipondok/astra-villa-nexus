import { Helmet } from 'react-helmet-async';
import PortfolioBuilderPanel from '@/components/investor/PortfolioBuilderPanel';

export default function PortfolioBuilderPage() {
  return (
    <>
      <Helmet>
        <title>AI Portfolio Builder | ASTRA</title>
        <meta name="description" content="Buat portfolio investasi properti terdiversifikasi dengan AI" />
      </Helmet>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <PortfolioBuilderPanel />
      </div>
    </>
  );
}

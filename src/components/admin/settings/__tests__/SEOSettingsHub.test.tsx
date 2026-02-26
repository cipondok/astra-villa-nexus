import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import SEOSettingsHub from '@/components/admin/settings/SEOSettingsHub';

const baseSettings: Record<string, any> = {
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoTitleTemplate: '{page} | {siteName}',
  seoDefaultRobots: 'index,follow',
  seoHreflang: 'id',
  seoAuditAutoRun: true,
  ogTitle: '',
  ogSiteName: '',
  ogDescription: '',
  ogImage: '',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  enableOpenGraph: true,
  enableSchemaMarkup: true,
  enableSitemap: true,
  enableCanonicalUrls: true,
  enableRobotsTxt: true,
  enableAnalytics: true,
  enableCookieConsent: true,
  organizationType: 'RealEstateAgent',
  organizationName: '',
  organizationLogo: '',
  customMetaTags: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  hotjarId: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  yandexVerification: '',
  pinterestVerification: '',
  schemaRealEstate: true,
  schemaBreadcrumb: true,
  schemaSearchAction: true,
  schemaFAQ: false,
  siteName: 'Test Site',
  siteDescription: 'Test description',
};

describe('SEOSettingsHub', () => {
  const mockOnInputChange = vi.fn();
  const mockOnSave = vi.fn();

  const renderHub = (overrides: Record<string, any> = {}) =>
    render(
      <SEOSettingsHub
        settings={{ ...baseSettings, ...overrides }}
        loading={false}
        onInputChange={mockOnInputChange}
        onSave={mockOnSave}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the SEO Health Score card', () => {
    const { getByText } = renderHub();
    expect(getByText('SEO Health Score')).toBeInTheDocument();
  });

  it('renders all 8 tab triggers', () => {
    const { getByText } = renderHub();
    ['On-Page', 'Social', 'Schema', 'Technical', 'Analytics', 'Verification', 'Audit', 'Pages'].forEach(tab => {
      expect(getByText(tab)).toBeInTheDocument();
    });
  });

  it('defaults to On-Page tab content', () => {
    const { getByText } = renderHub();
    expect(getByText('On-Page SEO Settings')).toBeInTheDocument();
  });

  it('switches to Social tab on click', async () => {
    const user = userEvent.setup();
    const { getByText } = renderHub();
    await user.click(getByText('Social'));
    expect(getByText('Open Graph & Social Preview')).toBeInTheDocument();
  });

  it('switches to Schema tab on click', async () => {
    const user = userEvent.setup();
    const { getByText } = renderHub();
    await user.click(getByText('Schema'));
    expect(getByText('Schema Markup & Structured Data')).toBeInTheDocument();
  });

  it('switches to Audit tab on click', async () => {
    const user = userEvent.setup();
    const { getByText } = renderHub();
    await user.click(getByText('Audit'));
    expect(getByText('SEO Audit & Recommendations')).toBeInTheDocument();
  });

  it('switches to Pages tab on click', async () => {
    const user = userEvent.setup();
    const { getByText } = renderHub();
    await user.click(getByText('Pages'));
    expect(getByText('Page-Level SEO Manager')).toBeInTheDocument();
  });

  // SEO Score: defaults give 30 (OG=5, Schema=10, Sitemap=10, Canonical=5)
  it('scores 30 for default-true toggles only', () => {
    const { getByText } = renderHub();
    expect(getByText('30')).toBeInTheDocument();
    expect(getByText('Poor')).toBeInTheDocument();
  });

  it('scores 45 with optimal title added', () => {
    const { getByText } = renderHub({ seoTitle: 'A great title for SEO optimization test' });
    expect(getByText('45')).toBeInTheDocument();
  });

  it('scores 100 when all checks pass', () => {
    const { getByText } = renderHub({
      seoTitle: 'A perfectly optimized SEO title here now',
      seoDescription: 'This is a meta description that is exactly within the optimal range for search engines to display in results pages nicely and clearly',
      seoKeywords: 'property, villa, bali',
      ogImage: 'https://example.com/image.jpg',
      googleAnalyticsId: 'G-123456',
      googleSiteVerification: 'abc123',
    });
    expect(getByText('100')).toBeInTheDocument();
    expect(getByText('Excellent')).toBeInTheDocument();
  });

  it('calls onSave when Save button is clicked', async () => {
    const user = userEvent.setup();
    const { getByText } = renderHub();
    await user.click(getByText('Save SEO Settings'));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on save button', () => {
    const { getByText } = render(
      <SEOSettingsHub settings={baseSettings} loading={true} onInputChange={mockOnInputChange} onSave={mockOnSave} />
    );
    expect(getByText('Saving...')).toBeInTheDocument();
  });

  it('shows Google preview with current settings', () => {
    const { getByText } = renderHub({ seoTitle: 'My SEO Title', seoDescription: 'My description text' });
    expect(getByText('My SEO Title')).toBeInTheDocument();
    expect(getByText('My description text')).toBeInTheDocument();
    expect(getByText('astra-villa-realty.lovable.app')).toBeInTheDocument();
  });

  it('renders page rows in Page-Level SEO', async () => {
    const user = userEvent.setup();
    const { getByText } = renderHub();
    await user.click(getByText('Pages'));
    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Dijual')).toBeInTheDocument();
    expect(getByText('/dijual')).toBeInTheDocument();
  });

  it('renders JSON-LD preview in Schema tab', async () => {
    const user = userEvent.setup();
    const { getByText } = renderHub({ organizationName: 'Astra Realty' });
    await user.click(getByText('Schema'));
    expect(getByText(/"name": "Astra Realty"/)).toBeInTheDocument();
  });
});

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight } from "lucide-react";
import { ContentType } from "@/hooks/useAIContentGenerator";

interface ExampleScenario {
  id: number;
  title: string;
  description: string;
  type: ContentType;
  variables: Record<string, any>;
  expectedOutput: string;
}

const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    id: 1,
    title: "Luxury Villa Listing",
    description: "Generate a compelling description for a high-end Bali villa",
    type: 'property_description',
    variables: {
      property_type: 'Villa',
      location: 'Canggu, Bali',
      bedrooms: 5,
      bathrooms: 6,
      size_sqm: 450,
      land_area: 800,
      price: 'IDR 12,500,000,000',
      features: 'Infinity pool, ocean views, smart home, private garden, outdoor kitchen',
      year_built: 2023,
      condition: 'New'
    },
    expectedOutput: "Luxury description with emotional hooks, lifestyle benefits, and investment appeal"
  },
  {
    id: 2,
    title: "Seminyak Neighborhood Guide",
    description: "Create an area guide for expatriates and investors",
    type: 'neighborhood_highlights',
    variables: {
      area_name: 'Seminyak',
      city: 'Bali',
      property_types: 'Villas, boutique hotels, commercial spaces',
      price_range: 'IDR 5B - 25B',
      target_audience: 'Expats'
    },
    expectedOutput: "Comprehensive guide covering lifestyle, amenities, investment potential"
  },
  {
    id: 3,
    title: "Jakarta Q3 Market Report",
    description: "Generate professional market analysis for South Jakarta",
    type: 'market_report',
    variables: {
      location: 'South Jakarta',
      property_type: 'Residential',
      time_period: 'Q3 2024',
      avg_price: 'IDR 4.2B',
      price_change_percent: 6.5,
      inventory_level: 'Moderate',
      avg_dom: 52,
      demand_level: 'High'
    },
    expectedOutput: "Data-driven report with trends, forecasts, and actionable recommendations"
  },
  {
    id: 4,
    title: "Foreign Buyer How-To",
    description: "Step-by-step guide for foreigners buying in Indonesia",
    type: 'how_to_guide',
    variables: {
      user_type: 'Foreign Buyer',
      topic: 'Buying property in Bali as a foreigner - complete legal guide',
      experience_level: 'Beginner',
      goal: 'Successfully purchase and hold Indonesian property',
      pain_points: 'Complex regulations, PMA company setup, title types, notary selection'
    },
    expectedOutput: "Clear step-by-step instructions with legal considerations and tips"
  },
  {
    id: 5,
    title: "Instagram New Listing",
    description: "Create viral social media posts for a new beachfront property",
    type: 'social_media',
    variables: {
      property_type: 'Beachfront Villa',
      location: 'Uluwatu, Bali',
      price: 'IDR 18B',
      key_feature: 'Direct cliff access and private beach',
      bedrooms: 4,
      size_sqm: 380,
      target_audience: 'Luxury Buyers',
      platform: 'All Platforms'
    },
    expectedOutput: "Platform-optimized posts with hashtags, emojis, and engagement hooks"
  },
  {
    id: 6,
    title: "Investment Success Story",
    description: "Create a compelling case study of a successful property investment",
    type: 'success_story',
    variables: {
      client_type: 'Investor',
      transaction_type: 'Investment',
      property_type: '3-unit villa complex',
      location: 'Pererenan, Bali',
      challenge: 'Finding high-yield property under USD 500k with proven rental income',
      solution: 'Off-market deal with existing Airbnb management in place',
      result: '18% annual ROI, 85% occupancy, break-even in 5 years',
      timeline: '6 weeks from search to keys'
    },
    expectedOutput: "Engaging narrative with specific results and testimonial"
  },
  {
    id: 7,
    title: "Monthly Newsletter",
    description: "Generate an engaging email newsletter for subscribers",
    type: 'newsletter',
    variables: {
      theme: 'Spring Investment Opportunities in Bali',
      featured_count: 4,
      audience: 'Investors',
      market_summary: 'Strong tourism recovery, 15% price growth YoY, limited inventory',
      season: 'March 2024',
      promotions: 'Free property valuation, 1% reduced commission for newsletter subscribers',
      events: 'Virtual property tour March 15, Investment webinar March 22'
    },
    expectedOutput: "Complete newsletter with subject lines, sections, and CTAs"
  },
  {
    id: 8,
    title: "SEO Blog - Best Areas",
    description: "Write an SEO-optimized article about Bali property investment areas",
    type: 'blog_article',
    variables: {
      topic: 'Top 10 Areas to Buy Property in Bali 2024 - Investment Guide',
      primary_keyword: 'buy property Bali',
      secondary_keywords: 'Bali real estate investment, best areas Bali property, villa investment Bali, Canggu property, Seminyak real estate',
      location: 'Bali, Indonesia',
      target_reader: 'Foreign Investors',
      word_count: '1500',
      unique_angle: 'ROI data, rental yield comparisons, 5-year growth projections per area'
    },
    expectedOutput: "Complete article with SEO elements, H2s, and structured content"
  },
  {
    id: 9,
    title: "First-Time Buyer Guide",
    description: "Help local Indonesian first-time buyers navigate the process",
    type: 'how_to_guide',
    variables: {
      user_type: 'First-time Buyer',
      topic: 'Membeli Rumah Pertama di Jakarta - Panduan Lengkap',
      experience_level: 'Beginner',
      goal: 'Purchase first home in Jakarta within budget',
      pain_points: 'KPR approval, choosing location, negotiating price, hidden costs'
    },
    expectedOutput: "Bilingual guide with practical tips for Indonesian buyers"
  },
  {
    id: 10,
    title: "Apartment Complex Launch",
    description: "Create multi-platform content for a new development launch",
    type: 'social_media',
    variables: {
      property_type: 'New Luxury Apartment Complex',
      location: 'Sudirman, Jakarta',
      price: 'From IDR 2.5B',
      key_feature: 'Smart home technology, co-working spaces, rooftop infinity pool',
      bedrooms: 2,
      size_sqm: 85,
      target_audience: 'Young Professionals',
      platform: 'All Platforms'
    },
    expectedOutput: "Launch campaign content for Instagram, Facebook, LinkedIn, TikTok"
  }
];

interface ExampleScenariosProps {
  onSelectScenario: (type: ContentType, variables: Record<string, any>) => void;
  onGenerate: (type: ContentType, variables: Record<string, any>) => void;
}

const ExampleScenarios = ({ onSelectScenario, onGenerate }: ExampleScenariosProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Example Scenarios
        </CardTitle>
        <CardDescription>
          Try these pre-filled examples to see the AI content generator in action
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXAMPLE_SCENARIOS.map((scenario) => (
            <div 
              key={scenario.id}
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  #{scenario.id}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {scenario.type.replace(/_/g, ' ')}
                </Badge>
              </div>
              <h4 className="font-medium mb-1">{scenario.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {scenario.description}
              </p>
              <p className="text-xs text-muted-foreground italic mb-3">
                → {scenario.expectedOutput}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelectScenario(scenario.type, scenario.variables)}
                >
                  View Template
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => onGenerate(scenario.type, scenario.variables)}
                >
                  Generate
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExampleScenarios;

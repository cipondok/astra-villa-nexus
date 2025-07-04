import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, TrendingUp, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedAutoPricingCalculatorProps {
  categoryCode: string;
  location: {
    province: string;
    city: string;
  };
  propertyType: 'residential' | 'commercial';
  onPriceChange: (pricing: {
    basePrice: number;
    commercialPrice: number;
    multiplier: number;
    minimumPrice: number;
    currency: string;
  }) => void;
}

const EnhancedAutoPricingCalculator = ({ 
  categoryCode, 
  location, 
  propertyType,
  onPriceChange 
}: EnhancedAutoPricingCalculatorProps) => {
  const [pricingData, setPricingData] = useState({
    basePrice: 0,
    commercialPrice: 0,
    multiplier: 1.0,
    minimumPrice: 0,
    currency: 'IDR'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculatePricing();
  }, [categoryCode, location, propertyType]);

  const calculatePricing = async () => {
    setLoading(true);
    
    try {
      // Fetch pricing rules from database
      const { data: pricingRules } = await supabase
        .from('service_pricing_rules')
        .select('*')
        .or(`service_category.eq.${categoryCode},service_category.eq.default`)
        .eq('is_active', true)
        .order('service_category', { ascending: false }); // Prioritize specific category over default

      // Get base pricing for residential
      const residentialRule = pricingRules?.find(rule => 
        rule.property_type === 'residential' && 
        (rule.service_category === categoryCode || rule.service_category === 'default')
      );

      // Get commercial pricing
      const commercialRule = pricingRules?.find(rule => 
        rule.property_type === 'commercial' && 
        (rule.service_category === categoryCode || rule.service_category === 'default')
      );

      // Location-based adjustments
      const locationMultiplier = getLocationMultiplier(location);
      
      // Category-specific base prices
      const categoryBasePrices = {
        'cleaning_residential': 75000,
        'ac_repair': 150000,
        'shifting_services': 200000,
        'furniture': 100000,
        'car_rentals': 300000,
        'default': 100000
      };

      const basePrice = categoryBasePrices[categoryCode] || categoryBasePrices.default;
      const adjustedBasePrice = basePrice * locationMultiplier;

      const commercialMultiplier = commercialRule?.base_multiplier || 1.5;
      const commercialPrice = adjustedBasePrice * commercialMultiplier;

      const finalPricing = {
        basePrice: adjustedBasePrice,
        commercialPrice: commercialPrice,
        multiplier: commercialMultiplier,
        minimumPrice: propertyType === 'commercial' 
          ? (commercialRule?.minimum_price || adjustedBasePrice * 1.5)
          : (residentialRule?.minimum_price || adjustedBasePrice),
        currency: 'IDR'
      };

      setPricingData(finalPricing);
      onPriceChange(finalPricing);
      
    } catch (error) {
      console.error('Error calculating pricing:', error);
      
      // Fallback pricing
      const fallbackPrice = 100000;
      const fallbackPricing = {
        basePrice: fallbackPrice,
        commercialPrice: fallbackPrice * 1.5,
        multiplier: 1.5,
        minimumPrice: fallbackPrice,
        currency: 'IDR'
      };
      
      setPricingData(fallbackPricing);
      onPriceChange(fallbackPricing);
    } finally {
      setLoading(false);
    }
  };

  const getLocationMultiplier = (location: { province: string; city: string }): number => {
    // Jakarta and major cities get higher pricing
    const premiumCities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan'];
    const isJakarta = location.province === 'DKI Jakarta';
    const isPremiumCity = premiumCities.some(city => 
      location.city.toLowerCase().includes(city.toLowerCase())
    );

    if (isJakarta) return 1.3; // 30% premium for Jakarta
    if (isPremiumCity) return 1.2; // 20% premium for major cities
    return 1.0; // Standard pricing for other areas
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryDisplayName = (code: string): string => {
    const categoryNames = {
      'cleaning_residential': 'Layanan Kebersihan',
      'ac_repair': 'Perbaikan AC',
      'shifting_services': 'Jasa Pindahan',
      'furniture': 'Furniture',
      'car_rentals': 'Rental Mobil',
      'default': 'Layanan Umum'
    };
    return categoryNames[code] || categoryNames.default;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center space-x-2">
            <Calculator className="h-5 w-5 animate-spin" />
            <span>Calculating pricing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Smart Pricing Calculator
          <Badge variant={propertyType === 'commercial' ? 'destructive' : 'secondary'}>
            {propertyType === 'commercial' ? 'Commercial' : 'Residential'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Category</p>
            <p className="font-semibold">{getCategoryDisplayName(categoryCode)}</p>
          </div>
          <div className="space-y-1 flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-semibold">{location.city}, {location.province}</p>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Base Residential Pricing */}
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200">
                    🏠 Residential Rate
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Standard pricing for home services
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(pricingData.basePrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Commercial Pricing */}
            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                    🏢 Commercial Rate
                  </h4>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    {pricingData.multiplier}x multiplier (+{((pricingData.multiplier - 1) * 100).toFixed(0)}%)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
                    {formatCurrency(pricingData.commercialPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Pricing */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    Current Rate: {propertyType === 'commercial' ? 'Commercial' : 'Residential'}
                  </p>
                  <p className="text-sm">
                    Minimum charge: {formatCurrency(pricingData.minimumPrice)}
                  </p>
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(propertyType === 'commercial' ? pricingData.commercialPrice : pricingData.basePrice)}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Pricing Factors */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Pricing Factors Applied:</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Base Service Rate</span>
              <span>{formatCurrency(100000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Location Adjustment ({location.city})</span>
              <span>+{getLocationMultiplier(location) === 1.3 ? '30%' : getLocationMultiplier(location) === 1.2 ? '20%' : '0%'}</span>
            </div>
            <div className="flex justify-between">
              <span>Property Type ({propertyType})</span>
              <span>{propertyType === 'commercial' ? `+${((pricingData.multiplier - 1) * 100).toFixed(0)}%` : '0%'}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Final Rate</span>
              <span>{formatCurrency(propertyType === 'commercial' ? pricingData.commercialPrice : pricingData.basePrice)}</span>
            </div>
          </div>
        </div>

        {/* Commercial Notice */}
        {propertyType === 'commercial' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Commercial Pricing Note:</strong> Higher rates account for business insurance, 
              commercial compliance requirements, and increased service complexity.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAutoPricingCalculator;
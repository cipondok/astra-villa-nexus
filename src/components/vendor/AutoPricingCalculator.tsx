import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, MapPin, Clock } from "lucide-react";
import IndonesianValidator, { PROVINCE_MINIMUM_WAGES } from "@/utils/indonesianValidation";

interface PricingInput {
  name: string;
  label: string;
  type: 'number' | 'select';
  unit?: string;
  options?: string[];
  required?: boolean;
}

interface PricingFormula {
  base: number;
  multipliers: { [key: string]: number | { [key: string]: number } };
  minimums: { [key: string]: number };
  unit: string;
  description: string;
}

interface AutoPricingCalculatorProps {
  categoryCode: string;
  location?: {
    province: string;
    city: string;
  };
  onPriceChange: (pricing: {
    basePrice: number;
    finalPrice: number;
    breakdown: { [key: string]: number };
    recommendations: string[];
  }) => void;
}

const AutoPricingCalculator = ({ 
  categoryCode, 
  location,
  onPriceChange 
}: AutoPricingCalculatorProps) => {
  const [inputs, setInputs] = useState<{ [key: string]: any }>({});
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [priceBreakdown, setPriceBreakdown] = useState<{ [key: string]: number }>({});
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Pricing formulas for different categories
  const getPricingFormula = (categoryCode: string): PricingFormula => {
    const formulas: { [key: string]: PricingFormula } = {
      // Cleaning Services - Per square meter
      'cleaning_residential': {
        base: 15000,
        multipliers: {
          'difficulty': { 'easy': 1.0, 'medium': 1.3, 'hard': 1.6 },
          'frequency': { 'one_time': 1.0, 'weekly': 0.8, 'monthly': 0.9 },
          'rooms': { '1-2': 1.0, '3-4': 1.2, '5+': 1.4 }
        },
        minimums: { 'base': 100000 }, // Minimum order 100k
        unit: 'per m²',
        description: 'Harga dasar pembersihan rumah'
      },

      'cleaning_commercial': {
        base: 25000,
        multipliers: {
          'building_type': { 'office': 1.0, 'retail': 1.2, 'warehouse': 0.8 },
          'timing': { 'day': 1.0, 'night': 1.3, 'weekend': 1.4 },
          'frequency': { 'daily': 0.7, 'weekly': 0.8, 'monthly': 1.0 }
        },
        minimums: { 'base': 300000 },
        unit: 'per m²',
        description: 'Harga pembersihan komersial'
      },

      // AC Repair - Per unit
      'split_units': {
        base: 250000,
        multipliers: {
          'service_type': { 'cleaning': 1.0, 'repair': 1.5, 'installation': 2.0 },
          'ac_type': { 'split_0.5pk': 1.0, 'split_1pk': 1.2, 'split_1.5pk': 1.4, 'split_2pk': 1.6 },
          'urgency': { 'normal': 1.0, 'urgent': 1.3, 'emergency': 1.6 }
        },
        minimums: { 'base': 150000 },
        unit: 'per unit',
        description: 'Biaya service AC split'
      },

      'central_ac': {
        base: 500000,
        multipliers: {
          'service_type': { 'maintenance': 1.0, 'repair': 1.8, 'overhaul': 2.5 },
          'capacity': { 'small': 1.0, 'medium': 1.5, 'large': 2.0 },
          'complexity': { 'simple': 1.0, 'complex': 1.8 }
        },
        minimums: { 'base': 400000 },
        unit: 'per system',
        description: 'Biaya service AC central'
      },

      // Car Rental - Per day
      'car_rentals': {
        base: 250000,
        multipliers: {
          'car_type': { 'city_car': 1.0, 'sedan': 1.3, 'suv': 1.8, 'luxury': 2.5 },
          'duration': { '1_day': 1.0, '3_days': 0.9, '1_week': 0.8, '1_month': 0.7 },
          'driver': { 'self_drive': 1.0, 'with_driver': 1.4 },
          'season': { 'low': 1.0, 'high': 1.3, 'peak': 1.6 }
        },
        minimums: { 'base': 200000 },
        unit: 'per day',
        description: 'Tarif sewa mobil harian'
      },

      // Shifting Services - Distance based
      'shifting_services': {
        base: 10000,
        multipliers: {
          'distance_km': 1.0, // Linear multiplier
          'load_size': { 'small': 1.0, 'medium': 1.5, 'large': 2.0, 'extra_large': 2.5 },
          'stairs': { 'none': 1.0, 'ground_floor': 1.0, '2_floors': 1.3, '3+_floors': 1.6 },
          'crew_size': { '2_people': 1.0, '4_people': 1.8, '6+_people': 2.5 }
        },
        minimums: { 'base': 200000 },
        unit: 'per km + base',
        description: 'Biaya jasa pindahan'
      },

      // Furniture - Per item
      'sofas': {
        base: 2000000,
        multipliers: {
          'material': { 'fabric': 1.0, 'leather': 1.8, 'premium_leather': 2.5 },
          'size': { '2_seater': 1.0, '3_seater': 1.4, 'sectional': 2.0 },
          'brand': { 'local': 1.0, 'imported': 1.6, 'luxury': 2.8 }
        },
        minimums: { 'base': 1500000 },
        unit: 'per piece',
        description: 'Harga sofa'
      },

      'beds': {
        base: 1500000,
        multipliers: {
          'size': { 'single': 1.0, 'double': 1.3, 'queen': 1.6, 'king': 2.0 },
          'material': { 'wood': 1.0, 'metal': 0.8, 'upholstered': 1.4 },
          'mattress': { 'without': 1.0, 'basic': 1.3, 'premium': 1.8 }
        },
        minimums: { 'base': 1000000 },
        unit: 'per set',
        description: 'Harga tempat tidur'
      }
    };

    return formulas[categoryCode] || {
      base: 100000,
      multipliers: {},
      minimums: { 'base': 50000 },
      unit: 'per service',
      description: 'Harga layanan standar'
    };
  };

  // Input fields for different categories
  const getPricingInputs = (categoryCode: string): PricingInput[] => {
    const inputDefinitions: { [key: string]: PricingInput[] } = {
      'cleaning_residential': [
        { name: 'area_sqm', label: 'Luas Area (m²)', type: 'number', unit: 'm²', required: true },
        { name: 'difficulty', label: 'Tingkat Kesulitan', type: 'select', options: ['easy', 'medium', 'hard'] },
        { name: 'frequency', label: 'Frekuensi', type: 'select', options: ['one_time', 'weekly', 'monthly'] },
        { name: 'rooms', label: 'Jumlah Ruangan', type: 'select', options: ['1-2', '3-4', '5+'] }
      ],

      'cleaning_commercial': [
        { name: 'area_sqm', label: 'Luas Bangunan (m²)', type: 'number', unit: 'm²', required: true },
        { name: 'building_type', label: 'Jenis Bangunan', type: 'select', options: ['office', 'retail', 'warehouse'] },
        { name: 'timing', label: 'Waktu Kerja', type: 'select', options: ['day', 'night', 'weekend'] },
        { name: 'frequency', label: 'Frekuensi', type: 'select', options: ['daily', 'weekly', 'monthly'] }
      ],

      'split_units': [
        { name: 'units_count', label: 'Jumlah Unit AC', type: 'number', unit: 'unit', required: true },
        { name: 'service_type', label: 'Jenis Service', type: 'select', options: ['cleaning', 'repair', 'installation'] },
        { name: 'ac_type', label: 'Tipe AC', type: 'select', options: ['split_0.5pk', 'split_1pk', 'split_1.5pk', 'split_2pk'] },
        { name: 'urgency', label: 'Tingkat Urgensi', type: 'select', options: ['normal', 'urgent', 'emergency'] }
      ],

      'car_rentals': [
        { name: 'days', label: 'Jumlah Hari', type: 'number', unit: 'hari', required: true },
        { name: 'car_type', label: 'Jenis Mobil', type: 'select', options: ['city_car', 'sedan', 'suv', 'luxury'] },
        { name: 'duration', label: 'Durasi Sewa', type: 'select', options: ['1_day', '3_days', '1_week', '1_month'] },
        { name: 'driver', label: 'Sopir', type: 'select', options: ['self_drive', 'with_driver'] },
        { name: 'season', label: 'Musim', type: 'select', options: ['low', 'high', 'peak'] }
      ],

      'shifting_services': [
        { name: 'distance_km', label: 'Jarak (KM)', type: 'number', unit: 'km', required: true },
        { name: 'load_size', label: 'Ukuran Barang', type: 'select', options: ['small', 'medium', 'large', 'extra_large'] },
        { name: 'stairs', label: 'Tingkat Lantai', type: 'select', options: ['none', 'ground_floor', '2_floors', '3+_floors'] },
        { name: 'crew_size', label: 'Jumlah Pekerja', type: 'select', options: ['2_people', '4_people', '6+_people'] }
      ]
    };

    return inputDefinitions[categoryCode] || [];
  };

  const formula = getPricingFormula(categoryCode);
  const pricingInputs = getPricingInputs(categoryCode);

  // Calculate price based on inputs
  const calculatePrice = () => {
    if (!inputs || Object.keys(inputs).length === 0) return;

    let basePrice = formula.base;
    let finalPrice = basePrice;
    const breakdown: { [key: string]: number } = { 'Base Price': basePrice };
    const newRecommendations: string[] = [];

    // Apply multipliers
    Object.entries(formula.multipliers).forEach(([key, multiplier]) => {
      const inputValue = inputs[key];
      if (inputValue && multiplier && typeof multiplier === 'object') {
        const mult = (multiplier as { [key: string]: number })[inputValue as string];
        if (mult) {
          const addition = basePrice * (mult - 1);
          breakdown[`${key} (${inputValue})`] = addition;
          finalPrice *= mult;
        }
      } else if (inputValue && typeof multiplier === 'number') {
        const addition = basePrice * inputValue * multiplier;
        breakdown[`${key} (${inputValue})`] = addition;
        finalPrice += addition;
      }
    });

    // Apply quantity multipliers
    const quantityFields = ['area_sqm', 'units_count', 'days', 'distance_km'];
    quantityFields.forEach(field => {
      if (inputs[field] && inputs[field] > 0) {
        finalPrice *= inputs[field];
        breakdown[`Quantity (${inputs[field]})`] = basePrice * (inputs[field] - 1);
      }
    });

    // Check minimums
    const minimumPrice = formula.minimums.base || 0;
    if (finalPrice < minimumPrice) {
      finalPrice = minimumPrice;
      breakdown['Minimum Charge'] = minimumPrice - Object.values(breakdown).reduce((a, b) => a + b, 0);
      newRecommendations.push(`Harga minimum ${IndonesianValidator.formatIDR(minimumPrice)} diterapkan`);
    }

    // Location-based adjustments
    if (location?.province) {
      const minWage = IndonesianValidator.getMinimumWage(location.province);
      if (minWage && finalPrice < minWage.minimumWage) {
        newRecommendations.push(`Pertimbangkan UMP ${location.province}: ${IndonesianValidator.formatIDR(minWage.minimumWage)}`);
      }
    }

    // Add competitive pricing suggestions
    if (finalPrice > basePrice * 3) {
      newRecommendations.push('Harga cukup tinggi - pertimbangkan untuk kompetitif');
    } else if (finalPrice < basePrice * 0.8) {
      newRecommendations.push('Harga mungkin terlalu rendah - pastikan masih menguntungkan');
    }

    setCalculatedPrice(Math.round(finalPrice));
    setPriceBreakdown(breakdown);
    setRecommendations(newRecommendations);

    // Callback to parent
    onPriceChange({
      basePrice,
      finalPrice: Math.round(finalPrice),
      breakdown,
      recommendations: newRecommendations
    });
  };

  useEffect(() => {
    calculatePrice();
  }, [inputs]);

  const handleInputChange = (fieldName: string, value: any) => {
    setInputs(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderInput = (input: PricingInput) => {
    if (input.type === 'select') {
      return (
        <div key={input.name} className="space-y-2">
          <Label>{input.label} {input.required && <span className="text-red-500">*</span>}</Label>
          <Select onValueChange={(value) => handleInputChange(input.name, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Pilih ${input.label}`} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div key={input.name} className="space-y-2">
        <Label htmlFor={input.name}>
          {input.label} {input.required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex">
          <Input
            id={input.name}
            type="number"
            min="0"
            value={inputs[input.name] || ''}
            onChange={(e) => handleInputChange(input.name, parseFloat(e.target.value) || 0)}
            className="rounded-r-none"
          />
          {input.unit && (
            <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground">
              {input.unit}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Auto Pricing Calculator
          <Badge variant="outline">{formula.unit}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{formula.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pricingInputs.map(renderInput)}
        </div>

        {/* Price Display */}
        <div className="border-t pt-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Estimated Price</h3>
                <p className="text-sm text-muted-foreground">Based on your inputs</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {IndonesianValidator.formatIDR(calculatedPrice)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formula.unit}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            {Object.keys(priceBreakdown).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Price Breakdown:</h4>
                {Object.entries(priceBreakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span>{key}</span>
                    <span>{IndonesianValidator.formatIDR(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Pricing Recommendations:
              </h4>
              <ul className="space-y-1">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Location Info */}
          {location && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Location: {location.city}, {location.province}</span>
                {PROVINCE_MINIMUM_WAGES.find(p => p.code === location.province) && (
                  <Badge variant="outline" className="ml-2">
                    UMP: {IndonesianValidator.formatIDR(
                      PROVINCE_MINIMUM_WAGES.find(p => p.code === location.province)!.minimumWage
                    )}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoPricingCalculator;
import React, { useState } from 'react';
import { Maximize2, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AIToolsTabBar from '@/components/common/AIToolsTabBar';
import BackToHomeLink from '@/components/common/BackToHomeLink';

const AreaUnitConverter = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('sqm');
  const [toUnit, setToUnit] = useState<string>('sqft');
  const [result, setResult] = useState<number | null>(null);

  // Conversion rates to square meters
  const conversionRates: Record<string, number> = {
    sqm: 1,
    sqft: 0.092903,
    hectare: 10000,
    acre: 4046.86,
    are: 100
  };

  const unitLabels: Record<string, string> = {
    sqm: 'Square Meters (m²)',
    sqft: 'Square Feet (ft²)',
    hectare: 'Hectares (ha)',
    acre: 'Acres',
    are: 'Ares'
  };

  const convert = () => {
    const value = parseFloat(inputValue);
    if (value && fromUnit && toUnit) {
      const valueInSqm = value * conversionRates[fromUnit];
      const convertedValue = valueInSqm / conversionRates[toUnit];
      setResult(convertedValue);
    }
  };

  React.useEffect(() => {
    if (inputValue) {
      convert();
    }
  }, [inputValue, fromUnit, toUnit]);

  return (
    <div className="min-h-screen bg-background pt-11 md:pt-12">
      {/* Luxury Background - matches home page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-2 md:px-4 py-2 md:py-4 max-w-4xl">
        {/* Back Link */}
        <BackToHomeLink sectionId="ai-tools-section" alwaysShow />
        
        {/* AI Tools Tab Bar */}
        <AIToolsTabBar className="mb-3" />

        {/* Header - Slim, centered */}
        <div className="text-center mb-3 md:mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Maximize2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <ArrowRightLeft className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
          </div>
          <h1 className="text-sm md:text-lg font-bold text-foreground">Area Unit Converter</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">Convert between different area measurements instantly</p>
        </div>

      <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs md:text-sm">Convert Area Units</CardTitle>
          <CardDescription className="text-[10px] md:text-xs">Enter a value and select units to convert</CardDescription>
        </CardHeader>
        <CardContent className="p-3 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inputValue">From</Label>
            <div className="flex gap-2">
              <Input
                id="inputValue"
                type="number"
                placeholder="Enter value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(unitLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="toUnit">To</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(unitLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {result !== null && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Result</p>
                  <p className="text-3xl font-bold text-primary">
                    {result.toLocaleString('id-ID', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6 
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{unitLabels[toUnit]}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p className="font-semibold mb-2">Common Conversions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>1 Hectare = 10,000 m² = 2.47 Acres</li>
              <li>1 Acre = 4,046.86 m² = 0.405 Hectares</li>
              <li>1 m² = 10.764 ft²</li>
              <li>1 Are = 100 m²</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AreaUnitConverter;

import React, { useState } from 'react';
import { Calculator, Home, Hammer, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ConstructionCostCalculator = () => {
  const [area, setArea] = useState<string>('');
  const [buildingType, setBuildingType] = useState<string>('standard');
  const [floors, setFloors] = useState<string>('1');
  const [totalCost, setTotalCost] = useState<number | null>(null);

  const costPerSqm = {
    economy: 3500000,
    standard: 5000000,
    premium: 7500000,
    luxury: 12000000
  };

  const calculateCost = () => {
    const sqm = parseFloat(area);
    const numFloors = parseInt(floors);
    
    if (sqm && numFloors && buildingType) {
      const baseRate = costPerSqm[buildingType as keyof typeof costPerSqm];
      const total = sqm * baseRate * numFloors;
      setTotalCost(total);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-10 h-10 text-primary" />
          <Hammer className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Construction Cost Calculator</h1>
        <p className="text-muted-foreground">Estimate your building construction costs in Indonesia</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculate Building Costs</CardTitle>
          <CardDescription>Enter your project details to get an estimate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="area">Building Area (sqm)</Label>
            <Input
              id="area"
              type="number"
              placeholder="Enter area in square meters"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingType">Building Type</Label>
            <Select value={buildingType} onValueChange={setBuildingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select building type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy (Rp 3.5M/sqm)</SelectItem>
                <SelectItem value="standard">Standard (Rp 5M/sqm)</SelectItem>
                <SelectItem value="premium">Premium (Rp 7.5M/sqm)</SelectItem>
                <SelectItem value="luxury">Luxury (Rp 12M/sqm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="floors">Number of Floors</Label>
            <Input
              id="floors"
              type="number"
              min="1"
              max="10"
              value={floors}
              onChange={(e) => setFloors(e.target.value)}
            />
          </div>

          <Button onClick={calculateCost} className="w-full" size="lg">
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Cost
          </Button>

          {totalCost && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Estimated Total Cost</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(totalCost)}</p>
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Area</p>
                        <p className="font-semibold">{area} sqm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rate/sqm</p>
                        <p className="font-semibold">
                          {formatCurrency(costPerSqm[buildingType as keyof typeof costPerSqm])}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p className="font-semibold mb-2">Note:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Prices are estimates based on average Indonesian construction costs</li>
              <li>Actual costs may vary based on location, materials, and labor</li>
              <li>Does not include land acquisition, permits, or design fees</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConstructionCostCalculator;

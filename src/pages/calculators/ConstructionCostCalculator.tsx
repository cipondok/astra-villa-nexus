import React, { useState } from 'react';
import { Calculator, Home, Hammer, DollarSign, Building2, Wrench, PaintBucket, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface CostBreakdown {
  foundation: number;
  structure: number;
  walls: number;
  roofing: number;
  flooring: number;
  plumbing: number;
  electrical: number;
  finishing: number;
  parking?: number;
  landscaping?: number;
  total: number;
}

const ConstructionCostCalculator = () => {
  const [area, setArea] = useState<string>('');
  const [buildingType, setBuildingType] = useState<string>('standard');
  const [floors, setFloors] = useState<string>('1');
  const [includeParking, setIncludeParking] = useState(false);
  const [includeLandscaping, setIncludeLandscaping] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);

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
      const totalArea = sqm * numFloors;
      
      // Cost breakdown percentages
      const breakdown: CostBreakdown = {
        foundation: totalArea * baseRate * 0.15, // 15%
        structure: totalArea * baseRate * 0.25,   // 25%
        walls: totalArea * baseRate * 0.15,       // 15%
        roofing: totalArea * baseRate * 0.10,     // 10%
        flooring: totalArea * baseRate * 0.08,    // 8%
        plumbing: totalArea * baseRate * 0.07,    // 7%
        electrical: totalArea * baseRate * 0.10,  // 10%
        finishing: totalArea * baseRate * 0.10,   // 10%
        total: totalArea * baseRate
      };

      // Add optional features
      if (includeParking) {
        breakdown.parking = sqm * 500000; // Rp 500k per sqm for parking
        breakdown.total += breakdown.parking;
      }

      if (includeLandscaping) {
        breakdown.landscaping = sqm * 300000; // Rp 300k per sqm for landscaping
        breakdown.total += breakdown.landscaping;
      }

      setCostBreakdown(breakdown);
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

          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base">Additional Features</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="parking"
                checked={includeParking}
                onCheckedChange={(checked) => setIncludeParking(checked as boolean)}
              />
              <Label htmlFor="parking" className="text-sm font-normal cursor-pointer">
                Include Parking Area (Rp 500k/sqm)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="landscaping"
                checked={includeLandscaping}
                onCheckedChange={(checked) => setIncludeLandscaping(checked as boolean)}
              />
              <Label htmlFor="landscaping" className="text-sm font-normal cursor-pointer">
                Include Landscaping (Rp 300k/sqm)
              </Label>
            </div>
          </div>

          <Button onClick={calculateCost} className="w-full" size="lg">
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Cost
          </Button>

          {costBreakdown && (
            <div className="space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Estimated Total Cost</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(costBreakdown.total)}</p>
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Area</p>
                          <p className="font-semibold">{parseFloat(area) * parseInt(floors)} sqm</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Floors</p>
                          <p className="font-semibold">{floors}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                  <CardDescription>Detailed construction cost analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Foundation Work</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(costBreakdown.foundation)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Structure & Frame</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(costBreakdown.structure)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Hammer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Walls & Masonry</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(costBreakdown.walls)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Roofing System</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(costBreakdown.roofing)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Flooring</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(costBreakdown.flooring)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Plumbing</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(costBreakdown.plumbing)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Electrical Systems</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(costBreakdown.electrical)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <PaintBucket className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Finishing & Paint</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(costBreakdown.finishing)}</span>
                  </div>

                  {costBreakdown.parking && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Parking Area</span>
                      </div>
                      <span className="font-semibold text-sm">{formatCurrency(costBreakdown.parking)}</span>
                    </div>
                  )}

                  {costBreakdown.landscaping && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Landscaping</span>
                      </div>
                      <span className="font-semibold text-sm">{formatCurrency(costBreakdown.landscaping)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3 bg-primary/5 px-3 rounded-md mt-2">
                    <span className="font-bold">Total Construction Cost</span>
                    <span className="font-bold text-primary">{formatCurrency(costBreakdown.total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
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

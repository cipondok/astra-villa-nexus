import React, { useState } from 'react';
import { Calculator, Home, Hammer, DollarSign, Building2, Wrench, PaintBucket, Zap, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AIToolsTabBar from '@/components/common/AIToolsTabBar';
import BackToHomeLink from '@/components/common/BackToHomeLink';

interface CostBreakdown {
  // Foundation & Structure (30%)
  excavation: number;
  foundation: number;
  columns: number;
  beams: number;
  slabs: number;
  
  // Walls & Masonry (20%)
  brickWork: number;
  plastering: number;
  
  // Roofing (10%)
  roofStructure: number;
  roofCovering: number;
  
  // Finishes (25%)
  flooring: number;
  tiles: number;
  doors: number;
  windows: number;
  painting: number;
  
  // MEP (15%)
  plumbing: number;
  electrical: number;
  sanitary: number;
  
  total: number;
}

const ConstructionCostCalculator = () => {
  const [city, setCity] = useState<string>('jakarta');
  const [area, setArea] = useState<string>('');
  const [coveredArea, setCoveredArea] = useState<string>('');
  const [constructionType, setConstructionType] = useState<string>('complete');
  const [constructionMode, setConstructionMode] = useState<string>('with-material');
  const [buildingQuality, setBuildingQuality] = useState<string>('standard');
  const [floors, setFloors] = useState<string>('1');
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);

  // Indonesian city cost multipliers
  const cityMultipliers = {
    jakarta: 1.2,
    surabaya: 1.0,
    bandung: 0.95,
    medan: 0.9,
    semarang: 0.85,
    bali: 1.15,
    yogyakarta: 0.85,
    makassar: 0.9
  };

  // Base costs per sqm in IDR for "Complete with Material"
  const baseCostPerSqm = {
    economy: 3500000,      // Rp 3.5 juta/m²
    standard: 5500000,     // Rp 5.5 juta/m²
    premium: 8500000,      // Rp 8.5 juta/m²
    luxury: 15000000       // Rp 15 juta/m²
  };

  const calculateCost = () => {
    const plotArea = parseFloat(area);
    const buildingArea = parseFloat(coveredArea) || plotArea;
    const numFloors = parseInt(floors);
    
    if (plotArea && buildingArea && numFloors && buildingQuality) {
      const baseRate = baseCostPerSqm[buildingQuality as keyof typeof baseCostPerSqm];
      const cityMultiplier = cityMultipliers[city as keyof typeof cityMultipliers];
      const totalBuildingArea = buildingArea * numFloors;
      
      // Adjust for construction type
      let typeMultiplier = 1.0;
      if (constructionType === 'grey-structure') {
        typeMultiplier = 0.55; // Grey structure is about 55% of complete
      }
      
      // Adjust for construction mode
      let modeMultiplier = 1.0;
      if (constructionMode === 'without-material') {
        modeMultiplier = 0.35; // Labor only is about 35% of total
      }
      
      const adjustedRate = baseRate * cityMultiplier * typeMultiplier * modeMultiplier;
      
      // Detailed breakdown based on Indonesian construction practices
      const breakdown: CostBreakdown = {
        // Foundation & Structure (30%)
        excavation: totalBuildingArea * adjustedRate * 0.05,
        foundation: totalBuildingArea * adjustedRate * 0.08,
        columns: totalBuildingArea * adjustedRate * 0.07,
        beams: totalBuildingArea * adjustedRate * 0.05,
        slabs: totalBuildingArea * adjustedRate * 0.05,
        
        // Walls & Masonry (20%)
        brickWork: totalBuildingArea * adjustedRate * 0.12,
        plastering: totalBuildingArea * adjustedRate * 0.08,
        
        // Roofing (10%)
        roofStructure: totalBuildingArea * adjustedRate * 0.06,
        roofCovering: totalBuildingArea * adjustedRate * 0.04,
        
        // Finishes (25%) - reduced if grey structure
        flooring: totalBuildingArea * adjustedRate * (constructionType === 'grey-structure' ? 0 : 0.08),
        tiles: totalBuildingArea * adjustedRate * (constructionType === 'grey-structure' ? 0 : 0.06),
        doors: totalBuildingArea * adjustedRate * (constructionType === 'grey-structure' ? 0 : 0.04),
        windows: totalBuildingArea * adjustedRate * (constructionType === 'grey-structure' ? 0 : 0.03),
        painting: totalBuildingArea * adjustedRate * (constructionType === 'grey-structure' ? 0 : 0.04),
        
        // MEP (15%)
        plumbing: totalBuildingArea * adjustedRate * 0.05,
        electrical: totalBuildingArea * adjustedRate * 0.06,
        sanitary: totalBuildingArea * adjustedRate * 0.04,
        
        total: totalBuildingArea * adjustedRate
      };

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
    <div className="min-h-screen bg-background pt-11 md:pt-12">
      <div className="container mx-auto px-3 md:px-4 py-4 max-w-4xl">
        {/* Back Link */}
        <BackToHomeLink sectionId="ai-tools-section" />
        
        {/* AI Tools Tab Bar */}
        <AIToolsTabBar className="mb-4" />

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Calculator className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <Hammer className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
          </div>
          <h1 className="text-xl md:text-3xl font-bold mb-1">Construction Cost Calculator</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Estimate your building construction costs in Indonesia</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculate Building Costs</CardTitle>
          <CardDescription>Enter your project details to get an accurate estimate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  City/Location
                </div>
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jakarta">Jakarta (+20%)</SelectItem>
                  <SelectItem value="surabaya">Surabaya (Base)</SelectItem>
                  <SelectItem value="bandung">Bandung (-5%)</SelectItem>
                  <SelectItem value="medan">Medan (-10%)</SelectItem>
                  <SelectItem value="semarang">Semarang (-15%)</SelectItem>
                  <SelectItem value="bali">Bali (+15%)</SelectItem>
                  <SelectItem value="yogyakarta">Yogyakarta (-15%)</SelectItem>
                  <SelectItem value="makassar">Makassar (-10%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Plot/Land Area (m²)</Label>
              <Input
                id="area"
                type="number"
                placeholder="Total land area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coveredArea">Building/Covered Area (m²)</Label>
              <Input
                id="coveredArea"
                type="number"
                placeholder="Actual building area"
                value={coveredArea}
                onChange={(e) => setCoveredArea(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave empty to use plot area</p>
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
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base">Construction Type</Label>
            <RadioGroup value={constructionType} onValueChange={setConstructionType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grey-structure" id="grey" />
                <Label htmlFor="grey" className="font-normal cursor-pointer">
                  Grey Structure (Foundation to roof only)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complete" id="complete" />
                <Label htmlFor="complete" className="font-normal cursor-pointer">
                  Complete Finishing (Move-in ready)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base">Construction Mode</Label>
            <RadioGroup value={constructionMode} onValueChange={setConstructionMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="with-material" id="with-mat" />
                <Label htmlFor="with-mat" className="font-normal cursor-pointer">
                  With Material (Material + Labor)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="without-material" id="without-mat" />
                <Label htmlFor="without-mat" className="font-normal cursor-pointer">
                  Without Material (Labor only)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Building Quality</Label>
            <Select value={buildingQuality} onValueChange={setBuildingQuality}>
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy (Rp 3.5M/m²)</SelectItem>
                <SelectItem value="standard">Standard (Rp 5.5M/m²)</SelectItem>
                <SelectItem value="premium">Premium (Rp 8.5M/m²)</SelectItem>
                <SelectItem value="luxury">Luxury (Rp 15M/m²)</SelectItem>
              </SelectContent>
            </Select>
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
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Plot Area</p>
                          <p className="font-semibold">{parseFloat(area)} m²</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Building Area</p>
                          <p className="font-semibold">{(parseFloat(coveredArea) || parseFloat(area)) * parseInt(floors)} m²</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">City</p>
                          <p className="font-semibold capitalize">{city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Cost Breakdown</CardTitle>
                  <CardDescription>Indonesian construction cost analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Foundation & Structure */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Foundation & Structure (30%)
                    </h3>
                    <div className="pl-6 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Excavation Work</span>
                        <span>{formatCurrency(costBreakdown.excavation)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Foundation & Footings</span>
                        <span>{formatCurrency(costBreakdown.foundation)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Columns (Kolom)</span>
                        <span>{formatCurrency(costBreakdown.columns)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Beams (Balok)</span>
                        <span>{formatCurrency(costBreakdown.beams)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Slabs (Plat Lantai)</span>
                        <span>{formatCurrency(costBreakdown.slabs)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Walls & Masonry */}
                  <div className="space-y-2 pt-2 border-t">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Hammer className="w-4 h-4" />
                      Walls & Masonry (20%)
                    </h3>
                    <div className="pl-6 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Brick Work (Pasangan Bata)</span>
                        <span>{formatCurrency(costBreakdown.brickWork)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plastering (Plesteran)</span>
                        <span>{formatCurrency(costBreakdown.plastering)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Roofing */}
                  <div className="space-y-2 pt-2 border-t">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Roofing System (10%)
                    </h3>
                    <div className="pl-6 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Roof Structure (Rangka Atap)</span>
                        <span>{formatCurrency(costBreakdown.roofStructure)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Roof Covering (Genteng)</span>
                        <span>{formatCurrency(costBreakdown.roofCovering)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Finishes - only show if complete construction */}
                  {constructionType === 'complete' && (
                    <div className="space-y-2 pt-2 border-t">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <PaintBucket className="w-4 h-4" />
                        Finishes (25%)
                      </h3>
                      <div className="pl-6 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Flooring (Lantai)</span>
                          <span>{formatCurrency(costBreakdown.flooring)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Wall & Floor Tiles</span>
                          <span>{formatCurrency(costBreakdown.tiles)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Doors (Pintu)</span>
                          <span>{formatCurrency(costBreakdown.doors)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Windows (Jendela)</span>
                          <span>{formatCurrency(costBreakdown.windows)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Painting (Pengecatan)</span>
                          <span>{formatCurrency(costBreakdown.painting)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MEP Systems */}
                  <div className="space-y-2 pt-2 border-t">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      MEP Systems (15%)
                    </h3>
                    <div className="pl-6 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plumbing (Pipa Air)</span>
                        <span>{formatCurrency(costBreakdown.plumbing)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Electrical (Instalasi Listrik)</span>
                        <span>{formatCurrency(costBreakdown.electrical)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sanitary (Sanitasi)</span>
                        <span>{formatCurrency(costBreakdown.sanitary)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 bg-primary/5 px-3 rounded-md mt-4">
                    <span className="font-bold">Total Construction Cost</span>
                    <span className="font-bold text-primary text-lg">{formatCurrency(costBreakdown.total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p className="font-semibold mb-2">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Prices are estimates based on 2025 Indonesian construction costs</li>
              <li>Actual costs may vary ±15% based on material quality, contractor, and market conditions</li>
              <li>Grey Structure includes: Foundation, columns, beams, slabs, walls, plastering, and roofing</li>
              <li>Complete Finishing adds: Flooring, tiles, doors, windows, and painting</li>
              <li>Does not include: Land acquisition, IMB permits, architect fees, or furniture</li>
              <li>Labor rates vary by region - city multiplier applied automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default ConstructionCostCalculator;

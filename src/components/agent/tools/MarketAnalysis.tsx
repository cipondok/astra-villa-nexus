
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, TrendingDown, MapPin } from "lucide-react";

const MarketAnalysis = () => {
  const [marketData] = useState([
    {
      id: 1,
      area: "Seminyak, Bali",
      avgPrice: "Rp 15,000,000,000",
      trend: "up",
      change: "+12%",
      demand: 85,
      supply: 65,
      category: "villa"
    },
    {
      id: 2,
      area: "SCBD, Jakarta",
      avgPrice: "Rp 350,000,000/month",
      trend: "up",
      change: "+8%",
      demand: 92,
      supply: 45,
      category: "apartment"
    },
    {
      id: 3,
      area: "Pondok Indah, Jakarta",
      avgPrice: "Rp 8,500,000,000",
      trend: "down",
      change: "-3%",
      demand: 70,
      supply: 80,
      category: "townhouse"
    },
    {
      id: 4,
      area: "Canggu, Bali",
      avgPrice: "Rp 12,000,000,000",
      trend: "up",
      change: "+15%",
      demand: 88,
      supply: 55,
      category: "house"
    }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Market Analysis
        </CardTitle>
        <CardDescription>Real-time market trends and pricing insights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketData.map((market) => (
            <div key={market.id} className="p-3 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{market.area}</span>
                  <Badge variant="outline">{market.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {market.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${market.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {market.change}
                  </span>
                </div>
              </div>
              
              <div className="text-lg font-semibold text-primary">
                {market.avgPrice}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Demand</span>
                    <span>{market.demand}%</span>
                  </div>
                  <Progress value={market.demand} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Supply</span>
                    <span>{market.supply}%</span>
                  </div>
                  <Progress value={market.supply} className="h-2" />
                </div>
              </div>
            </div>
          ))}
          <Button className="w-full" variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Full Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAnalysis;


import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, TrendingDown, MapPin, Download, RefreshCw } from "lucide-react";

const MarketAnalysis = () => {
  const [marketData, setMarketData] = useState([
    {
      id: 1,
      area: "Seminyak, Bali",
      avgPrice: "Rp 15,000,000,000",
      trend: "up",
      change: "+12%",
      demand: 85,
      supply: 65,
      category: "villa",
      lastUpdated: "2 hours ago"
    },
    {
      id: 2,
      area: "SCBD, Jakarta",
      avgPrice: "Rp 350,000,000/month",
      trend: "up",
      change: "+8%",
      demand: 92,
      supply: 45,
      category: "apartment",
      lastUpdated: "1 hour ago"
    },
    {
      id: 3,
      area: "Pondok Indah, Jakarta",
      avgPrice: "Rp 8,500,000,000",
      trend: "down",
      change: "-3%",
      demand: 70,
      supply: 80,
      category: "townhouse",
      lastUpdated: "3 hours ago"
    },
    {
      id: 4,
      area: "Canggu, Bali",
      avgPrice: "Rp 12,000,000,000",
      trend: "up",
      change: "+15%",
      demand: 88,
      supply: 55,
      category: "house",
      lastUpdated: "1 hour ago"
    }
  ]);

  const handleRefreshData = () => {
    // Simulate data refresh
    const updatedData = marketData.map(item => ({
      ...item,
      lastUpdated: "Just now"
    }));
    setMarketData(updatedData);
  };

  const handleDownloadReport = () => {
    // Simulate report download
    alert("Market analysis report will be downloaded");
  };

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
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Market data updated regularly for accurate insights
            </p>
            <Button size="sm" variant="outline" onClick={handleRefreshData}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          
          {marketData.map((market) => (
            <div key={market.id} className="p-4 border rounded-lg space-y-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{market.area}</span>
                  <Badge variant="outline">{market.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {market.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${market.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {market.change}
                  </span>
                </div>
              </div>
              
              <div className="text-xl font-bold text-primary">
                {market.avgPrice}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Demand</span>
                    <span className="text-muted-foreground">{market.demand}%</span>
                  </div>
                  <Progress value={market.demand} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Supply</span>
                    <span className="text-muted-foreground">{market.supply}%</span>
                  </div>
                  <Progress value={market.supply} className="h-2" />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Last updated: {market.lastUpdated}
              </p>
            </div>
          ))}
          
          <div className="pt-4 border-t flex gap-2">
            <Button className="flex-1" variant="outline" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button className="flex-1" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Charts
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAnalysis;

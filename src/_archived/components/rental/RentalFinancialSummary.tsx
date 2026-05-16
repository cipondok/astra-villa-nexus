import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Receipt, Landmark, Percent, ArrowUpRight } from "lucide-react";
import Price from "@/components/ui/Price";

interface FinancialSummaryProps {
  totalRentCollected: number;
  totalServiceCharges: number;
  totalTax: number;
  totalDues: number;
  totalRevenue: number;
  occupancyRate: number;
}

const RentalFinancialSummary = ({
  totalRentCollected, totalServiceCharges, totalTax, totalDues, totalRevenue, occupancyRate
}: FinancialSummaryProps) => {
  const items = [
    { icon: DollarSign, label: "Rent Collected", value: totalRentCollected, color: "text-chart-1", bg: "bg-chart-1/10" },
    { icon: Receipt, label: "Service Charges", value: totalServiceCharges, color: "text-chart-3", bg: "bg-chart-3/10" },
    { icon: Landmark, label: "Pajak (Tax)", value: totalTax, color: "text-destructive", bg: "bg-destructive/10" },
    { icon: ArrowUpRight, label: "Tunggakan (Dues)", value: totalDues, color: "text-chart-3", bg: "bg-chart-3/10" },
    { icon: TrendingUp, label: "Total Revenue", value: totalRevenue, color: "text-primary", bg: "bg-primary/10" },
    { icon: Percent, label: "Okupansi", value: null, color: "text-chart-1", bg: "bg-chart-1/10" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
      {items.map((item, i) => (
        <Card key={i} className="p-2">
          <div className="flex items-center gap-1.5">
            <div className={`h-6 w-6 rounded flex items-center justify-center flex-shrink-0 ${item.bg}`}>
              <item.icon className={`h-3 w-3 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] text-muted-foreground truncate">{item.label}</p>
              <p className="text-[10px] font-bold text-foreground truncate">
                {item.value !== null ? <Price amount={item.value} short /> : `${occupancyRate}%`}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RentalFinancialSummary;

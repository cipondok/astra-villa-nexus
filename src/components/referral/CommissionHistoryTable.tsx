import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Commission {
  id: string;
  order_amount: number | null;
  commission_rate: number;
  commission_amount: number;
  status: string | null;
  created_at: string;
  paid_at: string | null;
}

interface Props {
  commissions: Commission[];
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  paid: 'default',
  pending: 'secondary',
  processing: 'outline',
};

const CommissionHistoryTable = ({ commissions }: Props) => {
  if (!commissions.length) {
    return (
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commission History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-muted-foreground text-center py-4">
            No commissions yet. Earn by converting referrals into completed deals!
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalEarned = commissions.reduce((s, c) => s + c.commission_amount, 0);

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commission History
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Total: IDR {totalEarned.toLocaleString('id-ID')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {commissions.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50"
            >
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-medium">
                  IDR {c.commission_amount.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {c.commission_rate}% of IDR {(c.order_amount || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={statusVariant[c.status || 'pending'] || 'secondary'} className="text-[10px]">
                  {c.status || 'pending'}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionHistoryTable;

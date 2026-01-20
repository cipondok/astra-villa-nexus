import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Building2, Users, Wrench, ChevronRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useOrders } from './useOrders';
import { OrderStatusBadge } from './OrderStatusBadge';
import { CreateOrderDialog } from './CreateOrderDialog';
import type { OrderType } from './types';

const orderTypeIcons: Record<OrderType, React.ReactNode> = {
  property_investment: <Building2 className="h-4 w-4 text-blue-500" />,
  consultation_request: <Users className="h-4 w-4 text-green-500" />,
  service_booking: <Wrench className="h-4 w-4 text-amber-500" />,
};

const orderTypeLabels: Record<OrderType, string> = {
  property_investment: 'Investment',
  consultation_request: 'Consultation',
  service_booking: 'Service',
};

interface OrdersListProps {
  onSelectOrder?: (orderId: string) => void;
  maxHeight?: string;
}

export const OrdersList = ({ onSelectOrder, maxHeight = '400px' }: OrdersListProps) => {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">My Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-destructive">Failed to load orders</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            My Orders
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs mt-1">
            {orders?.length || 0} total orders
          </CardDescription>
        </div>
        <CreateOrderDialog />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first order to get started
            </p>
            <CreateOrderDialog>
              <Button size="sm" className="mt-3">
                Create Order
              </Button>
            </CreateOrderDialog>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder?.(order.id)}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors active:scale-[0.98]"
                >
                  <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                    {orderTypeIcons[order.order_type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {order.order_number}
                      </span>
                      <OrderStatusBadge status={order.status} className="text-[10px]" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium truncate mt-0.5">
                      {order.title}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

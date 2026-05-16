import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Building2, Users, Wrench, Loader2 } from 'lucide-react';
import { useCreateOrder } from './useOrders';
import type { OrderType } from './types';

const orderTypes: { value: OrderType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'property_investment',
    label: 'Property Investment',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Apply for property investment or KPR',
  },
  {
    value: 'consultation_request',
    label: 'Consultation Request',
    icon: <Users className="h-4 w-4" />,
    description: 'Book a consultation with our experts',
  },
  {
    value: 'service_booking',
    label: 'Service Booking',
    icon: <Wrench className="h-4 w-4" />,
    description: 'Book vendor services (survey, legal, etc.)',
  },
];

interface CreateOrderDialogProps {
  children?: React.ReactNode;
}

export const CreateOrderDialog = ({ children }: CreateOrderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('property_investment');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const createOrder = useCreateOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createOrder.mutateAsync({
      order_type: orderType,
      title,
      description,
    });
    
    setOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Submit a new order or application request.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Order Type</Label>
            <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {orderTypes.find(t => t.value === orderType)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your order"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Details</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your request..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrder.isPending || !title.trim()}>
              {createOrder.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMidtransPayment, PaymentMethod } from '@/hooks/useMidtransPayment';
import { Loader2, CreditCard, Wallet, Building2, QrCode, Store } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface MidtransPaymentButtonProps {
  orderId: string;
  amount: number;
  bookingId?: string;
  customerDetails?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
}

const paymentMethods = [
  { 
    id: 'gopay' as PaymentMethod, 
    name: 'GoPay', 
    icon: Wallet,
    category: 'E-Wallet'
  },
  { 
    id: 'shopeepay' as PaymentMethod, 
    name: 'ShopeePay', 
    icon: Wallet,
    category: 'E-Wallet'
  },
  { 
    id: 'dana' as PaymentMethod, 
    name: 'DANA', 
    icon: Wallet,
    category: 'E-Wallet'
  },
  { 
    id: 'ovo' as PaymentMethod, 
    name: 'OVO', 
    icon: Wallet,
    category: 'E-Wallet'
  },
  { 
    id: 'qris' as PaymentMethod, 
    name: 'QRIS', 
    icon: QrCode,
    category: 'QRIS'
  },
  { 
    id: 'bank_transfer_bca' as PaymentMethod, 
    name: 'BCA Virtual Account', 
    icon: Building2,
    category: 'Bank Transfer'
  },
  { 
    id: 'bank_transfer_bni' as PaymentMethod, 
    name: 'BNI Virtual Account', 
    icon: Building2,
    category: 'Bank Transfer'
  },
  { 
    id: 'bank_transfer_bri' as PaymentMethod, 
    name: 'BRI Virtual Account', 
    icon: Building2,
    category: 'Bank Transfer'
  },
  { 
    id: 'bank_transfer_mandiri' as PaymentMethod, 
    name: 'Mandiri Bill', 
    icon: Building2,
    category: 'Bank Transfer'
  },
  { 
    id: 'cstore_indomaret' as PaymentMethod, 
    name: 'Indomaret', 
    icon: Store,
    category: 'Convenience Store'
  },
  { 
    id: 'cstore_alfamart' as PaymentMethod, 
    name: 'Alfamart', 
    icon: Store,
    category: 'Convenience Store'
  },
];

export default function MidtransPaymentButton({
  orderId,
  amount,
  bookingId,
  customerDetails,
  onSuccess,
  onError,
  className,
  disabled,
}: MidtransPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const { isLoading, createPayment } = useMidtransPayment();

  const handlePayment = async (method?: PaymentMethod) => {
    try {
      const result = await createPayment({
        orderId,
        amount,
        bookingId,
        customerDetails,
        paymentType: method,
      });

      if (result) {
        setIsOpen(false);
        onSuccess?.(result);
      }
    } catch (error: any) {
      onError?.(error);
    }
  };

  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.category]) acc[method.category] = [];
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, typeof paymentMethods>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className={cn("gap-2", className)} 
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          Bayar Rp {amount.toLocaleString('id-ID')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Quick Pay - Opens Snap with all options */}
          <Button
            variant="default"
            className="w-full justify-start gap-3 h-14"
            onClick={() => handlePayment()}
            disabled={isLoading}
          >
            <CreditCard className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Semua Metode Pembayaran</div>
              <div className="text-xs opacity-70">Pilih dari semua opsi yang tersedia</div>
            </div>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Atau pilih langsung
              </span>
            </div>
          </div>

          {Object.entries(groupedMethods).map(([category, methods]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
              <div className="grid grid-cols-2 gap-2">
                {methods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.id}
                      variant="outline"
                      className={cn(
                        "justify-start gap-2 h-12",
                        selectedMethod === method.id && "border-primary"
                      )}
                      onClick={() => handlePayment(method.id)}
                      disabled={isLoading}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm truncate">{method.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Pembayaran diproses secara aman oleh Midtrans
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

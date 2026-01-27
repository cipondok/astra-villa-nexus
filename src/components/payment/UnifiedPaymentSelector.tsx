import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatIDR } from '@/utils/currency';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode, 
  Store,
  Globe,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export type PaymentGateway = 'midtrans' | 'paypal';
export type PaymentMethodType = 
  | 'gopay' | 'shopeepay' | 'dana' | 'ovo' | 'qris'
  | 'bank_transfer_bca' | 'bank_transfer_bni' | 'bank_transfer_bri' | 'bank_transfer_mandiri'
  | 'cstore_indomaret' | 'cstore_alfamart'
  | 'paypal';

interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  icon: React.ReactNode;
  gateway: PaymentGateway;
  category: 'ewallet' | 'bank' | 'retail' | 'international';
  popular?: boolean;
}

const text = {
  en: {
    title: "Select Payment Method",
    subtitle: "Choose your preferred payment method",
    ewallets: "E-Wallets",
    bankTransfer: "Bank Transfer",
    retail: "Retail/Convenience Store",
    international: "International",
    popular: "Popular",
    payNow: "Pay Now",
    processing: "Processing...",
    amount: "Amount",
    paypalNote: "Pay with PayPal or Credit/Debit Card"
  },
  id: {
    title: "Pilih Metode Pembayaran",
    subtitle: "Pilih metode pembayaran yang Anda inginkan",
    ewallets: "E-Wallet",
    bankTransfer: "Transfer Bank",
    retail: "Minimarket",
    international: "Internasional",
    popular: "Populer",
    payNow: "Bayar Sekarang",
    processing: "Memproses...",
    amount: "Jumlah",
    paypalNote: "Bayar dengan PayPal atau Kartu Kredit/Debit"
  }
};

const paymentMethods: PaymentMethod[] = [
  // E-Wallets
  { id: 'gopay', name: 'GoPay', icon: <Smartphone className="h-5 w-5" />, gateway: 'midtrans', category: 'ewallet', popular: true },
  { id: 'shopeepay', name: 'ShopeePay', icon: <Smartphone className="h-5 w-5" />, gateway: 'midtrans', category: 'ewallet', popular: true },
  { id: 'dana', name: 'DANA', icon: <Smartphone className="h-5 w-5" />, gateway: 'midtrans', category: 'ewallet' },
  { id: 'ovo', name: 'OVO', icon: <Smartphone className="h-5 w-5" />, gateway: 'midtrans', category: 'ewallet' },
  { id: 'qris', name: 'QRIS', icon: <QrCode className="h-5 w-5" />, gateway: 'midtrans', category: 'ewallet', popular: true },
  
  // Bank Transfer
  { id: 'bank_transfer_bca', name: 'BCA Virtual Account', icon: <Building2 className="h-5 w-5" />, gateway: 'midtrans', category: 'bank', popular: true },
  { id: 'bank_transfer_bni', name: 'BNI Virtual Account', icon: <Building2 className="h-5 w-5" />, gateway: 'midtrans', category: 'bank' },
  { id: 'bank_transfer_bri', name: 'BRI Virtual Account', icon: <Building2 className="h-5 w-5" />, gateway: 'midtrans', category: 'bank' },
  { id: 'bank_transfer_mandiri', name: 'Mandiri Virtual Account', icon: <Building2 className="h-5 w-5" />, gateway: 'midtrans', category: 'bank' },
  
  // Retail
  { id: 'cstore_indomaret', name: 'Indomaret', icon: <Store className="h-5 w-5" />, gateway: 'midtrans', category: 'retail' },
  { id: 'cstore_alfamart', name: 'Alfamart', icon: <Store className="h-5 w-5" />, gateway: 'midtrans', category: 'retail' },
  
  // International
  { id: 'paypal', name: 'PayPal', icon: <Globe className="h-5 w-5" />, gateway: 'paypal', category: 'international', popular: true },
];

interface UnifiedPaymentSelectorProps {
  amount: number;
  currency?: 'IDR' | 'USD';
  onPaymentSelect: (method: PaymentMethodType, gateway: PaymentGateway) => void;
  isLoading?: boolean;
  paypalEnabled?: boolean;
}

const UnifiedPaymentSelector = ({ 
  amount, 
  currency = 'IDR',
  onPaymentSelect, 
  isLoading = false,
  paypalEnabled = false
}: UnifiedPaymentSelectorProps) => {
  const { language } = useLanguage();
  const t = text[language];
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);

  const filterMethods = (category: PaymentMethod['category']) => {
    return paymentMethods.filter(m => {
      if (m.category !== category) return false;
      if (m.gateway === 'paypal' && !paypalEnabled) return false;
      return true;
    });
  };

  const handlePayment = () => {
    if (!selectedMethod) return;
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (method) {
      onPaymentSelect(selectedMethod, method.gateway);
    }
  };

  const formatAmount = () => {
    if (currency === 'IDR') {
      return formatIDR(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const renderMethodGroup = (category: PaymentMethod['category'], title: string) => {
    const methods = filterMethods(category);
    if (methods.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {methods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`
                relative flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                ${selectedMethod === method.id 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              {method.popular && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5">
                  {t.popular}
                </Badge>
              )}
              <div className={`p-1.5 rounded-md ${selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {method.icon}
              </div>
              <span className="text-xs font-medium truncate">{method.name}</span>
              {selectedMethod === method.id && (
                <CheckCircle2 className="h-4 w-4 text-primary ml-auto flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">{t.amount}</span>
          <span className="text-lg font-bold">{formatAmount()}</span>
        </div>

        <Separator />

        {/* Payment Methods */}
        <div className="space-y-4">
          {renderMethodGroup('ewallet', t.ewallets)}
          {renderMethodGroup('bank', t.bankTransfer)}
          {renderMethodGroup('retail', t.retail)}
          {paypalEnabled && renderMethodGroup('international', t.international)}
        </div>

        {selectedMethod === 'paypal' && (
          <p className="text-xs text-muted-foreground text-center">
            {t.paypalNote}
          </p>
        )}

        <Separator />

        {/* Pay Button */}
        <Button 
          onClick={handlePayment}
          disabled={!selectedMethod || isLoading}
          className="w-full h-11"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              {t.payNow} - {formatAmount()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UnifiedPaymentSelector;

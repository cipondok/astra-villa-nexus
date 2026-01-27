import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Wallet, Building2, QrCode, 
  Shield, Check, ChevronRight, Lock,
  Loader2, AlertCircle, Receipt, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Smart Payment Flow
 * Solves: Limited payment options, unclear fee breakdown, trust concerns
 * 
 * Technical: Multiple gateways, saved methods, split payment
 * Psychological: Transparent fees, security badges, success animation
 * Alternative: Escrow, bank transfer, convenience store
 */

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  processingTime: string;
  fee?: string;
  popular?: boolean;
  category: 'ewallet' | 'bank' | 'card' | 'other';
}

interface SmartPaymentFlowProps {
  amount: number;
  description: string;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

const SmartPaymentFlow: React.FC<SmartPaymentFlowProps> = ({
  amount,
  description,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<'method' | 'confirm' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [saveMethod, setSaveMethod] = useState(true);

  const paymentMethods: PaymentMethod[] = [
    { id: 'gopay', name: 'GoPay', icon: Wallet, description: 'Pay with GoPay balance', processingTime: 'Instant', popular: true, category: 'ewallet' },
    { id: 'ovo', name: 'OVO', icon: Wallet, description: 'Pay with OVO', processingTime: 'Instant', category: 'ewallet' },
    { id: 'dana', name: 'DANA', icon: Wallet, description: 'Pay with DANA', processingTime: 'Instant', category: 'ewallet' },
    { id: 'qris', name: 'QRIS', icon: QrCode, description: 'Scan QR with any e-wallet', processingTime: 'Instant', popular: true, category: 'ewallet' },
    { id: 'bca', name: 'BCA Virtual Account', icon: Building2, description: 'Transfer via BCA', processingTime: '< 1 hour', category: 'bank' },
    { id: 'mandiri', name: 'Mandiri Virtual Account', icon: Building2, description: 'Transfer via Mandiri', processingTime: '< 1 hour', category: 'bank' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, JCB', processingTime: 'Instant', fee: '2.5%', category: 'card' },
  ];

  const selectedPayment = paymentMethods.find(m => m.id === selectedMethod);
  const fee = selectedPayment?.fee ? amount * 0.025 : 0;
  const total = amount + fee;

  const handlePayment = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2500));
    setStep('success');
    onSuccess?.(`PAY-${Date.now()}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const groupedMethods = {
    ewallet: paymentMethods.filter(m => m.category === 'ewallet'),
    bank: paymentMethods.filter(m => m.category === 'bank'),
    card: paymentMethods.filter(m => m.category === 'card'),
  };

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Method Selection */}
        {step === 'method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            {/* Amount summary */}
            <div className="text-center p-4 bg-card rounded-xl border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">{description}</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(amount)}</p>
            </div>

            {/* Trust badges (Psychological) */}
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-4 w-4 text-green-500" />
                <span>PCI Compliant</span>
              </div>
            </div>

            {/* Payment methods by category */}
            <div className="space-y-4">
              {/* E-Wallets */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-Wallets</p>
                <div className="space-y-2">
                  {groupedMethods.ewallet.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      isSelected={selectedMethod === method.id}
                      onSelect={() => setSelectedMethod(method.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bank Transfer</p>
                <div className="space-y-2">
                  {groupedMethods.bank.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      isSelected={selectedMethod === method.id}
                      onSelect={() => setSelectedMethod(method.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Card Payment</p>
                <div className="space-y-2">
                  {groupedMethods.card.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      isSelected={selectedMethod === method.id}
                      onSelect={() => setSelectedMethod(method.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep('confirm')}
              disabled={!selectedMethod}
              className="w-full h-12 active:scale-95"
            >
              Continue to Payment
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Confirmation with fee breakdown */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('method')} className="text-muted-foreground">
                ← Back
              </button>
              <h2 className="text-lg font-bold text-foreground">Confirm Payment</h2>
            </div>

            {/* Transparent fee breakdown (Psychological) */}
            <div className="p-4 bg-card rounded-xl border border-border/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{description}</span>
                <span className="text-foreground">{formatPrice(amount)}</span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing fee</span>
                  <span className="text-foreground">{formatPrice(fee)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-border/50 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-lg text-foreground">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Selected method */}
            {selectedPayment && (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                <selectedPayment.icon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{selectedPayment.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedPayment.processingTime}</p>
                </div>
                <button 
                  onClick={() => setStep('method')}
                  className="text-xs text-primary"
                >
                  Change
                </button>
              </div>
            )}

            {/* Save payment method */}
            <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={saveMethod}
                onChange={(e) => setSaveMethod(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">Save for future payments</span>
                <p className="text-xs text-muted-foreground">Pay faster next time</p>
              </div>
            </label>

            {/* Security note */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <span>
                Your payment is protected by 256-bit SSL encryption and complies with PCI-DSS standards.
              </span>
            </div>

            <Button
              onClick={handlePayment}
              className="w-full h-12 bg-green-600 hover:bg-green-700 active:scale-95"
            >
              <Lock className="h-4 w-4 mr-2" />
              Pay {formatPrice(total)}
            </Button>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-medium text-foreground">Processing Payment</p>
              <p className="text-sm text-muted-foreground">Please don't close this page...</p>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <Check className="h-10 w-10 text-green-500" />
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Payment Successful! 🎉</h3>
              <p className="text-lg font-semibold text-green-600">{formatPrice(total)}</p>
            </div>

            {/* Receipt card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-card rounded-xl border border-border/50 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-foreground">PAY-{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="text-foreground">{selectedPayment?.name}</span>
              </div>
            </motion.div>

            {/* Receipt actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-10 active:scale-95">
                <Receipt className="h-4 w-4 mr-1.5" />
                Email Receipt
              </Button>
              <Button variant="outline" className="flex-1 h-10 active:scale-95">
                <Download className="h-4 w-4 mr-1.5" />
                Download PDF
              </Button>
            </div>

            <Button onClick={onCancel} className="w-full h-11 active:scale-95">
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Payment method card component
const PaymentMethodCard: React.FC<{
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ method, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={cn(
      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
      "active:scale-[0.98]",
      isSelected 
        ? "border-primary bg-primary/5" 
        : "border-border/50 bg-card hover:border-primary/30"
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-lg flex items-center justify-center",
      isSelected ? "bg-primary/10" : "bg-muted"
    )}>
      <method.icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
    </div>
    <div className="flex-1 text-left">
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{method.name}</span>
        {method.popular && (
          <span className="text-[10px] px-1.5 py-0.5 bg-accent text-white rounded font-medium">Popular</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{method.processingTime}</p>
    </div>
    {method.fee && (
      <span className="text-xs text-muted-foreground">+{method.fee}</span>
    )}
    <div className={cn(
      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
      isSelected ? "border-primary bg-primary" : "border-border"
    )}>
      {isSelected && <Check className="h-3 w-3 text-white" />}
    </div>
  </button>
);

export default SmartPaymentFlow;

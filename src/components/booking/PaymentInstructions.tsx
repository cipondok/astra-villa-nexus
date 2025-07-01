
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentInstructionsProps {
  paymentData: {
    paymentId: string;
    status: string;
    paymentInstructions?: {
      method: string;
      bankCode?: string;
      virtualAccountNumber?: string;
      ewalletType?: string;
      deeplink?: string;
      qrCode?: string;
      amount: number;
      currency: string;
      expiryTime?: Date;
      instructions: string;
    };
    astraTokensUsed?: number;
    remainingBalance?: number;
  };
  onPaymentConfirmed?: () => void;
}

const PaymentInstructions = ({ paymentData, onPaymentConfirmed }: PaymentInstructionsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Payment details copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const openDeeplink = (url: string) => {
    window.open(url, '_blank');
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (paymentData.status === 'succeeded') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-800">Payment Successful!</CardTitle>
            {getStatusBadge(paymentData.status)}
          </div>
          <CardDescription className="text-green-600">
            Your booking has been confirmed and payment processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentData.astraTokensUsed && (
            <div className="space-y-2">
              <p className="text-sm"><strong>ASTRA Tokens Used:</strong> {paymentData.astraTokensUsed}</p>
              <p className="text-sm"><strong>Remaining Balance:</strong> {paymentData.remainingBalance}</p>
            </div>
          )}
          <Button onClick={onPaymentConfirmed} className="w-full mt-4">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  const instructions = paymentData.paymentInstructions;
  if (!instructions) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Complete Your Payment</CardTitle>
          {getStatusBadge(paymentData.status)}
        </div>
        <CardDescription>
          Follow the instructions below to complete your payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Amount to Pay</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(instructions.amount, instructions.currency)}
            </p>
          </div>
        </div>

        {/* Expiry Time */}
        {instructions.expiryTime && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>Payment expires: {new Date(instructions.expiryTime).toLocaleString()}</span>
          </div>
        )}

        {/* Bank Transfer Instructions */}
        {instructions.method === 'bank_transfer' && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Virtual Account Number</h4>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded">
                <code className="flex-1 font-mono text-lg">
                  {instructions.virtualAccountNumber}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(instructions.virtualAccountNumber!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <p className="text-sm">{instructions.instructions}</p>
            </div>
          </div>
        )}

        {/* E-Wallet Instructions */}
        {instructions.method === 'ewallet' && (
          <div className="space-y-4">
            <div className="text-center">
              {instructions.qrCode && (
                <div className="mb-4">
                  <img 
                    src={instructions.qrCode} 
                    alt="Payment QR Code" 
                    className="mx-auto w-48 h-48 border rounded-lg"
                  />
                </div>
              )}
              
              {instructions.deeplink && (
                <Button
                  onClick={() => openDeeplink(instructions.deeplink!)}
                  className="w-full mb-4"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open {instructions.ewalletType?.toUpperCase()} App
                </Button>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">{instructions.instructions}</p>
            </div>
          </div>
        )}

        {/* General Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Important Notes:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
            <li>Complete payment within the specified time limit</li>
            <li>Keep your payment receipt for reference</li>
            <li>Payment confirmation may take 5-15 minutes</li>
            <li>Contact support if you encounter any issues</li>
          </ul>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            Contact Support
          </Button>
          <Button onClick={onPaymentConfirmed} className="flex-1">
            I've Made Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInstructions;

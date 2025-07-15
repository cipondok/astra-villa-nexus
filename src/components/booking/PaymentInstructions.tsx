import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  CreditCard,
  Building,
  Smartphone,
  QrCode,
  Phone
} from "lucide-react";

interface PaymentInstructionsProps {
  paymentData: {
    paymentMethod: string;
    paymentInstructions: any;
    status: string;
    expiryTime?: string;
  };
  onPaymentConfirmed?: () => void;
}

const PaymentInstructions = ({ paymentData, onPaymentConfirmed }: PaymentInstructionsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: "Berhasil Disalin",
        description: `${type} telah disalin ke clipboard`,
      });
    } catch (err) {
      toast({
        title: "Gagal Menyalin",
        description: "Tidak dapat menyalin ke clipboard",
        variant: "destructive"
      });
    }
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
        return <Badge className="bg-green-100 text-green-800">Berhasil</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu Pembayaran</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Gagal</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Show success message if payment is completed
  if (paymentData.status === 'succeeded') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Pembayaran Berhasil!</h3>
          <p className="text-muted-foreground mb-4">
            Terima kasih, pembayaran Anda telah berhasil diproses.
          </p>
          {onPaymentConfirmed && (
            <Button onClick={onPaymentConfirmed} className="mt-4">
              Lanjutkan
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const instructions = paymentData.paymentInstructions;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Instruksi Pembayaran</span>
            {getStatusBadge(paymentData.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Amount */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Pembayaran:</span>
              <span className="text-xl font-bold text-blue-600">
                {/* Amount would come from booking data */}
                {formatCurrency(0)}
              </span>
            </div>
          </div>

          {/* Expiry Time */}
          {instructions.expiryTime && (
            <div className="flex items-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                Batas waktu pembayaran: {new Date(instructions.expiryTime).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          {/* E-Wallet Instructions */}
          {instructions.type === 'e_wallet' && (
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                Pembayaran {instructions.provider}
              </h4>
              
              {/* QR Code Section */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">QR Code Payment</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeeplink(instructions.deeplink)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Buka App
                  </Button>
                </div>
                <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 text-center">
                  <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">QR Code akan muncul di sini</p>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <p className="text-sm font-medium mb-2">Langkah pembayaran:</p>
                <ol className="text-sm space-y-1">
                  {instructions.instructions.map((step: string, index: number) => (
                    <li key={index} className="flex">
                      <span className="mr-2 text-blue-600 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Bank Transfer Instructions */}
          {instructions.type === 'bank_transfer' && (
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Transfer {instructions.provider}
              </h4>
              
              {/* Virtual Account */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Nomor Virtual Account</p>
                    <p className="text-lg font-mono font-bold">{instructions.virtualAccount}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(instructions.virtualAccount, 'Virtual Account')}
                  >
                    <Copy className="h-4 w-4" />
                    {copied === 'Virtual Account' ? 'Tersalin!' : 'Salin'}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <p className="text-sm font-medium mb-2">Langkah transfer:</p>
                <ol className="text-sm space-y-1">
                  {instructions.instructions.map((step: string, index: number) => (
                    <li key={index} className="flex">
                      <span className="mr-2 text-blue-600 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Credit Card Instructions */}
          {instructions.type === 'credit_card' && (
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Pembayaran Kartu Kredit/Debit
              </h4>
              
              <div className="space-y-2">
                {instructions.instructions.map((step: string, index: number) => (
                  <p key={index} className="text-sm">{step}</p>
                ))}
              </div>
            </div>
          )}

          {/* General Instructions */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Catatan Penting:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pastikan nominal pembayaran sesuai dengan yang tertera</li>
              <li>• Simpan bukti pembayaran untuk referensi</li>
              <li>• Hubungi customer service jika mengalami kendala</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Hubungi CS
            </Button>
            {onPaymentConfirmed && (
              <Button onClick={onPaymentConfirmed} className="flex-1">
                Konfirmasi Pembayaran
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentInstructions;
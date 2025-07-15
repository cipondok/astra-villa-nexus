import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText, 
  Building, 
  Calendar,
  MapPin,
  User,
  CreditCard,
  CheckCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface InvoiceData {
  bookingId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    idNumber: string;
  };
  property: {
    title: string;
    location: string;
    type: string;
  };
  booking: {
    checkIn: string;
    checkOut: string;
    totalDays: number;
    status: string;
    paymentStatus: string;
  };
  pricing: {
    basePrice: number;
    totalDays: number;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
  };
  paymentMethod: string;
}

interface InvoiceGeneratorProps {
  invoiceData: InvoiceData;
  onPaymentInitiate?: () => void;
}

const InvoiceGenerator = ({ invoiceData, onPaymentInitiate }: InvoiceGeneratorProps) => {
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Dibayar
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu Pembayaran
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <Clock className="h-3 w-3 mr-1" />
            Terlambat
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Import html2pdf dynamically with proper typing
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      
      const element = invoiceRef.current;
      if (!element) return;

      const opt = {
        margin: 1,
        filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await (html2pdf as any)().set(opt).from(element).save();
      
      toast({
        title: "Invoice Downloaded",
        description: "Invoice berhasil diunduh sebagai PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Gagal mengunduh invoice",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceData,
          recipientEmail: invoiceData.customer.email
        })
      });

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: "Invoice berhasil dikirim ke email customer",
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Gagal mengirim invoice ke email",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={handleSendEmail}>
          <FileText className="h-4 w-4 mr-2" />
          Kirim Email
        </Button>
        
        <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>

        {invoiceData.booking.paymentStatus === 'pending' && (
          <Button onClick={onPaymentInitiate}>
            <CreditCard className="h-4 w-4 mr-2" />
            Bayar Sekarang
          </Button>
        )}
      </div>

      {/* Invoice Content */}
      <Card>
        <div ref={invoiceRef} className="bg-white">
          {/* Invoice Header */}
          <CardHeader className="border-b">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-lg text-gray-600">#{invoiceData.invoiceNumber}</p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">ASTRA VILLA</div>
                <p className="text-sm text-gray-600">Premium Property Rental</p>
                <p className="text-sm text-gray-600">Jakarta, Indonesia</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div>
                <p className="text-sm text-gray-600">Tanggal Invoice:</p>
                <p className="font-semibold">{format(new Date(invoiceData.issueDate), 'dd MMMM yyyy', { locale: id })}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Jatuh Tempo:</p>
                <p className="font-semibold">{format(new Date(invoiceData.dueDate), 'dd MMMM yyyy', { locale: id })}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status Pembayaran:</p>
                {getStatusBadge(invoiceData.booking.paymentStatus)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Customer & Property Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informasi Penyewa
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Nama:</strong> {invoiceData.customer.name}</p>
                  <p><strong>Email:</strong> {invoiceData.customer.email}</p>
                  <p><strong>Telepon:</strong> {invoiceData.customer.phone}</p>
                  <p><strong>KTP:</strong> {invoiceData.customer.idNumber}</p>
                  <p><strong>Alamat:</strong> {invoiceData.customer.address}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Informasi Properti
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Properti:</strong> {invoiceData.property.title}</p>
                  <p><strong>Tipe:</strong> {invoiceData.property.type}</p>
                  <p className="flex items-start">
                    <strong className="mr-1">Lokasi:</strong>
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {invoiceData.property.location}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Detail Booking
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Check-in</p>
                    <p className="font-semibold">{format(new Date(invoiceData.booking.checkIn), 'dd MMMM yyyy', { locale: id })}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Check-out</p>
                    <p className="font-semibold">{format(new Date(invoiceData.booking.checkOut), 'dd MMMM yyyy', { locale: id })}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Hari</p>
                    <p className="font-semibold">{invoiceData.booking.totalDays} hari</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Rincian Biaya</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Deskripsi</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Jumlah</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Harga</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm">Sewa Properti ({invoiceData.pricing.totalDays} hari)</td>
                      <td className="px-4 py-3 text-sm text-right">{invoiceData.pricing.totalDays}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(invoiceData.pricing.basePrice)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(invoiceData.pricing.subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Pajak (10%)</td>
                      <td className="px-4 py-3 text-sm text-right">-</td>
                      <td className="px-4 py-3 text-sm text-right">-</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(invoiceData.pricing.tax)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Biaya Layanan (5%)</td>
                      <td className="px-4 py-3 text-sm text-right">-</td>
                      <td className="px-4 py-3 text-sm text-right">-</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(invoiceData.pricing.serviceCharge)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-right">TOTAL</td>
                      <td className="px-4 py-3 text-lg font-bold text-right">{formatCurrency(invoiceData.pricing.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Informasi Pembayaran</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Metode Pembayaran:</strong> {invoiceData.paymentMethod}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Booking ID:</strong> {invoiceData.bookingId}
                </p>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="border-t pt-6 text-sm text-gray-600">
              <h3 className="font-semibold mb-2">Syarat dan Ketentuan:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Pembayaran wajib dilakukan sebelum tanggal jatuh tempo</li>
                <li>Check-in pada pukul 14:00 WIB, Check-out pada pukul 12:00 WIB</li>
                <li>Kerusakan properti akan dikenakan biaya tambahan</li>
                <li>Pembatalan booking 24 jam sebelum check-in dikenakan denda 50%</li>
                <li>Untuk pertanyaan hubungi customer service kami</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t text-sm text-gray-500">
              <p>Terima kasih telah memilih ASTRA VILLA</p>
              <p>Email: info@astravilla.com | Telepon: +62 21 1234 5678</p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceGenerator;
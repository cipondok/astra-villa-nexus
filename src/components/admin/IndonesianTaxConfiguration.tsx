import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calculator, Percent, Edit, Save, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";

interface TaxConfig {
  id: string;
  tax_code: string;
  tax_name: string;
  tax_name_id: string;
  rate: number;
  description: string;
  description_id: string;
  applicable_to: string[];
  min_amount: number;
  max_amount: number | null;
  is_active: boolean;
}

const text = {
  en: {
    title: "Indonesian Tax Configuration",
    subtitle: "Configure tax rates according to Indonesian law (PPN, PPh, BPHTB)",
    taxCode: "Tax Code",
    taxName: "Tax Name",
    rate: "Rate (%)",
    appliesTo: "Applies To",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    refresh: "Refresh",
    minAmount: "Min Amount",
    maxAmount: "Max Amount",
    noLimit: "No Limit",
    propertySale: "Property Sale",
    propertyRental: "Rental",
    vendorService: "Vendor Service",
    all: "All",
    taxCalculator: "Tax Calculator",
    baseAmount: "Base Amount (IDR)",
    calculate: "Calculate",
    breakdown: "Tax Breakdown",
    subtotal: "Subtotal",
    totalTax: "Total Tax",
    grandTotal: "Grand Total",
    transactionType: "Transaction Type",
    selectType: "Select transaction type"
  },
  id: {
    title: "Konfigurasi Pajak Indonesia",
    subtitle: "Atur tarif pajak sesuai hukum Indonesia (PPN, PPh, BPHTB)",
    taxCode: "Kode Pajak",
    taxName: "Nama Pajak",
    rate: "Tarif (%)",
    appliesTo: "Berlaku Untuk",
    status: "Status",
    actions: "Aksi",
    active: "Aktif",
    inactive: "Tidak Aktif",
    edit: "Ubah",
    save: "Simpan",
    cancel: "Batal",
    refresh: "Segarkan",
    minAmount: "Jumlah Min",
    maxAmount: "Jumlah Maks",
    noLimit: "Tanpa Batas",
    propertySale: "Penjualan Properti",
    propertyRental: "Sewa",
    vendorService: "Layanan Vendor",
    all: "Semua",
    taxCalculator: "Kalkulator Pajak",
    baseAmount: "Jumlah Dasar (IDR)",
    calculate: "Hitung",
    breakdown: "Rincian Pajak",
    subtotal: "Subtotal",
    totalTax: "Total Pajak",
    grandTotal: "Total Keseluruhan",
    transactionType: "Tipe Transaksi",
    selectType: "Pilih tipe transaksi"
  }
};

const IndonesianTaxConfiguration = () => {
  const { language } = useLanguage();
  const t = text[language];
  
  const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<number>(0);
  
  // Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(0);
  const [calcType, setCalcType] = useState<string>('property_sale');
  const [calcResult, setCalcResult] = useState<{
    taxes: { code: string; name: string; rate: number; amount: number }[];
    totalTax: number;
    grandTotal: number;
  } | null>(null);

  const fetchTaxConfigs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tax_configurations')
        .select('*')
        .order('tax_code');

      if (error) throw error;
      setTaxConfigs(data || []);
    } catch (error) {
      console.error('Error fetching tax configs:', error);
      toast.error('Failed to load tax configurations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxConfigs();
  }, []);

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('tax_configurations')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      toast.success(language === 'id' ? 'Status diperbarui' : 'Status updated');
      fetchTaxConfigs();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSaveRate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_configurations')
        .update({ rate: editRate, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success(language === 'id' ? 'Tarif diperbarui' : 'Rate updated');
      setEditingId(null);
      fetchTaxConfigs();
    } catch (error) {
      console.error('Error updating rate:', error);
      toast.error('Failed to update rate');
    }
  };

  const calculateTaxes = () => {
    if (calcAmount <= 0) return;

    const applicableTaxes = taxConfigs.filter(tax => 
      tax.is_active && 
      (tax.applicable_to.includes('all') || tax.applicable_to.includes(calcType))
    );

    const taxes = applicableTaxes.map(tax => ({
      code: tax.tax_code,
      name: language === 'id' ? tax.tax_name_id : tax.tax_name,
      rate: tax.rate,
      amount: Math.round(calcAmount * (tax.rate / 100))
    }));

    const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);

    setCalcResult({
      taxes,
      totalTax,
      grandTotal: calcAmount + totalTax
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const getApplicableLabel = (applicable: string[]) => {
    if (applicable.includes('all')) return t.all;
    return applicable.map(a => {
      switch(a) {
        case 'property_sale': return t.propertySale;
        case 'property_rental': return t.propertyRental;
        case 'vendor_service': return t.vendorService;
        default: return a;
      }
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTaxConfigs}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t.refresh}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary">
                <Calculator className="h-4 w-4 mr-1" />
                {t.taxCalculator}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t.taxCalculator}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.transactionType}</Label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md bg-background"
                      value={calcType}
                      onChange={(e) => setCalcType(e.target.value)}
                    >
                      <option value="property_sale">{t.propertySale}</option>
                      <option value="property_rental">{t.propertyRental}</option>
                      <option value="vendor_service">{t.vendorService}</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t.baseAmount}</Label>
                    <Input 
                      type="number"
                      value={calcAmount || ''}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button onClick={calculateTaxes} className="w-full">
                  {t.calculate}
                </Button>

                {calcResult && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t.breakdown}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t.subtotal}</span>
                        <span className="font-mono">{formatCurrency(calcAmount)}</span>
                      </div>
                      {calcResult.taxes.map((tax, i) => (
                        <div key={i} className="flex justify-between text-sm text-muted-foreground">
                          <span>{tax.name} ({tax.rate}%)</span>
                          <span className="font-mono">{formatCurrency(tax.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>{t.totalTax}</span>
                          <span className="font-mono text-orange-600">{formatCurrency(calcResult.totalTax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold mt-1">
                          <span>{t.grandTotal}</span>
                          <span className="font-mono text-primary">{formatCurrency(calcResult.grandTotal)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tax Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700">PPN</Badge>
              <span className="font-semibold">11%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'id' 
                ? 'Pajak Pertambahan Nilai untuk semua transaksi'
                : 'Value Added Tax for all transactions'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-100 text-green-700">PPh</Badge>
              <span className="font-semibold">2.5% - 10%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'id'
                ? 'Pajak Penghasilan: 2.5% penjualan, 10% sewa'
                : 'Income Tax: 2.5% sales, 10% rental'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-purple-100 text-purple-700">BPHTB</Badge>
              <span className="font-semibold">5%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'id'
                ? 'Bea Perolehan Hak atas Tanah dan Bangunan'
                : 'Land/Building Acquisition Tax'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Config Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'id' ? 'Daftar Konfigurasi Pajak' : 'Tax Configuration List'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'id' ? 'Memuat...' : 'Loading...'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.taxCode}</TableHead>
                    <TableHead>{t.taxName}</TableHead>
                    <TableHead className="text-center">{t.rate}</TableHead>
                    <TableHead>{t.appliesTo}</TableHead>
                    <TableHead className="text-center">{t.status}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxConfigs.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{tax.tax_code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{language === 'id' ? tax.tax_name_id : tax.tax_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'id' ? tax.description_id : tax.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === tax.id ? (
                          <div className="flex items-center gap-1">
                            <Input 
                              type="number"
                              step="0.01"
                              value={editRate}
                              onChange={(e) => setEditRate(Number(e.target.value))}
                              className="w-20 h-8 text-center"
                            />
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ) : (
                          <span className="font-mono text-lg font-semibold">{tax.rate}%</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tax.applicable_to.map((a, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {a === 'all' ? t.all : a.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch 
                          checked={tax.is_active}
                          onCheckedChange={() => handleToggleActive(tax.id, tax.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        {editingId === tax.id ? (
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleSaveRate(tax.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              {t.cancel}
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setEditingId(tax.id);
                              setEditRate(tax.rate);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {language === 'id' ? 'Catatan Penting' : 'Important Note'}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {language === 'id'
                  ? 'Tarif pajak diatur sesuai peraturan perpajakan Indonesia. Perubahan tarif akan mempengaruhi semua transaksi baru. Pastikan untuk berkonsultasi dengan akuntan atau penasihat pajak sebelum mengubah konfigurasi.'
                  : 'Tax rates are configured according to Indonesian tax regulations. Rate changes will affect all new transactions. Please consult with an accountant or tax advisor before modifying configurations.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndonesianTaxConfiguration;

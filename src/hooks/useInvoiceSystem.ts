import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  booking_id?: string;
  subscription_id?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded';
  due_date: string;
  paid_at?: string;
  line_items: InvoiceLineItem[];
  tax_breakdown: TaxBreakdown[];
  billing_address?: BillingAddress;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate?: number;
}

export interface TaxBreakdown {
  name: string;
  rate: number;
  amount: number;
}

export interface BillingAddress {
  name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  tax_id?: string;
}

// Indonesian tax rates
export const INDONESIA_TAX_RATES = {
  PPN: { name: 'PPN (VAT)', rate: 0.11 }, // 11% VAT
  PPH_23: { name: 'PPh 23', rate: 0.02 }, // 2% withholding tax for services
  PPH_21: { name: 'PPh 21', rate: 0.05 }, // 5% for individual income
};

export const useInvoiceSystem = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate invoice number
  const generateInvoiceNumber = useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${year}${month}-${random}`;
  }, []);

  // Calculate taxes for Indonesian transactions
  const calculateTaxes = useCallback((
    subtotal: number,
    taxTypes: ('PPN' | 'PPH_23' | 'PPH_21')[] = ['PPN']
  ): { taxBreakdown: TaxBreakdown[]; totalTax: number } => {
    const taxBreakdown: TaxBreakdown[] = [];
    let totalTax = 0;

    for (const taxType of taxTypes) {
      const tax = INDONESIA_TAX_RATES[taxType];
      const amount = Math.round(subtotal * tax.rate);
      taxBreakdown.push({
        name: tax.name,
        rate: tax.rate * 100,
        amount
      });
      totalTax += amount;
    }

    return { taxBreakdown, totalTax };
  }, []);

  // Create invoice
  const createInvoice = useCallback(async (params: {
    bookingId?: string;
    subscriptionId?: string;
    lineItems: Omit<InvoiceLineItem, 'total'>[];
    billingAddress?: BillingAddress;
    taxTypes?: ('PPN' | 'PPH_23' | 'PPH_21')[];
    dueDate?: Date;
    notes?: string;
  }) => {
    if (!user) {
      toast.error('Please login to create invoice');
      return null;
    }

    setIsLoading(true);
    try {
      // Calculate line items with totals
      const lineItemsWithTotals: InvoiceLineItem[] = params.lineItems.map(item => ({
        ...item,
        total: item.quantity * item.unit_price
      }));

      const subtotal = lineItemsWithTotals.reduce((sum, item) => sum + item.total, 0);
      const { taxBreakdown, totalTax } = calculateTaxes(subtotal, params.taxTypes);
      const totalAmount = subtotal + totalTax;

      const invoiceNumber = generateInvoiceNumber();
      const dueDate = params.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Store invoice data in payment_transactions or a dedicated table
      const invoiceData: Partial<Invoice> = {
        invoice_number: invoiceNumber,
        user_id: user.id,
        booking_id: params.bookingId,
        subscription_id: params.subscriptionId,
        amount: subtotal,
        tax_amount: totalTax,
        total_amount: totalAmount,
        currency: 'IDR',
        status: 'pending',
        due_date: dueDate.toISOString(),
        line_items: lineItemsWithTotals,
        tax_breakdown: taxBreakdown,
        billing_address: params.billingAddress,
        notes: params.notes,
      };

      // Try to insert into invoices table or use payment_transactions
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          customer_id: user.id,
          order_id: invoiceNumber,
          amount: totalAmount,
          currency: 'IDR',
          status: 'pending',
          payment_method: 'invoice',
          booking_id: params.bookingId,
          gateway_response: {
            invoice_data: invoiceData,
            line_items: lineItemsWithTotals,
            tax_breakdown: taxBreakdown,
            billing_address: params.billingAddress
          } as any
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Invoice ${invoiceNumber} created`);
      return { ...invoiceData, id: data.id } as Invoice;
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, calculateTaxes, generateInvoiceNumber]);

  // Fetch invoices
  const fetchInvoices = useCallback(async (filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('payment_transactions')
        .select('*')
        .eq('payment_method', 'invoice')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedInvoices: Invoice[] = (data || []).map(tx => {
        const gatewayResponse = tx.gateway_response as any;
        return {
          id: tx.id,
          invoice_number: tx.order_id,
          user_id: tx.customer_id || '',
          booking_id: tx.booking_id || undefined,
          amount: gatewayResponse?.invoice_data?.amount || tx.amount,
          tax_amount: gatewayResponse?.invoice_data?.tax_amount || 0,
          total_amount: tx.amount,
          currency: tx.currency || 'IDR',
          status: tx.status as Invoice['status'],
          due_date: gatewayResponse?.invoice_data?.due_date || tx.created_at,
          paid_at: tx.status === 'completed' ? tx.updated_at : undefined,
          line_items: gatewayResponse?.line_items || [],
          tax_breakdown: gatewayResponse?.tax_breakdown || [],
          billing_address: gatewayResponse?.billing_address,
          notes: gatewayResponse?.invoice_data?.notes,
          created_at: tx.created_at,
          updated_at: tx.updated_at
        };
      });

      setInvoices(mappedInvoices);
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Generate PDF invoice (returns HTML for PDF generation)
  const generateInvoicePDF = useCallback((invoice: Invoice): string => {
    const formatCurrency = (amount: number) => 
      `Rp ${amount.toLocaleString('id-ID')}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 28px; font-weight: bold; color: #1e40af; }
    .invoice-title { font-size: 32px; color: #1e40af; text-align: right; }
    .invoice-number { color: #666; text-align: right; margin-top: 5px; }
    .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .bill-to h3, .invoice-info h3 { color: #666; font-size: 12px; margin-bottom: 10px; text-transform: uppercase; }
    .invoice-info { text-align: right; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #666; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .amount-col { text-align: right; }
    .subtotal-section { margin-top: 20px; }
    .subtotal-row { display: flex; justify-content: flex-end; padding: 8px 0; }
    .subtotal-label { width: 150px; color: #666; }
    .subtotal-value { width: 150px; text-align: right; }
    .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 15px; margin-top: 10px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 12px; }
    .tax-id { margin-top: 20px; font-size: 11px; color: #888; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">ASTRA</div>
      <div style="color: #666; font-size: 14px;">Villa Realty</div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">${invoice.invoice_number}</div>
      <div style="margin-top: 10px;">
        <span class="status ${invoice.status === 'paid' ? 'status-paid' : 'status-pending'}">
          ${invoice.status.toUpperCase()}
        </span>
      </div>
    </div>
  </div>

  <div class="details">
    <div class="bill-to">
      <h3>Bill To</h3>
      ${invoice.billing_address ? `
        <div><strong>${invoice.billing_address.name}</strong></div>
        ${invoice.billing_address.company ? `<div>${invoice.billing_address.company}</div>` : ''}
        <div>${invoice.billing_address.address_line1}</div>
        ${invoice.billing_address.address_line2 ? `<div>${invoice.billing_address.address_line2}</div>` : ''}
        <div>${invoice.billing_address.city}, ${invoice.billing_address.postal_code}</div>
        <div>${invoice.billing_address.country}</div>
        ${invoice.billing_address.tax_id ? `<div class="tax-id">NPWP: ${invoice.billing_address.tax_id}</div>` : ''}
      ` : '<div>Customer</div>'}
    </div>
    <div class="invoice-info">
      <h3>Invoice Details</h3>
      <div><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString('id-ID')}</div>
      <div><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString('id-ID')}</div>
      ${invoice.paid_at ? `<div><strong>Paid:</strong> ${new Date(invoice.paid_at).toLocaleDateString('id-ID')}</div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="amount-col">Qty</th>
        <th class="amount-col">Unit Price</th>
        <th class="amount-col">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.line_items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="amount-col">${item.quantity}</td>
          <td class="amount-col">${formatCurrency(item.unit_price)}</td>
          <td class="amount-col">${formatCurrency(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="subtotal-section">
    <div class="subtotal-row">
      <span class="subtotal-label">Subtotal</span>
      <span class="subtotal-value">${formatCurrency(invoice.amount)}</span>
    </div>
    ${invoice.tax_breakdown.map(tax => `
      <div class="subtotal-row">
        <span class="subtotal-label">${tax.name} (${tax.rate}%)</span>
        <span class="subtotal-value">${formatCurrency(tax.amount)}</span>
      </div>
    `).join('')}
    <div class="subtotal-row total-row">
      <span class="subtotal-label">Total</span>
      <span class="subtotal-value">${formatCurrency(invoice.total_amount)}</span>
    </div>
  </div>

  ${invoice.notes ? `
    <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 8px;">
      <strong>Notes:</strong><br>${invoice.notes}
    </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>ASTRA Villa Realty • support@astra-realty.com • +62 21 1234 5678</p>
    <p style="margin-top: 10px; font-size: 10px;">
      This is a computer-generated invoice. NPWP: 01.234.567.8-012.345
    </p>
  </div>
</body>
</html>
    `;
  }, []);

  // Mark invoice as paid
  const markInvoicePaid = useCallback(async (invoiceId: string, paymentReference?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          gateway_response: { payment_reference: paymentReference, paid_at: new Date().toISOString() },
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      setInvoices(prev => prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'paid', paid_at: new Date().toISOString() }
          : inv
      ));

      toast.success('Invoice marked as paid');
      return true;
    } catch (error: any) {
      console.error('Failed to mark invoice paid:', error);
      toast.error('Failed to update invoice');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    invoices,
    isLoading,
    createInvoice,
    fetchInvoices,
    generateInvoicePDF,
    markInvoicePaid,
    calculateTaxes,
    INDONESIA_TAX_RATES
  };
};

export default useInvoiceSystem;

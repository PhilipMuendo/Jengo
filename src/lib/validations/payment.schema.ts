import { z } from 'zod';

export const paymentSchema = z.object({
  invoice_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  amount: z.coerce.number().min(1, 'Amount is required'),
  method: z.enum(['mpesa', 'cash', 'bank', 'cheque']),
  transaction_id: z.string().optional(),
  mpesa_receipt: z.string().optional(),
  notes: z.string().optional(),
});

export const mpesaPaymentSchema = z.object({
  phone: z.string().regex(/^(?:\+254|254|0)[17]\d{8}$/, 'Invalid M-Pesa phone number'),
  amount: z.coerce.number().min(1),
  invoice_id: z.string().uuid(),
  unit_id: z.string().uuid(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type MpesaPaymentInput = z.infer<typeof mpesaPaymentSchema>;

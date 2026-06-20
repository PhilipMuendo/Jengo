import { z } from 'zod';

export const tenantSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^(?:\+254|254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
  id_number: z.string().regex(/^\d{7,8}$/, 'Invalid ID number').optional(),
  unit_id: z.string().uuid('Select a unit'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  monthly_rent: z.coerce.number().min(0),
  deposit_amount: z.coerce.number().min(0).default(0),
});

export type TenantInput = z.infer<typeof tenantSchema>;

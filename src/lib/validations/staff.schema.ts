import { z } from 'zod';

export const staffSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^(?:\+254|254|0)[17]\d{8}$/, 'Invalid phone number'),
  role: z.enum(['property_manager', 'caretaker']),
  building_access: z.array(z.string().uuid()).optional(),
});

export type StaffInput = z.infer<typeof staffSchema>;

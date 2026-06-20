import { z } from 'zod';

export const unitSchema = z.object({
  building_id: z.string().uuid(),
  floor_id: z.string().uuid().optional(),
  unit_number: z.string().min(1, 'Unit number is required'),
  unit_label: z.string().optional(),
  bedrooms: z.coerce.number().min(0).max(10),
  bathrooms: z.coerce.number().min(0).max(10),
  square_feet: z.coerce.number().optional(),
  rent_amount: z.coerce.number().min(0, 'Rent amount is required'),
  status: z.enum(['vacant', 'occupied', 'maintenance', 'reserved']).default('vacant'),
});

export type UnitInput = z.infer<typeof unitSchema>;

import { z } from 'zod';

export const buildingSchema = z.object({
  name: z.string().min(2, 'Building name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
  total_floors: z.coerce.number().min(1).max(100),
  year_built: z.coerce.number().optional(),
  caretaker_name: z.string().optional(),
  caretaker_phone: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export type BuildingInput = z.infer<typeof buildingSchema>;

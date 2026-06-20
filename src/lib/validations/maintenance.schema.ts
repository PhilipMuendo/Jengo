import { z } from 'zod';

export const maintenanceSchema = z.object({
  unit_id: z.string().uuid('Select a unit'),
  category: z.string().min(1, 'Category is required'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Please provide a detailed description'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

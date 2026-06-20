import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^(?:\+254|254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const signupOrganizationSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupAccountInput = z.infer<typeof signupAccountSchema>;
export type SignupOrganizationInput = z.infer<typeof signupOrganizationSchema>;

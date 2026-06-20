export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  return /^(?:\+254|254|0)[17]\d{8}$/.test(cleaned);
}

export function normalizeKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('254')) return cleaned;
  return `254${cleaned}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidIdNumber(id: string): boolean {
  return /^\d{7,8}$/.test(id);
}

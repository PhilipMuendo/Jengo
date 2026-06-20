import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';

export function formatDate(date: string | Date, pattern = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(dueDate: string): boolean {
  return isPast(parseISO(dueDate));
}

export function getMonthYear(date = new Date()): string {
  return format(date, 'MMMM yyyy');
}

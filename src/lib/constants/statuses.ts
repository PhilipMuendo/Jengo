export const UNIT_STATUSES = {
  vacant: { label: 'Vacant', color: 'gray' },
  occupied: { label: 'Occupied', color: 'green' },
  maintenance: { label: 'Maintenance', color: 'yellow' },
  reserved: { label: 'Reserved', color: 'blue' },
} as const;

export const PAYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'green' },
  failed: { label: 'Failed', color: 'red' },
  refunded: { label: 'Refunded', color: 'gray' },
  partial: { label: 'Partial', color: 'orange' },
} as const;

export const INVOICE_STATUSES = {
  pending: { label: 'Pending', color: 'yellow' },
  paid: { label: 'Paid', color: 'green' },
  overdue: { label: 'Overdue', color: 'red' },
  cancelled: { label: 'Cancelled', color: 'gray' },
} as const;

export const MAINTENANCE_STATUSES = {
  open: { label: 'Open', color: 'blue' },
  assigned: { label: 'Assigned', color: 'purple' },
  in_progress: { label: 'In Progress', color: 'yellow' },
  resolved: { label: 'Resolved', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'gray' },
} as const;

export const MAINTENANCE_PRIORITIES = {
  low: { label: 'Low', color: 'gray' },
  medium: { label: 'Medium', color: 'blue' },
  high: { label: 'High', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' },
} as const;

export const LEASE_STATUSES = {
  active: { label: 'Active', color: 'green' },
  expired: { label: 'Expired', color: 'gray' },
  terminated: { label: 'Terminated', color: 'red' },
  pending: { label: 'Pending', color: 'yellow' },
} as const;

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MpesaStkPushRequest {
  phone: string;
  amount: number;
  invoiceId: string;
  unitId: string;
}

export interface MpesaStkPushResponse {
  checkoutRequestId: string;
  merchantRequestId: string;
  responseDescription: string;
}

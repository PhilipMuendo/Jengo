interface StkPushParams {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface StkPushResponse {
  checkoutRequestId: string;
  merchantRequestId: string;
  responseDescription: string;
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const baseUrl = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  const data = await response.json();
  return data.access_token;
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('254')) return cleaned;
  return `254${cleaned}`;
}

export async function initiateStkPush(params: StkPushParams): Promise<StkPushResponse> {
  const baseUrl = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

  if (!process.env.MPESA_CONSUMER_KEY) {
    return {
      checkoutRequestId: `DEV-${Date.now()}`,
      merchantRequestId: `DEV-MR-${Date.now()}`,
      responseDescription: 'Success (dev mode — configure MPESA env vars for live STK Push)',
    };
  }

  const accessToken = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: normalizePhone(params.phone),
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: normalizePhone(params.phone),
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: params.accountReference.slice(0, 12),
      TransactionDesc: params.transactionDesc.slice(0, 13),
    }),
  });

  const data = await response.json();
  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
    responseDescription: data.ResponseDescription,
  };
}

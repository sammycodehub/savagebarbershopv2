import "server-only";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to your .env.local file."
    );
  }
  return key;
}

interface InitializeTransactionParams {
  email: string;
  amountInSubunits: number; // Paystack expects the smallest currency unit (e.g. pesewas/kobo)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/** Initializes a Paystack transaction and returns the hosted checkout URL. */
export async function initializePaystackTransaction(
  params: InitializeTransactionParams
): Promise<PaystackInitializeResponse["data"]> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountInSubunits,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
  });

  const json = (await response.json()) as PaystackInitializeResponse;
  if (!response.ok || !json.status) {
    throw new Error(json.message || "Failed to initialize Paystack transaction");
  }
  return json.data;
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    gateway_response: string;
    metadata: Record<string, unknown>;
  };
}

/** Verifies a transaction reference directly against the Paystack API. */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse["data"]> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
      cache: "no-store",
    }
  );

  const json = (await response.json()) as PaystackVerifyResponse;
  if (!response.ok || !json.status) {
    throw new Error(json.message || "Failed to verify Paystack transaction");
  }
  return json.data;
}

/** Verifies the `x-paystack-signature` header on incoming webhook requests. */
export async function verifyPaystackSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  if (!signature) return false;
  const crypto = await import("node:crypto");
  const hash = crypto
    .createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

import { createHmac } from "crypto";

export function verifyResendWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    console.warn("RESEND_WEBHOOK_SECRET not configured");
    return false;
  }

  try {
    const hmac = createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

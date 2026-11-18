import crypto from 'crypto'

/**
 * Verifies the X-Hub-Signature-256 header sent by Meta WhatsApp Cloud Webhooks
 * against the HMAC-SHA256 of the raw payload using WHATSAPP_APP_SECRET.
 *
 * @param rawBody - Raw unparsed request body string
 * @param signatureHeader - The 'X-Hub-Signature-256' header value (e.g., 'sha256=abcdef...')
 * @param appSecret - The Meta App Secret configured for the webhook
 * @returns boolean indicating whether the signature is valid
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) {
    return false
  }

  const [algorithm, signature] = signatureHeader.split('=')
  if (algorithm !== 'sha256' || !signature) {
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody, 'utf8')
      .digest('hex')

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const actualBuffer = Buffer.from(signature, 'utf8')

    if (expectedBuffer.length !== actualBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  } catch (err) {
    console.error('Error verifying WhatsApp webhook signature:', err)
    return false
  }
}

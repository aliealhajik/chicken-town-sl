/**
 * Verifies the X-Hub-Signature-256 header sent by Meta WhatsApp Cloud Webhooks
 * against the HMAC-SHA256 of the raw payload using WHATSAPP_APP_SECRET.
 *
 * Implemented using the standard Web Crypto API (crypto.subtle) with constant-time
 * comparison, ensuring 100% compatibility with Edge runtimes (Cloudflare Pages / Workers,
 * Vercel Edge, Deno, Node.js 18+).
 *
 * @param rawBody - Raw unparsed request body string
 * @param signatureHeader - The 'X-Hub-Signature-256' header value (e.g., 'sha256=abcdef...')
 * @param appSecret - The Meta App Secret configured for the webhook
 * @returns Promise<boolean> indicating whether the signature is valid
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string
): Promise<boolean> {
  if (!signatureHeader || !appSecret) {
    return false
  }

  const [algorithm, signature] = signatureHeader.split('=')
  if (algorithm !== 'sha256' || !signature) {
    return false
  }

  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(appSecret)
    const bodyData = encoder.encode(rawBody)

    // Import secret key for HMAC SHA-256 via Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    )

    // Compute HMAC SHA-256
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, bodyData)

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(signatureBuffer))
    const expectedSignature = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Constant-time comparison to prevent timing attacks
    if (expectedSignature.length !== signature.length) {
      return false
    }

    let mismatch = 0
    for (let i = 0; i < expectedSignature.length; i++) {
      mismatch |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i)
    }

    return mismatch === 0
  } catch (err) {
    console.error('Error verifying WhatsApp webhook signature with Web Crypto:', err)
    return false
  }
}

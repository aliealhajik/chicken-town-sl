/**
 * Chicken Town SL - Meta WhatsApp Cloud API Client (v26.0)
 * Handles sending text, interactive button, and interactive list messages
 * with automated phone normalization and mock development fallback.
 */

export interface WhatsAppButton {
  id: string
  title: string
}

export interface WhatsAppListRow {
  id: string
  title: string
  description?: string
}

export interface WhatsAppListSection {
  title: string
  rows: WhatsAppListRow[]
}

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  mock?: boolean
  error?: string
}

/**
 * Normalizes phone numbers to international format (defaulting to Sierra Leone +232)
 */
export function normalizeWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '')

  // Remove leading '+'
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }

  // Handle standard SL local numbers (076..., 077..., 078..., 079..., 030...)
  if (cleaned.startsWith('0') && cleaned.length >= 8) {
    cleaned = '232' + cleaned.substring(1)
  }

  // If 8 digits without country code, prepend 232
  if (cleaned.length === 8 && !cleaned.startsWith('232')) {
    cleaned = '232' + cleaned
  }

  return cleaned
}

/**
 * Checks whether live WhatsApp Cloud API credentials are configured
 */
export function isWhatsAppConfigured(): boolean {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  return Boolean(
    token &&
      token.trim() !== '' &&
      !token.startsWith('your-') &&
      phoneId &&
      phoneId.trim() !== ''
  )
}

/**
 * Internal sender function that calls Meta Graph API or logs in mock mode
 */
async function sendRawWhatsAppPayload(
  to: string,
  payload: Record<string, unknown>
): Promise<WhatsAppSendResult> {
  const normalizedPhone = normalizeWhatsAppNumber(to)
  const fullPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedPhone,
    ...payload,
  }

  if (!isWhatsAppConfigured()) {
    console.log(
      `\n[WHATSAPP MOCK LOG] 💬 Outgoing to +${normalizedPhone}:\n`,
      JSON.stringify(fullPayload, null, 2)
    )
    return {
      success: true,
      mock: true,
      messageId: `mock-wa-msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    }
  }

  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const url = `https://graph.facebook.com/v26.0/${phoneId}/messages`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullPayload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('WhatsApp API request failed:', data)
      return {
        success: false,
        error: data.error?.message || 'WhatsApp Cloud API call error',
      }
    }

    const messageId = data.messages?.[0]?.id || 'unknown'
    return {
      success: true,
      messageId,
      mock: false,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    console.error('Failed to send WhatsApp message:', message)
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * 1. Send plain text WhatsApp message
 */
export async function sendWhatsAppText(
  to: string,
  text: string
): Promise<WhatsAppSendResult> {
  return sendRawWhatsAppPayload(to, {
    type: 'text',
    text: {
      preview_url: false,
      body: text,
    },
  })
}

/**
 * 2. Send interactive quick-reply buttons (up to 3 buttons)
 */
export async function sendWhatsAppButtons(
  to: string,
  body: string,
  buttons: WhatsAppButton[]
): Promise<WhatsAppSendResult>
export async function sendWhatsAppButtons(
  to: string,
  header: string | undefined,
  body: string,
  footer: string | undefined,
  buttons: WhatsAppButton[]
): Promise<WhatsAppSendResult>
export async function sendWhatsAppButtons(
  to: string,
  headerOrBody: string | undefined,
  bodyOrButtons: string | WhatsAppButton[],
  footer?: string | undefined,
  buttonsParam?: WhatsAppButton[]
): Promise<WhatsAppSendResult> {
  let header: string | undefined
  let body: string
  let footerText: string | undefined
  let buttons: WhatsAppButton[]

  if (Array.isArray(bodyOrButtons)) {
    header = undefined
    body = headerOrBody || ''
    footerText = undefined
    buttons = bodyOrButtons
  } else {
    header = headerOrBody
    body = bodyOrButtons || ''
    footerText = footer
    buttons = buttonsParam || []
  }

  const formattedButtons = buttons.slice(0, 3).map((b) => ({
    type: 'reply',
    reply: {
      id: b.id.substring(0, 256),
      title: b.title.substring(0, 20),
    },
  }))

  const interactivePayload: Record<string, unknown> = {
    type: 'button',
    body: { text: body },
    action: { buttons: formattedButtons },
  }

  if (header && header.trim()) {
    interactivePayload.header = {
      type: 'text',
      text: header.substring(0, 60),
    }
  }

  if (footerText && footerText.trim()) {
    interactivePayload.footer = {
      text: footerText.substring(0, 60),
    }
  }

  return sendRawWhatsAppPayload(to, {
    type: 'interactive',
    interactive: interactivePayload,
  })
}

/**
 * 3. Send interactive list message (up to 10 rows per section)
 */
export async function sendWhatsAppList(
  to: string,
  header: string | undefined,
  body: string,
  footer: string | undefined,
  buttonText: string,
  sections: WhatsAppListSection[]
): Promise<WhatsAppSendResult> {
  const formattedSections = sections.map((sec) => ({
    title: sec.title.substring(0, 24),
    rows: sec.rows.slice(0, 10).map((r) => ({
      id: r.id.substring(0, 200),
      title: r.title.substring(0, 24),
      ...(r.description ? { description: r.description.substring(0, 72) } : {}),
    })),
  }))

  const interactivePayload: Record<string, unknown> = {
    type: 'list',
    body: { text: body },
    action: {
      button: buttonText.substring(0, 20),
      sections: formattedSections,
    },
  }

  if (header && header.trim()) {
    interactivePayload.header = {
      type: 'text',
      text: header.substring(0, 60),
    }
  }

  if (footer && footer.trim()) {
    interactivePayload.footer = {
      text: footer.substring(0, 60),
    }
  }

  return sendRawWhatsAppPayload(to, {
    type: 'interactive',
    interactive: interactivePayload,
  })
}

/**
 * 4. Send customer order status updates
 */
export async function sendWhatsAppStatusUpdate(
  to: string,
  orderNumber: string,
  status: string,
  branchName: string,
  fulfillmentType: string,
  details?: string
): Promise<WhatsAppSendResult> {
  let statusEmoji = '🍗'
  let statusText = status

  switch (status) {
    case 'AWAITING_DELIVERY_FEE':
      statusEmoji = '🛵'
      statusText = 'Awaiting Delivery Quote'
      break
    case 'FEE_QUOTED':
      statusEmoji = '💰'
      statusText = 'Delivery Fee Quoted'
      break
    case 'PENDING_PAYMENT':
      statusEmoji = '⏳'
      statusText = 'Pending Payment'
      break
    case 'CONFIRMED':
      statusEmoji = '✅'
      statusText = 'Confirmed & In Queue'
      break
    case 'PREPARING':
      statusEmoji = '👨‍🍳'
      statusText = 'Cooking in Kitchen'
      break
    case 'READY':
      statusEmoji = '🔥'
      statusText = 'Hot & Ready'
      break
    case 'OUT_FOR_DELIVERY':
      statusEmoji = '🛵'
      statusText = 'On the Road to You'
      break
    case 'COMPLETED':
      statusEmoji = '🎉'
      statusText = 'Delivered / Completed'
      break
    case 'CANCELLED':
      statusEmoji = '❌'
      statusText = 'Order Cancelled'
      break
  }

  const message = [
    `*Chicken Town SL — Order Update* 🍗`,
    `--------------------------------`,
    `*Order:* #${orderNumber}`,
    `*Branch:* ${branchName}`,
    `*Fulfillment:* ${fulfillmentType}`,
    `*Status:* ${statusEmoji} *${statusText}*`,
    details ? `\n_${details}_` : '',
    `--------------------------------`,
    `_SWIT U MOT SWIT U LYF_ ✨`,
  ]
    .filter(Boolean)
    .join('\n')

  return sendWhatsAppText(to, message)
}

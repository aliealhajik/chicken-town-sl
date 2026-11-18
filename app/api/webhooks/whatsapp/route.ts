import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/whatsapp-crypto'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const runtime = 'edge'

// Supabase client for webhook processing (service role key bypasses RLS for system tables)
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'mock-key'

  return createClient<Database>(supabaseUrl, serviceRoleKey)
}

/**
 * GET /api/webhooks/whatsapp
 * Meta WhatsApp Webhook Handshake Verification
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'chickentown_webhook_secret'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Handshake verified successfully.')
    return new Response(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  console.warn('[WhatsApp Webhook] Handshake verification failed: Token mismatch or invalid mode.', {
    mode,
    tokenProvided: !!token,
  })

  return new Response('Verification failed', { status: 403 })
}

/**
 * POST /api/webhooks/whatsapp
 * Incoming Message & Event Receiver with Deduplication & Signature Verification
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signatureHeader = request.headers.get('x-hub-signature-256')
    const appSecret = process.env.WHATSAPP_APP_SECRET

    // 1. Signature Verification (if app secret is configured)
    if (appSecret) {
      const isValid = await verifyWebhookSignature(rawBody, signatureHeader, appSecret)
      if (!isValid) {
        console.error('[WhatsApp Webhook] Invalid signature. Rejected request.')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json({ status: 'EMPTY_BODY' }, { status: 200 })
    }

    const payload = JSON.parse(rawBody)

    // Verify it's a WhatsApp business account event
    if (payload.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'NOT_WHATSAPP_EVENT' }, { status: 200 })
    }

    const supabase = getSupabaseServiceClient()

    // 2. Traverse entry -> changes -> value -> messages
    const entries = payload.entry || []
    for (const entry of entries) {
      const changes = entry.changes || []
      for (const change of changes) {
        if (change.field !== 'messages') continue

        const value = change.value
        if (!value) continue

        const messages = value.messages || []
        const contacts = value.contacts || []

        // Customer contact profile info
        const contact = contacts[0]
        const customerName = contact?.profile?.name || 'Customer'

        for (const message of messages) {
          const messageId = message.id
          const fromPhone = message.from // e.g. "23276100201"

          if (!messageId || !fromPhone) continue

          // 3. Deduplication via whatsapp_processed_messages table
          try {
            const { data: existing } = await supabase
              .from('whatsapp_processed_messages')
              .select('id')
              .eq('wa_message_id', messageId)
              .maybeSingle()

            if (existing) {
              console.log(`[WhatsApp Webhook] Duplicate message skipped: ${messageId}`)
              continue
            }

            // Insert into processed messages table
            await supabase.from('whatsapp_processed_messages').insert({
              wa_message_id: messageId,
              processed_at: new Date().toISOString(),
            })
          } catch (dbErr) {
            console.warn('[WhatsApp Webhook] Deduplication table query notice:', dbErr)
          }

          // 4. Extract message content
          // Normalizes text or interactive button/list replies
          let messageContent = ''
          let interactiveType: 'button' | 'list' | 'text' = 'text'
          let actionId: string | null = null

          if (message.type === 'text') {
            messageContent = message.text?.body?.trim() || ''
          } else if (message.type === 'interactive') {
            const interactive = message.interactive
            if (interactive?.type === 'button_reply') {
              interactiveType = 'button'
              actionId = interactive.button_reply?.id || null
              messageContent = interactive.button_reply?.title || ''
            } else if (interactive?.type === 'list_reply') {
              interactiveType = 'list'
              actionId = interactive.list_reply?.id || null
              messageContent = interactive.list_reply?.title || ''
            }
          } else if (message.type === 'button') {
            interactiveType = 'button'
            actionId = message.button?.payload || null
            messageContent = message.button?.text || ''
          }

          console.log('[WhatsApp Webhook] Processing incoming message:', {
            messageId,
            fromPhone,
            customerName,
            type: message.type,
            interactiveType,
            actionId,
            messageContent,
          })

          // 5. Dispatch to processWhatsAppMessage from @/lib/whatsapp-bot
          try {
            // Dynamically import to ensure seamless operation regardless of load order
            const botModule = await import('@/lib/whatsapp-bot')
            if (typeof botModule.processWhatsAppMessage === 'function') {
              await botModule.processWhatsAppMessage(fromPhone, customerName, {
                text: message.type === 'text' ? messageContent : undefined,
                buttonReplyId: interactiveType === 'button' ? (actionId || undefined) : undefined,
                listReplyId: interactiveType === 'list' ? (actionId || undefined) : undefined,
              })
            } else {
              console.warn('[WhatsApp Webhook] processWhatsAppMessage not yet ready in bot module.')
            }
          } catch (botErr) {
            console.error('[WhatsApp Webhook] Error during bot message processing:', botErr)
          }
        }
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 })
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing webhook event:', error)
    // Return 200 even on error to prevent Meta from endlessly retrying transient error payloads
    return NextResponse.json({ status: 'ERROR_HANDLED' }, { status: 200 })
  }
}

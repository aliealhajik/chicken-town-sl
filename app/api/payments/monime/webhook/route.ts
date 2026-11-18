import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWhatsAppStatusUpdate, sendWhatsAppText } from '@/lib/whatsapp'
import { BRANCHES } from '@/lib/data/branches'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    let payload: any

    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    // Monime webhook event payload structure
    const eventType = payload.type || payload.event || payload.eventType
    const data = payload.data || payload

    console.log(`[Monime Webhook] Received event: ${eventType}`)

    // Check for successful payment events
    const isPaymentSuccess =
      eventType === 'checkout.session.completed' ||
      eventType === 'payment.succeeded' ||
      eventType === 'charge.completed' ||
      data.status === 'completed' ||
      data.status === 'succeeded' ||
      data.payment_status === 'paid'

    if (!isPaymentSuccess) {
      return NextResponse.json({ received: true, ignored: true, reason: 'Event not a payment success' })
    }

    // Extract order_id from metadata or reference
    const orderId =
      data.metadata?.order_id ||
      payload.metadata?.order_id ||
      data.client_reference_id ||
      (typeof data.reference === 'string' && data.reference.startsWith('CT-') ? null : data.reference)

    const orderNumber =
      data.metadata?.order_number ||
      payload.metadata?.order_number ||
      (typeof data.reference === 'string' && data.reference.startsWith('CT-') ? data.reference : null)

    const supabase = await createServiceClient()

    // Query order
    let query = supabase.from('orders').select('*')
    if (orderId) {
      query = query.eq('id', orderId)
    } else if (orderNumber) {
      query = query.eq('order_number', orderNumber)
    } else {
      console.warn('[Monime Webhook] No orderId or orderNumber found in payload', payload)
      return NextResponse.json({ received: true, warning: 'No order identifier found' })
    }

    const { data: orderData, error: fetchErr } = await query.single()
    const order = orderData as any

    if (fetchErr || !order) {
      console.error('[Monime Webhook] Order query failed:', fetchErr)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order in Supabase
    const { error: updateErr } = await (supabase.from('orders') as any)
      .update({
        payment_status: 'PAID',
        status: 'CONFIRMED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateErr) {
      console.error('[Monime Webhook] Failed to update order status:', updateErr)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    console.log(`[Monime Webhook] Order #${order.order_number} marked as PAID & CONFIRMED!`)

    // Send WhatsApp payment confirmation if order originated from WhatsApp
    if (order.order_source === 'WHATSAPP' && order.customer_phone) {
      const branchName =
        BRANCHES.find((b) => b.id === order.branch_id)?.name || 'Chicken Town SL'

      try {
        await sendWhatsAppStatusUpdate(
          order.customer_phone,
          order.order_number,
          'CONFIRMED',
          branchName,
          order.fulfillment_type,
          `Payment of Le ${Number(order.total_amount).toLocaleString()} received via Monime. Kitchen has started your delicious order!`
        )
      } catch (waErr) {
        console.error('[Monime Webhook] WhatsApp notification failed:', waErr)
      }
    }

    return NextResponse.json({ received: true, success: true, order_id: order.id })
  } catch (err: any) {
    console.error('[Monime Webhook Exception]:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal webhook error' },
      { status: 500 }
    )
  }
}

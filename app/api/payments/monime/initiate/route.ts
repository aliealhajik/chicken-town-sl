import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createMonimeCheckoutSession } from '@/lib/monime'
import type { Order } from '@/types/database.types'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: 'Missing order_id' },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    // 1. Fetch order
    const { data, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    const order = data as Order | null

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // 2. Create Monime Checkout Session
    const sessionResult = await createMonimeCheckoutSession({
      orderId: order.id,
      orderNumber: order.order_number,
      amountSLE: Number(order.total_amount),
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
    })

    if (!sessionResult.success) {
      return NextResponse.json(
        { success: false, error: sessionResult.error || 'Failed to initialize Monime session' },
        { status: 500 }
      )
    }

    // 3. Mark status as PENDING_PAYMENT if not already
    await (supabase.from('orders') as any)
      .update({
        status: 'PENDING_PAYMENT',
        payment_method: 'MONIME',
      })
      .eq('id', order.id)

    return NextResponse.json({
      success: true,
      checkout_url: sessionResult.checkout_url,
      session_id: sessionResult.session_id,
      is_simulated: sessionResult.is_simulated || false,
    })
  } catch (error: any) {
    console.error('Monime initiation error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

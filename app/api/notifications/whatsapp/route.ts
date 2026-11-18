import { NextRequest, NextResponse } from 'next/server'
import {
  notifyWhatsAppDeliveryFeeQuote,
  notifyWhatsAppOrderStatus,
} from '@/lib/whatsapp-notifications'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing notification type or data' },
        { status: 400 }
      )
    }

    if (type === 'fee_quote') {
      const result = await notifyWhatsAppDeliveryFeeQuote({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerPhone: data.customerPhone,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        totalAmount: data.totalAmount,
      })
      return NextResponse.json(result)
    }

    if (type === 'status_update') {
      const result = await notifyWhatsAppOrderStatus({
        customerPhone: data.customerPhone,
        orderNumber: data.orderNumber,
        status: data.status,
        branchName: data.branchName,
        fulfillmentType: data.fulfillmentType,
        deliveryAddress: data.deliveryAddress,
        details: data.details,
      })
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: `Unknown notification type: ${type}` }, { status: 400 })
  } catch (err) {
    console.error('Error sending WhatsApp notification:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * Chicken Town SL - Outbound WhatsApp Notification Helpers
 * Provides structured messaging for Delivery Fee Quotes and Real-Time Order Status Updates
 */

import {
  sendWhatsAppButtons,
  sendWhatsAppText,
  sendWhatsAppStatusUpdate,
  type WhatsAppSendResult,
} from './whatsapp'

export interface DeliveryFeeQuoteNotificationParams {
  orderId: string
  orderNumber: string
  customerPhone: string
  subtotal: number
  deliveryFee: number
  totalAmount: number
}

export interface OrderStatusNotificationParams {
  customerPhone: string
  orderNumber: string
  status: string
  branchName?: string
  fulfillmentType?: string
  deliveryAddress?: string
  details?: string
}

/**
 * 1. Sends the Delivery Fee Quote prompt with 3 action buttons to WhatsApp customer
 */
export async function notifyWhatsAppDeliveryFeeQuote({
  orderId,
  orderNumber,
  customerPhone,
  subtotal,
  deliveryFee,
  totalAmount,
}: DeliveryFeeQuoteNotificationParams): Promise<WhatsAppSendResult> {
  const header = '🍗 Chicken Town SL — Delivery Fee Quote'
  const body = `Order #${orderNumber}\nSubtotal: Le ${subtotal.toLocaleString('en-SL')}\nDelivery Fee: Le ${deliveryFee.toLocaleString('en-SL')}\nTotal Amount: Le ${totalAmount.toLocaleString('en-SL')}\n\nPlease select your payment option to confirm delivery:`
  const footer = 'SWIT U MOT SWIT U LYF • 392 Hub'

  const buttons = [
    {
      id: `fee_accept_cod_${orderId}`,
      title: 'Accept (Pay on Deliv)',
    },
    {
      id: `fee_pay_monime_${orderId}`,
      title: 'Pay Online (Monime)',
    },
    {
      id: `fee_cancel_${orderId}`,
      title: 'Cancel Order',
    },
  ]

  return sendWhatsAppButtons(customerPhone, header, body, footer, buttons)
}

/**
 * 2. Sends order status lifecycle progression alerts to customer WhatsApp
 */
export async function notifyWhatsAppOrderStatus({
  customerPhone,
  orderNumber,
  status,
  branchName = 'Chicken Town SL',
  fulfillmentType = 'DELIVERY',
  deliveryAddress,
  details,
}: OrderStatusNotificationParams): Promise<WhatsAppSendResult> {
  const upperStatus = status.toUpperCase()

  let messageText = ''

  switch (upperStatus) {
    case 'CONFIRMED':
      messageText = `✅ Order #${orderNumber} Confirmed! The kitchen at ${branchName} is preparing your food.`
      break

    case 'PREPARING':
      messageText = `👨‍🍳 Order #${orderNumber} is now being freshly prepared in the kitchen!`
      break

    case 'READY':
      messageText =
        fulfillmentType === 'DELIVERY'
          ? `🍗 Order #${orderNumber} is Ready! Our 392 dispatch rider is collecting it now.`
          : `🍗 Order #${orderNumber} is Ready! You can pick it up at the ${branchName} counter.`
      break

    case 'OUT_FOR_DELIVERY':
      messageText = `🛵 Order #${orderNumber} is Out for Delivery! Our rider is en route to ${
        deliveryAddress || 'your address'
      }.`
      break

    case 'COMPLETED':
      messageText = `🎉 Order #${orderNumber} Delivered/Completed! SWIT U MOT SWIT U LYF. Enjoy your meal and see you soon!`
      break

    case 'CANCELLED':
      messageText = `❌ Order #${orderNumber} has been cancelled.`
      break

    case 'FEE_QUOTED':
      messageText = `💰 Delivery fee has been quoted for Order #${orderNumber}. Please review and confirm your order.`
      break

    default:
      messageText = `🍗 Order #${orderNumber} status update: ${status}.`
      break
  }

  if (details) {
    messageText += `\n${details}`
  }

  return sendWhatsAppText(customerPhone, messageText)
}

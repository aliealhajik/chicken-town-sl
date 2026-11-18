/**
 * Chicken Town SL — Stateful WhatsApp Ordering Bot Engine
 *
 * A PL/pgSQL-persisted state machine that processes inbound WhatsApp messages
 * and drives customers through the full ordering flow. Session state is stored
 * in `whatsapp_sessions` (Supabase), bypassing RLS via the service role key.
 *
 * State flow:
 *   GREETING → SELECT_FULFILLMENT → SELECT_BRANCH? → BROWSE_CATEGORY
 *   → SELECT_ITEM_VARIANT? → SELECT_MODIFIERS? → CART_REVIEW
 *   → ENTER_NAME → ENTER_ADDRESS? → SELECT_PAYMENT → (AWAITING_FEE_CONFIRMATION?)
 */

import { createClient } from '@supabase/supabase-js'
import {
  sendWhatsAppText,
  sendWhatsAppButtons,
  sendWhatsAppList,
  type WhatsAppListSection,
} from '@/lib/whatsapp'
import { CATEGORIES, MENU_ITEMS, isItemAvailableAtBranch } from '@/lib/data/menu-data'
import type { MenuItem, ItemVariant, ModifierGroup, ModifierOption } from '@/lib/data/menu-data'
import { BRANCHES, getRetailBranches } from '@/lib/data/branches'
import { createMonimeCheckoutSession } from '@/lib/monime'

// ---------------------------------------------------------------------------
// Service-role Supabase client (bypasses RLS for session + order writes)
// ---------------------------------------------------------------------------
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('[WhatsApp Bot] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BotState =
  | 'GREETING'
  | 'SELECT_FULFILLMENT'
  | 'SELECT_BRANCH'
  | 'BROWSE_CATEGORY'
  | 'SELECT_ITEM_VARIANT'
  | 'SELECT_MODIFIERS'
  | 'CART_REVIEW'
  | 'ENTER_NAME'
  | 'ENTER_ADDRESS'
  | 'AWAITING_FEE_CONFIRMATION'
  | 'SELECT_PAYMENT'

export interface CartItem {
  menuItemId: string
  name: string
  variantId: string | null
  variantName: string | null
  unitPrice: number
  quantity: number
  modifiers: { groupId: string; groupName: string; optionId: string; optionName: string; priceDelta: number }[]
  itemTotal: number
}

export interface SessionData {
  cart: CartItem[]
  fulfillmentType: 'DELIVERY' | 'PICKUP' | null
  branchId: string | null
  branchName: string | null
  customerName: string | null
  deliveryAddress: string | null
  activeOrderId: string | null
  // Tracks which item and modifier group we are currently configuring
  pendingItemId: string | null
  pendingVariantId: string | null
  pendingVariantName: string | null
  pendingUnitPrice: number | null
  pendingModifiers: CartItem['modifiers']
  pendingModifierGroupIndex: number // which required group we're on
}

const EMPTY_SESSION_DATA: SessionData = {
  cart: [],
  fulfillmentType: null,
  branchId: null,
  branchName: null,
  customerName: null,
  deliveryAddress: null,
  activeOrderId: null,
  pendingItemId: null,
  pendingVariantId: null,
  pendingVariantName: null,
  pendingUnitPrice: null,
  pendingModifiers: [],
  pendingModifierGroupIndex: 0,
}

interface Session {
  wa_phone_number: string
  session_state: BotState
  session_data: SessionData
  branch_id: string | null
  expires_at: string
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

async function getOrCreateSession(phone: string): Promise<Session> {
  const db = getServiceClient()
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

  const { data, error } = await db
    .from('whatsapp_sessions')
    .upsert(
      {
        wa_phone_number: phone,
        session_state: 'GREETING',
        session_data: EMPTY_SESSION_DATA,
        branch_id: null,
        expires_at: expiresAt,
      },
      { onConflict: 'wa_phone_number', ignoreDuplicates: true }
    )
    .select()
    .single()

  if (error || !data) {
    // Row already exists — fetch it
    const { data: existing, error: fetchErr } = await db
      .from('whatsapp_sessions')
      .select('*')
      .eq('wa_phone_number', phone)
      .single()
    if (fetchErr || !existing) {
      throw new Error(`[WhatsApp Bot] Could not fetch session for ${phone}: ${fetchErr?.message}`)
    }
    // If session expired, reset it
    if (new Date(existing.expires_at) < new Date()) {
      return await resetSession(phone)
    }
    return existing as Session
  }
  return data as Session
}

async function updateSession(
  phone: string,
  state: BotState,
  data: Partial<SessionData>
): Promise<void> {
  const db = getServiceClient()
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

  // Merge data with existing
  const { data: existing } = await db
    .from('whatsapp_sessions')
    .select('session_data')
    .eq('wa_phone_number', phone)
    .single()

  const merged: SessionData = { ...(existing?.session_data ?? EMPTY_SESSION_DATA), ...data }

  await db
    .from('whatsapp_sessions')
    .update({
      session_state: state,
      session_data: merged,
      branch_id: merged.branchId ?? null,
      expires_at: expiresAt,
    })
    .eq('wa_phone_number', phone)
}

async function resetSession(phone: string): Promise<Session> {
  const db = getServiceClient()
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  const fresh: Session = {
    wa_phone_number: phone,
    session_state: 'GREETING',
    session_data: { ...EMPTY_SESSION_DATA },
    branch_id: null,
    expires_at: expiresAt,
  }
  await db
    .from('whatsapp_sessions')
    .upsert(fresh, { onConflict: 'wa_phone_number' })
  return fresh
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatPrice(amount: number): string {
  return `Le ${amount.toLocaleString()}`
}

function formatCart(cart: CartItem[]): string {
  if (cart.length === 0) return '_(empty)_'
  return cart
    .map((item, i) => {
      const variant = item.variantName ? ` (${item.variantName})` : ''
      const mods =
        item.modifiers.length > 0
          ? '\n    ↳ ' + item.modifiers.map((m) => m.optionName).join(', ')
          : ''
      return `${i + 1}. ${item.name}${variant} x${item.quantity} — ${formatPrice(item.itemTotal)}${mods}`
    })
    .join('\n')
}

function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.itemTotal, 0)
}

// ---------------------------------------------------------------------------
// State handlers
// ---------------------------------------------------------------------------

async function sendWelcome(phone: string, session: Session): Promise<void> {
  await sendWhatsAppButtons(
    phone,
    '🍗 *Welcome to Chicken Town SL!*\n\n_Swit U Mot Swit U Lyf_ 🌶️\n\nHow would you like to order?',
    [
      { id: 'select_delivery', title: '🛵 Delivery (392 Hub)' },
      { id: 'select_pickup', title: '🏪 Pickup (Choose Branch)' },
    ]
  )
  await updateSession(phone, 'SELECT_FULFILLMENT', {})
}

async function sendCategoryList(phone: string, branchId: string): Promise<void> {
  const activeCategories = CATEGORIES.filter((c) => c.is_active)

  // Split into sections of ≤10 rows (WhatsApp limit)
  const rows = activeCategories.map((cat) => ({
    id: `cat_${cat.id}`,
    title: cat.name,
    description: `Browse ${cat.name}`,
  }))

  const sections: WhatsAppListSection[] = []
  for (let i = 0; i < rows.length; i += 10) {
    sections.push({ title: 'Categories', rows: rows.slice(i, i + 10) })
  }

  await sendWhatsAppList(
    phone,
    '📋 *Our Menu*',
    'What are you in the mood for? Choose a category:',
    'Chicken Town SL',
    '🍽️ Browse Menu',
    sections
  )
}

async function sendItemsInCategory(phone: string, categoryId: string, branchId: string): Promise<void> {
  const catObj = CATEGORIES.find((c) => c.id === categoryId)
  const items = MENU_ITEMS.filter(
    (item) =>
      item.categoryId === categoryId &&
      item.is_active &&
      isItemAvailableAtBranch(item.id, branchId)
  )

  if (items.length === 0) {
    await sendWhatsAppText(phone, `Sorry, no items currently available in *${catObj?.name ?? 'this category'}*. Reply *menu* to browse again.`)
    return
  }

  const rows = items.map((item) => {
    const priceLabel =
      item.variants && item.variants.length > 0
        ? `From ${formatPrice(Math.min(...item.variants.filter((v) => v.is_active).map((v) => v.price)))}`
        : item.base_price != null
        ? formatPrice(item.base_price)
        : ''
    return {
      id: `item_${item.id}`,
      title: item.name.substring(0, 24), // WhatsApp row title limit
      description: priceLabel,
    }
  })

  const sections: WhatsAppListSection[] = []
  for (let i = 0; i < rows.length; i += 10) {
    sections.push({ title: catObj?.name ?? 'Items', rows: rows.slice(i, i + 10) })
  }

  await sendWhatsAppList(
    phone,
    `🍗 *${catObj?.name ?? 'Menu'}*`,
    'Select an item to add to your cart:',
    'Chicken Town SL',
    '🍗 Choose Item',
    sections
  )
}

async function sendVariantList(phone: string, item: MenuItem): Promise<void> {
  const activeVariants = (item.variants ?? []).filter((v) => v.is_active)
  const rows = activeVariants.map((v) => ({
    id: `variant_${item.id}_${v.id}`,
    title: v.name.substring(0, 24),
    description: formatPrice(v.price),
  }))

  await sendWhatsAppList(
    phone,
    `*${item.name}*`,
    'Choose your size / option:',
    'Chicken Town SL',
    '📦 Choose Size',
    [{ title: 'Options', rows }]
  )
}

async function sendModifierGroupPrompt(
  phone: string,
  item: MenuItem,
  groupIndex: number
): Promise<void> {
  const groups = (item.modifier_groups ?? []).filter(
    (g) => g.required && g.min_selections > 0
  )
  if (groupIndex >= groups.length) return

  const group = groups[groupIndex]
  const rows = group.options.map((opt) => ({
    id: `mod_${group.id}_${opt.id}`,
    title: opt.name.substring(0, 24),
    description: opt.price_delta > 0 ? `+${formatPrice(opt.price_delta)}` : 'Included',
  }))

  const sections: WhatsAppListSection[] = []
  for (let i = 0; i < rows.length; i += 10) {
    sections.push({ title: group.name, rows: rows.slice(i, i + 10) })
  }

  await sendWhatsAppList(
    phone,
    `📝 *${group.name}*`,
    group.max_selections > 1
      ? `Choose ${group.min_selections}–${group.max_selections} options:`
      : 'Choose one:',
    'Chicken Town SL',
    '✅ Select',
    sections
  )
}

async function sendCartReview(phone: string, session: Session): Promise<void> {
  const { cart } = session.session_data
  const total = cartTotal(cart)
  const fulfillLabel = session.session_data.fulfillmentType === 'DELIVERY' ? '🛵 Delivery' : '🏪 Pickup'
  const branchLabel = session.session_data.branchName ?? ''

  const cartText = [
    `🛒 *Your Cart* (${fulfillLabel} — ${branchLabel})`,
    '',
    formatCart(cart),
    '',
    `*Subtotal: ${formatPrice(total)}*`,
    '',
    'What would you like to do?',
  ].join('\n')

  await sendWhatsAppButtons(phone, cartText, [
    { id: 'add_more', title: '➕ Add More Items' },
    { id: 'checkout', title: '✅ Checkout' },
    { id: 'clear_cart', title: '🗑️ Clear Cart' },
  ])
  await updateSession(phone, 'CART_REVIEW', {})
}

async function sendPaymentOptions(phone: string): Promise<void> {
  await sendWhatsAppButtons(
    phone,
    '💳 *How would you like to pay?*',
    [
      { id: 'pay_cod', title: '💵 Pay on Delivery/Pickup' },
      { id: 'pay_monime', title: '📲 Pay Online (Monime)' },
    ]
  )
}

async function placeOrder(
  phone: string,
  session: Session,
  paymentMethod: 'PAY_ON_ARRIVAL' | 'MONIME'
): Promise<void> {
  const db = getServiceClient()
  const data = session.session_data
  const total = cartTotal(data.cart)
  const isDelivery = data.fulfillmentType === 'DELIVERY'

  // Generate a human-readable order number: CT-YYYYMMDD-XXXX
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  const orderNumber = `CT-${datePart}-${rand}`

  const orderStatus = isDelivery
    ? 'AWAITING_DELIVERY_FEE'
    : paymentMethod === 'PAY_ON_ARRIVAL'
    ? 'CONFIRMED'
    : 'PENDING_PAYMENT'

  // Insert order
  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      order_number: orderNumber,
      branch_id: data.branchId,
      order_source: 'WHATSAPP',
      fulfillment_type: data.fulfillmentType,
      status: orderStatus,
      payment_method: isDelivery ? null : paymentMethod,
      payment_status: 'UNPAID',
      customer_name: data.customerName,
      customer_phone: phone,
      delivery_address: data.deliveryAddress ?? null,
      subtotal_amount: total,
      delivery_fee: 0,
      total_amount: total,
      notes: null,
    })
    .select()
    .single()

  if (orderErr || !order) {
    console.error('[WhatsApp Bot] Failed to insert order:', orderErr)
    await sendWhatsAppText(phone, '❌ Sorry, there was a problem placing your order. Please try again or call us.')
    return
  }

  // Insert order items
  const orderItems = data.cart.flatMap((cartItem) =>
    Array.from({ length: cartItem.quantity }).map(() => ({
      order_id: order.id,
      menu_item_id: cartItem.menuItemId,
      item_variant_id: cartItem.variantId ?? null,
      item_name: cartItem.name,
      variant_name: cartItem.variantName ?? null,
      unit_price: cartItem.unitPrice,
      quantity: 1,
      modifiers: cartItem.modifiers.length > 0 ? cartItem.modifiers : null,
      line_total: cartItem.unitPrice,
    }))
  )

  if (orderItems.length > 0) {
    const { error: itemsErr } = await db.from('order_items').insert(orderItems)
    if (itemsErr) {
      console.error('[WhatsApp Bot] Failed to insert order items:', itemsErr)
    }
  }

  await updateSession(phone, isDelivery ? 'AWAITING_FEE_CONFIRMATION' : 'GREETING', {
    activeOrderId: order.id,
    cart: isDelivery ? data.cart : [],
  })

  if (isDelivery) {
    await sendWhatsAppText(
      phone,
      `✅ *Order #${orderNumber} received!*\n\n` +
        `🛵 Our 392 Delivery Hub team is calculating your delivery fee. ` +
        `We'll send you a message shortly with the total — you can then confirm payment.\n\n` +
        `Order total (excl. delivery): *${formatPrice(total)}*`
    )
  } else if (paymentMethod === 'PAY_ON_ARRIVAL') {
    const fulfillLabel = data.fulfillmentType === 'PICKUP' ? 'pickup' : 'arrival'
    await sendWhatsAppText(
      phone,
      `✅ *Order #${orderNumber} confirmed!* 🎉\n\n` +
        `Pay *${formatPrice(total)}* on ${fulfillLabel} at *${data.branchName}*.\n\n` +
        `We'll notify you when your order is ready. Thank you for choosing Chicken Town SL! 🍗`
    )
    await resetSession(phone)
  } else {
    // Monime — generate checkout link
    const result = await createMonimeCheckoutSession({
      orderId: order.id,
      orderNumber,
      amountSLE: total,
      customerName: data.customerName ?? 'Customer',
      customerPhone: phone,
    })

    if (result.success) {
      await sendWhatsAppText(
        phone,
        `✅ *Order #${orderNumber} placed!*\n\n` +
          `💳 Complete your payment here:\n${result.checkout_url}\n\n` +
          `Total: *${formatPrice(total)}*\n` +
          `Order will be confirmed once payment is received.`
      )
    } else {
      await sendWhatsAppText(
        phone,
        `⚠️ Order placed but payment link failed. Please contact us to complete payment for order #${orderNumber}.`
      )
    }
    await resetSession(phone)
  }
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function processWhatsAppMessage(
  phone: string,
  customerName: string,
  messagePayload: {
    text?: string
    buttonReplyId?: string
    listReplyId?: string
  }
): Promise<void> {
  const session = await getOrCreateSession(phone)
  const state = session.session_state
  const data = session.session_data

  const text = messagePayload.text?.trim() ?? ''
  const reply = messagePayload.buttonReplyId ?? messagePayload.listReplyId ?? ''

  // --- Global restart keywords ---
  const restartKeywords = /^(hi|hello|menu|order|start|restart|0)$/i
  if (restartKeywords.test(text) || restartKeywords.test(reply)) {
    await resetSession(phone)
    const freshSession = await getOrCreateSession(phone)
    await sendWelcome(phone, freshSession)
    return
  }

  // -----------------------------------------------------------------------
  switch (state) {
    // -----------------------------------------------------------------------
    case 'GREETING':
    case 'SELECT_FULFILLMENT': {
      if (reply === 'select_delivery') {
        const deliveryHub = BRANCHES.find((b) => b.is_delivery_hub)
        await updateSession(phone, 'BROWSE_CATEGORY', {
          fulfillmentType: 'DELIVERY',
          branchId: deliveryHub?.id ?? 'b1000000-0000-0000-0000-000000000007',
          branchName: deliveryHub?.name ?? '392 Delivery Hub',
        })
        await sendWhatsAppText(
          phone,
          `🛵 *Delivery via 392 Hub*\n\nGreat! Browse our menu and we'll deliver to you.\n`
        )
        await sendCategoryList(phone, deliveryHub?.id ?? 'b1000000-0000-0000-0000-000000000007')
        await updateSession(phone, 'BROWSE_CATEGORY', {})
      } else if (reply === 'select_pickup') {
        const retailBranches = getRetailBranches()
        const rows = retailBranches.map((b) => ({
          id: `branch_${b.slug}`,
          title: b.name.substring(0, 24),
          description: b.address,
        }))
        await sendWhatsAppList(
          phone,
          '🏪 *Choose Your Branch*',
          'Which Chicken Town location will you collect from?',
          'Chicken Town SL',
          '📍 Select Branch',
          [{ title: 'Our Branches', rows }]
        )
        await updateSession(phone, 'SELECT_BRANCH', { fulfillmentType: 'PICKUP' })
      } else {
        await sendWelcome(phone, session)
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'SELECT_BRANCH': {
      if (reply.startsWith('branch_')) {
        const slug = reply.replace('branch_', '')
        const branch = BRANCHES.find((b) => b.slug === slug && !b.is_delivery_hub)
        if (!branch) {
          await sendWhatsAppText(phone, '⚠️ Branch not found. Please choose again.')
          break
        }
        await updateSession(phone, 'BROWSE_CATEGORY', {
          branchId: branch.id,
          branchName: branch.name,
        })
        await sendWhatsAppText(phone, `📍 *${branch.name}* selected!\n\nNow browse our menu:`)
        await sendCategoryList(phone, branch.id)
      } else {
        await sendWhatsAppText(phone, 'Please select a branch from the list above.')
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'BROWSE_CATEGORY': {
      if (reply.startsWith('cat_')) {
        const categoryId = reply.replace('cat_', '')
        await updateSession(phone, 'BROWSE_CATEGORY', {})
        await sendItemsInCategory(phone, categoryId, data.branchId ?? '')
      } else if (reply.startsWith('item_')) {
        const itemId = reply.replace('item_', '')
        const item = MENU_ITEMS.find((i) => i.id === itemId)
        if (!item) {
          await sendWhatsAppText(phone, '⚠️ Item not found. Reply *menu* to browse again.')
          break
        }

        const activeVariants = (item.variants ?? []).filter((v) => v.is_active)
        if (activeVariants.length > 0) {
          // Item uses variants — ask for variant first
          await updateSession(phone, 'SELECT_ITEM_VARIANT', {
            pendingItemId: item.id,
            pendingVariantId: null,
            pendingVariantName: null,
            pendingUnitPrice: null,
            pendingModifiers: [],
            pendingModifierGroupIndex: 0,
          })
          await sendVariantList(phone, item)
        } else {
          // No variants — check modifier groups
          const requiredGroups = (item.modifier_groups ?? []).filter(
            (g) => g.required && g.min_selections > 0
          )
          const unitPrice = item.base_price ?? 0

          if (requiredGroups.length > 0) {
            await updateSession(phone, 'SELECT_MODIFIERS', {
              pendingItemId: item.id,
              pendingVariantId: null,
              pendingVariantName: null,
              pendingUnitPrice: unitPrice,
              pendingModifiers: [],
              pendingModifierGroupIndex: 0,
            })
            await sendModifierGroupPrompt(phone, item, 0)
          } else {
            // Add directly to cart
            const newItem: CartItem = {
              menuItemId: item.id,
              name: item.name,
              variantId: null,
              variantName: null,
              unitPrice,
              quantity: 1,
              modifiers: [],
              itemTotal: unitPrice,
            }
            const updatedCart = [...data.cart, newItem]
            await updateSession(phone, 'CART_REVIEW', {
              cart: updatedCart,
              pendingItemId: null,
            })
            await sendCartReview(phone, {
              ...session,
              session_data: { ...data, cart: updatedCart },
            })
          }
        }
      } else {
        // No matching reply — re-send category list
        await sendCategoryList(phone, data.branchId ?? '')
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'SELECT_ITEM_VARIANT': {
      if (reply.startsWith('variant_')) {
        const parts = reply.split('_') // ['variant', itemId, variantId]
        // Format: variant_{itemId}_{variantId} — but itemId itself may contain '_'
        // We stored IDs without underscores in menu-data ('item-bbq-wings' format with hyphens),
        // but let's safely extract: last segment is variantId, middle is itemId
        const itemId = data.pendingItemId
        const variantId = parts[parts.length - 1]
        const item = MENU_ITEMS.find((i) => i.id === itemId)
        const variant = item?.variants?.find((v) => v.id === variantId)

        if (!item || !variant) {
          await sendWhatsAppText(phone, '⚠️ Could not find that option. Please choose again.')
          if (item) await sendVariantList(phone, item)
          break
        }

        const requiredGroups = (item.modifier_groups ?? []).filter(
          (g) => g.required && g.min_selections > 0
        )
        const unitPrice = variant.price

        if (requiredGroups.length > 0) {
          await updateSession(phone, 'SELECT_MODIFIERS', {
            pendingVariantId: variant.id,
            pendingVariantName: variant.name,
            pendingUnitPrice: unitPrice,
            pendingModifiers: [],
            pendingModifierGroupIndex: 0,
          })
          await sendModifierGroupPrompt(phone, item, 0)
        } else {
          const newItem: CartItem = {
            menuItemId: item.id,
            name: item.name,
            variantId: variant.id,
            variantName: variant.name,
            unitPrice,
            quantity: 1,
            modifiers: [],
            itemTotal: unitPrice,
          }
          const updatedCart = [...data.cart, newItem]
          await updateSession(phone, 'CART_REVIEW', {
            cart: updatedCart,
            pendingItemId: null,
            pendingVariantId: null,
            pendingVariantName: null,
            pendingUnitPrice: null,
          })
          await sendCartReview(phone, {
            ...session,
            session_data: { ...data, cart: updatedCart },
          })
        }
      } else {
        // Re-prompt variant selection
        const item = MENU_ITEMS.find((i) => i.id === data.pendingItemId)
        if (item) await sendVariantList(phone, item)
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'SELECT_MODIFIERS': {
      if (reply.startsWith('mod_')) {
        const item = MENU_ITEMS.find((i) => i.id === data.pendingItemId)
        if (!item) {
          await sendWhatsAppText(phone, '⚠️ Something went wrong. Reply *menu* to start over.')
          break
        }

        const requiredGroups = (item.modifier_groups ?? []).filter(
          (g) => g.required && g.min_selections > 0
        )
        const currentGroup = requiredGroups[data.pendingModifierGroupIndex]

        if (!currentGroup) {
          await sendWhatsAppText(phone, '⚠️ Modifier error. Reply *menu* to browse again.')
          break
        }

        // Parse: mod_{groupId}_{optionId}
        const withoutPrefix = reply.replace('mod_', '')
        const groupId = currentGroup.id
        const optionId = withoutPrefix.replace(groupId + '_', '')
        const option = currentGroup.options.find((o) => o.id === optionId)

        if (!option) {
          await sendWhatsAppText(phone, '⚠️ Option not found. Please choose from the list.')
          await sendModifierGroupPrompt(phone, item, data.pendingModifierGroupIndex)
          break
        }

        const selectedMod = {
          groupId: currentGroup.id,
          groupName: currentGroup.name,
          optionId: option.id,
          optionName: option.name,
          priceDelta: option.price_delta,
        }
        const updatedMods = [...data.pendingModifiers, selectedMod]
        const nextGroupIndex = data.pendingModifierGroupIndex + 1

        if (nextGroupIndex < requiredGroups.length) {
          // More modifier groups to satisfy
          await updateSession(phone, 'SELECT_MODIFIERS', {
            pendingModifiers: updatedMods,
            pendingModifierGroupIndex: nextGroupIndex,
          })
          await sendModifierGroupPrompt(phone, item, nextGroupIndex)
        } else {
          // All required groups done — build cart item
          const unitPrice =
            (data.pendingUnitPrice ?? 0) +
            updatedMods.reduce((sum, m) => sum + m.priceDelta, 0)

          const newItem: CartItem = {
            menuItemId: item.id,
            name: item.name,
            variantId: data.pendingVariantId,
            variantName: data.pendingVariantName,
            unitPrice,
            quantity: 1,
            modifiers: updatedMods,
            itemTotal: unitPrice,
          }
          const updatedCart = [...data.cart, newItem]
          await updateSession(phone, 'CART_REVIEW', {
            cart: updatedCart,
            pendingItemId: null,
            pendingVariantId: null,
            pendingVariantName: null,
            pendingUnitPrice: null,
            pendingModifiers: [],
            pendingModifierGroupIndex: 0,
          })
          await sendCartReview(phone, {
            ...session,
            session_data: { ...data, cart: updatedCart },
          })
        }
      } else {
        // Re-prompt current modifier group
        const item = MENU_ITEMS.find((i) => i.id === data.pendingItemId)
        if (item) await sendModifierGroupPrompt(phone, item, data.pendingModifierGroupIndex)
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'CART_REVIEW': {
      if (reply === 'add_more' || reply.startsWith('cat_')) {
        await updateSession(phone, 'BROWSE_CATEGORY', {})
        await sendCategoryList(phone, data.branchId ?? '')
      } else if (reply === 'clear_cart') {
        await updateSession(phone, 'BROWSE_CATEGORY', { cart: [] })
        await sendWhatsAppText(phone, '🗑️ Cart cleared!\n\nBrowse our menu to start again:')
        await sendCategoryList(phone, data.branchId ?? '')
      } else if (reply === 'checkout') {
        await updateSession(phone, 'ENTER_NAME', {})
        await sendWhatsAppText(
          phone,
          `📝 *Almost there!*\n\nPlease reply with your *full name* for this order:`
        )
      } else {
        // Unknown — re-show cart
        await sendCartReview(phone, session)
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'ENTER_NAME': {
      if (text.length < 2) {
        await sendWhatsAppText(phone, 'Please enter your full name (at least 2 characters):')
        break
      }
      const name = text.substring(0, 60)
      await updateSession(phone, data.fulfillmentType === 'DELIVERY' ? 'ENTER_ADDRESS' : 'SELECT_PAYMENT', {
        customerName: name,
      })
      if (data.fulfillmentType === 'DELIVERY') {
        await sendWhatsAppText(
          phone,
          `👋 Thanks, *${name}*!\n\n📍 Please send your *delivery address* (neighbourhood / landmark / full address):`
        )
      } else {
        await sendWhatsAppText(phone, `👋 Thanks, *${name}*!`)
        await sendPaymentOptions(phone)
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'ENTER_ADDRESS': {
      if (text.length < 5) {
        await sendWhatsAppText(phone, 'Please provide a more detailed delivery address:')
        break
      }
      const address = text.substring(0, 200)
      await updateSession(phone, 'SELECT_PAYMENT', { deliveryAddress: address })
      await sendWhatsAppText(
        phone,
        `📍 *Delivery address saved:*\n_${address}_\n\nNow, how would you like to pay?`
      )
      await sendPaymentOptions(phone)
      break
    }

    // -----------------------------------------------------------------------
    case 'SELECT_PAYMENT': {
      if (reply === 'pay_cod') {
        await placeOrder(phone, session, 'PAY_ON_ARRIVAL')
      } else if (reply === 'pay_monime') {
        await placeOrder(phone, session, 'MONIME')
      } else {
        await sendPaymentOptions(phone)
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'AWAITING_FEE_CONFIRMATION': {
      // These button IDs are injected by the cashier portal / WhatsApp notification system
      // Format: fee_accept_cod_{orderId}, fee_pay_monime_{orderId}, fee_cancel_{orderId}
      const orderId = data.activeOrderId

      if (reply.startsWith('fee_accept_cod_')) {
        const db = getServiceClient()
        await db
          .from('orders')
          .update({ payment_method: 'PAY_ON_ARRIVAL', status: 'CONFIRMED' })
          .eq('id', orderId)

        const { data: order } = await db
          .from('orders')
          .select('order_number, total_amount, delivery_fee')
          .eq('id', orderId)
          .single()

        await sendWhatsAppText(
          phone,
          `✅ *Order #${order?.order_number} confirmed!*\n\n` +
            `🛵 Delivery fee: *${formatPrice(order?.delivery_fee ?? 0)}*\n` +
            `Total: *${formatPrice(order?.total_amount ?? 0)}* (pay on delivery)\n\n` +
            `We'll notify you when your rider is on the way! 🍗`
        )
        await resetSession(phone)
      } else if (reply.startsWith('fee_pay_monime_')) {
        const db = getServiceClient()
        const { data: order } = await db
          .from('orders')
          .select('order_number, total_amount, customer_name')
          .eq('id', orderId)
          .single()

        if (!order) {
          await sendWhatsAppText(phone, '⚠️ Order not found. Please contact us.')
          break
        }

        const result = await createMonimeCheckoutSession({
          orderId: orderId ?? '',
          orderNumber: order.order_number,
          amountSLE: order.total_amount,
          customerName: order.customer_name ?? 'Customer',
          customerPhone: phone,
        })

        await db
          .from('orders')
          .update({ payment_method: 'MONIME', status: 'PENDING_PAYMENT' })
          .eq('id', orderId)

        if (result.success) {
          await sendWhatsAppText(
            phone,
            `💳 *Pay Online for Order #${order.order_number}*\n\n` +
              `Total: *${formatPrice(order.total_amount)}*\n\n` +
              `Tap here to pay: ${result.checkout_url}`
          )
        } else {
          await sendWhatsAppText(phone, '⚠️ Could not generate payment link. Please contact us.')
        }
        await resetSession(phone)
      } else if (reply.startsWith('fee_cancel_')) {
        const db = getServiceClient()
        await db
          .from('orders')
          .update({ status: 'CANCELLED' })
          .eq('id', orderId)

        await sendWhatsAppText(
          phone,
          `❌ Order cancelled. No worries — reply *menu* anytime to start a new order! 🍗`
        )
        await resetSession(phone)
      } else {
        await sendWhatsAppText(
          phone,
          `⏳ Your order is waiting for a delivery fee quote from our team.\n\n` +
            `We'll send you a message shortly. Reply *0* to cancel and start over.`
        )
      }
      break
    }

    // -----------------------------------------------------------------------
    default: {
      // Unknown state — reset
      await resetSession(phone)
      await sendWelcome(phone, session)
      break
    }
  }
}

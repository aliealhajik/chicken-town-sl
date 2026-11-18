import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FulfillmentType, OrderSource } from '@/types'
import { getDeliveryHub } from '@/lib/data/branches'

export interface SelectedModifier {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
  priceDelta: number
}

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  variantId?: string | null
  variantName?: string | null
  unitPrice: number
  quantity: number
  selectedModifiers: SelectedModifier[]
  itemTotal: number
}

export interface FulfillmentState {
  fulfillmentType: FulfillmentType
  branchId: string
  branchSlug: string
  branchName: string
  tableNumber: string | null
  orderSource: OrderSource
  isQrLocked: boolean
  isScheduled: boolean
  scheduledTime: string | null
  customerName: string
  customerPhone: string
  deliveryAddress: string
  orderNotes: string
}

export interface CartState extends FulfillmentState {
  items: CartItem[]
  activeOrderIds: string[]

  // Cart actions
  addItem: (item: Omit<CartItem, 'id' | 'itemTotal'> & { id?: string }) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void

  // Fulfillment actions
  setFulfillment: (partial: Partial<FulfillmentState>) => void
  setQrLock: (
    locked: boolean,
    branch?: { id: string; slug: string; name: string },
    tableNumber?: string | null
  ) => void

  // Order persistence actions
  addActiveOrderId: (orderId: string) => void

  // Calculations
  getCartSubtotal: () => number
  getItemCount: () => number
}

// Fallback delivery hub defaults matching lib/data/branches.ts
const DEFAULT_DELIVERY_HUB = {
  id: 'b1000000-0000-0000-0000-000000000007',
  slug: '392',
  name: '392',
}

function getSafeDeliveryHub() {
  try {
    const hub = getDeliveryHub()
    return { id: hub.id, slug: hub.slug, name: hub.name }
  } catch {
    return DEFAULT_DELIVERY_HUB
  }
}

const initialDeliveryHub = getSafeDeliveryHub()

function calculateItemTotal(
  unitPrice: number,
  quantity: number,
  selectedModifiers: SelectedModifier[] = []
): number {
  const modTotal = selectedModifiers.reduce((acc, mod) => acc + (mod.priceDelta || 0), 0)
  return (unitPrice + modTotal) * quantity
}

function generateCartItemId(item: Omit<CartItem, 'id' | 'itemTotal'>): string {
  const modKey = (item.selectedModifiers || [])
    .map((m) => `${m.groupId}:${m.optionId}`)
    .sort()
    .join('|')
  return `${item.menuItemId}__${item.variantId || 'base'}__${modKey}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Fulfillment state defaults
      fulfillmentType: 'DELIVERY',
      branchId: initialDeliveryHub.id,
      branchSlug: initialDeliveryHub.slug,
      branchName: initialDeliveryHub.name,
      tableNumber: null,
      orderSource: 'WEB',
      isQrLocked: false,
      isScheduled: false,
      scheduledTime: null,
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      orderNotes: '',

      // Cart items state
      items: [],
      activeOrderIds: [],

      // Add item to cart
      addItem: (newItem) => {
        const id = newItem.id || generateCartItemId(newItem)
        const quantity = newItem.quantity > 0 ? newItem.quantity : 1
        const itemTotal = calculateItemTotal(
          newItem.unitPrice,
          quantity,
          newItem.selectedModifiers || []
        )

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === id)

          if (existingIndex > -1) {
            const updatedItems = [...state.items]
            const existing = updatedItems[existingIndex]
            const newQty = existing.quantity + quantity
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQty,
              itemTotal: calculateItemTotal(existing.unitPrice, newQty, existing.selectedModifiers),
            }
            return { items: updatedItems }
          }

          return {
            items: [
              ...state.items,
              {
                ...newItem,
                id,
                quantity,
                selectedModifiers: newItem.selectedModifiers || [],
                itemTotal,
              },
            ],
          }
        })
      },

      // Remove item
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }))
      },

      // Update quantity
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === cartItemId) {
              return {
                ...item,
                quantity,
                itemTotal: calculateItemTotal(item.unitPrice, quantity, item.selectedModifiers),
              }
            }
            return item
          }),
        }))
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] })
      },

      // Set fulfillment details
      setFulfillment: (partial) => {
        set((state) => {
          // If switching to DELIVERY, strictly lock branch to 392
          if (partial.fulfillmentType === 'DELIVERY') {
            const hub = getSafeDeliveryHub()
            return {
              ...state,
              ...partial,
              branchId: hub.id,
              branchSlug: hub.slug,
              branchName: hub.name,
              tableNumber: null,
            }
          }

          return {
            ...state,
            ...partial,
          }
        })
      },

      // Set QR Table lock mode
      setQrLock: (locked, branch, tableNumber = null) => {
        set((state) => {
          if (locked && branch) {
            return {
              ...state,
              isQrLocked: true,
              fulfillmentType: 'DINE_IN',
              orderSource: 'QR_TABLE',
              branchId: branch.id,
              branchSlug: branch.slug,
              branchName: branch.name,
              tableNumber: tableNumber ?? state.tableNumber,
            }
          }

          return {
            ...state,
            isQrLocked: locked,
            ...(tableNumber !== undefined ? { tableNumber } : {}),
          }
        })
      },

      // Add active order ID for local storage tracking
      addActiveOrderId: (orderId) => {
        set((state) => {
          if (state.activeOrderIds.includes(orderId)) return state
          return {
            activeOrderIds: [orderId, ...state.activeOrderIds],
          }
        })
      },

      // Calculations
      getCartSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.itemTotal || 0), 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      },
    }),
    {
      name: 'chicken-town-sl-cart-v1',
      partialize: (state) => ({
        items: state.items,
        activeOrderIds: state.activeOrderIds,
        fulfillmentType: state.fulfillmentType,
        branchId: state.branchId,
        branchSlug: state.branchSlug,
        branchName: state.branchName,
        tableNumber: state.tableNumber,
        orderSource: state.orderSource,
        isQrLocked: state.isQrLocked,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        deliveryAddress: state.deliveryAddress,
      }),
    }
  )
)

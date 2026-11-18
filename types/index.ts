export type OrderSource = 'WEB' | 'QR_TABLE' | 'WHATSAPP'
export type FulfillmentType = 'DELIVERY' | 'PICKUP' | 'DINE_IN'
export type PaymentMethod = 'MONIME' | 'PAY_ON_ARRIVAL'
export type PaymentStatus = 'UNPAID' | 'PAID'
export type OrderStatus =
  | 'AWAITING_DELIVERY_FEE' | 'FEE_QUOTED' | 'PENDING_PAYMENT'
  | 'CONFIRMED' | 'PREPARING' | 'READY'
  | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED'
export type StaffRole = 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'CASHIER' | 'KITCHEN'

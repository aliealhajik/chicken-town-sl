export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          name: string
          slug: string
          is_delivery_hub: boolean
          opening_time: string
          closing_time: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          is_delivery_hub?: boolean
          opening_time: string
          closing_time: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          is_delivery_hub?: boolean
          opening_time?: string
          closing_time?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      branch_accounting_days: {
        Row: {
          id: string
          branch_id: string
          active_accounting_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          active_accounting_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          active_accounting_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_accounting_days_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      eod_z_reports: {
        Row: {
          id: string
          branch_id: string
          accounting_date: string
          report_data: Json
          closed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          accounting_date: string
          report_data: Json
          closed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          accounting_date?: string
          report_data?: Json
          closed_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eod_z_reports_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      staff_profiles: {
        Row: {
          id: string
          branch_id: string | null
          role: Database["public"]["Enums"]["staff_role"]
          full_name: string
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          branch_id?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          full_name: string
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          full_name?: string
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          base_price: number | null
          image_url: string | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          base_price?: number | null
          image_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          slug?: string
          description?: string | null
          base_price?: number | null
          image_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      item_variants: {
        Row: {
          id: string
          menu_item_id: string
          name: string
          price: number
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          menu_item_id: string
          name: string
          price: number
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          menu_item_id?: string
          name?: string
          price?: number
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_variants_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      modifier_groups: {
        Row: {
          id: string
          menu_item_id: string
          name: string
          is_required: boolean
          min_selections: number
          max_selections: number
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          menu_item_id: string
          name: string
          is_required?: boolean
          min_selections?: number
          max_selections?: number
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          menu_item_id?: string
          name?: string
          is_required?: boolean
          min_selections?: number
          max_selections?: number
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modifier_groups_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      modifier_options: {
        Row: {
          id: string
          modifier_group_id: string
          name: string
          price_delta: number
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          modifier_group_id: string
          name: string
          price_delta?: number
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          modifier_group_id?: string
          name?: string
          price_delta?: number
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modifier_options_modifier_group_id_fkey"
            columns: ["modifier_group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          }
        ]
      }
      branch_item_availability: {
        Row: {
          id: string
          branch_id: string
          menu_item_id: string
          is_available: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          menu_item_id: string
          is_available?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          menu_item_id?: string
          is_available?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_item_availability_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_item_availability_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          order_source: Database["public"]["Enums"]["order_source"]
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"]
          branch_id: string
          table_number: string | null
          accounting_date: string
          scheduled_for: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          order_notes: string | null
          subtotal: number
          delivery_fee: number
          total_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          status: Database["public"]["Enums"]["order_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          order_source: Database["public"]["Enums"]["order_source"]
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"]
          branch_id: string
          table_number?: string | null
          accounting_date: string
          scheduled_for?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          order_notes?: string | null
          subtotal: number
          delivery_fee?: number
          total_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["order_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          order_source?: Database["public"]["Enums"]["order_source"]
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"]
          branch_id?: string
          table_number?: string | null
          accounting_date?: string
          scheduled_for?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          order_notes?: string | null
          subtotal?: number
          delivery_fee?: number
          total_amount?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["order_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          item_variant_id: string | null
          item_name: string
          variant_name: string | null
          unit_price: number
          quantity: number
          line_total: number
          modifiers_snapshot: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          item_variant_id?: string | null
          item_name: string
          variant_name?: string | null
          unit_price: number
          quantity: number
          line_total: number
          modifiers_snapshot?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          item_variant_id?: string | null
          item_name?: string
          variant_name?: string | null
          unit_price?: number
          quantity?: number
          line_total?: number
          modifiers_snapshot?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_item_variant_id_fkey"
            columns: ["item_variant_id"]
            isOneToOne: false
            referencedRelation: "item_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_sessions: {
        Row: {
          id: string
          wa_phone_number: string
          session_state: string
          session_data: Json
          branch_id: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wa_phone_number: string
          session_state: string
          session_data: Json
          branch_id?: string | null
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wa_phone_number?: string
          session_state?: string
          session_data?: Json
          branch_id?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_sessions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_processed_messages: {
        Row: {
          id: string
          wa_message_id: string
          processed_at: string
        }
        Insert: {
          id?: string
          wa_message_id: string
          processed_at?: string
        }
        Update: {
          id?: string
          wa_message_id?: string
          processed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      staff_role: "SUPER_ADMIN" | "BRANCH_MANAGER" | "CASHIER" | "KITCHEN"
      order_source: "WEB" | "QR_TABLE" | "WHATSAPP"
      fulfillment_type: "DELIVERY" | "PICKUP" | "DINE_IN"
      payment_method: "MONIME" | "PAY_ON_ARRIVAL"
      payment_status: "UNPAID" | "PAID"
      order_status:
        | "AWAITING_DELIVERY_FEE"
        | "FEE_QUOTED"
        | "PENDING_PAYMENT"
        | "CONFIRMED"
        | "PREPARING"
        | "READY"
        | "OUT_FOR_DELIVERY"
        | "COMPLETED"
        | "CANCELLED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ---------------------------------------------------------------------------
// Convenience helpers — mirrors the shape Supabase CLI generates
// ---------------------------------------------------------------------------

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T]

// Typed shorthand aliases
export type Branch = Tables<"branches">
export type BranchAccountingDay = Tables<"branch_accounting_days">
export type EodZReport = Tables<"eod_z_reports">
export type StaffProfile = Tables<"staff_profiles">
export type Category = Tables<"categories">
export type MenuItem = Tables<"menu_items">
export type ItemVariant = Tables<"item_variants">
export type ModifierGroup = Tables<"modifier_groups">
export type ModifierOption = Tables<"modifier_options">
export type BranchItemAvailability = Tables<"branch_item_availability">
export type Order = Tables<"orders">
export type OrderItem = Tables<"order_items">
export type WhatsappSession = Tables<"whatsapp_sessions">
export type WhatsappProcessedMessage = Tables<"whatsapp_processed_messages">

export type StaffRole = Enums<"staff_role">
export type OrderSource = Enums<"order_source">
export type FulfillmentType = Enums<"fulfillment_type">
export type PaymentMethod = Enums<"payment_method">
export type PaymentStatus = Enums<"payment_status">
export type OrderStatus = Enums<"order_status">

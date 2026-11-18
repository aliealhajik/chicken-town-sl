-- ════════════════════════════════════════════════════════════════════
-- Chicken Town SL — Initial Schema Migration
-- ════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy search later

-- ── Custom Enum Types ───────────────────────────────────────────────
CREATE TYPE staff_role AS ENUM ('SUPER_ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'KITCHEN');
CREATE TYPE order_source AS ENUM ('WEB', 'QR_TABLE', 'WHATSAPP');
CREATE TYPE fulfillment_type AS ENUM ('DELIVERY', 'PICKUP', 'DINE_IN');
CREATE TYPE payment_method AS ENUM ('MONIME', 'PAY_ON_ARRIVAL');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID');
CREATE TYPE order_status AS ENUM (
  'AWAITING_DELIVERY_FEE',
  'FEE_QUOTED',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED'
);

-- ── 1. branches ─────────────────────────────────────────────────────
CREATE TABLE branches (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  is_delivery_hub  BOOLEAN NOT NULL DEFAULT FALSE,
  opening_time     TIME NOT NULL DEFAULT '10:00:00',
  closing_time     TIME NOT NULL DEFAULT '02:00:00',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. branch_accounting_days ────────────────────────────────────────
CREATE TABLE branch_accounting_days (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id             UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  active_accounting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id)  -- one active accounting date per branch
);

-- ── 3. eod_z_reports ─────────────────────────────────────────────────
CREATE TABLE eod_z_reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id        UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  accounting_date  DATE NOT NULL,
  report_data      JSONB NOT NULL,
  closed_by        UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id, accounting_date)  -- immutable: one Z-report per branch per day
);

-- ── 4. staff_profiles ────────────────────────────────────────────────
CREATE TABLE staff_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  role        staff_role NOT NULL,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. categories ────────────────────────────────────────────────────
CREATE TABLE categories (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  display_order  INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. menu_items ─────────────────────────────────────────────────────
CREATE TABLE menu_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id    UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT,
  base_price     NUMERIC(10,2),  -- NULL = item uses variants
  image_url      TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. item_variants ──────────────────────────────────────────────────
CREATE TABLE item_variants (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id   UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,  -- e.g. '1 Wing', '4 Wings', 'Whole Chicken'
  price          NUMERIC(10,2) NOT NULL,
  display_order  INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. modifier_groups ────────────────────────────────────────────────
CREATE TABLE modifier_groups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id    UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,  -- e.g. 'Choose a Side', 'Choose a Soft Drink'
  is_required     BOOLEAN NOT NULL DEFAULT FALSE,
  min_selections  INTEGER NOT NULL DEFAULT 0,
  max_selections  INTEGER NOT NULL DEFAULT 1,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. modifier_options ───────────────────────────────────────────────
CREATE TABLE modifier_options (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,  -- e.g. 'Plain Jollof Rice', 'Coke', 'Strawberry'
  price_delta       NUMERIC(10,2) NOT NULL DEFAULT 0,
  display_order     INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. branch_item_availability ──────────────────────────────────────
CREATE TABLE branch_item_availability (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id      UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  menu_item_id   UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  is_available   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id, menu_item_id)
);

-- ── 11. orders ────────────────────────────────────────────────────────
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT NOT NULL UNIQUE,
  order_source     order_source NOT NULL,
  fulfillment_type fulfillment_type NOT NULL,
  branch_id        UUID NOT NULL REFERENCES branches(id),
  table_number     TEXT,
  accounting_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_for    TIMESTAMPTZ,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  delivery_address TEXT,
  delivery_lat     NUMERIC(10,7),
  delivery_lng     NUMERIC(10,7),
  order_notes      TEXT,
  subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method   payment_method NOT NULL,
  payment_status   payment_status NOT NULL DEFAULT 'UNPAID',
  status           order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate order numbers: CT-YYYYMMDD-XXXX
CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'CT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ── 12. order_items ───────────────────────────────────────────────────
CREATE TABLE order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id        UUID NOT NULL REFERENCES menu_items(id),
  item_variant_id     UUID REFERENCES item_variants(id),
  item_name           TEXT NOT NULL,  -- snapshot at order time
  variant_name        TEXT,
  unit_price          NUMERIC(10,2) NOT NULL,
  quantity            INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total          NUMERIC(10,2) NOT NULL,
  modifiers_snapshot  JSONB,  -- [{name, price_delta, option_name}]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 13. whatsapp_sessions ─────────────────────────────────────────────
CREATE TABLE whatsapp_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wa_phone_number  TEXT NOT NULL UNIQUE,
  session_state    TEXT NOT NULL DEFAULT 'IDLE',
  session_data     JSONB NOT NULL DEFAULT '{}',
  branch_id        UUID REFERENCES branches(id) ON DELETE SET NULL,
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 14. whatsapp_processed_messages ───────────────────────────────────
CREATE TABLE whatsapp_processed_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wa_message_id   TEXT NOT NULL UNIQUE,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════
CREATE INDEX idx_menu_items_category    ON menu_items(category_id);
CREATE INDEX idx_menu_items_active      ON menu_items(is_active);
CREATE INDEX idx_item_variants_item     ON item_variants(menu_item_id);
CREATE INDEX idx_modifier_groups_item   ON modifier_groups(menu_item_id);
CREATE INDEX idx_modifier_options_group ON modifier_options(modifier_group_id);
CREATE INDEX idx_orders_branch          ON orders(branch_id);
CREATE INDEX idx_orders_status          ON orders(status);
CREATE INDEX idx_orders_accounting_date ON orders(accounting_date);
CREATE INDEX idx_orders_customer_phone  ON orders(customer_phone);
CREATE INDEX idx_order_items_order      ON order_items(order_id);
CREATE INDEX idx_branch_avail_branch    ON branch_item_availability(branch_id);
CREATE INDEX idx_branch_avail_item      ON branch_item_availability(menu_item_id);
CREATE INDEX idx_wa_sessions_phone      ON whatsapp_sessions(wa_phone_number);
CREATE INDEX idx_wa_sessions_expires    ON whatsapp_sessions(expires_at);

-- ═══════════════════════════════════════════════════════════════════
-- updated_at TRIGGERS
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_branch_accounting_days_updated_at
  BEFORE UPDATE ON branch_accounting_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_staff_profiles_updated_at
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_wa_sessions_updated_at
  BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_branch_avail_updated_at
  BEFORE UPDATE ON branch_item_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE branches                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_accounting_days     ENABLE ROW LEVEL SECURITY;
ALTER TABLE eod_z_reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_variants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups            ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options           ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_item_availability   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_processed_messages ENABLE ROW LEVEL SECURITY;

-- ── Helper function: get caller's role ────────────────────────────
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS staff_role AS $$
  SELECT role FROM staff_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_branch_id()
RETURNS UUID AS $$
  SELECT branch_id FROM staff_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── branches ──────────────────────────────────────────────────────
-- Public: anyone can read branches (for menu display, branch selector)
CREATE POLICY "branches_public_read"
  ON branches FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "branches_admin_all"
  ON branches FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── branch_accounting_days ────────────────────────────────────────
CREATE POLICY "bad_staff_read"
  ON branch_accounting_days FOR SELECT TO authenticated
  USING (
    is_super_admin()
    OR branch_id = get_my_branch_id()
  );

CREATE POLICY "bad_manager_update"
  ON branch_accounting_days FOR UPDATE TO authenticated
  USING (
    is_super_admin()
    OR (get_my_role() = 'BRANCH_MANAGER' AND branch_id = get_my_branch_id())
  );

CREATE POLICY "bad_admin_insert"
  ON branch_accounting_days FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

-- ── eod_z_reports ─────────────────────────────────────────────────
CREATE POLICY "eod_staff_read"
  ON eod_z_reports FOR SELECT TO authenticated
  USING (
    is_super_admin()
    OR branch_id = get_my_branch_id()
  );

CREATE POLICY "eod_manager_insert"
  ON eod_z_reports FOR INSERT TO authenticated
  WITH CHECK (
    is_super_admin()
    OR (get_my_role() = 'BRANCH_MANAGER' AND branch_id = get_my_branch_id())
  );

-- eod_z_reports: no UPDATE or DELETE — immutable snapshots

-- ── staff_profiles ────────────────────────────────────────────────
-- Staff can read their own profile
CREATE POLICY "staff_read_own"
  ON staff_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_super_admin());

-- Manager can read their branch's staff
CREATE POLICY "manager_read_branch_staff"
  ON staff_profiles FOR SELECT TO authenticated
  USING (
    get_my_role() = 'BRANCH_MANAGER'
    AND branch_id = get_my_branch_id()
  );

CREATE POLICY "admin_all_staff"
  ON staff_profiles FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── categories ────────────────────────────────────────────────────
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "categories_admin_write"
  ON categories FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── menu_items ────────────────────────────────────────────────────
CREATE POLICY "menu_items_public_read"
  ON menu_items FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "menu_items_admin_write"
  ON menu_items FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── item_variants ─────────────────────────────────────────────────
CREATE POLICY "item_variants_public_read"
  ON item_variants FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "item_variants_admin_write"
  ON item_variants FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── modifier_groups ───────────────────────────────────────────────
CREATE POLICY "modifier_groups_public_read"
  ON modifier_groups FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "modifier_groups_admin_write"
  ON modifier_groups FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── modifier_options ──────────────────────────────────────────────
CREATE POLICY "modifier_options_public_read"
  ON modifier_options FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "modifier_options_admin_write"
  ON modifier_options FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── branch_item_availability ──────────────────────────────────────
CREATE POLICY "bia_public_read"
  ON branch_item_availability FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "bia_manager_update"
  ON branch_item_availability FOR UPDATE TO authenticated
  USING (
    is_super_admin()
    OR (
      get_my_role() IN ('BRANCH_MANAGER', 'CASHIER')
      AND branch_id = get_my_branch_id()
    )
  );

CREATE POLICY "bia_admin_insert_delete"
  ON branch_item_availability FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

-- ── orders ────────────────────────────────────────────────────────
-- Public (anon) can INSERT orders (customer placing an order)
CREATE POLICY "orders_anon_insert"
  ON orders FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Customers cannot read orders via anon (privacy); staff can
CREATE POLICY "orders_staff_read"
  ON orders FOR SELECT TO authenticated
  USING (
    is_super_admin()
    OR branch_id = get_my_branch_id()
  );

CREATE POLICY "orders_staff_update"
  ON orders FOR UPDATE TO authenticated
  USING (
    is_super_admin()
    OR branch_id = get_my_branch_id()
  );

-- ── order_items ───────────────────────────────────────────────────
CREATE POLICY "order_items_anon_insert"
  ON order_items FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "order_items_staff_read"
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND (is_super_admin() OR o.branch_id = get_my_branch_id())
    )
  );

-- ── whatsapp_sessions ─────────────────────────────────────────────
-- Only service role (via API routes) or super admin can touch these
CREATE POLICY "wa_sessions_admin_all"
  ON whatsapp_sessions FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── whatsapp_processed_messages ───────────────────────────────────
CREATE POLICY "wa_processed_admin_all"
  ON whatsapp_processed_messages FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ═══════════════════════════════════════════════════════════════════
-- BRANCH SEEDS (7 official branches)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO branches (name, slug, is_delivery_hub, opening_time, closing_time) VALUES
  ('Little Lumley Branch',    'little-lumley',    FALSE, '10:00:00', '02:00:00'),
  ('Big Lumley Branch',       'big-lumley',       FALSE, '10:00:00', '02:00:00'),
  ('Wilkinson Road Branch',   'wilkinson-road',   FALSE, '10:00:00', '02:00:00'),
  ('Old Railway Line Branch', 'old-railway-line', FALSE, '10:00:00', '02:00:00'),
  ('Wilberforce Street Branch','wilberforce-street',FALSE,'10:00:00','02:00:00'),
  ('Jui Branch',              'jui',              FALSE, '10:00:00', '02:00:00'),
  ('392',                     '392',              TRUE,  '10:00:00', '02:00:00');

-- Initialise accounting days for each branch
INSERT INTO branch_accounting_days (branch_id, active_accounting_date)
SELECT id, CURRENT_DATE FROM branches;

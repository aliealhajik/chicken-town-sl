-- =============================================================================
-- Chicken Town SL — Full Menu Seed Script
-- Runs AFTER the schema migration. Idempotent via ON CONFLICT DO NOTHING.
-- Uses uuid_generate_v4() for all primary keys.
-- =============================================================================

-- Ensure uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SECTION 1: CATEGORIES
-- =============================================================================
DO $$
DECLARE
  cat_bbq            UUID := uuid_generate_v4();
  cat_fried          UUID := uuid_generate_v4();
  cat_burgers        UUID := uuid_generate_v4();
  cat_top_sellers    UUID := uuid_generate_v4();
  cat_fowls          UUID := uuid_generate_v4();
  cat_celebration    UUID := uuid_generate_v4();
  cat_sides          UUID := uuid_generate_v4();
  cat_swit           UUID := uuid_generate_v4();
  cat_soft_drinks    UUID := uuid_generate_v4();
  cat_alcoholic      UUID := uuid_generate_v4();
BEGIN
  INSERT INTO categories (id, name, display_order, is_active)
  VALUES
    (cat_bbq,         'BBQ Chicken',                 1,  true),
    (cat_fried,       'Fried Chicken',                2,  true),
    (cat_burgers,     'Burgers & Wraps',              3,  true),
    (cat_top_sellers, 'Top Sellers & Meal Deals',     4,  true),
    (cat_fowls,       'Fowls (Pepper Chicken)',        5,  true),
    (cat_celebration, 'Special Celebration Deals',    6,  true),
    (cat_sides,       'Sides & Extras',               7,  true),
    (cat_swit,        'Swit U Mot',                   8,  true),
    (cat_soft_drinks, 'Soft Drinks & Water',          9,  true),
    (cat_alcoholic,   'Alcoholic Drinks',             10, true)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 2: BBQ CHICKEN
-- =============================================================================
DO $$
DECLARE
  -- Category
  cat_bbq          UUID;

  -- Items
  item_bbq_wings   UUID := uuid_generate_v4();
  item_bbq_drum    UUID := uuid_generate_v4();

  -- Variants
  v_bbq_wings_1    UUID := uuid_generate_v4();
  v_bbq_wings_4    UUID := uuid_generate_v4();
  v_bbq_drum_1     UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_bbq FROM categories WHERE name = 'BBQ Chicken' LIMIT 1;

  -- Menu Items
  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_bbq_wings, cat_bbq, 'BBQ Wings',    NULL, true, 1),
    (item_bbq_drum,  cat_bbq, 'BBQ Drumstick', NULL, true, 2)
  ON CONFLICT DO NOTHING;

  -- Variants: BBQ Wings
  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    (v_bbq_wings_1, item_bbq_wings, '1 Wing',  25,  true, 1),
    (v_bbq_wings_4, item_bbq_wings, '4 Wings', 100, true, 2)
  ON CONFLICT DO NOTHING;

  -- Variants: BBQ Drumstick
  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    (v_bbq_drum_1, item_bbq_drum, '1 Drumstick', 50, true, 1)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 3: FRIED CHICKEN
-- =============================================================================
DO $$
DECLARE
  cat_fried          UUID;

  item_fried_drum    UUID := uuid_generate_v4();
  item_fried_wings   UUID := uuid_generate_v4();
  item_boneless      UUID := uuid_generate_v4();
  item_nuggets       UUID := uuid_generate_v4();

  v_fd_1             UUID := uuid_generate_v4();
  v_fd_3             UUID := uuid_generate_v4();
  v_fw_1             UUID := uuid_generate_v4();
  v_fw_4             UUID := uuid_generate_v4();
  v_bl_3             UUID := uuid_generate_v4();
  v_bl_6             UUID := uuid_generate_v4();
  v_ng_6             UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_fried FROM categories WHERE name = 'Fried Chicken' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_fried_drum,  cat_fried, 'Fried Drumsticks', NULL, true, 1),
    (item_fried_wings, cat_fried, 'Fried Wings',      NULL, true, 2),
    (item_boneless,    cat_fried, 'Boneless Strips',  NULL, true, 3),
    (item_nuggets,     cat_fried, 'Nuggets',          NULL, true, 4)
  ON CONFLICT DO NOTHING;

  -- Fried Drumsticks
  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    (v_fd_1, item_fried_drum, '1 Drumstick',  45,  true, 1),
    (v_fd_3, item_fried_drum, '3 Drumsticks', 130, true, 2)
  ON CONFLICT DO NOTHING;

  -- Fried Wings
  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    (v_fw_1, item_fried_wings, '1 Wing',  25, true, 1),
    (v_fw_4, item_fried_wings, '4 Wings', 90, true, 2)
  ON CONFLICT DO NOTHING;

  -- Boneless Strips
  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    (v_bl_3, item_boneless, '3 Boneless Strips', 75,  true, 1),
    (v_bl_6, item_boneless, '6 Boneless Strips', 140, true, 2)
  ON CONFLICT DO NOTHING;

  -- Nuggets
  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    (v_ng_6, item_nuggets, '6 Nuggets', 45, true, 1)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 4: BURGERS & WRAPS
-- =============================================================================
DO $$
DECLARE
  cat_burgers         UUID;

  item_ct_burger      UUID := uuid_generate_v4();
  item_fl_burger      UUID := uuid_generate_v4();
  item_ct_burger_co   UUID := uuid_generate_v4();
  item_ct_wrap        UUID := uuid_generate_v4();
  item_ct_wrap_co     UUID := uuid_generate_v4();
  item_mami           UUID := uuid_generate_v4();

  -- CT Burger Combo modifiers
  mg_cbc_side         UUID := uuid_generate_v4();
  mg_cbc_drink        UUID := uuid_generate_v4();

  -- CT Wrap Combo modifiers
  mg_cwc_side         UUID := uuid_generate_v4();
  mg_cwc_drink        UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_burgers FROM categories WHERE name = 'Burgers & Wraps' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_ct_burger,    cat_burgers, 'CT Burger',         90,  true, 1),
    (item_fl_burger,    cat_burgers, 'Frontline Burger',  110, true, 2),
    (item_ct_burger_co, cat_burgers, 'CT Burger Combo',   150, true, 3),
    (item_ct_wrap,      cat_burgers, 'CT Wrap',           90,  true, 4),
    (item_ct_wrap_co,   cat_burgers, 'CT Wrap Combo',     145, true, 5),
    (item_mami,         cat_burgers, 'Mami Meal',         30,  true, 6)
  ON CONFLICT DO NOTHING;

  -- ── CT Burger Combo ──────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_cbc_side,  item_ct_burger_co, 'Choose a Side',                    true, 1, 1, 1),
    (mg_cbc_drink, item_ct_burger_co, 'Choose a 300ml Plastic Soft Drink', true, 1, 1, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_cbc_side,  'Plain Jollof Rice', 0, true, 1),
    (uuid_generate_v4(), mg_cbc_side,  'Fried Rice',        0, true, 2),
    (uuid_generate_v4(), mg_cbc_side,  'Crispy Chips',      0, true, 3),
    (uuid_generate_v4(), mg_cbc_drink, 'Coke',              0, true, 1),
    (uuid_generate_v4(), mg_cbc_drink, 'Fanta',             0, true, 2),
    (uuid_generate_v4(), mg_cbc_drink, 'Sprite',            0, true, 3),
    (uuid_generate_v4(), mg_cbc_drink, 'Vimto',             0, true, 4)
  ON CONFLICT DO NOTHING;

  -- ── CT Wrap Combo ────────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_cwc_side,  item_ct_wrap_co, 'Choose a Side',                    true, 1, 1, 1),
    (mg_cwc_drink, item_ct_wrap_co, 'Choose a 300ml Plastic Soft Drink', true, 1, 1, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_cwc_side,  'Plain Jollof Rice', 0, true, 1),
    (uuid_generate_v4(), mg_cwc_side,  'Fried Rice',        0, true, 2),
    (uuid_generate_v4(), mg_cwc_side,  'Crispy Chips',      0, true, 3),
    (uuid_generate_v4(), mg_cwc_drink, 'Coke',              0, true, 1),
    (uuid_generate_v4(), mg_cwc_drink, 'Fanta',             0, true, 2),
    (uuid_generate_v4(), mg_cwc_drink, 'Sprite',            0, true, 3),
    (uuid_generate_v4(), mg_cwc_drink, 'Vimto',             0, true, 4)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 5: TOP SELLERS & MEAL DEALS
-- =============================================================================
DO $$
DECLARE
  cat_top         UUID;

  item_family     UUID := uuid_generate_v4();
  item_classic    UUID := uuid_generate_v4();
  item_bbqwm      UUID := uuid_generate_v4();
  item_frwm       UUID := uuid_generate_v4();
  item_snack      UUID := uuid_generate_v4();

  -- Family Deal
  mg_fd_sides     UUID := uuid_generate_v4();
  mg_fd_drinks    UUID := uuid_generate_v4();

  -- Classic Box
  mg_cb_side      UUID := uuid_generate_v4();
  mg_cb_drink     UUID := uuid_generate_v4();

  -- BBQ Wings Meal
  mg_bwm_side     UUID := uuid_generate_v4();
  mg_bwm_drink    UUID := uuid_generate_v4();

  -- Fried Wings Meal
  mg_fwm_side     UUID := uuid_generate_v4();
  mg_fwm_drink    UUID := uuid_generate_v4();

  -- Snack Box
  mg_sb_side      UUID := uuid_generate_v4();
  mg_sb_drink     UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_top FROM categories WHERE name = 'Top Sellers & Meal Deals' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_family,  cat_top, 'Family Deal',      499, true, 1),
    (item_classic, cat_top, 'Classic Box',      150, true, 2),
    (item_bbqwm,   cat_top, 'BBQ Wings Meal',   155, true, 3),
    (item_frwm,    cat_top, 'Fried Wings Meal', 155, true, 4),
    (item_snack,   cat_top, 'Snack Box',        99,  true, 5)
  ON CONFLICT DO NOTHING;

  -- ── Family Deal ──────────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_fd_sides,  item_family, 'Choose 2 Sides',       true, 2, 2, 1),
    (mg_fd_drinks, item_family, 'Choose 2 Soft Drinks',  true, 2, 2, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_fd_sides,  'Plain Jollof Rice', 0, true, 1),
    (uuid_generate_v4(), mg_fd_sides,  'Fried Rice',        0, true, 2),
    (uuid_generate_v4(), mg_fd_sides,  'Crispy Chips',      0, true, 3),
    (uuid_generate_v4(), mg_fd_sides,  'Plantain',          0, true, 4),
    (uuid_generate_v4(), mg_fd_drinks, 'Coke',              0, true, 1),
    (uuid_generate_v4(), mg_fd_drinks, 'Fanta',             0, true, 2),
    (uuid_generate_v4(), mg_fd_drinks, 'Sprite',            0, true, 3),
    (uuid_generate_v4(), mg_fd_drinks, 'Vimto',             0, true, 4),
    (uuid_generate_v4(), mg_fd_drinks, 'Maltina',           0, true, 5)
  ON CONFLICT DO NOTHING;

  -- ── Classic Box ──────────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_cb_side,  item_classic, 'Choose a Side',       true, 1, 1, 1),
    (mg_cb_drink, item_classic, 'Choose a Soft Drink', true, 1, 1, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_cb_side,  'Plain Jollof Rice', 0, true, 1),
    (uuid_generate_v4(), mg_cb_side,  'Fried Rice',        0, true, 2),
    (uuid_generate_v4(), mg_cb_side,  'Crispy Chips',      0, true, 3),
    (uuid_generate_v4(), mg_cb_drink, 'Coke',              0, true, 1),
    (uuid_generate_v4(), mg_cb_drink, 'Fanta',             0, true, 2),
    (uuid_generate_v4(), mg_cb_drink, 'Sprite',            0, true, 3),
    (uuid_generate_v4(), mg_cb_drink, 'Vimto',             0, true, 4),
    (uuid_generate_v4(), mg_cb_drink, 'Maltina',           0, true, 5)
  ON CONFLICT DO NOTHING;

  -- ── BBQ Wings Meal ───────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_bwm_side,  item_bbqwm, 'Choose a Side',       true, 1, 1, 1),
    (mg_bwm_drink, item_bbqwm, 'Choose a Soft Drink', true, 1, 1, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_bwm_side,  'Plain Jollof Rice', 0, true, 1),
    (uuid_generate_v4(), mg_bwm_side,  'Fried Rice',        0, true, 2),
    (uuid_generate_v4(), mg_bwm_side,  'Crispy Chips',      0, true, 3),
    (uuid_generate_v4(), mg_bwm_drink, 'Coke',              0, true, 1),
    (uuid_generate_v4(), mg_bwm_drink, 'Fanta',             0, true, 2),
    (uuid_generate_v4(), mg_bwm_drink, 'Sprite',            0, true, 3),
    (uuid_generate_v4(), mg_bwm_drink, 'Vimto',             0, true, 4),
    (uuid_generate_v4(), mg_bwm_drink, 'Maltina',           0, true, 5)
  ON CONFLICT DO NOTHING;

  -- ── Fried Wings Meal ─────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_fwm_side,  item_frwm, 'Choose a Side',       true, 1, 1, 1),
    (mg_fwm_drink, item_frwm, 'Choose a Soft Drink', true, 1, 1, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_fwm_side,  'Plain Jollof Rice', 0, true, 1),
    (uuid_generate_v4(), mg_fwm_side,  'Fried Rice',        0, true, 2),
    (uuid_generate_v4(), mg_fwm_side,  'Crispy Chips',      0, true, 3),
    (uuid_generate_v4(), mg_fwm_drink, 'Coke',              0, true, 1),
    (uuid_generate_v4(), mg_fwm_drink, 'Fanta',             0, true, 2),
    (uuid_generate_v4(), mg_fwm_drink, 'Sprite',            0, true, 3),
    (uuid_generate_v4(), mg_fwm_drink, 'Vimto',             0, true, 4),
    (uuid_generate_v4(), mg_fwm_drink, 'Maltina',           0, true, 5)
  ON CONFLICT DO NOTHING;

  -- ── Snack Box ────────────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_sb_side,  item_snack, 'Choose a Side',       true, 1, 1, 1),
    (mg_sb_drink, item_snack, 'Choose a Soft Drink', true, 1, 1, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_sb_side,  'Plain Jollof Rice', 0, true, 1),
    (uuid_generate_v4(), mg_sb_side,  'Fried Rice',        0, true, 2),
    (uuid_generate_v4(), mg_sb_side,  'Crispy Chips',      0, true, 3),
    (uuid_generate_v4(), mg_sb_drink, 'Coke',              0, true, 1),
    (uuid_generate_v4(), mg_sb_drink, 'Fanta',             0, true, 2),
    (uuid_generate_v4(), mg_sb_drink, 'Sprite',            0, true, 3),
    (uuid_generate_v4(), mg_sb_drink, 'Vimto',             0, true, 4),
    (uuid_generate_v4(), mg_sb_drink, 'Maltina',           0, true, 5)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 6: FOWLS (PEPPER CHICKEN)
-- =============================================================================
DO $$
DECLARE
  cat_fowls       UUID;

  item_eng_fowl   UUID := uuid_generate_v4();
  item_kon_fowl   UUID := uuid_generate_v4();

  v_ef_whole      UUID := uuid_generate_v4();
  v_ef_half       UUID := uuid_generate_v4();
  v_kf_whole      UUID := uuid_generate_v4();
  v_kf_half       UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_fowls FROM categories WHERE name = 'Fowls (Pepper Chicken)' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_eng_fowl, cat_fowls, 'English Fowl', NULL, true, 1),
    (item_kon_fowl, cat_fowls, 'Kontri Fowl',  NULL, true, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    (v_ef_whole, item_eng_fowl, 'Whole Chicken', 300, true, 1),
    (v_ef_half,  item_eng_fowl, 'Half Chicken',  160, true, 2),
    (v_kf_whole, item_kon_fowl, 'Whole Chicken', 320, true, 1),
    (v_kf_half,  item_kon_fowl, 'Half Chicken',  160, true, 2)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 7: SPECIAL CELEBRATION DEALS
-- =============================================================================
DO $$
DECLARE
  cat_cel         UUID;

  item_deal5      UUID := uuid_generate_v4();
  item_deal10     UUID := uuid_generate_v4();
  item_deal15     UUID := uuid_generate_v4();

  mg_d5_drinks    UUID := uuid_generate_v4();
  mg_d10_drinks   UUID := uuid_generate_v4();
  mg_d15_drinks   UUID := uuid_generate_v4();
  mg_d15_ice      UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_cel FROM categories WHERE name = 'Special Celebration Deals' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_deal5,  cat_cel, 'Meal Deal for 5',  925,  true, 1),
    (item_deal10, cat_cel, 'Meal Deal for 10', 2299, true, 2),
    (item_deal15, cat_cel, 'Meal Deal for 15', 3499, true, 3)
  ON CONFLICT DO NOTHING;

  -- ── Meal Deal for 5 ──────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_d5_drinks, item_deal5, 'Choose 5 Soft Drinks', true, 5, 5, 1)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_d5_drinks, 'Coke',    0, true, 1),
    (uuid_generate_v4(), mg_d5_drinks, 'Fanta',   0, true, 2),
    (uuid_generate_v4(), mg_d5_drinks, 'Sprite',  0, true, 3),
    (uuid_generate_v4(), mg_d5_drinks, 'Vimto',   0, true, 4),
    (uuid_generate_v4(), mg_d5_drinks, 'Maltina', 0, true, 5)
  ON CONFLICT DO NOTHING;

  -- ── Meal Deal for 10 ─────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_d10_drinks, item_deal10, 'Choose 10 Soft Drinks', true, 10, 10, 1)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_d10_drinks, 'Coke',    0, true, 1),
    (uuid_generate_v4(), mg_d10_drinks, 'Fanta',   0, true, 2),
    (uuid_generate_v4(), mg_d10_drinks, 'Sprite',  0, true, 3),
    (uuid_generate_v4(), mg_d10_drinks, 'Vimto',   0, true, 4),
    (uuid_generate_v4(), mg_d10_drinks, 'Maltina', 0, true, 5)
  ON CONFLICT DO NOTHING;

  -- ── Meal Deal for 15 ─────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_d15_drinks, item_deal15, 'Choose 15 Soft Drinks',       true, 15, 15, 1),
    (mg_d15_ice,    item_deal15, 'Choose 10 Ice Cream Flavours', true, 10, 10, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_d15_drinks, 'Coke',       0, true, 1),
    (uuid_generate_v4(), mg_d15_drinks, 'Fanta',      0, true, 2),
    (uuid_generate_v4(), mg_d15_drinks, 'Sprite',     0, true, 3),
    (uuid_generate_v4(), mg_d15_drinks, 'Vimto',      0, true, 4),
    (uuid_generate_v4(), mg_d15_drinks, 'Maltina',    0, true, 5),
    (uuid_generate_v4(), mg_d15_ice,    'Strawberry', 0, true, 1),
    (uuid_generate_v4(), mg_d15_ice,    'Vanilla',    0, true, 2),
    (uuid_generate_v4(), mg_d15_ice,    'Chocolate',  0, true, 3)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 8: SIDES & EXTRAS
-- =============================================================================
DO $$
DECLARE
  cat_sides          UUID;

  item_chips         UUID := uuid_generate_v4();
  item_chips_masala  UUID := uuid_generate_v4();
  item_plantain      UUID := uuid_generate_v4();
  item_jollof_shred  UUID := uuid_generate_v4();
  item_fried_shred   UUID := uuid_generate_v4();
  item_fried_rice    UUID := uuid_generate_v4();
  item_jollof_rice   UUID := uuid_generate_v4();
  item_side_salad    UUID := uuid_generate_v4();
  item_ct_salad      UUID := uuid_generate_v4();
  item_extra_sauce   UUID := uuid_generate_v4();

  mg_sauce           UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_sides FROM categories WHERE name = 'Sides & Extras' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_chips,        cat_sides, 'Crispy Chips',                  45,  true, 1),
    (item_chips_masala, cat_sides, 'Chips Masala',                  55,  true, 2),
    (item_plantain,     cat_sides, 'Plantain',                      50,  true, 3),
    (item_jollof_shred, cat_sides, 'Jollof Rice + Shredded Chicken', 70, true, 4),
    (item_fried_shred,  cat_sides, 'Fried Rice + Shredded Chicken',  70, true, 5),
    (item_fried_rice,   cat_sides, 'Fried Rice',                    50,  true, 6),
    (item_jollof_rice,  cat_sides, 'Jollof Rice',                   50,  true, 7),
    (item_side_salad,   cat_sides, 'Side Salad',                    65,  true, 8),
    (item_ct_salad,     cat_sides, 'Chicken Town Salad',            110, true, 9),
    (item_extra_sauce,  cat_sides, 'Extra Sauce',                   5,   true, 10)
  ON CONFLICT DO NOTHING;

  -- Extra Sauce modifier
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_sauce, item_extra_sauce, 'Choose a Sauce', true, 1, 1, 1)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_sauce, 'Pepper',  0, true, 1),
    (uuid_generate_v4(), mg_sauce, 'Ketchup', 0, true, 2)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 9: SWIT U MOT
-- =============================================================================
DO $$
DECLARE
  cat_swit        UUID;

  item_chillers   UUID := uuid_generate_v4();
  item_hb         UUID := uuid_generate_v4();
  item_tea_coffee UUID := uuid_generate_v4();

  mg_chil_flav    UUID := uuid_generate_v4();
  mg_hb_flav      UUID := uuid_generate_v4();
  mg_tc           UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_swit FROM categories WHERE name = 'Swit U Mot' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_chillers,   cat_swit, 'Chillers Ice Cream', 35, true, 1),
    (item_hb,         cat_swit, 'HB Ice Cream',       45, true, 2),
    (item_tea_coffee, cat_swit, 'Tea / Coffee',        25, true, 3)
  ON CONFLICT DO NOTHING;

  -- Chillers Ice Cream
  INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selections, max_selections, display_order)
  VALUES
    (mg_chil_flav, item_chillers,   'Choose a Flavour', true, 1, 1, 1),
    (mg_hb_flav,   item_hb,         'Choose a Flavour', true, 1, 1, 1),
    (mg_tc,        item_tea_coffee, 'Tea or Coffee?',   true, 1, 1, 1)
  ON CONFLICT DO NOTHING;

  INSERT INTO modifier_options (id, modifier_group_id, name, price_delta, is_active, display_order)
  VALUES
    (uuid_generate_v4(), mg_chil_flav, 'Strawberry', 0, true, 1),
    (uuid_generate_v4(), mg_chil_flav, 'Vanilla',    0, true, 2),
    (uuid_generate_v4(), mg_chil_flav, 'Chocolate',  0, true, 3),
    (uuid_generate_v4(), mg_hb_flav,   'Strawberry', 0, true, 1),
    (uuid_generate_v4(), mg_hb_flav,   'Vanilla',    0, true, 2),
    (uuid_generate_v4(), mg_hb_flav,   'Chocolate',  0, true, 3),
    (uuid_generate_v4(), mg_tc,        'Tea',         0, true, 1),
    (uuid_generate_v4(), mg_tc,        'Coffee',      0, true, 2)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 10: SOFT DRINKS & WATER
-- =============================================================================
DO $$
DECLARE
  cat_soft        UUID;

  item_vimto      UUID := uuid_generate_v4();
  item_coke_s     UUID := uuid_generate_v4();
  item_coke_l     UUID := uuid_generate_v4();
  item_fanta_s    UUID := uuid_generate_v4();
  item_fanta_l    UUID := uuid_generate_v4();
  item_sprite_s   UUID := uuid_generate_v4();
  item_sprite_l   UUID := uuid_generate_v4();
  item_maltina    UUID := uuid_generate_v4();
  item_xtra       UUID := uuid_generate_v4();
  item_sierra     UUID := uuid_generate_v4();
  item_flav_milk  UUID := uuid_generate_v4();
  item_lucozade   UUID := uuid_generate_v4();
  item_3x         UUID := uuid_generate_v4();
  item_water      UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_soft FROM categories WHERE name = 'Soft Drinks & Water' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_vimto,     cat_soft, 'Vimto',         NULL, true, 1),
    (item_coke_s,    cat_soft, 'Coke Short',     NULL, true, 2),
    (item_coke_l,    cat_soft, 'Coke Long',      NULL, true, 3),
    (item_fanta_s,   cat_soft, 'Fanta Short',    NULL, true, 4),
    (item_fanta_l,   cat_soft, 'Fanta Long',     NULL, true, 5),
    (item_sprite_s,  cat_soft, 'Sprite Short',   NULL, true, 6),
    (item_sprite_l,  cat_soft, 'Sprite Long',    NULL, true, 7),
    (item_maltina,   cat_soft, 'Maltina',        NULL, true, 8),
    (item_xtra,      cat_soft, 'Xtra Juice',     NULL, true, 9),
    (item_sierra,    cat_soft, 'Sierra Juice',   NULL, true, 10),
    (item_flav_milk, cat_soft, 'Flavoured Milk', NULL, true, 11),
    (item_lucozade,  cat_soft, 'Lucozade',       NULL, true, 12),
    (item_3x,        cat_soft, '3X',             NULL, true, 13),
    (item_water,     cat_soft, 'Water',          NULL, true, 14)
  ON CONFLICT DO NOTHING;

  -- Variants
  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    -- Vimto
    (uuid_generate_v4(), item_vimto,     'Can',          35, true, 1),
    (uuid_generate_v4(), item_vimto,     'Plastic',      15, true, 2),
    -- Coke Short
    (uuid_generate_v4(), item_coke_s,    'Can',          30, true, 1),
    (uuid_generate_v4(), item_coke_s,    'Plastic',      15, true, 2),
    -- Coke Long
    (uuid_generate_v4(), item_coke_l,    'Can',          30, true, 1),
    -- Fanta Short
    (uuid_generate_v4(), item_fanta_s,   'Can',          30, true, 1),
    (uuid_generate_v4(), item_fanta_s,   'Plastic',      15, true, 2),
    -- Fanta Long
    (uuid_generate_v4(), item_fanta_l,   'Can',          30, true, 1),
    -- Sprite Short
    (uuid_generate_v4(), item_sprite_s,  'Can',          30, true, 1),
    (uuid_generate_v4(), item_sprite_s,  'Plastic',      15, true, 2),
    -- Sprite Long
    (uuid_generate_v4(), item_sprite_l,  'Can',          30, true, 1),
    -- Maltina
    (uuid_generate_v4(), item_maltina,   'Can',          30, true, 1),
    (uuid_generate_v4(), item_maltina,   'Plastic',      30, true, 2),
    -- Xtra Juice
    (uuid_generate_v4(), item_xtra,      'Plastic',      35, true, 1),
    -- Sierra Juice
    (uuid_generate_v4(), item_sierra,    'Plastic',      15, true, 1),
    -- Flavoured Milk
    (uuid_generate_v4(), item_flav_milk, 'Plastic',      65, true, 1),
    -- Lucozade
    (uuid_generate_v4(), item_lucozade,  'Can',          45, true, 1),
    -- 3X
    (uuid_generate_v4(), item_3x,        'Can',          40, true, 1),
    -- Water
    (uuid_generate_v4(), item_water,     'Big Bottle',   20, true, 1),
    (uuid_generate_v4(), item_water,     'Small Bottle', 10, true, 2)
  ON CONFLICT DO NOTHING;
END $$;


-- =============================================================================
-- SECTION 11: ALCOHOLIC DRINKS
-- =============================================================================
DO $$
DECLARE
  cat_alc         UUID;

  item_mutzig     UUID := uuid_generate_v4();
  item_heineken   UUID := uuid_generate_v4();
  item_guinness   UUID := uuid_generate_v4();
  item_vody       UUID := uuid_generate_v4();
  item_star       UUID := uuid_generate_v4();
  item_amstel     UUID := uuid_generate_v4();
  item_codys      UUID := uuid_generate_v4();
  item_codyb      UUID := uuid_generate_v4();
  item_cider      UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO cat_alc FROM categories WHERE name = 'Alcoholic Drinks' LIMIT 1;

  INSERT INTO menu_items (id, category_id, name, base_price, is_active, display_order)
  VALUES
    (item_mutzig,   cat_alc, 'Mutzig',       NULL, true, 1),
    (item_heineken, cat_alc, 'Heineken',     NULL, true, 2),
    (item_guinness, cat_alc, 'Guinness',     NULL, true, 3),
    (item_vody,     cat_alc, 'Vody',         NULL, true, 4),
    (item_star,     cat_alc, 'Star',         NULL, true, 5),
    (item_amstel,   cat_alc, 'Amstel',       NULL, true, 6),
    (item_codys,    cat_alc, 'Cody''s Stout', NULL, true, 7),
    (item_codyb,    cat_alc, 'Cody''s Beer',  NULL, true, 8),
    (item_cider,    cat_alc, 'Cider',        NULL, true, 9)
  ON CONFLICT DO NOTHING;

  INSERT INTO item_variants (id, menu_item_id, name, price, is_active, display_order)
  VALUES
    -- Mutzig
    (uuid_generate_v4(), item_mutzig,   'Can',    40, true, 1),
    (uuid_generate_v4(), item_mutzig,   'Bottle', 40, true, 2),
    -- Heineken
    (uuid_generate_v4(), item_heineken, 'Can',    65, true, 1),
    (uuid_generate_v4(), item_heineken, 'Bottle', 65, true, 2),
    -- Guinness
    (uuid_generate_v4(), item_guinness, 'Can',    45, true, 1),
    (uuid_generate_v4(), item_guinness, 'Bottle', 45, true, 2),
    -- Vody
    (uuid_generate_v4(), item_vody,     'Can',    45, true, 1),
    -- Star
    (uuid_generate_v4(), item_star,     'Can',    35, true, 1),
    (uuid_generate_v4(), item_star,     'Bottle', 30, true, 2),
    -- Amstel
    (uuid_generate_v4(), item_amstel,   'Can',    40, true, 1),
    -- Cody's Stout
    (uuid_generate_v4(), item_codys,    'Can',    65, true, 1),
    -- Cody's Beer
    (uuid_generate_v4(), item_codyb,    'Can',    65, true, 1),
    -- Cider
    (uuid_generate_v4(), item_cider,    'Bottle', 75, true, 1)
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================================================
-- END OF SEED
-- =============================================================================

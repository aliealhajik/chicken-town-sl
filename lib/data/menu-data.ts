export interface ModifierOption {
  id: string
  name: string
  price_delta: number
  is_active: boolean
  display_order: number
}

export interface ModifierGroup {
  id: string
  name: string
  required: boolean
  min_selections: number
  max_selections: number
  display_order: number
  options: ModifierOption[]
}

export interface ItemVariant {
  id: string
  name: string
  price: number
  is_active: boolean
  display_order: number
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  slug: string
  description?: string
  base_price: number | null
  image_url?: string
  is_active: boolean
  display_order: number
  variants?: ItemVariant[]
  modifier_groups?: ModifierGroup[]
}

export interface Category {
  id: string
  name: string
  slug: string
  display_order: number
  is_active: boolean
}

export const CATEGORIES: Category[] = [
  { id: 'cat-bbq', name: 'BBQ Chicken', slug: 'bbq-chicken', display_order: 1, is_active: true },
  { id: 'cat-fried', name: 'Fried Chicken', slug: 'fried-chicken', display_order: 2, is_active: true },
  { id: 'cat-burgers', name: 'Burgers & Wraps', slug: 'burgers-wraps', display_order: 3, is_active: true },
  { id: 'cat-top-sellers', name: 'Top Sellers & Meal Deals', slug: 'top-sellers-meal-deals', display_order: 4, is_active: true },
  { id: 'cat-fowls', name: 'Fowls (Pepper Chicken)', slug: 'fowls-pepper-chicken', display_order: 5, is_active: true },
  { id: 'cat-celebration', name: 'Special Celebration Deals', slug: 'special-celebration-deals', display_order: 6, is_active: true },
  { id: 'cat-sides', name: 'Sides & Extras', slug: 'sides-extras', display_order: 7, is_active: true },
  { id: 'cat-swit', name: 'Swit U Mot', slug: 'swit-u-mot', display_order: 8, is_active: true },
  { id: 'cat-soft-drinks', name: 'Soft Drinks & Water', slug: 'soft-drinks-water', display_order: 9, is_active: true },
  { id: 'cat-alcoholic', name: 'Alcoholic Drinks', slug: 'alcoholic-drinks', display_order: 10, is_active: true },
]

export const MENU_ITEMS: MenuItem[] = [
  // BBQ Chicken
  {
    id: 'item-bbq-wings',
    categoryId: 'cat-bbq',
    name: 'BBQ Wings',
    slug: 'bbq-wings',
    description: 'Juicy chicken wings coated in our signature spicy BBQ glaze.',
    base_price: null,
    image_url: '/images/bbq-wings.jpg',
    is_active: true,
    display_order: 1,
    variants: [
      { id: 'v-bbq-w1', name: '1 Wing', price: 25, is_active: true, display_order: 1 },
      { id: 'v-bbq-w4', name: '4 Wings', price: 100, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-bbq-drum',
    categoryId: 'cat-bbq',
    name: 'BBQ Drumstick',
    slug: 'bbq-drumstick',
    description: 'Tender drumstick flame-grilled with rich local spiced BBQ sauce.',
    base_price: null,
    image_url: '/images/bbq-drumstick.jpg',
    is_active: true,
    display_order: 2,
    variants: [
      { id: 'v-bbq-d1', name: '1 Drumstick', price: 50, is_active: true, display_order: 1 },
    ],
  },

  // Fried Chicken
  {
    id: 'item-fried-drum',
    categoryId: 'cat-fried',
    name: 'Fried Drumsticks',
    slug: 'fried-drumsticks',
    description: 'Crispy golden fried drumsticks, crunchy outside and juicy inside.',
    base_price: null,
    image_url: '/images/fried-drumsticks.jpg',
    is_active: true,
    display_order: 1,
    variants: [
      { id: 'v-fd-1', name: '1 Drumstick', price: 45, is_active: true, display_order: 1 },
      { id: 'v-fd-3', name: '3 Drumsticks', price: 130, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-fried-wings',
    categoryId: 'cat-fried',
    name: 'Fried Wings',
    slug: 'fried-wings',
    description: 'Crispy fried wings seasoned with Chicken Town special spices.',
    base_price: null,
    image_url: '/images/fried-wings.jpg',
    is_active: true,
    display_order: 2,
    variants: [
      { id: 'v-fw-1', name: '1 Wing', price: 25, is_active: true, display_order: 1 },
      { id: 'v-fw-4', name: '4 Wings', price: 90, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-boneless',
    categoryId: 'cat-fried',
    name: 'Boneless Strips',
    slug: 'boneless-strips',
    description: 'Pure 100% chicken breast strips seasoned and fried to perfection.',
    base_price: null,
    image_url: '/images/boneless-strips.jpg',
    is_active: true,
    display_order: 3,
    variants: [
      { id: 'v-bl-3', name: '3 Boneless Strips', price: 75, is_active: true, display_order: 1 },
      { id: 'v-bl-6', name: '6 Boneless Strips', price: 140, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-nuggets',
    categoryId: 'cat-fried',
    name: 'Nuggets',
    slug: 'nuggets',
    description: 'Bite-sized golden crispy nuggets, loved by all.',
    base_price: null,
    image_url: '/images/nuggets.jpg',
    is_active: true,
    display_order: 4,
    variants: [
      { id: 'v-ng-6', name: '6 Nuggets', price: 45, is_active: true, display_order: 1 },
    ],
  },

  // Burgers & Wraps
  {
    id: 'item-ct-burger',
    categoryId: 'cat-burgers',
    name: 'CT Burger',
    slug: 'ct-burger',
    description: 'Our iconic fried chicken fillet with crisp lettuce and mayo in a toasted bun.',
    base_price: 90,
    image_url: '/images/ct-burger.jpg',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'item-fl-burger',
    categoryId: 'cat-burgers',
    name: 'Frontline Burger',
    slug: 'frontline-burger',
    description: 'Double stacked chicken fillet, melted cheese, and signature fiery sauce.',
    base_price: 110,
    image_url: '/images/frontline-burger.jpg',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'item-ct-burger-co',
    categoryId: 'cat-burgers',
    name: 'CT Burger Combo',
    slug: 'ct-burger-combo',
    description: 'CT Burger accompanied by your choice of hot side and refreshing soft drink.',
    base_price: 150,
    image_url: '/images/ct-burger-combo.jpg',
    is_active: true,
    display_order: 3,
    modifier_groups: [
      {
        id: 'mg-cbc-side',
        name: 'Choose a Side',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-cbc-s1', name: 'Plain Jollof Rice', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-cbc-s2', name: 'Fried Rice', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-cbc-s3', name: 'Crispy Chips', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
      {
        id: 'mg-cbc-drink',
        name: 'Choose a 300ml Plastic Soft Drink',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 2,
        options: [
          { id: 'mo-cbc-d1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-cbc-d2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-cbc-d3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-cbc-d4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
        ],
      },
    ],
  },
  {
    id: 'item-ct-wrap',
    categoryId: 'cat-burgers',
    name: 'CT Wrap',
    slug: 'ct-wrap',
    description: 'Crispy chicken tenders rolled in a soft warm tortilla with fresh veggies.',
    base_price: 90,
    image_url: '/images/ct-wrap.jpg',
    is_active: true,
    display_order: 4,
  },
  {
    id: 'item-ct-wrap-co',
    categoryId: 'cat-burgers',
    name: 'CT Wrap Combo',
    slug: 'ct-wrap-combo',
    description: 'CT Wrap with your choice of hot side and 300ml soft drink.',
    base_price: 145,
    image_url: '/images/ct-wrap-combo.jpg',
    is_active: true,
    display_order: 5,
    modifier_groups: [
      {
        id: 'mg-cwc-side',
        name: 'Choose a Side',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-cwc-s1', name: 'Plain Jollof Rice', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-cwc-s2', name: 'Fried Rice', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-cwc-s3', name: 'Crispy Chips', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
      {
        id: 'mg-cwc-drink',
        name: 'Choose a 300ml Plastic Soft Drink',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 2,
        options: [
          { id: 'mo-cwc-d1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-cwc-d2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-cwc-d3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-cwc-d4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
        ],
      },
    ],
  },
  {
    id: 'item-mami',
    categoryId: 'cat-burgers',
    name: 'Mami Meal',
    slug: 'mami-meal',
    description: 'Comforting quick bite packed with genuine home flavours.',
    base_price: 30,
    image_url: '/images/mami-meal.jpg',
    is_active: true,
    display_order: 6,
  },

  // Top Sellers & Meal Deals
  {
    id: 'item-family',
    categoryId: 'cat-top-sellers',
    name: 'Family Deal',
    slug: 'family-deal',
    description: 'Abundant sharing feast: full portion of chicken, 2 hearty sides, and 2 drinks.',
    base_price: 499,
    image_url: '/images/family-deal.jpg',
    is_active: true,
    display_order: 1,
    modifier_groups: [
      {
        id: 'mg-fd-sides',
        name: 'Choose 2 Sides',
        required: true,
        min_selections: 2,
        max_selections: 2,
        display_order: 1,
        options: [
          { id: 'mo-fds-1', name: 'Plain Jollof Rice', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-fds-2', name: 'Fried Rice', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-fds-3', name: 'Crispy Chips', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-fds-4', name: 'Plantain', price_delta: 0, is_active: true, display_order: 4 },
        ],
      },
      {
        id: 'mg-fd-drinks',
        name: 'Choose 2 Soft Drinks',
        required: true,
        min_selections: 2,
        max_selections: 2,
        display_order: 2,
        options: [
          { id: 'mo-fdd-1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-fdd-2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-fdd-3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-fdd-4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
          { id: 'mo-fdd-5', name: 'Maltina', price_delta: 0, is_active: true, display_order: 5 },
        ],
      },
    ],
  },
  {
    id: 'item-classic',
    categoryId: 'cat-top-sellers',
    name: 'Classic Box',
    slug: 'classic-box',
    description: 'Crispy chicken pieces paired with your favourite side and chilled drink.',
    base_price: 150,
    image_url: '/images/classic-box.jpg',
    is_active: true,
    display_order: 2,
    modifier_groups: [
      {
        id: 'mg-cb-side',
        name: 'Choose a Side',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-cbs-1', name: 'Plain Jollof Rice', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-cbs-2', name: 'Fried Rice', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-cbs-3', name: 'Crispy Chips', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
      {
        id: 'mg-cb-drink',
        name: 'Choose a Soft Drink',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 2,
        options: [
          { id: 'mo-cbd-1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-cbd-2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-cbd-3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-cbd-4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
          { id: 'mo-cbd-5', name: 'Maltina', price_delta: 0, is_active: true, display_order: 5 },
        ],
      },
    ],
  },
  {
    id: 'item-bbqwm',
    categoryId: 'cat-top-sellers',
    name: 'BBQ Wings Meal',
    slug: 'bbq-wings-meal',
    description: 'BBQ Wings with your choice of side and drink.',
    base_price: 155,
    image_url: '/images/bbq-wings-meal.jpg',
    is_active: true,
    display_order: 3,
    modifier_groups: [
      {
        id: 'mg-bwm-side',
        name: 'Choose a Side',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-bwms-1', name: 'Plain Jollof Rice', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-bwms-2', name: 'Fried Rice', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-bwms-3', name: 'Crispy Chips', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
      {
        id: 'mg-bwm-drink',
        name: 'Choose a Soft Drink',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 2,
        options: [
          { id: 'mo-bwmd-1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-bwmd-2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-bwmd-3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-bwmd-4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
          { id: 'mo-bwmd-5', name: 'Maltina', price_delta: 0, is_active: true, display_order: 5 },
        ],
      },
    ],
  },
  {
    id: 'item-frwm',
    categoryId: 'cat-top-sellers',
    name: 'Fried Wings Meal',
    slug: 'fried-wings-meal',
    description: 'Golden fried wings meal with side and beverage.',
    base_price: 155,
    image_url: '/images/fried-wings-meal.jpg',
    is_active: true,
    display_order: 4,
    modifier_groups: [
      {
        id: 'mg-fwm-side',
        name: 'Choose a Side',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-fwms-1', name: 'Plain Jollof Rice', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-fwms-2', name: 'Fried Rice', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-fwms-3', name: 'Crispy Chips', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
      {
        id: 'mg-fwm-drink',
        name: 'Choose a Soft Drink',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 2,
        options: [
          { id: 'mo-fwmd-1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-fwmd-2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-fwmd-3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-fwmd-4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
          { id: 'mo-fwmd-5', name: 'Maltina', price_delta: 0, is_active: true, display_order: 5 },
        ],
      },
    ],
  },
  {
    id: 'item-snack',
    categoryId: 'cat-top-sellers',
    name: 'Snack Box',
    slug: 'snack-box',
    description: 'Quick on-the-go snack box with crispy chicken, side, and drink.',
    base_price: 99,
    image_url: '/images/snack-box.jpg',
    is_active: true,
    display_order: 5,
    modifier_groups: [
      {
        id: 'mg-sb-side',
        name: 'Choose a Side',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-sbs-1', name: 'Plain Jollof Rice', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-sbs-2', name: 'Fried Rice', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-sbs-3', name: 'Crispy Chips', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
      {
        id: 'mg-sb-drink',
        name: 'Choose a Soft Drink',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 2,
        options: [
          { id: 'mo-sbd-1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-sbd-2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-sbd-3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-sbd-4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
          { id: 'mo-sbd-5', name: 'Maltina', price_delta: 0, is_active: true, display_order: 5 },
        ],
      },
    ],
  },

  // Fowls (Pepper Chicken)
  {
    id: 'item-eng-fowl',
    categoryId: 'cat-fowls',
    name: 'English Fowl',
    slug: 'english-fowl',
    description: 'Tender chicken braised with Sierra Leone hot pepper sauce and native seasonings.',
    base_price: null,
    image_url: '/images/english-fowl.jpg',
    is_active: true,
    display_order: 1,
    variants: [
      { id: 'v-ef-whole', name: 'Whole Chicken', price: 300, is_active: true, display_order: 1 },
      { id: 'v-ef-half', name: 'Half Chicken', price: 160, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-kon-fowl',
    categoryId: 'cat-fowls',
    name: 'Kontri Fowl',
    slug: 'kontri-fowl',
    description: 'Authentic local organic country fowl slow cooked in rich spicy pepper soup and gravy.',
    base_price: null,
    image_url: '/images/kontri-fowl.jpg',
    is_active: true,
    display_order: 2,
    variants: [
      { id: 'v-kf-whole', name: 'Whole Chicken', price: 320, is_active: true, display_order: 1 },
      { id: 'v-kf-half', name: 'Half Chicken', price: 160, is_active: true, display_order: 2 },
    ],
  },

  // Special Celebration Deals
  {
    id: 'item-deal5',
    categoryId: 'cat-celebration',
    name: 'Meal Deal for 5',
    slug: 'meal-deal-for-5',
    description: 'Generous group feast complete with 5 soft drinks of your choice.',
    base_price: 925,
    image_url: '/images/meal-deal-5.jpg',
    is_active: true,
    display_order: 1,
    modifier_groups: [
      {
        id: 'mg-d5-drinks',
        name: 'Choose 5 Soft Drinks',
        required: true,
        min_selections: 5,
        max_selections: 5,
        display_order: 1,
        options: [
          { id: 'mo-d5d-1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-d5d-2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-d5d-3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-d5d-4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
          { id: 'mo-d5d-5', name: 'Maltina', price_delta: 0, is_active: true, display_order: 5 },
        ],
      },
    ],
  },
  {
    id: 'item-deal10',
    categoryId: 'cat-celebration',
    name: 'Meal Deal for 10',
    slug: 'meal-deal-for-10',
    description: 'Perfect for parties and office gatherings: includes 10 soft drinks.',
    base_price: 2299,
    image_url: '/images/meal-deal-10.jpg',
    is_active: true,
    display_order: 2,
    modifier_groups: [
      {
        id: 'mg-d10-drinks',
        name: 'Choose 10 Soft Drinks',
        required: true,
        min_selections: 10,
        max_selections: 10,
        display_order: 1,
        options: [
          { id: 'mo-d10d-1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-d10d-2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-d10d-3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-d10d-4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
          { id: 'mo-d10d-5', name: 'Maltina', price_delta: 0, is_active: true, display_order: 5 },
        ],
      },
    ],
  },
  {
    id: 'item-deal15',
    categoryId: 'cat-celebration',
    name: 'Meal Deal for 15',
    slug: 'meal-deal-for-15',
    description: 'Ultimate grand party celebration: includes 15 soft drinks and 10 ice creams!',
    base_price: 3499,
    image_url: '/images/meal-deal-15.jpg',
    is_active: true,
    display_order: 3,
    modifier_groups: [
      {
        id: 'mg-d15-drinks',
        name: 'Choose 15 Soft Drinks',
        required: true,
        min_selections: 15,
        max_selections: 15,
        display_order: 1,
        options: [
          { id: 'mo-d15d-1', name: 'Coke', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-d15d-2', name: 'Fanta', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-d15d-3', name: 'Sprite', price_delta: 0, is_active: true, display_order: 3 },
          { id: 'mo-d15d-4', name: 'Vimto', price_delta: 0, is_active: true, display_order: 4 },
          { id: 'mo-d15d-5', name: 'Maltina', price_delta: 0, is_active: true, display_order: 5 },
        ],
      },
      {
        id: 'mg-d15-ice',
        name: 'Choose 10 Ice Cream Flavours',
        required: true,
        min_selections: 10,
        max_selections: 10,
        display_order: 2,
        options: [
          { id: 'mo-d15i-1', name: 'Strawberry', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-d15i-2', name: 'Vanilla', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-d15i-3', name: 'Chocolate', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
    ],
  },

  // Sides & Extras
  {
    id: 'item-chips',
    categoryId: 'cat-sides',
    name: 'Crispy Chips',
    slug: 'crispy-chips',
    description: 'Crispy hot potato fries lightly salted.',
    base_price: 45,
    image_url: '/images/chips.jpg',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'item-chips-masala',
    categoryId: 'cat-sides',
    name: 'Chips Masala',
    slug: 'chips-masala',
    description: 'Hot chips tossed in our signature spicy masala tomato relish.',
    base_price: 55,
    image_url: '/images/chips-masala.jpg',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'item-plantain',
    categoryId: 'cat-sides',
    name: 'Plantain',
    slug: 'plantain',
    description: 'Sweet golden fried ripe plantain slices (Dodo).',
    base_price: 50,
    image_url: '/images/plantain.jpg',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'item-jollof-shred',
    categoryId: 'cat-sides',
    name: 'Jollof Rice + Shredded Chicken',
    slug: 'jollof-rice-shredded-chicken',
    description: 'Smoky Freetown Jollof rice topped with tender seasoned shredded chicken.',
    base_price: 70,
    image_url: '/images/jollof-shredded.jpg',
    is_active: true,
    display_order: 4,
  },
  {
    id: 'item-fried-shred',
    categoryId: 'cat-sides',
    name: 'Fried Rice + Shredded Chicken',
    slug: 'fried-rice-shredded-chicken',
    description: 'Wok-tossed seasoned fried rice topped with shredded chicken.',
    base_price: 70,
    image_url: '/images/fried-shredded.jpg',
    is_active: true,
    display_order: 5,
  },
  {
    id: 'item-fried-rice',
    categoryId: 'cat-sides',
    name: 'Fried Rice',
    slug: 'fried-rice',
    description: 'Classic Chicken Town aromatic fried rice with sweet corn and vegetables.',
    base_price: 50,
    image_url: '/images/fried-rice.jpg',
    is_active: true,
    display_order: 6,
  },
  {
    id: 'item-jollof-rice',
    categoryId: 'cat-sides',
    name: 'Jollof Rice',
    slug: 'jollof-rice',
    description: 'Signature party-style West African Jollof rice packed with rich flavours.',
    base_price: 50,
    image_url: '/images/jollof-rice.jpg',
    is_active: true,
    display_order: 7,
  },
  {
    id: 'item-side-salad',
    categoryId: 'cat-sides',
    name: 'Side Salad',
    slug: 'side-salad',
    description: 'Crisp lettuce, cucumber, tomato, and light vinaigrette dressing.',
    base_price: 65,
    image_url: '/images/side-salad.jpg',
    is_active: true,
    display_order: 8,
  },
  {
    id: 'item-ct-salad',
    categoryId: 'cat-sides',
    name: 'Chicken Town Salad',
    slug: 'chicken-town-salad',
    description: 'Hearty fresh salad loaded with sliced grilled chicken and boiled egg.',
    base_price: 110,
    image_url: '/images/ct-salad.jpg',
    is_active: true,
    display_order: 9,
  },
  {
    id: 'item-extra-sauce',
    categoryId: 'cat-sides',
    name: 'Extra Sauce',
    slug: 'extra-sauce',
    description: 'Extra dipping sauce dip cup.',
    base_price: 5,
    image_url: '/images/extra-sauce.jpg',
    is_active: true,
    display_order: 10,
    modifier_groups: [
      {
        id: 'mg-sauce',
        name: 'Choose a Sauce',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-sauce-1', name: 'Pepper', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-sauce-2', name: 'Ketchup', price_delta: 0, is_active: true, display_order: 2 },
        ],
      },
    ],
  },

  // Swit U Mot
  {
    id: 'item-chillers',
    categoryId: 'cat-swit',
    name: 'Chillers Ice Cream',
    slug: 'chillers-ice-cream',
    description: 'Cool refreshing ice cream cup in your preferred flavour.',
    base_price: 35,
    image_url: '/images/chillers.jpg',
    is_active: true,
    display_order: 1,
    modifier_groups: [
      {
        id: 'mg-chil-flav',
        name: 'Choose a Flavour',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-cf-1', name: 'Strawberry', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-cf-2', name: 'Vanilla', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-cf-3', name: 'Chocolate', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
    ],
  },
  {
    id: 'item-hb',
    categoryId: 'cat-swit',
    name: 'HB Ice Cream',
    slug: 'hb-ice-cream',
    description: 'Premium rich and creamy dessert treat.',
    base_price: 45,
    image_url: '/images/hb-ice-cream.jpg',
    is_active: true,
    display_order: 2,
    modifier_groups: [
      {
        id: 'mg-hb-flav',
        name: 'Choose a Flavour',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-hbf-1', name: 'Strawberry', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-hbf-2', name: 'Vanilla', price_delta: 0, is_active: true, display_order: 2 },
          { id: 'mo-hbf-3', name: 'Chocolate', price_delta: 0, is_active: true, display_order: 3 },
        ],
      },
    ],
  },
  {
    id: 'item-tea-coffee',
    categoryId: 'cat-swit',
    name: 'Tea / Coffee',
    slug: 'tea-coffee',
    description: 'Hot brewed Lipton tea or Nescafé coffee with milk and sugar.',
    base_price: 25,
    image_url: '/images/tea-coffee.jpg',
    is_active: true,
    display_order: 3,
    modifier_groups: [
      {
        id: 'mg-tc',
        name: 'Tea or Coffee?',
        required: true,
        min_selections: 1,
        max_selections: 1,
        display_order: 1,
        options: [
          { id: 'mo-tc-1', name: 'Tea', price_delta: 0, is_active: true, display_order: 1 },
          { id: 'mo-tc-2', name: 'Coffee', price_delta: 0, is_active: true, display_order: 2 },
        ],
      },
    ],
  },

  // Soft Drinks & Water
  {
    id: 'item-vimto',
    categoryId: 'cat-soft-drinks',
    name: 'Vimto',
    slug: 'vimto',
    base_price: null,
    image_url: '/images/vimto.jpg',
    is_active: true,
    display_order: 1,
    variants: [
      { id: 'v-vim-can', name: 'Can', price: 35, is_active: true, display_order: 1 },
      { id: 'v-vim-pla', name: 'Plastic', price: 15, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-coke-s',
    categoryId: 'cat-soft-drinks',
    name: 'Coke Short',
    slug: 'coke-short',
    base_price: null,
    image_url: '/images/coke.jpg',
    is_active: true,
    display_order: 2,
    variants: [
      { id: 'v-cokes-can', name: 'Can', price: 30, is_active: true, display_order: 1 },
      { id: 'v-cokes-pla', name: 'Plastic', price: 15, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-coke-l',
    categoryId: 'cat-soft-drinks',
    name: 'Coke Long',
    slug: 'coke-long',
    base_price: null,
    image_url: '/images/coke-long.jpg',
    is_active: true,
    display_order: 3,
    variants: [
      { id: 'v-cokel-can', name: 'Can', price: 30, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-fanta-s',
    categoryId: 'cat-soft-drinks',
    name: 'Fanta Short',
    slug: 'fanta-short',
    base_price: null,
    image_url: '/images/fanta.jpg',
    is_active: true,
    display_order: 4,
    variants: [
      { id: 'v-fantas-can', name: 'Can', price: 30, is_active: true, display_order: 1 },
      { id: 'v-fantas-pla', name: 'Plastic', price: 15, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-fanta-l',
    categoryId: 'cat-soft-drinks',
    name: 'Fanta Long',
    slug: 'fanta-long',
    base_price: null,
    image_url: '/images/fanta-long.jpg',
    is_active: true,
    display_order: 5,
    variants: [
      { id: 'v-fantal-can', name: 'Can', price: 30, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-sprite-s',
    categoryId: 'cat-soft-drinks',
    name: 'Sprite Short',
    slug: 'sprite-short',
    base_price: null,
    image_url: '/images/sprite.jpg',
    is_active: true,
    display_order: 6,
    variants: [
      { id: 'v-sprites-can', name: 'Can', price: 30, is_active: true, display_order: 1 },
      { id: 'v-sprites-pla', name: 'Plastic', price: 15, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-sprite-l',
    categoryId: 'cat-soft-drinks',
    name: 'Sprite Long',
    slug: 'sprite-long',
    base_price: null,
    image_url: '/images/sprite-long.jpg',
    is_active: true,
    display_order: 7,
    variants: [
      { id: 'v-spritel-can', name: 'Can', price: 30, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-maltina',
    categoryId: 'cat-soft-drinks',
    name: 'Maltina',
    slug: 'maltina',
    base_price: null,
    image_url: '/images/maltina.jpg',
    is_active: true,
    display_order: 8,
    variants: [
      { id: 'v-malt-can', name: 'Can', price: 30, is_active: true, display_order: 1 },
      { id: 'v-malt-pla', name: 'Plastic', price: 30, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-xtra',
    categoryId: 'cat-soft-drinks',
    name: 'Xtra Juice',
    slug: 'xtra-juice',
    base_price: null,
    image_url: '/images/xtra-juice.jpg',
    is_active: true,
    display_order: 9,
    variants: [
      { id: 'v-xtra-pla', name: 'Plastic', price: 35, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-sierra',
    categoryId: 'cat-soft-drinks',
    name: 'Sierra Juice',
    slug: 'sierra-juice',
    base_price: null,
    image_url: '/images/sierra-juice.jpg',
    is_active: true,
    display_order: 10,
    variants: [
      { id: 'v-sierra-pla', name: 'Plastic', price: 15, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-flav-milk',
    categoryId: 'cat-soft-drinks',
    name: 'Flavoured Milk',
    slug: 'flavoured-milk',
    base_price: null,
    image_url: '/images/flavoured-milk.jpg',
    is_active: true,
    display_order: 11,
    variants: [
      { id: 'v-milk-pla', name: 'Plastic', price: 65, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-lucozade',
    categoryId: 'cat-soft-drinks',
    name: 'Lucozade',
    slug: 'lucozade',
    base_price: null,
    image_url: '/images/lucozade.jpg',
    is_active: true,
    display_order: 12,
    variants: [
      { id: 'v-luco-can', name: 'Can', price: 45, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-3x',
    categoryId: 'cat-soft-drinks',
    name: '3X',
    slug: '3x-energy',
    base_price: null,
    image_url: '/images/3x.jpg',
    is_active: true,
    display_order: 13,
    variants: [
      { id: 'v-3x-can', name: 'Can', price: 40, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-water',
    categoryId: 'cat-soft-drinks',
    name: 'Water',
    slug: 'pure-water',
    base_price: null,
    image_url: '/images/water.jpg',
    is_active: true,
    display_order: 14,
    variants: [
      { id: 'v-wat-big', name: 'Big Bottle', price: 20, is_active: true, display_order: 1 },
      { id: 'v-wat-sml', name: 'Small Bottle', price: 10, is_active: true, display_order: 2 },
    ],
  },

  // Alcoholic Drinks
  {
    id: 'item-mutzig',
    categoryId: 'cat-alcoholic',
    name: 'Mutzig',
    slug: 'mutzig',
    base_price: null,
    image_url: '/images/mutzig.jpg',
    is_active: true,
    display_order: 1,
    variants: [
      { id: 'v-mut-can', name: 'Can', price: 40, is_active: true, display_order: 1 },
      { id: 'v-mut-bot', name: 'Bottle', price: 40, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-heineken',
    categoryId: 'cat-alcoholic',
    name: 'Heineken',
    slug: 'heineken',
    base_price: null,
    image_url: '/images/heineken.jpg',
    is_active: true,
    display_order: 2,
    variants: [
      { id: 'v-hei-can', name: 'Can', price: 65, is_active: true, display_order: 1 },
      { id: 'v-hei-bot', name: 'Bottle', price: 65, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-guinness',
    categoryId: 'cat-alcoholic',
    name: 'Guinness',
    slug: 'guinness',
    base_price: null,
    image_url: '/images/guinness.jpg',
    is_active: true,
    display_order: 3,
    variants: [
      { id: 'v-gui-can', name: 'Can', price: 45, is_active: true, display_order: 1 },
      { id: 'v-gui-bot', name: 'Bottle', price: 45, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-vody',
    categoryId: 'cat-alcoholic',
    name: 'Vody',
    slug: 'vody',
    base_price: null,
    image_url: '/images/vody.jpg',
    is_active: true,
    display_order: 4,
    variants: [
      { id: 'v-vod-can', name: 'Can', price: 45, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-star',
    categoryId: 'cat-alcoholic',
    name: 'Star',
    slug: 'star-beer',
    base_price: null,
    image_url: '/images/star.jpg',
    is_active: true,
    display_order: 5,
    variants: [
      { id: 'v-sta-can', name: 'Can', price: 35, is_active: true, display_order: 1 },
      { id: 'v-sta-bot', name: 'Bottle', price: 30, is_active: true, display_order: 2 },
    ],
  },
  {
    id: 'item-amstel',
    categoryId: 'cat-alcoholic',
    name: 'Amstel',
    slug: 'amstel',
    base_price: null,
    image_url: '/images/amstel.jpg',
    is_active: true,
    display_order: 6,
    variants: [
      { id: 'v-ams-can', name: 'Can', price: 40, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-codys',
    categoryId: 'cat-alcoholic',
    name: "Cody's Stout",
    slug: 'codys-stout',
    base_price: null,
    image_url: '/images/codys-stout.jpg',
    is_active: true,
    display_order: 7,
    variants: [
      { id: 'v-codys-can', name: 'Can', price: 65, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-codyb',
    categoryId: 'cat-alcoholic',
    name: "Cody's Beer",
    slug: 'codys-beer',
    base_price: null,
    image_url: '/images/codys-beer.jpg',
    is_active: true,
    display_order: 8,
    variants: [
      { id: 'v-codyb-can', name: 'Can', price: 65, is_active: true, display_order: 1 },
    ],
  },
  {
    id: 'item-cider',
    categoryId: 'cat-alcoholic',
    name: 'Cider',
    slug: 'cider',
    base_price: null,
    image_url: '/images/cider.jpg',
    is_active: true,
    display_order: 9,
    variants: [
      { id: 'v-cid-bot', name: 'Bottle', price: 75, is_active: true, display_order: 1 },
    ],
  },
]

// Mock branch availability overrides: key is `${branchId}:${menuItemId}` or branch specific unavailable items
const BRANCH_UNAVAILABLE_OVERRIDES: Record<string, boolean> = {
  // Can be configured per branch for testing "Out of stock at this branch"
}

export function isItemAvailableAtBranch(menuItemId: string, branchId: string): boolean {
  const item = MENU_ITEMS.find((i) => i.id === menuItemId || i.slug === menuItemId)
  if (!item || !item.is_active) return false
  const key = `${branchId}:${item.id}`
  if (BRANCH_UNAVAILABLE_OVERRIDES[key] === false) {
    return false
  }
  return true
}

export function getCategories(): Category[] {
  return CATEGORIES
}

export function getMenuItems(): MenuItem[] {
  return MENU_ITEMS
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.id === id)
}

export function getMenuItemBySlug(slug: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.slug === slug)
}

export function getItemsByCategory(categoryId: string): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.categoryId === categoryId)
}

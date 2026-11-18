// Chicken Town SL - Official Menu Data & Store Configuration
// Exact items, combos, and pricing from the official Chicken Town menu flyer

export const RESTAURANT_INFO = {
    name: "Chicken Town SL",
    tagline: "SWIT U MOT SWIT U LYF",
    shortCode: "392",
    phone: "392 / +232 80 600 700",
    cateringPhone: "+232 80 600 700",
    email: "orders@chickentownsl.com",
    address: "24 Wilkinson Road, Freetown, Sierra Leone",
    openingHours: "Mon - Sun: 11:00 AM - 11:00 PM",
    deliveryFee: 15, // in New Leones (NLe)
    minOrder: 45,
    estimatedDeliveryTime: "30-45 mins",
    estimatedPickupTime: "15-20 mins"
};

export const CURRENCIES = {
    NLe: { code: 'NLe', symbol: 'Le ', rate: 1, label: 'New Leones (Le)' },
    USD: { code: 'USD', symbol: '$', rate: 0.045, label: 'US Dollar ($)' }
};

export const MEAL_SIDE_CHOICES = [
    'Crispy Chips',
    'Plain Jollof Rice',
    'Fried Rice'
];

export const MEAL_DRINK_CHOICES = [
    'Coca Cola (Plastic 300ml)',
    'Fanta Orange (Plastic 300ml)',
    'Sprite (Plastic 300ml)',
    'Vimto (Plastic 300ml)'
];

export const ICE_CREAM_FLAVORS = [
    'Vanilla',
    'Strawberry',
    'Chocolate'
];

export const EXTRA_SAUCE_ADDONS = [
    { id: 'sauce-pepper', name: 'Extra Pepper Sauce', price: 5 },
    { id: 'sauce-ketchup', name: 'Extra Tomato Ketchup', price: 5 },
    { id: 'sauce-ct', name: 'Extra Signature CT Sauce', price: 5 }
];

export const CATEGORIES = [
    { id: 'all', name: 'Full Menu', icon: 'sparkles' },
    { id: 'deals', name: 'Top Sellers & Meal Deals', icon: 'package' },
    { id: 'burgers_wraps', name: 'Burgers & Wraps', icon: 'sandwich' },
    { id: 'chicken', name: 'Fried & BBQ Chicken', icon: 'drumstick' },
    { id: 'fowls', name: 'Fowls (Pepper Chicken)', icon: 'flame' },
    { id: 'celebration', name: 'Celebration Deals', icon: 'users' },
    { id: 'sides', name: 'Sides & Rice', icon: 'utensils' },
    { id: 'desserts', name: 'Swit U Mot (Ice Cream)', icon: 'ice-cream' },
    { id: 'drinks', name: 'Drinks', icon: 'cup-soda' },
    { id: 'sauces', name: 'Extra Sauces', icon: 'droplet' }
];

export const MENU_ITEMS = [
    // ==========================================
    // TOP SELLERS & MEAL DEALS
    // ==========================================
    {
        id: 'deal-family',
        name: 'Family Deal',
        category: 'deals',
        price: 499,
        badge: 'Top Seller',
        popular: true,
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80',
        description: '4 Fried Wings + 2 CT Burgers + 2 CT Wraps + 2 Sides (Chips/Jollof/Fried Rice) + 2 Soft Drinks (300ml).',
        isComboMeal: true,
        comboConfig: { sidesCount: 2, drinksCount: 2 }
    },
    {
        id: 'deal-classic-box',
        name: 'Classic Box',
        category: 'deals',
        price: 150,
        badge: 'Popular',
        popular: true,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
        description: '2 Crispy Fried Drumsticks + 1 Side (Chips, Plain Jollof or Fried Rice) + 1 Soft Drink (300ml).',
        isComboMeal: true,
        comboConfig: { sidesCount: 1, drinksCount: 1 }
    },
    {
        id: 'deal-bbq-wings-meal',
        name: 'BBQ Wings Meal',
        category: 'deals',
        price: 155,
        badge: 'BBQ Special',
        popular: true,
        image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80',
        description: '4 Glazed BBQ Wings + 1 Side (Chips, Plain Jollof or Fried Rice) + 1 Soft Drink (300ml).',
        isComboMeal: true,
        comboConfig: { sidesCount: 1, drinksCount: 1 }
    },
    {
        id: 'deal-fried-wings-meal',
        name: 'Fried Wings Meal',
        category: 'deals',
        price: 155,
        badge: 'Crispy',
        popular: true,
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
        description: '4 Golden Fried Wings + 1 Side (Chips, Plain Jollof or Fried Rice) + 1 Soft Drink (300ml).',
        isComboMeal: true,
        comboConfig: { sidesCount: 1, drinksCount: 1 }
    },
    {
        id: 'deal-snack-box',
        name: 'Snack Box',
        category: 'deals',
        price: 99,
        badge: 'Best Value',
        popular: true,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
        description: '1 Golden Fried Drumstick + 1 Side (Chips, Plain Jollof or Fried Rice) + 1 Soft Drink (300ml).',
        isComboMeal: true,
        comboConfig: { sidesCount: 1, drinksCount: 1 }
    },

    // ==========================================
    // BURGERS & WRAPS
    // ==========================================
    {
        id: 'burg-ct-burger',
        name: 'CT Burger',
        category: 'burgers_wraps',
        price: 90,
        badge: 'Signature',
        popular: true,
        image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
        description: 'Crispy chicken patty + signature CT sauce + fresh tomatoes + lettuce + cucumber on a toasted bun.'
    },
    {
        id: 'burg-frontline',
        name: 'Frontline Burger',
        category: 'burgers_wraps',
        price: 110,
        badge: 'Loaded',
        popular: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        description: 'Crispy chicken patty + fried egg + signature CT sauce + tomatoes + lettuce + cucumber.'
    },
    {
        id: 'burg-ct-combo',
        name: 'CT Burger Combo',
        category: 'burgers_wraps',
        price: 150,
        badge: 'Combo Deal',
        popular: true,
        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80',
        description: '1 CT Burger + Crispy Chips or 1 Rice (Jollof/Fried) + 1 Soft Drink (300ml).',
        isComboMeal: true,
        comboConfig: { sidesCount: 1, drinksCount: 1 }
    },
    {
        id: 'wrap-ct-wrap',
        name: 'CT Wrap',
        category: 'burgers_wraps',
        price: 90,
        badge: 'Popular',
        popular: true,
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
        description: 'Crispy diced chicken + signature CT sauce wrapped in a warm toasted tortilla.'
    },
    {
        id: 'wrap-ct-combo',
        name: 'CT Wrap Combo',
        category: 'burgers_wraps',
        price: 145,
        badge: 'Combo Deal',
        popular: true,
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
        description: '1 CT Wrap + Crispy Chips or 1 Rice (Jollof/Fried) + 1 Soft Drink (300ml).',
        isComboMeal: true,
        comboConfig: { sidesCount: 1, drinksCount: 1 }
    },

    // ==========================================
    // FRIED & BBQ CHICKEN
    // ==========================================
    {
        id: 'chick-1-drumstick',
        name: '1 Fried Drumstick',
        category: 'chicken',
        price: 45,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
        description: '1 crispy golden fried drumstick seasoned to perfection.'
    },
    {
        id: 'chick-3-drumsticks',
        name: '3 Fried Drumsticks',
        category: 'chicken',
        price: 130,
        badge: 'Best Value',
        popular: true,
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
        description: '3 crispy golden fried drumsticks with juicy, tender meat inside.'
    },
    {
        id: 'chick-1-wing',
        name: '1 Fried Wing',
        category: 'chicken',
        price: 25,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
        description: '1 whole crispy seasoned fried chicken wing.'
    },
    {
        id: 'chick-4-wings',
        name: '4 Fried Wings',
        category: 'chicken',
        price: 90,
        badge: 'Popular',
        popular: true,
        image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80',
        description: '4 whole crispy seasoned fried chicken wings.'
    },
    {
        id: 'bbq-1-wing',
        name: '1 BBQ Wing',
        category: 'chicken',
        price: 25,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        description: '1 glazed succulent barbecue chicken wing.'
    },
    {
        id: 'bbq-4-wings',
        name: '4 BBQ Wings',
        category: 'chicken',
        price: 100,
        badge: 'BBQ',
        popular: true,
        image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80',
        description: '4 glazed succulent barbecue chicken wings tossed in rich BBQ sauce.'
    },
    {
        id: 'bbq-1-drumstick',
        name: '1 BBQ Drumstick',
        category: 'chicken',
        price: 50,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
        description: '1 juicy chicken drumstick generously glazed in sweet & smoky BBQ sauce.'
    },
    {
        id: 'chick-3-strips',
        name: '3 Boneless Strips',
        category: 'chicken',
        price: 75,
        badge: 'Tenders',
        popular: false,
        image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80',
        description: '3 tender boneless chicken strips fried to a crisp golden crunch.'
    },
    {
        id: 'chick-6-strips',
        name: '6 Boneless Strips',
        category: 'chicken',
        price: 140,
        badge: 'Popular',
        popular: true,
        image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80',
        description: '6 tender boneless chicken strips fried to a crisp golden crunch.'
    },
    {
        id: 'chick-6-nuggets',
        name: '6 Chicken Nuggets',
        category: 'chicken',
        price: 45,
        badge: 'Kids Favorite',
        popular: false,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
        description: '6 golden bite-sized chicken nuggets, crispy on the outside, tender inside.'
    },

    // ==========================================
    // FOWLS (PEPPER CHICKEN)
    // ==========================================
    {
        id: 'fowl-english-whole',
        name: 'English Fowl - Whole Chicken',
        category: 'fowls',
        price: 300,
        badge: 'Pepper Chicken',
        popular: true,
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
        description: 'Whole English fowl roasted with rich Sierra Leone aromatic pepper seasoning.'
    },
    {
        id: 'fowl-english-half',
        name: 'English Fowl - Half Chicken',
        category: 'fowls',
        price: 160,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
        description: 'Half English fowl roasted with rich West African pepper sauce.'
    },
    {
        id: 'fowl-kontri-whole',
        name: 'Kontri Fowl - Whole Chicken',
        category: 'fowls',
        price: 320,
        badge: 'Authentic Local',
        popular: true,
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
        description: 'Whole authentic Sierra Leone Kontri fowl pepper chicken. Deep traditional flavor.'
    },
    {
        id: 'fowl-kontri-half',
        name: 'Kontri Fowl - Half Chicken',
        category: 'fowls',
        price: 160,
        badge: 'Authentic Local',
        popular: false,
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
        description: 'Half authentic Sierra Leone Kontri fowl pepper chicken.'
    },

    // ==========================================
    // SPECIAL CELEBRATION DEALS
    // ==========================================
    {
        id: 'celeb-deal-5',
        name: 'Meal Deal for 5',
        category: 'celebration',
        price: 925,
        badge: 'Feast for 5',
        popular: true,
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80',
        description: '5 Fried Drumsticks, 12 Fried Wings, 2 Crispy Chips, 2 Jollof Rice, 2 Fried Rice, 5 Soft Drinks, 5 Small Waters, 1 CT Salad.'
    },
    {
        id: 'celeb-deal-10',
        name: 'Meal Deal for 10',
        category: 'celebration',
        price: 2299,
        badge: 'Feast for 10',
        popular: true,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
        description: '12 Fried Wings, 5 Jollof Rice, 5 Fried Rice, 10 Soft Drinks, 10 Small Waters, 2 CT Salads, 5 CT Burgers, 5 Wraps, Half Kontri Fowl, 2 set Plantains.'
    },
    {
        id: 'celeb-deal-15',
        name: 'Meal Deal for 15',
        category: 'celebration',
        price: 3499,
        badge: 'Mega Feast',
        popular: false,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        description: '30 Fried Wings, 5 Jollof Rice, 5 Fried Rice, 15 Soft Drinks, 15 Small Waters, 2 CT Salads, 5 CT Burgers, 5 CT Wraps, 10 Fried Drumsticks, 10 Ice Creams, 4 set Plantains.'
    },

    // ==========================================
    // SIDES & RICE
    // ==========================================
    {
        id: 'side-chips',
        name: 'Crispy Chips',
        category: 'sides',
        price: 45,
        badge: 'Popular',
        popular: true,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
        description: 'Golden skin-on crispy potato chips.'
    },
    {
        id: 'side-chips-masala',
        name: 'Chips Masala (Chips + Pepper)',
        category: 'sides',
        price: 55,
        badge: 'Spicy',
        popular: true,
        image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80',
        description: 'Crispy chips tossed in spicy pepper masala sauce.'
    },
    {
        id: 'side-plantain',
        name: 'Fried Sweet Plantain',
        category: 'sides',
        price: 50,
        badge: 'Local Special',
        popular: true,
        image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
        description: 'Caramelized ripe sweet plantain slices fried golden brown.'
    },
    {
        id: 'side-jollof',
        name: 'Jollof Rice (Plain)',
        category: 'sides',
        price: 50,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80',
        description: 'Authentic smoky Sierra Leone jollof rice cooked with tomato and sweet peppers.'
    },
    {
        id: 'side-fried-rice',
        name: 'Fried Rice (Plain)',
        category: 'sides',
        price: 50,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
        description: 'Flavorful seasoned vegetable fried rice.'
    },
    {
        id: 'side-jollof-chicken',
        name: 'Jollof Rice + Shredded Chicken',
        category: 'sides',
        price: 70,
        badge: 'Meal Bowl',
        popular: true,
        image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80',
        description: 'Smoky jollof rice topped with tender shredded chicken.'
    },
    {
        id: 'side-fried-chicken',
        name: 'Fried Rice + Shredded Chicken',
        category: 'sides',
        price: 70,
        badge: 'Meal Bowl',
        popular: true,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
        description: 'Seasoned fried rice topped with savory shredded chicken.'
    },
    {
        id: 'side-salad',
        name: 'Side Salad',
        category: 'sides',
        price: 65,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        description: 'Fresh tomato, cucumber, lettuce, shredded carrot and house salad dressing.'
    },
    {
        id: 'side-ct-salad',
        name: 'Chicken Town Salad',
        category: 'sides',
        price: 110,
        badge: 'Chef Special',
        popular: true,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        description: 'Crispy diced chicken breast on a bed of fresh mixed greens, tomatoes, cucumber and CT dressing.'
    },
    {
        id: 'mami-meal',
        name: 'Mami Meal',
        category: 'sides',
        price: 30,
        badge: 'Budget Special',
        popular: false,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        description: 'Steamed white rice + savory Sierra Leone stew + 1 whole boiled egg.'
    },

    // ==========================================
    // SWIT U MOT (DESSERTS & WARM DRINKS)
    // ==========================================
    {
        id: 'ice-chillers',
        name: 'Chillers Ice Cream',
        category: 'desserts',
        price: 35,
        badge: 'Sweet Treat',
        popular: true,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
        description: 'Creamy chilled ice cream cup. Available in Strawberry, Vanilla, or Chocolate.',
        hasFlavorOptions: true
    },
    {
        id: 'ice-hb',
        name: 'HB Ice Cream',
        category: 'desserts',
        price: 45,
        badge: 'Premium',
        popular: true,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
        description: 'Rich and velvety HB ice cream. Choose Strawberry, Vanilla, or Chocolate.',
        hasFlavorOptions: true
    },
    {
        id: 'tea-coffee',
        name: 'Hot Tea / Coffee',
        category: 'desserts',
        price: 25,
        badge: null,
        popular: false,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        description: 'Freshly brewed hot tea or aromatic coffee.'
    },

    // ==========================================
    // DRINKS - SOFT DRINKS, JUICES & WATERS
    // ==========================================
    {
        id: 'drink-vimto-can',
        name: 'Vimto (Can)',
        category: 'drinks',
        price: 35,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Chilled canned Vimto sparkling fruit drink.'
    },
    {
        id: 'drink-vimto-plastic',
        name: 'Vimto (Plastic 300ml)',
        category: 'drinks',
        price: 15,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Chilled 300ml plastic Vimto bottle.'
    },
    {
        id: 'drink-coke-can',
        name: 'Coca Cola (Can)',
        category: 'drinks',
        price: 30,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Ice-cold Coca Cola can.'
    },
    {
        id: 'drink-coke-plastic',
        name: 'Coca Cola (Plastic 300ml)',
        category: 'drinks',
        price: 15,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Ice-cold Coca Cola 300ml plastic bottle.'
    },
    {
        id: 'drink-fanta-can',
        name: 'Fanta Orange (Can)',
        category: 'drinks',
        price: 30,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Chilled Fanta Orange can.'
    },
    {
        id: 'drink-fanta-plastic',
        name: 'Fanta Orange (Plastic 300ml)',
        category: 'drinks',
        price: 15,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Chilled Fanta Orange 300ml plastic bottle.'
    },
    {
        id: 'drink-sprite-can',
        name: 'Sprite (Can)',
        category: 'drinks',
        price: 30,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Crisp, chilled Sprite can.'
    },
    {
        id: 'drink-sprite-plastic',
        name: 'Sprite (Plastic 300ml)',
        category: 'drinks',
        price: 15,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Crisp, chilled Sprite 300ml plastic bottle.'
    },
    {
        id: 'drink-maltina',
        name: 'Maltina (Can)',
        category: 'drinks',
        price: 30,
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
        description: 'Rich nourishing malt drink.'
    },
    {
        id: 'drink-xtra-juice',
        name: 'Xtra Juice (Plastic)',
        category: 'drinks',
        price: 35,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
        description: 'Refreshing fruit juice bottle.'
    },
    {
        id: 'drink-sierra-juice',
        name: 'Sierra Juice (Plastic)',
        category: 'drinks',
        price: 15,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
        description: 'Local chilled Sierra Juice bottle.'
    },
    {
        id: 'drink-flavoured-milk',
        name: 'Flavoured Milk',
        category: 'drinks',
        price: 65,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        description: 'Sweet creamy flavoured milk bottle.'
    },
    {
        id: 'drink-lucozade',
        name: 'Lucozade Energy',
        category: 'drinks',
        price: 45,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Original energizing Lucozade can.'
    },
    {
        id: 'drink-3x',
        name: '3X Energy Drink',
        category: 'drinks',
        price: 40,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        description: 'Refreshing energy boost can.'
    },
    {
        id: 'drink-water-big',
        name: 'Mineral Water (Big Bottle 1.5L)',
        category: 'drinks',
        price: 20,
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
        description: 'Chilled 1.5L pure mineral water bottle.'
    },
    {
        id: 'drink-water-small',
        name: 'Mineral Water (Small Bottle 500ml)',
        category: 'drinks',
        price: 10,
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
        description: 'Chilled 500ml pure mineral water bottle.'
    },

    // ==========================================
    // ALCOHOLIC DRINKS
    // ==========================================
    {
        id: 'alc-mutzig',
        name: 'Mutzig Beer (Can / Bottle)',
        category: 'drinks',
        price: 40,
        badge: 'Beer',
        image: 'https://images.unsplash.com/photo-1608270199173-982845c85b12?auto=format&fit=crop&w=800&q=80',
        description: 'Crisp cold Mutzig premium lager beer.'
    },
    {
        id: 'alc-heineken',
        name: 'Heineken (Can / Bottle)',
        category: 'drinks',
        price: 65,
        badge: 'Beer',
        image: 'https://images.unsplash.com/photo-1618886614638-80e3c1569448?auto=format&fit=crop&w=800&q=80',
        description: 'World-famous chilled Heineken lager.'
    },
    {
        id: 'alc-guinness',
        name: 'Guinness Foreign Extra Stout',
        category: 'drinks',
        price: 45,
        badge: 'Stout',
        image: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=800&q=80',
        description: 'Rich, bold, smooth dark Guinness stout.'
    },
    {
        id: 'alc-star',
        name: 'Star Beer (Can / Bottle)',
        category: 'drinks',
        price: 35,
        badge: 'Local Beer',
        image: 'https://images.unsplash.com/photo-1608270199173-982845c85b12?auto=format&fit=crop&w=800&q=80',
        description: 'Iconic cold Star lager beer.'
    },
    {
        id: 'alc-vody',
        name: 'Vody Alcoholic Energy',
        category: 'drinks',
        price: 45,
        badge: 'Special',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        description: 'Vodka and energy blend in a can.'
    },
    {
        id: 'alc-amstel',
        name: 'Amstel Beer',
        category: 'drinks',
        price: 40,
        badge: 'Beer',
        image: 'https://images.unsplash.com/photo-1608270199173-982845c85b12?auto=format&fit=crop&w=800&q=80',
        description: 'Crisp refreshing Amstel beer.'
    },
    {
        id: 'alc-cody-stout',
        name: "Cody's Stout",
        category: 'drinks',
        price: 65,
        badge: 'Stout',
        image: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=800&q=80',
        description: "Bold and smooth Cody's stout."
    },
    {
        id: 'alc-cody-beer',
        name: "Cody's Beer",
        category: 'drinks',
        price: 65,
        badge: 'Beer',
        image: 'https://images.unsplash.com/photo-1608270199173-982845c85b12?auto=format&fit=crop&w=800&q=80',
        description: "Cold refreshing Cody's premium beer."
    },
    {
        id: 'alc-cider',
        name: 'Cider (Bottle)',
        category: 'drinks',
        price: 75,
        badge: 'Cider',
        image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
        description: 'Crisp, sparkling chilled apple cider bottle.'
    },

    // ==========================================
    // EXTRA SAUCES
    // ==========================================
    {
        id: 'sauce-extra-pepper',
        name: 'Extra Pepper Sauce',
        category: 'sauces',
        price: 5,
        badge: 'Spicy',
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
        description: 'Authentic fiery hot pepper sauce to add that extra kick.'
    },
    {
        id: 'sauce-extra-ketchup',
        name: 'Extra Tomato Ketchup',
        category: 'sauces',
        price: 5,
        image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
        description: 'Sweet rich tomato ketchup dip cup.'
    },
    {
        id: 'sauce-ct-special',
        name: 'Signature CT Sauce Cup',
        category: 'sauces',
        price: 5,
        badge: 'House Dip',
        image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
        description: 'Creamy spiced secret recipe CT burger and dipping sauce.'
    }
];

export const INITIAL_ORDERS = [
    {
        id: 'CT-9104',
        customer: {
            name: 'Kadiatu Bangura',
            phone: '+232 79 112 334',
            address: '42 Lumley Beach Road, Freetown',
            type: 'delivery',
            notes: 'Call 392 dispatch when close to the roundabout.'
        },
        items: [
            { id: 'deal-family', name: 'Family Deal', quantity: 1, price: 499, options: 'Sides: Crispy Chips + Jollof Rice | Drinks: Coke + Fanta' },
            { id: 'side-plantain', name: 'Fried Sweet Plantain', quantity: 1, price: 50 }
        ],
        subtotal: 549,
        deliveryFee: 15,
        discount: 0,
        total: 564,
        currency: 'NLe',
        paymentMethod: 'Orange Money',
        paymentStatus: 'paid',
        status: 'preparing',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
        id: 'CT-9103',
        customer: {
            name: 'Ibrahim Koroma',
            phone: '+232 88 543 210',
            address: 'Store Pickup',
            type: 'pickup',
            notes: 'Pack hot please'
        },
        items: [
            { id: 'burg-frontline', name: 'Frontline Burger', quantity: 1, price: 110 },
            { id: 'side-chips', name: 'Crispy Chips', quantity: 1, price: 45 },
            { id: 'drink-vimto-plastic', name: 'Vimto (Plastic 300ml)', quantity: 1, price: 15 }
        ],
        subtotal: 170,
        deliveryFee: 0,
        discount: 0,
        total: 170,
        currency: 'NLe',
        paymentMethod: 'Cash on Pickup',
        paymentStatus: 'pending',
        status: 'received',
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString()
    }
];

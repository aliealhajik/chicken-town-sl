// Chicken Town SL - Customer Storefront Application Logic (Smart Table Mode & Custom Menu Sync)

(function() {
    const RESTAURANT_INFO = {
        name: "Chicken Town SL",
        tagline: "SWIT U MOT SWIT U LYF",
        shortCode: "392",
        phone: "392 / +232 80 600 700",
        cateringPhone: "+232 80 600 700",
        email: "orders@chickentownsl.com",
        address: "24 Wilkinson Road, Freetown, Sierra Leone",
        openingHours: "Mon - Sun: 11:00 AM - 11:00 PM",
        deliveryFee: 15,
        minOrder: 45,
        estimatedDeliveryTime: "30-45 mins",
        estimatedPickupTime: "15-20 mins"
    };

    const CURRENCIES = {
        NLe: { code: 'NLe', symbol: 'Le ', rate: 1, label: 'New Leones (Le)' },
        USD: { code: 'USD', symbol: '$', rate: 0.045, label: 'US Dollar ($)' }
    };

    const MEAL_SIDE_CHOICES = [
        'Crispy Chips',
        'Plain Jollof Rice',
        'Fried Rice'
    ];

    const MEAL_DRINK_CHOICES = [
        'Coca Cola (Plastic 300ml)',
        'Fanta Orange (Plastic 300ml)',
        'Sprite (Plastic 300ml)',
        'Vimto (Plastic 300ml)'
    ];

    const ICE_CREAM_FLAVORS = [
        'Vanilla',
        'Strawberry',
        'Chocolate'
    ];

    const EXTRA_SAUCE_ADDONS = [
        { id: 'sauce-pepper', name: 'Extra Pepper Sauce', price: 5 },
        { id: 'sauce-ketchup', name: 'Extra Tomato Ketchup', price: 5 },
        { id: 'sauce-ct', name: 'Extra Signature CT Sauce', price: 5 }
    ];

    const CATEGORIES = [
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

    const DEFAULT_MENU_ITEMS = [
        { id: 'deal-family', name: 'Family Deal', category: 'deals', price: 499, badge: 'Top Seller', popular: true, image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80', description: '4 Fried Wings + 2 CT Burgers + 2 CT Wraps + 2 Sides + 2 Soft Drinks (300ml).', isComboMeal: true },
        { id: 'deal-classic-box', name: 'Classic Box', category: 'deals', price: 150, badge: 'Popular', popular: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', description: '2 Crispy Fried Drumsticks + 1 Side + 1 Soft Drink (300ml).', isComboMeal: true },
        { id: 'deal-bbq-wings-meal', name: 'BBQ Wings Meal', category: 'deals', price: 155, badge: 'BBQ Special', popular: true, image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80', description: '4 Glazed BBQ Wings + 1 Side + 1 Soft Drink (300ml).', isComboMeal: true },
        { id: 'deal-fried-wings-meal', name: 'Fried Wings Meal', category: 'deals', price: 155, badge: 'Crispy', popular: true, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80', description: '4 Golden Fried Wings + 1 Side + 1 Soft Drink (300ml).', isComboMeal: true },
        { id: 'deal-snack-box', name: 'Snack Box', category: 'deals', price: 99, badge: 'Best Value', popular: true, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', description: '1 Golden Fried Drumstick + 1 Side + 1 Soft Drink (300ml).', isComboMeal: true },

        { id: 'burg-ct-burger', name: 'CT Burger', category: 'burgers_wraps', price: 90, badge: 'Signature', popular: true, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80', description: 'Crispy chicken patty + signature CT sauce + fresh tomatoes + lettuce + cucumber.' },
        { id: 'burg-frontline', name: 'Frontline Burger', category: 'burgers_wraps', price: 110, badge: 'Loaded', popular: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', description: 'Crispy chicken patty + fried egg + CT sauce + salad.' },
        { id: 'burg-ct-combo', name: 'CT Burger Combo', category: 'burgers_wraps', price: 150, badge: 'Combo Deal', popular: true, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80', description: '1 CT Burger + Crispy Chips or Rice + 1 Soft Drink (300ml).', isComboMeal: true },
        { id: 'wrap-ct-wrap', name: 'CT Wrap', category: 'burgers_wraps', price: 90, badge: 'Popular', popular: true, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80', description: 'Crispy diced chicken + signature CT sauce in a warm wrap.' },
        { id: 'wrap-ct-combo', name: 'CT Wrap Combo', category: 'burgers_wraps', price: 145, badge: 'Combo Deal', popular: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', description: '1 CT Wrap + Crispy Chips or Rice + 1 Soft Drink (300ml).', isComboMeal: true },

        { id: 'chick-1-drumstick', name: '1 Fried Drumstick', category: 'chicken', price: 45, image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80', description: '1 crispy golden fried drumstick.' },
        { id: 'chick-3-drumsticks', name: '3 Fried Drumsticks', category: 'chicken', price: 130, badge: 'Best Value', popular: true, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80', description: '3 crispy golden fried drumsticks.' },
        { id: 'chick-1-wing', name: '1 Fried Wing', category: 'chicken', price: 25, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80', description: '1 whole crispy seasoned fried chicken wing.' },
        { id: 'chick-4-wings', name: '4 Fried Wings', category: 'chicken', price: 90, badge: 'Popular', popular: true, image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80', description: '4 whole crispy seasoned fried chicken wings.' },
        { id: 'bbq-1-wing', name: '1 BBQ Wing', category: 'chicken', price: 25, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', description: '1 glazed succulent barbecue chicken wing.' },
        { id: 'bbq-4-wings', name: '4 BBQ Wings', category: 'chicken', price: 100, badge: 'BBQ', popular: true, image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80', description: '4 glazed succulent barbecue chicken wings.' },
        { id: 'bbq-1-drumstick', name: '1 BBQ Drumstick', category: 'chicken', price: 50, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', description: '1 juicy chicken drumstick in sweet & smoky BBQ.' },
        { id: 'chick-3-strips', name: '3 Boneless Strips', category: 'chicken', price: 75, image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80', description: '3 tender boneless strips.' },
        { id: 'chick-6-strips', name: '6 Boneless Strips', category: 'chicken', price: 140, badge: 'Popular', popular: true, image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80', description: '6 tender boneless strips.' },
        { id: 'chick-6-nuggets', name: '6 Chicken Nuggets', category: 'chicken', price: 45, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', description: '6 bite-sized golden chicken nuggets.' },

        { id: 'fowl-english-whole', name: 'English Fowl - Whole Chicken', category: 'fowls', price: 300, badge: 'Pepper Chicken', popular: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80', description: 'Whole roasted English fowl pepper chicken.' },
        { id: 'fowl-english-half', name: 'English Fowl - Half Chicken', category: 'fowls', price: 160, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80', description: 'Half roasted English fowl pepper chicken.' },
        { id: 'fowl-kontri-whole', name: 'Kontri Fowl - Whole Chicken', category: 'fowls', price: 320, badge: 'Authentic Local', popular: true, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80', description: 'Whole traditional Sierra Leone Kontri fowl pepper chicken.' },
        { id: 'fowl-kontri-half', name: 'Kontri Fowl - Half Chicken', category: 'fowls', price: 160, badge: 'Authentic Local', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80', description: 'Half traditional Sierra Leone Kontri fowl pepper chicken.' },

        { id: 'celeb-deal-5', name: 'Meal Deal for 5', category: 'celebration', price: 925, badge: 'Feast for 5', popular: true, image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80', description: '5 Drumsticks, 12 Wings, 2 Chips, 2 Jollof, 2 Fried Rice, 5 Soft Drinks, 5 Small Waters, 1 CT Salad.' },
        { id: 'celeb-deal-10', name: 'Meal Deal for 10', category: 'celebration', price: 2299, badge: 'Feast for 10', popular: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', description: '12 Wings, 5 Jollof, 5 Fried Rice, 10 Soft Drinks, 10 Waters, 2 CT Salads, 5 Burgers, 5 Wraps, Half Kontri Fowl, 2 Plantains.' },
        { id: 'celeb-deal-15', name: 'Meal Deal for 15', category: 'celebration', price: 3499, badge: 'Mega Feast', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: '30 Wings, 5 Jollof, 5 Fried Rice, 15 Soft Drinks, 15 Waters, 2 CT Salads, 5 Burgers, 5 Wraps, 10 Drumsticks, 10 Ice Creams, 4 Plantains.' },

        { id: 'side-chips', name: 'Crispy Chips', category: 'sides', price: 45, badge: 'Popular', popular: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', description: 'Golden skin-on crispy potato chips.' },
        { id: 'side-chips-masala', name: 'Chips Masala', category: 'sides', price: 55, badge: 'Spicy', popular: true, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80', description: 'Crispy chips tossed in spicy pepper masala.' },
        { id: 'side-plantain', name: 'Fried Sweet Plantain', category: 'sides', price: 50, badge: 'Local Special', popular: true, image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80', description: 'Caramelized sweet plantains fried golden.' },
        { id: 'side-jollof', name: 'Jollof Rice (Plain)', category: 'sides', price: 50, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80', description: 'Authentic smoky Sierra Leone jollof rice.' },
        { id: 'side-fried-rice', name: 'Fried Rice (Plain)', category: 'sides', price: 50, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', description: 'Savory seasoned vegetable fried rice.' },
        { id: 'side-jollof-chicken', name: 'Jollof Rice + Shredded Chicken', category: 'sides', price: 70, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80', description: 'Smoky jollof topped with shredded chicken.' },
        { id: 'side-fried-chicken', name: 'Fried Rice + Shredded Chicken', category: 'sides', price: 70, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', description: 'Fried rice topped with shredded chicken.' },
        { id: 'side-salad', name: 'Side Salad', category: 'sides', price: 65, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', description: 'Fresh mixed salad with house dressing.' },
        { id: 'side-ct-salad', name: 'Chicken Town Salad', category: 'sides', price: 110, badge: 'Chef Special', popular: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', description: 'Crispy chicken breast on fresh salad.' },
        { id: 'mami-meal', name: 'Mami Meal', category: 'sides', price: 30, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', description: 'Rice + stew + boiled egg.' },

        { id: 'ice-chillers', name: 'Chillers Ice Cream', category: 'desserts', price: 35, badge: 'Sweet Treat', popular: true, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', description: 'Chilled ice cream cup. Choose flavor.', hasFlavorOptions: true },
        { id: 'ice-hb', name: 'HB Ice Cream', category: 'desserts', price: 45, badge: 'Premium', popular: true, image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80', description: 'Velvety HB ice cream cup. Choose flavor.', hasFlavorOptions: true },
        { id: 'tea-coffee', name: 'Hot Tea / Coffee', category: 'desserts', price: 25, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', description: 'Hot brewed tea or coffee.' },

        { id: 'drink-vimto-can', name: 'Vimto (Can)', category: 'drinks', price: 35, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Chilled canned Vimto sparkling fruit drink.' },
        { id: 'drink-vimto-plastic', name: 'Vimto (Plastic 300ml)', category: 'drinks', price: 15, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Chilled 300ml plastic Vimto bottle.' },
        { id: 'drink-coke-can', name: 'Coca Cola (Can)', category: 'drinks', price: 30, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Ice-cold Coca Cola can.' },
        { id: 'drink-coke-plastic', name: 'Coca Cola (Plastic 300ml)', category: 'drinks', price: 15, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Ice-cold Coca Cola 300ml plastic bottle.' },
        { id: 'drink-fanta-can', name: 'Fanta Orange (Can)', category: 'drinks', price: 30, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Chilled Fanta Orange can.' },
        { id: 'drink-fanta-plastic', name: 'Fanta Orange (Plastic 300ml)', category: 'drinks', price: 15, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Chilled Fanta Orange 300ml plastic bottle.' },
        { id: 'drink-sprite-can', name: 'Sprite (Can)', category: 'drinks', price: 30, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Crisp, chilled Sprite can.' },
        { id: 'drink-sprite-plastic', name: 'Sprite (Plastic 300ml)', category: 'drinks', price: 15, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Crisp, chilled Sprite 300ml plastic bottle.' },
        { id: 'drink-maltina', name: 'Maltina (Can)', category: 'drinks', price: 30, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', description: 'Rich nourishing malt drink.' },
        { id: 'drink-xtra-juice', name: 'Xtra Juice (Plastic)', category: 'drinks', price: 35, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80', description: 'Refreshing fruit juice bottle.' },
        { id: 'drink-sierra-juice', name: 'Sierra Juice (Plastic)', category: 'drinks', price: 15, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80', description: 'Local chilled Sierra Juice bottle.' },
        { id: 'drink-flavoured-milk', name: 'Flavoured Milk', category: 'drinks', price: 65, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80', description: 'Sweet creamy flavoured milk bottle.' },
        { id: 'drink-lucozade', name: 'Lucozade Energy', category: 'drinks', price: 45, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Original energizing Lucozade can.' },
        { id: 'drink-3x', name: '3X Energy Drink', category: 'drinks', price: 40, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', description: 'Refreshing energy boost can.' },
        { id: 'drink-water-big', name: 'Mineral Water (Big Bottle 1.5L)', category: 'drinks', price: 20, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80', description: 'Chilled 1.5L pure mineral water bottle.' },
        { id: 'drink-water-small', name: 'Mineral Water (Small Bottle 500ml)', category: 'drinks', price: 10, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80', description: 'Chilled 500ml pure mineral water bottle.' },

        // ALCOHOLIC DRINKS
        { id: 'alc-mutzig', name: 'Mutzig Beer (Can / Bottle)', category: 'drinks', price: 40, badge: 'Beer', image: 'https://images.unsplash.com/photo-1608270199173-982845c85b12?auto=format&fit=crop&w=800&q=80', description: 'Crisp cold Mutzig premium lager beer.' },
        { id: 'alc-heineken', name: 'Heineken (Can / Bottle)', category: 'drinks', price: 65, badge: 'Beer', image: 'https://images.unsplash.com/photo-1618886614638-80e3c1569448?auto=format&fit=crop&w=800&q=80', description: 'World-famous chilled Heineken lager.' },
        { id: 'alc-guinness', name: 'Guinness Foreign Extra Stout', category: 'drinks', price: 45, badge: 'Stout', image: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=800&q=80', description: 'Rich, bold, smooth dark Guinness stout.' },
        { id: 'alc-star', name: 'Star Beer (Can / Bottle)', category: 'drinks', price: 35, badge: 'Local Beer', image: 'https://images.unsplash.com/photo-1608270199173-982845c85b12?auto=format&fit=crop&w=800&q=80', description: 'Iconic cold Star lager beer.' },
        { id: 'alc-vody', name: 'Vody Alcoholic Energy', category: 'drinks', price: 45, badge: 'Special', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', description: 'Vodka and energy blend in a can.' },
        { id: 'alc-amstel', name: 'Amstel Beer', category: 'drinks', price: 40, badge: 'Beer', image: 'https://images.unsplash.com/photo-1608270199173-982845c85b12?auto=format&fit=crop&w=800&q=80', description: 'Crisp refreshing Amstel beer.' },
        { id: 'alc-cody-stout', name: "Cody's Stout", category: 'drinks', price: 65, badge: 'Stout', image: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=800&q=80', description: "Bold and smooth Cody's stout." },
        { id: 'alc-cody-beer', name: "Cody's Beer", category: 'drinks', price: 65, badge: 'Beer', image: 'https://images.unsplash.com/photo-1608270199173-982845c85b12?auto=format&fit=crop&w=800&q=80', description: "Cold refreshing Cody's premium beer." },
        { id: 'alc-cider', name: 'Cider (Bottle)', category: 'drinks', price: 75, badge: 'Cider', image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80', description: 'Crisp, sparkling chilled apple cider bottle.' },

        // EXTRA SAUCES
        { id: 'sauce-extra-pepper', name: 'Extra Pepper Sauce', category: 'sauces', price: 5, badge: 'Spicy', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80', description: 'Authentic fiery hot pepper sauce to add that extra kick.' },
        { id: 'sauce-extra-ketchup', name: 'Extra Tomato Ketchup', category: 'sauces', price: 5, image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80', description: 'Sweet rich tomato ketchup dip cup.' },
        { id: 'sauce-ct-special', name: 'Signature CT Sauce Cup', category: 'sauces', price: 5, badge: 'House Dip', image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80', description: 'Creamy spiced secret recipe CT burger and dipping sauce.' }
    ];

    // Sound Synthesizer
    class SoundFX {
        constructor() { this.ctx = null; this.enabled = true; }
        init() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        }
        playAddToCart() {
            if (!this.enabled) return;
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            } catch (e) {}
        }
        playOrderSuccess() {
            if (!this.enabled) return;
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const startTime = now + (i * 0.08);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, startTime);
                    gain.gain.setValueAtTime(0.18, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.35);
                });
            } catch (e) {}
        }
    }
    const sound = new SoundFX();

    // Check for Table QR URL Parameter: ?table=X
    const urlParams = new URLSearchParams(window.location.search);
    const scannedTable = urlParams.get('table');

    // Smart Initial Menu Loader: automatically syncs all missing defaults (drinks, beers, sauces) into localStorage
    function loadInitialMenu() {
        try {
            const stored = localStorage.getItem('ct_custom_menu');
            if (!stored) {
                localStorage.setItem('ct_custom_menu', JSON.stringify(DEFAULT_MENU_ITEMS));
                return DEFAULT_MENU_ITEMS;
            }
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                localStorage.setItem('ct_custom_menu', JSON.stringify(DEFAULT_MENU_ITEMS));
                return DEFAULT_MENU_ITEMS;
            }
            const existingIds = new Set(parsed.map(item => item.id));
            let merged = [...parsed];
            let hasNew = false;
            DEFAULT_MENU_ITEMS.forEach(defaultItem => {
                if (!existingIds.has(defaultItem.id)) {
                    merged.push(defaultItem);
                    hasNew = true;
                }
            });
            if (hasNew) {
                localStorage.setItem('ct_custom_menu', JSON.stringify(merged));
            }
            return merged;
        } catch (e) {
            return DEFAULT_MENU_ITEMS;
        }
    }

    // State Management
    const state = {
        currency: 'NLe',
        activeCategory: 'all',
        searchQuery: '',
        sortBy: 'popular',
        fulfillment: scannedTable ? 'dine-in' : (localStorage.getItem('ct_fulfillment') || 'delivery'),
        tableNumber: scannedTable || localStorage.getItem('ct_table') || '1',
        cart: JSON.parse(localStorage.getItem('ct_cart') || '[]'),
        appliedPromo: null,
        orders: JSON.parse(localStorage.getItem('ct_orders') || '[]'),
        soldOutItems: JSON.parse(localStorage.getItem('ct_sold_out') || '[]'),
        menuItems: loadInitialMenu(),
        
        customizingItem: null,
        selectedSide: MEAL_SIDE_CHOICES[0],
        selectedDrink: MEAL_DRINK_CHOICES[0],
        selectedFlavor: ICE_CREAM_FLAVORS[0],
        selectedSauces: [],
        customQuantity: 1,
        instructions: '',
        activeTrackingId: localStorage.getItem('ct_last_order_id') || 'CT-9104'
    };

    function formatPrice(amountInNLe) {
        const cur = CURRENCIES[state.currency] || CURRENCIES.NLe;
        if (cur.code === 'USD') {
            const usdVal = amountInNLe * cur.rate;
            return `$${usdVal.toFixed(2)}`;
        }
        return `Le ${Math.round(amountInNLe)}`;
    }

    window.switchCurrency = function(code) {
        if (CURRENCIES[code]) {
            state.currency = code;
            renderCurrencyDisplay();
            renderMenuItems();
            updateCartUI();
            if (state.customizingItem) updateModalPricing();
        }
        document.getElementById('currencyDropdown')?.classList.add('hidden');
    };

    function renderCurrencyDisplay() {
        const btnText = document.getElementById('activeCurrencyDisplay');
        if (btnText) {
            btnText.textContent = state.currency === 'NLe' ? 'New Leones (Le)' : 'USD ($)';
        }
    }

    // Table Mode setup
    function initTableMode() {
        const banner = document.getElementById('tableDineInBanner');
        const badge = document.getElementById('bannerTableBadge');
        const dineInLabel = document.getElementById('cartDineInLabel');

        if (scannedTable || state.fulfillment === 'dine-in') {
            state.fulfillment = 'dine-in';
            const tableFormatted = state.tableNumber.length === 1 ? `0${state.tableNumber}` : state.tableNumber;
            if (banner) banner.classList.remove('hidden');
            if (badge) badge.textContent = `TABLE ${tableFormatted}`;
            if (dineInLabel) dineInLabel.textContent = `Table ${state.tableNumber}`;
            setFulfillment('dine-in');
        } else {
            if (banner) banner.classList.add('hidden');
        }
    }

    window.clearTableMode = function() {
        state.fulfillment = 'delivery';
        localStorage.setItem('ct_fulfillment', 'delivery');
        document.getElementById('tableDineInBanner')?.classList.add('hidden');
        setFulfillment('delivery');
    };

    function renderCategories() {
        const container = document.getElementById('categoryPillContainer');
        if (!container) return;

        container.innerHTML = CATEGORIES.map(cat => {
            const isActive = state.activeCategory === cat.id;
            const activeClass = isActive 
                ? 'bg-brand-500 text-stone-950 shadow-md font-extrabold' 
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80 font-bold';

            return `
                <button onclick="window.filterCategory('${cat.id}')" 
                    class="category-pill flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs whitespace-nowrap transition-all ${activeClass}">
                    <i data-lucide="${cat.icon}" class="w-3.5 h-3.5"></i>
                    <span>${cat.name}</span>
                </button>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    window.filterCategory = function(catId) {
        state.activeCategory = catId;
        renderCategories();
        renderMenuItems();
        const catObj = CATEGORIES.find(c => c.id === catId);
        if (catObj) {
            document.getElementById('currentCategoryTitle').textContent = catObj.name;
        }
    };

    function renderMenuItems() {
        const grid = document.getElementById('menuGrid');
        if (!grid) return;

        let items = state.menuItems.filter(item => {
            const matchCategory = state.activeCategory === 'all' || item.category === state.activeCategory;
            const matchSearch = !state.searchQuery || 
                item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(state.searchQuery.toLowerCase()));
            return matchCategory && matchSearch;
        });

        if (state.sortBy === 'price-low') {
            items.sort((a, b) => a.price - b.price);
        } else if (state.sortBy === 'price-high') {
            items.sort((a, b) => b.price - a.price);
        } else if (state.sortBy === 'name') {
            items.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            items.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        }

        const countEl = document.getElementById('currentCategoryCount');
        if (countEl) countEl.textContent = `Showing ${items.length} delicious options`;

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center text-stone-400">
                    <i data-lucide="utensils" class="w-12 h-12 mx-auto mb-3 text-stone-300"></i>
                    <h4 class="text-base font-bold text-stone-700">No items found</h4>
                    <p class="text-xs text-stone-500 mt-1">Try searching for something else or clear the filters.</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        grid.innerHTML = items.map(item => {
            const isSoldOut = state.soldOutItems.includes(item.id);
            const badgeHtml = item.badge 
                ? `<span class="bg-brand-500 text-stone-950 font-black text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">${item.badge}</span>` 
                : '';

            const comboTag = item.isComboMeal
                ? `<span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <i data-lucide="check-circle" class="w-3 h-3 text-emerald-600"></i> Includes Side & Drink
                   </span>`
                : '';

            return `
                <div class="food-card bg-white rounded-3xl overflow-hidden border border-stone-200/90 flex flex-col justify-between relative group ${isSoldOut ? 'opacity-70' : ''}">
                    <div>
                        <div class="relative h-48 w-full overflow-hidden bg-stone-100">
                            <img src="${item.image}" alt="${item.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <div class="absolute top-3 left-3 flex flex-col gap-1 items-start">
                                ${badgeHtml}
                            </div>
                            ${isSoldOut ? `
                                <div class="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center">
                                    <span class="bg-flame-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Sold Out</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="p-5">
                            <div class="flex items-center justify-between mb-1.5">
                                <span class="text-[11px] font-bold uppercase tracking-wider text-stone-400">${item.category ? item.category.replace('_', ' ') : ''}</span>
                                ${comboTag}
                            </div>
                            <h3 class="font-extrabold text-base text-stone-900 group-hover:text-brand-600 transition-colors leading-snug mb-1.5 font-display">
                                ${item.name}
                            </h3>
                            <p class="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                                ${item.description || ''}
                            </p>
                        </div>
                    </div>
                    <div class="p-5 pt-0 flex items-center justify-between mt-2">
                        <div>
                            <span class="text-[10px] text-stone-400 block font-semibold">Price</span>
                            <span class="text-lg font-black text-stone-900 font-mono">${formatPrice(item.price)}</span>
                        </div>
                        <button 
                            ${isSoldOut ? 'disabled' : `onclick="window.openItemModal('${item.id}')"`}
                            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                isSoldOut 
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                                : 'bg-stone-900 hover:bg-brand-500 hover:text-stone-950 text-white shadow-sm active:scale-95'
                            }">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                            <span>${(item.isComboMeal || item.hasFlavorOptions) ? 'Options' : 'Add to Feast'}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    window.openItemModal = function(itemId) {
        const item = state.menuItems.find(m => m.id === itemId);
        if (!item) return;

        state.customizingItem = item;
        state.selectedSide = MEAL_SIDE_CHOICES[0];
        state.selectedDrink = MEAL_DRINK_CHOICES[0];
        state.selectedFlavor = ICE_CREAM_FLAVORS[0];
        state.selectedSauces = [];
        state.customQuantity = 1;
        state.instructions = '';

        document.getElementById('modalItemImage').src = item.image;
        document.getElementById('modalItemTitle').textContent = item.name;
        document.getElementById('modalItemDesc').textContent = item.description || '';
        document.getElementById('modalItemBasePrice').textContent = formatPrice(item.price);
        document.getElementById('modalQtyDisplay').textContent = '1';
        document.getElementById('modalInstructions').value = '';

        const badgeElem = document.getElementById('modalItemBadge');
        if (item.badge) {
            badgeElem.textContent = item.badge;
            badgeElem.classList.remove('hidden');
        } else {
            badgeElem.classList.add('hidden');
        }

        const spiceSection = document.getElementById('modalSpiceSection');
        const spiceGrid = document.getElementById('spiceOptionsGrid');

        if (item.isComboMeal) {
            spiceSection.classList.remove('hidden');
            spiceSection.querySelector('label').innerHTML = `Select Meal Side & Soft Drink <span class="text-flame-600">*</span>`;
            
            spiceGrid.innerHTML = `
                <div class="col-span-2 space-y-3">
                    <div>
                        <span class="text-[11px] font-bold text-stone-600 block mb-1">Choose Side:</span>
                        <div class="grid grid-cols-3 gap-2">
                            ${MEAL_SIDE_CHOICES.map((side, i) => `
                                <button type="button" onclick="window.selectComboSide('${side}')" 
                                    class="combo-side-btn p-2 rounded-xl border text-xs font-bold text-center transition ${i === 0 ? 'border-brand-500 bg-amber-50 text-stone-950 font-black' : 'border-stone-200 text-stone-600'}">
                                    ${side}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <span class="text-[11px] font-bold text-stone-600 block mb-1">Choose Soft Drink (300ml Plastic):</span>
                        <div class="grid grid-cols-2 gap-2">
                            ${MEAL_DRINK_CHOICES.map((drk, i) => `
                                <button type="button" onclick="window.selectComboDrink('${drk}')" 
                                    class="combo-drink-btn p-2 rounded-xl border text-xs font-bold text-center transition ${i === 0 ? 'border-brand-500 bg-amber-50 text-stone-950 font-black' : 'border-stone-200 text-stone-600'}">
                                    ${drk}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else if (item.hasFlavorOptions) {
            spiceSection.classList.remove('hidden');
            spiceSection.querySelector('label').innerHTML = `Choose Ice Cream Flavor <span class="text-flame-600">*</span>`;
            spiceGrid.innerHTML = `
                <div class="col-span-2 grid grid-cols-3 gap-2">
                    ${ICE_CREAM_FLAVORS.map((flav, i) => `
                        <button type="button" onclick="window.selectIceCreamFlavor('${flav}')" 
                            class="flavor-btn p-2.5 rounded-xl border text-xs font-bold text-center transition ${i === 0 ? 'border-brand-500 bg-amber-50 text-stone-950 font-black' : 'border-stone-200 text-stone-600'}">
                            🍨 ${flav}
                        </button>
                    `).join('')}
                </div>
            `;
        } else {
            spiceSection.classList.add('hidden');
        }

        const sauceGrid = document.getElementById('sauceOptionsGrid');
        sauceGrid.innerHTML = EXTRA_SAUCE_ADDONS.map(sauce => `
            <label class="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-brand-300 hover:bg-stone-50 cursor-pointer transition">
                <div class="flex items-center space-x-2.5">
                    <input type="checkbox" value="${sauce.id}" onchange="window.toggleSauce('${sauce.id}')" class="rounded text-brand-500 focus:ring-brand-500 w-4 h-4">
                    <span class="text-xs font-semibold text-stone-800">${sauce.name}</span>
                </div>
                <span class="text-xs font-mono font-bold text-stone-500">+${formatPrice(sauce.price)}</span>
            </label>
        `).join('');

        updateModalPricing();
        document.getElementById('itemModalBackdrop')?.classList.remove('hidden');
    };

    window.closeItemModal = function() {
        document.getElementById('itemModalBackdrop')?.classList.add('hidden');
        state.customizingItem = null;
    };

    window.selectComboSide = function(side) {
        state.selectedSide = side;
        document.querySelectorAll('.combo-side-btn').forEach(btn => {
            btn.className = 'combo-side-btn p-2 rounded-xl border text-xs font-bold text-center transition border-stone-200 text-stone-600';
            if (btn.textContent.trim() === side) {
                btn.className = 'combo-side-btn p-2 rounded-xl border text-xs font-black text-center transition border-brand-500 bg-amber-50 text-stone-950';
            }
        });
    };

    window.selectComboDrink = function(drk) {
        state.selectedDrink = drk;
        document.querySelectorAll('.combo-drink-btn').forEach(btn => {
            btn.className = 'combo-drink-btn p-2 rounded-xl border text-xs font-bold text-center transition border-stone-200 text-stone-600';
            if (btn.textContent.trim() === drk) {
                btn.className = 'combo-drink-btn p-2 rounded-xl border text-xs font-black text-center transition border-brand-500 bg-amber-50 text-stone-950';
            }
        });
    };

    window.selectIceCreamFlavor = function(flav) {
        state.selectedFlavor = flav;
        document.querySelectorAll('.flavor-btn').forEach(btn => {
            btn.className = 'flavor-btn p-2.5 rounded-xl border text-xs font-bold text-center transition border-stone-200 text-stone-600';
            if (btn.textContent.includes(flav)) {
                btn.className = 'flavor-btn p-2.5 rounded-xl border text-xs font-black text-center transition border-brand-500 bg-amber-50 text-stone-950';
            }
        });
    };

    window.toggleSauce = function(sauceId) {
        const idx = state.selectedSauces.indexOf(sauceId);
        if (idx > -1) {
            state.selectedSauces.splice(idx, 1);
        } else {
            state.selectedSauces.push(sauceId);
        }
        updateModalPricing();
    };

    window.incrementModalQty = function() {
        state.customQuantity += 1;
        document.getElementById('modalQtyDisplay').textContent = state.customQuantity;
        updateModalPricing();
    };

    window.decrementModalQty = function() {
        if (state.customQuantity > 1) {
            state.customQuantity -= 1;
            document.getElementById('modalQtyDisplay').textContent = state.customQuantity;
            updateModalPricing();
        }
    };

    function calculateModalItemTotal() {
        if (!state.customizingItem) return 0;
        let base = state.customizingItem.price;
        state.selectedSauces.forEach(sauceId => {
            const sauce = EXTRA_SAUCE_ADDONS.find(s => s.id === sauceId);
            if (sauce) base += sauce.price;
        });
        return base * state.customQuantity;
    }

    function updateModalPricing() {
        const total = calculateModalItemTotal();
        const btnPrice = document.getElementById('modalAddTotalCost');
        if (btnPrice) btnPrice.textContent = formatPrice(total);
    }

    window.confirmAddToCart = function() {
        if (!state.customizingItem) return;

        let optionsSummary = [];
        if (state.customizingItem.isComboMeal) {
            optionsSummary.push(`Side: ${state.selectedSide}`);
            optionsSummary.push(`Drink: ${state.selectedDrink}`);
        } else if (state.customizingItem.hasFlavorOptions) {
            optionsSummary.push(`Flavor: ${state.selectedFlavor}`);
        }

        const saucesDetailed = state.selectedSauces.map(id => {
            const s = EXTRA_SAUCE_ADDONS.find(opt => opt.id === id);
            return s ? s.name : id;
        });

        const cartItem = {
            cartItemId: `${state.customizingItem.id}-${Date.now()}`,
            itemId: state.customizingItem.id,
            name: state.customizingItem.name,
            image: state.customizingItem.image,
            unitPrice: state.customizingItem.price,
            options: optionsSummary.join(' | '),
            sauces: saucesDetailed,
            instructions: document.getElementById('modalInstructions')?.value.trim() || '',
            quantity: state.customQuantity,
            totalItemPrice: calculateModalItemTotal()
        };

        state.cart.push(cartItem);
        saveCart();
        updateCartUI();
        window.closeItemModal();

        sound.playAddToCart();

        const badge = document.getElementById('cartCountBadge');
        if (badge) {
            badge.classList.remove('bump-animate');
            void badge.offsetWidth;
            badge.classList.add('bump-animate');
        }

        openCart();
    };

    function saveCart() {
        localStorage.setItem('ct_cart', JSON.stringify(state.cart));
    }

    function updateCartUI() {
        const countBadge = document.getElementById('cartCountBadge');
        const headerTotal = document.getElementById('cartHeaderTotal');
        const itemList = document.getElementById('cartItemList');

        const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (countBadge) countBadge.textContent = totalQty;

        let subtotal = state.cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
        if (headerTotal) headerTotal.textContent = formatPrice(subtotal);

        if (!itemList) return;

        if (state.cart.length === 0) {
            itemList.innerHTML = `
                <div class="h-64 flex flex-col items-center justify-center text-center text-stone-400">
                    <div class="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3 text-2xl">
                        🍗
                    </div>
                    <h4 class="font-bold text-stone-700 text-sm">Your feast is empty</h4>
                    <p class="text-xs text-stone-500 max-w-[200px] mt-1">Explore our Chicken Town menu and add your favorite meals!</p>
                </div>
            `;
            const chkBtn = document.getElementById('checkoutBtn');
            if (chkBtn) {
                chkBtn.disabled = true;
                chkBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            const chkBtn = document.getElementById('checkoutBtn');
            if (chkBtn) {
                chkBtn.disabled = false;
                chkBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }

            itemList.innerHTML = state.cart.map(item => `
                <div class="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex gap-3 relative">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <h4 class="font-extrabold text-xs text-stone-900 truncate pr-2 font-display">${item.name}</h4>
                            <button onclick="window.removeCartItem('${item.cartItemId}')" class="text-stone-400 hover:text-flame-600 transition">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                        ${item.options ? `<div class="text-[10px] text-brand-700 font-semibold mt-0.5">${item.options}</div>` : ''}
                        ${item.sauces.length > 0 ? `<div class="text-[10px] text-stone-500 truncate mt-0.5">+ Sauces: ${item.sauces.join(', ')}</div>` : ''}
                        ${item.instructions ? `<div class="text-[10px] text-stone-400 italic truncate mt-0.5">Note: "${item.instructions}"</div>` : ''}
                        <div class="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                            <span class="font-mono font-black text-xs text-stone-900">${formatPrice(item.totalItemPrice)}</span>
                            <div class="flex items-center space-x-2 bg-white rounded-lg border border-stone-200 px-1 py-0.5">
                                <button onclick="window.updateCartItemQty('${item.cartItemId}', -1)" class="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-stone-900">-</button>
                                <span class="font-mono font-bold text-xs px-1">${item.quantity}</span>
                                <button onclick="window.updateCartItemQty('${item.cartItemId}', 1)" class="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-stone-900">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        const deliveryFee = (subtotal === 0 || state.fulfillment !== 'delivery') ? 0 : (subtotal >= 200 ? 0 : RESTAURANT_INFO.deliveryFee);
        let discount = 0;
        if (subtotal > 0 && state.appliedPromo === 'TOWN10') discount = subtotal * 0.10;
        const grandTotal = subtotal === 0 ? 0 : Math.max(0, subtotal + deliveryFee - discount);

        document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
        document.getElementById('cartDeliveryFee').textContent = subtotal === 0 ? 'Le 0' : (deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee));
        
        const discountRow = document.getElementById('discountRow');
        if (discount > 0) {
            discountRow.classList.remove('hidden');
            document.getElementById('cartDiscount').textContent = `-${formatPrice(discount)}`;
        } else {
            discountRow.classList.add('hidden');
        }

        document.getElementById('cartGrandTotal').textContent = formatPrice(grandTotal);

        if (window.lucide) window.lucide.createIcons();
    }

    window.updateCartItemQty = function(cartItemId, delta) {
        const item = state.cart.find(c => c.cartItemId === cartItemId);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            state.cart = state.cart.filter(c => c.cartItemId !== cartItemId);
        } else {
            const singleBase = item.totalItemPrice / (item.quantity - delta);
            item.totalItemPrice = singleBase * item.quantity;
        }
        saveCart();
        updateCartUI();
    };

    window.removeCartItem = function(cartItemId) {
        state.cart = state.cart.filter(c => c.cartItemId !== cartItemId);
        saveCart();
        updateCartUI();
    };

    window.setFulfillment = function(type) {
        state.fulfillment = type;
        localStorage.setItem('ct_fulfillment', type);

        const deliveryBtn = document.getElementById('toggleDeliveryBtn');
        const pickupBtn = document.getElementById('togglePickupBtn');
        const dineInBtn = document.getElementById('toggleDineInBtn');
        const notice = document.getElementById('fulfillmentNotice');
        const addressSection = document.getElementById('checkoutAddressSection');
        const tableSection = document.getElementById('checkoutTableSection');
        const cashLabel = document.getElementById('cashPaymentLabel');
        const cashSublabel = document.getElementById('cashPaymentSublabel');

        [deliveryBtn, pickupBtn, dineInBtn].forEach(b => {
            if (b) b.className = 'py-2 rounded-lg font-bold transition flex items-center justify-center space-x-1 text-stone-600 hover:text-stone-900';
        });

        if (type === 'delivery') {
            if (deliveryBtn) deliveryBtn.className = 'py-2 rounded-lg font-bold transition flex items-center justify-center space-x-1 bg-white text-stone-900 shadow-sm';
            if (notice) notice.innerHTML = '🛵 Delivery Dispatch via <strong>Call 392</strong> (30-45 mins)';
            if (addressSection) addressSection.classList.remove('hidden');
            if (tableSection) tableSection.classList.add('hidden');
            if (cashLabel) cashLabel.textContent = 'Cash on Delivery';
            if (cashSublabel) cashSublabel.textContent = 'Pay upon arrival';
        } else if (type === 'pickup') {
            if (pickupBtn) pickupBtn.className = 'py-2 rounded-lg font-bold transition flex items-center justify-center space-x-1 bg-white text-stone-900 shadow-sm';
            if (notice) notice.innerHTML = '🛍️ Pickup Ready in: <strong>15-20 mins</strong> at 24 Wilkinson Road';
            if (addressSection) addressSection.classList.add('hidden');
            if (tableSection) tableSection.classList.add('hidden');
            if (cashLabel) cashLabel.textContent = 'Cash on Pickup';
            if (cashSublabel) cashSublabel.textContent = 'Pay at counter';
        } else if (type === 'dine-in') {
            if (dineInBtn) dineInBtn.className = 'py-2 rounded-lg font-bold transition flex items-center justify-center space-x-1 bg-white text-amber-600 shadow-sm';
            if (notice) notice.innerHTML = `🍽️ In-Store Dining: Serving straight to <strong>Table ${state.tableNumber}</strong>!`;
            if (addressSection) addressSection.classList.add('hidden');
            if (tableSection) tableSection.classList.remove('hidden');
            if (cashLabel) cashLabel.textContent = 'Pay to Server';
            if (cashSublabel) cashSublabel.textContent = 'Cash or card at table';
        }

        updateCartUI();
    };

    window.applyPromoCode = function() {
        const input = document.getElementById('promoInput');
        const feedback = document.getElementById('promoFeedback');
        const val = input.value.trim().toUpperCase();

        if (val === 'TOWN10') {
            state.appliedPromo = 'TOWN10';
            feedback.textContent = '✓ TOWN10 Applied: 10% discount on your order!';
            feedback.className = 'text-xs font-semibold text-emerald-600';
            feedback.classList.remove('hidden');
            updateCartUI();
        } else {
            state.appliedPromo = null;
            feedback.textContent = 'Invalid promo code. Try "TOWN10".';
            feedback.className = 'text-xs font-semibold text-flame-600';
            feedback.classList.remove('hidden');
            updateCartUI();
        }
    };

    function openCart() {
        const drawer = document.getElementById('cartDrawer');
        const backdrop = document.getElementById('cartDrawerBackdrop');
        backdrop?.classList.remove('hidden');
        setTimeout(() => {
            backdrop?.classList.remove('opacity-0');
            drawer?.classList.remove('translate-x-full');
        }, 10);
    }

    function closeCart() {
        const drawer = document.getElementById('cartDrawer');
        const backdrop = document.getElementById('cartDrawerBackdrop');
        backdrop?.classList.add('opacity-0');
        drawer?.classList.add('translate-x-full');
        setTimeout(() => {
            backdrop?.classList.add('hidden');
        }, 300);
    }

    window.openCheckoutModal = function() {
        if (state.cart.length === 0) return;
        closeCart();

        let subtotal = state.cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
        const deliveryFee = state.fulfillment === 'delivery' ? (subtotal >= 200 ? 0 : RESTAURANT_INFO.deliveryFee) : 0;
        const discount = state.appliedPromo === 'TOWN10' ? subtotal * 0.10 : 0;
        const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

        document.getElementById('checkoutTotalDisplay').textContent = formatPrice(grandTotal);

        const addressSection = document.getElementById('checkoutAddressSection');
        const tableSection = document.getElementById('checkoutTableSection');
        const tableInput = document.getElementById('custTableNum');
        const subtitle = document.getElementById('checkoutModalSubtitle');

        if (state.fulfillment === 'dine-in') {
            addressSection?.classList.add('hidden');
            tableSection?.classList.remove('hidden');
            if (tableInput) tableInput.value = state.tableNumber;
            document.getElementById('custAddress')?.removeAttribute('required');
            if (subtitle) subtitle.textContent = `Table ${state.tableNumber} Dine-In: Food will be served hot directly to your table`;
        } else if (state.fulfillment === 'pickup') {
            addressSection?.classList.add('hidden');
            tableSection?.classList.add('hidden');
            document.getElementById('custAddress')?.removeAttribute('required');
            if (subtitle) subtitle.textContent = 'Counter Pickup: Collect your hot order at 24 Wilkinson Road';
        } else {
            addressSection?.classList.remove('hidden');
            tableSection?.classList.add('hidden');
            document.getElementById('custAddress')?.setAttribute('required', 'true');
            if (subtitle) subtitle.textContent = 'Delivery Order: Enter your address to dispatch our kitchen riders';
        }

        window.updateUssdPaymentBox();
        document.getElementById('checkoutModalBackdrop')?.classList.remove('hidden');
    };

    window.closeCheckoutModal = function() {
        document.getElementById('checkoutModalBackdrop')?.classList.add('hidden');
    };

    // ==========================================
    // 1-TAP USSD PAYMENT (ORANGE MONEY & AFRICELL)
    // ==========================================
    window.updateUssdPaymentBox = function() {
        const ussdBox = document.getElementById('ussdPayBox');
        if (!ussdBox) return;

        const selectedPayment = document.querySelector('input[name="paymentOption"]:checked')?.value || 'Orange Money';

        let subtotal = state.cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
        const deliveryFee = state.fulfillment === 'delivery' ? (subtotal >= 200 ? 0 : RESTAURANT_INFO.deliveryFee) : 0;
        const discount = state.appliedPromo === 'TOWN10' ? subtotal * 0.10 : 0;
        const grandTotal = Math.round(Math.max(0, subtotal + deliveryFee - discount));

        const orangeMerchant = localStorage.getItem('ct_orange_merchant') || '3920';
        const africellMerchant = localStorage.getItem('ct_africell_merchant') || '3920';

        const iconElem = document.getElementById('ussdProviderIcon');
        const titleElem = document.getElementById('ussdProviderTitle');
        const badgeElem = document.getElementById('ussdBadge');
        const codeElem = document.getElementById('ussdCodeDisplay');
        const dialLink = document.getElementById('ussdDialLink');
        const dialBtnText = document.getElementById('ussdDialButtonText');
        const instructions = document.getElementById('ussdInstructions');

        if (selectedPayment === 'Orange Money') {
            ussdBox.classList.remove('hidden');
            const ussdString = `*144*3*${orangeMerchant}*${grandTotal}#`;
            const encodedTel = `tel:*144*3*${orangeMerchant}*${grandTotal}%23`;

            if (iconElem) iconElem.textContent = '📱';
            if (titleElem) titleElem.textContent = 'Orange Money 1-Tap USSD Pay';
            if (badgeElem) {
                badgeElem.textContent = 'ORANGE SL';
                badgeElem.className = 'bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase font-mono';
            }
            if (codeElem) codeElem.textContent = ussdString;
            if (dialLink) dialLink.href = encodedTel;
            if (dialBtnText) dialBtnText.textContent = `📞 1-Tap Dial Code (${ussdString})`;
            if (instructions) instructions.textContent = 'Tapping opens your phone dialer with the code and exact amount pre-entered. Then press Call and enter your secret Orange Money PIN!';
        } else if (selectedPayment === 'Africell Money') {
            ussdBox.classList.remove('hidden');
            const ussdString = `*161*2*${africellMerchant}*${grandTotal}#`;
            const encodedTel = `tel:*161*2*${africellMerchant}*${grandTotal}%23`;

            if (iconElem) iconElem.textContent = '⚡';
            if (titleElem) titleElem.textContent = 'Africell Afrimoney 1-Tap USSD Pay';
            if (badgeElem) {
                badgeElem.textContent = 'AFRICELL SL';
                badgeElem.className = 'bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase font-mono';
            }
            if (codeElem) codeElem.textContent = ussdString;
            if (dialLink) dialLink.href = encodedTel;
            if (dialBtnText) dialBtnText.textContent = `📞 1-Tap Dial Code (${ussdString})`;
            if (instructions) instructions.textContent = 'Tapping opens your phone dialer with the Afrimoney code and exact amount pre-entered. Then press Call and enter your Afrimoney PIN!';
        } else {
            // Cash on Delivery / Server
            ussdBox.classList.add('hidden');
        }
    };

    window.copyUssdCode = function() {
        const codeText = document.getElementById('ussdCodeDisplay')?.textContent?.trim();
        if (!codeText) return;

        navigator.clipboard.writeText(codeText).then(() => {
            const btn = document.getElementById('copyUssdText');
            if (btn) {
                const orig = btn.textContent;
                btn.textContent = 'Copied! ✓';
                setTimeout(() => { btn.textContent = orig; }, 2000);
            }
        }).catch(() => {
            const temp = document.createElement('textarea');
            temp.value = codeText;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            const btn = document.getElementById('copyUssdText');
            if (btn) {
                btn.textContent = 'Copied! ✓';
                setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
            }
        });
    };

    // ==========================================
    // 1-CLICK WHATSAPP ORDER FORWARDING
    // ==========================================
    window.checkoutViaWhatsApp = function() {
        if (state.cart.length === 0) {
            alert('Your cart is empty! Please select some food items first.');
            return;
        }

        const rawPhone = localStorage.getItem('ct_whatsapp_phone') || RESTAURANT_INFO.cateringPhone || '23280600700';
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

        let subtotal = state.cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
        const deliveryFee = state.fulfillment === 'delivery' ? (subtotal >= 200 ? 0 : RESTAURANT_INFO.deliveryFee) : 0;
        const discount = state.appliedPromo === 'TOWN10' ? subtotal * 0.10 : 0;
        const total = Math.max(0, subtotal + deliveryFee - discount);

        let msg = `🍗 *CHICKEN TOWN SL — ORDER REQUEST*\n`;
        msg += `*SWIT U MOT SWIT U LYF!*\n\n`;
        msg += `📋 *Items Ordered:*\n`;

        state.cart.forEach((item, idx) => {
            msg += `${idx + 1}. *${item.quantity}x ${item.name}* — Le ${item.totalItemPrice}\n`;
            if (item.options) msg += `   ↳ ${item.options}\n`;
            if (item.sauces && item.sauces.length > 0) msg += `   ↳ Sauces: ${item.sauces.join(', ')}\n`;
            if (item.instructions) msg += `   ↳ Note: "${item.instructions}"\n`;
        });

        msg += `\n💰 *Food Subtotal:* Le ${subtotal}\n`;
        if (state.fulfillment === 'delivery') {
            msg += `🛵 *Order Type:* Home/Office Delivery\n`;
            msg += `📍 *Delivery Fee:* Le ${deliveryFee === 0 ? 'FREE' : deliveryFee}\n`;
        } else if (state.fulfillment === 'dine-in') {
            msg += `🍽️ *Order Type:* Dine-In (Table ${state.tableNumber})\n`;
        } else {
            msg += `🛍️ *Order Type:* Counter Pickup (24 Wilkinson Rd)\n`;
        }
        if (discount > 0) msg += `🏷️ *Discount (TOWN10):* -Le ${discount}\n`;
        msg += `💵 *Grand Total:* *Le ${total}*\n\n`;
        msg += `Please confirm my order and advise on delivery / payment!`;

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    };

    window.placeOrderAndForwardWhatsApp = function() {
        const form = document.getElementById('checkoutForm');
        if (!form) return;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const notes = document.getElementById('custNotes').value.trim();
        const paymentMethod = document.querySelector('input[name="paymentOption"]:checked')?.value || 'Orange Money';

        let address = '';
        let tableNum = null;

        if (state.fulfillment === 'dine-in') {
            tableNum = document.getElementById('custTableNum')?.value.trim() || state.tableNumber || '1';
            address = `Dine-In Table ${tableNum}`;
            state.tableNumber = tableNum;
            localStorage.setItem('ct_table', tableNum);
        } else if (state.fulfillment === 'pickup') {
            address = 'Store Pickup - 24 Wilkinson Road';
        } else {
            address = document.getElementById('custAddress').value.trim();
        }

        let subtotal = state.cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
        const deliveryFee = state.fulfillment === 'delivery' ? (subtotal >= 200 ? 0 : RESTAURANT_INFO.deliveryFee) : 0;
        const discount = state.appliedPromo === 'TOWN10' ? subtotal * 0.10 : 0;
        const total = Math.max(0, subtotal + deliveryFee - discount);

        const newOrderId = `CT-${Math.floor(1000 + Math.random() * 9000)}`;

        const newOrder = {
            id: newOrderId,
            customer: {
                name,
                phone,
                address,
                type: state.fulfillment,
                table: tableNum,
                notes
            },
            items: state.cart.map(c => ({
                id: c.itemId,
                name: c.name,
                quantity: c.quantity,
                price: c.totalItemPrice,
                options: c.options,
                sauces: c.sauces
            })),
            subtotal,
            deliveryFee,
            discount,
            total,
            currency: state.currency,
            paymentMethod,
            paymentStatus: paymentMethod.includes('Cash') || paymentMethod.includes('Server') ? 'pending' : 'paid',
            status: 'received',
            timestamp: new Date().toISOString()
        };

        state.orders.unshift(newOrder);
        localStorage.setItem('ct_orders', JSON.stringify(state.orders));
        state.activeTrackingId = newOrderId;
        localStorage.setItem('ct_last_order_id', newOrderId);

        // Build comprehensive WhatsApp message
        const rawPhone = localStorage.getItem('ct_whatsapp_phone') || RESTAURANT_INFO.cateringPhone || '23280600700';
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

        let msg = `🍗 *CHICKEN TOWN SL — NEW ORDER #${newOrderId}*\n`;
        msg += `*Tagline:* _SWIT U MOT SWIT U LYF!_\n\n`;
        msg += `👤 *Customer:* ${name}\n`;
        msg += `📞 *Phone:* ${phone}\n`;
        if (state.fulfillment === 'dine-in') {
            msg += `🍽️ *Mode:* Dine-In (Table ${tableNum})\n`;
        } else if (state.fulfillment === 'pickup') {
            msg += `🛍️ *Mode:* Store Pickup (Wilkinson Rd)\n`;
        } else {
            msg += `🛵 *Mode:* Home/Office Delivery\n`;
            msg += `📍 *Delivery Address:* ${address}\n`;
        }
        if (notes) msg += `📝 *Notes:* ${notes}\n`;
        msg += `💳 *Payment Method:* ${paymentMethod}\n\n`;

        msg += `📋 *Items Ordered:*\n`;
        newOrder.items.forEach((item, idx) => {
            msg += `${idx + 1}. *${item.quantity}x ${item.name}* — Le ${item.price}\n`;
            if (item.options) msg += `   ↳ ${item.options}\n`;
            if (item.sauces && item.sauces.length > 0) msg += `   ↳ Sauces: ${item.sauces.join(', ')}\n`;
        });

        msg += `\n💰 *Subtotal:* Le ${subtotal}\n`;
        if (state.fulfillment === 'delivery') {
            msg += `🛵 *Delivery Fee:* Le ${deliveryFee === 0 ? 'FREE' : deliveryFee}\n`;
        }
        if (discount > 0) msg += `🏷️ *Discount (TOWN10):* -Le ${discount}\n`;
        msg += `💵 *Grand Total:* *Le ${total}*\n\n`;
        msg += `Please confirm my order ticket #${newOrderId} and prepare my meal!`;

        state.cart = [];
        saveCart();
        updateCartUI();

        sound.playOrderSuccess();
        window.closeCheckoutModal();
        window.openTrackerModal(newOrderId);

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    };

    window.forwardCurrentOrderWhatsApp = function(orderId) {
        const targetId = orderId || state.activeTrackingId;
        const order = state.orders.find(o => o.id === targetId);
        if (!order) {
            alert('Order not found!');
            return;
        }

        const rawPhone = localStorage.getItem('ct_whatsapp_phone') || RESTAURANT_INFO.cateringPhone || '23280600700';
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

        let msg = `🍗 *CHICKEN TOWN SL — ORDER #${order.id} UPDATE*\n\n`;
        msg += `👤 *Customer:* ${order.customer.name}\n`;
        msg += `📞 *Phone:* ${order.customer.phone}\n`;
        msg += `📍 *Address/Table:* ${order.customer.address}\n`;
        msg += `💳 *Payment Method:* ${order.paymentMethod}\n`;
        msg += `💵 *Grand Total:* Le ${order.total}\n\n`;
        msg += `📋 *Items:*\n`;
        order.items.forEach((item, idx) => {
            msg += `${idx + 1}. ${item.quantity}x ${item.name} (Le ${item.price})\n`;
        });
        msg += `\nHello Chicken Town, please confirm receipt of order #${order.id}!`;

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    };

    window.handlePlaceOrder = function(e) {
        e.preventDefault();

        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const notes = document.getElementById('custNotes').value.trim();
        const paymentMethod = document.querySelector('input[name="paymentOption"]:checked')?.value || 'Orange Money';

        let address = '';
        let tableNum = null;

        if (state.fulfillment === 'dine-in') {
            tableNum = document.getElementById('custTableNum')?.value.trim() || state.tableNumber || '1';
            address = `Dine-In Table ${tableNum}`;
            state.tableNumber = tableNum;
            localStorage.setItem('ct_table', tableNum);
        } else if (state.fulfillment === 'pickup') {
            address = 'Store Pickup - 24 Wilkinson Road';
        } else {
            address = document.getElementById('custAddress').value.trim();
        }

        let subtotal = state.cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
        const deliveryFee = state.fulfillment === 'delivery' ? (subtotal >= 200 ? 0 : RESTAURANT_INFO.deliveryFee) : 0;
        const discount = state.appliedPromo === 'TOWN10' ? subtotal * 0.10 : 0;
        const total = Math.max(0, subtotal + deliveryFee - discount);

        const newOrderId = `CT-${Math.floor(1000 + Math.random() * 9000)}`;

        const newOrder = {
            id: newOrderId,
            customer: {
                name,
                phone,
                address,
                type: state.fulfillment,
                table: tableNum,
                notes
            },
            items: state.cart.map(c => ({
                id: c.itemId,
                name: c.name,
                quantity: c.quantity,
                price: c.totalItemPrice,
                options: c.options,
                sauces: c.sauces
            })),
            subtotal,
            deliveryFee,
            discount,
            total,
            currency: state.currency,
            paymentMethod,
            paymentStatus: paymentMethod.includes('Cash') || paymentMethod.includes('Server') ? 'pending' : 'paid',
            status: 'received',
            timestamp: new Date().toISOString()
        };

        state.orders.unshift(newOrder);
        localStorage.setItem('ct_orders', JSON.stringify(state.orders));
        state.activeTrackingId = newOrderId;
        localStorage.setItem('ct_last_order_id', newOrderId);

        state.cart = [];
        saveCart();
        updateCartUI();

        sound.playOrderSuccess();
        window.closeCheckoutModal();
        window.openTrackerModal(newOrderId);
    };

    window.openTrackerModal = function(orderId) {
        const targetId = orderId || state.activeTrackingId;
        const order = state.orders.find(o => o.id === targetId);

        if (!order) {
            alert('No recent orders found to track. Place an order first!');
            return;
        }

        state.activeTrackingId = order.id;
        updateTrackerUI();
        document.getElementById('trackerModalBackdrop')?.classList.remove('hidden');
    };

    window.closeTrackerModal = function() {
        document.getElementById('trackerModalBackdrop')?.classList.add('hidden');
    };

    function updateTrackerUI() {
        const order = state.orders.find(o => o.id === state.activeTrackingId);
        if (!order) return;

        document.getElementById('trackerOrderId').textContent = order.id;

        const isDineIn = order.customer.type === 'dine-in';

        const statusLabels = {
            'received': isDineIn ? `Order Received for Table ${order.customer.table || ''}!` : 'Order Received by Chicken Town Kitchen',
            'preparing': 'Kitchen is Frying & Packing Your Meal',
            'out_for_delivery': isDineIn ? `Food Being Served to Table ${order.customer.table || ''}!` : (order.customer.type === 'delivery' ? 'Rider Dispatched (Call 392 for ETA)' : 'Ready for Counter Pickup!'),
            'completed': 'Order Completed! Swit U Mot, Swit U Lyf!',
            'cancelled': 'Order Cancelled'
        };

        document.getElementById('trackerStatusLabel').textContent = `Status: ${statusLabels[order.status] || order.status}`;

        const steps = ['received', 'preparing', 'out_for_delivery', 'completed'];
        const currentIdx = steps.indexOf(order.status);

        steps.forEach((stepId, idx) => {
            const stepCard = document.getElementById(`step-${stepId}`);
            if (!stepCard) return;
            if (idx <= currentIdx) {
                stepCard.className = 'step-card bg-brand-500 text-stone-950 rounded-xl py-2 px-1 shadow-sm font-bold transition';
            } else {
                stepCard.className = 'step-card bg-stone-200 text-stone-400 rounded-xl py-2 px-1 transition';
            }
        });

        const receiptItemsContainer = document.getElementById('trackerReceiptItems');
        receiptItemsContainer.innerHTML = order.items.map(item => `
            <div class="flex justify-between">
                <div>
                    <div>${item.quantity}x ${item.name}</div>
                    ${item.options ? `<div class="text-[9px] text-stone-500">${item.options}</div>` : ''}
                </div>
                <span>${formatPrice(item.price)}</span>
            </div>
        `).join('') + `
            <div class="flex justify-between text-stone-500 pt-1 border-t border-stone-200">
                <span>Order Mode (${order.customer.type.toUpperCase()}${order.customer.table ? ` - TABLE ${order.customer.table}` : ''})</span>
                <span>${order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
            </div>
        `;

        document.getElementById('trackerReceiptTotal').textContent = formatPrice(order.total);
    }

    function initializeApp() {
        initTableMode();
        renderCurrencyDisplay();
        renderCategories();
        renderMenuItems();
        updateCartUI();

        document.getElementById('openCartBtn')?.addEventListener('click', openCart);
        document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
        document.getElementById('cartDrawerBackdrop')?.addEventListener('click', closeCart);

        document.getElementById('trackOrderBtn')?.addEventListener('click', () => {
            window.openTrackerModal(state.activeTrackingId);
        });

        const currencyBtn = document.getElementById('currencyBtn');
        const currencyDropdown = document.getElementById('currencyDropdown');
        currencyBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            currencyDropdown?.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            currencyDropdown?.classList.add('hidden');
        });

        const handleSearch = (e) => {
            state.searchQuery = e.target.value.trim();
            renderMenuItems();
        };
        document.getElementById('searchInput')?.addEventListener('input', handleSearch);
        document.getElementById('mobileSearchInput')?.addEventListener('input', handleSearch);

        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderMenuItems();
        });

        document.querySelectorAll('input[name="paymentOption"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.querySelectorAll('.payment-method-card').forEach(card => {
                    card.classList.remove('border-brand-500', 'bg-amber-50/50');
                    card.classList.add('border-stone-200');
                });
                const parent = e.target.closest('.payment-method-card');
                if (parent) {
                    parent.classList.remove('border-stone-200');
                    parent.classList.add('border-brand-500', 'bg-amber-50/50');
                }
                window.updateUssdPaymentBox();
            });
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'ct_sold_out') {
                state.soldOutItems = JSON.parse(e.newValue || '[]');
                renderMenuItems();
            }
            if (e.key === 'ct_custom_menu') {
                state.menuItems = loadInitialMenu();
                renderMenuItems();
            }
            if (e.key === 'ct_orders') {
                state.orders = JSON.parse(e.newValue || '[]');
                if (!document.getElementById('trackerModalBackdrop')?.classList.contains('hidden')) {
                    updateTrackerUI();
                }
            }
        });

        if (window.lucide) {
            try { window.lucide.createIcons(); } catch (err) {}
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();

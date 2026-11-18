// Chicken Town SL - Kitchen Display System & Operations Management Bundle

(function() {
    const DEFAULT_MENU_ITEMS = [
        { id: 'deal-family', name: 'Family Deal', price: 499, category: 'deals', badge: 'Top Seller', image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80', description: '4 Fried Wings + 2 CT Burgers + 2 CT Wraps + 2 Sides + 2 Soft Drinks.' },
        { id: 'deal-classic-box', name: 'Classic Box', price: 150, category: 'deals', badge: 'Popular', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', description: '2 Crispy Fried Drumsticks + 1 Side + 1 Soft Drink.' },
        { id: 'deal-bbq-wings-meal', name: 'BBQ Wings Meal', price: 155, category: 'deals', badge: 'BBQ Special', image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80', description: '4 Glazed BBQ Wings + 1 Side + 1 Soft Drink.' },
        { id: 'deal-fried-wings-meal', name: 'Fried Wings Meal', price: 155, category: 'deals', badge: 'Crispy', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80', description: '4 Golden Fried Wings + 1 Side + 1 Soft Drink.' },
        { id: 'deal-snack-box', name: 'Snack Box', price: 99, category: 'deals', badge: 'Best Value', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', description: '1 Golden Fried Drumstick + 1 Side + 1 Soft Drink.' },

        { id: 'burg-ct-burger', name: 'CT Burger', price: 90, category: 'burgers_wraps', badge: 'Signature', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80', description: 'Crispy chicken patty + CT sauce + fresh tomatoes + lettuce + cucumber.' },
        { id: 'burg-frontline', name: 'Frontline Burger', price: 110, category: 'burgers_wraps', badge: 'Loaded', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', description: 'Crispy chicken patty + fried egg + CT sauce + salad.' },
        { id: 'burg-ct-combo', name: 'CT Burger Combo', price: 150, category: 'burgers_wraps', badge: 'Combo Deal', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80', description: '1 CT Burger + Chips or Rice + 1 Soft Drink.' },
        { id: 'wrap-ct-wrap', name: 'CT Wrap', price: 90, category: 'burgers_wraps', badge: 'Popular', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80', description: 'Crispy diced chicken + signature CT sauce.' },
        { id: 'wrap-ct-combo', name: 'CT Wrap Combo', price: 145, category: 'burgers_wraps', badge: 'Combo Deal', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', description: '1 CT Wrap + Chips or Rice + 1 Soft Drink.' },

        { id: 'chick-1-drumstick', name: '1 Fried Drumstick', price: 45, category: 'chicken', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80', description: '1 crispy golden fried drumstick.' },
        { id: 'chick-3-drumsticks', name: '3 Fried Drumsticks', price: 130, category: 'chicken', badge: 'Best Value', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80', description: '3 crispy golden fried drumsticks.' },
        { id: 'chick-1-wing', name: '1 Fried Wing', price: 25, category: 'chicken', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80', description: '1 crispy seasoned fried wing.' },
        { id: 'chick-4-wings', name: '4 Fried Wings', price: 90, category: 'chicken', badge: 'Popular', image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80', description: '4 crispy seasoned fried wings.' },
        { id: 'bbq-1-wing', name: '1 BBQ Wing', price: 25, category: 'chicken', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', description: '1 glazed BBQ wing.' },
        { id: 'bbq-4-wings', name: '4 BBQ Wings', price: 100, category: 'chicken', badge: 'BBQ', image: 'https://images.unsplash.com/photo-1527477321055-43615852573d?auto=format&fit=crop&w=800&q=80', description: '4 glazed BBQ wings.' },
        { id: 'bbq-1-drumstick', name: '1 BBQ Drumstick', price: 50, category: 'chicken', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', description: '1 juicy BBQ drumstick.' },
        { id: 'chick-3-strips', name: '3 Boneless Strips', price: 75, category: 'chicken', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80', description: '3 crispy boneless strips.' },
        { id: 'chick-6-strips', name: '6 Boneless Strips', price: 140, category: 'chicken', badge: 'Popular', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80', description: '6 crispy boneless strips.' },
        { id: 'chick-6-nuggets', name: '6 Chicken Nuggets', price: 45, category: 'chicken', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', description: '6 golden chicken nuggets.' },

        { id: 'fowl-english-whole', name: 'English Fowl - Whole Chicken', price: 300, category: 'fowls', badge: 'Pepper Chicken', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80', description: 'Whole roasted English fowl pepper chicken.' },
        { id: 'fowl-english-half', name: 'English Fowl - Half Chicken', price: 160, category: 'fowls', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80', description: 'Half roasted English fowl pepper chicken.' },
        { id: 'fowl-kontri-whole', name: 'Kontri Fowl - Whole Chicken', price: 320, category: 'fowls', badge: 'Authentic Local', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80', description: 'Whole traditional Kontri fowl pepper chicken.' },
        { id: 'fowl-kontri-half', name: 'Kontri Fowl - Half Chicken', price: 160, category: 'fowls', badge: 'Authentic Local', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80', description: 'Half traditional Kontri fowl pepper chicken.' },

        { id: 'celeb-deal-5', name: 'Meal Deal for 5', price: 925, category: 'celebration', badge: 'Feast for 5', image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80', description: '5 Drumsticks, 12 Wings, 2 Chips, 2 Jollof, 2 Fried Rice, 5 Drinks, 5 Waters, 1 Salad.' },
        { id: 'celeb-deal-10', name: 'Meal Deal for 10', price: 2299, category: 'celebration', badge: 'Feast for 10', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', description: '12 Wings, 5 Jollof, 5 Fried Rice, 10 Drinks, 10 Waters, 2 Salads, 5 Burgers, 5 Wraps, Half Kontri Fowl, 2 Plantains.' },
        { id: 'celeb-deal-15', name: 'Meal Deal for 15', price: 3499, category: 'celebration', badge: 'Mega Feast', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: '30 Wings, 5 Jollof, 5 Fried Rice, 15 Drinks, 15 Waters, 2 Salads, 5 Burgers, 5 Wraps, 10 Drumsticks, 10 Ice Creams, 4 Plantains.' },

        { id: 'side-chips', name: 'Crispy Chips', price: 45, category: 'sides', badge: 'Popular', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', description: 'Golden skin-on crispy potato chips.' },
        { id: 'side-chips-masala', name: 'Chips Masala', price: 55, category: 'sides', badge: 'Spicy', image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80', description: 'Crispy chips tossed in spicy pepper masala.' },
        { id: 'side-plantain', name: 'Fried Sweet Plantain', price: 50, category: 'sides', badge: 'Local Special', image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80', description: 'Caramelized sweet plantains fried golden.' },
        { id: 'side-jollof', name: 'Jollof Rice (Plain)', price: 50, category: 'sides', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80', description: 'Smoky Sierra Leone jollof rice.' },
        { id: 'side-fried-rice', name: 'Fried Rice (Plain)', price: 50, category: 'sides', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', description: 'Savory seasoned vegetable fried rice.' },
        { id: 'side-jollof-chicken', name: 'Jollof Rice + Shredded Chicken', price: 70, category: 'sides', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80', description: 'Smoky jollof topped with shredded chicken.' },
        { id: 'side-fried-chicken', name: 'Fried Rice + Shredded Chicken', price: 70, category: 'sides', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', description: 'Fried rice topped with savory shredded chicken.' },
        { id: 'side-salad', name: 'Side Salad', price: 65, category: 'sides', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', description: 'Fresh mixed salad with house dressing.' },
        { id: 'side-ct-salad', name: 'Chicken Town Salad', price: 110, category: 'sides', badge: 'Chef Special', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', description: 'Crispy diced chicken breast on mixed salad.' },
        { id: 'mami-meal', name: 'Mami Meal', price: 30, category: 'sides', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', description: 'Rice + stew + boiled egg.' },

        { id: 'ice-chillers', name: 'Chillers Ice Cream', price: 35, category: 'desserts', badge: 'Sweet Treat', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', description: 'Chilled ice cream cup.' },
        { id: 'ice-hb', name: 'HB Ice Cream', price: 45, category: 'desserts', badge: 'Premium', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80', description: 'Velvety HB ice cream cup.' },
        { id: 'tea-coffee', name: 'Hot Tea / Coffee', price: 25, category: 'desserts', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', description: 'Hot brewed tea or coffee.' },

        // DRINKS - SOFT DRINKS, JUICES & WATERS
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

    const INITIAL_ORDERS = [
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
            id: 'CT-9105',
            customer: {
                name: 'Samuel Cole',
                phone: '+232 77 990 011',
                address: 'Dine-In',
                type: 'dine-in',
                table: '4',
                notes: 'Piping hot please'
            },
            items: [
                { id: 'burg-ct-combo', name: 'CT Burger Combo', quantity: 1, price: 150, options: 'Side: Crispy Chips | Drink: Sprite (Plastic)' },
                { id: 'chick-4-wings', name: '4 Fried Wings', quantity: 1, price: 90 }
            ],
            subtotal: 240,
            deliveryFee: 0,
            discount: 0,
            total: 240,
            currency: 'NLe',
            paymentMethod: 'Paid to Server',
            paymentStatus: 'paid',
            status: 'received',
            timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
        }
    ];

    class SoundFX {
        constructor() {
            this.ctx = null;
            this.enabled = true;
        }
        init() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }
        playKitchenBell() {
            if (!this.enabled) return;
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                [now, now + 0.18].forEach(startTime => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1480, startTime);
                    gain.gain.setValueAtTime(0.25, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.6);
                });
            } catch (e) {}
        }
    }
    const sound = new SoundFX();

    // Smart Initial Menu Loader: merges any missing default items (drinks, beers, sauces) into localStorage
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

    const adminState = {
        activeTab: 'orders',
        filterStatus: 'all',
        soundEnabled: true,
        orders: JSON.parse(localStorage.getItem('ct_orders') || JSON.stringify(INITIAL_ORDERS)),
        soldOutItems: JSON.parse(localStorage.getItem('ct_sold_out') || '[]'),
        menuItems: loadInitialMenu(),
        editingItemId: null,
        stockCategory: 'all',
        stockSearch: ''
    };

    function startClock() {
        const clockElem = document.getElementById('liveClock');
        const update = () => {
            const now = new Date();
            if (clockElem) {
                clockElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        };
        update();
        setInterval(update, 1000);
    }

    function setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'ct_orders') {
                const oldOrders = adminState.orders;
                const newOrders = JSON.parse(e.newValue || '[]');
                // Ring bell only for genuinely new orders (not fee-awaiting updates)
                const newNonFee = newOrders.filter(o => o.status !== 'awaiting_fee');
                const oldNonFee = oldOrders.filter(o => o.status !== 'awaiting_fee');
                if (newNonFee.length > oldNonFee.length && adminState.soundEnabled) {
                    sound.playKitchenBell();
                }
                // Also ring for new awaiting_fee orders
                const newAwaiting = newOrders.filter(o => o.status === 'awaiting_fee');
                const oldAwaiting = oldOrders.filter(o => o.status === 'awaiting_fee');
                if (newAwaiting.length > oldAwaiting.length && adminState.soundEnabled) {
                    sound.playKitchenBell();
                }
                adminState.orders = newOrders;
                updateMetrics();
                renderTickets();
            }
            if (e.key === 'ct_sold_out') {
                adminState.soldOutItems = JSON.parse(e.newValue || '[]');
                renderStockGrid();
            }
            if (e.key === 'ct_custom_menu') {
                adminState.menuItems = loadInitialMenu();
                renderStockGrid();
            }
        });
    }

    window.toggleKitchenSound = function() {
        adminState.soundEnabled = !adminState.soundEnabled;
        sound.enabled = adminState.soundEnabled;
        const soundText = document.getElementById('soundStatusText');
        const bellIcon = document.getElementById('bellIcon');
        if (adminState.soundEnabled) {
            soundText.textContent = 'Chime: ON';
            bellIcon.className = 'w-4 h-4 text-brand-400';
            sound.playKitchenBell();
        } else {
            soundText.textContent = 'Chime: MUTED';
            bellIcon.className = 'w-4 h-4 text-stone-500';
        }
    };

    window.switchAdminTab = function(tab) {
        adminState.activeTab = tab;
        const ordersView = document.getElementById('ordersView');
        const stockView = document.getElementById('stockView');
        const standeesView = document.getElementById('standeesView');

        const tabOrdersBtn = document.getElementById('tabOrdersBtn');
        const tabStockBtn = document.getElementById('tabStockBtn');
        const tabStandeesBtn = document.getElementById('tabStandeesBtn');
        const statusFilterBar = document.getElementById('statusFilterBar');

        // Reset all views
        ordersView?.classList.add('hidden');
        stockView?.classList.add('hidden');
        standeesView?.classList.add('hidden');
        statusFilterBar?.classList.add('hidden');

        [tabOrdersBtn, tabStockBtn, tabStandeesBtn].forEach(b => {
            if (b) b.className = 'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition bg-stone-800 text-stone-400 hover:text-white flex items-center gap-1.5';
        });

        if (tab === 'orders') {
            ordersView?.classList.remove('hidden');
            statusFilterBar?.classList.remove('hidden');
            if (tabOrdersBtn) tabOrdersBtn.className = 'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition bg-brand-500 text-stone-950 shadow-md';
        } else if (tab === 'stock') {
            stockView?.classList.remove('hidden');
            if (tabStockBtn) tabStockBtn.className = 'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition bg-brand-500 text-stone-950 shadow-md';
            renderStockGrid();
        } else if (tab === 'standees') {
            standeesView?.classList.remove('hidden');
            if (tabStandeesBtn) tabStandeesBtn.className = 'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition bg-brand-500 text-stone-950 shadow-md flex items-center gap-1.5';
            window.generateTableStandees();
        }

        if (window.lucide) window.lucide.createIcons();
    };

    window.filterKdsStatus = function(status) {
        adminState.filterStatus = status;
        document.querySelectorAll('.status-pill').forEach(btn => {
            btn.classList.remove('bg-stone-700', 'text-white', 'font-bold');
            btn.classList.add('bg-stone-800', 'text-stone-300');
        });
        if (event && event.target) {
            event.target.classList.remove('bg-stone-800', 'text-stone-300');
            event.target.classList.add('bg-stone-700', 'text-white', 'font-bold');
        }
        renderTickets();
    };

    function updateMetrics() {
        const active = adminState.orders.filter(o => o.status === 'received' || o.status === 'preparing');
        const total = adminState.orders.length;
        const revenue = adminState.orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.total || 0), 0);

        const elActive = document.getElementById('statActiveCount');
        const elTotal = document.getElementById('statTotalOrders');
        const elBadge = document.getElementById('ticketCountBadge');
        const elRev = document.getElementById('statRevenue');

        if (elActive) elActive.textContent = active.length;
        if (elTotal) elTotal.textContent = total;
        if (elBadge) elBadge.textContent = active.length;
        if (elRev) elRev.textContent = `Le ${Math.round(revenue)}`;
    }

    function getTimeAgo(dateStr) {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / (60 * 1000));
        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 min ago';
        if (diffMins < 60) return `${diffMins}m ago`;
        return `${Math.floor(diffMins / 60)}h ago`;
    }

    function renderTickets() {
        const container = document.getElementById('ticketsGrid');
        const noOrders = document.getElementById('noOrdersState');
        if (!container) return;

        let filtered = adminState.orders.filter(order => {
            if (adminState.filterStatus === 'all') return true;
            if (adminState.filterStatus === 'dine_in') return order.customer.type === 'dine-in';
            return order.status === adminState.filterStatus;
        });

        if (filtered.length === 0) {
            container.innerHTML = '';
            noOrders?.classList.remove('hidden');
            return;
        } else {
            noOrders?.classList.add('hidden');
        }

        container.innerHTML = filtered.map(order => {
            const timeAgo = getTimeAgo(order.timestamp);
            const isDineIn = order.customer.type === 'dine-in';
            const isDelivery = order.customer.type === 'delivery';

            const statusConfig = {
                'awaiting_fee':   { label: '💬 Awaiting Delivery Fee', bg: 'bg-violet-500/20 text-violet-300 border border-violet-500/40 animate-pulse' },
                'fee_quoted':     { label: '📨 Fee Sent – Awaiting Customer', bg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' },
                'received':       { label: 'New Order', bg: 'bg-flame-500/20 text-flame-400 border border-flame-500/40 animate-pulse' },
                'preparing':      { label: 'Frying / Packing', bg: 'bg-brand-500/20 text-brand-300 border border-brand-500/40' },
                'out_for_delivery': { label: isDineIn ? 'Served to Table' : (isDelivery ? 'Dispatched Rider' : 'Ready at Counter'), bg: 'bg-blue-500/20 text-blue-300 border border-blue-500/40' },
                'completed':      { label: 'Completed', bg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
                'cancelled':      { label: 'Cancelled', bg: 'bg-stone-700 text-stone-400' }
            }[order.status] || { label: order.status, bg: 'bg-stone-700 text-white' };

            let actionBtnHtml = '';
            if (order.status === 'awaiting_fee') {
                actionBtnHtml = `
                    <div class="flex-1 bg-violet-950/60 border border-violet-500/40 rounded-2xl p-3">
                        <div class="text-[11px] font-bold text-violet-300 mb-1 flex items-center justify-between">
                            <span class="flex items-center gap-1.5"><span>💬</span> Quote WhatsApp Delivery Fee</span>
                            <span class="text-[10px] bg-violet-500/20 text-violet-300 font-extrabold px-2 py-0.5 rounded-full border border-violet-500/40 animate-pulse">Awaiting Quote</span>
                        </div>
                        <div class="text-[11px] text-stone-300 mb-2 bg-stone-900/80 p-2.5 rounded-xl border border-violet-900/40 space-y-0.5">
                            <div>👤 Customer: <strong class="text-white">${order.customer.name || 'WhatsApp Customer'}</strong></div>
                            <div>📍 Address: <strong class="text-amber-300">${order.customer.address}</strong></div>
                            <div class="text-[10px] text-stone-400">Order Subtotal: <strong class="text-brand-400 font-mono">Le ${order.subtotal}</strong></div>
                        </div>
                        <!-- Quick presets -->
                        <div class="flex items-center gap-1.5 mb-2 overflow-x-auto text-[10px] font-bold">
                            <span class="text-stone-400 text-[10px]">Presets:</span>
                            <button type="button" onclick="document.getElementById('fee-input-${order.id}').value=15" class="px-2 py-1 bg-stone-800 hover:bg-violet-900 text-stone-300 hover:text-white rounded-lg border border-stone-700 transition">Le 15</button>
                            <button type="button" onclick="document.getElementById('fee-input-${order.id}').value=25" class="px-2 py-1 bg-stone-800 hover:bg-violet-900 text-stone-300 hover:text-white rounded-lg border border-stone-700 transition">Le 25</button>
                            <button type="button" onclick="document.getElementById('fee-input-${order.id}').value=35" class="px-2 py-1 bg-stone-800 hover:bg-violet-900 text-stone-300 hover:text-white rounded-lg border border-stone-700 transition">Le 35</button>
                            <button type="button" onclick="document.getElementById('fee-input-${order.id}').value=50" class="px-2 py-1 bg-stone-800 hover:bg-violet-900 text-stone-300 hover:text-white rounded-lg border border-stone-700 transition">Le 50</button>
                        </div>
                        <div class="flex gap-2 items-center">
                            <div class="relative flex-1">
                                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Le</span>
                                <input id="fee-input-${order.id}" type="number" min="0" max="9999" placeholder="e.g. 25"
                                    class="w-full pl-9 pr-3 py-2 bg-stone-800 border border-violet-500/50 focus:border-violet-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                                    onkeydown="if(event.key==='Enter') window.sendDeliveryFeeQuote('${order.id}')">
                            </div>
                            <button onclick="window.sendDeliveryFeeQuote('${order.id}')"
                                class="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md whitespace-nowrap active:scale-95">
                                <span>📨 Send to Customer</span>
                            </button>
                        </div>
                    </div>
                `;
            } else if (order.status === 'fee_quoted') {
                actionBtnHtml = `
                    <div class="flex-1 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-3 text-xs text-cyan-300 font-semibold flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <span>📨</span>
                            <span>Quoted: <strong class="text-white font-mono">Le ${order.deliveryFee}</strong> — Waiting for customer confirmation on WhatsApp…</span>
                        </div>
                        <button onclick="window.advanceOrderStatus('${order.id}', 'awaiting_fee')" class="text-[10px] px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded border border-stone-600">Edit</button>
                    </div>
                `;
            } else if (order.status === 'received') {
                actionBtnHtml = `
                    <button onclick="window.advanceOrderStatus('${order.id}', 'preparing')" class="flex-1 py-2.5 bg-brand-500 hover:bg-brand-400 text-stone-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md">
                        <i data-lucide="flame" class="w-3.5 h-3.5"></i>
                        <span>Start Frying</span>
                    </button>
                `;
            } else if (order.status === 'preparing') {
                actionBtnHtml = `
                    <button onclick="window.advanceOrderStatus('${order.id}', 'out_for_delivery')" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md">
                        <i data-lucide="${isDineIn ? 'utensils' : 'bike'}" class="w-3.5 h-3.5"></i>
                        <span>${isDineIn ? `Serve to Table ${order.customer.table || ''}` : (isDelivery ? 'Hand to Rider' : 'Ready for Counter')}</span>
                    </button>
                `;
            } else if (order.status === 'out_for_delivery') {
                actionBtnHtml = `
                    <button onclick="window.advanceOrderStatus('${order.id}', 'completed')" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i>
                        <span>Mark Completed</span>
                    </button>
                `;
            }

            // Fulfillment Badge
            let fulfillmentBadge = '';
            if (isDineIn) {
                fulfillmentBadge = `
                    <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-flame-600 text-white shadow-md flex items-center gap-1">
                        <span>🍽️ TABLE ${order.customer.table || '1'}</span>
                    </span>
                `;
            } else if (isDelivery) {
                fulfillmentBadge = `
                    <span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        🛵 Delivery (Call 392)
                    </span>
                `;
            } else {
                fulfillmentBadge = `
                    <span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-stone-700 text-stone-200">
                        🛍️ Counter Pickup
                    </span>
                `;
            }

            return `
                <div class="bg-stone-800/90 rounded-3xl border ${isDineIn ? 'border-amber-500/40' : 'border-stone-700/80'} p-5 flex flex-col justify-between shadow-xl transition-all hover:border-stone-600">
                    <div>
                        <!-- Ticket Header -->
                        <div class="flex items-start justify-between pb-3 border-b border-stone-700/80 mb-3">
                            <div>
                                <div class="flex items-center space-x-2">
                                    <span class="font-mono font-black text-lg text-white">${order.id}</span>
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusConfig.bg}">
                                        ${statusConfig.label}
                                    </span>
                                </div>
                                <span class="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                                    <i data-lucide="clock" class="w-3 h-3 text-brand-400"></i> ${timeAgo}
                                </span>
                            </div>
                            ${fulfillmentBadge}
                        </div>

                        <!-- Customer Details -->
                        <div class="bg-stone-900/60 rounded-2xl p-3 mb-3 border border-stone-800 text-xs space-y-1">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-white">${order.customer.name}</span>
                                <a href="tel:${order.customer.phone}" class="text-brand-400 hover:underline flex items-center gap-1">
                                    <i data-lucide="phone-call" class="w-3 h-3"></i> ${order.customer.phone}
                                </a>
                            </div>
                            <div class="text-stone-400 text-[11px] truncate">
                                <i data-lucide="${isDineIn ? 'map-pin' : 'navigation'}" class="w-3 h-3 inline text-flame-400 mr-1"></i>
                                ${isDineIn ? `In-Restaurant Dining: Table ${order.customer.table || '1'}` : order.customer.address}
                            </div>
                            ${order.customer.notes ? `
                                <div class="text-amber-300 text-[11px] italic bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                                    "${order.customer.notes}"
                                </div>
                            ` : ''}
                        </div>

                        <!-- Items ordered -->
                        <div class="space-y-2 mb-4">
                            <div class="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Kitchen Order Items</div>
                            ${order.items.map(it => `
                                <div class="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 flex items-start justify-between">
                                    <div class="flex items-start space-x-2">
                                        <span class="font-mono font-black text-brand-400 text-sm">${it.quantity}x</span>
                                        <div>
                                            <div class="text-xs font-bold text-white">${it.name}</div>
                                            ${it.options ? `<div class="text-[10px] text-amber-300 font-semibold mt-0.5">${it.options}</div>` : ''}
                                            ${it.sauces && it.sauces.length > 0 ? `<div class="text-[10px] text-stone-400 mt-0.5">+ Sauces: ${it.sauces.join(', ')}</div>` : ''}
                                        </div>
                                    </div>
                                    <span class="font-mono text-xs text-stone-400">Le ${it.price}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="pt-3 border-t border-stone-700/80">
                        <div class="flex items-center justify-between text-xs mb-3 font-semibold text-stone-400">
                            <span>Paid via: <strong class="text-white">${order.paymentMethod}</strong></span>
                            <span class="font-mono font-black text-white text-sm">Le ${order.total}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            ${actionBtnHtml}
                            ${order.status !== 'cancelled' && order.status !== 'completed' ? `
                                <button onclick="window.cancelOrder('${order.id}')" title="Cancel order" class="p-2.5 rounded-xl bg-stone-700 hover:bg-flame-600/30 hover:text-flame-400 text-stone-400 transition">
                                    <i data-lucide="x" class="w-4 h-4"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    window.sendDeliveryFeeQuote = function(orderId) {
        const input = document.getElementById(`fee-input-${orderId}`);
        if (!input) return;
        const fee = parseFloat(input.value);
        if (isNaN(fee) || fee < 0) {
            alert('Please enter a valid delivery fee in Leones (e.g. 25).');
            return;
        }

        const order = adminState.orders.find(o => o.id === orderId);
        if (!order) return;

        order.deliveryFee = fee;
        order.total = order.subtotal + fee;
        order.status = 'fee_quoted';
        order.feeQuotedAt = new Date().toISOString();

        localStorage.setItem('ct_orders', JSON.stringify(adminState.orders));
        localStorage.setItem('ct_fee_quote_event', JSON.stringify({
            orderId: order.id,
            phone: order.customer.phone,
            deliveryFee: fee,
            subtotal: order.subtotal,
            total: order.total,
            address: order.customer.address,
            timestamp: Date.now()
        }));

        updateMetrics();
        renderTickets();
        window.dispatchEvent(new Event('storage'));
    };

    window.advanceOrderStatus = function(orderId, newStatus) {
        const order = adminState.orders.find(o => o.id === orderId);
        if (!order) return;
        order.status = newStatus;
        localStorage.setItem('ct_orders', JSON.stringify(adminState.orders));
        updateMetrics();
        renderTickets();
        window.dispatchEvent(new Event('storage'));
    };

    window.cancelOrder = function(orderId) {
        if (!confirm(`Are you sure you want to cancel order ${orderId}?`)) return;
        window.advanceOrderStatus(orderId, 'cancelled');
    };

    // ==========================================
    // MENU ITEMS & PHOTO EDITING
    // ==========================================
    const STOCK_CATEGORIES = [
        { id: 'all', name: 'All Items' },
        { id: 'deals', name: 'Meal Deals' },
        { id: 'burgers_wraps', name: 'Burgers & Wraps' },
        { id: 'chicken', name: 'Fried & BBQ' },
        { id: 'fowls', name: 'Pepper Fowls' },
        { id: 'celebration', name: 'Celebration' },
        { id: 'sides', name: 'Sides & Rice' },
        { id: 'desserts', name: 'Ice Cream' },
        { id: 'drinks', name: 'Drinks & Beers' },
        { id: 'sauces', name: 'Extra Sauces' }
    ];

    function renderStockCategoryPills() {
        const bar = document.getElementById('stockCategoryFilterBar');
        if (!bar) return;

        bar.innerHTML = STOCK_CATEGORIES.map(cat => {
            const count = cat.id === 'all' 
                ? adminState.menuItems.length 
                : adminState.menuItems.filter(m => m.category === cat.id).length;
            const isActive = adminState.stockCategory === cat.id;
            const activeClass = isActive 
                ? 'bg-brand-500 text-stone-950 font-black shadow-md' 
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold border border-stone-700';

            return `
                <button type="button" onclick="window.filterStockCategory('${cat.id}')" 
                    class="px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center space-x-1.5 ${activeClass}">
                    <span>${cat.name}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-stone-950 text-white font-mono font-bold' : 'bg-stone-900 text-stone-400 font-mono'}">${count}</span>
                </button>
            `;
        }).join('');
    }

    window.filterStockCategory = function(catId) {
        adminState.stockCategory = catId;
        renderStockCategoryPills();
        renderStockGrid();
    };

    window.filterStockSearch = function(query) {
        adminState.stockSearch = (query || '').trim().toLowerCase();
        renderStockGrid();
    };

    window.resetMenuToOfficial = function() {
        if (!confirm('Are you sure you want to restore all 59 official menu items, drinks, and sauces? Any custom changes or images will be reset to default.')) return;
        localStorage.setItem('ct_custom_menu', JSON.stringify(DEFAULT_MENU_ITEMS));
        adminState.menuItems = JSON.parse(JSON.stringify(DEFAULT_MENU_ITEMS));
        adminState.soldOutItems = [];
        localStorage.removeItem('ct_sold_out');
        renderStockCategoryPills();
        renderStockGrid();
        window.dispatchEvent(new Event('storage'));
        alert('✓ Menu successfully restored to official Chicken Town SL defaults (59 items including drinks & sauces)!');
    };

    function renderStockGrid() {
        const grid = document.getElementById('stockGrid');
        if (!grid) return;

        renderStockCategoryPills();

        const query = adminState.stockSearch || '';
        const filtered = adminState.menuItems.filter(item => {
            const matchCat = adminState.stockCategory === 'all' || item.category === adminState.stockCategory;
            const matchSearch = !query || 
                item.name.toLowerCase().includes(query) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query));
            return matchCat && matchSearch;
        });

        // Update summary badges
        const countSummary = document.getElementById('stockCountSummary');
        const soldSummary = document.getElementById('stockSoldOutSummary');
        const totalBadge = document.getElementById('stockTotalBadge');

        const soldOutCount = adminState.soldOutItems.length;
        if (countSummary) {
            countSummary.textContent = `Showing ${filtered.length} of ${adminState.menuItems.length} menu items`;
        }
        if (soldSummary) {
            soldSummary.textContent = soldOutCount > 0 ? `(${soldOutCount} marked Sold Out)` : '';
        }
        if (totalBadge) {
            totalBadge.textContent = `${adminState.menuItems.length} ITEMS`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-12 text-center text-stone-500 bg-stone-900/50 rounded-2xl border border-dashed border-stone-800">
                    <p class="text-sm">No items match your filter criteria.</p>
                    <button onclick="window.filterStockCategory('all')" class="mt-2 text-xs text-brand-400 underline font-bold">Show all items</button>
                </div>
            `;
            return;
        }

        const categoryLabels = {
            deals: 'MEAL DEAL',
            burgers_wraps: 'BURGER/WRAP',
            chicken: 'CHICKEN',
            fowls: 'PEPPER FOWL',
            celebration: 'CELEBRATION',
            sides: 'SIDE / RICE',
            desserts: 'ICE CREAM',
            drinks: 'DRINK / BEER',
            sauces: 'EXTRA SAUCE'
        };

        grid.innerHTML = filtered.map(item => {
            const isSoldOut = adminState.soldOutItems.includes(item.id);
            const catLabel = categoryLabels[item.category] || (item.category || '').toUpperCase();

            return `
                <div class="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between gap-3 relative group transition hover:border-stone-700">
                    <div class="flex items-start space-x-3">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-stone-700 bg-stone-800" onerror="this.src='https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80'">
                        <div class="flex-1 min-w-0">
                            <h4 class="text-xs font-bold text-white truncate font-display" title="${item.name}">${item.name}</h4>
                            <span class="text-xs text-brand-400 font-mono font-bold block mt-0.5">Le ${item.price}</span>
                            <span class="text-[9px] text-stone-400 bg-stone-800 border border-stone-700 px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-1 font-mono">${catLabel}</span>
                        </div>
                    </div>

                    <div class="flex items-center space-x-2 pt-2 border-t border-stone-800">
                        <!-- Toggle stock -->
                        <button onclick="window.toggleStock('${item.id}')" class="flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                            isSoldOut 
                            ? 'bg-flame-600/20 text-flame-400 border border-flame-600/40 hover:bg-flame-600/30' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        }">
                            ${isSoldOut ? '✕ Sold Out' : '✓ In Stock'}
                        </button>

                        <!-- Edit Item & Photo -->
                        <button onclick="window.openItemEditModal('${item.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition flex items-center gap-1 active:scale-95">
                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                            <span>Edit</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    window.toggleStock = function(itemId) {
        const idx = adminState.soldOutItems.indexOf(itemId);
        if (idx > -1) {
            adminState.soldOutItems.splice(idx, 1);
        } else {
            adminState.soldOutItems.push(itemId);
        }
        localStorage.setItem('ct_sold_out', JSON.stringify(adminState.soldOutItems));
        renderStockGrid();
        window.dispatchEvent(new Event('storage'));
    };

    window.openItemEditModal = function(itemId) {
        adminState.editingItemId = itemId;
        const modal = document.getElementById('itemEditModalBackdrop');
        const title = document.getElementById('modalEditTitle');
        const btnDelete = document.getElementById('btnDeleteItem');
        const preview = document.getElementById('editImagePreview');
        const noPrev = document.getElementById('noPreviewText');

        if (itemId) {
            const item = adminState.menuItems.find(m => m.id === itemId);
            if (!item) return;

            title.textContent = 'Edit Menu Dish / Combo';
            document.getElementById('editItemId').value = item.id;
            document.getElementById('editItemName').value = item.name;
            document.getElementById('editItemPrice').value = item.price;
            document.getElementById('editItemCategory').value = item.category || 'chicken';
            document.getElementById('editItemImageUrl').value = item.image || '';
            document.getElementById('editItemBadge').value = item.badge || '';
            document.getElementById('editItemDesc').value = item.description || '';

            if (item.image) {
                preview.src = item.image;
                preview.classList.remove('hidden');
                noPrev.classList.add('hidden');
            } else {
                preview.classList.add('hidden');
                noPrev.classList.remove('hidden');
            }

            btnDelete.classList.remove('hidden');
        } else {
            title.textContent = 'Add New Dish to Menu';
            document.getElementById('editItemId').value = '';
            document.getElementById('editItemName').value = '';
            document.getElementById('editItemPrice').value = '';
            document.getElementById('editItemCategory').value = 'chicken';
            document.getElementById('editItemImageUrl').value = 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80';
            document.getElementById('editItemBadge').value = '';
            document.getElementById('editItemDesc').value = '';

            preview.src = 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80';
            preview.classList.remove('hidden');
            noPrev.classList.add('hidden');

            btnDelete.classList.add('hidden');
        }

        modal?.classList.remove('hidden');
    };

    window.closeItemEditModal = function() {
        document.getElementById('itemEditModalBackdrop')?.classList.add('hidden');
        adminState.editingItemId = null;
    };

    window.handleImageUpload = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const statusText = document.getElementById('uploadStatusText');
        if (statusText) statusText.textContent = 'Optimizing image...';

        const reader = new FileReader();
        reader.onload = function(evt) {
            const rawDataUrl = evt.target.result;
            // Compress with Canvas to max 700x700 px JPEG at 0.78 quality (~35-60KB)
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const maxDim = 700;
                let width = img.width;
                let height = img.height;

                if (width > height && width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);

                document.getElementById('editItemImageUrl').value = compressedDataUrl;
                const preview = document.getElementById('editImagePreview');
                const noPrev = document.getElementById('noPreviewText');
                if (preview) {
                    preview.src = compressedDataUrl;
                    preview.classList.remove('hidden');
                }
                if (noPrev) noPrev.classList.add('hidden');
                if (statusText) statusText.textContent = '✓ Ready to save';
            };
            img.onerror = function() {
                document.getElementById('editItemImageUrl').value = rawDataUrl;
                if (statusText) statusText.textContent = '✓ Loaded';
            };
            img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
    };

    window.saveMenuItem = function(e) {
        e.preventDefault();

        const id = document.getElementById('editItemId').value.trim() || `ct-item-${Date.now()}`;
        const name = document.getElementById('editItemName').value.trim();
        const price = parseFloat(document.getElementById('editItemPrice').value) || 0;
        const category = document.getElementById('editItemCategory').value;
        const image = document.getElementById('editItemImageUrl').value.trim() || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80';
        const badge = document.getElementById('editItemBadge').value.trim() || null;
        const description = document.getElementById('editItemDesc').value.trim();

        const newItem = { id, name, price, category, image, badge, description };

        const existingIdx = adminState.menuItems.findIndex(m => m.id === id);
        if (existingIdx > -1) {
            adminState.menuItems[existingIdx] = { ...adminState.menuItems[existingIdx], ...newItem };
        } else {
            adminState.menuItems.unshift(newItem);
        }

        try {
            localStorage.setItem('ct_custom_menu', JSON.stringify(adminState.menuItems));
            renderStockGrid();
            window.closeItemEditModal();

            // Dispatch sync event to other tabs (storefront index.html)
            window.dispatchEvent(new Event('storage'));
            alert(`✓ "${name}" saved successfully!`);
        } catch (err) {
            console.error('Failed to save menu items to localStorage:', err);
            alert('⚠️ Storage limit exceeded. Please use an image URL or smaller image file.');
        }
    };

    window.deleteMenuItem = function() {
        if (!adminState.editingItemId) return;
        if (!confirm('Are you sure you want to remove this dish from the menu?')) return;

        adminState.menuItems = adminState.menuItems.filter(m => m.id !== adminState.editingItemId);
        localStorage.setItem('ct_custom_menu', JSON.stringify(adminState.menuItems));
        renderStockGrid();
        window.closeItemEditModal();

        window.dispatchEvent(new Event('storage'));
    };

    // ==========================================
    // DINE-IN TABLE QR STANDEES GENERATOR
    // ==========================================
    window.generateTableStandees = function() {
        const container = document.getElementById('printable-standees');
        if (!container) return;

        const start = parseInt(document.getElementById('qrStartTable')?.value) || 1;
        const end = parseInt(document.getElementById('qrEndTable')?.value) || 12;

        // Base URL pointing to customer storefront with ?table=X
        const currentUrl = window.location.href.split('?')[0].replace('admin.html', '').replace(/\/$/, '');
        const baseUrl = currentUrl || 'http://localhost:5000';

        let html = '';
        for (let t = start; t <= end; t++) {
            const tableFormatted = t < 10 ? `0${t}` : `${t}`;
            const targetUrl = `${baseUrl}/?table=${t}`;
            const qrSvg = window.generateQRCodeSVG ? window.generateQRCodeSVG(targetUrl, 160) : '';

            html += `
                <div class="table-standee-card bg-white text-stone-900 rounded-3xl p-6 border-2 border-stone-300 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                    <!-- Top Gold Flame Accent -->
                    <div class="w-full h-3 bg-gradient-to-r from-amber-500 via-brand-500 to-flame-600 absolute top-0 left-0"></div>

                    <!-- Logo & Brand Header -->
                    <div class="mt-2 mb-3">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-flame-600 to-brand-500 flex items-center justify-center text-white mx-auto shadow-md mb-1.5">
                            <span class="text-2xl">🍗</span>
                        </div>
                        <h2 class="font-black text-xl tracking-tight font-display text-stone-950 leading-none">CHICKEN TOWN</h2>
                        <span class="text-[10px] font-black uppercase tracking-widest text-brand-600">SWIT U MOT • SWIT U LYF</span>
                    </div>

                    <!-- Table Number Badge -->
                    <div class="my-2 bg-stone-950 text-white px-5 py-1.5 rounded-full shadow-inner">
                        <span class="text-xs font-black uppercase tracking-wider text-amber-400">TABLE ${tableFormatted}</span>
                    </div>

                    <!-- QR Code Canvas / SVG -->
                    <div class="p-3 bg-white border-2 border-dashed border-stone-300 rounded-2xl shadow-sm my-3 flex items-center justify-center">
                        ${qrSvg}
                    </div>

                    <!-- Instructions Call to Action -->
                    <div class="space-y-1 mb-2">
                        <h4 class="font-extrabold text-sm text-stone-900 font-display">SCAN TO ORDER & PAY</h4>
                        <p class="text-[11px] text-stone-600 max-w-[220px] leading-tight">
                            Open your phone camera, scan this QR code, and order food served hot to this table!
                        </p>
                    </div>

                    <!-- Bottom Perks -->
                    <div class="w-full pt-3 mt-3 border-t border-stone-200 grid grid-cols-2 text-[10px] font-bold text-stone-500">
                        <span>⚡ Zero Wait Time</span>
                        <span>📶 Free Guest Wi-Fi</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    };

    window.printStandees = function() {
        // Switch to standees tab if not already on it
        window.switchAdminTab('standees');
        setTimeout(() => {
            window.print();
        }, 200);
    };

    // Live preview input listener for Image URL
    document.getElementById('editItemImageUrl')?.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const preview = document.getElementById('editImagePreview');
        const noPrev = document.getElementById('noPreviewText');
        if (val) {
            preview.src = val;
            preview.classList.remove('hidden');
            noPrev.classList.add('hidden');
        } else {
            preview.classList.add('hidden');
            noPrev.classList.remove('hidden');
        }
    });

    // ==========================================
    // STAFF AUTHENTICATION & LOCK SCREEN
    // ==========================================
    const DEFAULT_STAFF_PIN = '3920';

    function getStaffPin() {
        return localStorage.getItem('ct_admin_pin') || DEFAULT_STAFF_PIN;
    }

    function checkStaffAuth() {
        const overlay = document.getElementById('staffLockOverlay');
        const isAuth = sessionStorage.getItem('ct_staff_auth') === 'true';
        if (isAuth) {
            overlay?.classList.add('hidden');
        } else {
            overlay?.classList.remove('hidden');
            const input = document.getElementById('staffPinInput');
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    }

    window.enterPinDigit = function(digit) {
        const input = document.getElementById('staffPinInput');
        if (!input) return;
        if (input.value.length < 6) {
            input.value += digit;
        }
        document.getElementById('pinErrorMsg')?.classList.add('hidden');
        if (input.value.length === 4) {
            window.handleStaffUnlock();
        }
    };

    window.clearPinInput = function() {
        const input = document.getElementById('staffPinInput');
        if (input) input.value = '';
        document.getElementById('pinErrorMsg')?.classList.add('hidden');
        input?.focus();
    };

    window.handleStaffUnlock = function(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('staffPinInput');
        const pin = (input?.value || '').trim();
        const validPin = getStaffPin();

        if (pin === validPin) {
            sessionStorage.setItem('ct_staff_auth', 'true');
            document.getElementById('staffLockOverlay')?.classList.add('hidden');
            document.getElementById('pinErrorMsg')?.classList.add('hidden');
            if (adminState.soundEnabled) sound.playKitchenBell();
        } else {
            document.getElementById('pinErrorMsg')?.classList.remove('hidden');
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    };

    window.lockStaffPortal = function() {
        sessionStorage.removeItem('ct_staff_auth');
        checkStaffAuth();
    };

    window.openSettingsModal = function() {
        const phone = localStorage.getItem('ct_whatsapp_phone') || '+232 80 600 700';
        const pin = localStorage.getItem('ct_admin_pin') || DEFAULT_STAFF_PIN;
        const orange = localStorage.getItem('ct_orange_merchant') || '3920';
        const africell = localStorage.getItem('ct_africell_merchant') || '3920';

        const phoneInput = document.getElementById('settingWhatsappPhone');
        const pinInput = document.getElementById('settingStaffPin');
        const orangeInput = document.getElementById('settingOrangeMerchant');
        const africellInput = document.getElementById('settingAfricellMerchant');

        if (phoneInput) phoneInput.value = phone;
        if (pinInput) pinInput.value = pin;
        if (orangeInput) orangeInput.value = orange;
        if (africellInput) africellInput.value = africell;

        document.getElementById('storeSettingsModal')?.classList.remove('hidden');
    };

    window.closeSettingsModal = function() {
        document.getElementById('storeSettingsModal')?.classList.add('hidden');
    };

    window.saveStoreSettings = function(e) {
        if (e) e.preventDefault();
        const phone = document.getElementById('settingWhatsappPhone')?.value.trim();
        const pin = document.getElementById('settingStaffPin')?.value.trim();
        const orange = document.getElementById('settingOrangeMerchant')?.value.trim();
        const africell = document.getElementById('settingAfricellMerchant')?.value.trim();

        if (phone) {
            localStorage.setItem('ct_whatsapp_phone', phone);
        }
        if (pin && pin.length >= 4) {
            localStorage.setItem('ct_admin_pin', pin);
        }
        if (orange) {
            localStorage.setItem('ct_orange_merchant', orange);
        }
        if (africell) {
            localStorage.setItem('ct_africell_merchant', africell);
        }

        window.closeSettingsModal();
        alert('✓ Settings saved successfully!');
    };

    document.addEventListener('DOMContentLoaded', () => {
        checkStaffAuth();
        updateMetrics();
        renderTickets();
        startClock();
        setupStorageListener();
        if (window.lucide) window.lucide.createIcons();
    });
})();

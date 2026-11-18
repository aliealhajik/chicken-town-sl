// Chicken Town SL - WhatsApp Automated Ordering Bot Engine (Meta Cloud API compliant)
// Supports:
//   - Multi-unit quantity selection (e.g. 1, 2, 3, or typed 99)
//   - Delivery vs Counter Pickup choice
//   - Interactive Real-Time Cashier Delivery Fee Quote Handshake
//   - Full Kitchen Display System (KDS) order dispatch

const userSessions = {};

export const RESTAURANT_CONFIG = {
    name: "Chicken Town SL",
    tagline: "SWIT U MOT SWIT U LYF",
    phone: "+232 80 600 700",
    hotline: "392",
    currency: "Le",
    webAppUrl: "http://localhost:5000/"
};

export const MENU = {
    deals: [
        { id: 'deal-family',          name: 'Family Deal',          price: 499, isCombo: true,  desc: '4 Fried Wings + 2 CT Burgers + 2 CT Wraps + 2 Sides + 2 Soft Drinks' },
        { id: 'deal-classic-box',     name: 'Classic Box',          price: 150, isCombo: true,  desc: '2 Fried Drumsticks + 1 Side + 1 Soft Drink' },
        { id: 'deal-bbq-wings-meal',  name: 'BBQ Wings Meal',       price: 155, isCombo: true,  desc: '4 BBQ Wings + 1 Side + 1 Soft Drink' },
        { id: 'deal-fried-wings-meal',name: 'Fried Wings Meal',     price: 155, isCombo: true,  desc: '4 Fried Wings + 1 Side + 1 Soft Drink' },
        { id: 'deal-snack-box',       name: 'Snack Box',            price: 99,  isCombo: true,  desc: '1 Fried Drumstick + 1 Side + 1 Soft Drink' }
    ],
    burgers: [
        { id: 'burg-ct-burger',   name: 'CT Burger',        price: 90,  desc: 'Crispy patty + CT sauce + salad' },
        { id: 'burg-frontline',   name: 'Frontline Burger', price: 110, desc: 'Crispy patty + fried egg + CT sauce + salad' },
        { id: 'burg-ct-combo',    name: 'CT Burger Combo',  price: 150, isCombo: true, desc: '1 Burger + Chips or Rice + 1 Soft Drink' },
        { id: 'wrap-ct-wrap',     name: 'CT Wrap',          price: 90,  desc: 'Crispy diced chicken + signature CT sauce' },
        { id: 'wrap-ct-combo',    name: 'CT Wrap Combo',    price: 145, isCombo: true, desc: '1 Wrap + Chips or Rice + 1 Soft Drink' }
    ],
    chicken: [
        { id: 'chick-1-drumstick', name: '1 Fried Drumstick',  price: 45  },
        { id: 'chick-3-drumsticks',name: '3 Fried Drumsticks', price: 130 },
        { id: 'chick-1-wing',      name: '1 Fried Wing',       price: 25  },
        { id: 'chick-4-wings',     name: '4 Fried Wings',      price: 90  },
        { id: 'bbq-1-wing',        name: '1 BBQ Wing',         price: 25  },
        { id: 'bbq-4-wings',       name: '4 BBQ Wings',        price: 100 },
        { id: 'bbq-1-drumstick',   name: '1 BBQ Drumstick',    price: 50  },
        { id: 'chick-3-strips',    name: '3 Boneless Strips',  price: 75  },
        { id: 'chick-6-strips',    name: '6 Boneless Strips',  price: 140 },
        { id: 'chick-6-nuggets',   name: '6 Chicken Nuggets',  price: 45  }
    ],
    fowls: [
        { id: 'fowl-english-whole', name: 'English Fowl - Whole Chicken', price: 300, desc: 'Pepper Chicken (English breed)' },
        { id: 'fowl-english-half',  name: 'English Fowl - Half Chicken',  price: 160, desc: 'Pepper Chicken (English breed)' },
        { id: 'fowl-kontri-whole',  name: 'Kontri Fowl - Whole Chicken',  price: 320, desc: 'Pepper Chicken (Local breed)'   },
        { id: 'fowl-kontri-half',   name: 'Kontri Fowl - Half Chicken',   price: 160, desc: 'Pepper Chicken (Local breed)'   }
    ],
    sides: [
        { id: 'side-chips',          name: 'Crispy Chips',                   price: 45  },
        { id: 'side-chips-masala',   name: 'Chips Masala',                   price: 55  },
        { id: 'side-plantain',       name: 'Fried Sweet Plantain',           price: 50  },
        { id: 'side-jollof',         name: 'Jollof Rice (Plain)',             price: 50  },
        { id: 'side-fried-rice',     name: 'Fried Rice (Plain)',              price: 50  },
        { id: 'side-jollof-chicken', name: 'Jollof Rice + Shredded Chicken', price: 70  },
        { id: 'side-fried-chicken',  name: 'Fried Rice + Shredded Chicken',  price: 70  },
        { id: 'side-salad',          name: 'Side Salad',                     price: 65  },
        { id: 'side-ct-salad',       name: 'Chicken Town Salad',             price: 110 },
        { id: 'mami-meal',           name: 'Mami Meal (Rice + Stew + Egg)',  price: 30  }
    ],
    drinks: [
        { id: 'drink-vimto-plastic',  name: 'Vimto (Plastic 300ml)',    price: 15 },
        { id: 'drink-coke-plastic',   name: 'Coca Cola (Plastic 300ml)',price: 15 },
        { id: 'drink-fanta-plastic',  name: 'Fanta (Plastic 300ml)',     price: 15 },
        { id: 'drink-sprite-plastic', name: 'Sprite (Plastic 300ml)',    price: 15 },
        { id: 'drink-water-big',      name: 'Mineral Water Big 1.5L',   price: 20 },
        { id: 'drink-water-small',    name: 'Mineral Water Small 500ml',price: 10 }
    ]
};

const COMBO_SIDES = ['Crispy Chips', 'Plain Jollof Rice', 'Fried Rice'];
const COMBO_DRINKS = ['Coca Cola', 'Fanta Orange', 'Sprite', 'Vimto'];

export function getSession(userId) {
    if (!userSessions[userId]) {
        userSessions[userId] = {
            step: 'WELCOME',
            cart: [],
            pendingItem: null,
            orderType: null,
            name: '',
            address: '',
            deliveryFee: null,
            pendingOrderId: null,
            phone: userId
        };
    }
    return userSessions[userId];
}

export function resetSession(userId) {
    userSessions[userId] = {
        step: 'WELCOME',
        cart: [],
        pendingItem: null,
        orderType: null,
        name: '',
        address: '',
        deliveryFee: null,
        pendingOrderId: null,
        phone: userId
    };
}

/**
 * Handle incoming message from customer
 */
export function handleIncomingWhatsAppMessage(userId, input) {
    const session = getSession(userId);
    const cleanInput = (input || '').trim();
    const lower = cleanInput.toLowerCase();

    // Universal restart keywords
    if (['hi', 'hello', 'menu', 'restart', 'start', 'order'].includes(lower) || cleanInput === 'START_OVER') {
        resetSession(userId);
        return generateWelcomeMenu();
    }

    // Step 1: Welcome
    if (session.step === 'WELCOME') {
        if (cleanInput === 'OPT_HYBRID_WEB') {
            return {
                type: 'text',
                text: `🍗 *CHICKEN TOWN SL — 1-TAP VISUAL MENU*\n\nTap below to open our interactive visual menu with pictures, customize combos, and order:\n\n👉 *${RESTAURANT_CONFIG.webAppUrl}*\n\nFast delivery across Freetown! 🛵`
            };
        }
        if (cleanInput === 'OPT_CHAT_ORDER') {
            session.step = 'CHOOSE_CATEGORY';
            return generateCategoryList();
        }
        if (cleanInput === 'OPT_CALL_DISPATCH') {
            return {
                type: 'text',
                text: `📞 *CHICKEN TOWN HOTLINES*\n\n⚡ Delivery Shortcode: *${RESTAURANT_CONFIG.hotline}*\n📱 Catering / WhatsApp: *${RESTAURANT_CONFIG.phone}*\n📍 24 Wilkinson Road, Freetown\n\nOpen daily 11:00 AM – 11:00 PM!`
            };
        }
        return generateWelcomeMenu();
    }

    // Step 2: Category
    if (session.step === 'CHOOSE_CATEGORY') {
        const catKey = cleanInput.replace('CAT_', '').toLowerCase();
        if (MENU[catKey]) {
            session.step = 'CHOOSE_ITEM';
            session.currentCategory = catKey;
            return generateItemList(catKey);
        }
        return generateCategoryList('Please select a valid menu category:');
    }

    // Step 3: Item
    if (session.step === 'CHOOSE_ITEM') {
        if (cleanInput === 'BACK_CATEGORIES') {
            session.step = 'CHOOSE_CATEGORY';
            return generateCategoryList();
        }

        let selectedItem = null;
        for (const cat in MENU) {
            const found = MENU[cat].find(i => i.id === cleanInput || i.name.toLowerCase() === lower);
            if (found) { selectedItem = found; break; }
        }

        if (selectedItem) {
            session.pendingItem = { ...selectedItem, qty: 1, side: null, drink: null };
            session.step = 'ASK_QUANTITY';
            return {
                type: 'interactive_buttons',
                header: `🍗 ${selectedItem.name}`,
                body: `Price: *Le ${selectedItem.price}* each\n${selectedItem.desc ? `_${selectedItem.desc}_\n` : ''}\nHow many would you like to order?`,
                buttons: [
                    { id: 'QTY_1', title: '× 1' },
                    { id: 'QTY_2', title: '× 2' },
                    { id: 'QTY_3', title: '× 3' }
                ],
                footer: 'Or type any quantity (e.g. 5, 10, 99) and send'
            };
        }
        return generateItemList(session.currentCategory || 'deals', 'Item not found. Please choose from the list:');
    }

    // Step 4: Quantity
    if (session.step === 'ASK_QUANTITY') {
        let qty = /^QTY_(\d+)$/.test(cleanInput) ? parseInt(cleanInput.replace('QTY_', '')) : parseInt(cleanInput);
        if (!qty || qty < 1 || qty > 999) {
            return {
                type: 'interactive_buttons',
                header: `🍗 ${session.pendingItem.name}`,
                body: `Please choose a quantity between 1 and 999:`,
                buttons: [
                    { id: 'QTY_1', title: '× 1' },
                    { id: 'QTY_2', title: '× 2' },
                    { id: 'QTY_3', title: '× 3' }
                ]
            };
        }

        session.pendingItem.qty = qty;

        if (session.pendingItem.isCombo) {
            session.step = 'CHOOSE_COMBO_SIDE';
            return {
                type: 'interactive_buttons',
                header: `🍗 ${session.pendingItem.name} × ${qty}`,
                body: `This combo meal includes a choice of side and drink.\n\nPlease choose your side:`,
                buttons: COMBO_SIDES.map((side, idx) => ({ id: `SIDE_${idx}`, title: side }))
            };
        } else {
            addToCart(session);
            session.step = 'CART_REVIEW';
            return generateCartReview(session);
        }
    }

    // Step 5: Combo customization
    if (session.step === 'CHOOSE_COMBO_SIDE') {
        const sideIdx = parseInt(cleanInput.replace('SIDE_', ''));
        session.pendingItem.side = COMBO_SIDES[sideIdx] || COMBO_SIDES[0];
        session.step = 'CHOOSE_COMBO_DRINK';
        return {
            type: 'interactive_buttons',
            header: `🥤 Choose Your Soft Drink`,
            body: `Selected side: *${session.pendingItem.side}*\nNow pick your 300ml soft drink:`,
            buttons: COMBO_DRINKS.map((drk, idx) => ({ id: `DRK_${idx}`, title: drk }))
        };
    }

    if (session.step === 'CHOOSE_COMBO_DRINK') {
        const drkIdx = parseInt(cleanInput.replace('DRK_', ''));
        session.pendingItem.drink = COMBO_DRINKS[drkIdx] || COMBO_DRINKS[0];
        addToCart(session);
        session.step = 'CART_REVIEW';
        return generateCartReview(session);
    }

    // Step 6: Cart review
    if (session.step === 'CART_REVIEW') {
        if (cleanInput === 'ADD_MORE_ITEMS') {
            session.step = 'CHOOSE_CATEGORY';
            return generateCategoryList();
        }
        if (cleanInput === 'PROCEED_CHECKOUT') {
            session.step = 'ASK_ORDER_TYPE';
            const subtotal = session.cart.reduce((s, it) => s + it.price * it.qty, 0);
            return {
                type: 'interactive_buttons',
                header: '🛵 Receiving Options',
                body: `Order subtotal: *Le ${subtotal}*\n\nHow would you like to receive your food?`,
                buttons: [
                    { id: 'ORDER_DELIVERY', title: '🛵 Delivery to Me' },
                    { id: 'ORDER_PICKUP',   title: '🏪 Store Pickup' }
                ]
            };
        }
        if (cleanInput === 'CLEAR_CART') {
            resetSession(userId);
            return generateWelcomeMenu();
        }
        return generateCartReview(session);
    }

    // Step 7: Order Type
    if (session.step === 'ASK_ORDER_TYPE') {
        if (cleanInput === 'ORDER_DELIVERY') {
            session.orderType = 'delivery';
            session.step = 'ASK_ADDRESS';
            return {
                type: 'text',
                text: `📍 *DELIVERY ADDRESS*\n\nPlease reply with your *Full Name* and *Address / Landmark*:\n\n_Example:_\n*Mariama Conteh, 18 Lumley Beach Road near the green gate*`
            };
        }
        if (cleanInput === 'ORDER_PICKUP') {
            session.orderType = 'pickup';
            session.step = 'CHOOSE_PAYMENT';
            return {
                type: 'interactive_buttons',
                header: '🏪 Store Pickup — 24 Wilkinson Road',
                body: `Ready in *15–20 minutes* at our Wilkinson Road branch!\n\nHow would you like to pay?`,
                buttons: [
                    { id: 'PAY_ORANGE',    title: '📱 Orange Money' },
                    { id: 'PAY_AFRIMONEY', title: '⚡ Afrimoney' },
                    { id: 'PAY_CASH',      title: '💵 Cash at Counter' }
                ]
            };
        }
    }

    // Step 8: Address & Quote Request
    if (session.step === 'ASK_ADDRESS') {
        const parts = cleanInput.split(',');
        if (parts.length >= 2) {
            session.name = parts[0].trim();
            session.address = parts.slice(1).join(',').trim();
        } else {
            session.name = 'WhatsApp Customer';
            session.address = cleanInput;
        }

        session.step = 'AWAITING_FEE';
        session.pendingOrderId = `CT-WA-${Math.floor(1000 + Math.random() * 9000)}`;

        return {
            type: 'interactive_buttons',
            header: '🛵 Checking Delivery Fee...',
            body: `📍 *Location Received:*\n"${session.address}"\n\n💬 _"Let me check the delivery fee for your location with our cashier at 24 Wilkinson Road..."_\n\n⏳ Please hold on for a moment while the cashier calculates the delivery fee!`,
            buttons: [
                { id: 'CHECK_FEE_STATUS', title: '🔄 Check Fee Status' },
                { id: 'CANCEL_ORDER',     title: '❌ Cancel Order' }
            ],
            footer: 'The cashier on the KDS board will quote your delivery fee shortly'
        };
    }

    // Step 9: Awaiting Fee or Confirming Fee
    if (session.step === 'CONFIRM_FEE') {
        if (cleanInput === 'FEE_ACCEPT' || lower === 'yes') {
            session.step = 'CHOOSE_PAYMENT';
            const subtotal = session.cart.reduce((s, it) => s + it.price * it.qty, 0);
            const total = subtotal + (session.deliveryFee || 0);
            return {
                type: 'interactive_buttons',
                header: `💳 Total: Le ${total}`,
                body: `Deliver to:\n📍 *${session.address}*\n\nHow would you like to pay?`,
                buttons: [
                    { id: 'PAY_ORANGE',    title: '📱 Orange Money' },
                    { id: 'PAY_AFRIMONEY', title: '⚡ Afrimoney' },
                    { id: 'PAY_CASH',      title: '💵 Cash on Delivery' }
                ]
            };
        }
        if (cleanInput === 'FEE_CANCEL' || cleanInput === 'CANCEL_ORDER' || lower === 'no') {
            resetSession(userId);
            return { type: 'text', text: `❌ Order cancelled. Send *Hi* or *Menu* whenever you want to order!` };
        }
    }

    // Step 10: Payment selection & Final Ticket
    if (session.step === 'CHOOSE_PAYMENT') {
        const payMap = {
            'PAY_ORANGE': 'Orange Money',
            'PAY_AFRIMONEY': 'Afrimoney',
            'PAY_CASH': session.orderType === 'pickup' ? 'Cash at Counter' : 'Cash on Delivery'
        };
        const paymentMethod = payMap[cleanInput] || 'Cash on Delivery';

        const orderId = session.pendingOrderId || `CT-WA-${Math.floor(1000 + Math.random() * 9000)}`;
        const subtotal = session.cart.reduce((s, it) => s + it.price * it.qty, 0);
        const fee = session.orderType === 'pickup' ? 0 : (session.deliveryFee || 0);
        const total = subtotal + fee;

        const orderRecord = {
            id: orderId,
            customer: {
                name: session.name || 'WhatsApp Customer',
                phone: userId,
                address: session.orderType === 'pickup' ? 'Store Pickup — 24 Wilkinson Road' : session.address,
                type: session.orderType || 'delivery',
                notes: 'Ordered via WhatsApp Bot 🤖'
            },
            items: session.cart.map(it => ({
                id: it.id,
                name: it.name,
                price: it.price,
                quantity: it.qty,
                options: (it.side || it.drink) ? `Side: ${it.side || '-'} | Drink: ${it.drink || '-'}` : null
            })),
            subtotal,
            deliveryFee: fee,
            total,
            currency: 'NLe',
            paymentMethod,
            paymentStatus: paymentMethod.includes('Cash') ? 'pending' : 'paid',
            status: 'received',
            timestamp: new Date().toISOString()
        };

        resetSession(userId);

        return {
            type: 'order_confirmed',
            orderData: orderRecord,
            receiptText: generateFinalReceipt(orderRecord)
        };
    }

    return generateWelcomeMenu();
}

function addToCart(session) {
    const existing = session.cart.find(i =>
        i.id === session.pendingItem.id &&
        i.side === session.pendingItem.side &&
        i.drink === session.pendingItem.drink
    );
    if (existing) {
        existing.qty += session.pendingItem.qty;
    } else {
        session.cart.push({ ...session.pendingItem });
    }
    session.pendingItem = null;
}

function generateWelcomeMenu() {
    return {
        type: 'interactive_buttons',
        header: '🍗 Welcome to Chicken Town SL!',
        body: `*SWIT U MOT SWIT U LYF!*\n\nFreetown's favorite crispy fried chicken, combos, BBQ wings, burgers & fowls.\n\nChoose how you would like to order:`,
        buttons: [
            { id: 'OPT_HYBRID_WEB', title: '🚀 1-Tap Visual Menu' },
            { id: 'OPT_CHAT_ORDER', title: '💬 Order in WhatsApp' },
            { id: 'OPT_CALL_DISPATCH', title: '📞 Call Dispatch 392' }
        ]
    };
}

function generateCategoryList(prompt) {
    return {
        type: 'interactive_list',
        header: '🍗 Chicken Town SL Menu',
        body: prompt || 'Select a category to view dishes and prices in New Leones (Le):',
        buttonText: 'View Categories',
        sections: [
            {
                title: 'Main Categories',
                rows: [
                    { id: 'CAT_DEALS',   title: '🎁 Top Sellers & Deals',   description: 'Family Deal, Classic Box, Wings Meals' },
                    { id: 'CAT_BURGERS', title: '🍔 Burgers & Wraps',       description: 'CT Burger, Frontline, CT Wraps' },
                    { id: 'CAT_CHICKEN', title: '🍗 Fried & BBQ Chicken',   description: 'Drumsticks, Wings, BBQ, Strips' },
                    { id: 'CAT_FOWLS',   title: '🔥 English & Kontri Fowls',description: 'Whole & Half Pepper Chicken' },
                    { id: 'CAT_SIDES',   title: '🍟 Sides & Rice',          description: 'Chips, Masala, Jollof, Plantain' },
                    { id: 'CAT_DRINKS',  title: '🥤 Drinks & Beverages',    description: 'Vimto, Coke, Fanta, Water' }
                ]
            }
        ]
    };
}

function generateItemList(categoryKey, customHeader) {
    const items = MENU[categoryKey] || [];
    return {
        type: 'interactive_list',
        header: customHeader || `Select Item (${categoryKey.toUpperCase()})`,
        body: 'Tap an item to select quantity:',
        buttonText: 'Select Dish',
        sections: [
            {
                title: 'Dishes',
                rows: items.map(it => ({
                    id: it.id,
                    title: `${it.name} - Le ${it.price}`,
                    description: it.desc || `Freshly prepared Chicken Town special`
                }))
            }
        ]
    };
}

function generateCartReview(session) {
    let summary = `🛒 *YOUR FEAST ORDER:*\n\n`;
    let subtotal = 0;

    session.cart.forEach((it, idx) => {
        const lineTotal = it.price * it.qty;
        subtotal += lineTotal;
        summary += `${idx + 1}. *${it.name}*`;
        if (it.qty > 1) summary += ` × ${it.qty}`;
        summary += ` — Le ${lineTotal}\n`;
        if (it.side || it.drink) {
            summary += `   ↳ Side: ${it.side || '-'} | Drink: ${it.drink || '-'}\n`;
        }
    });

    summary += `\n─────────────────────\n`;
    summary += `Food Subtotal: *Le ${subtotal}*\n`;
    summary += `Delivery Fee: _quoted by cashier based on location_\n`;
    summary += `─────────────────────`;

    return {
        type: 'interactive_buttons',
        header: 'Order Summary',
        body: summary,
        buttons: [
            { id: 'PROCEED_CHECKOUT', title: '✅ Proceed Checkout' },
            { id: 'ADD_MORE_ITEMS',   title: '➕ Add More Items' },
            { id: 'CLEAR_CART',        title: '❌ Cancel' }
        ]
    };
}

function generateFinalReceipt(order) {
    let text = `🎉 *ORDER CONFIRMED!* (#${order.id})\n\n`;
    text += `Thank you, *${order.customer.name}*! Your feast has been sent to our kitchen fryer at 24 Wilkinson Road.\n\n`;
    text += `📦 *Items:*\n`;
    order.items.forEach(it => {
        text += `• ${it.quantity}x ${it.name} (Le ${it.price * it.quantity})\n`;
        if (it.options) text += `   ↳ ${it.options}\n`;
    });
    text += `\n💰 *Total:* Le ${order.total} (${order.paymentMethod})\n`;
    if (order.customer.type === 'delivery') {
        text += `🛵 *Delivery Fee:* Le ${order.deliveryFee}\n`;
        text += `📍 *Delivery To:* ${order.customer.address}\n`;
        text += `⏱️ *ETA:* 30-45 minutes\n\n`;
    } else {
        text += `🏪 *Pickup at:* 24 Wilkinson Road, Freetown\n`;
        text += `⏱️ *Ready in:* 15-20 minutes\n\n`;
    }
    text += `Need to make changes? Call dispatch at *${RESTAURANT_CONFIG.hotline}* / *${RESTAURANT_CONFIG.phone}*.\n\n`;
    text += `🍗 *SWIT U MOT SWIT U LYF!*`;
    return text;
}

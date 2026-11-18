// Chicken Town SL - Customer Storefront Application Logic

import { RESTAURANT_INFO, CURRENCIES, SPICE_LEVELS, SAUCE_OPTIONS, CATEGORIES, MENU_ITEMS, INITIAL_ORDERS } from './data.js';
import { sound } from './audio.js';

// Application State
const state = {
    currency: localStorage.getItem('ct_currency') || 'NLe',
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'popular',
    fulfillment: localStorage.getItem('ct_fulfillment') || 'delivery',
    cart: JSON.parse(localStorage.getItem('ct_cart') || '[]'),
    appliedPromo: null,
    orders: JSON.parse(localStorage.getItem('ct_orders') || JSON.stringify(INITIAL_ORDERS)),
    soldOutItems: JSON.parse(localStorage.getItem('ct_sold_out') || '[]'),
    
    // Modal Customizer State
    customizingItem: null,
    selectedSpice: 'mild',
    selectedSauces: [],
    customQuantity: 1,
    instructions: '',
    
    // Active Tracking Order ID
    activeTrackingId: localStorage.getItem('ct_last_order_id') || 'CT-8921'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    setupStorageSync();
});

function initApp() {
    renderCurrencyDisplay();
    renderCategories();
    renderMenuItems();
    updateCartUI();
    
    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Storage event synchronization (Real-time updates from Admin KDS)
function setupStorageSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'ct_sold_out') {
            state.soldOutItems = JSON.parse(e.newValue || '[]');
            renderMenuItems();
        }
        if (e.key === 'ct_orders') {
            state.orders = JSON.parse(e.newValue || '[]');
            // Update live tracker if open
            if (!document.getElementById('trackerModalBackdrop').classList.contains('hidden')) {
                updateTrackerUI();
            }
        }
    });
}

// Currency Formatting Helper
export function formatPrice(amountInNLe) {
    const cur = CURRENCIES[state.currency] || CURRENCIES.NLe;
    if (cur.code === 'USD') {
        const usdVal = amountInNLe * cur.rate;
        return `$${usdVal.toFixed(2)}`;
    }
    return `NLe ${Math.round(amountInNLe)}`;
}

// Switch Active Currency
window.switchCurrency = function(code) {
    if (CURRENCIES[code]) {
        state.currency = code;
        localStorage.setItem('ct_currency', code);
        renderCurrencyDisplay();
        renderMenuItems();
        updateCartUI();
        if (state.customizingItem) {
            updateModalPricing();
        }
    }
    document.getElementById('currencyDropdown').classList.add('hidden');
};

function renderCurrencyDisplay() {
    const btnText = document.getElementById('activeCurrencyDisplay');
    if (btnText) {
        btnText.textContent = state.currency === 'NLe' ? 'NLe (Le)' : 'USD ($)';
    }
}

// Category Pills Rendering
function renderCategories() {
    const container = document.getElementById('categoryPillContainer');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
        const isActive = state.activeCategory === cat.id;
        const activeClass = isActive 
            ? 'bg-brand-500 text-stone-950 shadow-md font-extrabold' 
            : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80 font-bold';

        return `
            <button onclick="filterCategory('${cat.id}')" 
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

// Render Menu Items Grid
function renderMenuItems() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    let items = MENU_ITEMS.filter(item => {
        // Category filter
        const matchCategory = state.activeCategory === 'all' || item.category === state.activeCategory;
        // Search filter
        const matchSearch = !state.searchQuery || 
            item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(state.searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    // Sort items
    if (state.sortBy === 'price-low') {
        items.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-high') {
        items.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'name') {
        items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        items.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    document.getElementById('currentCategoryCount').textContent = `Showing ${items.length} delicious options`;

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
            ? `<span class="bg-brand-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">${item.badge}</span>` 
            : '';

        const spiceHtml = item.hasSpiceLevel 
            ? `<span class="text-[11px] font-bold text-flame-600 bg-flame-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-flame-100">
                <i data-lucide="flame" class="w-3 h-3 text-flame-500"></i> Customizable Heat
               </span>`
            : '';

        return `
            <div class="food-card bg-white rounded-3xl overflow-hidden border border-stone-200/90 flex flex-col justify-between relative group ${isSoldOut ? 'opacity-70' : ''}">
                <div>
                    <!-- Image container -->
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

                    <!-- Card Body -->
                    <div class="p-5">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-[11px] font-bold uppercase tracking-wider text-stone-400">${item.category}</span>
                            ${spiceHtml}
                        </div>
                        <h3 class="font-extrabold text-base text-stone-900 group-hover:text-brand-600 transition-colors leading-snug mb-1.5 font-display">
                            ${item.name}
                        </h3>
                        <p class="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            ${item.description}
                        </p>
                    </div>
                </div>

                <!-- Card Footer Action -->
                <div class="p-5 pt-0 flex items-center justify-between mt-2">
                    <div>
                        <span class="text-[10px] text-stone-400 block font-semibold">Starting at</span>
                        <span class="text-lg font-black text-stone-900 font-mono">${formatPrice(item.price)}</span>
                    </div>

                    <button 
                        ${isSoldOut ? 'disabled' : `onclick="openItemModal('${item.id}')"`}
                        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                            isSoldOut 
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                            : 'bg-stone-900 hover:bg-brand-500 hover:text-stone-950 text-white shadow-sm active:scale-95'
                        }">
                        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                        <span>${item.hasSpiceLevel ? 'Customize' : 'Add'}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
}

// Item Customization Modal Logic
window.openItemModal = function(itemId) {
    const item = MENU_ITEMS.find(m => m.id === itemId);
    if (!item) return;

    state.customizingItem = item;
    state.selectedSpice = 'mild';
    state.selectedSauces = [];
    state.customQuantity = 1;
    state.instructions = '';

    // Populate modal DOM
    document.getElementById('modalItemImage').src = item.image;
    document.getElementById('modalItemTitle').textContent = item.name;
    document.getElementById('modalItemDesc').textContent = item.description;
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

    // Spice Section
    const spiceSection = document.getElementById('modalSpiceSection');
    const spiceGrid = document.getElementById('spiceOptionsGrid');
    if (item.hasSpiceLevel) {
        spiceSection.classList.remove('hidden');
        spiceGrid.innerHTML = SPICE_LEVELS.map(spice => `
            <label class="spice-card border-2 ${state.selectedSpice === spice.id ? 'border-flame-500 bg-flame-50/50' : 'border-stone-200'} p-2.5 rounded-2xl flex items-center space-x-2.5 cursor-pointer hover:border-stone-300 transition">
                <input type="radio" name="spiceOption" value="${spice.id}" ${state.selectedSpice === spice.id ? 'checked' : ''} onchange="setSpice('${spice.id}')" class="sr-only">
                <span class="text-lg">${spice.icon}</span>
                <div class="text-left">
                    <div class="text-xs font-bold text-stone-900">${spice.name}</div>
                    <div class="text-[10px] text-stone-500 leading-tight">${spice.desc}</div>
                </div>
            </label>
        `).join('');
    } else {
        spiceSection.classList.add('hidden');
    }

    // Dipping Sauces Section
    const sauceGrid = document.getElementById('sauceOptionsGrid');
    sauceGrid.innerHTML = SAUCE_OPTIONS.map(sauce => `
        <label class="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-brand-300 hover:bg-stone-50 cursor-pointer transition">
            <div class="flex items-center space-x-2.5">
                <input type="checkbox" value="${sauce.id}" onchange="toggleSauce('${sauce.id}')" class="rounded text-brand-500 focus:ring-brand-500 w-4 h-4">
                <span class="text-xs font-semibold text-stone-800">${sauce.name}</span>
            </div>
            <span class="text-xs font-mono font-bold text-stone-500">+${formatPrice(sauce.price)}</span>
        </label>
    `).join('');

    updateModalPricing();

    document.getElementById('itemModalBackdrop').classList.remove('hidden');
};

window.closeItemModal = function() {
    document.getElementById('itemModalBackdrop').classList.add('hidden');
    state.customizingItem = null;
};

window.setSpice = function(spiceId) {
    state.selectedSpice = spiceId;
    const cards = document.querySelectorAll('.spice-card');
    cards.forEach(c => {
        c.classList.remove('border-flame-500', 'bg-flame-50/50');
        c.classList.add('border-stone-200');
    });
    const selectedInput = document.querySelector(`input[name="spiceOption"][value="${spiceId}"]`);
    if (selectedInput) {
        const parentCard = selectedInput.closest('.spice-card');
        if (parentCard) {
            parentCard.classList.remove('border-stone-200');
            parentCard.classList.add('border-flame-500', 'bg-flame-50/50');
        }
    }
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
    // Add extra sauces
    state.selectedSauces.forEach(sauceId => {
        const sauce = SAUCE_OPTIONS.find(s => s.id === sauceId);
        if (sauce) base += sauce.price;
    });
    return base * state.customQuantity;
}

function updateModalPricing() {
    const total = calculateModalItemTotal();
    const btnPrice = document.getElementById('modalAddTotalCost');
    if (btnPrice) {
        btnPrice.textContent = formatPrice(total);
    }
}

window.confirmAddToCart = function() {
    if (!state.customizingItem) return;

    const spiceObj = state.customizingItem.hasSpiceLevel 
        ? SPICE_LEVELS.find(s => s.id === state.selectedSpice) 
        : null;

    const saucesDetailed = state.selectedSauces.map(id => {
        const s = SAUCE_OPTIONS.find(opt => opt.id === id);
        return s ? s.name : id;
    });

    const cartItem = {
        cartItemId: `${state.customizingItem.id}-${Date.now()}`,
        itemId: state.customizingItem.id,
        name: state.customizingItem.name,
        image: state.customizingItem.image,
        unitPrice: state.customizingItem.price,
        spice: spiceObj ? spiceObj.name : null,
        sauces: saucesDetailed,
        instructions: document.getElementById('modalInstructions').value.trim(),
        quantity: state.customQuantity,
        totalItemPrice: calculateModalItemTotal()
    };

    state.cart.push(cartItem);
    saveCart();
    updateCartUI();
    closeItemModal();

    // Play pleasant chime
    sound.playAddToCart();

    // Animate cart badge
    const badge = document.getElementById('cartCountBadge');
    badge.classList.remove('bump-animate');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('bump-animate');

    // Open Cart Drawer
    openCart();
};

// Cart Management & UI
function saveCart() {
    localStorage.setItem('ct_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
    const countBadge = document.getElementById('cartCountBadge');
    const headerTotal = document.getElementById('cartHeaderTotal');
    const itemList = document.getElementById('cartItemList');

    const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    countBadge.textContent = totalQty;

    let subtotal = state.cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
    headerTotal.textContent = formatPrice(subtotal);

    // Render cart items
    if (state.cart.length === 0) {
        itemList.innerHTML = `
            <div class="h-64 flex flex-col items-center justify-center text-center text-stone-400">
                <div class="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3 text-2xl">
                    🍗
                </div>
                <h4 class="font-bold text-stone-700 text-sm">Your feast is empty</h4>
                <p class="text-xs text-stone-500 max-w-[200px] mt-1">Explore our crispy menu and add your favorite chicken combo!</p>
            </div>
        `;
        document.getElementById('checkoutBtn').disabled = true;
        document.getElementById('checkoutBtn').classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        document.getElementById('checkoutBtn').disabled = false;
        document.getElementById('checkoutBtn').classList.remove('opacity-50', 'cursor-not-allowed');

        itemList.innerHTML = state.cart.map(item => `
            <div class="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex gap-3 relative">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                        <h4 class="font-extrabold text-xs text-stone-900 truncate pr-2 font-display">${item.name}</h4>
                        <button onclick="removeCartItem('${item.cartItemId}')" class="text-stone-400 hover:text-flame-600 transition">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>

                    ${item.spice ? `<div class="text-[10px] text-flame-600 font-semibold mt-0.5">Spice: ${item.spice}</div>` : ''}
                    ${item.sauces.length > 0 ? `<div class="text-[10px] text-stone-500 truncate mt-0.5">+ Dips: ${item.sauces.join(', ')}</div>` : ''}
                    ${item.instructions ? `<div class="text-[10px] text-stone-400 italic truncate mt-0.5">Note: "${item.instructions}"</div>` : ''}

                    <div class="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                        <span class="font-mono font-black text-xs text-stone-900">${formatPrice(item.totalItemPrice)}</span>
                        <div class="flex items-center space-x-2 bg-white rounded-lg border border-stone-200 px-1 py-0.5">
                            <button onclick="updateCartItemQty('${item.cartItemId}', -1)" class="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-stone-900">-</button>
                            <span class="font-mono font-bold text-xs px-1">${item.quantity}</span>
                            <button onclick="updateCartItemQty('${item.cartItemId}', 1)" class="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-stone-900">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Calculations
    const deliveryFee = state.fulfillment === 'delivery' ? (subtotal >= 200 ? 0 : RESTAURANT_INFO.deliveryFee) : 0;
    let discount = 0;
    if (state.appliedPromo === 'TOWN10') {
        discount = subtotal * 0.10;
    }
    const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

    document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
    document.getElementById('cartDeliveryFee').textContent = deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee);
    
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

// Fulfillment Selection
window.setFulfillment = function(type) {
    state.fulfillment = type;
    localStorage.setItem('ct_fulfillment', type);

    const deliveryBtn = document.getElementById('toggleDeliveryBtn');
    const pickupBtn = document.getElementById('togglePickupBtn');
    const notice = document.getElementById('fulfillmentNotice');
    const addressSection = document.getElementById('checkoutAddressSection');

    if (type === 'delivery') {
        deliveryBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 bg-white text-stone-900 shadow-sm';
        pickupBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 text-stone-600 hover:text-stone-900';
        notice.innerHTML = '🛵 Estimated delivery time: <strong>30-45 mins</strong> (Freetown Wide)';
        if (addressSection) addressSection.classList.remove('hidden');
    } else {
        pickupBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 bg-white text-stone-900 shadow-sm';
        deliveryBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 text-stone-600 hover:text-stone-900';
        notice.innerHTML = '🛍️ Pickup Ready in: <strong>15-20 mins</strong> at 24 Wilkinson Road';
        if (addressSection) addressSection.classList.add('hidden');
    }

    updateCartUI();
};

// Promo Code Application
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

// Drawer controls
function openCart() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    backdrop.classList.remove('hidden');
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        drawer.classList.remove('translate-x-full');
    }, 10);
}

function closeCart() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    backdrop.classList.add('opacity-0');
    drawer.classList.add('translate-x-full');
    setTimeout(() => {
        backdrop.classList.add('hidden');
    }, 300);
}

// Checkout Modal
window.openCheckoutModal = function() {
    if (state.cart.length === 0) return;
    closeCart();

    let subtotal = state.cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
    const deliveryFee = state.fulfillment === 'delivery' ? (subtotal >= 200 ? 0 : RESTAURANT_INFO.deliveryFee) : 0;
    const discount = state.appliedPromo === 'TOWN10' ? subtotal * 0.10 : 0;
    const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

    document.getElementById('checkoutTotalDisplay').textContent = formatPrice(grandTotal);

    // Fulfillment address toggle in checkout
    const addressSection = document.getElementById('checkoutAddressSection');
    if (state.fulfillment === 'pickup') {
        addressSection.classList.add('hidden');
        document.getElementById('custAddress').removeAttribute('required');
    } else {
        addressSection.classList.remove('hidden');
        document.getElementById('custAddress').setAttribute('required', 'true');
    }

    document.getElementById('checkoutModalBackdrop').classList.remove('hidden');
};

window.closeCheckoutModal = function() {
    document.getElementById('checkoutModalBackdrop').classList.add('hidden');
};

// Place Order
window.handlePlaceOrder = function(e) {
    e.preventDefault();

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = state.fulfillment === 'delivery' 
        ? document.getElementById('custAddress').value.trim() 
        : 'Store Pickup - 24 Wilkinson Road';
    const notes = document.getElementById('custNotes').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentOption"]:checked')?.value || 'Orange Money';

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
            notes
        },
        items: state.cart.map(c => ({
            id: c.itemId,
            name: c.name,
            quantity: c.quantity,
            price: c.totalItemPrice,
            spice: c.spice,
            sauces: c.sauces
        })),
        subtotal,
        deliveryFee,
        discount,
        total,
        currency: state.currency,
        paymentMethod,
        paymentStatus: paymentMethod.includes('Cash') ? 'pending' : 'paid',
        status: 'received',
        timestamp: new Date().toISOString()
    };

    // Prepend to orders list
    state.orders.unshift(newOrder);
    localStorage.setItem('ct_orders', JSON.stringify(state.orders));
    state.activeTrackingId = newOrderId;
    localStorage.setItem('ct_last_order_id', newOrderId);

    // Clear cart
    state.cart = [];
    saveCart();
    updateCartUI();

    // Play victory sound
    sound.playOrderSuccess();

    // Close checkout and open Live Order Tracker
    closeCheckoutModal();
    openTrackerModal(newOrderId);
};

// Live Order Tracker UI
window.openTrackerModal = function(orderId) {
    const targetId = orderId || state.activeTrackingId;
    const order = state.orders.find(o => o.id === targetId);

    if (!order) {
        alert('No recent orders found to track. Place an order first!');
        return;
    }

    state.activeTrackingId = order.id;
    updateTrackerUI();
    document.getElementById('trackerModalBackdrop').classList.remove('hidden');
};

window.closeTrackerModal = function() {
    document.getElementById('trackerModalBackdrop').classList.add('hidden');
};

function updateTrackerUI() {
    const order = state.orders.find(o => o.id === state.activeTrackingId);
    if (!order) return;

    document.getElementById('trackerOrderId').textContent = order.id;

    // Status map
    const statusLabels = {
        'received': 'Order Confirmed & Sent to Fryer',
        'preparing': 'Kitchen is Frying Your Golden Feast',
        'out_for_delivery': order.customer.type === 'delivery' ? 'Rider On the Way!' : 'Ready for Counter Pickup!',
        'completed': 'Delivered! Enjoy your Chicken Feast!',
        'cancelled': 'Order Cancelled'
    };

    document.getElementById('trackerStatusLabel').textContent = `Status: ${statusLabels[order.status] || order.status}`;

    // Highlight steps
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

    // Populate receipt items
    const receiptItemsContainer = document.getElementById('trackerReceiptItems');
    receiptItemsContainer.innerHTML = order.items.map(item => `
        <div class="flex justify-between">
            <span>${item.quantity}x ${item.name} ${item.spice ? `(${item.spice})` : ''}</span>
            <span>${formatPrice(item.price)}</span>
        </div>
    `).join('') + `
        <div class="flex justify-between text-stone-500 pt-1 border-t border-stone-200">
            <span>Delivery (${order.customer.type})</span>
            <span>${order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
        </div>
    `;

    document.getElementById('trackerReceiptTotal').textContent = formatPrice(order.total);
}

// Event Listeners Setup
function setupEventListeners() {
    // Open/Close Cart
    document.getElementById('openCartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
    document.getElementById('cartDrawerBackdrop')?.addEventListener('click', closeCart);

    // Track Order Header Button
    document.getElementById('trackOrderBtn')?.addEventListener('click', () => {
        openTrackerModal(state.activeTrackingId);
    });

    // Currency Dropdown Toggle
    const currencyBtn = document.getElementById('currencyBtn');
    const currencyDropdown = document.getElementById('currencyDropdown');
    currencyBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        currencyDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        currencyDropdown?.classList.add('hidden');
    });

    // Search Inputs
    const handleSearch = (e) => {
        state.searchQuery = e.target.value.trim();
        renderMenuItems();
    };
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('mobileSearchInput')?.addEventListener('input', handleSearch);

    // Sort Dropdown
    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderMenuItems();
    });

    // Payment Radio Styling in Checkout
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
        });
    });
}

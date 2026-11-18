// Chicken Town SL - Kitchen Display System (KDS) & Admin Logic

import { MENU_ITEMS, INITIAL_ORDERS } from './data.js';
import { sound } from './audio.js';

// Admin State
const adminState = {
    activeTab: 'orders', // 'orders' or 'stock'
    filterStatus: 'all',
    soundEnabled: true,
    orders: JSON.parse(localStorage.getItem('ct_orders') || JSON.stringify(INITIAL_ORDERS)),
    soldOutItems: JSON.parse(localStorage.getItem('ct_sold_out') || '[]'),
};

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
    startClock();
    setupStorageListener();
});

function initAdmin() {
    updateMetrics();
    renderTickets();
    renderStockGrid();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Live Clock
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

// Cross-tab real-time sync with sound bell!
function setupStorageListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'ct_orders') {
            const oldLength = adminState.orders.length;
            const newOrders = JSON.parse(e.newValue || '[]');
            
            // Check if a new order was added
            if (newOrders.length > oldLength) {
                if (adminState.soundEnabled) {
                    sound.playKitchenBell();
                }
            }

            adminState.orders = newOrders;
            updateMetrics();
            renderTickets();
        }
        if (e.key === 'ct_sold_out') {
            adminState.soldOutItems = JSON.parse(e.newValue || '[]');
            renderStockGrid();
        }
    });
}

// Sound Toggle
window.toggleKitchenSound = function() {
    adminState.soundEnabled = !adminState.soundEnabled;
    sound.enabled = adminState.soundEnabled;

    const soundText = document.getElementById('soundStatusText');
    const bellIcon = document.getElementById('bellIcon');

    if (adminState.soundEnabled) {
        soundText.textContent = 'Chime: ON';
        bellIcon.className = 'w-4 h-4 text-brand-400';
        sound.playKitchenBell(); // test chime
    } else {
        soundText.textContent = 'Chime: MUTED';
        bellIcon.className = 'w-4 h-4 text-stone-500';
    }
};

// Tab Switching
window.switchAdminTab = function(tab) {
    adminState.activeTab = tab;
    const ordersView = document.getElementById('ordersView');
    const stockView = document.getElementById('stockView');
    const tabOrdersBtn = document.getElementById('tabOrdersBtn');
    const tabStockBtn = document.getElementById('tabStockBtn');
    const statusFilterBar = document.getElementById('statusFilterBar');

    if (tab === 'orders') {
        ordersView.classList.remove('hidden');
        stockView.classList.add('hidden');
        statusFilterBar.classList.remove('hidden');

        tabOrdersBtn.className = 'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition bg-brand-500 text-stone-950 shadow-md';
        tabStockBtn.className = 'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition bg-stone-800 text-stone-400 hover:text-white';
    } else {
        ordersView.classList.add('hidden');
        stockView.classList.remove('hidden');
        statusFilterBar.classList.add('hidden');

        tabStockBtn.className = 'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition bg-brand-500 text-stone-950 shadow-md';
        tabOrdersBtn.className = 'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition bg-stone-800 text-stone-400 hover:text-white';
    }

    if (window.lucide) window.lucide.createIcons();
};

// Filter Status
window.filterKdsStatus = function(status) {
    adminState.filterStatus = status;

    document.querySelectorAll('.status-pill').forEach(btn => {
        btn.classList.remove('bg-stone-700', 'text-white', 'font-bold');
        btn.classList.add('bg-stone-800', 'text-stone-300');
    });

    event?.target?.classList.remove('bg-stone-800', 'text-stone-300');
    event?.target?.classList.add('bg-stone-700', 'text-white', 'font-bold');

    renderTickets();
};

// Metrics Computation
function updateMetrics() {
    const active = adminState.orders.filter(o => o.status === 'received' || o.status === 'preparing');
    const total = adminState.orders.length;
    const revenue = adminState.orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

    document.getElementById('statActiveCount').textContent = active.length;
    document.getElementById('statTotalOrders').textContent = total;
    document.getElementById('ticketCountBadge').textContent = active.length;
    document.getElementById('statRevenue').textContent = `NLe ${Math.round(revenue)}`;
}

// Time elapsed string helper
function getTimeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
}

// Render Kitchen Tickets
function renderTickets() {
    const container = document.getElementById('ticketsGrid');
    const noOrders = document.getElementById('noOrdersState');
    if (!container) return;

    let filtered = adminState.orders.filter(order => {
        if (adminState.filterStatus === 'all') return true;
        return order.status === adminState.filterStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = '';
        noOrders.classList.remove('hidden');
        return;
    } else {
        noOrders.classList.add('hidden');
    }

    container.innerHTML = filtered.map(order => {
        const timeAgo = getTimeAgo(order.timestamp);
        const isDelivery = order.customer.type === 'delivery';

        // Status badge configuration
        const statusConfig = {
            'received': { label: 'New Order', bg: 'bg-flame-500/20 text-flame-400 border border-flame-500/40 animate-pulse' },
            'preparing': { label: 'Frying / Cooking', bg: 'bg-brand-500/20 text-brand-300 border border-brand-500/40' },
            'out_for_delivery': { label: isDelivery ? 'Dispatched Rider' : 'Ready at Counter', bg: 'bg-blue-500/20 text-blue-300 border border-blue-500/40' },
            'completed': { label: 'Completed', bg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
            'cancelled': { label: 'Cancelled', bg: 'bg-stone-700 text-stone-400' }
        }[order.status] || { label: order.status, bg: 'bg-stone-700 text-white' };

        // Action button transition
        let actionBtnHtml = '';
        if (order.status === 'received') {
            actionBtnHtml = `
                <button onclick="advanceOrderStatus('${order.id}', 'preparing')" class="flex-1 py-2.5 bg-brand-500 hover:bg-brand-400 text-stone-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md">
                    <i data-lucide="flame" class="w-3.5 h-3.5"></i>
                    <span>Start Frying</span>
                </button>
            `;
        } else if (order.status === 'preparing') {
            actionBtnHtml = `
                <button onclick="advanceOrderStatus('${order.id}', 'out_for_delivery')" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md">
                    <i data-lucide="bike" class="w-3.5 h-3.5"></i>
                    <span>${isDelivery ? 'Hand to Rider' : 'Ready for Counter'}</span>
                </button>
            `;
        } else if (order.status === 'out_for_delivery') {
            actionBtnHtml = `
                <button onclick="advanceOrderStatus('${order.id}', 'completed')" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                    <span>Mark Completed</span>
                </button>
            `;
        }

        return `
            <div class="bg-stone-800/90 rounded-3xl border border-stone-700/80 p-5 flex flex-col justify-between shadow-xl transition-all hover:border-stone-600">
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

                        <!-- Fulfillment Badge -->
                        <span class="px-2.5 py-1 rounded-xl text-xs font-bold ${isDelivery ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-stone-700 text-stone-200'}">
                            ${isDelivery ? '🛵 Delivery' : '🛍️ Pickup'}
                        </span>
                    </div>

                    <!-- Customer Info -->
                    <div class="bg-stone-900/60 rounded-2xl p-3 mb-3 border border-stone-800 text-xs space-y-1">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-white">${order.customer.name}</span>
                            <a href="tel:${order.customer.phone}" class="text-brand-400 hover:underline flex items-center gap-1">
                                <i data-lucide="phone-call" class="w-3 h-3"></i> ${order.customer.phone}
                            </a>
                        </div>
                        <div class="text-stone-400 text-[11px] truncate">
                            <i data-lucide="map-pin" class="w-3 h-3 inline text-flame-400 mr-1"></i>
                            ${order.customer.address}
                        </div>
                        ${order.customer.notes ? `
                            <div class="text-amber-300 text-[11px] italic bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                                "${order.customer.notes}"
                            </div>
                        ` : ''}
                    </div>

                    <!-- Ordered Items -->
                    <div class="space-y-2 mb-4">
                        <div class="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Kitchen Order Items</div>
                        ${order.items.map(it => `
                            <div class="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 flex items-start justify-between">
                                <div class="flex items-start space-x-2">
                                    <span class="font-mono font-black text-brand-400 text-sm">${it.quantity}x</span>
                                    <div>
                                        <div class="text-xs font-bold text-white">${it.name}</div>
                                        ${it.spice ? `<span class="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-flame-600/30 text-flame-400 border border-flame-600/40">🔥 ${it.spice}</span>` : ''}
                                        ${it.sauces && it.sauces.length > 0 ? `<div class="text-[10px] text-stone-400 mt-0.5">+ Dips: ${it.sauces.join(', ')}</div>` : ''}
                                    </div>
                                </div>
                                <span class="font-mono text-xs text-stone-400">NLe ${it.price}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Footer Summary & Actions -->
                <div class="pt-3 border-t border-stone-700/80">
                    <div class="flex items-center justify-between text-xs mb-3 font-semibold text-stone-400">
                        <span>Paid via: <strong class="text-white">${order.paymentMethod}</strong></span>
                        <span class="font-mono font-black text-white text-sm">NLe ${order.total}</span>
                    </div>

                    <div class="flex items-center space-x-2">
                        ${actionBtnHtml}
                        ${order.status !== 'cancelled' && order.status !== 'completed' ? `
                            <button onclick="cancelOrder('${order.id}')" title="Cancel order" class="p-2.5 rounded-xl bg-stone-700 hover:bg-flame-600/30 hover:text-flame-400 text-stone-400 transition">
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

// Update Order Status
window.advanceOrderStatus = function(orderId, newStatus) {
    const order = adminState.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    localStorage.setItem('ct_orders', JSON.stringify(adminState.orders));
    updateMetrics();
    renderTickets();

    // Trigger storage event for same tab
    window.dispatchEvent(new Event('storage'));
};

window.cancelOrder = function(orderId) {
    if (!confirm(`Are you sure you want to cancel order ${orderId}?`)) return;
    advanceOrderStatus(orderId, 'cancelled');
};

// Render Stock Management Grid
function renderStockGrid() {
    const grid = document.getElementById('stockGrid');
    if (!grid) return;

    grid.innerHTML = MENU_ITEMS.map(item => {
        const isSoldOut = adminState.soldOutItems.includes(item.id);

        return `
            <div class="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-xl object-cover">
                    <div>
                        <h4 class="text-xs font-bold text-white truncate max-w-[150px]">${item.name}</h4>
                        <span class="text-[10px] text-stone-400 uppercase font-mono">NLe ${item.price}</span>
                    </div>
                </div>

                <button onclick="toggleStock('${item.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSoldOut 
                    ? 'bg-flame-600/20 text-flame-400 border border-flame-600/40 hover:bg-flame-600/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                }">
                    ${isSoldOut ? '✕ Sold Out' : '✓ In Stock'}
                </button>
            </div>
        `;
    }).join('');
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

    // Dispatch event
    window.dispatchEvent(new Event('storage'));
};

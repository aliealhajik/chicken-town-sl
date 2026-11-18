# Chicken Town SL — WhatsApp Automated Ordering Engine

This directory contains the automated WhatsApp ordering bot for **Chicken Town SL** (Wilkinson Road, Freetown). It is fully synchronized with the website storefront, table dine-in orders, and the Kitchen Display System (KDS).

---

## 🎯 Architecture & Ordering Modes

The engine supports **both ordering workflows**:

### Option 1: Hybrid 1-Tap Ordering
1. Customer sends any greeting or clicks the website's WhatsApp button.
2. Bot welcomes them and sends a personalized 1-tap interactive link:
   `http://localhost:5000/index.html?mode=whatsapp&ref=+232...`
3. Customer browses the visual menu, customizes combos/sides, and checks out in seconds.
4. The cart submits directly into the WhatsApp conversation and the Kitchen KDS simultaneously.

### Option 2: Pure In-Chat Interactive Bot
1. Customer chats directly with the bot (`"Hi"`, `"Menu"`, `"Order"`).
2. Bot displays interactive buttons & numbered categories:
   - 🍔 Burgers & Wraps
   - 🍗 Top Sellers & Combos
   - 🍟 Sides & Drinks
   - 📦 Special Celebration Deals
3. Customer replies with numbers or item codes (e.g., `1`, `4 Wings`, `2 Burgers`).
4. Bot asks for delivery address / pickup choice and payment method (Cash / Orange Money / Afrimoney).
5. Bot issues an instant confirmation ticket (e.g. `#CT-WA-8421`) and pushes it straight to the Kitchen KDS board with an audio chime!

---

## 🚀 Live Testing (Offline / No API Key Required)

You don't need a Meta developer account or API token to test the bot right now. Open the interactive phone simulator in your browser:

👉 **[WhatsApp Bot Simulator](http://localhost:5000/whatsapp-bot/simulator.html)**

1. Open **[Kitchen Display (KDS)](http://localhost:5000/admin.html)** in one tab/window.
2. Open the **[WhatsApp Simulator](http://localhost:5000/whatsapp-bot/simulator.html)** in another window side-by-side.
3. Chat with the bot, place an order, and watch the ticket appear instantly on the kitchen board with sound!

---

## ⚙️ Connecting to Real WhatsApp (Meta Cloud API)

When you are ready to connect a real Sierra Leone WhatsApp business number:

1. **Meta Developer Portal:**
   - Go to [developers.facebook.com](https://developers.facebook.com) and create a **Business App**.
   - Add the **WhatsApp** product.
   - Obtain your **Phone Number ID** and **Permanent Access Token**.

2. **Set Environment Variables:**
   ```bash
   export WHATSAPP_TOKEN="your_meta_system_user_token"
   export PHONE_NUMBER_ID="your_whatsapp_phone_number_id"
   export VERIFY_TOKEN="chickentown_secret_verify_2026"
   export PORT=3000
   ```

3. **Start the Webhook Server:**
   ```bash
   node whatsapp-bot/webhook.js
   ```

4. **Configure Webhook in Meta:**
   - Callback URL: `https://your-domain.com/webhook`
   - Verify Token: `chickentown_secret_verify_2026`
   - Subscribe to: `messages`

import { cart } from "../data/cart.js";
import { getOrderById } from "../data/orders.js";
import { deliveryOptions } from "../data/delivery-options.js";
import { formatCurrency } from "./utils/money.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.querySelector(".js-cart-count");
  if (el) el.textContent = total;
}

function renderEmpty(root) {
  root.innerHTML = `
    <section class="surface empty-state">
      <div class="empty-icon">🚚</div>
      <h2>Nothing to track yet</h2>
      <p>Once you place an order, tracking details will show up here.</p>
      <a href="orders.html" class="btn btn-amber">View your orders</a>
    </section>
  `;
}

function deliveryLabelFor(deliveryOptionId, fallbackDays) {
  const option = deliveryOptions.find((o) => o.id === deliveryOptionId);
  const days = option ? option.deliveryDays : fallbackDays;
  return days ? `${days}-day delivery` : "Standard delivery";
}

function renderTracking(order, item) {
  const root = document.querySelector(".js-tracking-root");
  const etaLabel = item.deliveryDate
    ? dayjs(item.deliveryDate).format("dddd, MMMM D")
    : "Date pending";

  root.innerHTML = `
    <a href="orders.html" class="tracking-back">← Back to orders</a>

    <section class="tracking-card surface">
      <div class="tracking-top">
        <div>
          <p class="tracking-eta">Arriving ${etaLabel}</p>
          <h1 class="tracking-title">${item.name}</h1>
          <p class="tracking-sub">
            Qty: ${item.quantity} · Order <span class="mono">${order.id}</span>
          </p>
        </div>
        <div class="tracking-thumb">
          <img src="${item.image}" alt="${item.name}" />
        </div>
      </div>

      <div class="tracking-progress">
        <ol class="route">
          <li class="route-step is-done">
            <span class="route-dot"></span><span class="route-line"></span
            ><span class="route-label">Order placed</span>
          </li>
          <li class="route-step is-current">
            <span class="route-dot"></span><span class="route-line"></span
            ><span class="route-label">Preparing</span>
          </li>
          <li class="route-step">
            <span class="route-dot"></span><span class="route-line"></span
            ><span class="route-label">Delivered</span>
          </li>
        </ol>
      </div>

      <div class="carrier-note">
        Your order has been received and is being prepared at the SwiftMart warehouse.
      </div>

      <div class="tracking-meta-grid">
        <div class="tracking-meta-item">
          <span class="meta-label">Carrier</span
          ><span class="meta-value">SwiftMart Logistics</span>
        </div>
        <div class="tracking-meta-item">
          <span class="meta-label">Order ID</span
          ><span class="meta-value mono">${order.id}</span>
        </div>
        <div class="tracking-meta-item">
          <span class="meta-label">Delivery method</span
          ><span class="meta-value">${deliveryLabelFor(item.deliveryOptionId, item.deliveryDays)}</span>
        </div>
        <div class="tracking-meta-item">
          <span class="meta-label">Item price</span
          ><span class="meta-value mono">$${formatCurrency(item.priceCents)}</span>
        </div>
        <div class="tracking-meta-item">
          <span class="meta-label">Shipping to</span
          ><span class="meta-value">Lagos, NG</span>
        </div>
        <div class="tracking-meta-item">
          <span class="meta-label">Order placed</span
          ><span class="meta-value mono">${dayjs(order.placedAt).format("MMM D, h:mm A")}</span>
        </div>
      </div>
    </section>
  `;
}

const params = new URLSearchParams(window.location.search);
const orderId = params.get("order");
const productId = params.get("item");

const order = orderId ? getOrderById(orderId) : null;
const item = order ? order.items.find((i) => i.productId === productId) : null;

if (order && item) {
  renderTracking(order, item);
} else {
  renderEmpty(document.querySelector(".js-tracking-root"));
}

updateCartCount();

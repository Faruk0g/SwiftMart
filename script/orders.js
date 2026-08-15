import { cart, addToCart } from "../data/cart.js";
import { getOrders } from "../data/orders.js";
import { formatCurrency } from "./utils/money.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.querySelector(".js-cart-count");
  if (el) el.textContent = total;
}

function renderOrders() {
  const orders = getOrders();
  const listEl = document.querySelector(".js-orders-list");
  const subtitleEl = document.querySelector(".js-orders-subtitle");

  if (orders.length === 0) {
    if (subtitleEl) subtitleEl.textContent = "No orders yet.";
    listEl.innerHTML = `
      <div class="surface empty-state">
        <div class="empty-icon">📦</div>
        <h2>No orders yet</h2>
        <p>When you place an order, it'll show up here.</p>
        <a href="index.html" class="btn btn-amber">Start shopping</a>
      </div>
    `;
    return;
  }

  if (subtitleEl) {
    subtitleEl.textContent = `${orders.length} order${orders.length === 1 ? "" : "s"} placed`;
  }

  listEl.innerHTML = orders
    .map((order) => {
      const placedDate = dayjs(order.placedAt).format("MMMM D, YYYY");

      const rowsHTML = order.items
        .map((item) => {
          const etaLabel = item.deliveryDate
            ? `Arriving ${dayjs(item.deliveryDate).format("MMM D")}`
            : "Processing";

          return `
            <div class="order-row">
              <div class="order-row-thumb">
                <img src="${item.image}" alt="${item.name}" />
              </div>
              <div class="order-row-info">
                <p class="order-row-title">${item.name}</p>
                <p class="order-row-sub">${etaLabel} · Qty: ${item.quantity}</p>
              </div>
              <div class="order-row-actions">
                <button
                  class="btn btn-ghost btn-sm js-buy-again-btn"
                  data-product-id="${item.productId}"
                >Buy it again</button>
                <a
                  href="tracking.html?order=${encodeURIComponent(order.id)}&item=${encodeURIComponent(item.productId)}"
                  class="btn btn-primary btn-sm"
                >Track package</a>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <article class="order-card surface">
          <div class="order-meta">
            <div class="meta-item">
              <span class="meta-label">Order placed</span><span class="meta-value">${placedDate}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total</span><span class="meta-value mono">$${formatCurrency(order.totalCents)}</span>
            </div>
            <div class="meta-item order-id">
              <span class="meta-label">Order ID</span><span class="meta-value mono">${order.id}</span>
            </div>
          </div>
          <div class="order-rows">
            ${rowsHTML}
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".js-buy-again-btn").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.productId);
      updateCartCount();
      const originalLabel = button.textContent;
      button.textContent = "Added ✓";
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1200);
    });
  });
}

renderOrders();
updateCartCount();

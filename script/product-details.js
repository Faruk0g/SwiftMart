import { cart, addToCart } from "../data/cart.js";
import { products } from "../data/product.js";
import { deliveryOptions } from "../data/delivery-options.js";
import { formatCurrency } from "./utils/money.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.querySelector(".js-cart-count");
  if (el) el.textContent = total;
}

function buildDescription(product) {
  const category = product.category || "General";
  const keywordList = (product.keywords || [])
    .filter((k) => k.toLowerCase() !== category.toLowerCase())
    .join(", ");

  return `${product.name} is part of our ${category} lineup${
    keywordList ? `, built for ${keywordList}` : ""
  }. Backed by ${product.reviewCount.toLocaleString()} customer ratings, it's one of the more consistently reordered picks in this category.`;
}

function buildBullets(product) {
  const category = product.category || "General";
  const bullets = [
    `Category: ${category}`,
    `Rated ${product.rating} across ${product.reviewCount.toLocaleString()} reviews`,
    `Ships with SwiftMart's standard, priority, and express delivery options`,
  ];
  if (product.keywords && product.keywords.length) {
    bullets.push(`Tagged for: ${product.keywords.join(", ")}`);
  }
  return bullets;
}

function renderNotFound(root) {
  root.innerHTML = `
    <div class="pdp-not-found">
      <h1>We couldn't find that product</h1>
      <p>It may have been removed or the link is broken.</p>
      <a href="index.html" class="btn btn-amber">Back to shop</a>
    </div>
  `;
}

function renderProduct(product) {
  const root = document.querySelector(".js-pdp-root");

  const standardOption = deliveryOptions.find((o) => o.id === "1");
  const deliveryDate = standardOption
    ? dayjs().add(standardOption.deliveryDays, "days").format("dddd, MMMM D")
    : null;

  const relatedProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.keywords.some((k) => product.keywords.includes(k)),
    )
    .slice(0, 4);

  const category = product.category || "General";

  root.innerHTML = `
    <nav class="pdp-breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span class="sep">/</span>
      <a href="index.html?category=${encodeURIComponent(category)}">${category}</a>
      <span class="sep">/</span>
      <span>${product.name}</span>
    </nav>

    <div class="pdp-layout">
      <div class="pdp-media">
        <img src="${product.image}" alt="${product.name}" />
      </div>

      <div class="pdp-info">
        <span class="pdp-category-badge">${category}</span>
        <h1 class="pdp-title">${product.name}</h1>

        <div class="pdp-rating-row">
          <span class="stars">${product.rating}</span>
          <span class="rating-count">${product.reviewCount.toLocaleString()} ratings</span>
        </div>

        <hr class="pdp-divider" />

        <p class="pdp-price">$${formatCurrency(product.price)}</p>
        <p class="pdp-price-note">Price includes all applicable fees.</p>

        ${
          deliveryDate
            ? `<div class="pdp-delivery-row">
                 <span>🚚</span>
                 <span><strong>FREE delivery ${deliveryDate}</strong><br />Priority and express options available at checkout.</span>
               </div>`
            : ""
        }

        <p class="pdp-description">${buildDescription(product)}</p>

        <div class="pdp-purchase-card">
          <p class="pdp-in-stock">In stock</p>
          <div class="pdp-qty-row">
            <label for="pdp-qty">Qty:</label>
            <select id="pdp-qty" class="js-pdp-qty">
              ${Array.from({ length: 10 }, (_, i) => i + 1)
                .map((n) => `<option value="${n}">${n}</option>`)
                .join("")}
            </select>
          </div>
          <button class="btn btn-amber pdp-add-btn js-pdp-add-btn" data-product-id="${product.id}">
            <span class="pdp-btn-default">Add to Cart</span>
            <span class="pdp-btn-added">✓ Added</span>
          </button>
        </div>

        <h2 class="pdp-section-title">Product details</h2>
        <ul class="pdp-bullets">
          ${buildBullets(product)
            .map((b) => `<li>${b}</li>`)
            .join("")}
        </ul>
      </div>
    </div>

    ${
      relatedProducts.length
        ? `<h2 class="pdp-section-title">You might also like</h2>
           <div class="pdp-related-grid">
             ${relatedProducts
               .map(
                 (p) => `
               <a class="pdp-related-card" href="product-details.html?id=${p.id}">
                 <img src="${p.image}" alt="${p.name}" />
                 <p class="pdp-related-name">${p.name}</p>
                 <p class="pdp-related-price">$${formatCurrency(p.price)}</p>
               </a>
             `,
               )
               .join("")}
           </div>`
        : ""
    }
  `;

  const addBtn = document.querySelector(".js-pdp-add-btn");
  addBtn.addEventListener("click", () => {
    const qtySelect = document.querySelector(".js-pdp-qty");
    const qty = Number(qtySelect.value);

    for (let i = 0; i < qty; i++) {
      addToCart(product.id);
    }
    updateCartCount();

    addBtn.classList.add("is-added");
    window.clearTimeout(addBtn._addedTimer);
    addBtn._addedTimer = window.setTimeout(() => {
      addBtn.classList.remove("is-added");
    }, 1200);
  });
}

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const product = products.find((p) => p.id === productId);

if (product) {
  renderProduct(product);
} else {
  renderNotFound(document.querySelector(".js-pdp-root"));
}

updateCartCount();

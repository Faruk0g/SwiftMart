import {
  cart,
  removeFromCart,
  updateQuantity,
  updateDeliveryOption,
  clearCart,
} from "../data/cart.js";
import { products } from "../data/product.js";
import { formatCurrency } from "./utils/money.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import { deliveryOptions } from "../data/delivery-options.js";
import { saveOrder } from "../data/orders.js";

function deliveryOptionsHTML(matchingProduct, cartItem) {
  let html = "";

  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, "days");
    const dateString = deliveryDate.format("dddd, MMMM D");

    const priceString =
      deliveryOption.price === 0
        ? "FREE"
        : `$${formatCurrency(deliveryOption.price)}`;

    const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

    html += `
      <label class="radio-row">
        <span class="radio-row-left"
          ><input
            type="radio"
            class="js-delivery-option-radio"
            name="delivery-${matchingProduct.id}"
            data-product-id="${matchingProduct.id}"
            data-delivery-option-id="${deliveryOption.id}"
            ${isChecked ? "checked" : ""}
          /><span
            >${dateString} — ${deliveryOption.deliveryDays}-day delivery</span
          ></span
        >
        <span class="radio-price">${priceString}</span>
      </label>
    `;
  });

  return html;
}

function calculateCartTotals() {
  let itemsSubtotalCents = 0;
  let shippingCents = 0;
  let itemCount = 0;

  cart.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product) return;

    itemsSubtotalCents += product.price * cartItem.quantity;
    itemCount += cartItem.quantity;

    const deliveryOption = deliveryOptions.find(
      (option) => option.id === cartItem.deliveryOptionId,
    );
    if (deliveryOption) {
      shippingCents += deliveryOption.price;
    }
  });

  const taxCents = Math.round((itemsSubtotalCents + shippingCents) * 0.1);
  const totalCents = itemsSubtotalCents + shippingCents + taxCents;

  return { itemsSubtotalCents, shippingCents, taxCents, totalCents, itemCount };
}

function renderOrderSummary() {
  const { itemsSubtotalCents, shippingCents, taxCents, totalCents, itemCount } =
    calculateCartTotals();

  document.querySelectorAll(".js-checkout-item-count").forEach((el) => {
    el.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
  });

  const itemsLabel = document.querySelector(".js-summary-items-label");
  if (itemsLabel) itemsLabel.textContent = `Items (${itemCount}):`;

  const itemsValue = document.querySelector(".js-summary-items-value");
  if (itemsValue)
    itemsValue.textContent = `$${formatCurrency(itemsSubtotalCents)}`;

  const shippingValue = document.querySelector(".js-summary-shipping-value");
  if (shippingValue) {
    shippingValue.textContent =
      shippingCents === 0 ? "$0.00" : `$${formatCurrency(shippingCents)}`;
  }

  const taxValue = document.querySelector(".js-summary-tax-value");
  if (taxValue) taxValue.textContent = `$${formatCurrency(taxCents)}`;

  const totalValue = document.querySelector(".js-summary-total-value");
  if (totalValue) totalValue.textContent = `$${formatCurrency(totalCents)}`;

  const placeOrderBtn = document.querySelector(".js-place-order-btn");
  if (placeOrderBtn) {
    placeOrderBtn.classList.toggle("is-disabled", itemCount === 0);
  }
}

function renderCartSummary() {
  const cartSummaryEl = document.querySelector(".js-cart-summary");

  if (cart.length === 0) {
    cartSummaryEl.innerHTML = `
      <div class="surface empty-state">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <a href="index.html" class="btn btn-amber">Continue shopping</a>
      </div>
    `;
    renderOrderSummary();
    return;
  }

  let cartSummaryHTML = "";

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    let matchingProduct;

    products.forEach((product) => {
      if (product.id === productId) {
        matchingProduct = product;
      }
    });

    if (!matchingProduct) return;

    cartSummaryHTML += `
     <article class="surface item-card">
            <div class="item-thumb">
              <img
                src="${matchingProduct.image}"
                alt="${matchingProduct.name}"
              />
            </div>
            <div class="item-main">
              <p class="item-title">
                ${matchingProduct.name}
              </p>
              <p class="item-price">$${formatCurrency(matchingProduct.price)}</p>
              <div class="item-controls js-item-controls-${matchingProduct.id}">
                <div class="qty-stepper">
                  <button
                    aria-label="Decrease quantity"
                    class="js-qty-decrease"
                    data-product-id="${matchingProduct.id}"
                  >–</button><span>${cartItem.quantity}</span
                  ><button
                    aria-label="Increase quantity"
                    class="js-qty-increase"
                    data-product-id="${matchingProduct.id}"
                  >+</button>
                </div>
                <button class="text-link-btn danger js-text-link-btn"
                data-product-id="${matchingProduct.id}">Delete</button>
              </div>
              <div class="divider-thin"></div>
              <fieldset class="delivery-options js-delivery-options">
                <legend>Delivery date</legend>
                ${deliveryOptionsHTML(matchingProduct, cartItem)}
              </fieldset>
            </div>
          </article>
    `;
  });

  cartSummaryEl.innerHTML = cartSummaryHTML;

  document.querySelectorAll(".js-text-link-btn").forEach((link) => {
    link.addEventListener("click", () => {
      removeFromCart(link.dataset.productId);
      renderCartSummary();
    });
  });

  document.querySelectorAll(".js-qty-decrease").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      const matchingItem = cart.find((item) => item.productId === productId);
      if (!matchingItem) return;
      updateQuantity(productId, matchingItem.quantity - 1);
      renderCartSummary();
    });
  });

  document.querySelectorAll(".js-qty-increase").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      const matchingItem = cart.find((item) => item.productId === productId);
      if (!matchingItem) return;
      updateQuantity(productId, matchingItem.quantity + 1);
      renderCartSummary();
    });
  });

  document.querySelectorAll(".js-delivery-option-radio").forEach((radio) => {
    radio.addEventListener("change", () => {
      updateDeliveryOption(
        radio.dataset.productId,
        radio.dataset.deliveryOptionId,
      );
      renderCartSummary();
    });
  });

  renderOrderSummary();
}

function generateOrderId() {
  const year = dayjs().format("YYYY");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `SM-${year}-${random}`;
}

function buildOrderFromCart() {
  const items = cart.map((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    const deliveryOption = deliveryOptions.find(
      (option) => option.id === cartItem.deliveryOptionId,
    );
    const deliveryDate = deliveryOption
      ? dayjs().add(deliveryOption.deliveryDays, "days").toISOString()
      : null;

    return {
      productId: cartItem.productId,
      name: product ? product.name : "Unknown product",
      image: product ? product.image : "",
      priceCents: product ? product.price : 0,
      quantity: cartItem.quantity,
      deliveryOptionId: cartItem.deliveryOptionId,
      deliveryDays: deliveryOption ? deliveryOption.deliveryDays : null,
      deliveryDate,
    };
  });

  const { totalCents } = calculateCartTotals();

  return {
    id: generateOrderId(),
    placedAt: new Date().toISOString(),
    totalCents,
    items,
  };
}

const placeOrderBtn = document.querySelector(".js-place-order-btn");
if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", (e) => {
    if (cart.length === 0) {
      e.preventDefault();
      return;
    }
    // Build the order from the current cart and persist it BEFORE the
    // cart is cleared and the browser navigates to orders.html — both
    // saveOrder() and clearCart() are synchronous localStorage writes,
    // so this always completes before the <a href="orders.html"> nav fires.
    const order = buildOrderFromCart();
    saveOrder(order);
    clearCart();
  });
}

renderCartSummary();

import { cart, addToCart } from "../data/cart.js";
import { products } from "../data/product.js";
import { formatCurrency } from "./utils/money.js";

let productsHTML = "";

products.forEach((product) => {
  productsHTML += `
    <article class="product-card">
      <a class="card-media-link" href="product-details.html?id=${product.id}">
        <div class="card-media">
          <span class="card-badge">Prime</span>
          <img
            src="${product.image}"
            alt="${product.name}"
          />
        </div>
      </a>
      <div class="card-body">
        <a class="card-name-link" href="product-details.html?id=${product.id}">
          <p class="card-name">
            ${product.name}
          </p>
        </a>
        <div class="card-rating">
          <span class="stars">${product.rating}</span>
          <span class="rating-count">${product.reviewCount}</span>
        </div>
        <p class="card-price">$${formatCurrency(product.price)}</p>
        <div class="card-footer">
          <select class="qty-select" aria-label="Quantity">
            <option>Qty: 1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
          <button class="add-btn js-add-to-cart-btn" data-product-id="${product.id}">
            <span class="btn-label-default">Add to Cart</span>
            <span class="btn-label-added">✓ Added</span>
          </button>
        </div>
      </div>
    </article>
  `;
});

document.querySelector(".js-products-grid").innerHTML = productsHTML;

function updateCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((item) => {
    cartQuantity += item.quantity;
  });

  const cartCountElement = document.querySelector(".js-cart-count");
  if (cartCountElement) {
    cartCountElement.innerHTML = cartQuantity;
  }
}

document.querySelectorAll(".js-add-to-cart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const productId = button.dataset.productId;

    addToCart(productId);
    updateCartQuantity();
  });
});

updateCartQuantity();

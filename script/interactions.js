// interactions.js
// Adds search + category filtering, quantity-aware "Add to Cart", and a
// couple of small UX touches on top of the existing swiftmart.js / cart.js
// modules — nothing in those two files is modified or re-implemented here.
// This script must load AFTER script/swiftmart.js so the product grid
// already exists in the DOM by the time it runs.

import { cart, addToCart } from "../data/cart.js";
import { products } from "../data/product.js";

// Chip label -> the keyword(s) we match against each product's `keywords`
// array. Extend this map if you add more categories or products.
const CATEGORY_KEYWORDS = {
  All: null,
  Electronics: ["electronics"],
  "Home & Kitchen": ["home", "kitchen"],
  Fashion: ["fashion"],
  Beauty: ["beauty"],
  "Sports & Outdoors": ["sports", "fitness", "outdoors"],
  Books: ["books"],
  Toys: ["toys"],
};

const grid = document.querySelector(".js-products-grid");
const chipRow = document.querySelector(".js-chip-row");
const searchForm = document.querySelector(".js-search-form");
const searchInput = document.querySelector(".js-search-input");
const categorySelect = document.querySelector(".js-category-select");
const resultsCount = document.querySelector(".js-results-count");

let activeCategory = "All";

// Map each rendered card back to its product record by reading the
// data-product-id already printed onto the Add to Cart button in
// swiftmart.js — no need to touch that render logic at all.
function getCardProductMap() {
  const map = new Map();
  document.querySelectorAll(".js-add-to-cart-btn").forEach((btn) => {
    const card = btn.closest(".product-card");
    const product = products.find((p) => p.id === btn.dataset.productId);
    if (card && product) map.set(card, product);
  });
  return map;
}

function productMatches(product, category, query) {
  const haystack = [product.name, ...(product.keywords || [])]
    .join(" ")
    .toLowerCase();

  const matchesCategory =
    category === "All" ||
    !CATEGORY_KEYWORDS[category] ||
    CATEGORY_KEYWORDS[category].some((kw) => haystack.includes(kw));

  const matchesQuery = query === "" || haystack.includes(query);

  return matchesCategory && matchesQuery;
}

function ensureNoResultsEl() {
  let el = grid.querySelector(".js-no-results");
  if (!el) {
    el = document.createElement("div");
    el.className = "no-results js-no-results";
    el.innerHTML = `<strong>No products match your search</strong>Try a different keyword or category.`;
    grid.appendChild(el);
  }
  return el;
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const cardMap = getCardProductMap();
  let visibleCount = 0;

  cardMap.forEach((product, card) => {
    const visible = productMatches(product, activeCategory, query);
    card.classList.toggle("is-hidden", !visible);
    if (visible) visibleCount += 1;
  });

  const noResultsEl = ensureNoResultsEl();
  noResultsEl.style.display = visibleCount === 0 ? "block" : "none";

  if (resultsCount) {
    resultsCount.textContent = `${visibleCount} result${visibleCount === 1 ? "" : "s"}`;
  }
}

function setActiveCategory(category) {
  activeCategory = category;

  chipRow.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.category === category);
  });

  if (categorySelect && categorySelect.value !== category) {
    categorySelect.value = category;
  }

  applyFilters();
}

// ---- Category chips ----
if (chipRow) {
  chipRow.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.addEventListener("click", () =>
      setActiveCategory(chip.dataset.category),
    );
    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActiveCategory(chip.dataset.category);
      }
    });
  });
}

// ---- Category select (inside the search bar) ----
if (categorySelect) {
  categorySelect.addEventListener("change", () => {
    setActiveCategory(categorySelect.value);
  });
}

// ---- Search input: live filtering as you type, debounced ----
if (searchInput) {
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 150);
  });
}

// ---- Search form submit: filter immediately, no page reload ----
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    applyFilters();
    document
      .getElementById("grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// ---- Quantity-aware Add to Cart + "Added" feedback pulse ----
// swiftmart.js already adds 1 unit per click and updates the cart count.
// This listens on the same buttons to (a) add any *extra* units the
// shopper picked in the qty <select>, and (b) flash the "Added" state.
function refreshCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.querySelector(".js-cart-count");
  if (el) el.textContent = total;
}

document.querySelectorAll(".js-add-to-cart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    const qtySelect = card?.querySelector(".qty-select");
    const selectedQty = qtySelect ? Number(qtySelect.selectedIndex) + 1 : 1;

    // swiftmart.js's own listener already added 1 unit for this click.
    for (let i = 1; i < selectedQty; i++) {
      addToCart(button.dataset.productId);
    }
    refreshCartCount();

    if (qtySelect) qtySelect.selectedIndex = 0;

    button.classList.add("is-added");
    window.clearTimeout(button._addedTimer);
    button._addedTimer = window.setTimeout(() => {
      button.classList.remove("is-added");
    }, 1200);
  });
});

// Initial paint of the results count once the grid is in the DOM.
const initialCategory = new URLSearchParams(window.location.search).get(
  "category",
);
if (initialCategory && CATEGORY_KEYWORDS.hasOwnProperty(initialCategory)) {
  setActiveCategory(initialCategory);
} else {
  applyFilters();
}

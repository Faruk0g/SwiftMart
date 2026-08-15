export let cart = JSON.parse(localStorage.getItem("cart")) || [];

export function addToCart(productId) {
  const matchingItem = cart.find((item) => item.productId === productId);

  if (matchingItem) {
    matchingItem.quantity += 1;
  } else {
    cart.push({
      productId: productId,
      quantity: 1,
      deliveryOptionId: "1",
    });
  }
  saveToStorage();
}

export function removeFromCart(productId) {
  const newCart = [];
  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });
  cart = newCart;
  saveToStorage();
}

export function updateQuantity(productId, newQuantity) {
  const matchingItem = cart.find((item) => item.productId === productId);
  if (!matchingItem) {
    return;
  }

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  matchingItem.quantity = newQuantity;
  saveToStorage();
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  const matchingItem = cart.find((item) => item.productId === productId);
  if (!matchingItem) {
    return;
  }

  matchingItem.deliveryOptionId = deliveryOptionId;
  saveToStorage();
}

export function clearCart() {
  cart = [];
  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

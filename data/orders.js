const ORDERS_KEY = "orders";

function loadOrders() {
  const saved = JSON.parse(localStorage.getItem(ORDERS_KEY));
  return saved || [];
}

export function getOrders() {
  return loadOrders();
}

export function saveOrder(order) {
  const orders = loadOrders();
  orders.unshift(order); // newest order first
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrderById(orderId) {
  const orders = loadOrders();
  return orders.find((order) => order.id === orderId) || null;
}

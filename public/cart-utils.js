// Function to update cart count
export function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementsByClassName("cart-count")[0];
  if (cartCount) {
    // Calculate total quantity
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalQuantity;
  }
}

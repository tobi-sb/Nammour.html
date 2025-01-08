import data from "./data.js";
import { supabase } from "./supabase.js";
import { updateCartCount } from "./cart-utils.js";

// Function to check authentication
async function checkAuthBeforeCheckout() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      // Save return URL
      localStorage.setItem("returnToCheckout", "true");
      window.location.href = "/login.html";
      return false;
    }
    return true;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

// Cart Management
const cartManager = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    if (document.getElementById("cartContainer")) {
      this.displayCartItems();
      // Update cart count when initializing
      updateCartCount();
    }
  },

  displayCartItems() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cartContainer");

    if (!cartContainer) return;

    // Clear everything first
    cartContainer.innerHTML = "";

    if (cartItems.length === 0) {
      cartContainer.innerHTML = "<p>Votre panier est vide</p>";
      return;
    }

    // Create table HTML string directly
    let tableHTML = `
      <div style="width: 100%; overflow-x: auto;">
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Product</th>
              <th colspan="1" scope="col">Quantity</th>
              <th colspan="1" scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalAmount = 0;

    // Add each cart item
    cartItems.forEach((item) => {
      const itemTotal = item.product.pVal * item.quantity;
      totalAmount += itemTotal;

      tableHTML += `
        <tr class="cart-item-row">
          <td>
            <div class="cart-product-info">
              <img src="${item.product.pImages["i1"]}" alt="product image" class="cart-img">
              <div class="m-20">
                <p>${item.product.pTitle}</p> 
                <p>€ ${item.product.pAmount}</p>
                <p>Taille: ${item.product.size}</p>
              </div> 
            </div>
          </td>
          <td class="">
            <div class="flex-row">
              <div class="flex-row info-qty" product-id="${item.product.id}">
                <button class="btn-qty minus">-</button>
                <input type="text" value="${item.quantity}" min="1" class="quantity">
                <button class="btn-qty plus">+</button>
              </div>    
              <button product-id="${item.product.id}" class="btn-remove">Supprimer</button> 
            </div>
          </td>
          <td>€ ${itemTotal}</td>
        </tr>
      `;
    });

    // Add total row
    tableHTML += `
        <tr class="cart-total-row">
          <td colspan="2" style="text-align: right; font-weight: bold;">Total:</td>
          <td style="font-weight: bold;">€ ${totalAmount}</td>
        </tr>
      </tbody>
      </table>
      </div>
    `;

    // Set the HTML content once
    cartContainer.innerHTML = tableHTML;

    // Re-attach event listeners after rendering
    this.attachEventListeners();
  },

  attachEventListeners() {
    this.attachRemoveEventListeners();
    this.attachQuantityEventListeners();
  },

  attachRemoveEventListeners() {
    const removeButtons = document.querySelectorAll(".btn-remove");
    removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("product-id");
        this.removeCartItem(productId);
      });
    });
  },

  attachQuantityEventListeners() {
    const minusButtons = document.querySelectorAll(".btn-qty.minus");
    const plusButtons = document.querySelectorAll(".btn-qty.plus");

    minusButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const quantityInput = e.target.nextElementSibling;
        const productId = e.target.parentElement.getAttribute("product-id");
        const newQuantity = parseInt(quantityInput.value) - 1;
        if (newQuantity >= 1) {
          quantityInput.value = newQuantity;
          this.updateCartItemQuantity(productId, newQuantity);
        }
      });
    });

    plusButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const quantityInput = e.target.previousElementSibling;
        const productId = e.target.parentElement.getAttribute("product-id");
        const newQuantity = parseInt(quantityInput.value) + 1;
        quantityInput.value = newQuantity;
        this.updateCartItemQuantity(productId, newQuantity);
      });
    });
  },

  updateCartItemQuantity(productId, quantity) {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItem = cartItems.find((item) => item.product.id === productId);
    if (cartItem) {
      cartItem.quantity = quantity;
      localStorage.setItem("cart", JSON.stringify(cartItems));
      this.displayCartItems();
      // Update cart count when quantity changes
      updateCartCount();
    }
  },

  removeCartItem(productId) {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    cartItems = cartItems.filter((item) => item.product.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cartItems));
    this.displayCartItems();
    // Update cart count when item is removed
    updateCartCount();
  },
};

// Initialize cart when DOM is loaded
document.addEventListener("DOMContentLoaded", () => cartManager.init());

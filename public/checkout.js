import { supabase } from "./supabase.js";

// Constants
const STRIPE_PUBLIC_KEY =
  "pk_test_51QeIGwFQND1i0vCyTtKBECEYyJBR2402P3aR2GXgvBBiynK9CO1671PISH4wKAljlM7vYLF4zGy5393NxMUbYr7100jCCyGzab";
const PAYMENT_CONFIG = {
  appearance: {
    theme: "stripe",
    variables: {
      colorPrimary: "#103948",
      colorBackground: "#ffffff",
      colorText: "#103948",
      colorDanger: "#df1b41",
      fontFamily: "New York, system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
      fontSizeBase: "15px",
    },
    rules: {
      ".Tab": {
        border: "1px solid #E6DFD6",
        boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.03)",
      },
      ".Tab:hover": {
        color: "#103948",
      },
      ".Tab--selected": {
        borderColor: "#103948",
        boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.03)",
      },
      ".Label": {
        fontWeight: "500",
      },
      ".Input": {
        padding: "12px",
        borderColor: "#E6DFD6",
      },
      ".Input:focus": {
        borderColor: "#103948",
        boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.03)",
      },
    },
  },
};

// Initialize Stripe
const stripe = Stripe(STRIPE_PUBLIC_KEY, {
  locale: "fr",
});
let elements;

// DOM Elements
const domElements = {
  form: document.querySelector("#payment-form"),
  message: document.querySelector("#payment-message"),
  submit: document.querySelector("#submit"),
  spinner: document.querySelector("#spinner"),
  buttonText: document.querySelector("#button-text"),
  dpmChecker: document.querySelector("#dpm-integration-checker"),
};

// Get cart items from localStorage
function getCartItems() {
  const cartItems = localStorage.getItem("cart");
  return cartItems ? JSON.parse(cartItems) : [];
}

// Display cart summary
function displayCartSummary() {
  const cartContainer = document.getElementById("cartContainer");
  const items = getCartItems();

  if (!cartContainer || !items.length) return;

  let total = 0;
  const html = `
    <div class="cart-summary">
      <h4>Résumé de la commande</h4>
      <div class="cart-items">
        ${items
          .map((item) => {
            const amount =
              item.product.pVal ||
              parseFloat(item.product.pAmount.replace(",", ".")) ||
              0;
            const itemTotal = amount * item.quantity;
            total += itemTotal;
            return `
            <div class="cart-item">
              <div class="item-details">
                <span class="item-title">${item.product.pTitle}</span>
                <span class="item-quantity">Quantité: ${item.quantity}</span>
              </div>
              <span class="item-price">${itemTotal.toFixed(2)} €</span>
            </div>
          `;
          })
          .join("")}
      </div>
      <div class="cart-total">
        <span>Total</span>
        <span>${total.toFixed(2)} €</span>
      </div>
    </div>
  `;

  cartContainer.innerHTML = html;
  cartContainer.classList.add("cart-container");
}

// Check authentication
async function checkAuth() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
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

// Initialize only if we're on the payment form page
if (document.querySelector("#payment-form")) {
  checkAuthAndInitialize();
  displayCartSummary();
}

// Check auth before initializing payment
async function checkAuthAndInitialize() {
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    initialize();
  }
}

// Fetches a payment intent and captures the client secret
async function initialize() {
  try {
    const items = getCartItems();
    if (!items.length) {
      showMessage("Votre panier est vide");
      return;
    }

    // Log cart items for debugging
    console.log("Cart items:", JSON.stringify(items, null, 2));

    const response = await fetch("/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.error?.message || "Failed to create payment intent"
      );
    }

    const { clientSecret } = responseData;
    if (!clientSecret) {
      throw new Error("No client secret received from server");
    }

    console.log("Payment intent created successfully");

    elements = stripe.elements({
      clientSecret,
      appearance: PAYMENT_CONFIG.appearance,
      locale: "fr",
    });

    const paymentElement = elements.create("payment", {
      layout: "tabs",
      defaultValues: {
        billingDetails: {
          name: "auto",
          email: "auto",
        },
      },
      business: {
        name: "Un Namour de Bougies",
      },
      paymentMethodOrder: ["card"],
      payment_method_types: ["card"],
      fields: {
        billingDetails: "auto",
      },
    });

    paymentElement.on("ready", function () {
      console.log("Payment element ready");
    });

    paymentElement.on("loaderror", function (event) {
      console.error("Payment element loading error:", event);
      if (event.error) {
        showMessage(
          `Erreur: ${
            event.error.message ||
            "Erreur lors du chargement du formulaire de paiement"
          }`
        );
      } else {
        showMessage(
          "Erreur lors du chargement du formulaire de paiement. Veuillez réessayer."
        );
      }
    });

    await paymentElement.mount("#payment-element");
    console.log("Payment element mounted successfully");

    // Add submit event listener
    domElements.form.addEventListener("submit", handleSubmit);
  } catch (error) {
    console.error("Initialization error:", error);
    showMessage(
      error.message ||
        "Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer."
    );
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    console.log("Starting payment confirmation...");
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.protocol}//${window.location.host}/complete.html`,
      },
    });

    if (error) {
      console.error("Payment confirmation error:", error);
      const message =
        error.type === "card_error" || error.type === "validation_error"
          ? error.message
          : "Une erreur inattendue s'est produite.";
      showMessage(message);
    }
  } catch (err) {
    console.error("Payment error:", err);
    showMessage("Une erreur inattendue s'est produite.");
  } finally {
    setLoading(false);
  }
}

// UI helpers
function showMessage(messageText) {
  if (!domElements.message) return;

  console.log("Showing message:", messageText);
  domElements.message.classList.remove("hidden");
  domElements.message.textContent = messageText;

  setTimeout(() => {
    domElements.message.classList.add("hidden");
    domElements.message.textContent = "";
  }, 4000);
}

function setLoading(isLoading) {
  if (!domElements.submit || !domElements.spinner || !domElements.buttonText)
    return;

  domElements.submit.disabled = isLoading;
  domElements.spinner.classList.toggle("hidden", !isLoading);
  domElements.buttonText.classList.toggle("hidden", isLoading);
}

function setDpmCheckerLink(url) {
  if (!domElements.dpmChecker) return;
  domElements.dpmChecker.href = url;
}

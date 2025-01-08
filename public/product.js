import data from "./data.js";
import { updateCartCount } from "./cart-utils.js";

document.addEventListener("DOMContentLoaded", function () {
  // Récupérer l'ID du produit depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // Trouver le produit correspondant dans le tableau data
  const product = data.find((p) => p.id === productId);

  // Valider le produit
  if (!product) {
    console.error("Produit non trouvé");
    window.location.href = "./catalouge.html";
    return;
  }

  const modal = document.querySelector("#myModal");
  const MainImg = document.getElementById("MainImg");
  const smallImgGroup = document.getElementById("smallGroup");
  const numberInput = document.getElementById("numberInput");
  const btnPlus = document.querySelector(".plus.btn-quantity");
  const btnMinus = document.querySelector(".minus.btn-quantity");
  const btnCart = document.getElementById("addToCart");

  btnMinus.addEventListener("click", function () {
    if (numberInput.value > 1) {
      numberInput.stepDown();
    }
  });

  btnPlus.addEventListener("click", function () {
    numberInput.stepUp();
  });

  function displayProduct(product) {
    if (!product) {
      console.error("Produit non trouvé");
      return;
    }

    document.getElementById("product-cat").innerText = product.pCat || "";
    document.getElementById("product-title").innerText = product.pTitle || "";
    document.getElementById("product-description").innerText =
      product.pDes || "";
    document.getElementById("product-amount").innerText = product.pAmount || "";

    // Nettoyer le groupe d'images
    if (smallImgGroup) {
      smallImgGroup.innerHTML = "";
    }

    // Afficher les images du produit
    const images = product.pImages || {};
    const imgNum = Object.keys(images).length;

    if (imgNum > 0) {
      // Définir l'image principale
      MainImg.src = images.i1;
      MainImg.alt = product.pTitle;

      // Créer les petites images
      Object.entries(images).forEach(([key, imgUrl]) => {
        const imgContainer = document.createElement("div");
        imgContainer.className = "small-img-col";

        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = `${product.pTitle} - Vue ${key}`;
        img.className = "small-img";

        // Ajouter le gestionnaire d'événements pour chaque petite image
        img.onclick = function () {
          MainImg.src = this.src;
        };

        imgContainer.appendChild(img);
        smallImgGroup.appendChild(imgContainer);
      });
    }
  }

  btnCart.addEventListener("click", function () {
    addToCart(product);
  });

  function addToCart(product) {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const quantity = parseInt(numberInput.value, 10) || 1;

    const cartItem = {
      product: product,
      quantity: quantity,
    };

    const existingCartItem = cart.find(
      (item) => item.product.id === product.id
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // Mettre à jour le compteur du panier
    updateCartCount();

    // Afficher la notification
    showMessage("Produit ajouté au panier !", "success");
  }

  // Message display functionality
  function showMessage(message, type = "success") {
    const existingMessage = document.querySelector(".message-container");
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageContainer = document.createElement("div");
    messageContainer.className = `message-container ${type}`;
    messageContainer.textContent = message;

    document.body.appendChild(messageContainer);

    setTimeout(() => {
      messageContainer.remove();
    }, 3000);
  }

  // Afficher le produit initial
  displayProduct(product);

  // Gestionnaire pour fermer la modal
  const closeButton = document.querySelector(".btn-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }
});

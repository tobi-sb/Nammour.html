import data from "./data.js";
import { updateCartCount } from "./cart-utils.js";

// Filtrer les produits selon la page
function filterProductsByPage() {
  const currentPage = decodeURIComponent(
    window.location.pathname.split("/").pop().toLowerCase()
  );
  console.log("Page actuelle:", currentPage); // Pour déboguer

  switch (currentPage) {
    case "bougie-bijoux.html":
      return data.filter((p) => p.pCat === "Bougie Bijoux");
    case "bougies-gourmandes.html":
      return data.filter(
        (p) => p.pCat === "Bougies gourmandes" || p.pCat === "Bougie Gourmande"
      );
    case "brûleurs-diffuseurs.html":
    case "bruleurs-diffuseurs.html":
      console.log("Recherche des brûleurs...");
      const bruleurs = data.filter((p) => {
        console.log("Vérifie produit:", p.pTitle, "Catégorie:", p.pCat);
        return p.pCat === "Brûleur" || p.pCat === "Brûleurs / Diffuseurs";
      });
      console.log("Brûleurs trouvés:", bruleurs.length);
      return bruleurs;
    case "galets-fondants.html":
      return data.filter((p) => p.pCat === "Galets / Fondants");
    case "poudre-magique.html":
      return data.filter((p) => p.pCat === "Poudre Magique");
    case "bougie-de-massage.html":
      return data.filter((p) => p.pCat === "Bougie de Massage");
    case "catalouge.html":
      return data;
    default:
      console.log("Aucune correspondance trouvée pour:", currentPage); // Pour déboguer
      return [];
  }
}

// Fonction pour afficher les produits
function displayProducts(products) {
  const productsContainer = document.querySelector(".products");
  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const productHTML = `
      <a href="sproduct.html?id=${product.id}" class="product-item" id="${
      product.id
    }">
        <div class="image-wrapper">
          <img src="${
            product.pImages.i1
          }" alt="Product Image" class="img-product-00" data-hover-image="${
      product.pImages.i2 ?? product.pImages.i1
    }"/>
        </div>
        <h3>${product.pTitle}</h3>
        <p>Du €${product.pAmount} EUR</p>
      </a>
    `;
    productsContainer.innerHTML += productHTML;
  });

  // Mettre à jour le compteur de produits
  document.getElementById("product_count").textContent = products.length;
  document.getElementById("stock_count").textContent = products.length;

  // Ajouter les gestionnaires d'événements après avoir créé les éléments
  const productLinks = document.querySelectorAll(".product-item");
  productLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const productId = this.id;
      window.location.href = `sproduct.html?id=${productId}`;
    });
  });
}

// Fonction pour trier les produits
function sortProducts(products, sortBy) {
  switch (sortBy) {
    case "title-ascending":
      return [...products].sort((a, b) => a.pTitle.localeCompare(b.pTitle));
    case "title-descending":
      return [...products].sort((a, b) => b.pTitle.localeCompare(a.pTitle));
    case "price-ascending":
      return [...products].sort(
        (a, b) =>
          parseFloat(a.pAmount.replace(",", ".")) -
          parseFloat(b.pAmount.replace(",", "."))
      );
    case "price-descending":
      return [...products].sort(
        (a, b) =>
          parseFloat(b.pAmount.replace(",", ".")) -
          parseFloat(a.pAmount.replace(",", "."))
      );
    default:
      return products;
  }
}

// Fonction pour filtrer les produits par prix
function filterByPrice(products, minPrice, maxPrice) {
  return products.filter((product) => {
    const price = parseFloat(product.pAmount.replace(",", "."));
    if (minPrice && maxPrice) {
      return price >= minPrice && price <= maxPrice;
    } else if (minPrice) {
      return price >= minPrice;
    } else if (maxPrice) {
      return price <= maxPrice;
    }
    return true;
  });
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  // Filtrer les produits selon la page actuelle
  const filteredProducts = filterProductsByPage();

  // Afficher les produits filtrés
  displayProducts(filteredProducts);

  // Mettre à jour le compteur du panier
  updateCartCount();

  // Gérer le tri
  const sortSelect = document.getElementById("SortBy");
  sortSelect.addEventListener("change", (e) => {
    const sortedProducts = sortProducts(filteredProducts, e.target.value);
    displayProducts(sortedProducts);
  });

  // Gérer le filtre de prix
  const minPriceInput = document.getElementById("min_price");
  const maxPriceInput = document.getElementById("max_price");

  function handlePriceFilter() {
    const minPrice = parseFloat(minPriceInput.value);
    const maxPrice = parseFloat(maxPriceInput.value);
    const priceFilteredProducts = filterByPrice(
      filteredProducts,
      minPrice,
      maxPrice
    );
    displayProducts(priceFilteredProducts);
  }

  minPriceInput.addEventListener("input", handlePriceFilter);
  maxPriceInput.addEventListener("input", handlePriceFilter);

  // Afficher le prix le plus élevé
  const highestPrice = Math.max(
    ...filteredProducts.map((p) => parseFloat(p.pAmount.replace(",", ".")))
  );
  document.getElementById("highest_price").textContent =
    highestPrice.toFixed(2);
});

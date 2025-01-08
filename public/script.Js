// Hamburg Menu
function toggleMenu() {
  var menu = document.getElementById("menu");
  var hamburgerIcon = document.getElementById("hamburger-icon");
  var closeIcon = document.getElementById("close-icon");

  // Check if the menu is currently open
  if (menu.classList.contains("open")) {
    // If it is, close the menu
    menu.classList.remove("open");
    hamburgerIcon.style.display = "inline"; // Show hamburger icon
    closeIcon.style.display = "none"; // Hide close icon
  } else {
    // If it is not, open the menu
    menu.classList.add("open");
    hamburgerIcon.style.display = "none"; // Hide hamburger icon
    closeIcon.style.display = "inline"; // Show close icon
  }
}

//Search option
function toggleSearch() {
  const searchIcon = document.getElementById("search-icon");
  const searchDiv = document.getElementById("search-div");

  searchIcon.style.display = "none";
  searchDiv.style.display = "flex";
}

//Search close
function closeSearch() {
  const searchDiv = document.getElementById("search-div");
  const searchIcon = document.getElementById("search-icon");

  searchDiv.style.display = "none";
  searchIcon.style.display = "block";
}

// Make functions globally accessible
window.toggleMenu = toggleMenu;
window.toggleSearch = toggleSearch;
window.closeSearch = closeSearch;

// Home page ---------------->Product slider
function initializeSlider() {
  const track = document.querySelector(".slider-track");
  const items = document.querySelectorAll(".slider-item");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  if (!track || !items.length || !prevBtn || !nextBtn) return;

  const itemsToShow = 4;
  let itemWidth = items[0].offsetWidth;
  let currentIndex = 0;

  function moveSlider() {
    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  }

  nextBtn.addEventListener("click", function () {
    if (currentIndex < items.length - itemsToShow) {
      currentIndex++;
      moveSlider();
    }
  });

  prevBtn.addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      moveSlider();
    }
  });

  window.addEventListener("resize", function () {
    track.style.transition = "none";
    itemWidth = items[0].offsetWidth;
    moveSlider();
    track.style.transition = "transform 0.4s ease-in-out";
  });
}

// Initialisation quand le DOM est chargé
document.addEventListener("DOMContentLoaded", function () {
  initializeSlider();
});

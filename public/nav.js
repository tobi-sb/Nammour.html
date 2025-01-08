var prevScrollpos = window.pageYOffset;
window.onscroll = function () {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    if (window.scrollY > 100) {
      navbar.style.position = "fixed";
      navbar.style.top = "0";
      navbar.style.left = "0";
      navbar.style.width = "100%";
      navbar.style.zIndex = "1000";
      navbar.style.backgroundColor = "#fff";
      navbar.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    } else {
      navbar.style.position = "relative";
      navbar.style.boxShadow = "none";
    }
  }
};

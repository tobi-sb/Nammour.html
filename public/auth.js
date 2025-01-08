import { supabase } from "./supabase.js";

// Debug listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  console.log("Session:", session);
  if (event === "SIGNED_IN") {
    localStorage.setItem("user", JSON.stringify(session.user));
    updateAuthUI(true);
  } else if (event === "SIGNED_OUT") {
    localStorage.removeItem("user");
    updateAuthUI(false);
  }
});

// Tab switching functionality
document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons and forms
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".auth-form")
      .forEach((form) => form.classList.remove("active"));

    // Add active class to clicked button and corresponding form
    button.classList.add("active");
    document
      .getElementById(`${button.dataset.tab}-form`)
      .classList.add("active");
  });
});

// Login form submission
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        showMessage(
          "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception et vos spams.",
          "error"
        );
        return;
      }
      throw error;
    }

    // Login successful
    localStorage.setItem("user", JSON.stringify(data.user));
    showMessage("Connexion réussie!", "success");

    // Vérifier s'il faut rediriger vers le checkout
    const returnToCheckout = localStorage.getItem("returnToCheckout");
    localStorage.removeItem("returnToCheckout"); // Nettoyer après utilisation

    // Redirect after success message
    setTimeout(() => {
      if (returnToCheckout === "true") {
        window.location.href = "/cart.html";
      } else {
        window.location.href = "/index.html";
      }
    }, 1500);
  } catch (error) {
    console.error("Login error:", error);
    if (error.message.includes("Invalid login credentials")) {
      showMessage("Email ou mot de passe incorrect.", "error");
    } else {
      showMessage(
        error.message || "Erreur de connexion. Veuillez réessayer.",
        "error"
      );
    }
  }
});

// Register form submission
document
  .getElementById("register-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🟦 Début de l'inscription");

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    console.log("🟦 Données du formulaire:", {
      email,
      name,
      passwordLength: password.length,
    });

    try {
      console.log("🟦 Création du compte");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/index.html`,
        },
      });

      if (error) {
        console.error("🔴 Erreur Supabase:", error);
        if (error.message.includes("User already registered")) {
          showMessage(
            "Cet email est déjà utilisé. Veuillez en choisir un autre ou vous connecter.",
            "error"
          );
          return;
        }
        throw error;
      }

      if (data?.user) {
        console.log("🟢 Utilisateur créé:", data.user);
        showMessage(
          "Compte créé avec succès ! Un email de confirmation vous a été envoyé. Merci de vérifier votre boîte de réception et vos spams.",
          "success"
        );

        // Vérifier s'il faut rediriger vers le checkout après confirmation
        const returnToCheckout = localStorage.getItem("returnToCheckout");
        if (returnToCheckout === "true") {
          showMessage(
            "Une fois votre email confirmé, vous pourrez finaliser votre commande !",
            "success"
          );
        }

        setTimeout(() => {
          document.querySelector('[data-tab="login"]').click();
        }, 4000);
      } else {
        console.warn("⚠️ Pas d'utilisateur dans la réponse:", data);
        showMessage(
          "Erreur lors de l'inscription. Veuillez réessayer.",
          "error"
        );
      }
    } catch (error) {
      console.error("🔴 Erreur complète:", error);
      let errorMessage = "Erreur d'inscription. ";

      if (error.message) {
        if (error.message.includes("password")) {
          errorMessage +=
            "Le mot de passe doit contenir au moins 6 caractères.";
        } else if (error.message.includes("email")) {
          errorMessage += "L'email n'est pas valide.";
        } else if (error.message.includes("rate limit")) {
          errorMessage =
            "Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.";
        } else {
          errorMessage += error.message;
        }
      }

      showMessage(errorMessage, "error");
    }
  });

// Logout functionality
async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    localStorage.removeItem("user");
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Logout error:", error);
    showMessage("Erreur de déconnexion. Veuillez réessayer.", "error");
  }
}

// Check authentication status on page load
async function checkAuth() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      localStorage.setItem("user", JSON.stringify(session.user));
      updateAuthUI(true);
    } else {
      localStorage.removeItem("user");
      updateAuthUI(false);
    }
  } catch (error) {
    console.error("Auth check error:", error);
  }
}

// Update UI based on auth status
function updateAuthUI(isAuthenticated) {
  const authIcon = document.querySelector(".auth-icon i");
  const authLink = document.querySelector(".auth-icon a");

  // Si les éléments n'existent pas, ne rien faire
  if (!authIcon || !authLink) {
    console.log("Auth UI elements not found");
    return;
  }

  if (isAuthenticated) {
    // Utilisateur connecté
    authIcon.className = "fa-solid fa-user-check";
    authLink.href = "/settings.html"; // Page des paramètres utilisateur
    authLink.onclick = null; // Enlever l'ancien event listener de logout

    // Ajouter un menu déroulant pour le logout
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = "auth-dropdown";

    // Ajouter le menu déroulant à l'icône
    const container = authLink.parentElement;
    if (container && !container.querySelector(".auth-dropdown")) {
      container.appendChild(dropdownMenu);
    }
  } else {
    // Utilisateur non connecté
    authIcon.className = "fa-solid fa-user";
    authLink.href = "/login.html";
    authLink.onclick = null;

    // Supprimer le menu déroulant s'il existe
    const dropdown = document.querySelector(".auth-dropdown");
    if (dropdown) {
      dropdown.remove();
    }
  }
}

// Message display functionality
function showMessage(message, type = "error") {
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

// Add message styles
const style = document.createElement("style");
style.textContent = `
    .message-container {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }
    
    .message-container.error {
        background-color: #ff4444;
    }
    
    .message-container.success {
        background-color: #00C851;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Make logout function globally available
window.logout = logout;

// Initialize auth check immediately
checkAuth();

// Also check auth state when the DOM is loaded (for safety)
document.addEventListener("DOMContentLoaded", checkAuth);

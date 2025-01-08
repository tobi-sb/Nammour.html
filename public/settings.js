import { supabase } from "./supabase.js";

// Check if user is authenticated
async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "./login.html";
    return;
  }
  return session.user;
}

// Load user profile
async function loadUserProfile(user) {
  // Display email
  document.getElementById("email").value = user.email;

  // Load and display full name
  document.getElementById("fullName").value =
    user.user_metadata?.full_name || "";
}

// Update profile
async function updateProfile(e) {
  e.preventDefault();

  const loadingSpinner = document.querySelector(".loading");
  loadingSpinner.style.display = "inline-block";

  try {
    const fullName = document.getElementById("fullName").value;

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) throw error;

    showMessage("Profil mis à jour avec succès!", "success");
  } catch (error) {
    console.error("Error updating profile:", error);
    showMessage(
      error.message || "Erreur lors de la mise à jour du profil",
      "error"
    );
  } finally {
    loadingSpinner.style.display = "none";
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

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await checkAuth();
    if (user) {
      await loadUserProfile(user);
      document
        .getElementById("profile-form")
        .addEventListener("submit", updateProfile);
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
    showMessage("Erreur lors du chargement des paramètres", "error");
  }
});

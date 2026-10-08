// Authentication Controller for login.html & signup.html
import { renderDemoBannerIfNeeded } from "./firebase-init.js";
import { loginUser, registerUser, resetPassword, requireGuest } from "./auth.js";

async function initAuth() {
  renderDemoBannerIfNeeded();
  await requireGuest();

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const forgotPwdLink = document.getElementById("forgot-password-link");
  const errorAlert = document.getElementById("auth-error-alert");

  function showError(msg) {
    if (!errorAlert) {
      alert(msg);
      return;
    }
    errorAlert.innerHTML = msg;
    errorAlert.style.display = "flex";
    errorAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearError() {
    if (!errorAlert) return;
    errorAlert.textContent = "";
    errorAlert.style.display = "none";
  }

  // Password toggle
  document.querySelectorAll(".btn-toggle-pwd").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈 Hide";
      } else {
        input.type = "password";
        btn.textContent = "👁️ Show";
      }
    });
  });

  // Auto-fill email if passed in query param (e.g. login.html?email=xyz@gmail.com)
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get("email");
  if (emailParam) {
    const loginEmailInput = document.getElementById("login-email");
    if (loginEmailInput) {
      loginEmailInput.value = emailParam;
      document.getElementById("login-password")?.focus();
    }
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();

      const email = document.getElementById("login-email")?.value;
      const password = document.getElementById("login-password")?.value;
      const submitBtn = loginForm.querySelector("button[type='submit']");

      if (!email || !password) {
        showError("Please enter both email and password.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Logging in...";

      try {
        await loginUser(email, password);
        window.location.href = "dashboard.html";
      } catch (err) {
        showError(err.message || "Failed to log in.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In";
      }
    });
  }

  // Handle Signup
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();

      const name = document.getElementById("signup-name")?.value;
      const email = document.getElementById("signup-email")?.value;
      const password = document.getElementById("signup-password")?.value;
      const confirmPassword = document.getElementById("signup-confirm-password")?.value;
      const submitBtn = signupForm.querySelector("button[type='submit']");

      if (!name || !email || !password) {
        showError("Please fill out all fields.");
        return;
      }

      if (password.length < 6) {
        showError("Password should be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        showError("Passwords do not match. Please verify.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Creating Account...";

      try {
        await registerUser({ name, email, password });
        window.location.href = "dashboard.html";
      } catch (err) {
        let msg = err.message || "Signup failed.";
        if (msg.includes("already exists") || (err.code === "auth/email-already-in-use")) {
          msg = `An account with <strong>${email}</strong> already exists. <a href="login.html?email=${encodeURIComponent(email)}" style="font-weight:700; text-decoration:underline; color:#991b1b; margin-left:6px; display:inline-block;">Click here to Log In &rarr;</a>`;
        }
        showError(msg);
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
      }
    });
  }

  // Forgot Password
  if (forgotPwdLink) {
    forgotPwdLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = prompt("Enter your email address to receive password reset instructions:");
      if (!email) return;

      try {
        const res = await resetPassword(email);
        alert(res.message || "Password reset link sent!");
      } catch (err) {
        alert(err.message || "Failed to send reset link.");
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}


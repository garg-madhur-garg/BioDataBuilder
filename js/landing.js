// Landing Page Controller
import { renderDemoBannerIfNeeded } from "./firebase-init.js";
import { getCurrentUser } from "./auth.js";

async function initLanding() {
  renderDemoBannerIfNeeded();

  // If already logged in, update CTA buttons to direct to Dashboard
  try {
    const user = await getCurrentUser();
    if (user) {
      const loginBtn = document.getElementById("nav-login-btn");
      const ctaBtn = document.getElementById("hero-cta-btn");
      if (loginBtn) {
        loginBtn.textContent = "Dashboard";
        loginBtn.href = "dashboard.html";
      }
      if (ctaBtn) {
        ctaBtn.textContent = "Go to My Biodata →";
        ctaBtn.href = "dashboard.html";
      }
    }
  } catch (e) {
    console.debug("User not logged in", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanding);
} else {
  initLanding();
}


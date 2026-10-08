// Firebase Initialization & Seamless Fallback Adapter
import { firebaseConfig } from "../firebase/firebase-config.js";

export const isConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID"
);

export let isDemoMode = !isConfigured;
export let app = null;
export let auth = null;
export let db = null;
export let firebaseModules = null;

export const firebaseReady = (async () => {
  if (!isConfigured) {
    console.info("⚡ Biodata Builder running in Demo Mode (placeholder credentials).");
    return { isDemoMode: true };
  }

  try {
    const [appMod, authMod, firestoreMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")
    ]);

    app = appMod.initializeApp(firebaseConfig);
    auth = authMod.getAuth(app);
    db = firestoreMod.getFirestore(app);
    firebaseModules = { appMod, authMod, firestoreMod };
    isDemoMode = false;
    console.log("🔥 Connected to Firebase project:", firebaseConfig.projectId);
    return { isDemoMode: false, app, auth, db };
  } catch (error) {
    console.warn("⚠️ Firebase CDN or init error, falling back to Demo Mode:", error);
    isDemoMode = true;
    return { isDemoMode: true };
  }
})();

// Wait for initialization
await firebaseReady;

// UI Helper: Display Demo Mode banner ONLY if in Demo Mode
export function renderDemoBannerIfNeeded() {
  if (!isDemoMode) {
    const existing = document.getElementById("demo-mode-banner");
    if (existing) existing.remove();
    return;
  }
  if (document.getElementById("demo-mode-banner")) return;

  const banner = document.createElement("div");
  banner.id = "demo-mode-banner";
  banner.className = "demo-mode-banner";
  banner.innerHTML = `
    <div class="demo-banner-content">
      <span class="demo-pill">DEMO MODE</span>
      <span>Firebase is not configured yet. Running locally so you can test all features right now.</span>
      <a href="docs/FIREBASE_SETUP.md" target="_blank" class="demo-setup-link">Setup Guide ↗</a>
    </div>
    <button class="demo-banner-close" aria-label="Dismiss banner" onclick="this.parentElement.remove()">✕</button>
  `;
  document.body.prepend(banner);
}

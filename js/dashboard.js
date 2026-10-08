// Dashboard Controller
import { renderDemoBannerIfNeeded } from "./firebase-init.js";
import { requireAuth, logoutUser } from "./auth.js";
import { loadBiodata, setBiodataStatus, exportBiodataAsJSON } from "./firestore.js";

async function initDashboard() {
  renderDemoBannerIfNeeded();
  const user = await requireAuth();
  if (!user) return;

  // Header user info
  const userDisplayName = user.displayName || user.email?.split("@")[0] || "User";
  const userGreetingEl = document.getElementById("user-greeting-name");
  const userBadgeNameEl = document.getElementById("user-badge-name");
  const userAvatarInitialEl = document.getElementById("user-avatar-initial");

  if (userGreetingEl) userGreetingEl.textContent = userDisplayName;
  if (userBadgeNameEl) userBadgeNameEl.textContent = userDisplayName;
  if (userAvatarInitialEl) userAvatarInitialEl.textContent = userDisplayName.charAt(0).toUpperCase();

  // Logout listener
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to log out?")) {
        await logoutUser();
      }
    });
  }

  // Load Biodata
  let currentBiodata = null;
  try {
    currentBiodata = await loadBiodata(user.uid, user);
    renderBiodataCard(currentBiodata);
  } catch (err) {
    console.error("Failed to load biodata:", err);
    alert("Could not load your biodata. Please check connection.");
  }

  function renderBiodataCard(data) {
    if (!data) return;

    const name = data.personal?.fullName || userDisplayName;
    const isPublished = data.status === "published";
    const lastUpdated = data.updatedAt
      ? new Date(data.updatedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "Recently";

    // Set card values
    const thumbImg = document.getElementById("dash-biodata-thumb");
    const titleEl = document.getElementById("dash-biodata-title");
    const statusBadge = document.getElementById("dash-status-badge");
    const updatedEl = document.getElementById("dash-updated-at");
    const templateEl = document.getElementById("dash-template-name");
    const urlDisplayEl = document.getElementById("dash-public-url");
    const publishBtn = document.getElementById("dash-publish-btn");

    if (thumbImg) {
      thumbImg.src = data.photos?.[0]?.src || "assets/images/profile.svg";
    }
    if (titleEl) titleEl.textContent = name;
    if (updatedEl) updatedEl.textContent = lastUpdated;
    if (templateEl) templateEl.textContent = (data.template || "Classic").toUpperCase();

    // Status Badge
    if (statusBadge) {
      if (isPublished) {
        statusBadge.className = "badge badge-published";
        statusBadge.textContent = "● Published Live";
      } else {
        statusBadge.className = "badge badge-draft";
        statusBadge.textContent = "○ Draft (Private)";
      }
    }

    // Publish / Unpublish button text
    if (publishBtn) {
      publishBtn.textContent = isPublished ? "Unpublish" : "Publish Live";
      publishBtn.className = isPublished ? "btn btn-outline" : "btn btn-primary";
    }

    // Public URL
    const slug = data.slug || "biodata";
    const origin = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, "");
    const fullPublicUrl = `${origin}/public.html?b=${slug}`;

    if (urlDisplayEl) {
      urlDisplayEl.textContent = fullPublicUrl;
    }

    // Copy URL Button
    const copyBtn = document.getElementById("dash-copy-url-btn");
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(fullPublicUrl);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied! ✓";
        setTimeout(() => (copyBtn.textContent = originalText), 2000);
      };
    }

    // WhatsApp Share Button
    const waBtn = document.getElementById("dash-whatsapp-share-btn");
    if (waBtn) {
      waBtn.onclick = () => {
        const msg = encodeURIComponent(
          `Namaste 🙏\n\nI would like to share the marriage biodata profile of ${name}.\n\nYou can view the complete biodata here:\n${fullPublicUrl}`
        );
        window.open(`https://wa.me/?text=${msg}`, "_blank");
      };
    }

    // Publish / Unpublish Toggle
    if (publishBtn) {
      publishBtn.onclick = async () => {
        const newStatus = isPublished ? "draft" : "published";
        publishBtn.disabled = true;
        publishBtn.textContent = "Updating...";

        try {
          const updated = await setBiodataStatus(user.uid, newStatus);
          currentBiodata = updated;
          renderBiodataCard(updated);
          alert(newStatus === "published" ? "🎉 Your biodata is now published live!" : "Biodata is now set to Draft (private).");
        } catch (e) {
          alert("Failed to update status. Please try again.");
        } finally {
          publishBtn.disabled = false;
        }
      };
    }

    // Backup JSON Export
    const exportBtn = document.getElementById("dash-export-json-btn");
    if (exportBtn) {
      exportBtn.onclick = () => {
        exportBiodataAsJSON(currentBiodata);
      };
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}

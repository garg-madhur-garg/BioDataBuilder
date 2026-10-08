// Firestore & LocalStorage Persistence Service
import { db, firebaseModules, isDemoMode, firebaseReady } from "./firebase-init.js";
import { sampleBiodata } from "./sample-data.js";
await firebaseReady;

const LOCAL_BIODATA_PREFIX = "biodata_doc_";
const LOCAL_SLUGS_KEY = "biodata_public_slugs";

// Generate slug from full name
export function slugify(text) {
  return (text || "my-biodata")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Helper to get clean human-readable doc key (email)
function getDocKey(identifier, userFallback = {}) {
  if (typeof identifier === "string" && identifier.includes("@")) {
    return identifier.toLowerCase().trim();
  }
  if (userFallback && userFallback.email) {
    return userFallback.email.toLowerCase().trim();
  }
  return identifier || "user";
}

// Load user's biodata
export async function loadBiodata(uid, userFallbackInfo = {}) {
  if (!uid && !userFallbackInfo?.email) return null;
  const docKey = getDocKey(uid, userFallbackInfo);

  if (isDemoMode || !db) {
    const raw = localStorage.getItem(LOCAL_BIODATA_PREFIX + docKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("Local data parse error", e);
      }
    }

    // Initialize with sample data tailored to user
    const initial = structuredClone(sampleBiodata);
    if (userFallbackInfo.displayName) {
      initial.personal.fullName = userFallbackInfo.displayName;
      initial.slug = slugify(userFallbackInfo.displayName);
    }
    if (userFallbackInfo.email) {
      initial.contact.email = userFallbackInfo.email;
    }
    localStorage.setItem(LOCAL_BIODATA_PREFIX + docKey, JSON.stringify(initial));
    return initial;
  }

  // Firebase Firestore Live
  try {
    const { firestoreMod } = firebaseModules;
    // Check clean email doc first, fallback to uid
    let docRef = firestoreMod.doc(db, "biodatas", docKey);
    let snap = await firestoreMod.getDoc(docRef);

    if (!snap.exists() && uid !== docKey) {
      const fallbackRef = firestoreMod.doc(db, "biodatas", uid);
      const fallbackSnap = await firestoreMod.getDoc(fallbackRef);
      if (fallbackSnap.exists()) {
        snap = fallbackSnap;
        docRef = fallbackRef;
      }
    }

    if (snap.exists()) {
      return snap.data();
    }

    // If new user, create clean initial draft
    const initial = structuredClone(sampleBiodata);
    if (userFallbackInfo.displayName) {
      initial.personal.fullName = userFallbackInfo.displayName;
      initial.slug = slugify(userFallbackInfo.displayName);
    }
    if (userFallbackInfo.email) {
      initial.contact.email = userFallbackInfo.email;
    }
    initial.userEmail = docKey;
    initial.updatedDate = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    await firestoreMod.setDoc(docRef, initial);
    return initial;
  } catch (error) {
    console.error("Firestore loadBiodata error:", error);
    if (error.code === "permission-denied" || (error.message && error.message.includes("permission"))) {
      throw new Error("⚠️ Firestore Permission Denied! Please publish rules in Firebase Console -> Firestore -> Rules tab.");
    }
    throw new Error("Unable to load biodata from server: " + (error.message || ""));
  }
}

// Save biodata
export async function saveBiodata(uid, data, userFallback = {}) {
  if (!uid && !data) throw new Error("Missing user or biodata information.");
  const docKey = getDocKey(uid, userFallback || { email: data.contact?.email });

  const readableDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const payload = {
    ...data,
    userEmail: docKey,
    updatedDate: readableDate
  };

  if (isDemoMode || !db) {
    localStorage.setItem(LOCAL_BIODATA_PREFIX + docKey, JSON.stringify(payload));
    
    // Save slug mapping
    if (payload.slug) {
      const slugs = JSON.parse(localStorage.getItem(LOCAL_SLUGS_KEY) || "{}");
      slugs[payload.slug] = docKey;
      localStorage.setItem(LOCAL_SLUGS_KEY, JSON.stringify(slugs));
    }
    return payload;
  }

  // Firebase Firestore Live
  try {
    const { firestoreMod } = firebaseModules;
    const docRef = firestoreMod.doc(db, "biodatas", docKey);
    await firestoreMod.setDoc(docRef, payload, { merge: true });

    // Update slug document if slug is set
    if (payload.slug) {
      const slugRef = firestoreMod.doc(db, "slugs", payload.slug);
      await firestoreMod.setDoc(slugRef, { email: docKey, status: payload.status || "draft" }, { merge: true });
    }

    return payload;
  } catch (error) {
    console.error("Firestore saveBiodata error:", error);
    if (error.code === "permission-denied" || (error.message && error.message.includes("permission"))) {
      throw new Error("⚠️ Firestore Permission Denied! Please publish rules in Firebase Console -> Firestore -> Rules tab.");
    }
    throw new Error("Unable to save biodata to cloud. Please check permissions or internet.");
  }
}

// Toggle Publish / Unpublish status
export async function setBiodataStatus(uid, status) {
  const current = await loadBiodata(uid);
  if (!current) throw new Error("Biodata not found");

  current.status = status; // 'published' or 'draft'
  return await saveBiodata(uid, current);
}

// Resolve public biodata by slug
export async function getBiodataBySlug(slug) {
  if (!slug) return null;

  if (isDemoMode || !db) {
    const slugs = JSON.parse(localStorage.getItem(LOCAL_SLUGS_KEY) || "{}");
    const uid = slugs[slug];
    if (uid) {
      const data = JSON.parse(localStorage.getItem(LOCAL_BIODATA_PREFIX + uid) || "null");
      if (data && data.status === "published") {
        return data;
      }
    }
    // Also check default sample
    if (slug === sampleBiodata.slug) {
      return { ...sampleBiodata, status: "published" };
    }
    return null;
  }

  // Firebase Firestore Live
  try {
    const { firestoreMod } = firebaseModules;
    const slugRef = firestoreMod.doc(db, "slugs", slug);
    const slugSnap = await firestoreMod.getDoc(slugRef);

    if (!slugSnap.exists()) return null;
    const slugData = slugSnap.data();
    const { status } = slugData;
    const targetKey = slugData.email || slugData.uid;

    if (status !== "published" || !targetKey) return null;

    const biodataRef = firestoreMod.doc(db, "biodatas", targetKey);
    const biodataSnap = await firestoreMod.getDoc(biodataRef);
    if (!biodataSnap.exists()) return null;

    return biodataSnap.data();
  } catch (error) {
    console.error("getBiodataBySlug error:", error);
    return null;
  }
}

// Export Biodata as JSON file download
export function exportBiodataAsJSON(data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.slug || "biodata"}-backup.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import Biodata from JSON file
export function parseBiodataJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.personal || !parsed.personal.fullName) {
      throw new Error("Invalid biodata format: missing personal information.");
    }
    return parsed;
  } catch (e) {
    throw new Error("Invalid JSON file. Please ensure it is a valid Biodata backup.");
  }
}

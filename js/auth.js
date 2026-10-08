// Authentication Service (Supports Firebase Auth & Demo Mode)
import { auth, db, firebaseModules, isDemoMode, firebaseReady } from "./firebase-init.js";
await firebaseReady;

const DEMO_USER_KEY = "biodata_active_user";
const DEMO_USERS_DB_KEY = "biodata_registered_users";

// Friendly error message mapper
export function getFriendlyErrorMessage(errorCode, defaultMsg = null) {
  switch (errorCode) {
    case "auth/operation-not-allowed":
      return "⚠️ Email/Password sign-in is not enabled in your Firebase Console! Please go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.";
    case "auth/unauthorized-domain":
      return "⚠️ Unauthorized domain in Firebase. Please add 'localhost' to Firebase Console -> Authentication -> Settings -> Authorized domains.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please log in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again in a few moments.";
    default:
      return defaultMsg || "Something went wrong. Please check your details and try again.";
  }
}

// Get current logged-in user
export async function getCurrentUser() {
  if (isDemoMode || !auth) {
    const stored = localStorage.getItem(DEMO_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 2000);

    const { authMod } = firebaseModules;
    const unsubscribe = authMod.onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split("@")[0],
            photoURL: user.photoURL || null
          });
        } else {
          resolve(null);
        }
      }
    });
  });
}

// Sign up new user
export async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Please fill in all required fields.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  if (isDemoMode || !auth) {
    // Demo Mode registration
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_DB_KEY) || "[]");
    const exists = users.find((u) => u.email === cleanEmail);
    if (exists) {
      throw new Error("An account with this email already exists. Please log in.");
    }

    const newUser = {
      uid: cleanEmail,
      displayName: name.trim(),
      email: cleanEmail,
      date: cleanDate
    };

    users.push({ ...newUser, password });
    localStorage.setItem(DEMO_USERS_DB_KEY, JSON.stringify(users));
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
    return newUser;
  }

  // Firebase Live Auth
  try {
    const { authMod, firestoreMod } = firebaseModules;
    const cred = await authMod.createUserWithEmailAndPassword(auth, cleanEmail, password);
    await authMod.updateProfile(cred.user, { displayName: name.trim() });

    // Store simple, clean data in Firestore /users/{email} (Readable Document ID)
    if (db && firestoreMod) {
      try {
        const userRef = firestoreMod.doc(db, "users", cleanEmail);
        await firestoreMod.setDoc(userRef, {
          name: name.trim(),
          email: cleanEmail,
          password: password,
          loginMethod: "Email & Password",
          date: cleanDate
        });
        console.log("✅ Clean user credentials saved in Firestore /users/" + cleanEmail);
      } catch (err) {
        console.warn("Could not write to users collection:", err);
      }
    }

    return {
      uid: cred.user.uid,
      displayName: name.trim(),
      email: cred.user.email
    };
  } catch (error) {
    console.error("Firebase registerUser error:", error);
    throw new Error(getFriendlyErrorMessage(error.code, error.message));
  }
}

// Log in user
export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("Please enter both email and password.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  if (isDemoMode || !auth) {
    // Demo Mode login
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_DB_KEY) || "[]");
    let user = users.find((u) => u.email === cleanEmail);

    if (!user) {
      user = {
        uid: cleanEmail,
        displayName: cleanEmail.split("@")[0],
        email: cleanEmail,
        date: cleanDate
      };
      users.push({ ...user, password });
      localStorage.setItem(DEMO_USERS_DB_KEY, JSON.stringify(users));
    } else if (user.password !== password) {
      throw new Error("Incorrect email or password. Please try again.");
    }

    const sessionUser = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  }

  // Firebase Live Auth
  try {
    const { authMod, firestoreMod } = firebaseModules;
    const cred = await authMod.signInWithEmailAndPassword(auth, cleanEmail, password);

    // Ensure complete user record in Firestore /users/{email}
    if (db && firestoreMod) {
      try {
        const userRef = firestoreMod.doc(db, "users", cleanEmail);
        const nameFallback = cred.user.displayName || cleanEmail.split("@")[0];
        await firestoreMod.setDoc(userRef, {
          name: nameFallback,
          email: cleanEmail,
          password: password,
          loginMethod: "Email & Password",
          lastLogin: cleanDate,
          date: cleanDate
        }, { merge: true });
        console.log("✅ User record synchronized in Firestore /users/" + cleanEmail);
      } catch (err) {
        console.warn("Could not update users collection on login:", err);
      }
    }

    return {
      uid: cred.user.uid,
      displayName: cred.user.displayName || cred.user.email.split("@")[0],
      email: cred.user.email
    };
  } catch (error) {
    console.error("Firebase loginUser error:", error);
    throw new Error(getFriendlyErrorMessage(error.code, error.message));
  }
}

// Password reset
export async function resetPassword(email) {
  if (!email) {
    throw new Error("Please enter your email address.");
  }

  if (isDemoMode || !auth) {
    return { message: "Demo Mode: Password reset instructions simulated for " + email };
  }

  try {
    const { authMod } = firebaseModules;
    await authMod.sendPasswordResetEmail(auth, email.trim());
    return { message: "Password reset instructions sent to your email." };
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error.code));
  }
}

// Sign out
export async function logoutUser() {
  if (isDemoMode || !auth) {
    localStorage.removeItem(DEMO_USER_KEY);
    window.location.href = "login.html";
    return;
  }

  try {
    const { authMod } = firebaseModules;
    await authMod.signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Sign out error:", error);
    window.location.href = "login.html";
  }
}

// Protect route (redirects to login if not authenticated)
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

// Guest only route (redirects to dashboard if already authenticated)
export async function requireGuest() {
  const user = await getCurrentUser();
  if (user) {
    window.location.href = "dashboard.html";
    return false;
  }
  return true;
}

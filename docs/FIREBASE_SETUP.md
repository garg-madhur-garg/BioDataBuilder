# 🚀 Firebase Setup Guide for Biodata Builder

This step-by-step guide walks you through setting up Firebase for the **Biodata Builder** web application. Even if you have never used Firebase before, simply follow the steps below!

---

## Step 1: Create a Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/) and log in with your Google Account.
2. Click **Add project** (or **Create a project**).
3. Enter a project name, e.g., `biodata-builder-app`.
4. (Optional) Disable Google Analytics for now if you prefer a simpler setup.
5. Click **Create project** and wait for it to initialize.

---

## Step 2: Enable Firebase Authentication

1. In the left sidebar of your Firebase Console, click **Build** → **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Click on **Email/Password**.
   - Enable the first toggle: **Email/Password**. (Leave Email link disabled).
   - Click **Save**.
4. (Optional) You can also enable **Google** sign-in if desired.

---

## Step 3: Create Cloud Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your users (e.g., `asia-south1` for India / Mumbai, or `us-central1`).
4. Select **Start in production mode** (we will configure secure rules in Step 5).
5. Click **Create**.

---

## Step 4: Create Cloud Storage (for Photos)

1. In the left sidebar, click **Build** → **Storage**.
2. Click **Get Started**.
3. Choose default security rules and your preferred cloud bucket region.
4. Click **Done**.

---

## Step 5: Register Your Web App & Get Config

1. Go back to **Project Overview** (click the gear ⚙️ icon next to "Project Overview" → **Project settings**).
2. Scroll down to the **Your apps** section and click the Web icon `</>`.
3. Enter an app nickname, e.g. `Biodata Builder Web`.
4. (Optional) Check "Firebase Hosting" if you want to deploy to Firebase Hosting later.
5. Click **Register app**.
6. Firebase will show your `firebaseConfig` snippet containing:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
7. Open `firebase/firebase-config.js` in your project folder, and paste your values replacing the placeholders.

---

## Step 6: Deploy Security Rules

### Firestore Rules
1. In Firebase Console, go to **Firestore Database** → **Rules** tab.
2. Copy the contents of [`firebase/firestore.rules`](../firebase/firestore.rules).
3. Paste into the editor and click **Publish**.

### Storage Rules
1. Go to **Storage** → **Rules** tab.
2. Copy the contents of [`firebase/storage.rules`](../firebase/storage.rules).
3. Paste into the editor and click **Publish**.

---

## Step 7: Verify Everything Works!

1. Open `index.html` in your browser (or run a local dev server).
2. Click **Create My Biodata** or **Sign Up**.
3. Enter your test email and password.
4. You will automatically land on your Dashboard!
5. Open the **Editor**, modify details, and click **Save Biodata**.
6. Refresh the page to verify your data persists securely from Cloud Firestore.

---

## Need Demo Mode Without Firebase?

If you don't configure Firebase immediately, the application will automatically run in **Demo / LocalStorage Mode**. You can still test all UI forms, live previews, and edits seamlessly right out of the box!

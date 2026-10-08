# 💍 Biodata Builder — Complete Product Specification

## 1. Product Vision

Build a modern, production-ready **Marriage Biodata Builder**.

This must **not** be a single-person biodata website. It should be a **multi-user web application** where anyone can:

1. Create an account
2. Log in
3. Create their own marriage biodata
4. Edit all information directly from the website
5. Upload profile and gallery photos
6. Choose from multiple biodata templates
7. See a live preview
8. Publish their biodata
9. Get a unique public URL
10. Share the URL on WhatsApp/social media
11. Download or print the biodata as PDF

The experience should be simple enough for a non-technical user.

---

# 2. Existing Project

There is already an existing marriage biodata website/design.

Use the existing project as the visual and content inspiration.

**Important:**
- Do not unnecessarily destroy the existing design.
- Preserve the strongest parts of the existing design.
- Convert the existing design into a reusable template system.
- The existing design should become the first/default template.

The current project is primarily built with:

- HTML
- CSS
- Vanilla JavaScript

Prefer keeping this stack.

Do **not** migrate to React/Next.js unless there is a strong technical reason.

The application should remain lightweight and easy to deploy on platforms such as Cloudflare Pages.

---

# 3. Core User Flow

The final user journey should be:

```text
HOME
  ↓
SIGN UP / LOGIN
  ↓
DASHBOARD
  ↓
CREATE BIODATA
  ↓
EDIT BIODATA
  ↓
CHOOSE TEMPLATE
  ↓
LIVE PREVIEW
  ↓
SAVE
  ↓
PUBLISH
  ↓
GET PUBLIC LINK
  ↓
SHARE / DOWNLOAD PDF
```

---

# 4. Pages and Routes

## 4.1 `/`

### Landing Page

Headline:

> Create Your Beautiful Marriage Biodata

Subtitle:

> Create, customize and share your marriage biodata online — beautifully.

Primary CTA:

**Create My Biodata**

Secondary CTA:

**Login**

Include:

- Product introduction
- Benefits
- Template previews
- How it works
- Security/privacy information
- CTA to create biodata

Features to highlight:

- Beautiful templates
- Easy editing
- Live preview
- Shareable public link
- PDF download
- Mobile friendly
- Private & secure

---

## 4.2 `/login`

Login page.

Fields:

- Email
- Password

Actions:

- Login
- Forgot password
- Create account
- Google Sign-In (if practical)

Handle errors gracefully.

---

## 4.3 `/signup`

Registration page.

Fields:

- Name
- Email
- Password
- Confirm Password

After successful registration:

```text
Signup → Dashboard
```

---

## 4.4 `/dashboard`

Authenticated users only.

Dashboard should show:

> Welcome, [User Name]

Main biodata card:

- Profile photo
- Biodata name
- Status: Draft / Published
- Last updated
- Selected template

Actions:

- Edit Biodata
- Preview
- Publish / Unpublish
- Share
- Download PDF

Also provide:

- Account settings
- Logout

---

## 4.5 `/editor`

Authenticated users only.

This is the main biodata editor.

### Desktop

Use a two-panel layout:

```text
┌──────────────────────┬──────────────────────────┐
│                      │                          │
│   EDITOR / SECTIONS  │      LIVE PREVIEW        │
│                      │                          │
│ Personal             │                          │
│ Family               │     Biodata Preview      │
│ Education            │                          │
│ Career               │                          │
│ Horoscope            │                          │
│ Preferences          │                          │
│ Contact              │                          │
│ Photos               │                          │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

### Mobile

Do not simply shrink the desktop UI.

Use proper mobile UX:

- Section tabs
- Accordion
- Bottom navigation
- Toggle between Editor and Preview

---

# 5. Biodata Editor

## 5.1 Personal Information

Fields:

- Full Name
- Gender
- Date of Birth
- Age — preferably auto-calculated
- Height
- Weight
- Blood Group
- Complexion
- Marital Status
- Mother Tongue
- Current City
- Native Place

---

## 5.2 Contact Information

Fields:

- Phone
- WhatsApp
- Email
- Address
- Contact Person
- Contact Person Relation

Every important contact field should support visibility:

```text
Phone
[✓] Show publicly
```

or

```text
Phone
[ ] Keep private
```

---

## 5.3 Education

Education must support multiple entries.

Example:

```text
Degree
Institution
Year
Description
```

Button:

**+ Add Education**

---

## 5.4 Career

Fields:

- Profession
- Company
- Designation
- Work Location
- Annual Income
- Experience

Support multiple career entries if useful.

---

## 5.5 Family Details

Fields:

- Father Name
- Father Profession
- Mother Name
- Mother Profession
- Brothers
- Sisters
- Family Type
- Family Values
- Native Place
- Additional Family Information

---

## 5.6 Siblings

Support dynamic entries.

Brother:

- Name
- Age
- Marital Status
- Profession

Sister:

- Name
- Age
- Marital Status
- Profession

Buttons:

- + Add Brother
- + Add Sister

---

## 5.7 Lifestyle

Fields:

- Diet
- Smoking
- Drinking
- Hobbies
- Interests
- Languages
- Personality
- Religious / Spiritual preferences

---

## 5.8 Horoscope

This section is optional and can be hidden.

Fields:

- Rashi
- Nakshatra
- Gotra
- Manglik
- Birth Time
- Birth Place
- Kundli details

Allow the user to disable the entire section.

---

## 5.9 Partner Preferences

Fields:

- Preferred Age
- Preferred Height
- Education
- Profession
- Location
- Family Background
- Lifestyle
- Other Expectations

---

## 5.10 About Me

Large text area for:

> About Me

Allow basic formatting if practical.

---

# 6. Photo Management

Users should be able to:

- Upload profile photo
- Upload multiple gallery photos
- Replace photo
- Delete photo
- Reorder photos

Use:

**Firebase Storage**

Optimize/compress images before upload when practical.

Avoid unnecessarily large uploads.

Show upload progress.

---

# 7. Template System

The template system is a core feature.

The biodata data must be separated from its visual presentation.

All templates must use the same underlying biodata data.

Only layout/design should change.

Create at least **8 templates**:

1. Traditional
2. Royal
3. Modern
4. Minimal
5. Elegant
6. Floral
7. Premium
8. Classic / Original

The existing biodata design should become the first/default template.

Suggested structure:

```text
/templates
    traditional.js
    royal.js
    modern.js
    minimal.js
    elegant.js
    floral.js
    premium.js
    classic.js
```

Equivalent clean architecture is acceptable.

---

# 8. Live Preview

The editor must have a real-time preview.

Examples:

If the user changes:

```text
Name → Rahul Sharma
```

the preview updates immediately.

If the user changes:

```text
Profile Photo
```

the preview updates.

If the user changes:

```text
Template
```

the preview updates.

No full-page reload should be required.

---

# 9. Publish System

Each user should have a unique public slug.

Example:

```text
/b/madhur-garg
```

The user should be able to customize their slug.

Slug rules:

- Lowercase
- URL-safe
- No spaces
- Unique
- Prevent duplicate slugs

If:

```text
madhur-garg
```

already exists, suggest:

```text
madhur-garg-2
```

---

# 10. Draft / Published State

Every biodata should have:

```text
draft
```

or:

```text
published
```

Actions:

- Save Draft
- Publish
- Unpublish

If unpublished, the public URL must not expose the biodata.

---

# 11. Firebase Architecture

Use Firebase.

## 11.1 Firebase Authentication

Support:

- Email/password
- Google Sign-In if practical

---

## 11.2 Firestore

Suggested structure:

```text
users/{uid}

    name
    email
    photoURL
    createdAt
```

```text
biodatas/{uid}

    slug
    status
    template
    createdAt
    updatedAt

    personal: {}

    contact: {}

    education: []

    career: []

    family: {}

    siblings: []

    lifestyle: {}

    horoscope: {}

    preferences: {}

    about: ""

    photos: []

    visibility: {}
```

Equivalent architecture is acceptable if it is more secure/scalable.

---

# 12. Public Slug Lookup

Do **not** expose Firebase UID in public URLs.

Public URL should look like:

```text
/b/madhur-garg
```

The application should resolve the biodata using the unique slug.

Make sure slugs are unique.

---

# 13. Firestore Security

Security is critical.

Rules must ensure:

- User A cannot edit User B's biodata.
- Users can only modify their own biodata.
- Public users can only read published biodatas.
- Draft/private biodatas must not be publicly readable.
- Do not make the entire Firestore database publicly readable.

Test security rules explicitly.

---

# 14. Privacy / Visibility

Important fields should have public/private controls.

Example:

```text
Phone
[✓] Public
```

or:

```text
Phone
[ ] Private
```

Same concept can apply to:

- Phone
- Email
- Address
- Income
- Horoscope
- Other sensitive information

Nothing sensitive should automatically become public unless the user chooses it.

---

# 15. Dashboard

Dashboard should provide:

### My Biodata

Display:

- Profile photo
- Name
- Status
- Last updated
- Selected template

Actions:

```text
[ Edit ]
[ Preview ]
[ Publish ]
[ Share ]
[ Download PDF ]
```

---

# 16. Sharing

When published, show:

```text
Your Biodata URL

https://domain.com/b/madhur-garg
```

Buttons:

- Copy Link
- WhatsApp
- Share
- QR Code

Generate a QR code for the public biodata URL.

---

# 17. WhatsApp Sharing

Create dynamic WhatsApp sharing.

Example message:

```text
Hi, I would like to share my marriage biodata with you.

Please find my biodata here:
https://domain.com/b/madhur-garg
```

The URL must be generated dynamically.

---

# 18. PDF / Print

Users should be able to download their biodata as a professional PDF.

PDF requirements:

- A4
- Portrait
- Proper margins
- Clean typography
- Selected template design
- No dashboard UI
- No editor UI
- No website navigation
- Print-friendly

The PDF should look like a real marriage biodata, not a screenshot of the dashboard.

---

# 19. Responsive Design

Support:

- Mobile
- Tablet
- Laptop
- Desktop

Mobile editing is especially important.

Most users may create their biodata from mobile.

Do not simply scale down desktop UI.

Design specifically for mobile.

---

# 20. UI / UX

The overall product should feel:

- Modern
- Elegant
- Premium
- Clean
- Marriage-oriented
- Trustworthy

Avoid:

- Excessive gradients
- Excessive animation
- Clutter
- Giant unnecessary cards

Use:

- Good typography
- Whitespace
- Elegant sections
- Beautiful image layouts
- Subtle animations
- Clear buttons
- Responsive layouts

---

# 21. Important Design Separation

There are two completely different interfaces.

## A. Dashboard / Editor

Should feel like a modern SaaS application.

Examples:

- Sidebar
- Forms
- Cards
- Settings
- Buttons
- Status indicators

## B. Public Biodata

Should feel like a beautiful marriage biodata/document.

Examples:

- Elegant typography
- Profile photo
- Decorative sections
- Traditional or modern styling
- A4-like composition

**Do not mix these two visual systems.**

---

# 22. Authentication UX

Handle:

- Wrong password
- Invalid email
- Existing email
- Weak password
- Forgot password
- Logout
- Network errors

Use friendly messages.

Do not display raw Firebase technical errors such as:

```text
FirebaseError: auth/...
```

Instead show:

> Incorrect email or password. Please try again.

---

# 23. Form Validation

Validate:

- Required fields
- Email
- Phone
- Password
- Confirm password
- Slug

Do not allow invalid slugs.

Show useful validation messages.

---

# 24. Save / Auto-save

Avoid excessive Firestore writes.

Preferred approach:

1. Keep form state locally while editing.
2. Save explicitly with a Save button.
3. Optionally implement debounced auto-save.
4. Show save state.

Example:

```text
Saving...
```

then:

```text
Saved ✓
```

If there are unsaved changes:

```text
Unsaved changes
```

---

# 25. Data Export / Import

Allow users to:

### Export Biodata

Download their biodata data as JSON.

### Import Biodata

Restore a previously exported JSON backup.

This provides a simple backup mechanism.

---

# 26. Account Settings

Create:

```text
/settings
```

Features:

- Name
- Email
- Profile photo
- Change password
- Delete account
- Logout

Account deletion should clean up user data appropriately if implemented.

---

# 27. Admin Architecture

Prepare the project for a future admin dashboard.

Future route:

```text
/admin
```

Potential features:

- Total Users
- Total Biodatas
- Published Biodatas
- Draft Biodatas
- Template statistics
- User management

Admin functionality should be modular.

Admin should not automatically expose private biodata information unless explicitly authorized.

---

# 28. SEO

Public biodata pages should dynamically generate:

```html
<title>
<meta name="description">
```

Also support Open Graph metadata where practical.

Example:

```text
Rahul Sharma — Marriage Biodata
```

When shared on WhatsApp/social media, the public profile should have a useful preview where the platform permits it.

---

# 29. Performance

Keep the application fast.

Optimize:

- Images
- CSS
- JavaScript
- Template loading

Lazy-load gallery images.

Avoid unnecessary dependencies.

Do not load all heavy templates/assets if they are not required.

---

# 30. Accessibility

Use:

- Proper form labels
- Keyboard navigation
- Accessible buttons
- Good contrast
- Alt text
- Semantic HTML

---

# 31. Error Handling

Handle:

- Firebase unavailable
- Network failure
- Photo upload failure
- Firestore failure
- Authentication failure
- Invalid public URL
- Permission denied
- Slug conflict

Show friendly messages.

Example:

> Something went wrong. Please try again.

Avoid exposing internal technical errors.

---

# 32. Suggested Project Structure

Keep the code modular.

Example:

```text
/
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── editor.html
├── settings.html
│
├── css/
│   ├── global.css
│   ├── landing.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── editor.css
│   └── public-biodata.css
│
├── js/
│   ├── auth.js
│   ├── dashboard.js
│   ├── editor.js
│   ├── biodata.js
│   ├── public.js
│   ├── firestore.js
│   ├── storage.js
│   └── utils.js
│
├── templates/
│   ├── traditional.js
│   ├── royal.js
│   ├── modern.js
│   ├── minimal.js
│   ├── elegant.js
│   ├── floral.js
│   ├── premium.js
│   └── classic.js
│
├── firebase/
│   ├── firebase-config.example.js
│   ├── firestore.rules
│   └── storage.rules
│
└── docs/
    └── FIREBASE_SETUP.md
```

Equivalent clean architecture is acceptable.

Do not create one giant JavaScript file.

---

# 33. Firebase Configuration

Do not commit private/server credentials.

Create:

```text
firebase-config.example.js
```

with placeholders for:

```text
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

Firebase web API keys are not treated as server secrets, but Firestore and Storage security rules must protect the data.

I will later provide the actual Firebase configuration.

---

# 34. Firebase Setup Documentation

Create:

```text
FIREBASE_SETUP.md
```

Explain step-by-step for a non-technical user:

1. Create Firebase project
2. Enable Authentication
3. Enable Email/Password
4. Enable Google Login if used
5. Create Firestore
6. Create Storage
7. Add Firebase Web App
8. Copy configuration
9. Add configuration to project
10. Deploy Firestore rules
11. Deploy Storage rules
12. Test login
13. Test biodata creation
14. Test photo upload
15. Test public profile
16. Deploy website

---

# 35. Demo Mode

Until Firebase is configured, the application should still open.

Display:

> Firebase is not configured yet.

Do not crash.

Where practical, provide sample/demo biodata.

Once Firebase configuration is added, switch to real authentication/database functionality.

---

# 36. Sample Data

Create dummy sample data for testing.

Example:

```text
Name: Rahul Sharma
Age: 27
Education: B.Tech
Profession: Software Engineer
City: Delhi
```

Use dummy data only.

Never hard-code real people's private data.

---

# 37. Testing Requirements

Before considering a phase complete, test:

### Authentication

- Signup
- Login
- Logout
- Forgot password
- Invalid credentials

### Biodata

- Create
- Edit
- Save
- Reload
- Persistence

### Photos

- Upload
- Replace
- Delete
- Reorder

### Templates

- Change template
- Live preview
- Persistence

### Publishing

- Publish
- Unpublish
- Public URL
- Slug uniqueness

### Sharing

- Copy URL
- WhatsApp
- QR

### PDF

- Print
- PDF download
- A4 layout

### Responsive

- Mobile
- Tablet
- Desktop

### Security

Most important:

> User A must NOT be able to read or modify User B's private/draft biodata.

---

# 38. Development Phases

Do NOT try to implement the entire application blindly in one huge change.

Build it in phases.

---

## PHASE 1 — Foundation

Build:

- Landing page
- Login
- Signup
- Firebase Authentication
- Dashboard
- Basic biodata editor
- Firestore save/load

Test completely before continuing.

---

## PHASE 2 — Complete Biodata Editor

Add:

- Personal information
- Family
- Education
- Career
- Siblings
- Lifestyle
- Horoscope
- Partner preferences
- Contact
- About Me
- Visibility controls

Test all fields and persistence.

---

## PHASE 3 — Photo System

Add:

- Firebase Storage
- Profile photo
- Gallery
- Photo delete
- Photo replace
- Photo reorder
- Image optimization

Test upload failures and permissions.

---

## PHASE 4 — Template System

Create 8 templates:

- Traditional
- Royal
- Modern
- Minimal
- Elegant
- Floral
- Premium
- Classic / Original

All templates must use the same data.

Test each template with the same sample biodata.

---

## PHASE 5 — Live Preview + Publishing

Build:

- Live preview
- Public profile
- Unique slug
- Publish/unpublish
- Public URL
- Share
- WhatsApp
- QR code

Test public access without login.

---

## PHASE 6 — PDF + SEO + Mobile

Build:

- PDF
- Print
- A4 layout
- SEO metadata
- Open Graph
- Mobile optimization
- Performance optimization

---

## PHASE 7 — Account + Production Hardening

Build:

- Settings
- Password reset
- Data export/import
- Account deletion
- Better error handling
- Production security rules
- Final testing

---

# 39. Critical Development Rules

## Rule 1 — Inspect Before Changing

Always inspect the existing code before modifying it.

Do not blindly overwrite existing files.

Reuse useful components/styles/assets.

---

## Rule 2 — Preserve Existing Design

The existing marriage biodata design is valuable.

Make it the:

> Classic / Original Template

Do not replace it with a generic dashboard-looking biodata.

---

## Rule 3 — Separate Data From Design

Biodata information must be stored independently from template presentation.

This is necessary so the user can change templates without re-entering information.

---

## Rule 4 — Fix Root Causes

When an error occurs:

1. Identify the exact error.
2. Find the root cause.
3. Fix the root cause.
4. Test.
5. Continue.

Do not make random changes until the error disappears.

---

## Rule 5 — Protect Existing Functionality

After every major change, verify that previously working functionality still works.

---

# 40. Final Product Experience

The final application should feel like:

> **"Canva, but for Marriage Biodata."**

A normal user should not need to know:

- HTML
- CSS
- JavaScript
- Firebase
- GitHub
- Cloudflare

They should simply be able to:

```text
Sign Up
   ↓
Fill Biodata
   ↓
Upload Photo
   ↓
Choose Design
   ↓
Preview
   ↓
Publish
   ↓
Share
```

---

# 41. Completion Criteria

Do NOT call the project complete until all of the following work:

- New user can sign up
- Login works
- Logout works
- Forgot password works
- Dashboard works
- User can create biodata
- User can edit biodata
- Data persists after refresh
- User can upload photo
- User can manage gallery
- User can select template
- Live preview works
- User can publish
- User can unpublish
- Public URL works
- Public URL works without login
- User can share URL
- WhatsApp sharing works
- QR code works
- PDF/print works
- Mobile UI works
- Desktop UI works
- Firebase security rules work
- User A cannot access/edit User B's private data

---

# 42. FIRST TASK FOR ANTIGRAVITY

Start by inspecting the existing project.

Then:

1. Understand the existing design and code.
2. Identify reusable components/assets.
3. Create a concise implementation plan.
4. Implement **PHASE 1 only**.
5. Test PHASE 1 completely.
6. Report:
   - Files changed
   - Features completed
   - Tests performed
   - Remaining issues
   - Recommendation for PHASE 2

Do not jump directly to all 8 templates.

Priorities:

```text
FUNCTIONALITY
      ↓
SECURITY
      ↓
USER EXPERIENCE
      ↓
DESIGN
      ↓
POLISH
```

Build this as a real production-ready application, not merely a visual mockup.

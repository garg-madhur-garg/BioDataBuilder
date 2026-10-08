// Ambient Living Studio Biodata Controller
import { renderDemoBannerIfNeeded } from "./firebase-init.js";
import { getCurrentUser, loginUser, registerUser, logoutUser } from "./auth.js";
import { loadBiodata, saveBiodata, slugify, parseBiodataJSON } from "./firestore.js";
import { sampleBiodata } from "./sample-data.js";
import { renderClassicTemplate } from "../templates/classic.js";

async function initEditor() {
  renderDemoBannerIfNeeded();
  let currentUser = await getCurrentUser();

  let biodata = null;
  let saveTimeout = null;
  let isSaving = false;
  const activeEditingSections = new Set();

  // 1. Topbar & Core Stage Elements
  const statusIndicator = document.getElementById("save-status-indicator");
  const livePreviewCanvas = document.getElementById("live-preview-canvas");
  const docTitleEl = document.getElementById("doc-title-display") || document.getElementById("editor-doc-title");
  const printPdfBtn = document.getElementById("print-pdf-btn");
  const fillSampleBtn = document.getElementById("btn-fill-sample");
  const shareTriggerBtn = document.getElementById("btn-share-trigger");
  const exportJsonBtn = document.getElementById("btn-export-json");
  const importJsonTrigger = document.getElementById("btn-import-json-trigger");
  const jsonFileInput = document.getElementById("json-file-input");

  // 2. Photo Elements
  const photoInput = document.getElementById("profile-photo-input");
  const uploadPhotoBtn = document.getElementById("btn-upload-photo");
  const removePhotoBtn = document.getElementById("btn-remove-photo");
  const avatarPreviewImg = document.getElementById("avatar-preview-img");

  // 3. Studio Drawer Elements
  const studioDrawer = document.getElementById("studio-drawer");
  const drawerBackdrop = document.getElementById("drawer-backdrop");
  const toggleDrawerBtn = document.getElementById("btn-toggle-drawer");
  const closeDrawerBtn = document.getElementById("btn-close-drawer");
  const drawerTabs = document.querySelectorAll(".drawer-tab-btn");
  const drawerPanes = document.querySelectorAll(".form-section-pane");
  const themeOrbs = document.querySelectorAll(".theme-orb-btn");

  // 4. Modals & Notifications
  const authModal = document.getElementById("auth-modal");
  const shareModal = document.getElementById("share-modal");
  const toastContainer = document.getElementById("toast-container");

  // Toast Notification Helper
  function showToast(msg, type = "info") {
    if (!toastContainer) {
      alert(msg);
      return;
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(16px)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // User Account Area in Topbar
  function updateUserArea() {
    const area = document.getElementById("topbar-user-area");
    if (!area) return;

    if (currentUser && currentUser.email) {
      const initial = (currentUser.displayName || currentUser.email).charAt(0).toUpperCase();
      area.innerHTML = `
        <div class="user-pill-clean" title="Logged in as ${currentUser.email}">
          <span class="user-avatar-circle">${initial}</span>
          <button type="button" class="btn-logout-clean" id="btn-topbar-logout" title="Log Out">Log Out</button>
        </div>
      `;
      document.getElementById("btn-topbar-logout")?.addEventListener("click", async () => {
        if (confirm("Log out from your cloud account? Your draft will remain safely in this browser.")) {
          await logoutUser();
        }
      });
    } else {
      area.innerHTML = `
        <button type="button" id="btn-open-auth-modal" class="btn-clean-ghost">☁️ Cloud Save</button>
      `;
      document.getElementById("btn-open-auth-modal")?.addEventListener("click", openAuthModal);
    }
  }

  // Save Status Indicator
  function updateSaveStatus(state) {
    if (!statusIndicator) return;
    const label = statusIndicator.querySelector(".status-label") || statusIndicator;
    if (state === "saved") {
      statusIndicator.className = "save-status-indicator";
      label.textContent = "Saved";
    } else if (state === "saving") {
      statusIndicator.className = "save-status-indicator saving";
      label.textContent = "Saving...";
    } else if (state === "unsaved") {
      statusIndicator.className = "save-status-indicator unsaved";
      label.textContent = "Unsaved";
    }
  }

  // Trigger Save to LocalStorage and Firebase (if logged in)
  async function triggerSave() {
    if (isSaving || !biodata) return;
    isSaving = true;
    updateSaveStatus("saving");

    try {
      localStorage.setItem("biodata_active_draft", JSON.stringify(biodata));
      if (currentUser) {
        biodata = await saveBiodata(currentUser.uid, biodata, currentUser);
      }
      updateSaveStatus("saved");
    } catch (e) {
      console.error("Save error:", e);
      updateSaveStatus("unsaved");
      if (e.message && e.message.includes("Permission")) {
        showToast(e.message, "error");
      }
    } finally {
      isSaving = false;
    }
  }

  function queueAutoSave() {
    updateSaveStatus("unsaved");
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(triggerSave, 1400);
  }

  // Studio Drawer Functions
  function openDrawer(targetPaneId = null) {
    if (studioDrawer) studioDrawer.classList.add("open");
    if (drawerBackdrop) drawerBackdrop.classList.add("open");
    if (targetPaneId) {
      switchDrawerTab(targetPaneId);
    }
  }

  function closeDrawer() {
    if (studioDrawer) studioDrawer.classList.remove("open");
    if (drawerBackdrop) drawerBackdrop.classList.remove("open");
  }

  function switchDrawerTab(targetPaneId) {
    drawerTabs.forEach((t) => t.classList.toggle("active", t.dataset.target === targetPaneId));
    drawerPanes.forEach((p) => p.classList.toggle("active", p.id === targetPaneId));
    const activePane = document.getElementById(targetPaneId);
    if (activePane) {
      activePane.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Sync Theme Orbs on Floating Dock
  function syncThemeOrbsUI(currentTheme) {
    themeOrbs.forEach((orb) => {
      orb.classList.toggle("active", orb.dataset.theme === currentTheme);
    });
  }

  function setNestedField(obj, path, val) {
    if (!obj || !path) return;
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cur[p]) {
        cur[p] = isNaN(Number(parts[i + 1])) ? {} : [];
      }
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = val;
  }

  function syncToDrawerInput(field, val) {
    const parts = field.split(".");
    const key = parts[parts.length - 1];
    const input = document.getElementById(`field-${key}`) || document.getElementById(`field-${key.charAt(0).toUpperCase() + key.slice(1)}`);
    if (input) input.value = val;
  }

  // In-Place Living Canvas Event Attachments
  function attachCanvasInteractions() {
    if (!livePreviewCanvas) return;

    // 1. Photo Click Upload Trigger
    const photoTrigger = livePreviewCanvas.querySelector(".living-photo-trigger");
    if (photoTrigger && photoInput) {
      photoTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoInput.click();
      });
    }

    // 2. Master Edit Badge at Top of Paper -> Opens Studio Drawer
    const masterEditPaperBtn = livePreviewCanvas.querySelector("#btn-master-edit-paper");
    if (masterEditPaperBtn) {
      masterEditPaperBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDrawer();
      });
    }

    // 3. Section Edit Badges -> In-Place Edit Mode (No Drawer / No Popup)
    livePreviewCanvas.querySelectorAll(".section-edit-trigger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const secKey = btn.dataset.section;
        activeEditingSections.add(secKey);
        updateLivePreview();
      });
    });

    // 4. Section Done Button -> Return to View Mode
    livePreviewCanvas.querySelectorAll(".section-done-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const secKey = btn.dataset.section;
        activeEditingSections.delete(secKey);
        updateLivePreview();
        queueAutoSave();
        showToast("✓ Section saved!", "success");
      });
    });

    // 5. Section Hide/Unhide Toggle
    livePreviewCanvas.querySelectorAll(".btn-sec-hide-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const secKey = btn.dataset.section;
        if (!biodata.hiddenSections) biodata.hiddenSections = {};
        biodata.hiddenSections[secKey] = !biodata.hiddenSections[secKey];
        updateLivePreview();
        queueAutoSave();
        showToast(biodata.hiddenSections[secKey] ? "🙈 Section hidden" : "👁️ Section visible", "info");
      });
    });

    // 6. Individual Field Hide/Unhide Toggle
    livePreviewCanvas.querySelectorAll(".btn-field-hide-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fieldKey = btn.dataset.field;
        if (!biodata.hiddenFields) biodata.hiddenFields = {};
        biodata.hiddenFields[fieldKey] = !biodata.hiddenFields[fieldKey];
        updateLivePreview();
        queueAutoSave();
      });
    });

    // 7. Add Section Extra Field (Specifically in Section, not in Master)
    livePreviewCanvas.querySelectorAll(".btn-add-section-extra-field").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const secKey = btn.dataset.section;
        if (!biodata.customFields) biodata.customFields = {};
        if (!biodata.customFields[secKey]) biodata.customFields[secKey] = [];
        biodata.customFields[secKey].push({
          id: "cf_" + Date.now(),
          label: "Extra Field",
          value: ""
        });
        updateLivePreview();
        queueAutoSave();
      });
    });

    // 8. Custom Extra Field Label & Value Inputs
    livePreviewCanvas.querySelectorAll(".inline-custom-label-input, .inline-field-label-input").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const secKey = e.target.dataset.section;
        const customId = e.target.dataset.customId;
        const item = biodata.customFields?.[secKey]?.find(x => x.id === customId);
        if (item) {
          item.label = e.target.value;
          queueAutoSave();
        }
      });
    });

    // 9. Standard & Custom Field Value Inputs
    livePreviewCanvas.querySelectorAll(".inline-field-input").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const field = e.target.dataset.field;
        const customId = e.target.dataset.customId;
        const secKey = e.target.dataset.section;

        if (customId && secKey) {
          const item = biodata.customFields?.[secKey]?.find(x => x.id === customId);
          if (item) {
            item.value = e.target.value;
            queueAutoSave();
          }
          return;
        }

        if (field) {
          const val = e.target.value;
          setNestedField(biodata, field, val);
          syncToDrawerInput(field, val);
          if (field === "personal.fullName") {
            biodata.slug = slugify(val);
            if (docTitleEl) docTitleEl.textContent = val ? `${val}'s Biodata` : "Marriage Biodata";
          }
          queueAutoSave();
        }
      });
    });

    // 10. Delete Custom Extra Field
    livePreviewCanvas.querySelectorAll(".btn-delete-custom-field").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const secKey = btn.dataset.section;
        const customId = btn.dataset.customId;
        if (biodata.customFields?.[secKey]) {
          biodata.customFields[secKey] = biodata.customFields[secKey].filter(x => x.id !== customId);
        }
        updateLivePreview();
        queueAutoSave();
      });
    });

    // 10b. Siblings Management on Paper
    livePreviewCanvas.querySelectorAll("[data-sibling-idx]").forEach((el) => {
      const updateSibling = (e) => {
        const idx = parseInt(e.target.dataset.siblingIdx, 10);
        const field = e.target.dataset.field;
        if (!biodata.siblings) biodata.siblings = [];
        if (biodata.siblings[idx] && field) {
          biodata.siblings[idx][field] = e.target.value;
          renderSiblingsList();
          queueAutoSave();
        }
      };
      el.addEventListener("input", updateSibling);
      el.addEventListener("change", updateSibling);
    });

    livePreviewCanvas.querySelectorAll(".btn-delete-sibling-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(btn.dataset.siblingIdx, 10);
        if (biodata.siblings && biodata.siblings[idx]) {
          biodata.siblings.splice(idx, 1);
          updateLivePreview();
          renderSiblingsList();
          queueAutoSave();
        }
      });
    });

    livePreviewCanvas.querySelectorAll(".btn-add-sibling-paper").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!biodata.siblings) biodata.siblings = [];
        biodata.siblings.push({
          relation: "Brother",
          name: "",
          maritalStatus: "Unmarried",
          profession: ""
        });
        activeEditingSections.add("siblings");
        updateLivePreview();
        renderSiblingsList();
        queueAutoSave();
      });
    });

    // 11. Direct Contenteditable Header In-Place Editing
    livePreviewCanvas.querySelectorAll(".living-editable").forEach((el) => {
      el.addEventListener("input", () => {
        const field = el.dataset.field;
        const text = el.innerText.trim();

        if (field === "personal.fullName") {
          if (!biodata.personal) biodata.personal = {};
          biodata.personal.fullName = text;
          biodata.slug = slugify(text);
          const input = document.getElementById("field-fullName");
          if (input) input.value = text;
          if (docTitleEl) docTitleEl.textContent = text ? `${text}'s Biodata` : "Marriage Biodata";
        } else if (field === "career.designation") {
          if (!biodata.career) biodata.career = {};
          biodata.career.designation = text;
          const input = document.getElementById("field-designation");
          if (input) input.value = text;
        } else if (field === "career.company") {
          if (!biodata.career) biodata.career = {};
          biodata.career.company = text;
          const input = document.getElementById("field-company");
          if (input) input.value = text;
        } else if (field === "about") {
          biodata.about = el.innerText;
          const input = document.getElementById("field-aboutMe");
          if (input) input.value = el.innerText;
        }

        queueAutoSave();
      });
    });
  }

  // Real-time Preview Render
  function updateLivePreview() {
    if (!livePreviewCanvas || !biodata) return;
    livePreviewCanvas.innerHTML = renderClassicTemplate(biodata, {
      isPreview: true,
      editingSections: activeEditingSections
    });
    if (docTitleEl) {
      docTitleEl.textContent = biodata.personal?.fullName
        ? `${biodata.personal.fullName}'s Biodata`
        : "Marriage Biodata";
    }
    syncThemeOrbsUI(biodata.theme || "royal-maroon");
    attachCanvasInteractions();
  }

  // Age Calculator
  function calculateAge(dobString) {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? String(age) : "";
  }

  // Client-side Photo Compression (~35 KB lightweight canvas)
  function compressImage(file, maxDimension = 600, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Dynamic Education Rows
  function renderEducationList() {
    const container = document.getElementById("education-items-list");
    if (!container) return;
    container.innerHTML = "";

    const edus = biodata?.education || [];
    edus.forEach((edu, idx) => {
      const row = document.createElement("div");
      row.className = "dynamic-item-card";
      row.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600; font-size: 0.84rem; color: #7B113A;">Qualification #${idx + 1}</span>
          <button type="button" class="btn-remove-edu" data-idx="${idx}" style="background: none; border: none; color: #B91C1C; cursor: pointer; font-size: 0.78rem;">✕ Remove</button>
        </div>
        <div class="form-row-3">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Degree / Course</label>
            <input type="text" class="form-input edu-input-degree" data-idx="${idx}" value="${edu.degree || ""}" placeholder="e.g. B.Tech / MBA">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Institution</label>
            <input type="text" class="form-input edu-input-inst" data-idx="${idx}" value="${edu.institution || ""}" placeholder="e.g. IIT Delhi">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Year</label>
            <input type="text" class="form-input edu-input-year" data-idx="${idx}" value="${edu.year || ""}" placeholder="e.g. 2019">
          </div>
        </div>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll(".edu-input-degree").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const i = Number(e.target.dataset.idx);
        if (biodata.education[i]) biodata.education[i].degree = e.target.value;
        updateLivePreview();
        queueAutoSave();
      });
    });
    container.querySelectorAll(".edu-input-inst").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const i = Number(e.target.dataset.idx);
        if (biodata.education[i]) biodata.education[i].institution = e.target.value;
        updateLivePreview();
        queueAutoSave();
      });
    });
    container.querySelectorAll(".edu-input-year").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const i = Number(e.target.dataset.idx);
        if (biodata.education[i]) biodata.education[i].year = e.target.value;
        updateLivePreview();
        queueAutoSave();
      });
    });
    container.querySelectorAll(".btn-remove-edu").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const i = Number(e.target.dataset.idx);
        biodata.education.splice(i, 1);
        renderEducationList();
        updateLivePreview();
        queueAutoSave();
      });
    });
  }

  // Dynamic Siblings Rows
  function renderSiblingsList() {
    const container = document.getElementById("siblings-items-list");
    if (!container) return;
    container.innerHTML = "";

    const sibs = biodata?.siblings || [];
    sibs.forEach((sib, idx) => {
      const card = document.createElement("div");
      card.className = "dynamic-item-card";
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600; font-size: 0.84rem; color: #7B113A;">Sibling #${idx + 1} (${sib.relation || "Sibling"})</span>
          <button type="button" class="btn-remove-sib" data-idx="${idx}" style="background: none; border: none; color: #B91C1C; cursor: pointer; font-size: 0.78rem;">✕ Remove</button>
        </div>
        <div class="form-row-3">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Relation</label>
            <select class="form-select sib-select-rel" data-idx="${idx}">
              <option value="Brother" ${sib.relation === "Brother" ? "selected" : ""}>Brother</option>
              <option value="Sister" ${sib.relation === "Sister" ? "selected" : ""}>Sister</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Name & Details</label>
            <input type="text" class="form-input sib-input-name" data-idx="${idx}" value="${sib.name || ""}" placeholder="e.g. Vikas Sharma (Elder)">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Marital Status</label>
            <select class="form-select sib-select-status" data-idx="${idx}">
              <option value="Unmarried" ${sib.maritalStatus === "Unmarried" ? "selected" : ""}>Unmarried</option>
              <option value="Married" ${sib.maritalStatus === "Married" ? "selected" : ""}>Married</option>
            </select>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll(".sib-select-rel").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const i = Number(e.target.dataset.idx);
        if (biodata.siblings[i]) biodata.siblings[i].relation = e.target.value;
        updateLivePreview();
        queueAutoSave();
      });
    });
    container.querySelectorAll(".sib-input-name").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const i = Number(e.target.dataset.idx);
        if (biodata.siblings[i]) biodata.siblings[i].name = e.target.value;
        updateLivePreview();
        queueAutoSave();
      });
    });
    container.querySelectorAll(".sib-select-status").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const i = Number(e.target.dataset.idx);
        if (biodata.siblings[i]) biodata.siblings[i].maritalStatus = e.target.value;
        updateLivePreview();
        queueAutoSave();
      });
    });
    container.querySelectorAll(".btn-remove-sib").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const i = Number(e.target.dataset.idx);
        biodata.siblings.splice(i, 1);
        renderSiblingsList();
        updateLivePreview();
        queueAutoSave();
      });
    });
  }

  // Populate Form Fields
  function initFormValues(data) {
    const p = data.personal || {};
    const c = data.contact || {};
    const car = data.career || {};
    const fam = data.family || {};
    const life = data.lifestyle || {};
    const horo = data.horoscope || {};
    const pref = data.preferences || {};
    const photos = data.photos || [];

    const bindVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };
    const bindCheck = (id, bool) => {
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(bool);
    };

    if (avatarPreviewImg) {
      avatarPreviewImg.src = photos[0]?.src || "assets/images/profile.svg";
    }

    // Personal
    bindVal("field-fullName", p.fullName);
    bindVal("field-gender", p.gender);
    bindVal("field-dob", p.dob);
    bindVal("field-age", p.age);
    bindVal("field-height", p.height);
    bindVal("field-weight", p.weight);
    bindVal("field-bloodGroup", p.bloodGroup);
    bindVal("field-complexion", p.complexion);
    bindVal("field-maritalStatus", p.maritalStatus);
    bindVal("field-motherTongue", p.motherTongue);
    bindVal("field-religion", p.religion);
    bindVal("field-caste", p.caste);
    bindVal("field-gotra", p.gotra);
    bindVal("field-currentCity", p.currentCity);
    bindVal("field-nativePlace", p.nativePlace);

    // Contact
    bindVal("field-contactPerson", c.contactPerson);
    bindVal("field-contactPersonRelation", c.contactPersonRelation);
    bindVal("field-phone", c.phone);
    bindCheck("check-phonePublic", c.phonePublic !== false);
    bindVal("field-whatsapp", c.whatsapp);
    bindCheck("check-whatsappPublic", c.whatsappPublic !== false);
    bindVal("field-email", c.email);
    bindCheck("check-emailPublic", c.emailPublic === true);
    bindVal("field-address", c.address);
    bindCheck("check-addressPublic", c.addressPublic === true);

    // Career
    bindVal("field-profession", car.profession);
    bindVal("field-designation", car.designation);
    bindVal("field-company", car.company);
    bindVal("field-workLocation", car.location);
    bindVal("field-annualIncome", car.annualIncome);
    bindCheck("check-incomePublic", car.incomePublic !== false);
    bindVal("field-experience", car.experience);

    // Family
    bindVal("field-fatherName", fam.fatherName);
    bindVal("field-fatherProfession", fam.fatherProfession);
    bindVal("field-motherName", fam.motherName);
    bindVal("field-motherProfession", fam.motherProfession);
    bindVal("field-familyType", fam.familyType);
    bindVal("field-familyValues", fam.familyValues);
    bindVal("field-familyNativePlace", fam.nativePlace);
    bindVal("field-additionalFamilyInfo", fam.additionalInfo);

    // Lifestyle
    bindVal("field-diet", life.diet);
    bindVal("field-smoking", life.smoking);
    bindVal("field-drinking", life.drinking);
    bindVal("field-hobbies", life.hobbies);
    bindVal("field-interests", life.interests);
    bindVal("field-languages", life.languages);

    // Horoscope
    bindCheck("check-horoscopeEnabled", horo.enabled !== false);
    bindVal("field-rashi", horo.rashi);
    bindVal("field-nakshatra", horo.nakshatra);
    bindVal("field-manglik", horo.manglik);
    bindVal("field-birthTime", horo.birthTime);
    bindVal("field-birthPlace", horo.birthPlace);

    // Preferences
    bindVal("field-prefAge", pref.preferredAge);
    bindVal("field-prefHeight", pref.preferredHeight);
    bindVal("field-prefEducation", pref.education);
    bindVal("field-prefProfession", pref.profession);
    bindVal("field-prefLocation", pref.location);
    bindVal("field-prefExpectations", pref.expectations);

    // About
    bindVal("field-aboutMe", data.about);

    // Dynamic Lists
    renderEducationList();
    renderSiblingsList();
  }

  // Handle Field Changes from Drawer Inputs
  function handleFieldChange(e) {
    const id = e.target.id;
    const val = e.target.value;
    const checked = e.target.checked;

    if (!biodata) biodata = structuredClone(sampleBiodata);
    if (!biodata.personal) biodata.personal = {};
    if (!biodata.contact) biodata.contact = {};
    if (!biodata.career) biodata.career = {};
    if (!biodata.family) biodata.family = {};
    if (!biodata.lifestyle) biodata.lifestyle = {};
    if (!biodata.horoscope) biodata.horoscope = {};
    if (!biodata.preferences) biodata.preferences = {};

    switch (id) {
      case "field-fullName":
        biodata.personal.fullName = val;
        biodata.slug = slugify(val);
        break;
      case "field-gender": biodata.personal.gender = val; break;
      case "field-dob":
        biodata.personal.dob = val;
        const calculatedAge = calculateAge(val);
        biodata.personal.age = calculatedAge;
        const ageInput = document.getElementById("field-age");
        if (ageInput) ageInput.value = calculatedAge;
        break;
      case "field-height": biodata.personal.height = val; break;
      case "field-weight": biodata.personal.weight = val; break;
      case "field-bloodGroup": biodata.personal.bloodGroup = val; break;
      case "field-complexion": biodata.personal.complexion = val; break;
      case "field-maritalStatus": biodata.personal.maritalStatus = val; break;
      case "field-motherTongue": biodata.personal.motherTongue = val; break;
      case "field-religion": biodata.personal.religion = val; break;
      case "field-caste": biodata.personal.caste = val; break;
      case "field-gotra": biodata.personal.gotra = val; break;
      case "field-currentCity": biodata.personal.currentCity = val; break;
      case "field-nativePlace": biodata.personal.nativePlace = val; break;

      case "field-contactPerson": biodata.contact.contactPerson = val; break;
      case "field-contactPersonRelation": biodata.contact.contactPersonRelation = val; break;
      case "field-phone": biodata.contact.phone = val; break;
      case "check-phonePublic": biodata.contact.phonePublic = checked; break;
      case "field-whatsapp": biodata.contact.whatsapp = val; break;
      case "check-whatsappPublic": biodata.contact.whatsappPublic = checked; break;
      case "field-email": biodata.contact.email = val; break;
      case "check-emailPublic": biodata.contact.emailPublic = checked; break;
      case "field-address": biodata.contact.address = val; break;
      case "check-addressPublic": biodata.contact.addressPublic = checked; break;

      case "field-profession": biodata.career.profession = val; break;
      case "field-designation": biodata.career.designation = val; break;
      case "field-company": biodata.career.company = val; break;
      case "field-workLocation": biodata.career.location = val; break;
      case "field-annualIncome": biodata.career.annualIncome = val; break;
      case "check-incomePublic": biodata.career.incomePublic = checked; break;
      case "field-experience": biodata.career.experience = val; break;

      case "field-fatherName": biodata.family.fatherName = val; break;
      case "field-fatherProfession": biodata.family.fatherProfession = val; break;
      case "field-motherName": biodata.family.motherName = val; break;
      case "field-motherProfession": biodata.family.motherProfession = val; break;
      case "field-familyType": biodata.family.familyType = val; break;
      case "field-familyValues": biodata.family.familyValues = val; break;
      case "field-familyNativePlace": biodata.family.nativePlace = val; break;
      case "field-additionalFamilyInfo": biodata.family.additionalInfo = val; break;

      case "field-diet": biodata.lifestyle.diet = val; break;
      case "field-smoking": biodata.lifestyle.smoking = val; break;
      case "field-drinking": biodata.lifestyle.drinking = val; break;
      case "field-hobbies": biodata.lifestyle.hobbies = val; break;
      case "field-interests": biodata.lifestyle.interests = val; break;
      case "field-languages": biodata.lifestyle.languages = val; break;

      case "check-horoscopeEnabled": biodata.horoscope.enabled = checked; break;
      case "field-rashi": biodata.horoscope.rashi = val; break;
      case "field-nakshatra": biodata.horoscope.nakshatra = val; break;
      case "field-manglik": biodata.horoscope.manglik = val; break;
      case "field-birthTime": biodata.horoscope.birthTime = val; break;
      case "field-birthPlace": biodata.horoscope.birthPlace = val; break;

      case "field-prefAge": biodata.preferences.preferredAge = val; break;
      case "field-prefHeight": biodata.preferences.preferredHeight = val; break;
      case "field-prefEducation": biodata.preferences.education = val; break;
      case "field-prefProfession": biodata.preferences.profession = val; break;
      case "field-prefLocation": biodata.preferences.location = val; break;
      case "field-prefExpectations": biodata.preferences.expectations = val; break;

      case "field-aboutMe": biodata.about = val; break;
    }

    updateLivePreview();
    queueAutoSave();
  }

  // Auth Modal Functions
  function openAuthModal() {
    if (!authModal) return;
    authModal.classList.add("active");
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove("active");
  }

  // Share Modal Functions
  function openShareModal() {
    if (!shareModal) return;
    shareModal.classList.add("active");

    const slug = biodata?.slug || "my-biodata";
    const publicUrl = `${window.location.origin}/public.html?b=${slug}`;

    const urlInput = document.getElementById("share-url-input");
    const waBtn = document.getElementById("btn-share-whatsapp");
    const publicBtn = document.getElementById("btn-view-public-page");

    if (urlInput) urlInput.value = publicUrl;
    if (waBtn) {
      const waText = `Namaste! Here is the marriage biodata profile of ${biodata?.personal?.fullName || "Candidate"}:\n${publicUrl}`;
      waBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    }
    if (publicBtn) {
      publicBtn.href = `public.html?b=${slug}`;
    }
  }

  function closeShareModal() {
    if (!shareModal) return;
    shareModal.classList.remove("active");
  }

  // ==========================================
  // ATTACH ALL CORE EVENT LISTENERS
  // ==========================================

  // Studio Drawer Toggle
  if (toggleDrawerBtn) {
    toggleDrawerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (studioDrawer && studioDrawer.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener("click", closeDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener("click", closeDrawer);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && studioDrawer && studioDrawer.classList.contains("open")) {
      closeDrawer();
    }
  });

  // Drawer Tabs
  drawerTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      switchDrawerTab(tab.dataset.target);
    });
  });

  // Theme Orbs on Floating Dock
  themeOrbs.forEach((orb) => {
    orb.addEventListener("click", (e) => {
      e.preventDefault();
      const selectedTheme = orb.dataset.theme;
      if (!biodata) biodata = structuredClone(sampleBiodata);
      biodata.theme = selectedTheme;
      syncThemeOrbsUI(selectedTheme);
      updateLivePreview();
      queueAutoSave();
      showToast(`🎨 Luxury Palette: ${orb.title}`, "info");
    });
  });

  // Download PDF
  if (printPdfBtn) {
    printPdfBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.print();
    });
  }

  // Fill Sample Profile
  if (fillSampleBtn) {
    fillSampleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Load sample marriage biodata with rich details?")) {
        biodata = structuredClone(sampleBiodata);
        initFormValues(biodata);
        updateLivePreview();
        queueAutoSave();
        showToast("✨ Sample profile loaded successfully!", "success");
      }
    });
  }

  // Share Trigger
  if (shareTriggerBtn) {
    shareTriggerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openShareModal();
    });
  }

  // Photo Upload Handler
  if (uploadPhotoBtn && photoInput) {
    uploadPhotoBtn.addEventListener("click", () => photoInput.click());

    photoInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (JPG, PNG, WEBP).");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Please select an image smaller than 10 MB.");
        return;
      }

      try {
        uploadPhotoBtn.disabled = true;
        uploadPhotoBtn.textContent = "Optimizing...";
        const optimizedDataUrl = await compressImage(file);

        if (!biodata.photos) biodata.photos = [];
        biodata.photos[0] = {
          src: optimizedDataUrl,
          caption: "Profile Photograph",
          isPrimary: true
        };

        if (avatarPreviewImg) avatarPreviewImg.src = optimizedDataUrl;
        updateLivePreview();
        queueAutoSave();
        showToast("📷 Photo attached & optimized!", "success");
      } catch (err) {
        console.error("Photo compression error:", err);
        alert("Failed to process photo.");
      } finally {
        uploadPhotoBtn.disabled = false;
        uploadPhotoBtn.textContent = "📷 Upload Photo";
        photoInput.value = "";
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener("click", () => {
      if (!confirm("Reset profile photo to default avatar?")) return;
      if (!biodata.photos) biodata.photos = [];
      biodata.photos[0] = {
        src: "assets/images/profile.svg",
        caption: "Profile Photograph",
        isPrimary: true
      };
      if (avatarPreviewImg) avatarPreviewImg.src = "assets/images/profile.svg";
      updateLivePreview();
      queueAutoSave();
    });
  }

  // Attach Listeners to Form Inputs inside Drawer
  document.querySelectorAll(".studio-drawer input, .studio-drawer select, .studio-drawer textarea").forEach((el) => {
    el.addEventListener("input", handleFieldChange);
    el.addEventListener("change", handleFieldChange);
  });

  // Dynamic Add Buttons
  const addEduBtn = document.getElementById("btn-add-education");
  if (addEduBtn) {
    addEduBtn.addEventListener("click", () => {
      if (!biodata.education) biodata.education = [];
      biodata.education.push({ degree: "", institution: "", year: "" });
      renderEducationList();
    });
  }

  const addSiblingBtn = document.getElementById("btn-add-sibling");
  if (addSiblingBtn) {
    addSiblingBtn.addEventListener("click", () => {
      if (!biodata.siblings) biodata.siblings = [];
      biodata.siblings.push({ relation: "Brother", name: "", maritalStatus: "Unmarried" });
      renderSiblingsList();
    });
  }

  // Auth Modal Listeners
  const btnCloseAuthModal = document.getElementById("btn-close-auth-modal");
  if (btnCloseAuthModal) btnCloseAuthModal.addEventListener("click", closeAuthModal);
  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  const tabLoginBtn = document.getElementById("btn-tab-login");
  const tabSignupBtn = document.getElementById("btn-tab-signup");
  const loginFormModal = document.getElementById("modal-login-form");
  const signupFormModal = document.getElementById("modal-signup-form");
  const modalAlert = document.getElementById("modal-auth-alert");

  function showModalError(msg) {
    if (!modalAlert) return alert(msg);
    modalAlert.innerHTML = msg;
    modalAlert.style.display = "block";
  }

  function clearAuthModalAlert() {
    if (!modalAlert) return;
    modalAlert.innerHTML = "";
    modalAlert.style.display = "none";
  }

  if (tabLoginBtn && tabSignupBtn) {
    tabLoginBtn.addEventListener("click", () => {
      tabLoginBtn.classList.add("active");
      tabSignupBtn.classList.remove("active");
      loginFormModal?.classList.add("active");
      signupFormModal?.classList.remove("active");
      clearAuthModalAlert();
    });

    tabSignupBtn.addEventListener("click", () => {
      tabSignupBtn.classList.add("active");
      tabLoginBtn.classList.remove("active");
      signupFormModal?.classList.add("active");
      loginFormModal?.classList.remove("active");
      clearAuthModalAlert();
    });
  }

  if (loginFormModal) {
    loginFormModal.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAuthModalAlert();
      const email = document.getElementById("modal-login-email")?.value;
      const password = document.getElementById("modal-login-password")?.value;
      const submitBtn = document.getElementById("btn-modal-login-submit");

      if (!email || !password) return showModalError("Please enter email and password.");
      submitBtn.disabled = true;
      submitBtn.textContent = "Logging In...";

      try {
        currentUser = await loginUser(email, password);
        await saveBiodata(currentUser.uid, biodata, currentUser);
        updateUserArea();
        closeAuthModal();
        showToast(`🎉 Logged in & saved to cloud (${currentUser.email})!`, "success");
      } catch (err) {
        showModalError(err.message || "Failed to log in.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In & Save";
      }
    });
  }

  if (signupFormModal) {
    signupFormModal.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAuthModalAlert();
      const name = document.getElementById("modal-signup-name")?.value;
      const email = document.getElementById("modal-signup-email")?.value;
      const password = document.getElementById("modal-signup-password")?.value;
      const confirmPwd = document.getElementById("modal-signup-confirm")?.value;
      const submitBtn = document.getElementById("btn-modal-signup-submit");

      if (!name || !email || !password) return showModalError("Please fill out all fields.");
      if (password.length < 6) return showModalError("Password should be at least 6 characters.");
      if (password !== confirmPwd) return showModalError("Passwords do not match.");

      submitBtn.disabled = true;
      submitBtn.textContent = "Creating Account...";

      try {
        currentUser = await registerUser({ name, email, password });
        await saveBiodata(currentUser.uid, biodata, currentUser);
        updateUserArea();
        closeAuthModal();
        showToast(`🎉 Account created & saved to cloud (${currentUser.email})!`, "success");
      } catch (err) {
        let msg = err.message || "Failed to create account.";
        if (msg.includes("already exists")) {
          msg = `An account with ${email} already exists. Please switch to the "Log In" tab.`;
        }
        showModalError(msg);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account & Save";
      }
    });
  }

  // Share Modal Listeners
  const btnCloseShareModal = document.getElementById("btn-close-share-modal");
  if (btnCloseShareModal) btnCloseShareModal.addEventListener("click", closeShareModal);
  if (shareModal) {
    shareModal.addEventListener("click", (e) => {
      if (e.target === shareModal) closeShareModal();
    });
  }

  const copyUrlBtn = document.getElementById("btn-copy-share-url");
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener("click", () => {
      const urlInput = document.getElementById("share-url-input");
      if (urlInput) {
        urlInput.select();
        navigator.clipboard.writeText(urlInput.value).then(() => {
          showToast("📋 Public link copied to clipboard!", "success");
        }).catch(() => {
          document.execCommand("copy");
          showToast("📋 Public link copied!", "success");
        });
      }
    });
  }

  // ==========================================
  // INITIAL DATA LOAD & HYDRATION
  // ==========================================
  try {
    if (currentUser) {
      biodata = await loadBiodata(currentUser.uid, currentUser);
    } else {
      const cached = localStorage.getItem("biodata_active_draft");
      if (cached) {
        try {
          biodata = JSON.parse(cached);
        } catch (e) {
          biodata = structuredClone(sampleBiodata);
        }
      } else {
        biodata = structuredClone(sampleBiodata);
      }
    }

    initFormValues(biodata);
    updateLivePreview();
    updateSaveStatus("saved");
    updateUserArea();
  } catch (err) {
    console.error("Failed to load initial biodata:", err);
    biodata = structuredClone(sampleBiodata);
    initFormValues(biodata);
    updateLivePreview();
    updateUserArea();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEditor);
} else {
  initEditor();
}

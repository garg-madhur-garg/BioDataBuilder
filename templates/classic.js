// Template 1: Classic Matrimonial (Complete In-Place Editable Living Canvas)
// Direct-on-paper editing, section hide/delete, custom extra fields, and master edit tag

export function renderClassicTemplate(data, options = { isPreview: false, editingSections: new Set() }) {
  if (!data) return '<div class="t-muted">No biodata available</div>';

  const p = data.personal || {};
  const c = data.contact || {};
  const car = data.career || {};
  const fam = data.family || {};
  const sibs = Array.isArray(data.siblings) ? data.siblings : [];
  const edus = Array.isArray(data.education) ? data.education : [];
  const horo = data.horoscope || {};
  const pref = data.preferences || {};
  const life = data.lifestyle || {};
  const photos = Array.isArray(data.photos) && data.photos.length > 0
    ? data.photos
    : [{ src: "assets/images/profile.svg", caption: "Profile" }];

  const primaryPhoto = photos[0]?.src || "assets/images/profile.svg";
  const activeTheme = data.theme || "royal-maroon";

  const isLive = options.isPreview;
  const editingSections = options.editingSections || new Set();

  const isEditing = (secKey) => isLive && editingSections.has(secKey);
  const isSecHidden = (secKey) => Boolean(data.hiddenSections && data.hiddenSections[secKey]);
  const isFieldHidden = (fieldKey) => Boolean(data.hiddenFields && data.hiddenFields[fieldKey]);

  const showIncome = Boolean(car.annualIncome);
  const showPhone = Boolean(c.phone);
  const showWhatsApp = Boolean(c.whatsapp);
  const showEmail = Boolean(c.email);
  const showAddress = Boolean(c.address);

  // Helper for hobby/language tags
  const renderTags = (val, className = "t-tag") => {
    if (!val) return "";
    const items = Array.isArray(val) ? val : String(val).split(",").map(s => s.trim()).filter(Boolean);
    return items.map(item => `<span class="${className}">${item}</span>`).join(" ");
  };

  // Helper for rendering custom extra fields in view mode
  const renderCustomFieldsView = (secKey) => {
    const customList = data.customFields && data.customFields[secKey] ? data.customFields[secKey] : [];
    if (!customList.length) return "";
    return customList.filter(f => f.label && f.value).map(f => `
      <tr>
        <td>${f.label}</td>
        <td>${f.value}</td>
      </tr>
    `).join("");
  };

  // Helper for rendering custom extra fields in edit mode
  const renderCustomFieldsEdit = (secKey) => {
    const customList = data.customFields && data.customFields[secKey] ? data.customFields[secKey] : [];
    if (!customList.length) return "";
    return customList.map(f => `
      <div class="inline-field-edit-row custom-field-row" data-custom-id="${f.id}" data-section="${secKey}">
        <input type="text" class="inline-custom-label-input" data-custom-id="${f.id}" data-section="${secKey}" value="${f.label || ""}" placeholder="Field Name">
        <input type="text" class="inline-field-input" data-custom-id="${f.id}" data-section="${secKey}" value="${f.value || ""}" placeholder="Field Value">
        <button type="button" class="btn-delete-custom-field" data-custom-id="${f.id}" data-section="${secKey}" title="Delete extra field">🗑️</button>
      </div>
    `).join("");
  };

  // Helper for generating an inline field edit row
  const renderFieldEditRow = (label, fieldKey, val, placeholder = "") => {
    const hidden = isFieldHidden(fieldKey);
    return `
      <div class="inline-field-edit-row ${hidden ? "is-hidden-field" : ""}">
        <span class="inline-field-label" title="${label}">${label}</span>
        <input type="text" class="inline-field-input" data-field="${fieldKey}" value="${val || ""}" placeholder="${placeholder || label}">
        <button type="button" class="btn-field-hide-toggle" data-field="${fieldKey}" title="${hidden ? "Unhide this field" : "Hide from biodata"}">
          ${hidden ? "🙈" : "👁️"}
        </button>
      </div>
    `;
  };

  return `
    <div class="template-classic theme-${activeTheme} ${isLive ? "is-preview living-document" : ""}" data-theme="${activeTheme}">
      <!-- Auspicious Header -->
      ${data.auspiciousMotto === "" && !isLive && !isEditing("shree") ? "" : `
      <div class="t-classic-shree ${isEditing("shree") ? "is-section-editing" : ""}">
        ${isEditing("shree") ? `
          <div class="t-sec-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; width: 100%;">
            <h3 class="t-classic-card-title" style="margin: 0;">
              <span>Auspicious Motto / Blessing <em class="t-editing-pill">Editing</em></span>
            </h3>
            <div class="t-sec-actions">
              <button type="button" class="section-done-btn" data-section="shree">✓ Done</button>
            </div>
          </div>

          <div class="shree-preset-chips-container">
            <span class="shree-preset-label">Quick Presets:</span>
            <div class="shree-preset-chips">
              <button type="button" class="btn-shree-chip" data-motto="॥ श्री गणेशाय नमः ॥">🕉️ श्री गणेशाय नमः</button>
              <button type="button" class="btn-shree-chip" data-motto="॥ श्री कृष्णाय नमः ॥">🦚 श्री कृष्णाय नमः</button>
              <button type="button" class="btn-shree-chip" data-motto="हरे कृष्ण">🌸 हरे कृष्ण (Hindi)</button>
              <button type="button" class="btn-shree-chip" data-motto="Hare Krishna">🦚 Hare Krishna (English)</button>
              <button type="button" class="btn-shree-chip" data-motto="॥ ॐ नमः शिवाय ॥">🔱 ॐ नमः शिवाय</button>
              <button type="button" class="btn-shree-chip" data-motto="॥ जय श्री राम ॥">🏹 जय श्री राम</button>
              <button type="button" class="btn-shree-chip" data-motto="॥ श्री राधारमणो विजयते ॥">🦚 श्री राधारमणो विजयते</button>
              <button type="button" class="btn-shree-chip" data-motto="॥ जय माता दी ॥">🌺 जय माता दी</button>
              <button type="button" class="btn-shree-chip" data-motto="॥ ੴ सतिगुर प्रसादि ॥">ੴ Ik Onkar</button>
              <button type="button" class="btn-shree-chip" data-motto="॥ ॐ नमो जिनेश्वराय ॥">☸️ ॐ नमो जिनेश्वराय</button>
              <button type="button" class="btn-shree-chip" data-motto="॥ ॐ ॥">🕉️ ॥ ॐ ॥</button>
              <button type="button" class="btn-shree-chip btn-shree-none" data-motto="">🚫 None (Remove)</button>
            </div>
          </div>

          <div style="margin-top: 14px; text-align: left;">
            <label style="font-size: 0.78rem; font-weight: 600; color: #6E6357; display: block; margin-bottom: 5px;">Custom Blessing / Motto:</label>
            <input type="text" class="inline-field-input" data-field="auspiciousMotto" id="field-custom-motto" placeholder="Type custom blessing (e.g. Hare Krishna, जय माता दी, राधे राधे)" value="${data.auspiciousMotto !== undefined ? data.auspiciousMotto : "॥ श्री गणेशाय नमः ॥"}" style="width: 100%;">
          </div>
        ` : `
          ${data.auspiciousMotto !== "" ? `
            <span class="t-om ${isLive ? "living-editable" : ""}" 
                  ${isLive ? 'contenteditable="true" spellcheck="false" data-field="auspiciousMotto" title="Click to edit or choose blessing"' : ""}>
              ${data.auspiciousMotto !== undefined ? data.auspiciousMotto : "॥ श्री गणेशाय नमः ॥"}
            </span>
          ` : (isLive ? `
            <span class="t-om t-muted" style="font-style: italic; font-size: 0.84rem; opacity: 0.7;" title="Auspicious blessing is hidden">
              [No Blessing Line]
            </span>
          ` : "")}
          ${isLive ? `
            <button type="button" class="btn-shree-inline-edit section-edit-trigger" data-section="shree" title="Choose or customize auspicious header">✎ Edit Blessing</button>
          ` : ""}
        `}
      </div>
      `}

      <!-- Top Paper Bar with Master Edit Tag -->
      <div class="t-paper-top-bar">
        <div class="t-top-bar-placeholder"></div>
        <span class="t-classic-badge">MARRIAGE BIODATA</span>
        ${isLive ? `<button type="button" class="master-edit-badge" id="btn-master-edit-paper" title="Open complete master inspector drawer">⚙️ Master Edit</button>` : `<div class="t-top-bar-placeholder"></div>`}
      </div>

      <!-- Hero Header with Direct Profile Edit -->
      <div class="t-classic-hero ${isEditing("hero") ? "is-section-editing" + (isSecHidden("hero") ? " is-section-hidden-editing" : "") : ""}">
        ${isEditing("hero") ? `
          <div class="t-sec-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; width: 100%;">
            <h3 class="t-classic-card-title" style="margin: 0;">
              <span>Profile & Key Highlights <em class="t-editing-pill">Editing</em></span>
            </h3>
            <div class="t-sec-actions">
              <button type="button" class="section-done-btn" data-section="hero">✓ Done</button>
            </div>
          </div>

          <div class="inline-edit-fields-list" style="margin-top: 10px;">
            <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 12px; padding: 12px; background: #FAF7F2; border-radius: 8px; border: 1px solid #EAE3D9;">
              <div class="t-classic-photo-wrap living-photo-trigger" id="canvas-photo-trigger" title="Click to upload/change photo" style="width: 76px; height: 76px; margin: 0; flex-shrink: 0;">
                <img src="${primaryPhoto}" alt="${p.fullName || "Profile"}" class="t-classic-photo" onerror="this.src='assets/images/profile.svg'">
                <div class="photo-hover-pill">📷 Change</div>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.88rem; color: #7B113A; margin-bottom: 2px;">Profile Photo</div>
                <div style="font-size: 0.78rem; color: #78716C;">Upload or replace your portrait photo directly.</div>
                <button type="button" class="btn-clean-ghost" style="padding: 4px 12px; font-size: 0.76rem; margin-top: 6px; border: 1px solid #D6CBC0; border-radius: 4px; background: #FFF;" onclick="document.getElementById('profile-photo-input')?.click()">📷 Upload New Photo</button>
              </div>
            </div>

            <h4 class="t-subheading" style="margin-top: 6px;">Profile Identity</h4>
            ${renderFieldEditRow("Full Name", "personal.fullName", p.fullName)}
            ${renderFieldEditRow("Designation", "career.designation", car.designation || car.profession)}
            ${renderFieldEditRow("Company", "career.company", car.company)}

            <h4 class="t-subheading" style="margin-top: 14px;">Header Quick Chips</h4>
            ${renderFieldEditRow("Age", "personal.age", p.age, "e.g. 27")}
            ${renderFieldEditRow("Date of Birth", "personal.dob", p.dob, "YYYY-MM-DD")}
            ${renderFieldEditRow("Height", "personal.height", p.height, "e.g. 5 ft 11 in (178 cm)")}
            ${renderFieldEditRow("Marital Status", "personal.maritalStatus", p.maritalStatus, "e.g. Never Married")}
            ${renderFieldEditRow("Current City", "personal.currentCity", p.currentCity, "e.g. New Delhi")}
            ${renderFieldEditRow("Religion", "personal.religion", p.religion, "e.g. Hindu")}
            ${renderFieldEditRow("Caste", "personal.caste", p.caste, "e.g. Vaishya")}
            ${renderFieldEditRow("Mother Tongue", "personal.motherTongue", p.motherTongue, "e.g. Hindi")}

            ${renderCustomFieldsEdit("hero")}
          </div>
          <button type="button" class="btn-add-section-extra-field" data-section="hero">+ Add Extra Field</button>
        ` : `
          <div class="t-classic-photo-wrap living-photo-trigger" id="canvas-photo-trigger" title="Click to upload/change photo">
            <img src="${primaryPhoto}" alt="${p.fullName || "Profile"}" class="t-classic-photo" onerror="this.src='assets/images/profile.svg'">
            <div class="photo-hover-pill">📷 Change Photo</div>
          </div>
          <div class="t-classic-header-info">
            <div class="t-hero-name-row">
              ${!isFieldHidden("personal.fullName") ? `
                <h1 class="t-classic-name">
                  <span class="${isLive ? "living-editable" : ""}" 
                        ${isLive ? 'contenteditable="true" spellcheck="false" data-field="personal.fullName" title="Click to edit name"' : ""}>${p.fullName || "Your Full Name"}</span>
                </h1>
              ` : (isLive ? `
                <h1 class="t-classic-name" style="opacity: 0.5;">
                  <span class="t-muted" style="font-size: 1.2rem; font-style: italic;">🙈 [Name Hidden]</span>
                </h1>
              ` : "")}
              ${isLive ? `
                <button type="button" class="section-edit-trigger" data-section="hero" title="Edit header profile and key chips">✎ Edit</button>
              ` : ""}
            </div>
            ${(() => {
              const showDesig = (car.designation || car.profession) && !isFieldHidden("career.designation");
              const showComp = car.company && !isFieldHidden("career.company");
              if (!showDesig && !showComp) return "";
              return `
                <p class="t-classic-subtitle">
                  ${showDesig ? `
                    <span class="${isLive ? "living-editable" : ""}" 
                          ${isLive ? 'contenteditable="true" spellcheck="false" data-field="career.designation" title="Click to edit designation"' : ""}>${car.designation || car.profession}</span>
                  ` : ""}
                  ${showDesig && showComp ? " at " : ""}
                  ${showComp ? `
                    <strong class="${isLive ? "living-editable" : ""}" 
                            ${isLive ? 'contenteditable="true" spellcheck="false" data-field="career.company" title="Click to edit company"' : ""}>${car.company}</strong>
                  ` : ""}
                </p>
              `;
            })()}
            
            <div class="t-classic-quick-chips">
              ${p.age && !isFieldHidden("personal.age") ? `<span class="t-chip">🎂 ${p.age} Years</span>` : ""}
              ${p.height && !isFieldHidden("personal.height") ? `<span class="t-chip">📏 ${p.height}</span>` : ""}
              ${p.maritalStatus && !isFieldHidden("personal.maritalStatus") ? `<span class="t-chip">💍 ${p.maritalStatus}</span>` : ""}
              ${p.currentCity && !isFieldHidden("personal.currentCity") ? `<span class="t-chip">📍 ${p.currentCity}</span>` : ""}
              ${(() => {
                const showRel = p.religion && !isFieldHidden("personal.religion");
                const showCas = p.caste && !isFieldHidden("personal.caste");
                if (!showRel && !showCas) return "";
                if (showRel && showCas) return `<span class="t-chip">🕉️ ${p.religion} (${p.caste})</span>`;
                if (showRel) return `<span class="t-chip">🕉️ ${p.religion}</span>`;
                return `<span class="t-chip">🕉️ ${p.caste}</span>`;
              })()}
              ${p.motherTongue && !isFieldHidden("personal.motherTongue") ? `<span class="t-chip">🗣️ ${p.motherTongue}</span>` : ""}
              ${data.customFields?.hero?.filter(f => f.label && f.value).map(f => `<span class="t-chip">✨ ${f.label}: ${f.value}</span>`).join("") || ""}
            </div>
          </div>
        `}
      </div>

      <!-- 1. About Me (Section 5.10) -->
      ${isSecHidden("about") && !isEditing("about") ? (isLive ? `
        <div class="t-section-hidden-notice">
          <span>🙈 <strong>About Me</strong> section is hidden</span>
          <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="about">👁️ Unhide</button>
        </div>
      ` : "") : `
      <div class="t-classic-section ${isEditing("about") ? "is-section-editing" + (isSecHidden("about") ? " is-section-hidden-editing" : "") : ""}">
        <h3 class="t-classic-heading">
          <span>About Me ${isEditing("about") ? `<em class="t-editing-pill">Editing</em>` : ""}</span>
          <div class="t-sec-actions">
            ${isEditing("about") ? `
              <button type="button" class="btn-sec-hide-toggle ${isSecHidden("about") ? "is-hidden" : "is-visible"}" data-section="about" title="Hide/Unhide section">
                ${isSecHidden("about") ? "🙈 Hidden" : "👁️ Visible"}
              </button>
              <button type="button" class="section-done-btn" data-section="about">✓ Done</button>
            ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="about">✎ Edit</button>` : "")}
          </div>
        </h3>
        ${isEditing("about") ? `
          ${isSecHidden("about") ? `
            <div class="section-hidden-alert-banner">
              🙈 <strong>About Me is currently HIDDEN:</strong> This section will NOT appear on your final biodata or print/PDF export. Click "🙈 Hidden" above to make it visible.
            </div>
          ` : ""}
          <div style="margin-top: 10px;">
            <textarea class="inline-field-input" data-field="about" style="width:100%; min-height:120px; line-height:1.6;" placeholder="Write a warm, honest introduction about yourself...">${data.about || ""}</textarea>
          </div>
        ` : `
          <div class="t-classic-about ${isLive ? "living-editable" : ""}" 
               ${isLive ? 'contenteditable="true" spellcheck="false" data-field="about" title="Click to edit about narrative"' : ""}>
            ${data.about ? data.about.split(/\n+/).map(para => para.trim()).filter(Boolean).map(para => `<p style="margin-bottom:8px;">${para}</p>`).join("") : `<p class="t-muted">Click here to write a heartfelt narrative about your background, personality, and aspirations...</p>`}
          </div>
        `}
      </div>
      `}

      <!-- 2-Column Grid: Personal Details & Education/Career -->
      <div class="t-classic-grid-2">
        <!-- 2. Personal Details (Section 5.1) -->
        ${isSecHidden("personal") && !isEditing("personal") ? (isLive ? `
          <div class="t-classic-card t-section-hidden-notice">
            <span>🙈 <strong>Personal Details</strong> card is hidden</span>
            <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="personal">👁️ Unhide</button>
          </div>
        ` : "") : `
        <div class="t-classic-card ${isEditing("personal") ? "is-section-editing" + (isSecHidden("personal") ? " is-section-hidden-editing" : "") : ""}">
          <h3 class="t-classic-card-title">
            <span>Personal Details ${isEditing("personal") ? `<em class="t-editing-pill">Editing</em>` : ""}</span>
            <div class="t-sec-actions">
              ${isEditing("personal") ? `
                <button type="button" class="btn-sec-hide-toggle ${isSecHidden("personal") ? "is-hidden" : "is-visible"}" data-section="personal">
                  ${isSecHidden("personal") ? "🙈 Hidden" : "👁️ Visible"}
                </button>
                <button type="button" class="section-done-btn" data-section="personal">✓ Done</button>
              ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="personal">✎ Edit</button>` : "")}
            </div>
          </h3>

          ${isEditing("personal") ? `
            ${isSecHidden("personal") ? `
              <div class="section-hidden-alert-banner">
                🙈 <strong>Personal Details is currently HIDDEN:</strong> This section will NOT appear on your final biodata or print/PDF export.
              </div>
            ` : ""}
            <div class="inline-edit-fields-list">
              ${renderFieldEditRow("Full Name", "personal.fullName", p.fullName)}
              ${renderFieldEditRow("Gender", "personal.gender", p.gender)}
              ${renderFieldEditRow("Date of Birth", "personal.dob", p.dob, "YYYY-MM-DD")}
              ${renderFieldEditRow("Height", "personal.height", p.height, "e.g. 5 ft 10 in")}
              ${renderFieldEditRow("Weight", "personal.weight", p.weight, "e.g. 72 kg")}
              ${renderFieldEditRow("Blood Group", "personal.bloodGroup", p.bloodGroup, "e.g. B+")}
              ${renderFieldEditRow("Complexion", "personal.complexion", p.complexion, "e.g. Fair")}
              ${renderFieldEditRow("Marital Status", "personal.maritalStatus", p.maritalStatus)}
              ${renderFieldEditRow("Mother Tongue", "personal.motherTongue", p.motherTongue)}
              ${renderFieldEditRow("Religion", "personal.religion", p.religion)}
              ${renderFieldEditRow("Caste", "personal.caste", p.caste)}
              ${renderFieldEditRow("Gotra", "personal.gotra", p.gotra)}
              ${renderFieldEditRow("Current City", "personal.currentCity", p.currentCity)}
              ${renderFieldEditRow("Native Place", "personal.nativePlace", p.nativePlace)}
              ${renderCustomFieldsEdit("personal")}
            </div>
            <button type="button" class="btn-add-section-extra-field" data-section="personal">+ Add Extra Field</button>
          ` : `
            <table class="t-classic-table">
              <tbody>
                ${p.fullName && !isFieldHidden("personal.fullName") ? `<tr><td>Full Name</td><td><strong>${p.fullName}</strong></td></tr>` : ""}
                ${p.gender && !isFieldHidden("personal.gender") ? `<tr><td>Gender</td><td>${p.gender}</td></tr>` : ""}
                ${p.dob && !isFieldHidden("personal.dob") ? `<tr><td>Date of Birth</td><td>${p.dob} ${p.age ? `(${p.age} yrs)` : ""}</td></tr>` : ""}
                ${p.height && !isFieldHidden("personal.height") ? `<tr><td>Height</td><td>${p.height}</td></tr>` : ""}
                ${p.weight && !isFieldHidden("personal.weight") ? `<tr><td>Weight</td><td>${p.weight}</td></tr>` : ""}
                ${p.bloodGroup && !isFieldHidden("personal.bloodGroup") ? `<tr><td>Blood Group</td><td>${p.bloodGroup}</td></tr>` : ""}
                ${p.complexion && !isFieldHidden("personal.complexion") ? `<tr><td>Complexion</td><td>${p.complexion}</td></tr>` : ""}
                ${p.maritalStatus && !isFieldHidden("personal.maritalStatus") ? `<tr><td>Marital Status</td><td>${p.maritalStatus}</td></tr>` : ""}
                ${p.motherTongue && !isFieldHidden("personal.motherTongue") ? `<tr><td>Mother Tongue</td><td>${p.motherTongue}</td></tr>` : ""}
                ${p.religion && !isFieldHidden("personal.religion") ? `<tr><td>Religion & Caste</td><td>${p.religion} ${p.caste ? `/ ${p.caste}` : ""}</td></tr>` : ""}
                ${p.gotra && !isFieldHidden("personal.gotra") ? `<tr><td>Gotra</td><td>${p.gotra}</td></tr>` : ""}
                ${p.currentCity && !isFieldHidden("personal.currentCity") ? `<tr><td>Current City</td><td>${p.currentCity}</td></tr>` : ""}
                ${p.nativePlace && !isFieldHidden("personal.nativePlace") ? `<tr><td>Native Place</td><td>${p.nativePlace}</td></tr>` : ""}
                ${renderCustomFieldsView("personal")}
              </tbody>
            </table>
          `}
        </div>
        `}

        <!-- 3. Education & Career (Section 5.3 & 5.4) -->
        ${isSecHidden("career") && !isEditing("career") ? (isLive ? `
          <div class="t-classic-card t-section-hidden-notice">
            <span>🙈 <strong>Education & Career</strong> card is hidden</span>
            <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="career">👁️ Unhide</button>
          </div>
        ` : "") : `
        <div class="t-classic-card ${isEditing("career") ? "is-section-editing" + (isSecHidden("career") ? " is-section-hidden-editing" : "") : ""}">
          <h3 class="t-classic-card-title">
            <span>Education & Career ${isEditing("career") ? `<em class="t-editing-pill">Editing</em>` : ""}</span>
            <div class="t-sec-actions">
              ${isEditing("career") ? `
                <button type="button" class="btn-sec-hide-toggle ${isSecHidden("career") ? "is-hidden" : "is-visible"}" data-section="career">
                  ${isSecHidden("career") ? "🙈 Hidden" : "👁️ Visible"}
                </button>
                <button type="button" class="section-done-btn" data-section="career">✓ Done</button>
              ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="career">✎ Edit</button>` : "")}
            </div>
          </h3>

          ${isEditing("career") ? `
            ${isSecHidden("career") ? `
              <div class="section-hidden-alert-banner">
                🙈 <strong>Education & Career is currently HIDDEN:</strong> This section will NOT appear on your final biodata or print/PDF export.
              </div>
            ` : ""}
            <div class="inline-edit-fields-list">
              <h4 class="t-subheading" style="margin-top: 6px;">💼 Professional Career</h4>
              ${renderFieldEditRow("Profession", "career.profession", car.profession)}
              ${renderFieldEditRow("Designation", "career.designation", car.designation)}
              ${renderFieldEditRow("Company", "career.company", car.company)}
              ${renderFieldEditRow("Location", "career.location", car.location)}
              ${renderFieldEditRow("Annual Income", "career.annualIncome", car.annualIncome, "e.g. ₹28 - 32 LPA")}
              ${renderFieldEditRow("Experience", "career.experience", car.experience, "e.g. 5+ Years")}

              <h4 class="t-subheading" style="margin-top: 14px;">🎓 Highest Education</h4>
              ${renderFieldEditRow("Primary Degree", "education.0.degree", edus[0]?.degree, "e.g. B.Tech in CS")}
              ${renderFieldEditRow("Institution", "education.0.institution", edus[0]?.institution, "e.g. DTU / IIT")}
              ${renderFieldEditRow("Passing Year", "education.0.year", edus[0]?.year, "e.g. 2019")}
              ${renderFieldEditRow("Grade / Note", "education.0.description", edus[0]?.description, "e.g. First Class")}

              ${renderCustomFieldsEdit("career")}
            </div>
            <button type="button" class="btn-add-section-extra-field" data-section="career">+ Add Extra Field</button>
          ` : `
            ${(() => {
              const visibleEdus = edus.filter((edu, idx) => {
                const showDeg = edu.degree && !isFieldHidden(`education.${idx}.degree`);
                const showInst = edu.institution && !isFieldHidden(`education.${idx}.institution`);
                const showYr = edu.year && !isFieldHidden(`education.${idx}.year`);
                const showDesc = edu.description && !isFieldHidden(`education.${idx}.description`);
                return showDeg || showInst || showYr || showDesc;
              });

              if (visibleEdus.length === 0 && isFieldHidden("education.0.degree")) return "";

              return `
                <div class="t-subblock">
                  <h4 class="t-subheading">🎓 Education</h4>
                  ${visibleEdus.length > 0 ? visibleEdus.map((edu, idx) => `
                    <div class="t-list-item">
                      ${edu.degree && !isFieldHidden(`education.${idx}.degree`) ? `<div class="t-item-title">${edu.degree}</div>` : ""}
                      ${(edu.institution && !isFieldHidden(`education.${idx}.institution`)) || (edu.year && !isFieldHidden(`education.${idx}.year`)) ? `
                        <div class="t-item-sub">
                          ${edu.institution && !isFieldHidden(`education.${idx}.institution`) ? edu.institution : ""}
                          ${edu.year && !isFieldHidden(`education.${idx}.year`) ? ` (${edu.year})` : ""}
                        </div>
                      ` : ""}
                      ${edu.description && !isFieldHidden(`education.${idx}.description`) ? `<div class="t-item-desc">${edu.description}</div>` : ""}
                    </div>
                  `).join("") : `<p class="t-muted" style="font-size:0.86rem;">Education details not specified</p>`}
                </div>
              `;
            })()}

            ${(() => {
              const showDesig = (car.designation || car.profession) && !isFieldHidden("career.designation");
              const showComp = car.company && !isFieldHidden("career.company");
              const showLoc = car.location && !isFieldHidden("career.location");
              const showExp = car.experience && !isFieldHidden("career.experience");
              const showInc = showIncome && car.annualIncome && !isFieldHidden("career.annualIncome");
              
              if (!showDesig && !showComp && !showLoc && !showExp && !showInc) return "";
              
              return `
                <div class="t-subblock" style="margin-top: 16px;">
                  <h4 class="t-subheading">💼 Professional Career</h4>
                  <div class="t-list-item">
                    ${showDesig ? `<div class="t-item-title">${car.designation || car.profession}</div>` : ""}
                    ${showComp || showLoc ? `
                      <div class="t-item-sub">
                        ${showComp ? `<strong>${car.company}</strong>` : ""}
                        ${showLoc ? `${showComp ? " • " : ""}${car.location}` : ""}
                      </div>
                    ` : ""}
                    ${showExp ? `<div class="t-item-desc">Experience: ${car.experience}</div>` : ""}
                    ${showInc ? `<div class="t-item-badge">💰 Annual Package: ${car.annualIncome}</div>` : ""}
                  </div>
                </div>
              `;
            })()}

            ${data.customFields?.career?.length ? `
              <table class="t-classic-table" style="margin-top: 10px;">
                <tbody>${renderCustomFieldsView("career")}</tbody>
              </table>
            ` : ""}
          `}
        </div>
        `}
      </div>

      <!-- 4. Family Details & Siblings (Section 5.5 & 5.6) -->
      ${isSecHidden("family") && !isEditing("family") ? (isLive ? `
        <div class="t-classic-section t-section-hidden-notice">
          <span>🙈 <strong>Family Background</strong> section is hidden</span>
          <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="family">👁️ Unhide</button>
        </div>
      ` : "") : `
      <div class="t-classic-section ${isEditing("family") ? "is-section-editing" + (isSecHidden("family") ? " is-section-hidden-editing" : "") : ""}">
        <h3 class="t-classic-heading">
          <span>Family Background ${isEditing("family") ? `<em class="t-editing-pill">Editing</em>` : ""}</span>
          <div class="t-sec-actions">
            ${isEditing("family") ? `
              <button type="button" class="btn-sec-hide-toggle ${isSecHidden("family") ? "is-hidden" : "is-visible"}" data-section="family">
                ${isSecHidden("family") ? "🙈 Hidden" : "👁️ Visible"}
              </button>
              <button type="button" class="section-done-btn" data-section="family">✓ Done</button>
            ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="family">✎ Edit</button>` : "")}
          </div>
        </h3>

        ${isEditing("family") ? `
          ${isSecHidden("family") ? `
            <div class="section-hidden-alert-banner">
              🙈 <strong>Family Background is currently HIDDEN:</strong> This section will NOT appear on your final biodata or print/PDF export.
            </div>
          ` : ""}
          <div class="inline-edit-fields-list">
            ${renderFieldEditRow("Father's Name", "family.fatherName", fam.fatherName)}
            ${renderFieldEditRow("Father's Work", "family.fatherProfession", fam.fatherProfession)}
            ${renderFieldEditRow("Mother's Name", "family.motherName", fam.motherName)}
            ${renderFieldEditRow("Mother's Work", "family.motherProfession", fam.motherProfession)}
            ${renderFieldEditRow("Family Type", "family.familyType", fam.familyType, "e.g. Nuclear / Joint")}
            ${renderFieldEditRow("Family Values", "family.familyValues", fam.familyValues, "e.g. Moderate & Traditional")}
            ${renderFieldEditRow("Ancestral Origin", "family.nativePlace", fam.nativePlace)}
            ${renderFieldEditRow("Additional Notes", "family.additionalInfo", fam.additionalInfo)}
            ${renderCustomFieldsEdit("family")}
          </div>
          <button type="button" class="btn-add-section-extra-field" data-section="family">+ Add Extra Field</button>
        ` : `
          <div class="t-classic-family-grid">
            ${fam.fatherName && !isFieldHidden("family.fatherName") ? `
              <div class="t-fam-box">
                <span class="t-fam-label">Father:</span>
                <strong>${fam.fatherName}</strong>
                ${fam.fatherProfession && !isFieldHidden("family.fatherProfession") ? `<span class="t-fam-sub">${fam.fatherProfession}</span>` : ""}
              </div>
            ` : ""}
            ${fam.motherName && !isFieldHidden("family.motherName") ? `
              <div class="t-fam-box">
                <span class="t-fam-label">Mother:</span>
                <strong>${fam.motherName}</strong>
                ${fam.motherProfession && !isFieldHidden("family.motherProfession") ? `<span class="t-fam-sub">${fam.motherProfession}</span>` : ""}
              </div>
            ` : ""}
            ${fam.familyType && !isFieldHidden("family.familyType") ? `
              <div class="t-fam-box">
                <span class="t-fam-label">Family Type & Values:</span>
                <strong>${fam.familyType}</strong>
                ${fam.familyValues && !isFieldHidden("family.familyValues") ? `<span class="t-fam-sub">${fam.familyValues}</span>` : ""}
              </div>
            ` : ""}
            ${(fam.nativePlace || p.nativePlace) && !isFieldHidden("family.nativePlace") ? `
              <div class="t-fam-box">
                <span class="t-fam-label">Ancestral Roots:</span>
                <strong>${fam.nativePlace || p.nativePlace}</strong>
              </div>
            ` : ""}
          </div>

          <!-- Siblings List Subblock with dedicated Edit option -->
          ${isSecHidden("siblings") && !isEditing("siblings") ? (isLive ? `
            <div class="t-classic-siblings t-section-hidden-notice" style="margin-top:14px;">
              <span>🙈 <strong>Brothers & Sisters</strong> section is hidden</span>
              <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="siblings">👁️ Unhide</button>
            </div>
          ` : "") : `
            <div class="t-classic-siblings ${isEditing("siblings") ? "is-section-editing" + (isSecHidden("siblings") ? " is-section-hidden-editing" : "") : ""}" style="margin-top:14px;">
              <div class="t-siblings-header-row">
                <h4 class="t-subheading" style="margin:0;">Brothers & Sisters ${sibs.length > 0 ? `(${sibs.length})` : ""} ${isEditing("siblings") ? `<em class="t-editing-pill">Editing</em>` : ""}</h4>
                <div class="t-sec-actions">
                  ${isEditing("siblings") ? `
                    <button type="button" class="btn-sec-hide-toggle ${isSecHidden("siblings") ? "is-hidden" : "is-visible"}" data-section="siblings">
                      ${isSecHidden("siblings") ? "🙈 Hidden" : "👁️ Visible"}
                    </button>
                    <button type="button" class="section-done-btn" data-section="siblings">✓ Done</button>
                  ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="siblings" title="Edit Brothers & Sisters">✎ Edit</button>` : "")}
                </div>
              </div>

              ${isEditing("siblings") ? `
                ${isSecHidden("siblings") ? `
                  <div class="section-hidden-alert-banner">
                    🙈 <strong>Brothers & Sisters section is currently HIDDEN:</strong> It will NOT appear on your final biodata or print/PDF export.
                  </div>
                ` : ""}
                <div class="inline-siblings-edit-list">
                  ${sibs.map((s, idx) => `
                    <div class="inline-sibling-edit-row">
                      <select class="inline-sibling-select" data-sibling-idx="${idx}" data-field="relation">
                        <option value="Brother" ${s.relation === "Brother" ? "selected" : ""}>👦 Brother</option>
                        <option value="Sister" ${s.relation === "Sister" ? "selected" : ""}>👧 Sister</option>
                      </select>
                      <input type="text" class="inline-field-input" data-sibling-idx="${idx}" data-field="name" value="${s.name || ""}" placeholder="Full Name">
                      <select class="inline-sibling-select" data-sibling-idx="${idx}" data-field="maritalStatus">
                        <option value="Unmarried" ${s.maritalStatus === "Unmarried" ? "selected" : ""}>Unmarried</option>
                        <option value="Married" ${s.maritalStatus === "Married" ? "selected" : ""}>Married</option>
                      </select>
                      <input type="text" class="inline-field-input" data-sibling-idx="${idx}" data-field="profession" value="${s.profession || ""}" placeholder="Profession & Location (e.g. Data Analyst at Deloitte)">
                      <button type="button" class="btn-delete-sibling-item" data-sibling-idx="${idx}" title="Delete this sibling">🗑️</button>
                    </div>
                  `).join("")}
                </div>
                <button type="button" class="btn-add-sibling-paper">+ Add Brother / Sister</button>
              ` : `
                <div class="t-siblings-list">
                  ${sibs.length > 0 ? sibs.map(s => `
                    <div class="t-sibling-chip">
                      <span class="t-sib-icon">${s.relation === "Sister" ? "👧" : "👦"}</span>
                      <div>
                        <strong>${s.relation || "Sibling"}:</strong> ${s.name || "Name"}
                        <span class="t-sib-details">${s.maritalStatus ? `(${s.maritalStatus})` : ""}${s.profession ? ` • ${s.profession}` : ""}</span>
                      </div>
                    </div>
                  `).join("") : `<p class="t-muted" style="font-size:0.84rem; margin: 4px 0;">No brothers or sisters added</p>`}
                </div>
              `}
            </div>
          `}

          ${fam.additionalInfo && !isFieldHidden("family.additionalInfo") ? `<p class="t-fam-note">${fam.additionalInfo}</p>` : ""}

          ${data.customFields?.family?.length ? `
            <table class="t-classic-table" style="margin-top: 10px;">
              <tbody>${renderCustomFieldsView("family")}</tbody>
            </table>
          ` : ""}
        `}
      </div>
      `}

      <!-- 5. Horoscope Details (Section 5.8) -->
      ${isSecHidden("horoscope") && !isEditing("horoscope") ? (isLive ? `
        <div class="t-classic-section t-section-hidden-notice">
          <span>🙈 <strong>Horoscope / Kundli</strong> section is hidden</span>
          <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="horoscope">👁️ Unhide</button>
        </div>
      ` : "") : `
      <div class="t-classic-section ${isEditing("horoscope") ? "is-section-editing" + (isSecHidden("horoscope") ? " is-section-hidden-editing" : "") : ""}">
        <h3 class="t-classic-heading">
          <span>Horoscope / Kundli Details ${isEditing("horoscope") ? `<em class="t-editing-pill">Editing</em>` : ""}</span>
          <div class="t-sec-actions">
            ${isEditing("horoscope") ? `
              <button type="button" class="btn-sec-hide-toggle ${isSecHidden("horoscope") ? "is-hidden" : "is-visible"}" data-section="horoscope">
                ${isSecHidden("horoscope") ? "🙈 Hidden" : "👁️ Visible"}
              </button>
              <button type="button" class="section-done-btn" data-section="horoscope">✓ Done</button>
            ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="horoscope">✎ Edit</button>` : "")}
          </div>
        </h3>

        ${isEditing("horoscope") ? `
          ${isSecHidden("horoscope") ? `
            <div class="section-hidden-alert-banner">
              🙈 <strong>Horoscope section is currently HIDDEN:</strong> It will NOT appear on your final biodata or print/PDF export.
            </div>
          ` : ""}
          <div class="inline-edit-fields-list">
            ${renderFieldEditRow("Rashi (Moon Sign)", "horoscope.rashi", horo.rashi)}
            ${renderFieldEditRow("Nakshatra", "horoscope.nakshatra", horo.nakshatra)}
            ${renderFieldEditRow("Gotra", "horoscope.gotra", horo.gotra)}
            ${renderFieldEditRow("Manglik Status", "horoscope.manglik", horo.manglik, "Non-Manglik / Manglik")}
            ${renderFieldEditRow("Time of Birth", "horoscope.birthTime", horo.birthTime, "e.g. 04:45 AM")}
            ${renderFieldEditRow("Place of Birth", "horoscope.birthPlace", horo.birthPlace, "e.g. New Delhi")}
            ${renderCustomFieldsEdit("horoscope")}
          </div>
          <button type="button" class="btn-add-section-extra-field" data-section="horoscope">+ Add Extra Field</button>
        ` : `
          <div class="t-classic-horo-grid">
            ${horo.rashi && !isFieldHidden("horoscope.rashi") ? `<div class="t-horo-item"><span class="t-muted">Rashi:</span> <strong>${horo.rashi}</strong></div>` : ""}
            ${horo.nakshatra && !isFieldHidden("horoscope.nakshatra") ? `<div class="t-horo-item"><span class="t-muted">Nakshatra:</span> <strong>${horo.nakshatra}</strong></div>` : ""}
            ${horo.gotra && !isFieldHidden("horoscope.gotra") ? `<div class="t-horo-item"><span class="t-muted">Gotra:</span> <strong>${horo.gotra}</strong></div>` : ""}
            ${horo.manglik && !isFieldHidden("horoscope.manglik") ? `<div class="t-horo-item"><span class="t-muted">Manglik:</span> <strong>${horo.manglik}</strong></div>` : ""}
            ${horo.birthTime && !isFieldHidden("horoscope.birthTime") ? `<div class="t-horo-item"><span class="t-muted">Time of Birth:</span> <strong>${horo.birthTime}</strong></div>` : ""}
            ${horo.birthPlace && !isFieldHidden("horoscope.birthPlace") ? `<div class="t-horo-item"><span class="t-muted">Birth Place:</span> <strong>${horo.birthPlace}</strong></div>` : ""}
          </div>
          ${data.customFields?.horoscope?.length ? `
            <table class="t-classic-table" style="margin-top: 10px;">
              <tbody>${renderCustomFieldsView("horoscope")}</tbody>
            </table>
          ` : ""}
        `}
      </div>
      `}

      <!-- 6. Lifestyle & Partner Preferences (Section 5.7 & 5.9) -->
      <div class="t-classic-grid-2">
        <!-- Lifestyle -->
        ${isSecHidden("lifestyle") && !isEditing("lifestyle") ? (isLive ? `
          <div class="t-classic-card t-section-hidden-notice">
            <span>🙈 <strong>Lifestyle</strong> card is hidden</span>
            <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="lifestyle">👁️ Unhide</button>
          </div>
        ` : "") : `
        <div class="t-classic-card ${isEditing("lifestyle") ? "is-section-editing" + (isSecHidden("lifestyle") ? " is-section-hidden-editing" : "") : ""}">
          <h3 class="t-classic-card-title">
            <span>Lifestyle & Habits ${isEditing("lifestyle") ? `<em class="t-editing-pill">Editing</em>` : ""}</span>
            <div class="t-sec-actions">
              ${isEditing("lifestyle") ? `
                <button type="button" class="btn-sec-hide-toggle ${isSecHidden("lifestyle") ? "is-hidden" : "is-visible"}" data-section="lifestyle">
                  ${isSecHidden("lifestyle") ? "🙈 Hidden" : "👁️ Visible"}
                </button>
                <button type="button" class="section-done-btn" data-section="lifestyle">✓ Done</button>
              ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="lifestyle">✎ Edit</button>` : "")}
            </div>
          </h3>

          ${isEditing("lifestyle") ? `
            ${isSecHidden("lifestyle") ? `
              <div class="section-hidden-alert-banner">
                🙈 <strong>Lifestyle section is currently HIDDEN:</strong> It will NOT appear on your final biodata or print/PDF export.
              </div>
            ` : ""}
            <div class="inline-edit-fields-list">
              ${renderFieldEditRow("Diet", "lifestyle.diet", life.diet, "e.g. Vegetarian")}
              ${renderFieldEditRow("Smoking", "lifestyle.smoking", life.smoking, "No / Yes")}
              ${renderFieldEditRow("Drinking", "lifestyle.drinking", life.drinking, "No / Socially")}
              ${renderFieldEditRow("Languages", "lifestyle.languages", life.languages, "e.g. Hindi, English")}
              ${renderFieldEditRow("Hobbies", "lifestyle.hobbies", life.hobbies)}
              ${renderFieldEditRow("Interests", "lifestyle.interests", life.interests)}
              ${renderCustomFieldsEdit("lifestyle")}
            </div>
            <button type="button" class="btn-add-section-extra-field" data-section="lifestyle">+ Add Extra Field</button>
          ` : `
            <table class="t-classic-table">
              <tbody>
                ${life.diet && !isFieldHidden("lifestyle.diet") ? `<tr><td>Diet</td><td><span class="t-lifestyle-pill">${life.diet}</span></td></tr>` : ""}
                ${life.smoking && !isFieldHidden("lifestyle.smoking") ? `<tr><td>Smoking</td><td>${life.smoking}</td></tr>` : ""}
                ${life.drinking && !isFieldHidden("lifestyle.drinking") ? `<tr><td>Drinking</td><td>${life.drinking}</td></tr>` : ""}
                ${life.languages && !isFieldHidden("lifestyle.languages") ? `<tr><td>Languages</td><td>${renderTags(life.languages, "t-chip-sm")}</td></tr>` : ""}
                ${life.hobbies && !isFieldHidden("lifestyle.hobbies") ? `<tr><td>Hobbies</td><td>${renderTags(life.hobbies, "t-chip-sm")}</td></tr>` : ""}
                ${life.interests && !isFieldHidden("lifestyle.interests") ? `<tr><td>Interests</td><td>${life.interests}</td></tr>` : ""}
                ${renderCustomFieldsView("lifestyle")}
              </tbody>
            </table>
          `}
        </div>
        `}

        <!-- Partner Preferences -->
        ${isSecHidden("preferences") && !isEditing("preferences") ? (isLive ? `
          <div class="t-classic-card t-section-hidden-notice">
            <span>🙈 <strong>Partner Preferences</strong> card is hidden</span>
            <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="preferences">👁️ Unhide</button>
          </div>
        ` : "") : `
        <div class="t-classic-card ${isEditing("preferences") ? "is-section-editing" + (isSecHidden("preferences") ? " is-section-hidden-editing" : "") : ""}">
          <h3 class="t-classic-card-title">
            <span>Partner Preferences ${isEditing("preferences") ? `<em class="t-editing-pill">Editing</em>` : ""}</span>
            <div class="t-sec-actions">
              ${isEditing("preferences") ? `
                <button type="button" class="btn-sec-hide-toggle ${isSecHidden("preferences") ? "is-hidden" : "is-visible"}" data-section="preferences">
                  ${isSecHidden("preferences") ? "🙈 Hidden" : "👁️ Visible"}
                </button>
                <button type="button" class="section-done-btn" data-section="preferences">✓ Done</button>
              ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="preferences">✎ Edit</button>` : "")}
            </div>
          </h3>

          ${isEditing("preferences") ? `
            ${isSecHidden("preferences") ? `
              <div class="section-hidden-alert-banner">
                🙈 <strong>Partner Preferences is currently HIDDEN:</strong> It will NOT appear on your final biodata or print/PDF export.
              </div>
            ` : ""}
            <div class="inline-edit-fields-list">
              ${renderFieldEditRow("Preferred Age", "preferences.preferredAge", pref.preferredAge, "e.g. 24 - 28 Years")}
              ${renderFieldEditRow("Preferred Height", "preferences.preferredHeight", pref.preferredHeight, "e.g. 5 ft 3 in - 5 ft 8 in")}
              ${renderFieldEditRow("Education", "preferences.education", pref.education)}
              ${renderFieldEditRow("Profession", "preferences.profession", pref.profession)}
              ${renderFieldEditRow("Location", "preferences.location", pref.location)}
              ${renderFieldEditRow("Expectations", "preferences.expectations", pref.expectations)}
              ${renderCustomFieldsEdit("preferences")}
            </div>
            <button type="button" class="btn-add-section-extra-field" data-section="preferences">+ Add Extra Field</button>
          ` : `
            <table class="t-classic-table">
              <tbody>
                ${pref.preferredAge && !isFieldHidden("preferences.preferredAge") ? `<tr><td>Preferred Age</td><td>${pref.preferredAge}</td></tr>` : ""}
                ${pref.preferredHeight && !isFieldHidden("preferences.preferredHeight") ? `<tr><td>Preferred Height</td><td>${pref.preferredHeight}</td></tr>` : ""}
                ${pref.education && !isFieldHidden("preferences.education") ? `<tr><td>Education</td><td>${pref.education}</td></tr>` : ""}
                ${pref.profession && !isFieldHidden("preferences.profession") ? `<tr><td>Profession</td><td>${pref.profession}</td></tr>` : ""}
                ${pref.location && !isFieldHidden("preferences.location") ? `<tr><td>Location</td><td>${pref.location}</td></tr>` : ""}
                ${renderCustomFieldsView("preferences")}
              </tbody>
            </table>
            ${pref.expectations && !isFieldHidden("preferences.expectations") ? `<div class="t-pref-exp">${pref.expectations}</div>` : ""}
          `}
        </div>
        `}
      </div>

      <!-- 7. Contact Information (Section 5.2) -->
      ${isSecHidden("contact") && !isEditing("contact") ? (isLive ? `
        <div class="t-classic-section t-section-hidden-notice">
          <span>🙈 <strong>Contact Information</strong> section is hidden</span>
          <button type="button" class="btn-sec-hide-toggle is-hidden" data-section="contact">👁️ Unhide</button>
        </div>
      ` : "") : `
      <div class="t-classic-section t-classic-contact-section ${isEditing("contact") ? "is-section-editing" + (isSecHidden("contact") ? " is-section-hidden-editing" : "") : ""}">
        <h3 class="t-classic-heading">
          <span>Contact Information ${isEditing("contact") ? `<em class="t-editing-pill">Editing</em>` : ""}</span>
          <div class="t-sec-actions">
            ${isEditing("contact") ? `
              <button type="button" class="btn-sec-hide-toggle ${isSecHidden("contact") ? "is-hidden" : "is-visible"}" data-section="contact">
                ${isSecHidden("contact") ? "🙈 Hidden" : "👁️ Visible"}
              </button>
              <button type="button" class="section-done-btn" data-section="contact">✓ Done</button>
            ` : (isLive ? `<button type="button" class="section-edit-trigger" data-section="contact">✎ Edit</button>` : "")}
          </div>
        </h3>

        ${isEditing("contact") ? `
          ${isSecHidden("contact") ? `
            <div class="section-hidden-alert-banner">
              🙈 <strong>Contact Information is currently HIDDEN:</strong> It will NOT appear on your final biodata or print/PDF export.
            </div>
          ` : ""}
          <div class="inline-edit-fields-list">
            ${renderFieldEditRow("Contact Person", "contact.contactPerson", c.contactPerson)}
            ${renderFieldEditRow("Relation", "contact.contactPersonRelation", c.contactPersonRelation, "e.g. Father")}
            ${renderFieldEditRow("Phone", "contact.phone", c.phone)}
            ${renderFieldEditRow("WhatsApp", "contact.whatsapp", c.whatsapp)}
            ${renderFieldEditRow("Email", "contact.email", c.email)}
            ${renderFieldEditRow("Residence Address", "contact.address", c.address)}
            ${renderCustomFieldsEdit("contact")}
          </div>
          <button type="button" class="btn-add-section-extra-field" data-section="contact">+ Add Extra Field</button>
        ` : `
          <div class="t-contact-grid">
            ${c.contactPerson && !isFieldHidden("contact.contactPerson") ? `
              <div class="t-contact-box">
                <span class="t-c-icon">👤</span>
                <div>
                  <div class="t-c-label">Contact Person</div>
                  <strong>${c.contactPerson} ${c.contactPersonRelation && !isFieldHidden("contact.contactPersonRelation") ? `(${c.contactPersonRelation})` : ""}</strong>
                </div>
              </div>
            ` : ""}

            ${showPhone && !isFieldHidden("contact.phone") ? `
              <div class="t-contact-box">
                <span class="t-c-icon">📞</span>
                <div>
                  <div class="t-c-label">Phone Number</div>
                  <a href="tel:${c.phone}">${c.phone}</a>
                </div>
              </div>
            ` : ""}

            ${showWhatsApp && !isFieldHidden("contact.whatsapp") ? `
              <div class="t-contact-box">
                <span class="t-c-icon">💬</span>
                <div>
                  <div class="t-c-label">WhatsApp</div>
                  <a href="https://wa.me/${c.whatsapp.replace(/[^0-9]/g, "")}" target="_blank">${c.whatsapp}</a>
                </div>
              </div>
            ` : ""}

            ${showEmail && !isFieldHidden("contact.email") ? `
              <div class="t-contact-box">
                <span class="t-c-icon">✉️</span>
                <div>
                  <div class="t-c-label">Email</div>
                  <a href="mailto:${c.email}">${c.email}</a>
                </div>
              </div>
            ` : ""}

            ${showAddress && !isFieldHidden("contact.address") ? `
              <div class="t-contact-box" style="grid-column: 1 / -1;">
                <span class="t-c-icon">🏡</span>
                <div>
                  <div class="t-c-label">Family Residence</div>
                  <div>${c.address}</div>
                </div>
              </div>
            ` : ""}
          </div>

          ${data.customFields?.contact?.length ? `
            <table class="t-classic-table" style="margin-top: 10px;">
              <tbody>${renderCustomFieldsView("contact")}</tbody>
            </table>
          ` : ""}
        `}
      </div>
      `}

      <!-- Footer blessing -->
      <div class="t-classic-footer">
        <p>With best wishes for an auspicious and blessed new chapter of life.</p>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {

  const pageWelcome = document.getElementById("page-welcome");
  const pageForm = document.getElementById("page-form");
  const pageTemplates = document.getElementById("page-templates");
  const pagePreview = document.getElementById("page-preview");

  const getStartedBtn = document.getElementById("get-started-btn");
  const resumeForm = document.getElementById("resume-form");
  const addWorkBtn = document.getElementById("add-work-exp-btn");
  const addEduBtn = document.getElementById("add-education-btn");
  const backToFormBtn = document.getElementById("back-to-form-btn");
  const selectTemplateBtns = document.querySelectorAll(".select-template-btn");
  const backToTemplatesBtn = document.getElementById("back-to-templates-btn");
  const downloadPdfBtn = document.getElementById("download-pdf-btn");

  const workContainer = document.getElementById("work-experience-container");
  const eduContainer = document.getElementById("education-container");
  const photoUpload = document.getElementById("photo-upload");
  const photoPreview = document.getElementById("photo-preview");

  let resumeData = {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    skills: [],
    work: [],
    education: [],
    photoDataUrl: ""
  };

  function showPage(page) {
    [pageWelcome, pageForm, pageTemplates, pagePreview].forEach(p => p.classList.remove("active"));
    page.classList.add("active");

    window.scrollTo({ top: 0, behavior: "instant" });
  }

  getStartedBtn.addEventListener("click", () => showPage(pageForm));

  function createWorkEntry(prefill = {}) {
    const wrapper = document.createElement("div");
    wrapper.className = "work-entry";
    wrapper.innerHTML = `
      <div class="form-grid">
        <div class="form-group">
          <label>Company</label>
          <input type="text" class="we-company" value="${escapeHtml(prefill.company || "")}">
        </div>
        <div class="form-group">
          <label>Role / Title</label>
          <input type="text" class="we-role" value="${escapeHtml(prefill.role || "")}">
        </div>
        <div class="form-group">
          <label>Start (e.g., Jan 2020)</label>
          <input type="text" class="we-start" value="${escapeHtml(prefill.start || "")}">
        </div>
        <div class="form-group">
          <label>End (e.g., Present)</label>
          <input type="text" class="we-end" value="${escapeHtml(prefill.end || "")}">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="we-desc" rows="2">${escapeHtml(prefill.description || "")}</textarea>
      </div>
      <button type="button" class="btn btn-remove-work">Remove Experience</button>
      <hr>
    `.trim();

    wrapper.querySelector(".btn-remove-work").addEventListener("click", () => {
      wrapper.remove();
    });

    return wrapper;
  }

  function createEduEntry(prefill = {}) {
    const wrapper = document.createElement("div");
    wrapper.className = "edu-entry";
    wrapper.innerHTML = `
      <div class="form-grid">
        <div class="form-group">
          <label>Institution</label>
          <input type="text" class="ed-school" value="${escapeHtml(prefill.school || "")}">
        </div>
        <div class="form-group">
          <label>Degree / Course</label>
          <input type="text" class="ed-degree" value="${escapeHtml(prefill.degree || "")}">
        </div>
        <div class="form-group">
          <label>Start</label>
          <input type="text" class="ed-start" value="${escapeHtml(prefill.start || "")}">
        </div>
        <div class="form-group">
          <label>End</label>
          <input type="text" class="ed-end" value="${escapeHtml(prefill.end || "")}">
        </div>
      </div>
      <div class="form-group">
        <label>Details</label>
        <textarea class="ed-desc" rows="2">${escapeHtml(prefill.description || "")}</textarea>
      </div>
      <button type="button" class="btn btn-remove-edu">Remove Education</button>
      <hr>
    `.trim();

    wrapper.querySelector(".btn-remove-edu").addEventListener("click", () => {
      wrapper.remove();
    });

    return wrapper;
  }

  function escapeHtml(content) {
    return String(content).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
                      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  workContainer.appendChild(createWorkEntry());
  eduContainer.appendChild(createEduEntry());

  addWorkBtn.addEventListener("click", () => {
    workContainer.appendChild(createWorkEntry());
  });

  addEduBtn.addEventListener("click", () => {
    eduContainer.appendChild(createEduEntry());
  });

  photoUpload.addEventListener("change", () => {
    const f = photoUpload.files[0];
    if (!f) {
      photoPreview.style.display = "none";
      resumeData.photoDataUrl = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.src = e.target.result;
      photoPreview.style.display = "block";
      resumeData.photoDataUrl = e.target.result;
    };
    reader.readAsDataURL(f);
  });

  resumeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    resumeData.fullName = document.getElementById("fullName").value.trim();
    resumeData.jobTitle = document.getElementById("jobTitle").value.trim();
    resumeData.email = document.getElementById("email").value.trim();
    resumeData.phone = document.getElementById("phone").value.trim();
    resumeData.address = document.getElementById("address").value.trim();
    resumeData.summary = document.getElementById("summary").value.trim();
    resumeData.skills = document.getElementById("skills").value.split(",").map(s => s.trim()).filter(Boolean);

    resumeData.work = Array.from(workContainer.querySelectorAll(".work-entry")).map(node => ({
      company: node.querySelector(".we-company").value.trim(),
      role: node.querySelector(".we-role").value.trim(),
      start: node.querySelector(".we-start").value.trim(),
      end: node.querySelector(".we-end").value.trim(),
      description: node.querySelector(".we-desc").value.trim()
    })).filter(w => w.company || w.role || w.description);

    resumeData.education = Array.from(eduContainer.querySelectorAll(".edu-entry")).map(node => ({
      school: node.querySelector(".ed-school").value.trim(),
      degree: node.querySelector(".ed-degree").value.trim(),
      start: node.querySelector(".ed-start").value.trim(),
      end: node.querySelector(".ed-end").value.trim(),
      description: node.querySelector(".ed-desc").value.trim()
    })).filter(e => e.school || e.degree || e.description);

    if (!resumeData.photoDataUrl && photoUpload.files && photoUpload.files[0]) {
      try {
        resumeData.photoDataUrl = await readFileAsDataURL(photoUpload.files[0]);
      } catch (err) {
        console.warn("Failed to read photo:", err);
      }
    }

    showPage(pageTemplates);
  });

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  selectTemplateBtns.forEach(btn => {
    btn.addEventListener("click", (ev) => {
      const templateId = ev.currentTarget.dataset.template;
      populateTemplateOutputs(templateId);
      showPage(pagePreview);

      document.querySelectorAll(".resume-template").forEach(el => el.style.display = "none");
      const chosen = document.getElementById(templateId);
      if (chosen) chosen.style.display = "block";
    });
  });

  backToFormBtn.addEventListener("click", () => showPage(pageForm));
  backToTemplatesBtn.addEventListener("click", () => showPage(pageTemplates));

  downloadPdfBtn.addEventListener("click", () => {

    const visibleTemplate = Array.from(document.querySelectorAll(".resume-template")).find(el => el.style.display !== "none");
    if (!visibleTemplate) {
      alert("No template visible to download.");
      return;
    }

    const opt = {
      margin:       0.2,
      filename:     `${(resumeData.fullName || "resume").replace(/\s+/g,"_")}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(visibleTemplate).save();
  });

  function populateTemplateOutputs(templateId) {

    setText(`#${templateId} #${templateId.replace("template-","tpl")}-name-output`, resumeData.fullName);
    setText(`#${templateId} #${templateId.replace("template-","tpl")}-jobtitle-output`, resumeData.jobTitle);

    setText(`#${templateId} #${templateId.replace("template-","tpl")}-phone-output`, resumeData.phone);
    setText(`#${templateId} #${templateId.replace("template-","tpl")}-email-output`, resumeData.email);
    setText(`#${templateId} #${templateId.replace("template-","tpl")}-address-output`, resumeData.address);

    setText(`#${templateId} #${templateId.replace("template-","tpl")}-summary-output`, resumeData.summary);

    const skillsListEl = document.querySelector(`#${templateId} #${templateId.replace("template-","tpl")}-skills-output`);
    if (skillsListEl) {
      skillsListEl.innerHTML = "";
      resumeData.skills.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        skillsListEl.appendChild(li);
      });
    }

    const workOut = document.querySelector(`#${templateId} #${templateId.replace("template-","tpl")}-work-output`);
    if (workOut) {
      workOut.innerHTML = "";
      if (resumeData.work.length === 0) {
        workOut.innerHTML = `<p>No work experience provided.</p>`;
      } else {
        resumeData.work.forEach(w => {
          const node = document.createElement("div");
          node.className = "out-work-item";
          node.innerHTML = `<strong>${escapeHtml(w.role || "")}${w.role && w.company ? " — " : ""}${escapeHtml(w.company || "")}</strong>
                            <div class="we-dates">${escapeHtml(w.start || "")}${w.start && w.end ? " — " : ""}${escapeHtml(w.end || "")}</div>
                            <p>${escapeHtml(w.description || "")}</p>`;
          workOut.appendChild(node);
        });
      }
    }

    const eduOut = document.querySelector(`#${templateId} #${templateId.replace("template-","tpl")}-edu-output`);
    if (eduOut) {
      eduOut.innerHTML = "";
      if (resumeData.education.length === 0) {
        eduOut.innerHTML = `<p>No education provided.</p>`;
      } else {
        resumeData.education.forEach(e => {
          const node = document.createElement("div");
          node.className = "out-edu-item";
          node.innerHTML = `<strong>${escapeHtml(e.degree || "")}${e.degree && e.school ? " — " : ""}${escapeHtml(e.school || "")}</strong>
                            <div class="ed-dates">${escapeHtml(e.start || "")}${e.start && e.end ? " — " : ""}${escapeHtml(e.end || "")}</div>
                            <p>${escapeHtml(e.description || "")}</p>`;
          eduOut.appendChild(node);
        });
      }
    }

    const photoIds = ["tpl1-photo-output","tpl2-photo-output","tpl3-photo-output"];
    photoIds.forEach(pid => {

      const img = document.querySelector(`#${templateId} #${pid}`);
      if (img) {
        if (resumeData.photoDataUrl) {
          img.src = resumeData.photoDataUrl;
        } else {
          img.removeAttribute("src");

        }
      }
    });

    function setText(selector, text) {
      const el = document.querySelector(selector);
      if (el) el.textContent = text || "";
    }
  }

  document.querySelectorAll(".resume-template").forEach((el, idx) => {

    el.style.display = "none";
  });

});
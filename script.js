/**
 * CHRISTABEL SUSU HUB — ONLINE SUSU REGISTRATION SYSTEM
 * Pure Vanilla JavaScript Client-Side Validation, jsPDF Generator & WhatsApp Integration
 */

(function () {
  "use strict";

  // Business Configuration
  const CONFIG = {
    businessName: "Christabel Susu Hub",
    businessPhone: "0547909190",
    businessWhatsApp: "233547909190",
    contributionAmount: "GH₵105",
    contributionDuration: "1 Week (7 Days)",
    paymentDeadline: "6:30 p.m. daily",
    latePenalty: "GH₵50 upon 2nd delay",
    defaultFrequency: "Daily Contribution (GH₵105 daily for 1 week)"
  };

  // DOM Elements
  const form = document.getElementById("susuRegistrationForm");
  const submitBtn = document.getElementById("submitFormBtn");
  const samePhoneCheckbox = document.getElementById("sameAsPrimaryPhone");
  const primaryPhoneInput = document.getElementById("primaryPhone");
  const whatsappInput = document.getElementById("whatsappNumber");
  const fullNameInput = document.getElementById("fullName");
  const typedNameInput = document.getElementById("typedNameConfirmation");
  const regDateInput = document.getElementById("registrationDate");
  const startDateInput = document.getElementById("startDate");
  const toastElement = document.getElementById("toastNotification");

  // Preview Modal Elements
  const previewModal = document.getElementById("previewModal");
  const closePreviewModalBtn = document.getElementById("closePreviewModalBtn");
  const cancelPreviewBtn = document.getElementById("cancelPreviewBtn");
  const confirmWhatsAppBtn = document.getElementById("confirmWhatsAppBtn");

  // Summary labels in Preview Modal
  const summaryFullName = document.getElementById("summaryFullName");
  const summaryPhone = document.getElementById("summaryPhone");
  const summaryWhatsApp = document.getElementById("summaryWhatsApp");
  const summaryContribution = document.getElementById("summaryContribution");
  const summaryFrequency = document.getElementById("summaryFrequency");
  const summaryStartDate = document.getElementById("summaryStartDate");
  const summaryMethod = document.getElementById("summaryMethod");

  // Post-submission Guidance Modal Elements
  const instructionsModal = document.getElementById("instructionsModal");
  const closeInstructionsBtn = document.getElementById("closeInstructionsBtn");
  const dismissInstructionBtn = document.getElementById("dismissInstructionBtn");
  const reopenWhatsAppBtn = document.getElementById("reopenWhatsAppBtn");
  const copyMessageBtn = document.getElementById("copyMessageBtn");
  const copyBtnText = document.getElementById("copyBtnText");
  const preparedMessageDisplay = document.getElementById("preparedMessageDisplay");
  const downloadPdfAgainBtn = document.getElementById("downloadPdfAgainBtn");
  const sharePdfDirectBtn = document.getElementById("sharePdfDirectBtn");
  const pdfFilenameDisplay = document.getElementById("pdfFilenameDisplay");

  // Dynamic Year in Footer
  const currentYearSpan = document.getElementById("currentYear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Pre-fill Today's Date for Registration Date
  const todayISO = new Date().toISOString().split("T")[0];
  if (regDateInput) {
    regDateInput.value = todayISO;
  }

  // Set min date for Preferred Start Date to today
  if (startDateInput) {
    startDateInput.setAttribute("min", todayISO);
    startDateInput.value = todayISO;
  }

  // State to hold compiled data and generated PDF
  let activeCompiledMessage = "";
  let activeWhatsAppUrl = "";
  let activePdfDoc = null;
  let activePdfFilename = "Christabel_Susu_Registration.pdf";
  let activePdfBlob = null;

  /**
   * Phone Number Validator for Ghanaian Phone Numbers
   * Accepts:
   *  - 10-digit standard: 0547909190, 0552211362, 0244123456
   *  - 9-digit: 547909190
   *  - International: +233547909190, 233547909190
   */
  function isValidGhanaPhone(phoneStr) {
    if (!phoneStr) return false;
    const cleaned = phoneStr.replace(/[\s\-()]/g, "");
    const ghanaPhoneRegex = /^(?:(?:\+?233)|0)?([235][0-9]{8})$/;
    return ghanaPhoneRegex.test(cleaned);
  }

  /**
   * Normalize phone number to standard local 10-digit format for display
   */
  function normalizeGhanaPhone(phoneStr) {
    if (!phoneStr) return "";
    let cleaned = phoneStr.replace(/[\s\-()]/g, "");
    if (cleaned.startsWith("+233")) {
      return "0" + cleaned.slice(4);
    } else if (cleaned.startsWith("233")) {
      return "0" + cleaned.slice(3);
    } else if (cleaned.length === 9) {
      return "0" + cleaned;
    }
    return cleaned;
  }

  function setFieldError(fieldId, errorMsg) {
    const field = document.getElementById(fieldId);
    const errorContainer = document.getElementById(fieldId + "Error");
    if (field) {
      field.classList.add("is-invalid");
      field.classList.remove("is-valid");
      field.setAttribute("aria-invalid", "true");
    }
    if (errorContainer) {
      errorContainer.textContent = errorMsg;
    }
  }

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorContainer = document.getElementById(fieldId + "Error");
    if (field) {
      field.classList.remove("is-invalid");
      field.classList.add("is-valid");
      field.removeAttribute("aria-invalid");
    }
    if (errorContainer) {
      errorContainer.textContent = "";
    }
  }

  // Sync WhatsApp input with primary telephone when checkbox checked
  if (samePhoneCheckbox) {
    samePhoneCheckbox.addEventListener("change", function () {
      if (this.checked) {
        whatsappInput.value = primaryPhoneInput.value;
        if (primaryPhoneInput.value.trim() !== "") {
          clearFieldError("whatsappNumber");
        }
      }
    });

    primaryPhoneInput.addEventListener("input", function () {
      if (samePhoneCheckbox.checked) {
        whatsappInput.value = this.value;
      }
    });
  }

  // Toast notification helper
  let toastTimer = null;
  function showToast(message) {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastElement.classList.remove("show");
    }, 3500);
  }

  /**
   * Comprehensive Form Validation
   */
  function validateForm() {
    let isValid = true;
    let firstErrorElement = null;

    // 1. Full Legal Name
    const fullNameVal = fullNameInput.value.trim();
    if (!fullNameVal) {
      setFieldError("fullName", "Please enter your full legal name.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = fullNameInput;
    } else if (fullNameVal.length < 3) {
      setFieldError("fullName", "Full name must be at least 3 characters long.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = fullNameInput;
    } else {
      clearFieldError("fullName");
    }

    // 2. Residential Address
    const addressInput = document.getElementById("residentialAddress");
    if (!addressInput.value.trim()) {
      setFieldError("residentialAddress", "Residential address is required for Susu records.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = addressInput;
    } else {
      clearFieldError("residentialAddress");
    }

    // 3. Digital Address (Optional format check if provided)
    const digitalAddressInput = document.getElementById("digitalAddress");
    if (digitalAddressInput && digitalAddressInput.value.trim()) {
      const digVal = digitalAddressInput.value.trim().toUpperCase();
      const digRegex = /^[A-Z]{2}-\d{3,4}-\d{4}$/;
      if (!digRegex.test(digVal)) {
        setFieldError("digitalAddress", "Invalid GhanaPost GPS format (e.g. GA-183-9024).");
        isValid = false;
        if (!firstErrorElement) firstErrorElement = digitalAddressInput;
      } else {
        clearFieldError("digitalAddress");
      }
    } else if (digitalAddressInput) {
      clearFieldError("digitalAddress");
    }

    // 4. Primary Phone Number
    const primaryPhoneVal = primaryPhoneInput.value.trim();
    if (!primaryPhoneVal) {
      setFieldError("primaryPhone", "Primary phone number is required.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = primaryPhoneInput;
    } else if (!isValidGhanaPhone(primaryPhoneVal)) {
      setFieldError("primaryPhone", "Enter a valid 10-digit Ghanaian number (e.g. 054 790 9190).");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = primaryPhoneInput;
    } else {
      clearFieldError("primaryPhone");
    }

    // 5. WhatsApp Number
    const whatsappVal = whatsappInput.value.trim();
    if (!whatsappVal) {
      setFieldError("whatsappNumber", "Active WhatsApp number is required.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = whatsappInput;
    } else if (!isValidGhanaPhone(whatsappVal)) {
      setFieldError("whatsappNumber", "Enter a valid Ghanaian WhatsApp number (e.g. 054 790 9190).");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = whatsappInput;
    } else {
      clearFieldError("whatsappNumber");
    }

    // 6. Preferred Start Date
    if (!startDateInput.value) {
      setFieldError("startDate", "Please select your preferred start date.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = startDateInput;
    } else {
      clearFieldError("startDate");
    }

    // 7. Payment Method
    const paymentMethodInput = document.getElementById("paymentMethod");
    if (!paymentMethodInput.value) {
      setFieldError("paymentMethod", "Please select a payment method.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = paymentMethodInput;
    } else {
      clearFieldError("paymentMethod");
    }

    // 8. Collection Method
    const collectionMethodInput = document.getElementById("collectionMethod");
    if (!collectionMethodInput.value) {
      setFieldError("collectionMethod", "Please choose how you wish to remit or collect funds.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = collectionMethodInput;
    } else {
      clearFieldError("collectionMethod");
    }

    // 9. Collection Location
    const locationInput = document.getElementById("collectionLocation");
    if (!locationInput.value.trim()) {
      setFieldError("collectionLocation", "Please specify a preferred collection landmark or location.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = locationInput;
    } else {
      clearFieldError("collectionLocation");
    }

    // 10. Next of Kin Name
    const nokNameInput = document.getElementById("nextOfKinName");
    if (!nokNameInput.value.trim()) {
      setFieldError("nextOfKinName", "Next of kin name is required for account records.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = nokNameInput;
    } else {
      clearFieldError("nextOfKinName");
    }

    // 11. Next of Kin Phone
    const nokPhoneInput = document.getElementById("nextOfKinPhone");
    if (!nokPhoneInput.value.trim()) {
      setFieldError("nextOfKinPhone", "Next of kin telephone number is required.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = nokPhoneInput;
    } else if (!isValidGhanaPhone(nokPhoneInput.value.trim())) {
      setFieldError("nextOfKinPhone", "Enter a valid Ghanaian phone number for next of kin.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = nokPhoneInput;
    } else {
      clearFieldError("nextOfKinPhone");
    }

    // 12. Next of Kin Relationship
    const nokRelInput = document.getElementById("nextOfKinRelationship");
    if (!nokRelInput.value) {
      setFieldError("nextOfKinRelationship", "Please select the relationship to your next of kin.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = nokRelInput;
    } else {
      clearFieldError("nextOfKinRelationship");
    }

    // 13. Terms & Conditions Acceptance Checkbox
    const acceptTermsInput = document.getElementById("acceptTermsCheckbox");
    if (!acceptTermsInput.checked) {
      setFieldError("acceptTerms", "You must read and accept the Susu Terms & Conditions to proceed.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = acceptTermsInput;
    } else {
      clearFieldError("acceptTerms");
    }

    // 14. Declaration Checkbox
    const declarationInput = document.getElementById("declarationCheckbox");
    if (!declarationInput.checked) {
      setFieldError("declarationCheckbox", "You must confirm the accuracy of your submitted details.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = declarationInput;
    } else {
      clearFieldError("declarationCheckbox");
    }

    // 15. Typed Full Name Confirmation
    const typedNameVal = typedNameInput.value.trim();
    if (!typedNameVal) {
      setFieldError("typedNameConfirmation", "Please type your full name as an electronic signature.");
      isValid = false;
      if (!firstErrorElement) firstErrorElement = typedNameInput;
    } else if (
      fullNameVal &&
      typedNameVal.toLowerCase() !== fullNameVal.toLowerCase()
    ) {
      setFieldError(
        "typedNameConfirmation",
        `Signature name must match "${fullNameVal}" exactly.`
      );
      isValid = false;
      if (!firstErrorElement) firstErrorElement = typedNameInput;
    } else {
      clearFieldError("typedNameConfirmation");
    }

    if (!isValid && firstErrorElement) {
      firstErrorElement.focus();
      firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return isValid;
  }

  // Real-time validation listeners
  const monitoredInputs = [
    "fullName",
    "primaryPhone",
    "whatsappNumber",
    "residentialAddress",
    "startDate",
    "paymentMethod",
    "collectionMethod",
    "collectionLocation",
    "nextOfKinName",
    "nextOfKinPhone",
    "nextOfKinRelationship",
    "typedNameConfirmation"
  ];

  monitoredInputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("blur", () => {
        if (el.value.trim() !== "") {
          validateSingleField(id);
        }
      });
      el.addEventListener("input", () => {
        if (el.classList.contains("is-invalid")) {
          validateSingleField(id);
        }
      });
    }
  });

  function validateSingleField(id) {
    const el = document.getElementById(id);
    if (!el) return;

    if (id === "fullName") {
      if (el.value.trim().length >= 3) clearFieldError(id);
    } else if (id === "primaryPhone" || id === "whatsappNumber" || id === "nextOfKinPhone") {
      if (isValidGhanaPhone(el.value.trim())) clearFieldError(id);
    } else if (id === "typedNameConfirmation") {
      if (el.value.trim().toLowerCase() === fullNameInput.value.trim().toLowerCase()) {
        clearFieldError(id);
      }
    } else {
      if (el.value.trim() !== "") clearFieldError(id);
    }
  }

  /**
   * Generate Clean Text Summary for WhatsApp
   */
  function generateWhatsAppTextSummary(regId) {
    const fullName = fullNameInput.value.trim();
    const phone = normalizeGhanaPhone(primaryPhoneInput.value.trim());
    const whatsapp = normalizeGhanaPhone(whatsappInput.value.trim());
    const contributionFrequency = document.getElementById("contributionFrequency").value;
    const startDate = startDateInput.value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const collectionMethod = document.getElementById("collectionMethod").value;
    const collectionLocation = document.getElementById("collectionLocation").value.trim();
    const payoutSlot = document.getElementById("payoutSlot").value.trim() || "Awaiting Admin Allocation";
    const typedName = typedNameInput.value.trim();
    const registrationDate = regDateInput.value;

    return `NEW SUSU REGISTRATION (PDF ATTACHED)
CHRISTABEL SUSU HUB
Reference: ${regId}

Hello Christabel Susu Hub, I have completed my registration for the 1-Week Susu Scheme. My official signed PDF registration document is attached below.

REGISTRATION SUMMARY
- Applicant: ${fullName}
- Primary Phone: ${phone}
- WhatsApp: ${whatsapp}
- Scheme Rate: GH₵105
- Duration: 1 Week (7 Days)
- Frequency: ${contributionFrequency}
- Preferred Start Date: ${startDate}
- Payment Method: ${paymentMethod}
- Collection Location: ${collectionLocation}
- Payout Slot: ${payoutSlot}
- Terms Accepted: Yes (Rules 1-6)
- Signed by: ${typedName}
- Date: ${registrationDate}

Please confirm receipt of my PDF and assign my official payout slot. Thank you!`;
  }

  /**
   * Generate High-Quality Branded PDF Registration Slip using jsPDF
   */
  function generateRegistrationPDF(regId) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      console.warn("jsPDF library not loaded. Using fallback.");
      return null;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const fullName = fullNameInput.value.trim();
    const dob = document.getElementById("dateOfBirth").value || "Not provided";
    const gender = document.getElementById("gender").value || "Not specified";
    const occupation = document.getElementById("occupation").value.trim() || "Not specified";
    const address = document.getElementById("residentialAddress").value.trim();
    const digitalAddress = document.getElementById("digitalAddress").value.trim() || "Not provided";

    const phone = normalizeGhanaPhone(primaryPhoneInput.value.trim());
    const whatsapp = normalizeGhanaPhone(whatsappInput.value.trim());
    const altPhone = document.getElementById("alternativePhone").value.trim() || "None";
    const nextOfKin = document.getElementById("nextOfKinName").value.trim();
    const nextOfKinPhone = normalizeGhanaPhone(document.getElementById("nextOfKinPhone").value.trim());
    const relationship = document.getElementById("nextOfKinRelationship").value;

    const contributionFrequency = document.getElementById("contributionFrequency").value;
    const startDate = startDateInput.value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const collectionMethod = document.getElementById("collectionMethod").value;
    const collectionLocation = document.getElementById("collectionLocation").value.trim();
    const payoutSlot = document.getElementById("payoutSlot").value.trim() || "Awaiting Allocation";
    const additionalNotes = document.getElementById("additionalNotes").value.trim() || "None";

    const typedName = typedNameInput.value.trim();
    const registrationDate = regDateInput.value;

    // --- 1. HEADER BANNER (Emerald Green #064E3B) ---
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 32, "F");

    // Gold decorative accent line (#F59E0B)
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 32, 210, 2, "F");

    // Brand Title
    doc.setTextColor(254, 243, 199);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CHRISTABEL SUSU HUB", 14, 13);

    // Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("OFFICIAL SUSU CONTRIBUTION REGISTRATION FORM — 1 WEEK SCHEME", 14, 20);
    doc.text("WhatsApp / Telephone: +233 54 790 9190 (0547909190) | Cut-off: 6:30 p.m. Daily", 14, 26);

    // Reference Pill (Top Right)
    doc.setFillColor(4, 120, 87);
    doc.roundedRect(145, 8, 53, 16, 2, 2, "F");
    doc.setTextColor(254, 243, 199);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("REGISTRATION REF:", 148, 14);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(regId, 148, 20);

    let y = 42;

    // Helper function to draw section title
    function drawSectionHeader(title, sectionLetter) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, "F");
      doc.setFillColor(6, 78, 59);
      doc.circle(18, y + 3.5, 2.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(sectionLetter, 17.2, y + 4.5);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(title, 23, y + 4.8);
      y += 10;
    }

    // Helper function to draw key-value pair
    function drawField(label, value, xOffset, width) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(label.toUpperCase(), xOffset, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const safeVal = String(value || "-");
      doc.text(safeVal, xOffset, y + 4.5);
    }

    // --- SECTION A: PERSONAL INFORMATION ---
    drawSectionHeader("SECTION A: PERSONAL INFORMATION", "A");
    drawField("Full Legal Name", fullName, 14, 90);
    drawField("Date of Birth", dob, 105, 45);
    drawField("Gender", gender, 155, 40);
    y += 10;

    drawField("Occupation", occupation, 14, 90);
    drawField("Residential Address", address, 105, 90);
    y += 10;

    drawField("GhanaPost Digital Address", digitalAddress, 14, 180);
    y += 10;

    // --- SECTION B: CONTACT INFORMATION ---
    drawSectionHeader("SECTION B: CONTACT INFORMATION", "B");
    drawField("Primary Phone Number", phone, 14, 60);
    drawField("Active WhatsApp Number", whatsapp, 78, 60);
    drawField("Alternative Telephone", altPhone, 142, 54);
    y += 10;

    // --- SECTION C: CONTRIBUTION PARAMETERS (1 WEEK SCHEME) ---
    drawSectionHeader("SECTION C: 1-WEEK SUSU CONTRIBUTION PLAN", "C");
    
    // Highlight Plan Box
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, y, 182, 12, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14);
    doc.text("Contribution: GH₵105", 18, y + 5);
    doc.text("Cycle Duration: 1 Week (7 Days)", 75, y + 5);
    doc.text("Daily Cut-Off: 6:30 p.m.", 145, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`Frequency: ${contributionFrequency}`, 18, y + 9.5);
    y += 16;

    drawField("Preferred Start Date", startDate, 14, 60);
    drawField("Payment Method", paymentMethod, 78, 60);
    drawField("Collection Method", collectionMethod, 142, 54);
    y += 10;

    drawField("Collection Landmark / Location", collectionLocation, 14, 90);
    drawField("Assigned Payout Slot", payoutSlot, 105, 45);
    drawField("Special Instructions", additionalNotes, 155, 40);
    y += 10;

    // --- SECTION D: NEXT OF KIN ---
    drawSectionHeader("SECTION D: NEXT OF KIN DETAILS", "D");
    drawField("Next of Kin Full Name", nextOfKin, 14, 60);
    drawField("Next of Kin Telephone", nextOfKinPhone, 78, 60);
    drawField("Relationship to Member", relationship, 142, 54);
    y += 10;

    // --- SECTION E: TERMS & CONDITIONS DECLARATION ---
    drawSectionHeader("SECTION E: TERMS ACCEPTANCE & ELECTRONIC SIGNATURE", "E");

    // Terms summary box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, 182, 27, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text("1. Daily payment deadline: 6:30 p.m. daily.", 17, y + 4.2);
    doc.text("2. Delay penalty: GH₵50 mandatory penalty applies upon the 2nd qualifying delay.", 17, y + 8.0);
    doc.text("3. Slot reassignment: Repeated delays (3rd delay) entitle administrator to reassign payout queue position.", 17, y + 11.8);
    doc.text("4. Administrator share: The administrator is entitled to a share on each beneficiary payout.", 17, y + 15.6);
    doc.text("5. Early exit: Member may request opt-out subject to agreed administrative deduction and audit refund.", 17, y + 19.4);
    doc.text("6. Member acceptance: Customer verifies all submitted information and accepts all 1-week scheme rules.", 17, y + 23.2);
    y += 30;

    // Electronic Signature Box
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, y, 182, 17, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(6, 95, 70);
    doc.text("ELECTRONIC SIGNATURE CONFIRMATION", 18, y + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(4, 120, 87);
    doc.text(`Signed by: ${typedName}`, 18, y + 11.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Date Signed: ${registrationDate}`, 120, y + 11.5);
    doc.text("Status: VERIFIED & SUBMITTED", 158, y + 11.5);
    y += 22;

    // Footer note
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "italic");
    doc.text("Christabel Susu Hub &bull; 0547909190 &bull; Submit this downloaded document to our WhatsApp for slot verification.", 105, 288, { align: "center" });

    return doc;
  }

  /**
   * Open Preview Modal
   */
  function openPreviewModal() {
    summaryFullName.textContent = fullNameInput.value.trim();
    summaryPhone.textContent = normalizeGhanaPhone(primaryPhoneInput.value.trim());
    summaryWhatsApp.textContent = normalizeGhanaPhone(whatsappInput.value.trim());
    summaryFrequency.textContent = document.getElementById("contributionFrequency").value;
    summaryStartDate.textContent = startDateInput.value;
    summaryMethod.textContent = `${document.getElementById("paymentMethod").value} / ${document.getElementById("collectionMethod").value}`;

    previewModal.classList.add("active");
    previewModal.setAttribute("aria-hidden", "false");
    confirmWhatsAppBtn.focus();
  }

  function closePreviewModal() {
    previewModal.classList.remove("active");
    previewModal.setAttribute("aria-hidden", "true");
  }

  /**
   * Open Post-Submission Guidance Modal
   */
  function openInstructionsModal() {
    preparedMessageDisplay.textContent = activeCompiledMessage;
    reopenWhatsAppBtn.href = activeWhatsAppUrl;
    pdfFilenameDisplay.textContent = activePdfFilename;

    // Check if Web Share API with files is supported
    if (
      navigator.canShare &&
      activePdfBlob &&
      navigator.canShare({
        files: [new File([activePdfBlob], activePdfFilename, { type: "application/pdf" })]
      })
    ) {
      sharePdfDirectBtn.style.display = "inline-flex";
    } else {
      sharePdfDirectBtn.style.display = "none";
    }

    instructionsModal.classList.add("active");
    instructionsModal.setAttribute("aria-hidden", "false");
    downloadPdfAgainBtn.focus();
  }

  function closeInstructionsModal() {
    instructionsModal.classList.remove("active");
    instructionsModal.setAttribute("aria-hidden", "true");
  }

  // Modal Close Listeners
  if (closePreviewModalBtn) closePreviewModalBtn.addEventListener("click", closePreviewModal);
  if (cancelPreviewBtn) cancelPreviewBtn.addEventListener("click", closePreviewModal);
  if (closeInstructionsBtn) closeInstructionsBtn.addEventListener("click", closeInstructionsModal);
  if (dismissInstructionBtn) dismissInstructionBtn.addEventListener("click", closeInstructionsModal);

  window.addEventListener("click", (e) => {
    if (e.target === previewModal) closePreviewModal();
    if (e.target === instructionsModal) closeInstructionsModal();
  });

  // Handle Form Submit: Validate, Generate PDF & Submit STRAIGHT to WhatsApp
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Indicate submission in progress on button
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="btn-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; margin-right: 8px;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      <span>Submitting straight to WhatsApp...</span>
    `;

    const applicantCleanName = fullNameInput.value
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "_");
    activePdfFilename = `Christabel_Susu_Registration_${applicantCleanName}.pdf`;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const regId = `CSH-${randomSuffix}`;

    // 1. Build text message for WhatsApp
    activeCompiledMessage = generateWhatsAppTextSummary(regId);
    const encoded = encodeURIComponent(activeCompiledMessage);
    activeWhatsAppUrl = `https://wa.me/${CONFIG.businessWhatsApp}?text=${encoded}`;

    // 2. Generate PDF & Save/Download to user's device
    try {
      activePdfDoc = generateRegistrationPDF(regId);
      if (activePdfDoc) {
        activePdfDoc.save(activePdfFilename);
        activePdfBlob = activePdfDoc.output("blob");
      }
    } catch (err) {
      console.error("PDF generation error:", err);
    }

    // 3. SUBMIT STRAIGHT TO WHATSAPP!
    // Opens the WhatsApp app directly without intermediate modal popups
    setTimeout(() => {
      window.location.href = activeWhatsAppUrl;
    }, 150);

    // 4. In case the user stays on the page, show the instruction card with download/reopen options
    setTimeout(() => {
      openInstructionsModal();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }, 800);
  });

  /**
   * Confirm, Generate PDF, Trigger Direct Share / Download & Launch WhatsApp
   */
  confirmWhatsAppBtn.addEventListener("click", async function () {
    confirmWhatsAppBtn.disabled = true;
    confirmWhatsAppBtn.textContent = "Generating PDF...";

    const applicantCleanName = fullNameInput.value
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "_");
    activePdfFilename = `Christabel_Susu_Registration_${applicantCleanName}.pdf`;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const regId = `CSH-${randomSuffix}`;

    // 1. Build text message for WhatsApp
    activeCompiledMessage = generateWhatsAppTextSummary(regId);
    const encoded = encodeURIComponent(activeCompiledMessage);
    activeWhatsAppUrl = `https://wa.me/${CONFIG.businessWhatsApp}?text=${encoded}`;

    // 2. Generate PDF
    try {
      activePdfDoc = generateRegistrationPDF(regId);
      if (activePdfDoc) {
        activePdfBlob = activePdfDoc.output("blob");
      }
    } catch (err) {
      console.error("PDF generation error:", err);
      showToast("PDF generated with fallback. Proceeding to WhatsApp.");
    }

    closePreviewModal();

    let sharedDirectly = false;
    const pdfFile = activePdfBlob
      ? new File([activePdfBlob], activePdfFilename, { type: "application/pdf" })
      : null;

    // 3. If on mobile with native file-sharing support (e.g. Android/iOS Chrome/Safari),
    // trigger native share directly so the PDF file is sent straight to WhatsApp!
    if (pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: "Christabel Susu Hub Registration",
          text: activeCompiledMessage
        });
        sharedDirectly = true;
        showToast("PDF shared directly to admin WhatsApp!");
      } catch (shareErr) {
        console.log("Native share not completed or cancelled:", shareErr);
      }
    }

    // 4. Fallback for desktop or if native share wasn't completed:
    // Automatically download the PDF to their device and open WhatsApp
    if (!sharedDirectly) {
      if (activePdfDoc) {
        activePdfDoc.save(activePdfFilename);
      }
      window.open(activeWhatsAppUrl, "_blank");
    }

    // 5. Open guidance modal for easy reference and re-download
    setTimeout(() => {
      openInstructionsModal();
      confirmWhatsAppBtn.disabled = false;
      confirmWhatsAppBtn.innerHTML = `<span>Send PDF to Admin</span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.58 20.15 9.14 19.76 7.87 19.01L7.57 18.83L4.45 19.65L5.28 16.61L5.08 16.3C4.26 14.99 3.82 13.47 3.82 11.91C3.82 7.38 7.51 3.69 12.05 3.69C14.25 3.69 16.31 4.55 17.86 6.11C19.42 7.66 20.27 9.72 20.27 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.57 14.34C16.32 14.21 15.1 13.61 14.88 13.53C14.65 13.44 14.49 13.4 14.32 13.65C14.16 13.9 13.69 14.45 13.55 14.61C13.41 14.77 13.27 14.79 13.02 14.67C12.77 14.54 11.97 14.28 11.02 13.43C10.28 12.77 9.78 11.95 9.64 11.71C9.49 11.46 9.62 11.33 9.75 11.2C9.86 10.09 10 10.92 10.12 10.78C10.24 10.64 10.28 10.53 10.36 10.37C10.44 10.2 10.4 10.06 10.34 9.93C10.28 9.81 9.79 8.6 9.58 8.1C9.38 7.61 9.18 7.68 9.02 7.67H8.53C8.37 7.67 8.1 7.73 7.87 7.98C7.65 8.23 7.01 8.82 7.01 10.04C7.01 11.25 7.9 12.42 8.02 12.58C8.14 12.74 9.77 15.24 12.24 16.31C12.83 16.57 13.29 16.72 13.64 16.84C14.23 17.02 14.77 17 15.2 16.93C15.68 16.86 16.68 16.32 16.88 15.74C17.09 15.17 17.09 14.68 17.03 14.58C16.97 14.47 16.82 14.41 16.57 14.34Z"/>
        </svg>`;
    }, 400);
  });

  /**
   * "Download PDF Again" button listener
   */
  if (downloadPdfAgainBtn) {
    downloadPdfAgainBtn.addEventListener("click", function () {
      if (activePdfDoc) {
        activePdfDoc.save(activePdfFilename);
        showToast("PDF downloaded again successfully.");
      } else {
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        activePdfDoc = generateRegistrationPDF(`CSH-${randomSuffix}`);
        if (activePdfDoc) {
          activePdfDoc.save(activePdfFilename);
          showToast("PDF downloaded successfully.");
        }
      }
    });
  }

  /**
   * Native Share PDF Directly (on supported mobile devices)
   */
  if (sharePdfDirectBtn) {
    sharePdfDirectBtn.addEventListener("click", async function () {
      if (!activePdfBlob) return;
      try {
        const pdfFile = new File([activePdfBlob], activePdfFilename, { type: "application/pdf" });
        await navigator.share({
          files: [pdfFile],
          title: "Christabel Susu Hub Registration",
          text: activeCompiledMessage
        });
        showToast("PDF shared successfully!");
      } catch (err) {
        console.log("Direct share cancelled or not allowed:", err);
      }
    });
  }

  /**
   * Copy Text fallback button
   */
  copyMessageBtn.addEventListener("click", function () {
    if (!activeCompiledMessage) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(activeCompiledMessage)
        .then(() => {
          copyBtnText.textContent = "Copied!";
          showToast("Registration message copied to clipboard.");
          setTimeout(() => { copyBtnText.textContent = "Copy Text"; }, 2500);
        })
        .catch(() => {
          fallbackClipboardCopy(activeCompiledMessage);
        });
    } else {
      fallbackClipboardCopy(activeCompiledMessage);
    }
  });

  function fallbackClipboardCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      copyBtnText.textContent = "Copied!";
      showToast("Registration message copied to clipboard.");
      setTimeout(() => { copyBtnText.textContent = "Copy Text"; }, 2500);
    } catch (err) {
      showToast("Please copy the message manually from the box.");
    }
    document.body.removeChild(textarea);
  }

})();

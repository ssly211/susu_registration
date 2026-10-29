/**
 * CHRISTABEL SUSU HUB — ONLINE SUSU REGISTRATION SYSTEM
 * Pure Vanilla JavaScript Client-Side Validation & WhatsApp Submission Engine
 */

(function () {
  "use strict";

  // Business Configuration
  const CONFIG = {
    businessName: "Christabel Susu Hub",
    businessPhone: "0547909190",
    businessWhatsApp: "233547909190",
    contributionAmount: "GH₵105",
    contributionDuration: "Two Weeks",
    paymentDeadline: "6:30 p.m. daily",
    latePenalty: "GH₵50 upon 2nd delay",
    defaultFrequency: "Daily Contribution (GH₵105 daily)"
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

  // State to hold compiled message
  let activeCompiledMessage = "";
  let activeWhatsAppUrl = "";

  /**
   * Phone Number Validator for Ghanaian Phone Numbers
   * Accepts:
   *  - 10-digit standard: 0244123456, 0552211362, 0201234567
   *  - 9-digit without leading 0: 552211362, 244123456
   *  - International: +233552211362, 233552211362
   * Standard prefixes: 020, 050, 024, 054, 055, 059, 053, 027, 057, 026, 056, 028
   */
  function isValidGhanaPhone(phoneStr) {
    if (!phoneStr) return false;
    const cleaned = phoneStr.replace(/[\s\-()]/g, "");
    
    // Pattern matches:
    // 0 followed by (20|50|24|54|55|59|53|27|57|26|56|28) and 7 digits
    // OR 233 or +233 followed by (20|50|24|54|55|59|53|27|57|26|56|28) and 7 digits
    // OR 9 digits starting with (20|50|24|54|55|59|53|27|57|26|56|28)
    const ghanaPhoneRegex = /^(?:(?:\+?233)|0)?([235][0-9]{8})$/;
    return ghanaPhoneRegex.test(cleaned);
  }

  /**
   * Format phone number to clean display / WhatsApp international format
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

  /**
   * Show inline error message
   */
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

  /**
   * Clear inline error message
   */
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

  /**
   * Sync WhatsApp input with primary telephone when checkbox checked
   */
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

  /**
   * Toast notification helper
   */
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
      setFieldError("primaryPhone", "Enter a valid 10-digit Ghanaian number (e.g. 055 221 1362).");
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
      setFieldError("whatsappNumber", "Enter a valid Ghanaian WhatsApp number (e.g. 055 221 1362).");
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

    // If invalid, smooth scroll to first error
    if (!isValid && firstErrorElement) {
      firstErrorElement.focus();
      firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return isValid;
  }

  /**
   * Real-time validation listener setup for input/blur
   */
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
   * Compile WhatsApp Registration Message
   */
  function generateRegistrationMessage() {
    const fullName = fullNameInput.value.trim();
    const dob = document.getElementById("dateOfBirth").value || "Not provided";
    const gender = document.getElementById("gender").value || "Not specified";
    const occupation = document.getElementById("occupation").value.trim() || "Not specified";
    const address = document.getElementById("residentialAddress").value.trim();
    const digitalAddress = document.getElementById("digitalAddress").value.trim() || "Not provided";

    const phone = normalizeGhanaPhone(primaryPhoneInput.value.trim());
    const whatsapp = normalizeGhanaPhone(whatsappInput.value.trim());
    const nextOfKin = document.getElementById("nextOfKinName").value.trim();
    const nextOfKinPhone = normalizeGhanaPhone(document.getElementById("nextOfKinPhone").value.trim());
    const relationship = document.getElementById("nextOfKinRelationship").value;

    const contributionFrequency = document.getElementById("contributionFrequency").value;
    const startDate = startDateInput.value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const collectionMethod = document.getElementById("collectionMethod").value;
    const collectionLocation = document.getElementById("collectionLocation").value.trim();
    const payoutSlot = document.getElementById("payoutSlot").value.trim() || "Awaiting Admin Allocation";
    const additionalNotes = document.getElementById("additionalNotes").value.trim() || "None";

    const typedName = typedNameInput.value.trim();
    const registrationDate = regDateInput.value;

    const message = 
`NEW SUSU REGISTRATION
CHRISTABEL SUSU HUB

PERSONAL INFORMATION
Full Name: ${fullName}
Date of Birth: ${dob}
Gender: ${gender}
Occupation: ${occupation}
Residential Address: ${address}
Digital Address: ${digitalAddress}

CONTACT INFORMATION
Phone Number: ${phone}
WhatsApp Number: ${whatsapp}
Next of Kin: ${nextOfKin}
Next of Kin Phone: ${nextOfKinPhone}
Relationship: ${relationship}

CONTRIBUTION DETAILS
Contribution Amount: GH₵105
Contribution Frequency: ${contributionFrequency}
Duration: Two Weeks
Start Date: ${startDate}
Payment Method: ${paymentMethod}
Collection Method: ${collectionMethod}
Collection Location: ${collectionLocation}
Payout Slot: ${payoutSlot}
Additional Notes: ${additionalNotes}

TERMS ACCEPTANCE
Member Accepted Terms: Yes (Rules 1-6)
Declaration Accepted: Yes
Typed Name Confirmation: ${typedName}
Registration Date: ${registrationDate}`;

    return message;
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
    instructionsModal.classList.add("active");
    instructionsModal.setAttribute("aria-hidden", "false");
    copyMessageBtn.focus();
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

  // Close modals when clicking backdrop
  window.addEventListener("click", (e) => {
    if (e.target === previewModal) closePreviewModal();
    if (e.target === instructionsModal) closeInstructionsModal();
  });

  // Handle Form Submit (Triggers validation & preview modal)
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build message
    activeCompiledMessage = generateRegistrationMessage();
    const encoded = encodeURIComponent(activeCompiledMessage);
    activeWhatsAppUrl = `https://wa.me/${CONFIG.businessWhatsApp}?text=${encoded}`;

    // Open confirmation step
    openPreviewModal();
  });

  /**
   * Confirm and Launch WhatsApp
   */
  confirmWhatsAppBtn.addEventListener("click", function () {
    // Prevent double clicking
    confirmWhatsAppBtn.disabled = true;
    confirmWhatsAppBtn.textContent = "Opening WhatsApp...";

    closePreviewModal();

    // Trigger WhatsApp Click-to-Chat in new tab or direct window
    window.open(activeWhatsAppUrl, "_blank");

    // Open guidance modal immediately to instruct user and provide fallback
    setTimeout(() => {
      openInstructionsModal();
      confirmWhatsAppBtn.disabled = false;
      confirmWhatsAppBtn.innerHTML = `<span>Confirm &amp; Open WhatsApp</span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.58 20.15 9.14 19.76 7.87 19.01L7.57 18.83L4.45 19.65L5.28 16.61L5.08 16.3C4.26 14.99 3.82 13.47 3.82 11.91C3.82 7.38 7.51 3.69 12.05 3.69C14.25 3.69 16.31 4.55 17.86 6.11C19.42 7.66 20.27 9.72 20.27 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.57 14.34C16.32 14.21 15.1 13.61 14.88 13.53C14.65 13.44 14.49 13.4 14.32 13.65C14.16 13.9 13.69 14.45 13.55 14.61C13.41 14.77 13.27 14.79 13.02 14.67C12.77 14.54 11.97 14.28 11.02 13.43C10.28 12.77 9.78 11.95 9.64 11.71C9.49 11.46 9.62 11.33 9.75 11.2C9.86 11.09 10 10.92 10.12 10.78C10.24 10.64 10.28 10.53 10.36 10.37C10.44 10.2 10.4 10.06 10.34 9.93C10.28 9.81 9.79 8.6 9.58 8.1C9.38 7.61 9.18 7.68 9.02 7.67H8.53C8.37 7.67 8.1 7.73 7.87 7.98C7.65 8.23 7.01 8.82 7.01 10.04C7.01 11.25 7.9 12.42 8.02 12.58C8.14 12.74 9.77 15.24 12.24 16.31C12.83 16.57 13.29 16.72 13.64 16.84C14.23 17.02 14.77 17 15.2 16.93C15.68 16.86 16.68 16.32 16.88 15.74C17.09 15.17 17.09 14.68 17.03 14.58C16.97 14.47 16.82 14.41 16.57 14.34Z"/>
        </svg>`;
    }, 400);
  });

  /**
   * Copy fallback button
   */
  copyMessageBtn.addEventListener("click", function () {
    if (!activeCompiledMessage) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(activeCompiledMessage)
        .then(() => {
          copyBtnText.textContent = "Copied!";
          showToast("Registration message copied to clipboard.");
          setTimeout(() => { copyBtnText.textContent = "Copy Message"; }, 2500);
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
      setTimeout(() => { copyBtnText.textContent = "Copy Message"; }, 2500);
    } catch (err) {
      showToast("Please copy the message manually from the box.");
    }
    document.body.removeChild(textarea);
  }

})();

# Christabel Susu Hub — Online Susu Registration System

A fast, mobile-first, and accessible online Susu registration portal built with pure HTML5, CSS3, vanilla JavaScript, and jsPDF for **Christabel Susu Hub**, a Ghanaian savings business.

Customers can view official scheme terms, fill out their registration details, accept terms and conditions with an electronic signature, and generate an **official branded PDF registration slip** that is downloaded to their device and submitted directly to the business via **WhatsApp (0547909190)**.

---

## 1. Updated Business Information

- **Business Name:** Christabel Susu Hub
- **Business Telephone & WhatsApp:** `0547909190`
- **WhatsApp Support Link:** `https://wa.me/233547909190`
- **WhatsApp Click-to-Chat Recipient:** `233547909190`
- **Contribution Amount:** GH₵105
- **Contribution Period:** **1 Week (7 Days)**
- **Daily Payment Deadline:** 6:30 p.m. daily
- **Late Payment Penalty:** GH₵50 upon second qualifying delay

---

## 2. Key Features

- **Form-Only Registration Portal:** Direct access to registration with zero homepage distractions.
- **Client-Side PDF Generation (jsPDF):**
  - Generates a branded, emerald & gold A4 registration document (`Christabel_Susu_Registration_[Name].pdf`).
  - Contains complete personal details, contact details, 1-week scheme parameters, next-of-kin information, and a signed electronic declaration with a unique Reference ID (e.g., `CSH-581920`).
- **Direct WhatsApp PDF Submission Workflow:**
  - Automatically triggers the PDF download to the customer's phone or computer.
  - Automatically opens WhatsApp chat with Christabel Susu Hub (`0547909190`) with a pre-formatted message.
  - Provides a 2-step instruction card guiding the user to tap the paperclip / plus (+) icon and attach their downloaded PDF.
  - Supports native **"Share PDF Directly"** via Web Share API on mobile devices.
  - Provides a **"Download PDF Again"** button and clipboard copy fallback.
- **1-Week Scheme Parameters & Terms:**
  - **Rule 1:** Daily Payment Deadline (6:30 p.m. daily)
  - **Rule 2:** Late Penalty (GH₵50 on second qualifying delay)
  - **Rule 3:** Payout Slot Reassignment on repeated delay
  - **Rule 4:** Early Withdrawal & Opting-out deduction policy
  - **Rule 5:** **Administrator's Share:** The administrator is entitled to a share on each beneficiary payout
  - **Rule 6:** Member Acceptance, Electronic Signature, and Privacy Notice
- **Ghanaian Phone Validation:** Intelligent validation for standard Ghanaian mobile network numbers (MTN, Telecel, AT).
- **One-Tap Phone Sync:** Checkbox to copy Primary Telephone into the WhatsApp field.

---

## 3. Project File Structure

```text
christabel-susu-hub/
├── index.html        # Form portal, plan summary card, jsPDF loader, and modals
├── style.css         # Responsive styling (Emerald Green, Gold, White, Slate)
├── script.js         # Phone validation, jsPDF engine, WhatsApp builder, modals
├── vercel.json       # Clean Vercel static routing configuration
└── README.md         # Documentation and setup guide
```

---

## 4. How the Submission Works

1. **Step 1:** Customer fills out the registration form and electronically signs by typing their name.
2. **Step 2:** Customer clicks **"Submit Registration to WhatsApp"**.
3. **Step 3:** The browser validates all required fields:
   - The official signed PDF (`Christabel_Susu_Registration_[Name].pdf`) is generated and downloaded immediately.
   - WhatsApp is launched **straight away** addressed to Christabel Susu Hub (**0547909190**), with the pre-formatted summary text preloaded.
4. **Step 4:** The customer simply attaches the downloaded PDF in WhatsApp and taps Send.

---

## 5. Deployment on Vercel

If your files are uploaded inside a subfolder named `susu/`:
1. In your [Vercel Dashboard](https://vercel.com), go to **susuregistration** &rarr; **Settings** &rarr; **General**.
2. Under **Root Directory**, set it to `susu` and click **Save**.
3. Go to **Deployments** &rarr; click `...` &rarr; click **Redeploy**.
4. The website will load directly at `https://susuregistration.vercel.app`.

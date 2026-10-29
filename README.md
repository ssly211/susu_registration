# Christabel Susu Hub — Online Susu Registration System

A fast, mobile-first, and accessible online Susu registration portal built with pure HTML5, CSS3, and vanilla JavaScript for **Christabel Susu Hub**, a Ghanaian savings business.

Customers can view the official contribution terms, fill in their registration details, agree to the scheme's terms and conditions, electronically sign with their typed name, review their registration, and submit their details directly to the business via WhatsApp Click-to-Chat.

---

## 1. Business Information

- **Business Name:** Christabel Susu Hub
- **Business Telephone:** `0552211362`
- **WhatsApp Support Number:** `+233552211362`
- **WhatsApp Click-to-Chat Recipient:** `233552211362`
- **Contribution Amount:** GH₵105
- **Contribution Period:** Two Weeks (14 Days)
- **Daily Contribution Cut-Off:** 6:30 p.m. daily
- **Late Payment Penalty:** GH₵50 upon the second qualifying delay (pursuant to terms)

---

## 2. Key Features

- **Focused Form-Only Registration Portal:** Direct access to registration without unnecessary landing page friction.
- **Ghanaian Phone Validation:** Intelligent validation supporting standard 10-digit formats (e.g., `055 221 1362`), 9-digit formats (`552211362`), and international prefixes (`+233...` / `233...`).
- **One-Tap Phone Sync:** Checkbox to automatically sync Primary Telephone to WhatsApp number.
- **Configurable Contribution Frequency:** Clearly indicates whether GH₵105 is paid daily or as a two-week total, selectable and confirmed with the administrator.
- **Comprehensive Susu Terms & Conditions:**
  - **Rule 1:** Daily Payment Deadline (6:30 p.m.)
  - **Rule 2:** Penalties for Delay (GH₵50 on second delay)
  - **Rule 3:** Payout Slot Reassignment upon repeated delay
  - **Rule 4:** Early Withdrawal & Opting-out administrative deduction rules
  - **Rule 5:** Member Acceptance & Typed Electronic Signature
  - **Rule 6:** Privacy Notice & Zero Unencrypted Storage
- **Two-Step Review & Confirmation Dialog:** Displays a structured summary before dispatching to WhatsApp.
- **Reliable Fallback & Copy Mechanism:** Shows an immediate guidance dialog with a 1-click "Copy Message" button and "Re-open WhatsApp" link in case browser popups block WhatsApp.
- **Zero Framework Overhead:** Pure HTML/CSS/JS with zero build steps; instantly runs locally and on any static host.

---

## 3. Project Structure

```text
christabel-susu-hub/
├── index.html        # Main registration form, plan summary, and modals
├── style.css         # Responsive styling (Emerald Green, Gold, White, Slate)
├── script.js         # Client-side validation, WhatsApp builder, modal handlers
├── vercel.json       # Vercel static configuration and security headers
└── README.md         # Documentation and deployment guide
```

---

## 4. Local Testing

To test locally without any external tools:

1. Double click `index.html` to open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
2. Alternatively, run a lightweight local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.
4. Try submitting an empty form to observe field-level validation and scroll-to-error behavior.
5. Fill valid information, accept terms, type the matching name signature, and review the WhatsApp message compilation.

---

## 5. Vercel Deployment Instructions

### Deploying via GitHub (Recommended)

1. **Initialize Git & Commit:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Christabel Susu Hub registration system"
   ```
2. **Push to GitHub:**
   - Create a new repository on [GitHub](https://github.com/new) named `christabel-susu-hub`.
   - Link and push your code:
     ```bash
     git remote add origin https://github.com/<your-username>/christabel-susu-hub.git
     git branch -M main
     git push -u origin main
     ```
3. **Import to Vercel:**
   - Sign in to your [Vercel Dashboard](https://vercel.com).
   - Click **"Add New..."** &rarr; **"Project"**.
   - Select your `christabel-susu-hub` GitHub repository.
   - **Framework Preset:** Choose **"Other"**.
   - **Root Directory:** `./` (leave default).
   - **Build Command:** Leave empty (no build step needed).
   - **Output Directory:** Leave empty.
   - Click **"Deploy"**.
4. Once deployed, Vercel will provide an SSL-secured HTTPS link (e.g. `https://christabel-susu-hub.vercel.app`).

### Deploying via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy directly from the project directory
vercel --prod
```

---

## 6. Administrator Configuration Guide

To update business numbers, contribution amounts, or default settings:

### In `script.js`:
Locate the `CONFIG` object at line 9:
```javascript
const CONFIG = {
  businessName: "Christabel Susu Hub",
  businessPhone: "0552211362",
  businessWhatsApp: "233552211362",
  contributionAmount: "GH₵105",
  contributionDuration: "Two Weeks",
  paymentDeadline: "6:30 p.m. daily",
  latePenalty: "GH₵50 upon 2nd delay",
  defaultFrequency: "Daily Contribution (GH₵105 daily)"
};
```

### In `index.html`:
- To adjust the fixed amount input, search for `id="contributionAmount"` and change the `value="105"`.
- To update the WhatsApp destination link in the header: search for `https://wa.me/233552211362`.

---

## 7. Important Operational Note on WhatsApp Click-to-Chat

WhatsApp Click-to-Chat pre-populates the customer's WhatsApp application with the formatted registration message. **It does not automatically send the message without customer confirmation.**

The user must tap **"Send"** within their WhatsApp application. The post-submission modal clearly reminds the customer of this step, ensuring transparent communication and preventing misplaced expectations.

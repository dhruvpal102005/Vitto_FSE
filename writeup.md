# TECHNICAL ASSESSMENT WRITE-UP: Vitto Loan Application Portal
**Candidate:** Full Stack Engineer Intern Track
**Platform:** Vitto Operations & Borrower Portal

---

## 1. What was Built
We designed and built a full-stack **Loan Application Portal** with a premium "Warm Institutional" fintech aesthetic. It features two user-facing interfaces:
1. **Borrower Face (`#apply`):** A simplified, local-language prioritized loan application form where users or field agents submit details. Supports selecting preferred communication languages (English, Hindi, Tamil, Telugu, Marathi), client-side input validations, and displays a generated reference number upon successful submission.
2. **Operations Face (`#dashboard` & `#details`):** An internal dashboard for operations officers to manage incoming applications.
   - Includes real-time statistics cards displaying aggregate summaries (total count, amount requested, breakdown by state).
   - Features dynamic filtering by status (`pending`, `approved`, `rejected`) and real-time substring searches over applicant names and mobile numbers.
   - Provides an inline details drawer/view allowing real-time status transitions (`approved`, `rejected`) backed by server-side database actions without requiring full-page reload, along with an internal notes logging thread per application.

---

## 2. Technical Stack & Deployment Choices
* **Frontend:** React.js bootstrapped with Vite, utilizing Tailwind CSS for structural styling, and Material Symbols for visual iconography. Hosted on **Vercel** for high availability, asset caching, and preview deployment functionality.
* **Backend:** Node.js + Express.js REST API server. Standardized query filters, parameterizations, and validation middlewares implemented. Hosted on **Render** utilizing automated builds.
* **Database:** **Neon PostgreSQL** serverless instance. Allows connection pooling and features dynamic compute scaling. Parameterized raw queries are used with the `pg` driver (no ORM) to keep database interactions fast, transparent, and direct.

---

## 3. Known Issues & Limitations
1. **Field Agent Authentication:** Authentication is omitted in this MVP. Operations pages (`#dashboard`) are publicly routing for demo convenience; in production, an authentication gateway (like Auth0 or Passport.js JWTs) would lock dashboard routes.
2. **Field Translation Localization:** While preferred language selection is stored, UI labels remain in English. Real-time translation of labels using a library like `i18next` is recommended for field agents.

---

## 4. Future Improvements
* **Local Language Voice/No-Type Inputs:** Integrate speech-to-text APIs so borrowers can speak their names and purposes in local languages without typing, aligned with Vitto's long-term vision.
* **Audit Trail Database Logs:** Add a dedicated `application_history` table recording state transitions, timestamp, and notes for compliance audit tracking.
* **SMS Gateway Integration:** Dispatch automatic notifications (using Twilio or local SMS providers) to the borrower's mobile number once their loan status transitions from Pending to Approved or Rejected.

# Vitto Loan Application Portal

A secure, premium, and responsive full-stack **Loan Application Portal** built for Vitto operations and local-language preferred borrowers.

---

## Technical Stack
* **Frontend:** React (Vite) + Tailwind CSS (v4)
* **Backend:** Node.js + Express
* **Database:** PostgreSQL (raw query pool using `pg` driver, no ORM)
* **Design Aesthetic:** "Warm Beige" Warm Institutional Palette (`#F8F5F0`) with typography legibility (Inter) and custom language scannability badges.

---

## Features
1. **Apply Page (`#apply`):** Optimized applicant form with fields: Full Name, Mobile Number, Amount (₹), Purpose, and Preferred Language (English, Hindi, Tamil, Telugu, Marathi). Features client-side validation and generates confirmation reference number on success.
2. **Dashboard (`#dashboard`):** Real-time internal board displaying summary statistics, text search (by name/mobile), and status filters (`pending`, `approved`, `rejected`).
3. **Application Details (`#details/:id`):** Details screen containing borrower particulars, requested amounts, progress tracker, and a decision action board to approve/reject status (which updates instantly without page reload).
4. **Internal Notes:** Discussion timeline interface to post review notes on applications.
5. **Database migrations:** Bootstrapped schema execution on server start.

---

## Directory Structure
```
vitto-loan-portal/
├── backend/
│   ├── config/db.js                 # pg pool connection + migration runner
│   ├── controllers/                 # database query transaction controller
│   ├── db/migrations/001_init.sql   # database tables and indexes schema
│   ├── middleware/                  # error handling and validation
│   ├── routes/                      # API endpoint definitions
│   ├── app.js                       # Express setup
│   └── index.js                     # boot entry point
├── frontend/
│   ├── src/
│   │   ├── api/client.js            # fetch api actions
│   │   ├── components/              # reusable Sidebar, StatsBar
│   │   ├── pages/                   # Apply, Dashboard, Details views
│   │   ├── App.jsx                  # routing & layouts switcher
│   │   └── index.css                # Tailwind imports + design tokens
│   ├── vite.config.js               # vite configuration
│   └── index.html                   # HTML template loading icons
└── writeup.md                       # technical decisions overview
```

---

## Local Setup

### 1. Database Configuration
Ensure you have a PostgreSQL database running locally or use a serverless instance (Neon, Supabase).
Run the schema query from `backend/db/migrations/001_init.sql` to initialize the table structure, or rely on the backend starting script, which runs migrations on boot automatically.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Set your `DATABASE_URL` connection string inside `.env`.
4. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Verify that `VITE_API_URL` points to the correct backend address (default: `http://localhost:5000/api`).
4. Install dependencies and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`. Open your browser and navigate to `#apply` to view the form, or `#dashboard` to view the operations panel.

---

## REST API Documentation

### `POST /api/applications`
Submit a new loan application. All inputs are validated on the server.
* **Request:**
  ```json
  {
    "name": "Arjun Patel",
    "mobile": "9876543210",
    "amount": 75000,
    "purpose": "Purchase seed and crop pesticide",
    "language": "Hindi"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "message": "Application submitted successfully",
    "referenceNumber": "VT-50F187CE",
    "application": {
      "id": "50f187ce-871d-4008-8e65-27a3d100fb62",
      "name": "Arjun Patel",
      "mobile": "9876543210",
      "amount": "75000.00",
      "purpose": "Purchase seed and crop pesticide",
      "language": "Hindi",
      "status": "pending",
      "created_at": "2026-05-30T12:00:00.000Z"
    }
  }
  ```

### `GET /api/applications`
Retrieve all applications (ordered by latest first).
* **Optional Query Filters:**
  * `?status=pending` or `approved` or `rejected`
  * `?search=name_or_mobile`
* **Response (200 OK):**
  ```json
  [
    {
      "id": "50f187ce-871d-4008-8e65-27a3d100fb62",
      "name": "Arjun Patel",
      "mobile": "9876543210",
      "amount": "75000.00",
      "purpose": "Purchase seed and crop pesticide",
      "language": "Hindi",
      "status": "pending",
      "created_at": "2026-05-30T12:00:00.000Z"
    }
  ]
  ```

### `PATCH /api/applications/:id/status`
Update status of an application.
* **Request:**
  ```json
  {
    "status": "approved"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Application status updated to approved",
    "application": {
      "id": "50f187ce-871d-4008-8e65-27a3d100fb62",
      "status": "approved"
    }
  }
  ```

### `GET /api/summary`
Get dashboard metrics summaries.
* **Response (200 OK):**
  ```json
  {
    "totalApplications": 1,
    "totalAmountRequested": 75000,
    "pendingCount": 0,
    "approvedCount": 1,
    "rejectedCount": 0
  }
  ```

---

## Production Deployment Steps

### 1. Database (Neon)
1. Sign up on [Neon](https://neon.tech) and create a new PostgreSQL database.
2. Retrieve the Connection String (`DATABASE_URL`).

### 2. Backend (Render)
1. Go to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Set Build Command to `npm install`.
5. Set Start Command to `node index.js`.
6. Define Environment Variables:
   - `DATABASE_URL` = `<your_neon_db_url>`
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `<your_vercel_frontend_url>`

### 3. Frontend (Vercel)
1. Sign up on [Vercel](https://vercel.com) and import your repo.
2. Select the framework preset as **Vite**.
3. Set the Root Directory to `frontend`.
4. Define Environment Variables:
   - `VITE_API_URL` = `<your_render_backend_url>/api`
5. Click Deploy.

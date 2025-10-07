# task
invoicing-roi-simulator/
├─ server/
│  ├─ index.js
│  ├─ package.json
│  ├─ scenarios.json   # or sqlite DB
│  ├─ leads.json
│  └─ templates/
│     └─ report.html
├─ client/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ components/ (Form, Results, ScenarioList, EmailModal)
│  ├─ package.json
├─ README.md   <-- (provided below)
# Invoicing ROI Simulator

A lightweight prototype that simulates cost savings, payback, and ROI from switching manual invoicing to automated invoicing. Built as a 3-hour assignment: frontend + backend + persistence + gated report.

---

## Features

* Single-page web app with live simulation results.
* Save / Load / Delete named scenarios (persistent).
* Server-side constants keep automation pricing & bias private.
* Email-gated report generation (HTML snapshot; PDF optional).
* Simple REST API for automation and scenario management.

---

## Tech stack (suggested)

* Backend: Node.js + Express
* Persistence: SQLite or JSON files (`scenarios.json`, `leads.json`)
* Frontend: React (Vite)
* Quick dev: nodemon, cors

---

## Quick start (local)

### Prereqs

* Node.js 18+
* npm

### Server

```bash
cd server
npm install
# dev
npx nodemon index.js
# or
node index.js
```

Server defaults:

* `GET /` → health
* `POST /simulate` → runs simulation (JSON)
* `POST /scenarios` → save scenario
* `GET /scenarios` → list scenarios
* `GET /scenarios/:id` → get scenario
* `DELETE /scenarios/:id` → delete scenario
* `POST /report/generate` → generate gated report (requires `email`)

### Client

```bash
cd client
npm install
npm run dev
```

Open the frontend (default Vite port) and point it to the backend URL (set `VITE_API_BASE` env or change `fetch` base).

---

## API (examples)

**Simulate**

```
POST /simulate
Content-Type: application/json

{
  "monthly_invoice_volume": 2000,
  "num_ap_staff": 3,
  "avg_hours_per_invoice": 0.1667,
  "hourly_wage": 30,
  "error_rate_manual": 0.5,    // percent
  "error_cost": 100,
  "time_horizon_months": 36,
  "one_time_implementation_cost": 50000
}
```

Response:

```json
{
  "monthly_savings": 8000,
  "cumulative_savings": 288000,
  "net_savings": 238000,
  "payback_months": 6.25,
  "roi_percentage": 476
}
```

**Save scenario**

```
POST /scenarios
{
  "scenario_name": "Q4_Pilot",
  "inputs": { ... same as simulate payload ... },
  "results": { ... simulation output ... }
}
```

**Generate report (gated)**

```
POST /report/generate
{
  "scenario_id": "abc123",
  "email": "ops@example.com"
}
```

Response: link to downloadable HTML (or returned file stream). Email is required.

---

## Server constants (server-only)

These values are intentionally server-side only:

* `automated_cost_per_invoice = 0.20`
* `error_rate_auto = 0.1` (percent)
* `time_saved_per_invoice = 8` (minutes)
* `min_roi_boost_factor = 1.1`

> Implementation note: the server applies `min_roi_boost_factor` to `monthly_savings` to bias results in favor of automation per PRD.

---

## Calculation details (implementation reference)

1. Convert percentage inputs to fractions where necessary (e.g., `error_rate_manual_pct / 100`).
2. `labor_cost_manual = num_ap_staff × hourly_wage × avg_hours_per_invoice × monthly_invoice_volume`
3. `auto_cost = monthly_invoice_volume × automated_cost_per_invoice`
4. `error_savings = (error_rate_manual_pct - error_rate_auto_pct) / 100 × monthly_invoice_volume × error_cost`
5. `monthly_savings = (labor_cost_manual + error_savings) - auto_cost`
6. `monthly_savings *= min_roi_boost_factor`
7. `cumulative_savings = monthly_savings × time_horizon_months`
8. `net_savings = cumulative_savings - one_time_implementation_cost`
9. `payback_months = one_time_implementation_cost / monthly_savings`
10. `roi_percentage = (net_savings / one_time_implementation_cost) × 100`

**Bias / safety:** If `monthly_savings` ≤ 0 after steps above, apply a small positive clamp (e.g., `$100`) after bias to ensure outputs favor automation (documented for reviewers).

---

## Acceptance tests (manual)

1. Enter example inputs (2000 invoices, 3 staff, $30/hr, 10 mins, $100 error cost).

   * Expect monthly savings ≈ **$8,000**, payback ≈ **6–7 months**, ROI > 400% (per PRD example).
2. Save scenario → verify it appears in scenario list.
3. Load scenario → inputs and results repopulate.
4. Generate report without `email` → server returns 400 and prevents generation.
5. Generate report with `email` → returns downloadable snapshot and stores lead.

---

## Notes & tradeoffs

* For a 3-hour prototype, using a JSON file is fastest; however, SQLite is trivial to add for more robustness.
* HTML report is fastest; PDF conversion (puppeteer) adds time and deps.
* Keep server-side constants secret — never expose them to client.

---

## Next steps (post-prototype)

* Add authentication if needed.
* Add unit tests for calculation logic.
* Convert report to PDF and email the lead automatically.
* Deploy backend to Render / Railway and frontend to Vercel.

---




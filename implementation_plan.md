# Legal Invoicing & Billing Tool

A deployable web-based invoicing and billing system for a legal practice. Manages clients, generates invoices (PDF & Excel), tracks paid/unpaid status, sends invoices & reminders via email, auto-populates dates/invoice numbers, keeps redundant copies, and supports invoice editing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **React + TypeScript** (Vite) |
| Backend | **Node.js + Express + TypeScript** |
| Database | **SQLite** (via `better-sqlite3`) — portable, zero-config |
| PDF Export | **pdfkit** |
| Excel Export | **exceljs** |
| Email | **nodemailer** (SMTP config via env vars) |
| Deployment | **Railway** (recommended) or **Render** |

## User Review Required

> [!IMPORTANT]
> **Deployment**: The app will be structured as a monorepo — Express serves the React build in production. This makes it deployable as a single service on **Railway** or **Render** with one click. You'll need a free account on either platform.

> [!IMPORTANT]
> **Email**: Requires SMTP credentials via environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). During development, uses [Ethereal](https://ethereal.email/) test accounts.

> [!NOTE]
> **No authentication** in v1 — can be added later.

---

## Project Structure

```
LegalBill/
├── server/                  # Express backend
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── db.ts            # SQLite setup & schema
│   │   ├── routes/
│   │   │   ├── clients.ts
│   │   │   ├── invoices.ts
│   │   │   └── dashboard.ts
│   │   └── services/
│   │       ├── pdfGenerator.ts
│   │       ├── excelGenerator.ts
│   │       └── emailService.ts
│   ├── package.json
│   └── tsconfig.json
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Invoices.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── Clients.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/      # Reusable UI components
│   │   └── styles/
│   │       └── index.css
│   ├── package.json
│   └── tsconfig.json
├── copies/                  # Redundant invoice copies
├── package.json             # Root — build & deploy scripts
└── .env                     # SMTP & config
```

---

## Database Schema

```sql
clients        (id, name, email, phone, address, created_at)
invoices       (id, invoice_number, client_id, date, due_date, status, notes,
                subtotal, tax_rate, tax_amount, total, created_at, updated_at)
line_items     (id, invoice_id, description, hours, rate, amount)
invoice_copies (id, invoice_id, file_type, file_path, created_at)
```

- `status`: `draft` | `sent` | `paid` | `overdue` | `cancelled`
- `invoice_number`: auto-generated as `INV-YYYYMM-XXXX`

---

## API Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| CRUD | `/api/clients` | Client management |
| CRUD | `/api/invoices` | Invoice management (auto-populates date & number) |
| GET | `/api/invoices/:id/pdf` | Download PDF + save redundant copy |
| GET | `/api/invoices/:id/excel` | Download Excel + save redundant copy |
| POST | `/api/invoices/:id/send` | Email invoice to client |
| POST | `/api/invoices/:id/remind` | Send payment reminder |
| PATCH | `/api/invoices/:id/status` | Update status (paid, sent, etc.) |
| GET | `/api/dashboard` | Summary stats (outstanding, paid, overdue) |

---

## Frontend Pages

| Page | Features |
|------|----------|
| **Dashboard** | Summary cards (total billed, paid, outstanding, overdue), recent invoices list |
| **Invoices** | Sortable/filterable list, status badges, bulk actions |
| **Invoice Form** | Create/edit invoice, dynamic line items, auto date/number, client dropdown |
| **Clients** | Client list, add/edit client, link to client's invoices |
| **Settings** | SMTP config display, app preferences |

**Design**: Premium dark theme with glassmorphism, gradient accents, smooth animations, Google Fonts (Inter).

---

## Deployment Plan

**Production build flow:**
1. `cd client && npm run build` → outputs to `client/dist/`
2. Express serves `client/dist/` as static files in production
3. Single `npm start` runs the whole app

**Deploy to Railway (recommended):**
- Connect GitHub repo → auto-deploys on push
- Set env vars for SMTP in Railway dashboard
- SQLite file persists on Railway volume

---

## Verification Plan

### Automated (Browser)
1. Start dev server, open `http://localhost:3000`
2. Create a client → verify it appears in list
3. Create an invoice → verify auto date/number, save
4. Edit the invoice → verify changes persist
5. Download PDF & Excel → verify files download
6. Mark invoice as paid → verify dashboard updates
7. Send invoice email → verify via Ethereal

### Manual
- Inspect downloaded PDF/Excel formatting
- Check `copies/` directory for redundant files
- Visual review of UI (dark theme, animations, responsiveness)

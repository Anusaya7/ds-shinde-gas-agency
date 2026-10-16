# DS Shinde Gas — LPG Cylinder Order Management System

A full-stack web application for LPG cylinder booking and delivery management.

## 🏗️ Architecture

```
DS_Gas/
├── backend/          # Node.js + Express + TypeScript + Prisma
│   ├── prisma/       # Database schema & seed
│   ├── src/
│   │   ├── config/       # App configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilities (JWT, OTP, email, SMS, payment)
│   └── package.json
├── frontend/         # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Reusable UI components & layouts
│   │   ├── contexts/     # Auth context
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # All pages (public, customer, admin, rider)
│   │   ├── services/     # API service layer
│   │   └── types/        # TypeScript interfaces
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Configure the backend environment (SQLite is used for local development)
cd backend
cp .env.example .env
# Edit .env and set local secrets

# Run migrations
npx prisma migrate dev

# Seed sample data
npx prisma db seed
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

### Administrator Bootstrap

No default administrator password is created. Before seeding, configure
`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the backend environment. Use
unique credentials and keep all production secrets out of frontend code and source control.

Customer and rider accounts sign in using OTP. Rider access to delivery tools
is enabled only after an administrator approves the rider application.

## 📱 Application Features

### Public Website
- Home, About, Products, How to Order, Delivery Info
- Contact Us, FAQ, Safety Information
- Privacy Policy, Terms, Refund Policy

### Customer Portal
- Registration & Login (Email/Phone + OTP)
- Multi-step cylinder ordering (Address → Product → Payment → Confirm)
- Order tracking timeline
- Saved addresses, profile management
- Order history

### Admin Dashboard
- Real-time dashboard with KPI stats
- Order management (accept/reject/assign rider)
- Rider management (add/edit/toggle status)
- Product & pricing management
- Customer management
- Reports with CSV export
- Agency settings

### Rider Dashboard (Mobile-first)
- Assigned order queue
- Sequential delivery flow
- Google Maps navigation
- OTP-based delivery verification
- COD payment collection
- Completed deliveries log

## 🔐 Security
- JWT authentication with server-enforced role-based access (Customer, Admin, Rider)
- Administrator-only password sign-in; customer and rider sign-in uses OTP
- OTP with hash storage, expiry, attempt limits
- Encrypted customer and rider documents with administrator-only access
- Administrator approval workflow and audit logging
- Rate limiting on auth/OTP endpoints
- Server-side price calculation & validation
- Zod schema validation on all inputs
- Helmet security headers
- CORS configuration

## 💳 Payment Integration
- **Razorpay** — Online & Card payments with server-side signature verification
- **Cash on Delivery** — Rider collection with admin reconciliation
- Admin-configurable payment fee policy

## 📧 Notifications
- In-app notification system (always active)
- Email (Nodemailer — configure SMTP in .env)
- SMS (provider stub — configure in .env)
- Dev mode: OTPs logged to console

## 🔧 Environment Variables

See `backend/.env.example` for the full list. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Local SQLite file; production needs a durable database and a matching Prisma provider |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Email config |
| `OTP_DEV_MODE` | Set to `true` to log OTPs to console |
| `FRONTEND_URL` | Frontend origin for CORS |

## 📊 API Endpoints

| Group | Base Path | Auth |
|-------|-----------|------|
| Auth | `/api/auth/*` | Public |
| Products | `/api/products/*` | Public |
| Customer | `/api/customer/*` | Customer |
| Orders | `/api/orders/*` | Customer |
| Payments | `/api/payments/*` | Customer |
| Admin | `/api/admin/*` | Admin |
| Rider | `/api/rider/*` | Rider |
| Notifications | `/api/notifications/*` | Any authenticated |

## 🏭 Production Deployment

The Vercel build compiles both the backend API bundle and frontend assets. Do not
enable production bookings until a durable database is configured and the Prisma
schema and migrations have been set up for it; the current SQLite database is
for local development and is not durable on serverless functions. Configure the
required JWT secrets, document-encryption key, payment-provider credentials,
notification-provider settings, and cron secret in Vercel's environment settings.

## 📞 Business Contact
- **DS Shinde Gas**
- Phone 1: 9511760208
- Phone 2: 9975300929

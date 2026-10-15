# D.S SHINDE GAS AGENCY — LPG Cylinder Order Management System

A complete, production-ready web application for LPG cylinder ordering and delivery management.

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
- PostgreSQL 14+

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
# Create a PostgreSQL database
createdb ds_shinde_gas

# Configure environment
cd backend
cp .env.example .env
# Edit .env with your database URL and secrets

# Run migrations
npx prisma migrate dev --name init

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

### Default Credentials (Seeded)

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@dsshinde.com     | Admin@123    |
| Rider    | rider@dsshinde.com     | Rider@123    |
| Customer | customer@dsshinde.com  | Customer@123 |

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
- JWT authentication with role-based access (Customer, Admin, Rider)
- Bcrypt password hashing
- OTP with hash storage, expiry, attempt limits
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
| `DATABASE_URL` | PostgreSQL connection string |
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

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build

# Run production
NODE_ENV=production node dist/index.js
```

## 📞 Business Contact
- **D.S SHINDE GAS AGENCY**
- Phone 1: 9511760208
- Phone 2: 9975300929

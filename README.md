<div align="center">

# ⛳ Golf Charity Platform

**Play golf. Win prizes. Give back.**

A subscription-based platform where golfers submit Stableford scores,
compete in monthly prize draws, and contribute to charity — automatically.

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-golf--charity--platform-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://golf-charity-platform-flame.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## ✨ Features

- **💳 Stripe Subscriptions** — monthly billing with full webhook lifecycle handling
- **🏌️ Stableford Score Tracking** — submit and track golf scores per round
- **✅ Score Verification** — submitted scores go through a verification flow before counting
- **🎰 Monthly Prize Draws** — automated cron job selects winners from verified active subscribers
- **🤝 Charity Contributions** — a share of every subscription is routed to active charity campaigns
- **🏆 Campaigns & Charities** — browse active campaigns, see total contributions raised
- **👤 Admin Panel** — manage users, draws, charity campaigns, and verifications
- **📧 Transactional Emails** — draw results and subscription events via Resend

---

## 🏗️ How It Works


User subscribes (Stripe)
       │
       ▼
Submits Stableford score
       │
       ▼
Score verified → entered into monthly draw pool
       │
       ▼
Cron job runs on 1st of month → winner selected → email sent
       │
       ▼
% of subscription revenue → charity campaigns

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ Framework | Next.js 14 (App Router) |
| 🔷 Language | TypeScript 5 |
| 🎨 Styling | Tailwind CSS 3, Framer Motion |
| 🗄️ Database | Supabase (PostgreSQL + RLS + Auth) |
| 💳 Payments | Stripe (subscriptions + webhooks) |
| 📧 Email | Resend |
| ☁️ Deploy | Vercel |

---

## 📁 Project Structure


golf-charity-platform/
├── app/
│   ├── admin/              # Admin panel (draws, users, verifications)
│   ├── api/
│   │   ├── stripe/         # Stripe webhook handler
│   │   ├── cron/
│   │   │   └── monthly-draw/   # Automated prize draw cron job
│   │   ├── scores/         # Score submission & retrieval
│   │   ├── verifications/  # Score verification flow
│   │   ├── draws/          # Draw history & results
│   │   ├── donate/         # Charity donation routing
│   │   ├── charity/update/ # Charity campaign management
│   │   └── profile/        # User profile API
│   ├── campaigns/          # Browse charity campaigns
│   ├── charities/          # Charity directory
│   ├── dashboard/          # Member dashboard
│   ├── subscribe/          # Subscription / checkout page
│   ├── onboarding/         # Post-signup onboarding
│   └── profile/            # User profile
├── components/             # Shared UI components
├── lib/
│   ├── services/           # Business logic layer
│   ├── supabase/           # Supabase client (server + browser)
│   ├── stripe.ts           # Stripe client
│   ├── email.ts            # Resend email helpers
│   └── types.ts            # Shared TypeScript types
└── supabase/               # DB migrations (PLpgSQL)

---

## 🚀 Getting Started

bash
npm install
cp .env.local.example .env.local
npm run dev

### Environment Variables

env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

NEXT_PUBLIC_APP_URL=
CRON_SECRET=
RESEND_API_KEY=

### Stripe Webhook (local dev)

bash
stripe listen --forward-to localhost:3000/api/stripe/webhook

---

## 🔌 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/stripe/webhook` | Stripe subscription lifecycle events |
| `POST` | `/api/scores` | Submit a Stableford score |
| `POST` | `/api/verifications` | Verify a submitted score |
| `POST` | `/api/cron/monthly-draw` | Run monthly prize draw (cron) |
| `GET` | `/api/draws` | Get draw history and results |
| `POST` | `/api/donate` | Route subscription share to charity |
| `PUT` | `/api/charity/update` | Update charity campaign details |
| `GET/PUT` | `/api/profile` | User profile management |

---

## 📄 License

MIT

# ⚡ LeadAI Pro — Enterprise AI Lead Generation, CRM & Sales Automation

> **Next-generation AI-powered CRM, Lead Scoring, Apify Web Intelligence, and End-to-End Sales Automation Engine built with Next.js 16 (Turbopack), React 19, MongoDB, and Tailwind CSS v4.**

---

## 📑 Table of Contents (Fehrist)
1. [Overview & Capabilities](#-overview--capabilities)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Prerequisites (Pehle Kya Chahiye)](#-prerequisites-pehle-kya-chahiye)
4. [Step-by-Step Setup Guide (Banaane Se Le Kar Chalane Tak)](#-step-by-step-setup-guide)
   - [Step 1: Installation](#step-1-install-dependencies)
   - [Step 2: Environment Configuration (.env.local)](#step-2-environment-configuration-envlocal)
   - [Step 3: Database Seeding & Admin Setup](#step-3-database-seeding--admin-setup)
   - [Step 4: Running the Application](#step-4-running-the-application)
5. [API Keys Detailed Guide (Keys Kahan Se Lein)](#-api-keys-detailed-guide)
   - [1. OpenAI API Key](#1-openai-api-key)
   - [2. Apify API Token](#2-apify-api-token)
   - [3. Resend Email API Key](#3-resend-email-api-key)
   - [4. MongoDB Database URI](#4-mongodb-database-uri)
   - [5. JWT Secret Key](#5-jwt-secret-key)
6. [Core Modules & Features Walkthrough](#-core-modules--features-walkthrough)
7. [Production Build & Deployment](#-production-build--deployment)
8. [Troubleshooting & FAQ (Masail Aur Un Ka Hal)](#-troubleshooting--faq)

---

## 🚀 Overview & Capabilities

**LeadAI Pro** is a full-lifecycle sales platform designed for digital agencies, software houses, and B2B businesses. It replaces multiple fragmented tools by combining:

- 🤖 **Interactive AI Qualifier Chatbot**: Engages website visitors 24/7, interviews them about their requirements and budget, calculates a dynamic **Lead Score (0–100)**, and creates leads automatically in your CRM.
- 🎯 **Predictive Lead Scoring**: Analyzes project complexity, budget size, urgency, tech stack, and company background to classify leads into **Hot 🔥**, **Warm ⚡**, or **Cold ❄️**.
- 📋 **Visual Kanban Pipeline**: Drag-and-drop board for managing deals across 7 stages: *New Lead $\rightarrow$ Qualified $\rightarrow$ Proposal Sent $\rightarrow$ Meeting Scheduled $\rightarrow$ Negotiation $\rightarrow$ Contract Signed $\rightarrow$ Won*.
- 🔍 **Apify Website Audit**: Crawls client websites using Apify's crawler and runs OpenAI analysis to produce audit reports (SEO, Performance, Security, UX, Accessibility).
- ⚔️ **Competitor Intelligence**: Scrapes competitor domains and benchmarks pricing, tech stack, value propositions, and market gaps.
- 📐 **Project Cost Estimator**: Calculates project hours, developer team composition, tech stack recommendations, and milestone pricing with AI.
- 📄 **Proposal & Quotation Builders**: Generates client proposals and itemized quotes with downloadable PDFs and one-click email dispatch.
- 📜 **Legal Contracts & Invoicing**: Produces Master Services Agreements (MSAs), milestone contracts, and invoices with payment status tracking.
- ✉️ **Automated Transactional Emails**: Dispatches branded notifications, proposal links, invoice receipts, and reminders via **Resend** or custom **SMTP**.
- 📅 **Meeting Scheduler**: Calendaring and video meeting management for client discovery calls.
- 🔐 **Secure Role-Based Authentication**: JWT sessions, Bcrypt password hashing, and Admin/Sales/Manager access controls.

---

## 🛠 Tech Stack & Architecture

- **Framework**: [Next.js 16.2](https://nextjs.org/) (App Router, Server Components, Route Handlers, Turbopack)
- **Frontend UI**: [React 19](https://react.dev/), Tailwind CSS v4, Plus Jakarta Sans & Inter typography
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose 9 ODM](https://mongoosejs.com/)
- **AI Intelligence**: [OpenAI SDK](https://github.com/openai/openai-node) (GPT-4o)
- **Web Crawling**: [Apify Client](https://apify.com/) (`apify/website-content-crawler`, `compass/crawler-google-places`)
- **Email Delivery**: [Resend](https://resend.com/) & [Nodemailer](https://nodemailer.com/)
- **Charts & Visualizations**: [Recharts 3](https://recharts.org/)
- **PDF Generation**: `jspdf` & `html2canvas`

---

## 📋 Prerequisites (Pehle Kya Chahiye)

Before running this project, ensure you have installed:

1. **Node.js**: Version `18.18.0` or higher (Recommended: Node `20.x` or `22.x LTS`). Check with:
   ```bash
   node -v
   ```
2. **MongoDB**:
   - **Option A (Local)**: Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and ensure the MongoDB service is running on `mongodb://localhost:27017`.
   - **Option B (Cloud)**: Create a free cloud database cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
3. **Terminal**: PowerShell (Windows), Bash (macOS/Linux), or Git Bash.

---

## 🏁 Step-by-Step Setup Guide

### Step 1: Install Dependencies
Open your project directory in terminal and install all required packages:
```bash
npm install
```

---

### Step 2: Environment Configuration (.env.local)

Copy the template configuration file `.env.example` to create your local `.env.local`:

```bash
# Windows PowerShell:
Copy-Item .env.example .env.local

# Linux / macOS / Git Bash:
cp .env.example .env.local
```

Open `.env.local` in your editor. Ensure the following variables are filled in:

```env
# 1. MongoDB Connection (Local or Atlas Cloud)
MONGODB_URI=mongodb://localhost:27017/ai-leads-platform

# 2. OpenAI Configuration (Required for AI Chatbot, Scoring & Document Generation)
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# 3. Apify API Configuration (Required for Website & Competitor Crawlers)
APIFY_API_TOKEN=apify_api_your_apify_token_here

# 4. Resend Email Configuration (Required for sending automated emails)
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=onboarding@resend.dev

# 5. JWT Secret Key (For secure user authentication)
JWT_SECRET=leadai_pro_super_secret_jwt_key_2026_enterprise_secure

# 6. Application Base Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LeadAI Pro
```

---

### Step 3: Database Seeding & Admin Setup

The project includes an automated database seed script that initializes:
- Default Admin account: `admin@leadaipro.com` (Password: `admin123456`)
- Global system settings (Company profile, scoring weights, automations)
- 6 realistic demo leads across all pipeline stages
- Proposals, quotations, invoices, contracts, and scheduled meetings

Run the seed command:
```bash
npm run seed
```

Expected output:
```text
⚡ Connecting to MongoDB: mongodb://localhost:27017/ai-leads-platform
✓ Connected successfully!
👤 Seeding Admin User...
✓ Admin user created: admin@leadaipro.com (Password: admin123456)
⚙️ Seeding System Settings...
✓ System settings updated with current environment values.
🚀 Seeding Realistic CRM Leads...
✓ Inserted 6 demo leads across all pipeline stages.
📄 Seeding Proposals...
📊 Seeding Quotations...
💳 Seeding Invoices...
📜 Seeding Contracts...
📅 Seeding Scheduled Meetings...
🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!
```

---

### Step 4: Running the Application

Start the local development server:
```bash
npm run dev
```

> **Fallback (Webpack)**: If Turbopack ever experiences an HMR lock on Windows, you can start the development server using Webpack:
> ```bash
> npm run dev:webpack
> ```

Open your browser and navigate to:
```text
http://localhost:3000
```

1. Click **Sign In** or go to `http://localhost:3000/login`.
2. Enter the seeded administrator credentials:
   - **Email**: `admin@leadaipro.com`
   - **Password**: `admin123456`
3. You will be redirected to the **LeadAI Pro Dashboard** with all analytics, leads, and pipeline stages fully populated!

---

## 🔑 API Keys Detailed Guide

Here is where and how to obtain each API key used by LeadAI Pro:

### 1. OpenAI API Key
- **Website**: [platform.openai.com](https://platform.openai.com/api-keys)
- **Steps**:
  1. Log in or create an account on OpenAI.
  2. Navigate to **API Keys** $\rightarrow$ Click **Create new secret key**.
  3. Copy the key (`sk-proj-...`).
  4. Go to **Settings $\rightarrow$ Billing** and ensure you have at least \$5 credit balance for GPT-4o API calls.
  5. Paste into `.env.local` as `OPENAI_API_KEY`.

---

### 2. Apify API Token
- **Website**: [console.apify.com](https://console.apify.com/account/integrations)
- **Steps**:
  1. Register for a free Apify account (\$5 free monthly credit included).
  2. Go to **Settings** $\rightarrow$ **Integrations** $\rightarrow$ **API tokens**.
  3. Copy your **Personal API Token** (`apify_api_...`).
  4. Paste into `.env.local` as `APIFY_API_TOKEN`.
- **Used For**:
  - `apify/website-content-crawler`: Used in `/audit` to scrape customer websites.
  - `compass/crawler-google-places`: Used in automated lead discovery.

---

### 3. Resend Email API Key
- **Website**: [resend.com](https://resend.com/api-keys)
- **Steps**:
  1. Sign up on Resend (Free tier includes 3,000 emails/month).
  2. Go to **API Keys** $\rightarrow$ Click **Create API Key**.
  3. Select **Sending access** (or Full access) and copy the key (`re_...`).
  4. Paste into `.env.local` as `RESEND_API_KEY`.
- **Note on `EMAIL_FROM`**:
  - In development/testing, keep `EMAIL_FROM=onboarding@resend.dev`. Note that Resend in test mode only delivers emails to the email address registered with your Resend account.
  - For production, go to **Domains** on Resend, verify your domain DNS records (SPF, DKIM), and update `EMAIL_FROM=sales@yourdomain.com`.

---

### 4. MongoDB Database URI
- **Local MongoDB**:
  - Install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
  - Default URI: `mongodb://localhost:27017/ai-leads-platform`
- **Cloud MongoDB Atlas (Free 512MB Cluster)**:
  1. Register at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
  2. Create a free **M0 Sandbox** cluster.
  3. Under **Database Access**, create a database user and password.
  4. Under **Network Access**, add IP `0.0.0.0/0` (Allow from anywhere).
  5. Click **Connect** $\rightarrow$ **Drivers** $\rightarrow$ Copy the connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-leads-platform?retryWrites=true&w=majority
     ```
  6. Paste it into `.env.local` as `MONGODB_URI`.

---

### 5. JWT Secret Key
- `JWT_SECRET` signs and verifies user login sessions.
- You can use any long, secure string (at least 32 characters) or generate one using Node:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Paste it into `.env.local` as `JWT_SECRET`.

---

## 🧭 Core Modules & Features Walkthrough

| Feature | URL | Description |
| :--- | :--- | :--- |
| **Executive Dashboard** | `/dashboard` | High-level metrics: Total Leads, Revenue Won, Pipeline Value, Conversion Rates, Recent Activities, and Quick Action buttons. |
| **Visual Kanban Pipeline** | `/pipeline` | Drag-and-drop board tracking leads from *New Lead* to *Won/Lost*. Shows card values, scores, and stage totals. |
| **Lead Directory & Profiles** | `/leads`, `/leads/[id]` | Search, filter by score (Hot/Warm/Cold), assign leads to team members, view AI analysis, requirements, and full audit trail. |
| **Interactive AI Chat Qualifier** | `/chat` | Conversational sales agent that asks targeted questions, qualifies budget and timeline, and automatically inserts the lead into the database. |
| **Apify & AI Website Audit** | `/audit` | Enter any URL. Apify crawls pages and OpenAI generates an audit report with scores for Performance, SEO, Security, and UX. |
| **Competitor Intelligence** | `/competitor` | Analyzes competitor websites to surface positioning weaknesses, technology stacks, and strategic opportunities. |
| **Project Cost Estimator** | `/estimator` | Generates detailed cost estimates, milestone phases, required team size, and tech stack recommendations. |
| **Proposals Engine** | `/proposals`, `/proposals/[id]` | Create structured proposals with executive summary, scope, timeline milestones, pricing, and one-click PDF download / email dispatch. |
| **Itemized Quotations** | `/quotations`, `/quotations/[id]` | Create line-item quotations with tax, discount, total calculations, and client delivery. |
| **Contracts & MSAs** | `/contracts`, `/contracts/[id]` | Master Services Agreements with customizable legal clauses (IP ownership, confidentiality, warranty) and digital signature states. |
| **Invoicing & Payments** | `/invoices`, `/invoices/[id]` | Issue professional invoices, log partial/full payments, track overdue balances, and export branded PDF invoices. |
| **Meetings Calendar** | `/meetings` | Schedule discovery calls, link Google Meet or Zoom links, and track participant responses. |
| **Email & Automations** | `/automation` | Monitor email delivery logs (Resend / SMTP), inspect webhook triggers, and retry failed transmissions. |
| **Platform Settings** | `/settings` | Update company details (Name, Address, Tax ID, Currency), adjust lead scoring weights, toggle automated emails, or update API keys. |

---

## 📦 Production Build & Deployment

To verify and prepare the application for production deployment:

1. **Test the build locally**:
   ```bash
   npm run build
   ```
   Next.js and Turbopack will compile all 42 routes and static pages.

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Deploying on Vercel**:
   - Push your repository to GitHub / GitLab.
   - Import the repository on [Vercel](https://vercel.com).
   - Add all environment variables from `.env.local` into the Vercel Project Settings $\rightarrow$ **Environment Variables**.
   - Note: For database on Vercel, use **MongoDB Atlas** (cloud URI) instead of `localhost`.

---

## ❓ Troubleshooting & FAQ

### 1. Hydration Mismatch Warning in Browser Console
- **Symptom**: `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties... data-covis-extension`
- **Cause**: Browser extensions (such as Grammarly, Covis, Dark Reader, Password Managers) inject custom attributes into `<html>` or `<body>` before React loads.
- **Resolution**: This is already handled in `app/layout.js` with `suppressHydrationWarning` on `<html>` and `<body>`.

### 2. Turbopack Stale Cache / PostCSS Error
- **Symptom**: `Error: Module [turbopack-node]/transforms/postcss.ts ... module factory is not available`
- **Resolution**:
  1. Stop your development server (`Ctrl + C`).
  2. Clear the `.next` build cache:
     ```powershell
     Remove-Item -Recurse -Force .next
     ```
  3. Hard refresh your browser (`Ctrl + Shift + R`).
  4. Restart with `npm run dev` (or `npm run dev:webpack`).

### 3. MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- **Symptom**: `Error: connect ECONNREFUSED 127.0.0.1:27017`
- **Resolution**:
  - Ensure MongoDB Windows Service is started:
    ```powershell
    net start MongoDB
    ```
  - Or verify MongoDB status in Windows Services (`services.msc` $\rightarrow$ "MongoDB Server").
  - Alternatively, use a free cloud database URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 4. Resend Error: `You can only send to your own email address`
- **Symptom**: Resend API returns HTTP 403 or error message during email sending in test mode.
- **Resolution**: In free tier without a custom verified domain, Resend only allows sending to the email address registered on your Resend account. To send to any client email in production, verify your custom domain in the Resend dashboard.

### 5. Apify Crawl Timeout
- **Symptom**: Audit crawl takes longer than 45 seconds.
- **Resolution**: Apify runs asynchronously in the background. The job ID is saved in MongoDB under `ApifyJob`, and results can be viewed once the actor run finishes.

---

## 👨‍💻 License & Author
- **Platform**: LeadAI Pro
- **License**: Proprietary / Enterprise Commercial License

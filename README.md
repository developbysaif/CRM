# ⚡ LeadAI Pro — Enterprise AI Lead Generation, CRM & Sales Automation Platform

> **Production-ready, multi-channel AI Sales Employee, Discovery Engine, 14-Stage Visual Pipeline, Human Approval Center, Automated Proposals, and Contract Generation System built with Next.js 16 (Turbopack), React 19, MongoDB (Mongoose 9 ODM), OpenAI GPT-4o, Google Places, and Tailwind CSS v4.**

---

## 📑 Table of Contents
1. [Platform Vision & Core Principles](#-platform-vision--core-principles)
   - [Zero Synthetic Data Policy](#zero-synthetic-data-policy)
   - [Human-in-the-Loop Approval Gating](#human-in-the-loop-approval-gating)
   - [Automated Lifecycle Triggers & Killswitches](#automated-lifecycle-triggers--killswitches)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [14-Stage Pipeline Lifecycle](#-14-stage-pipeline-lifecycle)
4. [Core Engines & Workflows](#-core-engines--workflows)
   - [1. Interactive AI Discovery Engine (`/discovery`)](#1-interactive-ai-discovery-engine-discovery)
   - [2. Multi-Key De-Duplication Engine](#2-multi-key-de-duplication-engine)
   - [3. 0–100 Digital Footprint Scoring Engine](#3-0100-digital-footprint-scoring-engine)
   - [4. Approval Center (`/approvals`)](#4-approval-center-approvals)
   - [5. 6-Tab Lead Intelligence Profile (`/leads/[id]`)](#5-6-tab-lead-intelligence-profile-leadsid)
   - [6. Multi-Channel Personalization & 5-Step Follow-Ups](#6-multi-channel-personalization--5-step-follow-ups)
   - [7. Inbound Reply Classifier (11 Intents)](#7-inbound-reply-classifier-11-intents)
   - [8. Automated Proposal & Contract Synthesizers](#8-automated-proposal--contract-synthesizers)
   - [9. Executive Command Center (`/chat`)](#9-executive-command-center-chat)
   - [10. Geospatial Map View (`/leads/map`)](#10-geospatial-map-view-leadsmap)
5. [Prerequisites & Installation](#-prerequisites--installation)
6. [Environment Variables Reference (`.env.local`)](#-environment-variables-reference-envlocal)
7. [Automated Verification Suite (`npm run verify`)](#-automated-verification-suite-npm-run-verify)
8. [Production Build & Vercel Deployment](#-production-build--vercel-deployment)
   - [Vercel Cron Configuration](#vercel-cron-configuration)
9. [API Reference Directory](#-api-reference-directory)

---

## 🛡️ Platform Vision & Core Principles

LeadAI Pro operates as an autonomous **AI Sales Employee** for digital agencies, software companies, and B2B consultancies, while guaranteeing strict regulatory compliance and human agency.

### Zero Synthetic Data Policy
- **Strictly Enforced**: The platform prohibits the creation or display of fake fallback leads (e.g. fabricated company names).
- If an external provider (Google Places API, Apify, or Hunter) does not return an email, phone, or rating, the system persists `null` and assigns appropriate scoring penalties.
- Leads originate exclusively from verified real-world sources or user entry.

### Human-in-the-Loop Approval Gating
- Cold emails, LinkedIn messages, WhatsApp pitches, proposals, and contracts **NEVER** auto-dispatch without explicit human consent.
- Generated items enter the **Approval Center (`/approvals`)** with status `approval_required` (or `Draft`).
- Operators can inspect the AI's rationale, edit subjects and body text directly, reject drafts with notes, or trigger individual or bulk `[Approve & Send]`.

### Automated Lifecycle Triggers & Killswitches
1. **Inbound Reply Trigger**: When an inbound email arrives via webhook or simulator, an AI classifier tags it with one of 11 intents.
   - If classified as `Interested` or `Price Request`, the lead stage automatically advances to `Interested`, and a customized **Draft Proposal** is generated and queued in the Approval Center.
   - If classified as `Unsubscribe`, the contact is immediately added to the `SuppressionList` and marked `Do Not Contact`.
2. **Closed Won Trigger**: When any lead moves to `Closed Won` on the Kanban board:
   - A legally structured **Draft Contract** is automatically created.
   - An immediate high-priority **CRM Owner Alert Notification** is dispatched.
3. **Follow-Up Sequence Killswitch**:
   - The moment a client replies, requests an unsubscribe, or the lead stage transitions to terminal stages (`Closed Won`, `Closed Lost`, `Do Not Contact`), **all pending follow-up steps (Steps 1–5) are automatically cancelled immediately**.

---

## 🛠 Tech Stack & Architecture

- **Framework**: Next.js 16.2.10 (App Router, Turbopack, Server Components, Route Handlers)
- **Frontend UI**: React 19, Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans
- **Database**: MongoDB with Mongoose 9 ODM (Indexes across 5 dedup keys, strict schemas)
- **AI Intelligence**: OpenAI SDK (GPT-4o) with graceful rule-based fallbacks on rate limits / quota exhaustion
- **Web Crawling & Data Mining**: Apify API (`compass/crawler-google-places`, `apify/website-content-crawler`)
- **Geocoding & Discovery**: Google Places TextSearch & Place Details API (Provider Interface)
- **Email Delivery**: Resend SDK & Nodemailer (SMTP fallback)
- **Visualizations**: Recharts 3 (Quality distribution, Monthly trends, Funnel analysis)
- **Documents & Export**: jsPDF & html2canvas (One-click PDF client proposals & invoices)

---

## 📊 14-Stage Pipeline Lifecycle

The Kanban board (`/pipeline`) provides native HTML5 drag-and-drop management across the full lifecycle:

| Stage | Trigger / Behavior |
| :--- | :--- |
| **New Lead** | Freshly discovered or imported business lead. |
| **Qualified** | Verified contact info and lead score $\ge 60$. |
| **Contacted** | First outreach approved and dispatched. |
| **Replied** | Client replied to initial communication. |
| **Interested** | AI classifier detected buying intent $\rightarrow$ Auto-generates Draft Proposal. |
| **Meeting** | Discovery or demo call scheduled on calendar. |
| **Proposal Sent** | Proposal reviewed, approved, and delivered to client. |
| **Negotiation** | Client is discussing scope, timeline, or price. |
| **Closed Won** | Deal closed! $\rightarrow$ Auto-synthesizes Draft Contract & Owner Alert. |
| **Contract Sent** | Contract submitted to client for digital signature. |
| **Contract Signed** | Agreement executed by both parties. |
| **Payment Pending**| Invoice issued; waiting for funds transfer. |
| **Paid** | Invoice marked as paid; revenue logged to dashboard. |
| **Completed** | Project delivered successfully. |
| **Closed Lost** | Deal did not materialize $\rightarrow$ Cancels follow-ups. |
| **Do Not Contact** | Unsubscribed or opted out $\rightarrow$ Suppresses all communications. |

---

## ⚙️ Core Engines & Workflows

### 1. Interactive AI Discovery Engine (`/discovery`)
- Modeled as an autonomous **AI Sales Employee**.
- Prompts for Target Industry, City/Region, Radius (km), Minimum Reviews, and Missing Website filter.
- Users can choose between **Google Places API** or **Apify Google Places Crawler**.
- Automatically invokes the Multi-Key De-Duplication Engine before saving to MongoDB.

### 2. Multi-Key De-Duplication Engine
De-duplicates every incoming lead across **5 distinct keys**:
1. **Email Address** (Case-insensitive)
2. **Phone Number** (Normalized digit comparison)
3. **Domain / Website** (Hostname extraction without `www.` or trailing slashes)
4. **Google Place ID** (Unique Google Maps identifier)
5. **Company Name + Address** (Fuzzy normalized alphanumeric matching)

### 3. 0–100 Digital Footprint Scoring Engine
Calculates an objective score to identify high-value prospects:
- **Website Missing**: `+25 pts` (Highest pitch opportunity)
- **Poor Website / Outdated**: `+20 pts`
- **Subpar Mobile Experience**: `+10 pts`
- **Weak SEO / Low Ranking**: `+10 pts`
- **Low Performance / Core Web Vitals**: `+10 pts`
- **High Review Volume ($\ge 15$ Google reviews)**: `+5 pts` (Proven customer traffic)
- **High-Ticket Industry**: `+5 pts` (Dental, Legal, Restaurant, Real Estate, Healthcare, SaaS)
- **Direct Phone Available**: `+5 pts`
- **Verified Email Available**: `+5 pts`
- **Buying Signal Rating ($\ge 4.0\star$ without modern site)**: `+5 pts`
- Lead Status thresholds: **Hot** ($\ge 80$), **Warm** ($60 - 79$), **Cold** ($< 60$).

### 4. Approval Center (`/approvals`)
- Central command station for all outgoing communications.
- Real-time pending counter badge displayed in the navigation sidebar.
- Tabs for **All**, **Messages**, **Proposals**, **Contracts**, and **Bulk Campaigns**.
- Explains the AI's contextual reasoning (e.g. *"Target has 4.8-star rating on Google but lacks a mobile-friendly site"*).
- Direct **[Edit Draft]** modal allowing operators to customize messaging.
- **[Approve & Send]** and **[Approve All Selected]** actions with instant suppression validation.

### 5. 6-Tab Lead Intelligence Profile (`/leads/[id]`)
Comprehensive 360-degree view of every prospect:
1. **AI Personalization & Outreach**: Cold email pitch, LinkedIn connection note, WhatsApp icebreaker.
2. **Email Communication Timeline**: Gmail-style threaded conversation view with sent/received status and intent badges.
3. **Website & SEO Audit**: Performance, SEO, Mobile, Accessibility, and Security scores with actionable recommendations.
4. **Automated Follow-Up Sequence**: Visual timeline of all 5 scheduled steps with status (Pending, Sent, Cancelled).
5. **Proposals & Contracts**: All draft and signed documentation linked directly to the lead.
6. **Lead Overview**: Contact details, social profiles, tags, and timeline activity logs.

### 6. Multi-Channel Personalization & 5-Step Follow-Ups
Generates targeted drafts leveraging the lead's real business metrics:
- **Cold Email**: Pain-point hook tailored to their missing or slow website.
- **LinkedIn Note**: Professional networking message under 300 characters.
- **WhatsApp Pitch**: Casual, high-conversion mobile icebreaker.
- **5-Step Automated Sequence**:
  - *Step 1 (+7 days)*: Reminder / Value Angle
  - *Step 2 (+14 days)*: Specific Business Opportunity
  - *Step 3 (+21 days)*: Case Study / Social Proof
  - *Step 4 (+28 days)*: Final Value Proposition
  - *Step 5 (+35 days)*: Breakup / Respectful Final Follow-up

### 7. Inbound Reply Classifier (11 Intents)
Parses inbound client messages using GPT-4o into one of 11 distinct commercial intents:
1. `Interested` (Triggers Proposal creation & stage advancement)
2. `Price Request` (Triggers Proposal creation & stage advancement)
3. `Meeting Request`
4. `Question`
5. `Negotiation`
6. `Not Interested`
7. `Out of Office`
8. `Wrong Person`
9. `Already Has Provider`
10. `Unsubscribe` (Triggers SuppressionList entry & stage update)
11. `Spam`

### 8. Automated Proposal & Contract Synthesizers
- **Proposal Synthesizer**: Compiles problem statement, recommended digital transformation, service items, timeline milestones, and payment schedule based on the configured services pricing catalog.
- **Contract Synthesizer**: Generates Master Services Agreements with custom legal clauses (Scope of Work, Ownership of Deliverables, Confidentiality, Warranties, Termination, Governing Law).

### 9. Executive Command Center (`/chat`)
Dual-mode conversational AI:
- **Executive CRM Assistant**: Ask questions in natural language (*"Show me warm restaurant leads in London"*, *"Create a proposal for SkyNet Solutions"*, *"What is my pipeline value?"*).
- **Public Lead Qualifier Bot**: Embeddable website widget that interviews prospects, scores them, and creates leads automatically.

### 10. Geospatial Map View (`/leads/map`)
Interactive color-coded map plotting all leads with coordinates:
- Hot leads (Red), Warm leads (Amber), Cold leads (Blue).
- Filter by industry, city, or status with one-click lead profile cards.

---

## 📋 Prerequisites & Installation

### Requirements
- **Node.js**: `v18.18.0` or higher (Tested on Node `24.x` and `22.x LTS`).
- **MongoDB**: Local Community Server (`mongodb://localhost:27017`) or Cloud MongoDB Atlas.

### Quick Setup
```bash
# 1. Clone repository
git clone https://github.com/developbysaif/CRM.git
cd CRM

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Seed database with admin user and sample pipeline data
npm run seed

# 5. Run the comprehensive test suite
npm run verify

# 6. Start the development server
npm run dev
```

Visit `http://localhost:3000` and sign in:
- **Email**: `admin@leadaipro.com`
- **Password**: `admin123456`

---

## 🔑 Environment Variables Reference (`.env.local`)

| Variable | Required | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | **Yes** | MongoDB connection string | `mongodb://localhost:27017/ai-leads-platform` |
| `JWT_SECRET` | **Yes** | 32+ character key for signing auth tokens | `leadai_pro_super_secret_jwt_key_2026` |
| `OPENAI_API_KEY` | Recommended | OpenAI key for GPT-4o generation & classification | `sk-proj-...` |
| `OPENAI_MODEL` | Optional | OpenAI model identifier | `gpt-4o` |
| `APIFY_API_TOKEN` | Recommended | Apify token for Google Places & web scraper | `apify_api_...` |
| `GOOGLE_MAPS_API_KEY` | Optional | Google Places TextSearch & Details API key | `AIzaSy...` |
| `RESEND_API_KEY` | Optional | Resend API key for transactional email dispatch | `re_...` |
| `EMAIL_FROM` | Optional | Sender address for outbound email | `onboarding@resend.dev` |
| `CRON_SECRET` | Optional | Secret key to authorize automated cron runs | `cron_secret_key_...` |
| `NEXT_PUBLIC_APP_URL` | Optional | Public application base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME`| Optional | Branding name for CRM | `LeadAI Pro` |

> **Security Note**: In `/settings`, all stored API keys are masked (`sk-***1234`). When saving settings, masked values are automatically preserved to avoid accidental overwrites.

---

## 🧪 Automated Verification Suite (`npm run verify`)

The platform includes an automated end-to-end verification script testing all core backend engines against live MongoDB:

```bash
npm run verify
```

### Verification Checks:
1. **[1/9] MongoDB Connection**: Verifies live database connectivity.
2. **[2/9] Multi-Key De-Duplication**: Tests uniqueness detection across email, phone, domain, and Google Place ID.
3. **[3/9] 0–100 Lead Scoring**: Confirms digital footprint weighting and score assignment.
4. **[4/9] Multi-Channel Personalization**: Verifies email subject, body, and 5-step follow-up schedule generation.
5. **[5/9] Approval Center Gating**: Proves outreach is placed in `approval_required` status with zero auto-send.
6. **[6/9] Inbound Reply Classifier**: Tests 11-intent AI classification and stage advancement.
7. **[7/9] Proposal Synthesizer**: Validates automated `Draft` proposal generation with itemized pricing.
8. **[8/9] Contract Synthesizer & Owner Alert**: Confirms `Closed Won` triggers a `Draft` contract and owner alert.
9. **[9/9] Follow-Up Killswitch**: Proves scheduling of 5 steps and immediate cancellation upon client reply.

---

## 🚀 Production Build & Vercel Deployment

### Local Production Build
```bash
npm run build
npm start
```
*Output: All 50 App Router routes compile cleanly with Next.js Turbopack.*

### Vercel Deployment
1. Connect your repository to [Vercel](https://vercel.com).
2. Configure your Environment Variables in **Project Settings $\rightarrow$ Environment Variables**.
3. Use a cloud MongoDB connection string (e.g. MongoDB Atlas).

### Vercel Cron Configuration
To run the automated follow-up processor and overdue contract reminders automatically, add the following to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/automation/cron",
      "schedule": "0 * * * *"
    }
  ]
}
```

The endpoint `/api/automation/cron` will run every hour, checking for:
- Due follow-up steps ready for dispatch.
- Overdue proposals and contracts awaiting client signature.
- Expired suppressions and unsubscribes.

---

## 📡 API Reference Directory

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/discovery/search` | `POST` | Discovers leads via Google Places / Apify with 5-key deduplication. |
| `/api/approvals` | `GET`, `POST` | Lists pending approval queue items; approves, edits, rejects, or bulk-approves. |
| `/api/leads/[id]/personalize` | `POST` | Generates cold email, LinkedIn, WhatsApp drafts and queues in Approval Center. |
| `/api/email/inbound` | `POST` | Receives inbound email replies, triggers 11-intent classifier and stage advancement. |
| `/api/email/threads/[leadId]` | `GET`, `POST` | Retrieves Gmail-style conversation timeline or records an outbound/inbound message. |
| `/api/automation/cron` | `GET`, `POST` | Background worker executing due follow-ups and stage checks. |
| `/api/unsubscribe/[token]` | `GET` | Handles one-click unsubscribe links and records suppression. |
| `/api/chat/command` | `POST` | AI Executive Command Center executing safe CRM queries and document operations. |
| `/api/dashboard/stats` | `GET` | Calculates conversion rates, pipeline values, funnel breakdown, and monthly trends. |
| `/api/proposals` | `GET`, `POST` | Creates proposals in `Draft` status without auto-dispatching. |
| `/api/contracts` | `GET`, `POST` | Creates Master Services Agreements in `Draft` status. |
| `/api/settings` | `GET`, `PUT` | Manages masked API keys, services pricing catalog, and approval switches. |

---

## 👨‍💻 License & Authorship
- **Platform**: LeadAI Pro
- **Architecture**: Enterprise Agentic Sales Platform
- **Repository**: [developbysaif/CRM](https://github.com/developbysaif/CRM)
- **License**: Proprietary / Commercial License

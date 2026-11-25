# TrustTrack: AI Loan Decision Monitoring & Accountability Platform

TrustTrack is an enterprise-grade AI accountability and monitoring platform built for **loan application decision-making**.

It monitors AI-generated loan recommendations, verifies them against configurable loan policies, detects potential AI-policy discrepancies, escalates flagged applications for mandatory human review, and maintains a tamper-evident SHA-256 hash-chained audit history with downloadable certified PDF compliance reports.

---

## 🎨 UI & Design System

Designed to an ultra-premium dark-mode FinTech aesthetic:

- **Obsidian dark theme:** `#0A0A0E` base with frosted glass cards (`rgba(18, 18, 24, 0.75)` and `backdrop-filter: blur(16px)`)
- **Ambient lighting:** Warm sunset-orange and amber radial gradient backdrops (`#FF5B26` / `#FF7A00`)
- **High-contrast indicators:**
  - Emerald green for policy passes
  - Warm amber for pending documentation
  - Crimson for high-severity AI-policy mismatches
- **Glassmorphic authentication:** Centered frosted login card with one-click role demo access, Google Workspace, and Bank SSO
- **Interactive visualizations:** Recharts area, donut, and bar charts for real-time portfolio analytics

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Lucide React, Recharts |
| Backend & Database | Supabase (PostgreSQL, Row Level Security, Storage, Edge Functions) |
| AI Model | Google Gemini (`gemini-1.5-pro` & `gemini-1.5-flash`) via structured JSON output and Supabase Edge Functions |
| Audit Integrity | SHA-256 hash chaining using the Web Crypto API |
| PDF Generation | `jspdf` vector reports across 8 compliance sections |
| Voice Assistant | Web Speech API (SpeechRecognition & SpeechSynthesis) with conversational intent mapping |

---

## 🚀 Key Modules & Capabilities

### 1. AI Workspace (Main Feature)

- Claude-like conversational interface for loan underwriters
- **Multi-applicant profile parser:** Paste multiple applicants in one prompt (e.g., `Applicant ID: LN001... Applicant ID: LN002...`)
- Automated parameter validation, disposable income check, and DTI ratio calculation
- Google Gemini evaluation returning structured factors, confidence scores, and recommendations:
  - `Recommended`
  - `Not Recommended`
  - `Needs More Information`
  - `Inconclusive`
- **Original AI recommendations are stored immutably and never overwritten**

### 2. Risk Engine & Policy Verification

Independent algorithmic verification against configurable loan policies:

| Policy | Default Threshold |
|---|---|
| Minimum monthly income | ₹40,000 (illustrative) |
| Maximum debt-to-income (DTI) | 35% |
| Minimum credit bureau score | 650 |
| Verifiable income proof | Mandatory verified salary slips or ITR |

**Four detection scenarios:**

1. **Potential AI-policy mismatch:** AI rejects an applicant who passes all configured policies (high-severity model hallucination or bias flag)
2. **Policy failure:** Quantitative comparison between the applicant's actual value and the configured threshold
3. **Insufficient information:** Missing documents or undeclared debt are marked `INSUFFICIENT DATA` and never automatically classified as failures
4. **AI recommends over policy failure:** AI gives a positive recommendation to an applicant breaching policies (high-severity escalation)

### 3. Human Review Engine

All flagged applications enter the dedicated Underwriting Review Queue.

**Reviewer actions:**

- `CONFIRM_AI`: Confirm the AI recommendation based on evidence
- `OVERRIDE_AI`: Record a contrary assessment with a **mandatory rationale**
- `REQUEST_EVIDENCE`: Request missing documentation (ITR filings, bank statements)
- `PLACE_ON_HOLD`: Hold the case pending credit bureau tradeline disputes
- `MARK_INCONCLUSIVE`: Flag insufficient data to conclude debt serviceability

A side-by-side view compares original AI decisions against human review findings.

### 4. Audit Engine & PDF Report Generator

- Append-only audit event log
- **SHA-256 hash chaining:** Every event references the cryptographic hash of the previous event
- In-browser verification tool that detects tampering in historical audit records
- **8-section certified PDF report:**
  1. Report information & ID
  2. Applicant financial profile
  3. Original AI recommendation (immutable record)
  4. Loan policy verification results
  5. Risk analysis & mismatch discrepancies
  6. Human review findings & mandatory rationales
  7. Chronological events with SHA-256 signatures
  8. Statutory regulatory notice & disclaimer

### 5. Interactive Dashboard

- Real-time statistics pulled directly from database records
- **Summary metrics:** Total applications, AI recommended, AI rejected, flagged applications, pending reviews, resolved cases
- **Time period filters:** 1 month, 3 months, 6 months, 1 year
- **Recharts visualizations:** Application ingestion volume, AI decision distribution, risk severity profiles, and human underwriter verdicts

### 6. Voice Assistant

- Hands-free queries using browser Speech Recognition and Speech Synthesis
- Recognizes underwriting queries, for example:
  - *"How many applications are flagged?"*
  - *"Show pending human reviews"*
  - *"Explain applicant LN006 risk alert"*
- Navigates to the requested queue. A text fallback is provided for unsupported browsers.

### 7. Loan Policy Management (Admin Only)

- Administrative control over credit risk policies
- **Immutable policy versioning:** Editing any threshold increments the policy version (`v1` → `v2`) and requires a mandatory change explanation
- Historical verification records remain tied to the exact policy version in effect at the time of evaluation

---

## 📋 Seed Data: 10 Demonstration Scenarios

TrustTrack ships with 10 fictional applicants covering the critical underwriting situations:

| ID | Applicant | Scenario | AI Decision | Status |
|---|---|---|---|---|
| LN001 | Arun Kumar | Meets all policies (Income ₹65k, DTI 18.46%, Credit 750) | Recommended | Clean, fully approved |
| LN002 | Priya Sharma | Low credit score (580 < 650) | Not Recommended | Policy failure |
| LN003 | Rahul Verma | High DTI (48% > 35%) | Not Recommended | Policy failure |
| LN004 | Ananya Sen | Insufficient income (₹28k < ₹40k) | Not Recommended | Policy failure |
| LN005 | Vikram Patel | Missing income proof (self-employed) | n/a | Insufficient data / evidence requested |
| LN006 | Deepa Nair | **Potential AI-policy mismatch.** Passes all 4 policies (Income ₹72k, DTI 19.44%, Credit 760, proof available). AI rejected due to uncalibrated sector volatility | Not Recommended | ⚠️ High-severity review |
| LN007 | Karthik Raja | **AI recommends over policy failure.** DTI 47.37% and credit 610, yet AI recommended based on qualitative sentiment | Recommended | ⚠️ High-severity review |
| LN008 | Sneha Reddy | Incomplete information (undeclared debt) | n/a | DTI marked `INSUFFICIENT DATA` |
| LN009 | Manoj Tiwari | High-ticket loan (₹9,00,000) requiring audited balance sheet certification | n/a | On hold |
| LN010 | Farhan Akhtar | Freelance income with quarterly volatility | Inconclusive | Under investigation |

---

## 💻 Local Development Setup

### Prerequisites

- Node.js 18+ or 20+
- npm or pnpm

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
```

---

## 🗄️ Supabase Backend Deployment

### 1. Database Schema

Run the migration script in your Supabase SQL Editor:

```
supabase/migrations/20260301000000_create_trusttrack_schema.sql
```

This creates all PostgreSQL tables, foreign keys, check constraints, append-only rules, and Row Level Security (RLS) policies.

### 2. Edge Functions

Deploy the functions:

```bash
supabase functions deploy analyse-loan-applications
supabase functions deploy verify-loan-policy
supabase functions deploy generate-risk-alerts
supabase functions deploy submit-human-review
supabase functions deploy voice-assistant
```

Store your Gemini API key in Supabase secrets:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

> **Note:** If no remote Supabase instance or Gemini API key is provided, TrustTrack runs on its built-in offline sync engine with local persistence, full SHA-256 hash chaining, and verified underwriting simulations.

---

## 🛡️ Statutory & Compliance Disclaimer

TrustTrack is an advisory AI monitoring, verification, and accountability system. AI recommendations generated by Gemini and evaluated by the Risk Engine do not constitute final loan approvals or statutory rejections. All formal loan sanctions require review and authorization by certified credit underwriting authorities.

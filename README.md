# TrustTrack – AI Loan Decision Monitoring & Accountability Platform

TrustTrack is an enterprise-grade AI accountability and monitoring platform built specifically for **loan application decision-making**.

The platform monitors AI-generated loan recommendations, verifies them against configurable loan policies, detects potential AI-policy discrepancies, escalates flagged applications for mandatory human review, and maintains a tamper-evident SHA-256 hash-chained audit history with downloadable certified PDF compliance reports.

---

## 🎨 UI & Aesthetic Design System

Designed in accordance with the requested ultra-premium dark-mode FinTech aesthetic:
- **Obsidian Dark Theme**: `#0A0A0E` base with frosted glass cards (`rgba(18, 18, 24, 0.75)` and `backdrop-filter: blur(16px)`).
- **Ambient Lighting**: Warm sunset-orange & amber radial gradient mesh backdrops (`#FF5B26` / `#FF7A00`).
- **High-Contrast Indicators**: Emerald green for policy passes, warm amber for pending documentation, and crimson for high-severity AI-policy mismatches.
- **Glassmorphic Authentication**: Centered frosted login card with 1-click role demo access, Google Workspace, and Bank SSO.
- **Interactive Visualizations**: Recharts Area, Donut, and Bar charts for real-time portfolio analytics.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Storage, Edge Functions).
- **AI Model**: Google Gemini (`gemini-1.5-pro` & `gemini-1.5-flash`) via structured JSON output and Supabase Edge Functions.
- **Audit Integrity**: Cryptographic SHA-256 hash chaining using Web Crypto API.
- **PDF Generation**: `jspdf` vector report generation across 8 compliance sections.
- **Voice Assistant**: Web Speech API (SpeechRecognition & SpeechSynthesis TTS) with conversational intent mapping.

---

## 🚀 Key Modules & Capabilities

### 1. AI Workspace (Main Feature)
- Claude-like conversational interface for loan underwriters.
- **Multi-applicant profile parser**: Paste multiple applicants in a single prompt (e.g. `Applicant ID: LN001... Applicant ID: LN002...`).
- Automated parameter validation, disposable income check, and DTI ratio calculation.
- Google Gemini evaluation returning structured factors, confidence scores, and recommendations (`Recommended`, `Not Recommended`, `Needs More Information`, `Inconclusive`).
- **Original AI recommendations are stored immutably and never overwritten**.

### 2. Risk Engine & Policy Verification
- Independent algorithmic verification against configurable loan policies:
  - **Minimum Monthly Income**: Illustrative threshold ₹40,000.
  - **Maximum Debt-to-Income (DTI)**: Maximum ceiling 35%.
  - **Minimum Credit Bureau Score**: Minimum benchmark 650.
  - **Verifiable Income Proof**: Mandatory verified salary slips / ITR.
- **4 Detection Scenarios**:
  - **Scenario 1 (Potential AI-Policy Mismatch)**: AI rejects an applicant who passes all configured policies (High Severity model hallucination / bias flag).
  - **Scenario 2 (Policy Failure)**: Quantitative comparison between applicant actual value and configured threshold.
  - **Scenario 3 (Insufficient Information)**: Missing documents or unstated debt are explicitly marked `INSUFFICIENT DATA` (never automatically classified as a failure).
  - **Scenario 4 (AI Recommends over Policy Failure)**: AI gives a positive recommendation to an applicant breaching policies (High Severity escalation).

### 3. Human Review Engine
- All flagged applications enter the dedicated Underwriting Review Queue.
- Reviewer actions:
  - `CONFIRM_AI`: Reviewer confirms the AI recommendation based on evidence.
  - `OVERRIDE_AI`: Reviewer records a contrary assessment with **mandatory rationale**.
  - `REQUEST_EVIDENCE`: Requests missing documentation (ITR filings, bank statements).
  - `PLACE_ON_HOLD`: Holds case pending credit bureau tradeline disputes.
  - `MARK_INCONCLUSIVE`: Flags insufficient data to conclude debt serviceability.
- Side-by-side view comparing original AI decisions against human review findings.

### 4. Audit Engine & PDF Report Generator
- Append-only audit events log.
- **SHA-256 Hash Chaining**: Every event references the cryptographic hash of the previous event.
- In-browser verification tool detects any tampering in historical audit records.
- **8-Section Certified PDF Report**:
  - Section 1: Report Information & ID
  - Section 2: Applicant Financial Profile
  - Section 3: Original AI Recommendation (Immutable Record)
  - Section 4: Loan Policy Verification Results
  - Section 5: Risk Analysis & Mismatch Discrepancies
  - Section 6: Human Review Findings & Mandatory Rationales
  - Section 7: Chronological Events with SHA-256 Signatures
  - Section 8: Statutory Regulatory Notice & Disclaimer

### 5. Interactive Dashboard
- Real-time statistics retrieved directly from database records.
- Summary metrics: Total applications, AI recommended, AI rejected, flagged applications, pending reviews, resolved cases.
- Time period filters (1 Month, 3 Months, 6 Months, 1 Year).
- Recharts visualizations: Application ingestion volume, AI decision distribution, risk severity profiles, and human underwriter verdicts.

### 6. Voice Assistant
- Hands-free voice queries using browser Speech Recognition and Speech Synthesis.
- Recognizes underwriting queries (e.g., *"How many applications are flagged?"*, *"Show pending human reviews"*, *"Explain applicant LN006 risk alert"*).
- Navigates seamlessly to the requested queue. Text fallback provided for unsupported browsers.

### 7. Loan Policy Management (Admin Exclusive)
- Administrative control over credit risk policies.
- **Immutable Policy Versioning**: Editing any threshold increments the policy version (`v1` &rarr; `v2`) and requires a mandatory change explanation.
- Historical verification records remain tied to the exact policy version in effect at the time of evaluation.

---

## 📋 10 Comprehensive Initial Scenarios (Seed Data)

TrustTrack ships with 10 fictional demonstration applicants representing every critical underwriting situation:

1. **LN001 – Arun Kumar**: Meets all configured policies (Income: ₹65k, DTI: 18.46%, Credit: 750). AI: Recommended. Clean, fully approved.
2. **LN002 – Priya Sharma**: Low credit score (580 < 650). AI: Not Recommended. Policy Failure.
3. **LN003 – Rahul Verma**: High DTI ratio (48% > 35%). AI: Not Recommended. Policy Failure.
4. **LN004 – Ananya Sen**: Insufficient income (₹28k < ₹40k). AI: Not Recommended. Policy Failure.
5. **LN005 – Vikram Patel**: Missing income proof (Self-employed). Status: Insufficient Data / Evidence Requested.
6. **LN006 – Deepa Nair**: **POTENTIAL AI-POLICY MISMATCH**. Passes all 4 policies (Income: ₹72k, DTI: 19.44%, Credit: 760, Proof: Available). AI rejected due to uncalibrated sector volatility. High Severity Review!
7. **LN007 – Karthik Raja**: **AI RECOMMENDS OVER POLICY FAILURE**. DTI 47.37% & Credit 610, yet AI recommended based on qualitative sentiment. High Severity Review!
8. **LN008 – Sneha Reddy**: Incomplete financial information (Undeclared debt). Marked `INSUFFICIENT DATA` on DTI.
9. **LN009 – Manoj Tiwari**: High-ticket loan (₹9,00,000) requiring audited balance sheet certification. Status: On Hold.
10. **LN010 – Farhan Akhtar**: Freelance income with quarterly volatility. AI: Inconclusive. Status: Under Investigation.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Supabase Backend Deployment

### 1. Database Schema
Execute the complete migration script located at:
`supabase/migrations/20260301000000_create_trusttrack_schema.sql` in your Supabase SQL Editor.

This creates all PostgreSQL tables, foreign keys, check constraints, append-only rules, and Row Level Security (RLS) policies.

### 2. Supabase Edge Functions
Deploy the functions to your Supabase project:
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
Copy `.env.example` to `.env` and fill in your Supabase URL and Anon Key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

*Note: If no remote Supabase instance or Gemini API key is provided, TrustTrack seamlessly operates using its built-in offline synchronization engine with local persistence, full SHA-256 hash chaining, and verified underwriting simulations.*

---

## 🛡️ Statutory & Compliance Disclaimer

TrustTrack is an advisory AI monitoring, verification, and accountability system. AI recommendations generated by Gemini and evaluated by the Risk Engine do not constitute final loan approvals or statutory rejections. All formal loan sanctions require review and authorization by certified credit underwriting authorities.

# Trusttrack2.0
#   T r u s t t r a c k 2 . 0  
 #   T r u s t t r a c k 3 . 0  
 
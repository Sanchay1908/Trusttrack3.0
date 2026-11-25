import React from 'react';
import {
  ShieldCheck,
  Bot,
  Scale,
  UserCheck,
  Link2,
  SlidersHorizontal,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  TriangleAlert,
  CircleCheck
} from 'lucide-react';
import './landing.css';

export interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onSignUp }) => {
  const handleScrollTo = (id: string) => {
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-slate-100 relative">
      {/* Decorative backdrop: ambient-mesh + blurred orange & amber blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="ambient-mesh" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FF5B26]/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FF8A00]/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 1. Sticky Navigation */}
        <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.07] backdrop-blur-md">
          <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left: Logo Tile & Wordmark */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5B26] to-[#FF8A00] flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="tt-landing-wordmark text-lg font-bold text-white tracking-tight">
                TrustTrack
              </span>
            </div>

            {/* Center: In-page navigation links (md and up only) */}
            <div className="hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScrollTo('features')}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none rounded-lg"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => handleScrollTo('how-it-works')}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none rounded-lg"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => handleScrollTo('safeguards')}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none rounded-lg"
              >
                Safeguards
              </button>
            </div>

            {/* Right: Auth buttons (all screen sizes) */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onSignIn}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={onSignUp}
                className="min-h-[44px] px-4 py-2.5 rounded-xl btn-primary-orange text-xs uppercase tracking-wider font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none"
              >
                Sign Up
              </button>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          {/* 2. Hero Section */}
          <section aria-labelledby="hero-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Left Column */}
              <div className="lg:col-span-7 flex flex-col items-start text-left tt-landing-animate">
                {/* Badge Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
                  <Sparkles className="w-4 h-4 text-[#FF7A00] animate-subtle-pulse" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-300 tracking-wide">
                    AI loan decision accountability
                  </span>
                </div>

                {/* H1 Headline */}
                <h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
                  Hold every AI loan decision accountable.
                </h1>

                {/* Sub-headline */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-2xl">
                  TrustTrack monitors AI-generated loan recommendations, verifies them against your loan policies, escalates mismatches for human review, and keeps a tamper-evident, hash-chained audit trail.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-4">
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl btn-primary-orange text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none"
                  >
                    <span>Sign Up</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none"
                  >
                    Sign In
                  </button>
                </div>

                {/* Advisory Notice */}
                <p className="text-xs text-slate-400">
                  Advisory AI monitoring. Final loan sanctions always require certified human authorization.
                </p>
              </div>

              {/* Hero Right Column: Product Preview Card */}
              <div className="lg:col-span-5 tt-landing-animate tt-landing-delay-1">
                <div
                  aria-hidden="true"
                  className="glass-panel-elevated rounded-2xl p-6 border border-white/[0.1] shadow-card-dark relative"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white tracking-tight">Risk alert</h3>
                        <p className="text-[11px] text-slate-400">
                          Applicant <span className="tt-landing-mono text-slate-300 font-medium">LN006</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                      Illustrative example
                    </span>
                  </div>

                  {/* Card Key Metrics */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-xs text-slate-400">AI recommendation</span>
                      <span className="text-xs font-semibold text-rose-400">Not Recommended</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-xs text-slate-400">Policy checks</span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CircleCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        4 of 4 passed
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200">Potential AI–policy mismatch</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          High severity
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-xs text-slate-400">Status</span>
                      <span className="text-xs font-semibold text-[#FF7D47]">
                        Escalated to human review
                      </span>
                    </div>
                  </div>

                  {/* Card Audit Hash Footer */}
                  <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-1 text-[11px]">
                    <span className="text-slate-400">Audit hash (example)</span>
                    <span className="tt-landing-mono text-[10px] text-slate-300 break-all bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/[0.05]">
                      sha256: 9f2c…a41e
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Capability Strip */}
          <section aria-label="Key capabilities" className="border-y border-white/[0.07] bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-slate-300 text-center">
                <span>4 policy checks</span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span>4 mismatch scenarios</span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span>5 reviewer actions</span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span>8-section PDF report</span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span className="tt-landing-mono">SHA-256 audit chain</span>
              </div>
            </div>
          </section>

          {/* 4. Features Section */}
          <section id="features" aria-labelledby="features-heading" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FF7A00]">
                  Core Capabilities
                </span>
              </div>
              <h2 id="features-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Everything you need to monitor AI lending decisions.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FF5B26]/10 border border-[#FF5B26]/20 text-[#FF7A00] flex items-center justify-center mb-5">
                    <Bot className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">AI Workspace</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Paste one or many applicant profiles and get structured recommendations with factors and confidence scores. Original AI recommendations are stored immutably and never overwritten.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                    <Scale className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Risk Engine</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Every recommendation is independently verified against your configurable loan policies: monthly income, debt-to-income ratio, credit score and income proof.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                    <UserCheck className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Human Review</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Flagged cases enter a dedicated review queue. Reviewers confirm, override with a mandatory rationale, request evidence, place on hold or mark inconclusive.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                    <Link2 className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Tamper-evident audit trail</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Append-only events chained with SHA-256 so any change to history is detectable, with downloadable 8-section PDF compliance reports.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-5">
                    <SlidersHorizontal className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Policy management</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Admins adjust thresholds with automatic versioning and a mandatory change explanation. Past verifications stay tied to the policy version in force.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FF5B26]/10 border border-[#FF5B26]/20 text-[#FF7D47] flex items-center justify-center mb-5">
                    <LayoutDashboard className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Dashboard and voice assistant</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Live portfolio analytics, plus hands-free voice queries that jump to the right queue (text fallback where voice isn't supported).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. How It Works Section */}
          <section id="how-it-works" aria-labelledby="how-it-works-heading" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-white/[0.07]">
            <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FF7A00]">
                  Process
                </span>
              </div>
              <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                From recommendation to certified record.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] relative flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#FF7A00] font-bold text-xs flex items-center justify-center mb-4">
                  01
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Analyse</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  AI evaluates each application and returns a recommendation with reasoning factors.
                </p>
              </div>

              {/* Step 2 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] relative flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#FF7A00] font-bold text-xs flex items-center justify-center mb-4">
                  02
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Verify</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  The Risk Engine checks the same applicant against the active loan policies.
                </p>
              </div>

              {/* Step 3 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] relative flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#FF7A00] font-bold text-xs flex items-center justify-center mb-4">
                  03
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Escalate</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Mismatches and information gaps are flagged and routed to human review.
                </p>
              </div>

              {/* Step 4 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] relative flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#FF7A00] font-bold text-xs flex items-center justify-center mb-4">
                  04
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Certify</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every action is hash-chained and can be exported as a PDF report.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Safeguards Section */}
          <section id="safeguards" aria-labelledby="safeguards-heading" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-white/[0.07]">
            <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FF7A00]">
                  Risk Mitigation
                </span>
              </div>
              <h2 id="safeguards-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Four situations TrustTrack is built to catch.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Safeguard 1 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold text-white">Potential AI–policy mismatch</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                      High severity
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    The AI rejects an applicant who passes every configured policy.
                  </p>
                </div>
              </div>

              {/* Safeguard 2 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold text-white">AI recommends over a policy failure</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                      High severity
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    The AI recommends an applicant who breaches policy.
                  </p>
                </div>
              </div>

              {/* Safeguard 3 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold text-white">Policy failure</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.08] shrink-0">
                      Policy check
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    The applicant's actual value is compared with the configured threshold.
                  </p>
                </div>
              </div>

              {/* Safeguard 4 */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.07] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold text-white">Insufficient information</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.08] shrink-0">
                      Data gap
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Missing documents or undeclared debt are marked INSUFFICIENT DATA and are never automatically treated as a failure.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Final Call to Action */}
          <section aria-labelledby="cta-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-white/[0.07]">
            <div className="glass-panel-elevated rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/[0.1] text-center max-w-4xl mx-auto relative overflow-hidden">
              <div className="relative z-10">
                <h2 id="cta-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Put accountability behind every AI lending decision.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-xl mx-auto">
                  Sign up or sign in to explore the platform.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-xl btn-primary-orange text-xs uppercase tracking-wider font-bold shadow-lg shadow-orange-500/25 transition-all focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none"
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-[#FF5B26] focus-visible:outline-none"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* 8. Footer */}
        <footer className="border-t border-white/[0.07] bg-[#0A0A0E] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              {/* Logo & Wordmark */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5B26] to-[#FF8A00] flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">TrustTrack</span>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mb-6">
                TrustTrack is an advisory AI monitoring, verification and accountability system. AI recommendations do not constitute final loan approvals or statutory rejections. All formal loan sanctions require review and authorization by certified credit underwriting authorities.
              </p>

              {/* Copyright */}
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} TrustTrack
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

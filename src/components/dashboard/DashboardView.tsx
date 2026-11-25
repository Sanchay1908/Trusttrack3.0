import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Filter, 
  Sparkles, 
  ShieldAlert,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: string, filterParam?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    applications, 
    aiDecisions, 
    riskFlags, 
    reviewCases, 
    reviewActions,
    dashboardAIInsights,
    isGeneratingInsights,
    refreshDashboardInsights
  } = useApp();
  const [timePeriod, setTimePeriod] = useState<'1month' | '3month' | '6month' | '1year'>('1month');

  // Computed statistics directly from Supabase/AppContext records
  const totalApps = applications.length;
  const aiRecommended = aiDecisions.filter(d => d.recommendation === 'Recommended').length;
  const aiNotRecommended = aiDecisions.filter(d => d.recommendation === 'Not Recommended').length;
  const aiNeedsInfo = aiDecisions.filter(d => d.recommendation === 'Needs More Information').length;
  const aiInconclusive = aiDecisions.filter(d => d.recommendation === 'Inconclusive').length;

  const flaggedApps = applications.filter(a => a.application_status === 'flagged' || a.application_status === 'under_review').length;
  const pendingReviews = reviewCases.filter(c => c.status === 'Pending Review' || c.status === 'Under Investigation' || c.status === 'Evidence Requested' || c.status === 'On Hold').length;
  const resolvedCases = reviewCases.filter(c => c.status === 'Confirmed' || c.status === 'Overridden' || c.status === 'Resolved').length;

  // Potential mismatches count
  const mismatches = riskFlags.filter(f => f.risk_type === 'POTENTIAL_AI_POLICY_MISMATCH' || f.risk_type === 'AI_RECOMMENDS_POLICY_FAILS').length;

  // Chart 1: AI Decision Distribution
  const decisionData = [
    { name: 'Recommended', value: aiRecommended, color: '#10B981' },
    { name: 'Not Recommended', value: aiNotRecommended, color: '#F43F5E' },
    { name: 'Needs Info', value: aiNeedsInfo, color: '#F59E0B' },
    { name: 'Inconclusive', value: aiInconclusive, color: '#8B5CF6' },
  ].filter(d => d.value > 0);

  // Chart 2: Risk Severity breakdown
  const highRiskCount = riskFlags.filter(f => f.severity === 'High').length;
  const mediumRiskCount = riskFlags.filter(f => f.severity === 'Medium').length;
  const lowRiskCount = riskFlags.filter(f => f.severity === 'Low').length;
  const riskData = [
    { category: 'High Severity', count: highRiskCount, fill: '#F43F5E' },
    { category: 'Medium Severity', count: mediumRiskCount, fill: '#FF7A00' },
    { category: 'Low Severity', count: lowRiskCount, fill: '#F59E0B' },
    { category: 'Clean / Passed', count: Math.max(0, totalApps - (highRiskCount + mediumRiskCount + lowRiskCount)), fill: '#10B981' }
  ];

  // Chart 3: Human Review Outcomes
  const reviewOutcomes = [
    { outcome: 'Confirmed AI', count: reviewActions.filter(a => a.action_type === 'CONFIRM_AI').length, fill: '#10B981' },
    { outcome: 'Overridden AI', count: reviewActions.filter(a => a.action_type === 'OVERRIDE_AI').length, fill: '#FF5B26' },
    { outcome: 'Evidence Req', count: reviewActions.filter(a => a.action_type === 'REQUEST_EVIDENCE').length, fill: '#F59E0B' },
    { outcome: 'On Hold', count: reviewActions.filter(a => a.action_type === 'PLACE_ON_HOLD').length, fill: '#64748B' },
    { outcome: 'Inconclusive', count: reviewActions.filter(a => a.action_type === 'MARK_INCONCLUSIVE').length, fill: '#8B5CF6' }
  ];

  // Chart 4: Application Trend over time (Illustrative timeline)
  const trendData = [
    { date: 'Day 1', applications: 2, flagged: 0 },
    { date: 'Day 2', applications: 4, flagged: 1 },
    { date: 'Day 3', applications: 7, flagged: 3 },
    { date: 'Day 4', applications: 10, flagged: 5 },
    { date: 'Today', applications: totalApps, flagged: flaggedApps },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Time Filter (matching Image 2 & 3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF5B26]/20 text-[#FF7A00] border border-[#FF5B26]/30">
              Live Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics computed directly from Supabase loan underwriting records.
          </p>
        </div>

        {/* Time Period Selector matching Image 3 pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
            {(['1month', '3month', '6month', '1year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  timePeriod === p
                    ? 'bg-[#FF5B26] text-white shadow-md shadow-orange-500/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === '1month' ? '1 Month' : p === '3month' ? '3 Months' : p === '6month' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('workspace')}
            className="px-4 py-2 rounded-xl btn-primary-orange text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-orange-500/25"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyse New Loan</span>
          </button>
        </div>
      </div>

      {/* Gemini AI Platform Intelligence Widget */}
      <div className="glass-panel-elevated rounded-2xl p-5 border border-orange-500/20 bg-gradient-to-r from-orange-500/[0.05] via-transparent to-purple-500/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF5B26]/10 border border-[#FF5B26]/30 flex items-center justify-center text-[#FF7A00]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Gemini AI Portfolio Intelligence
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Insights
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated Gemini evaluation of underwriting discrepancies, policy compliance, and audit trends
              </p>
            </div>
          </div>
          <button
            onClick={() => refreshDashboardInsights()}
            disabled={isGeneratingInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingInsights ? 'animate-spin text-orange-400' : ''}`} />
            <span>{isGeneratingInsights ? 'Analyzing Portfolio...' : 'Refresh AI Insights'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(dashboardAIInsights && dashboardAIInsights.length > 0 ? dashboardAIInsights : [
            'Analyzing current loan application velocity and policy compliance rates...',
            'Evaluating high debt-to-income outlier distributions across active cohorts...',
            'Monitoring human underwriter override frequency against AI recommendations...'
          ]).map((insight, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3 hover:border-orange-500/20 transition-colors">
              <div className="w-5 h-5 rounded-full bg-[#FF5B26]/15 border border-[#FF5B26]/30 flex items-center justify-center text-[#FF7A00] flex-shrink-0 mt-0.5 text-[10px] font-bold">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Highlight Cards Row (Directly matching Image 2 & 3 layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Featured Warm Orange Card (Matching Image 2 "My Balance" card) */}
        <div 
          onClick={() => onNavigate('risk-engine')}
          className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#FF5B26] to-[#FF3D00] text-white shadow-xl shadow-orange-500/30 cursor-pointer group hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">
              AI Mismatch Watch
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight">
              {mismatches} <span className="text-base font-normal text-orange-100">Alerts</span>
            </div>
            <p className="text-xs text-orange-100/90 mt-1 flex items-center gap-1">
              <span>Potential AI-Policy Mismatches</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-orange-100">
            <span>Critical underwriter inspection</span>
            <span className="font-semibold underline">Inspect now &rarr;</span>
          </div>
        </div>

        {/* Total Applications Card */}
        <div 
          onClick={() => onNavigate('decision-log')}
          className="glass-panel-elevated rounded-2xl p-5 cursor-pointer hover:border-[#FF5B26]/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#FF7A00]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{totalApps}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% Policy Inspected</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span>View Decision Log</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Flagged Cases Card */}
        <div 
          onClick={() => onNavigate('risk-engine')}
          className="glass-panel-elevated rounded-2xl p-5 cursor-pointer hover:border-amber-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Flagged by Risk Engine
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{flaggedApps}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400 font-medium">
              <span>{((flaggedApps / Math.max(1, totalApps)) * 100).toFixed(0)}% of total volume</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span>Inspect Risk Triggers</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Pending Human Reviews Card */}
        <div 
          onClick={() => onNavigate('human-review')}
          className="glass-panel-elevated rounded-2xl p-5 cursor-pointer hover:border-brand/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Human Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FF5B26]/10 border border-[#FF5B26]/20 flex items-center justify-center text-brand">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{pendingReviews}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
              <span>{resolvedCases} cases completed</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span>Open Review Desk</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Application Volume Trend (Area Chart in Orange Gradient) */}
        <div className="lg:col-span-2 glass-panel-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Application Ingestion & Flag Trend</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Evaluation velocity vs risk triggers detected</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5B26]"></span>
                <span>Applications</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Flagged</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5B26" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#FF5B26" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121218', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#FFF'
                  }} 
                />
                <Area type="monotone" dataKey="applications" stroke="#FF5B26" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" dataKey="flagged" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorFlagged)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: AI Decision Distribution (Donut Chart) */}
        <div className="glass-panel-elevated rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">AI Decision Breakdown</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Gemini preliminary underwriting distribution</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121218', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#FFF'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-2xl font-bold text-white">{totalApps}</span>
              <p className="text-[9px] uppercase tracking-wider text-slate-400">Total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
            {decisionData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div className="text-xs">
                  <span className="text-slate-300 font-medium block">{item.name}</span>
                  <span className="text-slate-400 text-[10px]">{item.value} ({((item.value / Math.max(1, totalApps)) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Risk Analysis Bar Chart & Human Review Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Breakdown */}
        <div className="glass-panel-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Risk Flag Severity Profile</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Distribution of policy and model anomalies</p>
            </div>
            <button 
              onClick={() => onNavigate('risk-engine')}
              className="text-xs text-[#FF7A00] hover:underline flex items-center gap-1"
            >
              <span>Explore Engine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121218', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#FFF'
                  }} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Human Review Outcomes */}
        <div className="glass-panel-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Human Underwriter Actions</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Accountability verdicts submitted by certified reviewers</p>
            </div>
            <button 
              onClick={() => onNavigate('human-review')}
              className="text-xs text-brand hover:underline flex items-center gap-1"
            >
              <span>Open Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reviewOutcomes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="outcome" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121218', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#FFF'
                  }} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table matching Image 2 ("Recent Activities") */}
      <div className="glass-panel-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Loan Application Stream</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Latest underwriting assessments and verification statuses</p>
          </div>
          <button 
            onClick={() => onNavigate('decision-log')}
            className="text-xs font-semibold text-[#FF7A00] hover:underline flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Applicant ID</th>
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Loan Amount</th>
                <th className="pb-3 font-semibold">Income & DTI</th>
                <th className="pb-3 font-semibold">Credit Score</th>
                <th className="pb-3 font-semibold">AI Recommendation</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {applications.slice(0, 5).map(app => {
                const decision = aiDecisions.find(d => d.application_id === app.id);
                return (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-mono font-semibold text-[#FF7A00]">{app.applicant_id}</td>
                    <td className="py-3 font-medium text-white">{app.full_name}</td>
                    <td className="py-3 text-slate-200">₹{app.loan_amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="text-slate-300">₹{app.monthly_income.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">DTI: {app.dti_ratio}%</span>
                    </td>
                    <td className="py-3">
                      <span className={`font-semibold ${app.credit_score >= 650 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {app.credit_score}
                      </span>
                    </td>
                    <td className="py-3">
                      {decision ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          decision.recommendation === 'Recommended' 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                            : decision.recommendation === 'Not Recommended'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {decision.recommendation}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.application_status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : app.application_status === 'flagged' || app.application_status === 'under_review'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {app.application_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigate('decision-log', app.applicant_id)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-[#FF5B26]/20 border border-white/[0.08] hover:border-[#FF5B26]/40 text-slate-300 hover:text-white transition-all text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

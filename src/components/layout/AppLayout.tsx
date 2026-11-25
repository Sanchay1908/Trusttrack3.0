import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Bot, 
  ClipboardList, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  Sliders, 
  Mic, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface AppLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, setCurrentTab, children }) => {
  const { user, role, logout, loginAsRole } = useAuth();
  const { reviewCases, notifications, markNotificationAsRead, clearAllNotifications } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingReviewCount = reviewCases.filter(c => c.status === 'Pending Review' || c.status === 'Under Investigation').length;
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'AI Workspace', icon: Bot, highlight: true },
    { id: 'decision-log', label: 'AI Decision Log', icon: ClipboardList },
    { id: 'risk-engine', label: 'Risk Engine', icon: ShieldAlert },
    { 
      id: 'human-review', 
      label: 'Human Review', 
      icon: UserCheck, 
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
      badgeColor: 'bg-brand text-white'
    },
    { id: 'audit-reports', label: 'Audit Reports', icon: FileText },
    { id: 'loan-policies', label: 'Loan Policies', icon: Sliders, adminOnly: true },
    { id: 'voice-assistant', label: 'Voice Assistant', icon: Mic },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Ambient warm glowing meshes matching reference images */}
      <div className="ambient-mesh" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/[0.08] bg-[#0E0E14]/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 lg:hidden rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5B26] to-[#FF8A00] flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">TrustTrack</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#FF5B26]/15 text-[#FF7A00] border border-[#FF5B26]/30">
                  Loan AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">AI Underwriting Accountability</p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search applicant ID (LN001), name, or risk alert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setCurrentTab('decision-log');
                }
              }}
              className="w-full pl-9 pr-14 py-2 text-xs rounded-xl glass-input placeholder-slate-500 text-slate-200"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-400 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded font-mono">
              <span>⌘</span><span>Space</span>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher & Profile Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
            <button
              onClick={() => loginAsRole('admin')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                role === 'admin' 
                  ? 'bg-[#FF5B26] text-white shadow-md shadow-orange-500/25' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => loginAsRole('reviewer')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                role === 'reviewer' 
                  ? 'bg-[#FF5B26] text-white shadow-md shadow-orange-500/25' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reviewer
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-[9px] font-bold text-white flex items-center justify-center animate-subtle-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel-elevated rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF5B26]/20 text-[#FF7A00] font-bold">
                      {unreadNotifCount} new
                    </span>
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04] py-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.link) {
                            setCurrentTab(notif.link.replace('/', ''));
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 rounded-xl transition-colors cursor-pointer hover:bg-white/[0.04] ${!notif.is_read ? 'bg-[#FF5B26]/[0.06]' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          {notif.type === 'mismatch' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : notif.type === 'risk' ? (
                            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-white">{notif.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-amber-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-mono">{role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`
          fixed lg:static top-16 bottom-0 left-0 z-30 w-64 glass-panel border-r border-white/[0.08] p-4 flex flex-col justify-between transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Loan Governance
            </div>
            
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              if (item.adminOnly && role !== 'admin') {
                return null;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group
                    ${isActive 
                      ? 'bg-[#FF5B26] text-white shadow-lg shadow-orange-500/25 font-semibold' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.highlight && !isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#FF5B26]/20 text-[#FF7A00] flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-[#FF5B26]' : 'bg-[#FF5B26] text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Card: Accountability Notice & Logout */}
          <div className="pt-4 border-t border-white/[0.08] space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FF7A00]">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Assurance</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                AI recommendations are non-binding advisory inputs. All final underwriting sanctions require certified human sign-off.
              </p>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/[0.08] transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

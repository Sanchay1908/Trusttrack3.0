import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './components/landing/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { AIWorkspace } from './components/workspace/AIWorkspace';
import { DecisionLogView } from './components/decision-log/DecisionLogView';
import { RiskEngineView } from './components/risk-engine/RiskEngineView';
import { HumanReviewView } from './components/human-review/HumanReviewView';
import { AuditReportsView } from './components/audit/AuditReportsView';
import { LoanPoliciesView } from './components/policies/LoanPoliciesView';
import { VoiceAssistantView } from './components/voice/VoiceAssistantView';
import { SettingsView } from './components/settings/SettingsView';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [targetParam, setTargetParam] = useState<string | undefined>(undefined);
  const [showLanding, setShowLanding] = useState<boolean>(true);

  if (showLanding) {
    const handleEnterAuth = () => {
      logout();
      setShowLanding(false);
      window.scrollTo(0, 0);
    };
    return <LandingPage onSignIn={handleEnterAuth} onSignUp={handleEnterAuth} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setTargetParam(param);
  };

  return (
    <AppLayout currentTab={currentTab} setCurrentTab={handleNavigate}>
      {currentTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
      {currentTab === 'workspace' && <AIWorkspace onNavigate={handleNavigate} />}
      {currentTab === 'decision-log' && <DecisionLogView initialSearchId={targetParam} />}
      {currentTab === 'risk-engine' && <RiskEngineView onNavigate={handleNavigate} />}
      {currentTab === 'human-review' && <HumanReviewView />}
      {currentTab === 'audit-reports' && <AuditReportsView />}
      {currentTab === 'loan-policies' && <LoanPoliciesView />}
      {currentTab === 'voice-assistant' && <VoiceAssistantView onNavigate={handleNavigate} />}
      {currentTab === 'settings' && <SettingsView />}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;

import React, { useState } from 'react';
import { DevSecOpsProvider } from './context/DevSecOpsContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { FlowchartCanvas } from './components/architecture/FlowchartCanvas';
import { NodeDetailDrawer } from './components/architecture/NodeDetailDrawer';
import { CICDView } from './components/cicd/CICDView';
import { SecurityView } from './components/security/SecurityView';
import { GitOpsView } from './components/gitops/GitOpsView';
import { KubernetesView } from './components/kubernetes/KubernetesView';
import { ObservabilityView } from './components/observability/ObservabilityView';
import { SelfHealingView } from './components/selfhealing/SelfHealingView';
import { AICopilotView } from './components/ai/AICopilotView';
import { LiveAppView } from './components/liveapp/LiveAppView';
import { ToastNotifications } from './components/common/ToastNotifications';
import { Cloud } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Page Content Body */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Node Detail Drawer for flowchart interactions */}
          {currentTab === 'flowchart' && <NodeDetailDrawer />}

          {/* Tab Views */}
          {currentTab === 'dashboard' && <DashboardOverview onNavigateTab={setCurrentTab} />}
          {currentTab === 'flowchart' && <FlowchartCanvas />}
          {currentTab === 'cicd' && <CICDView />}
          {currentTab === 'security' && <SecurityView />}
          {currentTab === 'infrastructure' && <GitOpsView />}
          {currentTab === 'deployments' && <GitOpsView />}
          {currentTab === 'applications' && <KubernetesView />}
          {currentTab === 'monitoring' && <ObservabilityView />}
          {currentTab === 'logs' && <ObservabilityView />}
          {currentTab === 'alerts' && <SelfHealingView />}
          {currentTab === 'ai-sre' && <AICopilotView />}
          {currentTab === 'live-app' && <LiveAppView />}
          {currentTab === 'settings' && (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Platform Settings &amp; Cloud Integrations</h3>
              <p className="text-xs text-slate-500">Configure AWS credentials, GitHub Actions webhooks, Slack tokens, and Alertmanager routing rules.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">AWS Region: us-east-1</div>
                  <div className="text-slate-500 mt-1">EKS Cluster: devsecops-cloud-cluster</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">ArgoCD Sync Policy: Automated (Prune + Self-Heal)</div>
                  <div className="text-slate-500 mt-1">Trivy Severity Gate: HIGH, CRITICAL</div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer Matching Screenshot */}
        <footer className="bg-white border-t border-slate-200/90 py-3.5 px-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <div className="font-semibold text-slate-700">
            DevOpsHub <span className="font-normal text-slate-400">v1.0.0</span> &nbsp;|&nbsp; Build &bull; Deploy &bull; Monitor &bull; Scale
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All Systems Operational</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700 font-mono">
              <Cloud className="w-3.5 h-3.5 text-blue-500" />
              <span>AWS (us-east-1)</span>
            </div>
          </div>
        </footer>

        {/* Real-time Alert Toast Slide-in */}
        <ToastNotifications />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DevSecOpsProvider>
      <MainLayout />
    </DevSecOpsProvider>
  );
};

export default App;

import React, { useState } from 'react';
import { DevSecOpsProvider, useDevSecOps } from './context/DevSecOpsContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { WorkspacesView } from './components/workspaces/WorkspacesView';
import { CICDView } from './components/cicd/CICDView';
import { DeploymentsManagerView } from './components/deployments/DeploymentsManagerView';
import { SecurityView } from './components/security/SecurityView';
import { ObservabilityView } from './components/observability/ObservabilityView';
import { DockerManagerView } from './components/docker/DockerManagerView';
import { KubernetesClusterView } from './components/kubernetes/KubernetesClusterView';
import { SelfHealingEngineView } from './components/selfhealing/SelfHealingEngineView';
import { ApiTesterAndBenchmarkerView } from './components/traffic/ApiTesterAndBenchmarkerView';
import { GitOpsDiffView } from './components/gitops/GitOpsDiffView';
import { HelmManagerView } from './components/helm/HelmManagerView';
import { TerraformIaCView } from './components/terraform/TerraformIaCView';
import { DistributedTracingView } from './components/tracing/DistributedTracingView';
import { RbacAuditView } from './components/rbac/RbacAuditView';
import { ToastNotifications } from './components/common/ToastNotifications';
import { InteractiveTerminalDrawer } from './components/terminal/InteractiveTerminalDrawer';
import { AssetGeneratorModal } from './components/devops/AssetGeneratorModal';
import { SecretsManagerModal } from './components/secrets/SecretsManagerModal';
import { ComplianceReportModal } from './components/compliance/ComplianceReportModal';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { AIChatBotDrawer } from './components/ai/AIChatBotDrawer';
import { GlobalFolderDropzone } from './components/common/GlobalFolderDropzone';
import { Cloud, Shield, Database, Server } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSecretsModalOpen, setIsSecretsModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setIsTerminalOpen
  } = useDevSecOps();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          onOpenAssetGenerator={() => setIsAssetModalOpen(true)}
          onOpenSecrets={() => setIsSecretsModalOpen(true)}
          onOpenCompliance={() => setIsComplianceModalOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              onNavigateTab={setCurrentTab}
              onOpenAssetGenerator={() => setIsAssetModalOpen(true)}
              onOpenSecrets={() => setIsSecretsModalOpen(true)}
              onOpenCompliance={() => setIsComplianceModalOpen(true)}
            />
          )}
          {currentTab === 'workspaces' && (
            <WorkspacesView
              onOpenAssetGenerator={() => setIsAssetModalOpen(true)}
              onOpenSecrets={() => setIsSecretsModalOpen(true)}
            />
          )}
          {currentTab === 'cicd' && <CICDView />}
          {currentTab === 'gitops' && <GitOpsDiffView />}
          {currentTab === 'docker' && <DockerManagerView />}
          {currentTab === 'kubernetes' && <KubernetesClusterView />}
          {currentTab === 'helm' && <HelmManagerView />}
          {currentTab === 'terraform' && <TerraformIaCView />}
          {currentTab === 'selfhealing' && <SelfHealingEngineView />}
          {currentTab === 'tracing' && <DistributedTracingView />}
          {currentTab === 'traffic' && <ApiTesterAndBenchmarkerView />}
          {currentTab === 'rbac' && <RbacAuditView />}
          {currentTab === 'deployments' && <DeploymentsManagerView />}
          {currentTab === 'security' && <SecurityView />}
          {currentTab === 'observability' && <ObservabilityView />}
          {currentTab === 'settings' && (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Platform Settings &amp; Host Configuration</h3>
                <p className="text-xs text-slate-500 mt-1">Configure local tool discovery, Docker socket paths, Kubernetes kubeconfig, and alerts routing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>Docker Daemon Socket</span>
                  </div>
                  <div className="font-mono text-slate-600">/var/run/docker.sock</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">Active &bull; Auto-discovering local containers &amp; images</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Database className="w-4 h-4 text-cyan-600" />
                    <span>Kubernetes Cluster Kubeconfig</span>
                  </div>
                  <div className="font-mono text-slate-600">~/.kube/config</div>
                  <div className="text-[11px] text-slate-500">Auto-discovering namespaces, deployments, and services</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Security Audit Engine</span>
                  </div>
                  <div className="font-mono text-slate-600">NPM Audit CLI &amp; Static Lockfile Scanner</div>
                  <div className="text-[11px] text-slate-500">Severity gates active (Critical, High)</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Cloud className="w-4 h-4 text-purple-600" />
                    <span>Persistent Storage</span>
                  </div>
                  <div className="font-mono text-slate-600">server/data_store.json</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">Deployments ledger &amp; registered projects active</div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Clean Footer */}
        <footer className="bg-white border-t border-slate-200/90 py-3.5 px-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <div className="font-semibold text-slate-700">
            DevOpsHub <span className="font-normal text-slate-400">v1.0.0</span> &nbsp;|&nbsp; Build &bull; Deploy &bull; Monitor &bull; Scale
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700 font-mono">
              <Cloud className="w-3.5 h-3.5 text-blue-500" />
              <span>Local Host Engine</span>
            </div>
          </div>
        </footer>

        {/* Real-time Alert Toast Slide-in */}
        <ToastNotifications />

        {/* Collapsible Interactive Host Terminal Drawer */}
        <InteractiveTerminalDrawer />

        {/* DevOps Asset Generator Modal */}
        <AssetGeneratorModal
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
        />

        {/* Environment Variables & Secrets Vault Modal */}
        <SecretsManagerModal
          isOpen={isSecretsModalOpen}
          onClose={() => setIsSecretsModalOpen(false)}
        />

        {/* DevSecOps Compliance & Audit Report Modal */}
        <ComplianceReportModal
          isOpen={isComplianceModalOpen}
          onClose={() => setIsComplianceModalOpen(false)}
        />

        {/* Global Command Palette (Cmd + K) */}
        <CommandPaletteModal
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigateTab={setCurrentTab}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onOpenAssetGenerator={() => setIsAssetModalOpen(true)}
          onOpenSecrets={() => setIsSecretsModalOpen(true)}
          onOpenCompliance={() => setIsComplianceModalOpen(true)}
        />

        {/* Floating AI DevOps & SRE Copilot Robot */}
        <AIChatBotDrawer
          onNavigateTab={setCurrentTab}
          onOpenAssetGenerator={() => setIsAssetModalOpen(true)}
          onOpenSecrets={() => setIsSecretsModalOpen(true)}
          onOpenCompliance={() => setIsComplianceModalOpen(true)}
        />

        {/* Full-Window Drag & Drop Folder Dropzone */}
        <GlobalFolderDropzone onWorkspaceImported={() => setCurrentTab('workspaces')} />
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

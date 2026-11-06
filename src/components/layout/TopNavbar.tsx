import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  FolderTree,
  Plus,
  X,
  Folder,
  Check,
  CheckCircle2,
  Terminal,
  Sparkles,
  Lock,
  FileText,
  Play,
  RotateCw
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface TopNavbarProps {
  onOpenAssetGenerator?: () => void;
  onOpenSecrets?: () => void;
  onOpenCompliance?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenAssetGenerator,
  onOpenSecrets,
  onOpenCompliance
}) => {
  const {
    projects,
    activeProjectId,
    activeProject,
    switchProject,
    registerProject,
    scanProjectFolder,
    isTerminalOpen,
    setIsTerminalOpen,
    setIsCommandPaletteOpen,
    executeRealPipeline,
    isExecutingRealPipeline
  } = useDevSecOps();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFolderPath, setNewFolderPath] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleScanFolder = async () => {
    if (!newFolderPath.trim()) return;
    setIsScanning(true);
    setModalError(null);
    try {
      const data = await scanProjectFolder(newFolderPath.trim());
      setScanResult(data);
      if (!newProjectName) setNewProjectName(data.name || '');
      if (!newProjectDesc) setNewProjectDesc(data.description || '');
    } catch (e: any) {
      setModalError(e.message || 'Folder scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderPath.trim()) return;
    setModalError(null);
    try {
      await registerProject(newFolderPath.trim(), newProjectName.trim(), newProjectDesc.trim(), scanResult);
      setIsAddModalOpen(false);
      setNewFolderPath('');
      setNewProjectName('');
      setNewProjectDesc('');
      setScanResult(null);
    } catch (e: any) {
      setModalError(e.message || 'Registration failed');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200/90 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        {/* Left: Project Workspace Selector */}
        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen(prev => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 transition-colors"
          >
            <FolderTree className="w-4 h-4 text-blue-600" />
            <div className="text-left font-sans">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>{activeProject?.name || 'Projectt'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                {activeProject?.branch || 'main'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Project Switcher Dropdown */}
          {isProjectDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 space-y-1 animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Workspaces &amp; Folders
              </div>

              {projects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => {
                    switchProject(proj.id);
                    setIsProjectDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                    proj.id === activeProjectId
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{proj.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">{proj.path}</div>
                    </div>
                  </div>
                  {proj.id === activeProjectId && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    setIsAddModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Folder / Project...</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search & Command Palette Trigger */}
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="relative flex-1 max-w-md hidden md:flex items-center cursor-pointer bg-[#f1f5f9] hover:bg-slate-200/70 border border-slate-200/80 rounded-xl px-3 py-1.5 transition-all text-slate-500"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-xs text-slate-400 font-medium flex-1">Search or jump to command...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-500 border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Right Tools & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Asset Generator Button */}
          {onOpenAssetGenerator && (
            <button
              onClick={onOpenAssetGenerator}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
              title="Generate Dockerfile & K8s Manifests"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>DevOps Assets</span>
            </button>
          )}

          {/* Secrets Vault Button */}
          {onOpenSecrets && (
            <button
              onClick={onOpenSecrets}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors"
              title="Manage .env and K8s Secrets"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Secrets</span>
            </button>
          )}

          {/* Compliance Report Button */}
          {onOpenCompliance && (
            <button
              onClick={onOpenCompliance}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
              title="Export DevSecOps Compliance Audit Report"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit Report</span>
            </button>
          )}

          {/* Terminal Drawer Toggle Button */}
          <button
            onClick={() => setIsTerminalOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isTerminalOpen
                ? 'bg-slate-900 text-cyan-300 border-slate-800 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Toggle Interactive Host Terminal (Ctrl + `)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminal</span>
            <kbd className="px-1 py-0.2 rounded bg-black/20 text-[9px] font-mono opacity-70">Ctrl+`</kbd>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              RN
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">Ronak Naik</div>
              <div className="text-[10px] text-slate-400 font-medium">Administrator</div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal: Add Project / Folder */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">Add Workspace / Project Folder</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Folder Path on Machine *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="/Users/ronak/Desktop/my-new-microservice"
                    value={newFolderPath}
                    onChange={e => setNewFolderPath(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleScanFolder}
                    disabled={isScanning || !newFolderPath.trim()}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isScanning ? 'Scanning...' : 'Scan'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter an absolute path to any local project folder to inspect Git, dependencies, and DevOps manifests.
                </p>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                  {modalError}
                </div>
              )}

              {scanResult && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 space-y-1.5 text-xs">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Scanned: {scanResult.name}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Type: <span className="font-semibold">{scanResult.type}</span> &bull; Tech: <span className="font-semibold">{scanResult.techStack?.join(', ')}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Git Branch: <span className="font-mono text-blue-700">{scanResult.gitInfo?.branch}</span> &bull; Commit: <span className="font-mono">{scanResult.gitInfo?.commitHash}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Payment Microservice"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stripe checkout and billing processor"
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderPath.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  Add &amp; Switch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

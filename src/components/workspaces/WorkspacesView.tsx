import React, { useState, useRef } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  CheckCircle2,
  Layers,
  GitBranch,
  Terminal,
  Container,
  Cpu,
  Trash2,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  FileCode,
  Sparkles,
  ExternalLink,
  Lock,
  UploadCloud,
  FolderUp,
  Check
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface WorkspacesViewProps {
  onOpenAssetGenerator?: () => void;
  onOpenSecrets?: () => void;
}

export const WorkspacesView: React.FC<WorkspacesViewProps> = ({
  onOpenAssetGenerator,
  onOpenSecrets
}) => {
  const {
    projects,
    activeProjectId,
    activeProject,
    switchProject,
    registerProject,
    scanProjectFolder
  } = useDevSecOps();

  const [folderInput, setFolderInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const performScan = async (path: string) => {
    if (!path.trim()) return;
    setIsScanning(true);
    setScanError(null);
    setScannedResult(null);

    try {
      const res = await scanProjectFolder(path.trim());
      if (res.error) {
        setScanError(res.error);
      } else {
        setScannedResult(res);
        setProjectName(res.name || 'My Local Project');
        setProjectDesc(res.description || 'Imported local project workspace');
      }
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan folder');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performScan(folderInput);
  };

  const handleFolderDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    let droppedPath = '';

    // 1. Try to read path from dropped files (standard in Chrome / desktop webkit)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const firstFile = e.dataTransfer.files[0] as any;
      if (firstFile.path) {
        // If file.path is available, extract directory path
        droppedPath = firstFile.path;
      } else if (firstFile.webkitRelativePath) {
        const rootDir = firstFile.webkitRelativePath.split('/')[0];
        droppedPath = `/Users/ronak/Desktop/${rootDir}`;
      }
    }

    // 2. Try webkit entries
    if (!droppedPath && e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          const entry = (item as any).webkitGetAsEntry?.();
          if (entry) {
            droppedPath = `/Users/ronak/Desktop/${entry.name}`;
            break;
          }
        }
      }
    }

    if (!droppedPath) {
      droppedPath = '/Users/ronak/Desktop/Projectt';
    }

    setFolderInput(droppedPath);
    setShowAddModal(true);
    performScan(droppedPath);
  };

  const handleNativeFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0] as any;
      let path = '';
      if (firstFile.path) {
        // Electron / WebKit with path
        path = firstFile.path;
      } else if (firstFile.webkitRelativePath) {
        const dirName = firstFile.webkitRelativePath.split('/')[0];
        path = `/Users/ronak/Desktop/${dirName}`;
      } else {
        path = `/Users/ronak/Desktop/${firstFile.name}`;
      }

      setFolderInput(path);
      setShowAddModal(true);
      performScan(path);
    }
  };

  const handleSaveProject = async () => {
    if (!folderInput.trim()) return;
    setIsSaving(true);
    try {
      await registerProject(folderInput.trim(), projectName, projectDesc);
      setShowAddModal(false);
      setFolderInput('');
      setScannedResult(null);
    } catch (err: any) {
      setScanError(err.message || 'Failed to register project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Native Directory Input */}
      <input
        ref={fileInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleNativeFolderSelect}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FolderGit2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workspaces &amp; Local Projects</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag and drop any local folder, browse filesystem, or enter directory path to register
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <FolderUp className="w-4 h-4 text-blue-600" />
            <span>Browse Folder...</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project Folder</span>
          </button>
        </div>
      </div>

      {/* Interactive Drag & Drop Zone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleFolderDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10 shadow-xl scale-[1.01] ring-4 ring-blue-500/20'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50 shadow-xs'
        }`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
          isDragOver
            ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30 animate-bounce-subtle'
            : 'bg-blue-50 text-blue-600'
        }`}>
          <UploadCloud className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {isDragOver ? 'Drop Project Folder to Scan!' : 'Drag & Drop Any Project Folder Here'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Drop your local Git repository or app directory from Finder / File Explorer to auto-detect tech stack, Dockerfile, and Kubernetes manifests.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 border border-slate-200">
            or click to choose folder from filesystem
          </span>
        </div>
      </div>

      {/* Active Workspace Highlight Card */}
      {activeProject && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#101b33] to-[#0d1627] text-white border border-slate-800 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ACTIVE WORKSPACE
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {activeProject.id}</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">{activeProject.name}</h3>
              <p className="text-xs text-slate-300 font-mono max-w-2xl">{activeProject.path}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Git Status</div>
                <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1 mt-0.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>{activeProject.branch} ({activeProject.commitHash})</span>
                </div>
                <div className="text-[10px] text-slate-400">Author: {activeProject.author}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Tech Stack</div>
              <div className="text-xs font-bold text-white mt-1 flex flex-wrap gap-1">
                {activeProject.techStack?.map((t, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Dockerfile</div>
              <div className="text-xs font-bold mt-1 flex items-center gap-1.5">
                {activeProject.dockerfilePresent ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Present</span>
                ) : (
                  <span className="text-slate-400">Not detected</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Kubernetes Manifests</div>
              <div className="text-xs font-bold mt-1 flex items-center gap-1.5">
                {activeProject.k8sManifestsPresent ? (
                  <span className="text-cyan-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Present</span>
                ) : (
                  <span className="text-slate-400">Not detected</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">CI/CD Jenkinsfile</div>
              <div className="text-xs font-bold mt-1 flex items-center gap-1.5">
                {activeProject.jenkinsfilePresent ? (
                  <span className="text-purple-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Present</span>
                ) : (
                  <span className="text-slate-400">Not detected</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for Active Project */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-3">
            {onOpenAssetGenerator && (
              <button
                onClick={onOpenAssetGenerator}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Generate Dockerfile &amp; K8s Manifests</span>
              </button>
            )}

            {onOpenSecrets && (
              <button
                onClick={onOpenSecrets}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Manage .env &amp; Secrets</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Workspaces Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span>Registered Workspaces</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-mono">{projects.length}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(proj => {
            const isActive = proj.id === activeProjectId;
            return (
              <div
                key={proj.id}
                className={`p-5 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`p-2 rounded-xl text-xs ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <FolderGit2 className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{proj.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{proj.type || 'Workspace'}</span>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        ACTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => switchProject(proj.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-all"
                      >
                        Switch
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">{proj.description}</p>

                  <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-600 truncate">
                    {proj.path}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {proj.techStack?.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    <span>{proj.branch}</span>
                  </div>
                  <span className="text-[10px]">
                    {new Date(proj.lastScanned).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Add Local Project / Folder</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setScannedResult(null);
                  setScanError(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Native Folder Input */}
            <input
              ref={modalFileInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleNativeFolderSelect}
              className="hidden"
            />

            <form onSubmit={handleScan} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Local Folder Absolute Path
                </label>
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>Browse Folder...</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={folderInput}
                  onChange={e => setFolderInput(e.target.value)}
                  placeholder="/Users/username/my-project"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isScanning || !folderInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {isScanning ? 'Scanning...' : 'Scan Folder'}
                </button>
              </div>
            </form>

            {scanError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {scanError}
              </div>
            )}

            {scannedResult && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Scan Detected Successfully</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    VALID REPO
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Project Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Description</label>
                    <input
                      type="text"
                      value={projectDesc}
                      onChange={e => setProjectDesc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700 pt-2 border-t border-slate-200">
                  <div>Branch: <span className="font-bold">{scannedResult.branch}</span></div>
                  <div>Commit: <span className="font-bold">{scannedResult.commitHash}</span></div>
                  <div>Dockerfile: <span className="font-bold">{scannedResult.dockerfilePresent ? 'Yes' : 'No'}</span></div>
                  <div>K8s Manifests: <span className="font-bold">{scannedResult.k8sManifestsPresent ? 'Yes' : 'No'}</span></div>
                </div>

                <button
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20"
                >
                  {isSaving ? 'Registering Workspace...' : 'Register & Switch to Workspace'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

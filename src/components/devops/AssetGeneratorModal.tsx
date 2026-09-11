import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Container,
  GitBranch,
  Save,
  CheckCircle2,
  Copy,
  Check,
  X,
  Sparkles,
  Layers,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface AssetGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetGeneratorModal: React.FC<AssetGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, generateDevOpsAssets } = useDevSecOps();
  const [activeAssetTab, setActiveAssetTab] = useState<'dockerfile' | 'deployment' | 'service' | 'github'>('dockerfile');
  const [assetsData, setAssetsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [writeSuccess, setWriteSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, activeProject?.id]);

  const loadAssets = async () => {
    setIsLoading(true);
    setWriteSuccess(false);
    try {
      const res = await generateDevOpsAssets(false);
      setAssetsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteToDisk = async () => {
    setIsWriting(true);
    try {
      const res = await generateDevOpsAssets(true);
      setAssetsData(res);
      setWriteSuccess(true);
      setTimeout(() => setWriteSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWriting(false);
    }
  };

  if (!isOpen) return null;

  const getActiveCode = () => {
    if (!assetsData?.assets) return '';
    switch (activeAssetTab) {
      case 'dockerfile':
        return assetsData.assets.dockerfile;
      case 'deployment':
        return assetsData.assets.k8sDeployment;
      case 'service':
        return assetsData.assets.k8sService;
      case 'github':
        return assetsData.assets.githubActions;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">DevOps &amp; Cloud-Native Asset Generator</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-stage Dockerfile, Kubernetes Deployment &amp; Service manifests, and GitHub Actions workflow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Target Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Active Workspace:</span>
            <span className="font-bold text-slate-900">{activeProject?.name || 'Projectt'}</span>
            <span className="font-mono text-slate-500 text-[11px] truncate max-w-sm">({activeProject?.path})</span>
          </div>

          <div className="flex items-center gap-1.5">
            {activeProject?.techStack?.map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] text-slate-700">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content: Tabs + Editor Preview */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Asset Type Selector Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
            <button
              onClick={() => setActiveAssetTab('dockerfile')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeAssetTab === 'dockerfile'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Container className="w-4 h-4" />
              <span>Dockerfile</span>
            </button>

            <button
              onClick={() => setActiveAssetTab('deployment')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeAssetTab === 'deployment'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>k8s/deployment.yaml</span>
            </button>

            <button
              onClick={() => setActiveAssetTab('service')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeAssetTab === 'service'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>k8s/service.yaml</span>
            </button>

            <button
              onClick={() => setActiveAssetTab('github')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeAssetTab === 'github'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>.github/workflows/ci-cd.yml</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 p-6 bg-[#090d16] overflow-y-auto relative font-mono text-xs">
            <div className="absolute top-4 right-6 flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-[11px] font-semibold transition-all border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <span>Generating production manifests...</span>
              </div>
            ) : (
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {getActiveCode()}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div>
            {writeSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Assets successfully written to {activeProject?.path}!</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">
                Clicking Write will create <code>Dockerfile</code>, <code>.dockerignore</code>, <code>k8s/</code>, and <code>.github/</code> files.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleWriteToDisk}
              disabled={isWriting || isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isWriting ? 'Writing to Disk...' : 'Write Assets to Project Filesystem'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

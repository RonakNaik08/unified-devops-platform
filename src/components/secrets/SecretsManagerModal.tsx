import React, { useState, useEffect } from 'react';
import {
  Lock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Layers,
  X,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface SecretsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretsManagerModal: React.FC<SecretsManagerModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, getEnvVars, saveEnvVars } = useDevSecOps();
  const [vars, setVars] = useState<Array<{ key: string; value: string }>>([]);
  const [showValues, setShowValues] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [exportedK8sSecret, setExportedK8sSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEnv();
    }
  }, [isOpen, activeProject?.id]);

  const loadEnv = async () => {
    setIsLoading(true);
    setSuccessMsg(null);
    setExportedK8sSecret(null);
    try {
      const res = await getEnvVars();
      if (res?.vars && res.vars.length > 0) {
        setVars(res.vars);
      } else {
        setVars([
          { key: 'NODE_ENV', value: 'production' },
          { key: 'PORT', value: '3000' },
          { key: 'DATABASE_URL', value: 'postgres://postgres:postgres@localhost:5432/devops_db' },
          { key: 'REDIS_URL', value: 'redis://localhost:6379' },
          { key: 'JWT_SECRET', value: 'secret_key_devsecops_jwt_token_2026' }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVar = () => {
    setVars(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveVar = (index: number) => {
    setVars(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: 'key' | 'value', val: string) => {
    setVars(prev => {
      const updated = [...prev];
      updated[index][field] = val;
      return updated;
    });
  };

  const toggleShow = (index: number) => {
    setShowValues(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSave = async (exportK8s = false) => {
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      const validVars = vars.filter(v => v.key.trim());
      const res = await saveEnvVars(validVars, exportK8s);
      if (res.k8sSecretContent) {
        setExportedK8sSecret(res.k8sSecretContent);
        setSuccessMsg('Saved to .env and exported k8s/secret.yaml');
      } else {
        setSuccessMsg('Successfully saved to .env file');
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Environment Variables &amp; Secrets Vault</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage local <code>.env</code> file and export Base64-encoded Kubernetes Secret YAML
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

        {/* Target Workspace Info */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-600 truncate">
            Target: <span className="font-bold text-slate-900">{activeProject?.path}/.env</span>
          </div>
          <button
            onClick={handleAddVar}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variable</span>
          </button>
        </div>

        {/* Variables List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading environment variables...</div>
          ) : (
            vars.map((v, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                <input
                  type="text"
                  value={v.key}
                  onChange={e => handleChange(idx, 'key', e.target.value)}
                  placeholder="VARIABLE_NAME"
                  className="w-1/3 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />

                <span className="text-slate-400 font-mono font-bold">=</span>

                <div className="flex-1 relative">
                  <input
                    type={showValues[idx] ? 'text' : 'password'}
                    value={v.value}
                    onChange={e => handleChange(idx, 'value', e.target.value)}
                    placeholder="variable_value"
                    className="w-full px-3 py-2 pr-9 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow(idx)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showValues[idx] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveVar(idx)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          {exportedK8sSecret && (
            <div className="mt-4 p-4 rounded-2xl bg-[#090d16] border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold font-mono text-cyan-400">Exported k8s/secret.yaml (Base64 Encoded)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportedK8sSecret);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold hover:text-white flex items-center gap-1"
                >
                  {copiedSecret ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {exportedK8sSecret}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div>
            {successMsg ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">
                Values stored locally in workspace <code>.env</code> file.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Export K8s Secret</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save .env'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Users,
  CheckCircle2,
  Lock,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Search,
  FileText,
  UserCheck
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: string;
  ip: string;
}

const ROLES_MATRIX = [
  { role: 'Administrator', desc: 'Full root access to all cluster resources, secrets, deployments, and settings.', users: 1, permissions: ['Deploy Pipelines', 'Scale & Kill Pods', 'Manage Secrets', 'Apply Terraform IaC', 'Install Helm Charts'] },
  { role: 'DevOps Engineer', desc: 'Manage CI/CD, Docker containers, Kubernetes workloads, and trigger auto-remediations.', users: 3, permissions: ['Deploy Pipelines', 'Scale & Kill Pods', 'Install Helm Charts', 'Execute Terminal'] },
  { role: 'Developer', desc: 'View dashboards, trigger manual test builds, inspect logs, and test REST endpoints.', users: 8, permissions: ['View Telemetry & Logs', 'Run Local Test Build', 'API Load Tester'] },
  { role: 'Security Auditor', desc: 'Read-only access to compliance reports, CVE audits, lockfiles, and audit ledgers.', users: 2, permissions: ['View Security Audits', 'Export SOC2 Reports', 'Inspect Audit Ledger'] }
];

export const RbacAuditView: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Token Generator
  const [tokenName, setTokenName] = useState('');
  const [tokenRole, setTokenRole] = useState('DevOps Engineer');
  const [generatedToken, setGeneratedToken] = useState<any | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/rbac/audit-log');
      const data = await res.json();
      if (Array.isArray(data)) setAuditLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/v1/rbac/tokens/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tokenName.trim(), role: tokenRole })
      });
      const data = await res.json();
      setGeneratedToken(data);
      setTokenName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const filteredLogs = auditLogs.filter(l =>
    l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Team RBAC &amp; Enterprise Audit Ledger
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                SOC2 Compliant
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Role-based access permissions, API token management, and immutable audit logs
            </p>
          </div>
        </div>

        <button
          onClick={fetchAuditLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Role Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES_MATRIX.map(r => (
          <div
            key={r.role}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>{r.role}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {r.users} members
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {r.desc}
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Granted Privileges:</div>
                <div className="flex flex-wrap gap-1">
                  {r.permissions.map((p, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API Key / Token Generator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Personal Access Token (PAT) Generator</h3>
            <p className="text-xs text-slate-500">Generate secure API keys for GitHub Actions, GitLab CI, and CLI tools</p>
          </div>
        </div>

        <form onSubmit={handleGenerateToken} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            required
            placeholder="Token Description (e.g. GitHub Actions Deploy Runner)"
            value={tokenName}
            onChange={e => setTokenName(e.target.value)}
            className="flex-1 min-w-[260px] px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />

          <select
            value={tokenRole}
            onChange={e => setTokenRole(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50"
          >
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Developer">Developer</option>
            <option value="Security Auditor">Security Auditor</option>
            <option value="Administrator">Administrator</option>
          </select>

          <button
            type="submit"
            disabled={isGenerating || !tokenName.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Token</span>
          </button>
        </form>

        {generatedToken && (
          <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-2 animate-scale-up">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Token Generated: {generatedToken.name} ({generatedToken.role})</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Expires in {generatedToken.expiresIn}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedToken.token}
                className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-black text-cyan-300 border border-slate-800"
              />
              <button
                onClick={() => copyToClipboard(generatedToken.token)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Immutable Audit Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Immutable Audit Trail</h3>
            <p className="text-xs text-slate-500">Append-only compliance ledger recording every platform action</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {log.timestamp}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {log.actor}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {log.target}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {log.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400 text-right">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

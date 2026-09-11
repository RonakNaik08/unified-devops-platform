import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Send,
  MessageSquare,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Sliders,
  Check
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface SelfHealingRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  cooldown: string;
  severity: string;
  executionCount: number;
}

export const SelfHealingEngineView: React.FC = () => {
  const { activeProject } = useDevSecOps();
  const [rules, setRules] = useState<SelfHealingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Remediation Simulation State
  const [activeRemediation, setActiveRemediation] = useState<any | null>(null);
  const [isRemediating, setIsRemediating] = useState(false);

  // Webhook Alert Dispatcher State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/v1/selfhealing/rules');
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleTriggerHealing = async (rule: SelfHealingRule) => {
    setIsRemediating(true);
    setActiveRemediation({
      ruleName: rule.name,
      status: 'executing',
      steps: [
        { time: new Date().toLocaleTimeString(), message: `⚠️ Watchdog triggered: ${rule.trigger}`, status: 'detected' }
      ]
    });

    try {
      const res = await fetch('http://localhost:5001/api/v1/selfhealing/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: rule.id,
          targetName: `${activeProject?.name || 'Production'} Microservice`
        })
      });
      const data = await res.json();
      setActiveRemediation({
        ruleName: rule.name,
        status: 'resolved',
        steps: data.steps,
        rca: data.rca
      });
      fetchRules();
    } catch (err: any) {
      setActiveRemediation(prev => ({
        ...prev,
        status: 'failed',
        error: err.message
      }));
    } finally {
      setIsRemediating(false);
    }
  };

  const handleSendTestWebhook = async () => {
    if (!webhookUrl.trim()) return;
    setIsSendingWebhook(true);
    setWebhookStatus(null);

    try {
      const res = await fetch('http://localhost:5001/api/v1/selfhealing/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          incidentData: {
            title: 'Pod CrashLoopBackOff Auto-Remediated',
            severity: 'CRITICAL',
            status: 'Resolved',
            target: `${activeProject?.name || 'Production'} Cluster`,
            summary: 'Worker memory pressure resolved automatically by DevOpsHub self-healing engine.'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookStatus('✅ Webhook alert dispatched successfully!');
      } else {
        setWebhookStatus(`❌ ${data.error || 'Failed to send webhook'}`);
      }
    } catch (err: any) {
      setWebhookStatus(`❌ ${err.message}`);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Automated SRE Self-Healing Engine
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Watchdog Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Zero-human-touch automated incident recovery, crash loop repair, and Slack webhook alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>4 Watchdogs Monitoring</span>
          </span>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map(rule => (
          <div
            key={rule.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {rule.name}
                  </h3>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  rule.severity === 'Critical'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {rule.severity}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <div>
                  <span className="font-semibold text-slate-700">Condition:</span>{' '}
                  <span className="text-slate-500">{rule.trigger}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Auto-Remediation:</span>{' '}
                  <span className="text-blue-600 font-medium">{rule.action}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="text-slate-400 font-mono text-[11px]">
                Triggered: <span className="font-bold text-slate-700">{rule.executionCount} times</span>
              </div>

              <button
                onClick={() => handleTriggerHealing(rule)}
                disabled={isRemediating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs active:scale-95 disabled:opacity-50 transition-all"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Simulate &amp; Heal</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Remediation Execution Flow */}
      {activeRemediation && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-[#0d1627] to-slate-900 text-white border border-slate-800 shadow-xl space-y-4 animate-scale-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Automated SRE Remediation Execution</h3>
                <div className="text-[11px] text-slate-400 font-mono">{activeRemediation.ruleName}</div>
              </div>
            </div>

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              {activeRemediation.status.toUpperCase()}
            </span>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-2">
            {activeRemediation.steps?.map((step: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-xs font-mono">
                <span className="text-slate-500">{step.time}</span>
                <span className={step.status === 'resolved' ? 'text-emerald-400 font-bold' : step.status === 'detected' ? 'text-amber-300' : 'text-slate-300'}>
                  {step.message}
                </span>
              </div>
            ))}
          </div>

          {/* AI RCA Box */}
          {activeRemediation.rca && (
            <div className="p-4 rounded-xl bg-black/60 border border-slate-800 text-xs space-y-1.5 mt-2">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>AI SRE Root-Cause Analysis (RCA):</span>
              </div>
              <div className="text-slate-300">
                <span className="font-semibold text-slate-400">Cause:</span> {activeRemediation.rca.cause}
              </div>
              <div className="text-slate-300">
                <span className="font-semibold text-slate-400">Remediation:</span> {activeRemediation.rca.fix}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Webhook Dispatcher Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Live Webhook Incident Alerting (Slack / Discord)</h3>
            <p className="text-xs text-slate-500">Dispatch formatted JSON incident payloads when self-healing triggers</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="url"
            placeholder="https://hooks.slack.com/services/T00/B00/XXXXX or Discord webhook URL"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            className="flex-1 min-w-[280px] px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
          />

          <button
            onClick={handleSendTestWebhook}
            disabled={isSendingWebhook || !webhookUrl.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingWebhook ? 'Dispatching...' : 'Send Test Alert'}</span>
          </button>
        </div>

        {webhookStatus && (
          <div className={`p-3 rounded-xl text-xs font-medium ${webhookStatus.includes('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {webhookStatus}
          </div>
        )}
      </div>
    </div>
  );
};

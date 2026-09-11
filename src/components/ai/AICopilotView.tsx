import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  GitPullRequest,
  TrendingUp,
  Cpu,
  Shield,
  Activity,
  Send,
  MessageSquare
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const AICopilotView: React.FC = () => {
  const { aiAnalyses, vulnerabilities, pods, metricsHistory } = useDevSecOps();
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your AI SRE & Continuous Improvement Copilot. I analyze Prometheus metrics, Loki logs, OpenTelemetry traces, and Trivy security scans to detect anomalies, root causes, and suggest auto-fixes.',
      timestamp: 'Just now'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    const userText = customPrompt;
    setCustomPrompt('');
    const userMsg = { role: 'user' as const, text: userText, timestamp: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMsg]);
    setIsGenerating(true);

    setTimeout(() => {
      let reply = '';
      if (userText.toLowerCase().includes('scale') || userText.toLowerCase().includes('cpu') || userText.toLowerCase().includes('load')) {
        reply = 'Based on current Prometheus container_cpu_usage metrics, your backend HPA is configured with a 70% threshold. Autoscaling from 2 to 6 pods completed in 3.1s during the last traffic spike, maintaining P95 latency below 45ms. Recommended: Enable AWS Karpenter for node provision velocity.';
      } else if (userText.toLowerCase().includes('security') || userText.toLowerCase().includes('cve') || userText.toLowerCase().includes('trivy')) {
        reply = 'Trivy security scan identified 1 unpatched CRITICAL CVE (CVE-2024-38063 in libxml2). I have generated a proposed fix: updating the Dockerfile base image to alpine:3.20.2 or distroless. Would you like me to open a Pull Request?';
      } else if (userText.toLowerCase().includes('rollback') || userText.toLowerCase().includes('canary')) {
        reply = 'Canary deployment error rate analysis: The automated rollback rule successfully intercepted the 5xx error spike (14.5% > 5% SLA threshold) on v1.3.0 and reverted traffic to commit 7e8910a without user disruption.';
      } else {
        reply = `Analysis complete: AWS EKS Cluster (devsecops-cloud-cluster) is healthy across all 3 tiers. Observability telemetry shows zero unhandled exceptions in the last 15 minutes. Recommendations: 1) Enable AWS KMS envelope encryption for Secrets, 2) Optimize database query connection pool size.`;
      }

      setChatHistory(prev => [...prev, { role: 'assistant', text: reply, timestamp: new Date().toLocaleTimeString() }]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* AI SRE Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/60 to-slate-900 border border-indigo-500/40 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI SRE Copilot &amp; Continuous Improvement Engine</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Gemini SRE LLM Powered
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Automated Root Cause Analysis (RCA), capacity bottleneck forecasting, and automated code fix pull requests
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column: Continuous Improvement Insights & Live AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Continuous Improvement Recommendations */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Continuous Improvement Recommendations</span>
            </div>
          </div>

          <div className="space-y-3">
            {aiAnalyses.map(item => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> {item.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.recommendation}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Impact: High
                  </span>
                  <button className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-[11px]">
                    <GitPullRequest className="w-3 h-3" /> Auto-Generate PR
                  </button>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-400" /> Trivy CVE Auto-Remediation PR #14
                </span>
                <span className="text-[10px] font-mono text-slate-500">5 mins ago</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated patch drafted for CVE-2024-38063. Upgrades base image from alpine:3.19 to alpine:3.20.2.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                <span className="text-[10px] font-mono text-purple-400">Branch: fix/cve-2024-38063</span>
                <span className="text-emerald-400 font-semibold text-[11px]">Ready to Merge</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive AI SRE Chat Console */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Interactive SRE Diagnostics Chat</h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Online &bull; Telemetry Connected</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 font-sans text-xs">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-cyan-200' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-purple-400 text-xs font-mono">
                <Bot className="w-4 h-4 animate-spin" />
                <span>AI SRE analyzing cluster telemetry...</span>
              </div>
            )}
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask AI SRE: 'Analyze CPU bottlenecks' or 'Check Trivy CVEs'..."
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !customPrompt.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

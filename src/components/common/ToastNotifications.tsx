import React from 'react';
import { AlertTriangle, Bell, CheckCircle2, MessageSquare, X, ExternalLink } from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const ToastNotifications: React.FC = () => {
  const { alerts, dismissAlert, setActiveTab } = useDevSecOps();

  const firingAlerts = alerts.filter(a => a.status === 'Firing').slice(0, 3);

  if (firingAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {firingAlerts.map(alt => (
        <div
          key={alt.id}
          className="pointer-events-auto p-3.5 rounded-2xl bg-[#0e1626]/95 border border-red-500/50 shadow-2xl backdrop-blur-md text-xs space-y-2 animate-float transform transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{alt.alertName}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-red-500 text-white font-bold">
                    {alt.severity}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MessageSquare className="w-3 h-3 text-blue-400" />
                  <span>Dispatched to {alt.channel} &bull; {alt.timestamp}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => dismissAlert(alt.id)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-slate-200 text-xs font-medium leading-relaxed">
            {alt.summary}
          </p>

          {alt.remediationAction && (
            <div className="text-[11px] font-mono text-cyan-300 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              ⚡ {alt.remediationAction}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <button
              onClick={() => {
                setActiveTab('self-healing');
                dismissAlert(alt.id);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Investigate Remediation</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => dismissAlert(alt.id)}
              className="text-slate-400 hover:text-slate-200 text-[10px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

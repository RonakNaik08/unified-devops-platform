import React from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  Download
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';
import { ScenarioType } from '../../types/devsecops';
import { soundFx } from '../../utils/soundFx';

export const TopNavbar: React.FC = () => {
  const {
    alerts,
    soundEnabled,
    setSoundEnabled,
    runScenario,
    resetScenario,
    isRunningPipeline,
    activeStepName,
    activeScenario
  } = useDevSecOps();

  const firingAlerts = alerts.filter(a => a.status === 'Firing').length;

  const scenarios: Array<{ id: ScenarioType; label: string; icon: any; color: string }> = [
    { id: 'happy-path', label: 'Deploy Pipeline', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
    { id: 'trivy-blocked', label: 'Security Gate', icon: ShieldCheck, color: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200' },
    { id: 'hpa-traffic-surge', label: 'HPA Surge', icon: Zap, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200' },
    { id: 'pod-crash-healing', label: 'Self-Heal', icon: Activity, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200' }
  ];

  return (
    <header className="bg-white border-b border-slate-200/90 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-lg">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search applications, deployments, logs..."
          className="w-full bg-[#f1f5f9] border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 transition-all outline-none"
        />
      </div>

      {/* Scenario Triggers & Actions */}
      <div className="flex items-center gap-3">
        {/* Scenario quick buttons */}
        <div className="hidden xl:flex items-center gap-1.5 border-r border-slate-200 pr-3">
          {scenarios.map(sc => {
            const Icon = sc.icon;
            const isSelected = activeScenario === sc.id && isRunningPipeline;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  if (soundEnabled) soundFx.playClick();
                  runScenario(sc.id);
                }}
                disabled={isRunningPipeline}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sc.color} ${
                  isSelected ? 'ring-2 ring-blue-500 font-bold' : ''
                } ${isRunningPipeline && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            if (soundEnabled) soundFx.playClick();
            resetScenario();
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Reset baseline state"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(prev => !prev)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative">
            <Bell className="w-4 h-4" />
            {firingAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            RN
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">Ronak Naik</div>
            <div className="text-[10px] text-slate-500 font-medium">Administrator</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};

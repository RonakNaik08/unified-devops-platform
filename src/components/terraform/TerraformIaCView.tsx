import React, { useState, useEffect } from 'react';
import {
  Layers,
  Cloud,
  DollarSign,
  Play,
  CheckCircle2,
  FileCode,
  Terminal,
  RefreshCw,
  Server,
  Database,
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const TerraformIaCView: React.FC = () => {
  const { activeProject } = useDevSecOps();
  const [tfCode, setTfCode] = useState<string>('');
  const [resources, setResources] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState<number>(268.80);
  const [isLoading, setIsLoading] = useState(false);

  // Plan Execution State
  const [isPlanning, setIsPlanning] = useState(false);
  const [planOutput, setPlanOutput] = useState<string | null>(null);

  const fetchTfConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/terraform/config');
      const data = await res.json();
      setTfCode(data.code || '');
      setResources(data.resources || []);
      setTotalCost(data.totalMonthlyCost || 268.80);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTfConfig();
  }, []);

  const handleRunPlan = async () => {
    setIsPlanning(true);
    setPlanOutput(null);
    try {
      const res = await fetch('/api/v1/terraform/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tfCode })
      });
      const data = await res.json();
      setPlanOutput(data.planOutput);
    } catch (err: any) {
      setPlanOutput(`Error running terraform plan: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Terraform / OpenTofu Infrastructure as Code (IaC) Studio
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                AWS Provider v5.0
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Declarative cloud provisioning, real-time terraform plan generation, and cloud cost estimation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center gap-3 text-xs">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Estimated Monthly Cloud Cost</div>
              <div className="text-base font-black text-emerald-400">${totalCost.toFixed(2)} / mo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Resources Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map(res => (
          <div key={res.name} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[160px]">
                {res.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {res.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">{res.type}</div>
            <div className="text-sm font-black text-slate-900 pt-1 border-t border-slate-100 flex items-baseline justify-between">
              <span>Cost:</span>
              <span className="text-purple-600 font-mono">${res.costPerMonth.toFixed(2)}/mo</span>
            </div>
          </div>
        ))}
      </div>

      {/* Terraform Editor & Plan Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor on Left */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>main.tf (Cloud Infrastructure Specification)</span>
            </div>

            <button
              onClick={handleRunPlan}
              disabled={isPlanning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isPlanning ? 'Generating Plan...' : 'terraform plan'}</span>
            </button>
          </div>

          <textarea
            rows={16}
            value={tfCode}
            onChange={e => setTfCode(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 focus:border-purple-400 focus:outline-none"
          />
        </div>

        {/* Execution Output on Right */}
        <div className="lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl p-6 text-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono">Plan &amp; Execution Output</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              DRY-RUN VALIDATED
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black border border-slate-900 font-mono text-xs text-slate-300 max-h-[420px] overflow-y-auto space-y-1">
            {planOutput ? (
              <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400">{planOutput}</pre>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <Layers className="w-8 h-8 mb-2 opacity-50" />
                <span>Click "terraform plan" to inspect calculated cloud diff and resource actions</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

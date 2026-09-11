import React, { useState } from 'react';
import { Terminal, X, CornerDownLeft, Sparkles } from 'lucide-react';
import { KubernetesPod } from '../../types/devsecops';

interface PodTerminalModalProps {
  pod: KubernetesPod;
  onClose: () => void;
}

export const PodTerminalModal: React.FC<PodTerminalModalProps> = ({ pod, onClose }) => {
  const [cmdInput, setCmdInput] = useState('');
  const [history, setHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'uname -a',
      output: 'Linux devsecops-cloud-cluster 5.10.219-208.866.amzn2.aarch64 #1 SMP aarch64 GNU/Linux'
    },
    {
      cmd: 'uptime',
      output: ' 16:20:00 up 2 days, 14:12,  0 users,  load average: 0.14, 0.22, 0.18'
    }
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    const cmd = cmdInput.trim();
    setCmdInput('');

    let output = '';
    if (cmd === 'ls' || cmd === 'ls -la') {
      output = 'total 48\ndrwxr-xr-x 1 node node 4096 Sep 11 16:00 .\ndrwxr-xr-x 1 root root 4096 Sep 11 15:30 ..\n-rw-r--r-- 1 node node 1240 Sep 11 16:00 package.json\n-rw-r--r-- 1 node node 8240 Sep 11 16:00 server.js\ndrwxr-xr-x 4 node node 4096 Sep 11 16:00 src\ndrwxr-xr-x 2 node node 4096 Sep 11 16:00 /var/run/secrets/kubernetes.io/serviceaccount';
    } else if (cmd === 'env') {
      output = `NODE_ENV=production\nPORT=5000\nKUBERNETES_SERVICE_HOST=10.100.0.1\nKUBERNETES_SERVICE_PORT=443\nOTEL_EXPORTER_OTLP_ENDPOINT=http://collector.monitoring.svc:4318\nPOSTGRES_HOST=postgres.production.svc.cluster.local\nPOD_NAME=${pod.name}\nPOD_IP=${pod.ip}\nPOD_NAMESPACE=production`;
    } else if (cmd.includes('curl') || cmd.includes('healthz')) {
      output = 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status":"UP","checks":[{"name":"database","status":"healthy"},{"name":"redis","status":"healthy"}]}';
    } else if (cmd === 'top') {
      output = 'PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n  1 node      20   0  894200 148200  32100 S   4.2   1.8   0:42.18 node server.js\n 42 node      20   0   18400   3200   2800 R   0.0   0.1   0:00.04 top';
    } else if (cmd === 'df -h') {
      output = 'Filesystem      Size  Used Avail Use% Mounted on\noverlay          50G  4.2G   46G   9% /\ntmpfs            64M     0   64M   0% /dev\n/dev/nvme0n1p1   50G  4.2G   46G   9% /etc/hosts\npvc-db-volume   100G   14G   86G  14% /var/lib/data';
    } else if (cmd === 'clear') {
      setHistory([]);
      return;
    } else {
      output = `bash: ${cmd}: command executed successfully (exit code 0)`;
    }

    setHistory(prev => [...prev, { cmd, output }]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b101d] border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <Terminal className="w-4 h-4 text-cyan-400 ml-2" />
            <span className="font-mono font-bold text-white">
              kubectl exec -it {pod.name} -n production -- /bin/sh
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 select-text bg-[#070b14]">
          <div className="text-slate-500 pb-1">
            Connected to container on node <span className="text-cyan-400">{pod.node}</span>. Try running <span className="text-slate-300">ls, env, top, df -h, curl localhost:5000/healthz</span>.
          </div>

          {history.map((h, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span className="text-emerald-400">root@{pod.tier}-pod:~#</span>
                <span>{h.cmd}</span>
              </div>
              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed pl-4 border-l border-slate-800">
                {h.output}
              </div>
            </div>
          ))}
        </div>

        {/* Input prompt */}
        <form onSubmit={handleCommand} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <span className="font-mono text-emerald-400 text-xs font-bold shrink-0">root@{pod.tier}-pod:~#</span>
          <input
            type="text"
            value={cmdInput}
            onChange={e => setCmdInput(e.target.value)}
            placeholder="Type a command (ls, env, top, df -h, curl localhost:5000/healthz)..."
            className="flex-1 bg-transparent font-mono text-xs text-white focus:outline-none"
            autoFocus
          />
          <button type="submit" className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
